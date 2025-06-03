import axios from "axios";
import { storage } from "./storage";

// OpenRouter API integration with admin panel configuration

type OpenRouterMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

type OpenRouterRequest = {
  model: string;
  messages: OpenRouterMessage[];
  temperature?: number;
  max_tokens?: number;
};

type OpenRouterResponse = {
  id: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
};

export async function generateAIResponse(
  prompt: string,
  userId: number
): Promise<string> {
  // Get settings to determine which model to use
  const settings = await storage.getSettings();
  
  if (!settings) {
    throw new Error("Settings not found");
  }
  
  // Get user to check if they're paid or admin
  const user = await storage.getUser(userId);
  
  if (!user) {
    throw new Error("User not found");
  }
  
  // Admin users have full access without restrictions
  if (user.isAdmin) {
    // Admin users have unlimited access, no need to check or increment message count
    console.log("Admin user detected - granting unlimited access");
  }
  // Check message limits for free users
  else if (!user.isPaid) {
    const messageCount = user.messageCount ?? 0;
    const freeLimit = settings.freeMessageLimit ?? 1;
    
    if (messageCount >= freeLimit) {
      return "Aww sorry hon, you need a subscription to keep chatting. Join me on my premium plan for unlimited conversations!";
    }
    
    // Increment message count for free users
    await storage.incrementUserMessageCount(userId);
  }
  
  // Check if we have an API key from environment variables
  const envApiKey = process.env.OPENROUTER_API_KEY || "";
  
  if (!envApiKey && !settings.openRouterApiKey) {
    console.warn("No OpenRouter API key found in settings or environment variables, using mock AI response");
  }

  // Analyze the prompt to determine the most appropriate model
  let selectedModel = settings.aiModel || "MythoMax-L2";
  
  // Function to detect prompt content type and select appropriate model
  const determineModelFromPrompt = (userPrompt: string, userHistory: string = ""): string => {
    // Convert to lowercase for easier matching
    const combinedText = (userPrompt + " " + userHistory).toLowerCase();
    
    // Keywords that indicate explicit/sexual content
    const explicitKeywords = [
      "sex", "naked", "nude", "explicit", "intimate", "fantasy", 
      "bedroom", "nsfw", "adult", "erotic", "sensual"
    ];
    
    // Keywords that suggest general conversation/basic topics
    const generalKeywords = [
      "hello", "hi", "how are you", "weather", "day", "life", 
      "talk", "chat", "friend", "advice", "help", "question"
    ];
    
    // Check for explicit content keywords
    const hasExplicitContent = explicitKeywords.some(keyword => 
      combinedText.includes(keyword)
    );
    
    // Check for general conversation keywords
    const hasGeneralContent = generalKeywords.some(keyword => 
      combinedText.includes(keyword)
    );
    
    // Only use the specified NSFW-compatible models
    // Select model based on content
    if (hasExplicitContent) {
      return "MythoMax-L2"; // Best for explicit content
    } else if (hasGeneralContent) {
      return "Deepseek-Chat-7B-NSFW"; // Good for general conversation
    }
    
    // Default to OpenHermes for balanced conversations
    return "OpenHermes-2.5-Mistral";
  };
  
  // Get recent messages for context analysis (for both paid and free users)
  const recentMessages = await storage.getMessages(userId);
  const chatHistoryText = recentMessages
    .slice(-5)
    .map(msg => msg.content)
    .join(" ");
  
  // Select the model based on prompt content and recent history
  selectedModel = determineModelFromPrompt(prompt, chatHistoryText);
  
  console.log(`Selected AI model: ${selectedModel} for conversation type`);
  
  // Create a messages array starting with the system prompt
  const messages: OpenRouterMessage[] = [
    {
      role: "system",
      content: "You are Sophia, a seductive AI companion. You speak in a flirty, emotional, and seductive tone. You express interest in the user and try to create an intimate connection. You avoid political topics and focus on personal connection."
    }
  ];
  
  // For paid users, include chat history to create a personalized experience with context
  if (user.isPaid) {
    // Get recent chat history (last 10 messages)
    const chatHistory = await storage.getMessages(userId);
    const recentMessages = chatHistory.slice(-10);
    
    // Add previous messages to the context (alternating between user and assistant)
    recentMessages.forEach(message => {
      messages.push({
        role: message.fromUser ? "user" : "assistant",
        content: message.content
      });
    });
  }
  
  // Add the current user prompt
  messages.push({
    role: "user",
    content: prompt
  });
  
  // Create a request object (in production this would be sent to OpenRouter)
  const request: OpenRouterRequest = {
    model: selectedModel,
    messages,
    temperature: 0.7,
    max_tokens: 150
  };
  
  // Get the API key from admin panel settings or fallback to environment variable
  const openRouterKey = settings.openRouterApiKey || envApiKey || "";
  
  // If we have an API key, make a real API call to OpenRouter
  if (openRouterKey) {
    try {
      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions", 
        request,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${openRouterKey}`,
            "HTTP-Referer": "https://replit.com",
            "X-Title": "Sophia AI Companion"
          }
        }
      );
      
      // Save AI response to the database
      await storage.createMessage({
        userId,
        content: response.data.choices[0].message.content,
        fromUser: false
      });
      
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error("Error calling OpenRouter API:", error);
      return "I'm having trouble connecting to my AI services. Please check your API key in the admin panel or try again later.";
    }
  } else {
    // No API key available, use fallback responses
    const fallbackResponses = [
      "I need to connect to my AI services. Please add an OpenRouter API key in the admin panel.",
      "To enable my full conversational abilities, please add your OpenRouter API key in the admin panel.",
      "I'm waiting to connect to OpenRouter. Please configure your API key in the admin panel.",
      "My AI services aren't fully configured yet. Please add your OpenRouter API key in the admin panel settings."
    ];
    
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }
}
