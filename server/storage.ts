import {
  users, messages, posts, photos, videos, settings, calls, subscriptionPlans,
  type User, type Message, type Post, type Photo, type Video, type Settings, type Call, type SubscriptionPlan,
  type InsertUser, type InsertMessage, type InsertPost, type InsertPhoto, type InsertVideo, 
  type InsertSettings, type InsertCall, type InsertSubscriptionPlan
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  incrementUserMessageCount(id: number): Promise<User | undefined>;
  
  // Messages methods
  getMessages(userId: number): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  // Posts methods
  getPosts(limit?: number, offset?: number): Promise<Post[]>;
  getPost(id: number): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: number, data: Partial<Post>): Promise<Post | undefined>;
  deletePost(id: number): Promise<boolean>;
  
  // Photos methods
  getPhotos(isPremium?: boolean): Promise<Photo[]>;
  getPhoto(id: number): Promise<Photo | undefined>;
  createPhoto(photo: InsertPhoto): Promise<Photo>;
  updatePhoto(id: number, data: Partial<Photo>): Promise<Photo | undefined>;
  deletePhoto(id: number): Promise<boolean>;
  
  // Videos methods
  getVideos(isPremium?: boolean): Promise<Video[]>;
  getVideo(id: number): Promise<Video | undefined>;
  createVideo(video: InsertVideo): Promise<Video>;
  updateVideo(id: number, data: Partial<Video>): Promise<Video | undefined>;
  deleteVideo(id: number): Promise<boolean>;
  
  // Settings methods
  getSettings(): Promise<Settings | undefined>;
  updateSettings(data: Partial<InsertSettings>): Promise<Settings>;
  
  // Calls methods
  getCalls(userId: number): Promise<Call[]>;
  createCall(call: InsertCall): Promise<Call>;
  updateCall(id: number, duration: number): Promise<Call | undefined>;
  
  // Subscription Plan methods
  getSubscriptionPlans(isActive?: boolean): Promise<SubscriptionPlan[]>;
  getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined>;
  createSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  updateSubscriptionPlan(id: number, data: Partial<SubscriptionPlan>): Promise<SubscriptionPlan | undefined>;
  deleteSubscriptionPlan(id: number): Promise<boolean>;
  
  // User Subscription methods
  updateUserSubscription(userId: number, planId: number, paypalSubscriptionId?: string): Promise<User | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private messages: Map<number, Message>;
  private posts: Map<number, Post>;
  private photos: Map<number, Photo>;
  private videos: Map<number, Video>;
  private settings: Settings | undefined;
  private calls: Map<number, Call>;
  private subscriptionPlans: Map<number, SubscriptionPlan>;
  
  private userAutoInc: number;
  private messageAutoInc: number;
  private postAutoInc: number;
  private photoAutoInc: number;
  private videoAutoInc: number;
  private callAutoInc: number;
  private subscriptionPlanAutoInc: number;
  
  constructor() {
    this.users = new Map();
    this.messages = new Map();
    this.posts = new Map();
    this.photos = new Map();
    this.videos = new Map();
    this.calls = new Map();
    this.subscriptionPlans = new Map();
    
    this.userAutoInc = 1;
    this.messageAutoInc = 1;
    this.postAutoInc = 1;
    this.photoAutoInc = 1;
    this.videoAutoInc = 1;
    this.callAutoInc = 1;
    this.subscriptionPlanAutoInc = 1;
    
    // Initialize with admin user - admins get full access without restrictions
    this.createUser({
      username: 'admin',
      password: 'admin',
      email: 'admin@sophia.ai'
    }).then(user => {
      // Set admin privileges - this will be applied on every deployment
      this.updateUser(user.id, { 
        isAdmin: true, 
        isPaid: true,  // Give admin users paid status automatically
        subscriptionPlan: "vip", // Assign VIP subscription
        // Set a far future expiry date (10 years from now)
        subscriptionExpiry: new Date(new Date().setFullYear(new Date().getFullYear() + 10))
      });
    });
    
    // Initialize with default settings
    this.settings = {
      id: 1,
      aiModel: "MythoMax-L2",
      voiceTone: "seductive",
      voiceAccent: "american",
      imagePrompt: "full body ultra realistic photo of seductive blonde woman soft skin natural curves beautiful eyes same face each time",
      freeMessageLimit: 1,
      telegramMessageLimit: 50,
      instagramMessageLimit: 50,
      telegramRedirectMessage: "You've reached your message limit. Visit our website to continue chatting!",
      instagramRedirectMessage: "You've reached your message limit. Visit our website to continue chatting!",
      paypalClientId: "",
      paypalSecret: "",
      paypalWebhook: "",
      autoPostEnabled: false,
      autoPostTime: "12:00",
      autoPostFrequency: 1,
      lastUpdated: new Date()
    };
    
    // Add seed data
    this.seedData();
  }
  
  private seedSubscriptionPlans() {
    // Define default subscription plans
    const plansSeed = [
      // Weekly plans
      {
        name: "Basic Weekly",
        tier: "basic",
        duration: "week",
        price: 499, // $4.99
        featuresJson: [
          "50 daily chat messages",
          "Access to public photos",
          "Basic profile access"
        ],
        isActive: true
      },
      {
        name: "Premium Weekly",
        tier: "premium",
        duration: "week",
        price: 999, // $9.99
        featuresJson: [
          "Unlimited chat messages",
          "Access to all photos",
          "Voice calls (10 minutes/day)",
          "Premium content"
        ],
        isActive: true
      },
      {
        name: "VIP Weekly",
        tier: "vip",
        duration: "week",
        price: 1999, // $19.99
        featuresJson: [
          "All Premium features",
          "Unlimited voice calls",
          "Priority responses",
          "Custom photo requests",
          "Early access to new content"
        ],
        isActive: true
      },
      
      // Monthly plans
      {
        name: "Basic Monthly",
        tier: "basic",
        duration: "month",
        price: 999, // $9.99
        featuresJson: [
          "50 daily chat messages",
          "Access to public photos",
          "Basic profile access"
        ],
        isActive: true
      },
      {
        name: "Premium Monthly",
        tier: "premium",
        duration: "month",
        price: 1999, // $19.99
        featuresJson: [
          "Unlimited chat messages",
          "Access to all photos",
          "Voice calls (15 minutes/day)",
          "Premium content"
        ],
        isActive: true
      },
      {
        name: "VIP Monthly",
        tier: "vip",
        duration: "month",
        price: 3999, // $39.99
        featuresJson: [
          "All Premium features",
          "Unlimited voice calls",
          "Priority responses",
          "Custom photo requests",
          "Early access to new content"
        ],
        isActive: true
      },
      
      // 6-month plans
      {
        name: "Basic 6-Month",
        tier: "basic",
        duration: "6month",
        price: 4999, // $49.99
        featuresJson: [
          "50 daily chat messages",
          "Access to public photos",
          "Basic profile access"
        ],
        isActive: true
      },
      {
        name: "Premium 6-Month",
        tier: "premium",
        duration: "6month",
        price: 9999, // $99.99
        featuresJson: [
          "Unlimited chat messages",
          "Access to all photos",
          "Voice calls (20 minutes/day)",
          "Premium content",
          "Exclusive seasonal events"
        ],
        isActive: true
      },
      {
        name: "VIP 6-Month",
        tier: "vip",
        duration: "6month",
        price: 19999, // $199.99
        featuresJson: [
          "All Premium features",
          "Unlimited voice calls",
          "Priority responses",
          "Custom photo requests",
          "Early access to new content",
          "Personalized AI experience"
        ],
        isActive: true
      },
      
      // Annual plans
      {
        name: "Basic Annual",
        tier: "basic",
        duration: "year",
        price: 8999, // $89.99
        featuresJson: [
          "50 daily chat messages",
          "Access to public photos",
          "Basic profile access"
        ],
        isActive: true
      },
      {
        name: "Premium Annual",
        tier: "premium",
        duration: "year",
        price: 17999, // $179.99
        featuresJson: [
          "Unlimited chat messages",
          "Access to all photos",
          "Voice calls (30 minutes/day)",
          "Premium content",
          "Exclusive seasonal events",
          "Annual gift"
        ],
        isActive: true
      },
      {
        name: "VIP Annual",
        tier: "vip",
        duration: "year",
        price: 35999, // $359.99
        featuresJson: [
          "All Premium features",
          "Unlimited voice calls",
          "Priority responses",
          "Custom photo requests",
          "Early access to new content",
          "Personalized AI experience",
          "VIP exclusive events",
          "Annual premium gift"
        ],
        isActive: true
      }
    ];
    
    plansSeed.forEach(plan => this.createSubscriptionPlan(plan));
  }
  
  private seedData() {
    // Create sample posts
    const postsSeed = [
      {
        title: "Morning vibes!",
        content: "Starting my day with a photoshoot. What are you up to today?",
        imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300",
        isPremium: false
      },
      {
        title: "Beach day",
        content: "Casual day at the beach. Missing the sun already! 🌊☀️",
        imageUrl: "https://images.unsplash.com/photo-1516726817505-f5ed825624d8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300",
        isPremium: false
      },
      {
        title: "Feeling elegant",
        content: "Feeling elegant today. What do you think of this outfit? 💕",
        imageUrl: "https://images.unsplash.com/photo-1524502397800-2eeaad7c3fe5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=400&h=300",
        isPremium: false
      }
    ];
    
    postsSeed.forEach(post => this.createPost(post));
    
    // Create sample photos
    const photosSeed = [
      {
        title: "Studio session",
        description: "Professional photoshoot in studio",
        imageUrl: "https://images.unsplash.com/photo-1604072366595-e75dc92d6bdc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300",
        isPremium: false
      },
      {
        title: "Natural light",
        description: "Photoshoot with natural lighting",
        imageUrl: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300",
        isPremium: false
      },
      {
        title: "Fashion shoot",
        description: "Fashion magazine photoshoot",
        imageUrl: "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300",
        isPremium: false
      },
      {
        title: "Outdoor vibes",
        description: "Casual outdoor photoshoot",
        imageUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300",
        isPremium: false
      }
    ];
    
    photosSeed.forEach(photo => this.createPhoto(photo));
    
    // Premium photos
    const premiumPhotosSeed = [
      {
        title: "Premium photoshoot",
        description: "Exclusive premium photoshoot",
        imageUrl: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300",
        isPremium: true
      },
      {
        title: "VIP session",
        description: "VIP exclusive photoshoot",
        imageUrl: "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300",
        isPremium: true
      }
    ];
    
    premiumPhotosSeed.forEach(photo => this.createPhoto(photo));
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }
  
  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userAutoInc++;
    const now = new Date();
    const user: User = {
      ...insertUser,
      id,
      isAdmin: false,
      isPaid: false,
      subscriptionPlan: "free",
      subscriptionExpiry: undefined,
      paypalSubscriptionId: undefined,
      createdAt: now,
      lastLogin: now,
      messageCount: 0,
      aiSettings: {
        model: "MythoMax-L2",
        prompt: "",
        temperature: 0.7
      }
    };
    
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async incrementUserMessageCount(id: number): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, messageCount: user.messageCount + 1 };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  // Messages methods
  async getMessages(userId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.userId === userId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
  
  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageAutoInc++;
    const message: Message = {
      ...insertMessage,
      id,
      timestamp: new Date()
    };
    
    this.messages.set(id, message);
    return message;
  }
  
  // Posts methods
  async getPosts(limit = 10, offset = 0): Promise<Post[]> {
    return Array.from(this.posts.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(offset, offset + limit);
  }
  
  async getPost(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }
  
  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = this.postAutoInc++;
    const post: Post = {
      ...insertPost,
      id,
      likes: 0,
      comments: 0,
      timestamp: new Date()
    };
    
    this.posts.set(id, post);
    return post;
  }
  
  async updatePost(id: number, data: Partial<Post>): Promise<Post | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    
    const updatedPost = { ...post, ...data };
    this.posts.set(id, updatedPost);
    return updatedPost;
  }
  
  async deletePost(id: number): Promise<boolean> {
    return this.posts.delete(id);
  }
  
  // Photos methods
  async getPhotos(isPremium?: boolean): Promise<Photo[]> {
    return Array.from(this.photos.values())
      .filter(photo => isPremium === undefined || photo.isPremium === isPremium)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  async getPhoto(id: number): Promise<Photo | undefined> {
    return this.photos.get(id);
  }
  
  async createPhoto(insertPhoto: InsertPhoto): Promise<Photo> {
    const id = this.photoAutoInc++;
    const photo: Photo = {
      ...insertPhoto,
      id,
      likes: 0,
      timestamp: new Date()
    };
    
    this.photos.set(id, photo);
    return photo;
  }
  
  async updatePhoto(id: number, data: Partial<Photo>): Promise<Photo | undefined> {
    const photo = this.photos.get(id);
    if (!photo) return undefined;
    
    const updatedPhoto = { ...photo, ...data };
    this.photos.set(id, updatedPhoto);
    return updatedPhoto;
  }
  
  async deletePhoto(id: number): Promise<boolean> {
    return this.photos.delete(id);
  }
  
  // Videos methods
  async getVideos(isPremium?: boolean): Promise<Video[]> {
    return Array.from(this.videos.values())
      .filter(video => isPremium === undefined || video.isPremium === isPremium)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  async getVideo(id: number): Promise<Video | undefined> {
    return this.videos.get(id);
  }
  
  async createVideo(insertVideo: InsertVideo): Promise<Video> {
    const id = this.videoAutoInc++;
    const video: Video = {
      ...insertVideo,
      id,
      likes: 0,
      views: 0,
      timestamp: new Date()
    };
    
    this.videos.set(id, video);
    return video;
  }
  
  async updateVideo(id: number, data: Partial<Video>): Promise<Video | undefined> {
    const video = this.videos.get(id);
    if (!video) return undefined;
    
    const updatedVideo = { ...video, ...data };
    this.videos.set(id, updatedVideo);
    return updatedVideo;
  }
  
  async deleteVideo(id: number): Promise<boolean> {
    return this.videos.delete(id);
  }
  
  // Settings methods
  async getSettings(): Promise<Settings | undefined> {
    return this.settings;
  }
  
  async updateSettings(data: Partial<InsertSettings>): Promise<Settings> {
    if (!this.settings) {
      this.settings = {
        id: 1,
        aiModel: "MythoMax-L2",
        voiceTone: "seductive",
        voiceAccent: "american",
        imagePrompt: "full body ultra realistic photo of seductive blonde woman soft skin natural curves beautiful eyes same face each time",
        freeMessageLimit: 1,
        
        // API Configuration Settings
        openRouterApiKey: "",
        piperTTSEnabled: true,
        whisperEnabled: true,
        webRTCEnabled: true,
        socketIOEnabled: true,
        stableDiffusionModel: "RealisticVision",
        dreamBoothEnabled: true,
        loraEnabled: true,
        
        // Social Media Settings
        telegramApiKey: "",
        telegramBotUsername: "",
        telegramChannelId: "",
        telegramMessageLimit: 50,
        telegramRedirectMessage: "You've reached your message limit. Visit our website to continue chatting!",
        telegramWebhookUrl: "",
        
        instagramUsername: "",
        instagramPassword: "",
        instagramApiKey: "",
        instagramMessageLimit: 50,
        instagramRedirectMessage: "You've reached your message limit. Visit our website to continue chatting!",
        
        // Payment Settings
        paypalClientId: "",
        paypalSecret: "",
        paypalWebhook: "",
        
        // Automation Settings
        autoPostEnabled: false,
        autoPostTime: "12:00",
        autoPostFrequency: 1,
        
        lastUpdated: new Date()
      };
    }
    
    const updatedSettings = { ...this.settings, ...data, lastUpdated: new Date() };
    this.settings = updatedSettings;
    return updatedSettings;
  }
  
  // Calls methods
  async getCalls(userId: number): Promise<Call[]> {
    return Array.from(this.calls.values())
      .filter(call => call.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }
  
  async createCall(insertCall: InsertCall): Promise<Call> {
    const id = this.callAutoInc++;
    const call: Call = {
      ...insertCall,
      id,
      timestamp: new Date()
    };
    
    this.calls.set(id, call);
    return call;
  }
  
  async updateCall(id: number, duration: number): Promise<Call | undefined> {
    const call = this.calls.get(id);
    if (!call) return undefined;
    
    const updatedCall = { ...call, duration };
    this.calls.set(id, updatedCall);
    return updatedCall;
  }
  
  // Subscription Plan methods
  async getSubscriptionPlans(isActive?: boolean): Promise<SubscriptionPlan[]> {
    return Array.from(this.subscriptionPlans.values())
      .filter(plan => isActive === undefined || plan.isActive === isActive)
      .sort((a, b) => a.price - b.price);
  }
  
  async getSubscriptionPlan(id: number): Promise<SubscriptionPlan | undefined> {
    return this.subscriptionPlans.get(id);
  }
  
  async createSubscriptionPlan(insertPlan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const id = this.subscriptionPlanAutoInc++;
    const now = new Date();
    const plan: SubscriptionPlan = {
      ...insertPlan,
      id,
      createdAt: now,
      updatedAt: now
    };
    
    console.log(`Creating subscription plan: ${plan.name}, id: ${plan.id}`);
    this.subscriptionPlans.set(id, plan);
    return plan;
  }
  
  async updateSubscriptionPlan(id: number, data: Partial<SubscriptionPlan>): Promise<SubscriptionPlan | undefined> {
    const plan = this.subscriptionPlans.get(id);
    if (!plan) return undefined;
    
    const updatedPlan = { ...plan, ...data, updatedAt: new Date() };
    this.subscriptionPlans.set(id, updatedPlan);
    return updatedPlan;
  }
  
  async deleteSubscriptionPlan(id: number): Promise<boolean> {
    return this.subscriptionPlans.delete(id);
  }
  
  // User Subscription methods
  async updateUserSubscription(userId: number, planId: number, paypalSubscriptionId?: string): Promise<User | undefined> {
    const user = await this.getUser(userId);
    if (!user) return undefined;
    
    const plan = await this.getSubscriptionPlan(planId);
    if (!plan) return undefined;
    
    // Calculate subscription expiry date based on plan duration
    const now = new Date();
    let expiryDate = new Date(now);
    
    switch (plan.duration) {
      case 'week':
        expiryDate.setDate(now.getDate() + 7);
        break;
      case 'month':
        expiryDate.setMonth(now.getMonth() + 1);
        break;
      case '6month':
        expiryDate.setMonth(now.getMonth() + 6);
        break;
      case 'year':
        expiryDate.setFullYear(now.getFullYear() + 1);
        break;
      default:
        // Default to 30 days if duration is not recognized
        expiryDate.setDate(now.getDate() + 30);
    }
    
    // Update user with subscription details
    const updatedUser = await this.updateUser(userId, {
      isPaid: true,
      subscriptionPlan: plan.tier,
      subscriptionTier: plan.tier,
      subscriptionDuration: plan.duration,
      subscriptionExpiry: expiryDate,
      paypalSubscriptionId: paypalSubscriptionId || null
    });
    
    return updatedUser;
  }
}

export const storage = new MemStorage();
