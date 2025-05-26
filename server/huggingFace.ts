import axios from "axios";
import { storage } from "./storage";

// Hugging Face API integration with admin panel configuration

type HuggingFaceRequest = {
  inputs: string;
  parameters?: {
    temperature?: number;
    max_new_tokens?: number;
    return_full_text?: boolean;
    do_sample?: boolean;
    top_p?: number;
  };
};

type HuggingFaceResponse = {
  generated_text: string;
} | {
  error: string;
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
  const envApiKey = process.env.HUGGINGFACE_API_KEY || "";
  
  if (!envApiKey && !settings.huggingFaceApiKey) {
    console.warn("No Hugging Face API key found in settings or environment variables");
  }

  // Choose the AI model based on conversation content
  let selectedModel = "microsoft/DialoGPT-medium";
  
  // Function to select appropriate model
  const determineModelFromPrompt = (userPrompt: string, userHistory: string = ""): string => {
    // Check user settings for model preferences
    if (settings.useDialoGPT) {
      return "microsoft/DialoGPT-medium";
    }
    
    if (settings.useBlenderBot) {
      return "facebook/blenderbot-400M-distill";
    }
    
    // Default to DialoGPT for conversational AI
    return "microsoft/DialoGPT-medium";
  };
  
  // Get recent messages for context analysis
  const recentMessages = await storage.getMessages(userId);
  const chatHistoryText = recentMessages
    .slice(-5)
    .map(msg => msg.content)
    .join(" ");
  
  // Select the model based on prompt content and recent history
  selectedModel = determineModelFromPrompt(prompt, chatHistoryText);
  
  console.log(`Selected Hugging Face model: ${selectedModel} for conversation`);
  
  // Build the conversation context
  let conversationText = "You are Sophia, a seductive AI companion. You speak in a flirty, emotional, and seductive tone. You express interest in the user and try to create an intimate connection. You avoid political topics and focus on personal connection.\n\n";
  
  // For paid users, include chat history for context
  if (user.isPaid) {
    const chatHistory = await storage.getMessages(userId);
    const recentMessages = chatHistory.slice(-5);
    
    // Add previous messages to context
    recentMessages.forEach(message => {
      if (message.fromUser) {
        conversationText += `User: ${message.content}\n`;
      } else {
        conversationText += `Sophia: ${message.content}\n`;
      }
    });
  }
  
  // Add the current user prompt
  conversationText += `User: ${prompt}\nSophia:`;

  // Create the request object for Hugging Face
  const request: HuggingFaceRequest = {
    inputs: conversationText,
    parameters: {
      temperature: 0.7,
      max_new_tokens: 150,
      return_full_text: false,
      do_sample: true,
      top_p: 0.9
    }
  };
  
  // Get the API key from admin panel settings or fallback to environment variable
  const huggingFaceKey = settings.huggingFaceApiKey || envApiKey || "";
  
  // If we have an API key, make a real API call to Hugging Face
  if (huggingFaceKey) {
    try {
      const response = await axios.post(
        `https://api-inference.huggingface.co/models/${selectedModel}`, 
        request,
        {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${huggingFaceKey}`,
          }
        }
      );
      
      let aiResponse = "";
      
      // Handle different response formats from Hugging Face
      if (Array.isArray(response.data)) {
        aiResponse = response.data[0]?.generated_text || "I'm having trouble generating a response right now.";
      } else if (response.data.generated_text) {
        aiResponse = response.data.generated_text;
      } else {
        aiResponse = "I'm having trouble generating a response right now.";
      }
      
      // Clean up the response (remove the input text if it's included)
      if (aiResponse.includes("Sophia:")) {
        aiResponse = aiResponse.split("Sophia:").pop()?.trim() || aiResponse;
      }
      
      // Save AI response to the database
      await storage.createMessage({
        userId,
        content: aiResponse,
        fromUser: false
      });
      
      return aiResponse;
    } catch (error) {
      console.error("Error calling Hugging Face API:", error);
      return "I'm having trouble connecting to my AI services. Please check your API key in the admin panel or try again later.";
    }
  } else {
    // No API key available, use fallback responses
    const fallbackResponses = [
      "I need to connect to my AI services. Please add a Hugging Face API key in the admin panel.",
      "To enable my full conversational abilities, please add your Hugging Face API key in the admin panel.",
      "I'm waiting to connect to Hugging Face. Please configure your API key in the admin panel.",
      "My AI services aren't fully configured yet. Please add your Hugging Face API key in the admin panel settings."
    ];
    
    return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
  }
}