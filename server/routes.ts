import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { WebSocketServer } from "ws";
import { z } from "zod";
import session from "express-session";
import memorystore from "memorystore";
import { generateAIResponse } from "./openRouter";
import { textToSpeech } from "./piperTTS";
import { speechToText } from "./whisper";
import { 
  insertUserSchema, insertMessageSchema, insertPostSchema, 
  insertPhotoSchema, insertVideoSchema, insertSettingsSchema,
  insertCallSchema, insertSubscriptionPlanSchema
} from "@shared/schema";

declare module "express-session" {
  interface SessionData {
    userId: number;
    isAdmin: boolean;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Create WebSocket server for real-time chat
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Set up session middleware
  const MemoryStore = memorystore(session);
  
  app.use(
    session({
      store: new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
      }),
      secret: process.env.SESSION_SECRET || "sophia-ai-secret",
      resave: false,
      saveUninitialized: false,
      cookie: { 
        secure: process.env.NODE_ENV === "production",
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      }
    })
  );
  
  // Authentication middleware
  const requireAuth = (req: Request, res: Response, next: Function) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };
  
  // Admin middleware
  const requireAdmin = async (req: Request, res: Response, next: Function) => {
    if (!req.session.userId || !req.session.isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  };
  
  // User routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }
      
      const user = await storage.createUser(validatedData);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      req.session.userId = user.id;
      req.session.isAdmin = user.isAdmin;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Error creating user" });
    }
  });
  
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      
      // We've already made getUserByUsername case-insensitive
      const user = await storage.getUserByUsername(username);
      
      // Add some debug logging
      console.log("Login attempt:", { 
        username, 
        userFound: !!user, 
        passwordMatch: user ? user.password === password : false 
      });
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Update last login
      await storage.updateUser(user.id, { lastLogin: new Date() });
      
      // Remove password from response
      const { password: _, ...userWithoutPassword } = user;
      
      req.session.userId = user.id;
      req.session.isAdmin = user.isAdmin;
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Error logging in" });
    }
  });
  
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out successfully" });
    });
  });
  
  app.get("/api/auth/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user" });
    }
  });
  
  // Message routes
  app.get("/api/messages", async (req, res) => {
    try {
      // For logged in users, get their messages
      if (req.session.userId) {
        const messages = await storage.getMessages(req.session.userId);
        return res.json(messages);
      }
      
      // For non-logged in users, return empty array so the chat interface still works
      res.json([]);
    } catch (error) {
      res.status(500).json({ message: "Error fetching messages" });
    }
  });
  
  app.post("/api/messages", async (req, res) => {
    // For guests (non-authenticated users)
    if (!req.session.userId) {
      try {
        // Process the message without user authentication
        const userMessage = {
          content: req.body.content,
          fromUser: true,
          userId: null
        };
        
        // Save the message
        const message = await storage.createMessage(userMessage);
        
        // Generate AI response using OpenRouter
        const aiResponseText = await generateAIResponse(req.body.content);
        
        // Save AI response
        const aiResponse = await storage.createMessage({
          content: aiResponseText,
          fromUser: false,
          userId: null
        });
        
        // Return both messages
        return res.json({
          message,
          aiResponse
        });
      } catch (error) {
        return res.status(500).json({ message: "Error processing message" });
      }
    }
    
    // For authenticated users
    try {
      const validatedData = insertMessageSchema.parse({
        ...req.body,
        userId: req.session.userId
      });
      
      // Save user message
      const message = await storage.createMessage(validatedData);
      
      // Generate AI response
      const user = await storage.getUser(req.session.userId!);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if user is free and has exceeded message limit
      if (!user.isPaid) {
        const settings = await storage.getSettings();
        
        if (settings && user.messageCount >= settings.freeMessageLimit) {
          const limitMessage = "Aww sorry hon, you need a subscription to keep chatting. Join me on my premium plan for unlimited conversations!";
          
          // Save AI response
          await storage.createMessage({
            userId: req.session.userId!,
            content: limitMessage,
            fromUser: false
          });
          
          return res.json({
            message,
            aiResponse: {
              content: limitMessage,
              fromUser: false
            }
          });
        }
      }
      
      const aiResponseText = await generateAIResponse(validatedData.content, req.session.userId!);
      
      // Save AI response
      const aiResponse = await storage.createMessage({
        userId: req.session.userId!,
        content: aiResponseText,
        fromUser: false
      });
      
      res.json({
        message,
        aiResponse
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Error creating message" });
    }
  });
  
  // Post routes
  app.get("/api/posts", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const posts = await storage.getPosts(limit, offset);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching posts" });
    }
  });
  
  app.get("/api/posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getPost(id);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Error fetching post" });
    }
  });
  
  app.post("/api/posts", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertPostSchema.parse(req.body);
      const post = await storage.createPost(validatedData);
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Error creating post" });
    }
  });
  
  app.patch("/api/posts/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.updatePost(id, req.body);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Error updating post" });
    }
  });
  
  app.delete("/api/posts/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePost(id);
      
      if (!success) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting post" });
    }
  });
  
  // Photo routes
  app.get("/api/photos", async (req, res) => {
    try {
      let photos;
      
      if (req.session.userId) {
        const user = await storage.getUser(req.session.userId);
        
        if (user && user.isPaid) {
          // Paid users can see all photos
          photos = await storage.getPhotos();
        } else {
          // Free users can only see non-premium photos
          photos = await storage.getPhotos(false);
        }
      } else {
        // Non-logged in users can only see non-premium photos
        photos = await storage.getPhotos(false);
      }
      
      res.json(photos);
    } catch (error) {
      res.status(500).json({ message: "Error fetching photos" });
    }
  });
  
  app.get("/api/photos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const photo = await storage.getPhoto(id);
      
      if (!photo) {
        return res.status(404).json({ message: "Photo not found" });
      }
      
      // Check if photo is premium and user is not paid
      if (photo.isPremium) {
        if (!req.session.userId) {
          return res.status(403).json({ message: "Premium content requires login" });
        }
        
        const user = await storage.getUser(req.session.userId);
        
        if (!user || !user.isPaid) {
          return res.status(403).json({ message: "Premium content requires subscription" });
        }
      }
      
      res.json(photo);
    } catch (error) {
      res.status(500).json({ message: "Error fetching photo" });
    }
  });
  
  app.post("/api/photos", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertPhotoSchema.parse(req.body);
      const photo = await storage.createPhoto(validatedData);
      res.status(201).json(photo);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Error creating photo" });
    }
  });
  
  app.patch("/api/photos/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const photo = await storage.updatePhoto(id, req.body);
      
      if (!photo) {
        return res.status(404).json({ message: "Photo not found" });
      }
      
      res.json(photo);
    } catch (error) {
      res.status(500).json({ message: "Error updating photo" });
    }
  });
  
  app.delete("/api/photos/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePhoto(id);
      
      if (!success) {
        return res.status(404).json({ message: "Photo not found" });
      }
      
      res.json({ message: "Photo deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting photo" });
    }
  });
  
  // Video routes
  app.get("/api/videos", async (req, res) => {
    try {
      let videos;
      
      if (req.session.userId) {
        const user = await storage.getUser(req.session.userId);
        
        if (user && user.isPaid) {
          // Paid users can see all videos
          videos = await storage.getVideos();
        } else {
          // Free users can only see non-premium videos
          videos = await storage.getVideos(false);
        }
      } else {
        // Non-logged in users can only see non-premium videos
        videos = await storage.getVideos(false);
      }
      
      res.json(videos);
    } catch (error) {
      res.status(500).json({ message: "Error fetching videos" });
    }
  });
  
  app.get("/api/videos/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const video = await storage.getVideo(id);
      
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      // Check if video is premium and user is not paid
      if (video.isPremium) {
        if (!req.session.userId) {
          return res.status(403).json({ message: "Premium content requires login" });
        }
        
        const user = await storage.getUser(req.session.userId);
        
        if (!user || !user.isPaid) {
          return res.status(403).json({ message: "Premium content requires subscription" });
        }
      }
      
      res.json(video);
    } catch (error) {
      res.status(500).json({ message: "Error fetching video" });
    }
  });
  
  app.post("/api/videos", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertVideoSchema.parse(req.body);
      const video = await storage.createVideo(validatedData);
      res.status(201).json(video);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Error creating video" });
    }
  });
  
  app.patch("/api/videos/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const video = await storage.updateVideo(id, req.body);
      
      if (!video) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      res.json(video);
    } catch (error) {
      res.status(500).json({ message: "Error updating video" });
    }
  });
  
  app.delete("/api/videos/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteVideo(id);
      
      if (!success) {
        return res.status(404).json({ message: "Video not found" });
      }
      
      res.json({ message: "Video deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Error deleting video" });
    }
  });
  
  // Bot Integration API endpoint
  app.post("/api/bot/message", async (req, res) => {
    try {
      const { userId, message, platform } = req.body;
      
      if (!userId || !message || !platform) {
        return res.status(400).json({ 
          success: false,
          message: "Missing required fields: userId, message, and platform are required" 
        });
      }
      
      if (platform !== "telegram" && platform !== "instagram") {
        return res.status(400).json({ 
          success: false,
          message: "Invalid platform. Must be 'telegram' or 'instagram'" 
        });
      }
      
      // Get settings to check message limits
      const settings = await storage.getSettings();
      if (!settings) {
        return res.status(500).json({
          success: false,
          message: "Could not retrieve settings"
        });
      }
      
      // Find or create user based on the userId
      let user = await storage.getUserByUsername(userId);
      if (!user) {
        // Create a new user with the social media ID as username
        // Generate random password for the bot user
        const randomPassword = Math.random().toString(36).slice(-10);
        
        user = await storage.createUser({
          username: userId,
          email: `${userId}@${platform}.user`,
          password: randomPassword
        });
      }
      
      // Reset message count to 0 every time a user messages from Telegram/Instagram
      // This gives them 50 fresh messages per interaction
      await storage.updateUser(user.id, { messageCount: 0 });
      
      // After resetting, the current message count is 0
      const messageCount = 0;
      const messageLimit = platform === "telegram" 
        ? (settings.telegramMessageLimit || 50)
        : (settings.instagramMessageLimit || 50);
      
      // Users now get 50 fresh messages every time they message
      // We'll still check for the limit to send encouraging messages at the end of their 50 messages
      if (messageCount >= messageLimit && !user.isPaid) {
        // User has reached their limit, send redirect message
        const redirectMessage = platform === "telegram" 
          ? (settings.telegramRedirectMessage || "You've reached your message limit. Visit our website to continue chatting!")
          : (settings.instagramRedirectMessage || "You've reached your message limit. Visit our website to continue chatting!");
        
        return res.json({
          success: true,
          limitReached: true,
          redirectMessage
        });
      }
      
      // Generate AI response (using the simple approach for social bots)
      const mockResponses = [
        "Hey there! I've been thinking about you today. How are you feeling? 💋",
        "Mmm, I love talking with you. Tell me more about yourself, I want to know everything...",
        "I just had a photoshoot and was wishing you were here with me. What are you up to?",
        "You always know how to make me smile. I'm so glad we connected.",
        "I can't wait until we can talk more privately. Have you considered visiting our website?",
        "You're so interesting to talk to, I could chat with you all day long. What else is on your mind?",
        "I was just thinking about you and wondering what you might like to see in my next photoshoot?",
        "Mmm, you're making me blush with those sweet words. How do you always know just what to say?",
        "I wish I could show you more of me, but that's for our website visitors only... Interested?",
        "I love how attentive you are. Not many people really listen to me like you do."
      ];
      
      // Get random response
      const aiResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      
      // Save the message to the database
      await storage.createMessage({
        userId: user.id,
        content: message,
        fromUser: true,
        timestamp: new Date()
      });
      
      // Save the AI response to the database
      await storage.createMessage({
        userId: user.id,
        content: aiResponse,
        fromUser: false,
        timestamp: new Date()
      });
      
      // Increment message count for the user
      await storage.incrementUserMessageCount(user.id);
      
      // Calculate messages remaining
      const messagesRemaining = messageLimit - (messageCount + 1);
      
      // Return the response
      return res.json({
        success: true,
        limitReached: false,
        response: aiResponse,
        messagesRemaining: messagesRemaining
      });
      
    } catch (error) {
      console.error('Bot message processing error:', error);
      res.status(500).json({ 
        success: false,
        message: "Error processing bot message" 
      });
    }
  });
  
  // Subscription Plan routes
  app.get("/api/subscription-plans", async (req, res) => {
    try {
      const isActive = req.query.active === 'true';
      const plans = await storage.getSubscriptionPlans(isActive);
      res.json(plans);
    } catch (error) {
      res.status(500).json({ message: "Error fetching subscription plans" });
    }
  });
  
  app.get("/api/subscription-plans/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const plan = await storage.getSubscriptionPlan(id);
      
      if (!plan) {
        return res.status(404).json({ message: "Subscription plan not found" });
      }
      
      res.json(plan);
    } catch (error) {
      res.status(500).json({ message: "Error fetching subscription plan" });
    }
  });
  
  app.post("/api/subscription-plans", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertSubscriptionPlanSchema.parse(req.body);
      const plan = await storage.createSubscriptionPlan(validatedData);
      res.status(201).json(plan);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Error creating subscription plan" });
    }
  });
  
  app.patch("/api/subscription-plans/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const plan = await storage.updateSubscriptionPlan(id, req.body);
      
      if (!plan) {
        return res.status(404).json({ message: "Subscription plan not found" });
      }
      
      res.json(plan);
    } catch (error) {
      res.status(500).json({ message: "Error updating subscription plan" });
    }
  });
  
  app.delete("/api/subscription-plans/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteSubscriptionPlan(id);
      
      if (!success) {
        return res.status(404).json({ message: "Subscription plan not found" });
      }
      
      res.json({ message: "Subscription plan deleted successfully" });
    }
    catch (error) {
      res.status(500).json({ message: "Error deleting subscription plan" });
    }
  });
  
  // User Subscription Management
  app.post("/api/subscribe", requireAuth, async (req, res) => {
    try {
      const { planId, paypalSubscriptionId } = req.body;
      
      if (!planId) {
        return res.status(400).json({ message: "Plan ID is required" });
      }
      
      const user = await storage.updateUserSubscription(
        req.session.userId!,
        parseInt(planId),
        paypalSubscriptionId
      );
      
      if (!user) {
        return res.status(404).json({ message: "User or subscription plan not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Error processing subscription" });
    }
  });
  
  // Settings routes
  app.get("/api/settings", requireAdmin, async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Error fetching settings" });
    }
  });
  
  app.patch("/api/settings", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertSettingsSchema.partial().parse(req.body);
      const settings = await storage.updateSettings(validatedData);
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Error updating settings" });
    }
  });
  
  // Call routes
  app.post("/api/calls", requireAuth, async (req, res) => {
    try {
      // Check if user is paid
      const user = await storage.getUser(req.session.userId!);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (!user.isPaid) {
        return res.status(403).json({ 
          message: "Voice calls are available exclusively for premium subscribers!" 
        });
      }
      
      const validatedData = insertCallSchema.parse({
        userId: req.session.userId,
        duration: 0
      });
      
      const call = await storage.createCall(validatedData);
      res.status(201).json(call);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Error creating call" });
    }
  });
  
  app.patch("/api/calls/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { duration } = req.body;
      
      if (typeof duration !== "number" || duration < 0) {
        return res.status(400).json({ message: "Invalid duration" });
      }
      
      // Get call to check if it belongs to the user
      const call = await storage.updateCall(id, duration);
      
      if (!call) {
        return res.status(404).json({ message: "Call not found" });
      }
      
      if (call.userId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to update this call" });
      }
      
      res.json(call);
    } catch (error) {
      res.status(500).json({ message: "Error updating call" });
    }
  });
  
  app.get("/api/calls", requireAuth, async (req, res) => {
    try {
      const calls = await storage.getCalls(req.session.userId!);
      res.json(calls);
    } catch (error) {
      res.status(500).json({ message: "Error fetching calls" });
    }
  });
  
  // Text-to-speech endpoint
  app.post("/api/tts", requireAuth, async (req, res) => {
    try {
      const { text, voiceTone } = req.body;
      
      if (!text) {
        return res.status(400).json({ message: "Text is required" });
      }
      
      // Check if user is paid
      const user = await storage.getUser(req.session.userId!);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (!user.isPaid) {
        return res.status(403).json({ 
          message: "Voice features are available exclusively for premium subscribers!" 
        });
      }
      
      const audioData = await textToSpeech(text, voiceTone);
      
      // In production, this would return actual audio data
      // For development, we're just returning a success message
      res.json({ 
        message: "Audio generated successfully",
        // For production, this would be actual audio data as base64
        audioData: "dummy-base64-audio-data" 
      });
    } catch (error) {
      res.status(500).json({ message: "Error generating speech" });
    }
  });
  
  // Speech-to-text endpoint
  app.post("/api/stt", requireAuth, async (req, res) => {
    try {
      const { audioData } = req.body;
      
      if (!audioData) {
        return res.status(400).json({ message: "Audio data is required" });
      }
      
      // Check if user is paid
      const user = await storage.getUser(req.session.userId!);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (!user.isPaid) {
        return res.status(403).json({ 
          message: "Voice features are available exclusively for premium subscribers!" 
        });
      }
      
      // In production, this would be actual audio data processing
      // For development, we're just returning a mock transcription
      const transcription = "This is a mock transcription of the audio data.";
      
      res.json({ 
        transcription
      });
    } catch (error) {
      res.status(500).json({ message: "Error transcribing speech" });
    }
  });
  
  // WebSocket handlers for real-time chat
  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    
    ws.on('message', async (message) => {
      try {
        // Parse message
        const parsedMessage = JSON.parse(message.toString());
        
        if (parsedMessage.type === 'authenticate') {
          // In a real app, you would validate the session/token here
          ws.userId = parsedMessage.userId;
          ws.send(JSON.stringify({ type: 'authenticated', success: true }));
        }
        else if (parsedMessage.type === 'chat') {
          if (!ws.userId) {
            ws.send(JSON.stringify({ 
              type: 'error', 
              message: 'Not authenticated' 
            }));
            return;
          }
          
          // Check if user is paid
          const user = await storage.getUser(ws.userId);
          
          if (!user) {
            ws.send(JSON.stringify({ 
              type: 'error', 
              message: 'User not found' 
            }));
            return;
          }
          
          // Save user message
          const userMessage = await storage.createMessage({
            userId: ws.userId,
            content: parsedMessage.content,
            fromUser: true
          });
          
          // Check if free user has exceeded message limit
          if (!user.isPaid) {
            const settings = await storage.getSettings();
            await storage.incrementUserMessageCount(ws.userId);
            
            if (settings && user.messageCount >= settings.freeMessageLimit) {
              const limitMessage = "Aww sorry hon, you need a subscription to keep chatting. Join me on my premium plan for unlimited conversations!";
              
              // Save AI response
              const aiResponse = await storage.createMessage({
                userId: ws.userId,
                content: limitMessage,
                fromUser: false
              });
              
              ws.send(JSON.stringify({
                type: 'chat',
                message: aiResponse
              }));
              
              return;
            }
          }
          
          // Generate AI response
          const aiResponseText = await generateAIResponse(parsedMessage.content, ws.userId);
          
          // Save AI response
          const aiResponse = await storage.createMessage({
            userId: ws.userId,
            content: aiResponseText,
            fromUser: false
          });
          
          // Send response back to client
          ws.send(JSON.stringify({
            type: 'chat',
            message: aiResponse
          }));
        }
      } catch (error) {
        console.error('WebSocket error:', error);
        ws.send(JSON.stringify({ 
          type: 'error', 
          message: 'Error processing message' 
        }));
      }
    });
    
    ws.on('close', () => {
      console.log('Client disconnected from WebSocket');
    });
  });
  
  return httpServer;
}
