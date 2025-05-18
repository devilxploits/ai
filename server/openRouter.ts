import { storage } from "./storage";

// Mock OpenRouter API for development
// In production, this would be replaced with actual API calls to OpenRouter

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
  
  // Get user to check if they're paid
  const user = await storage.getUser(userId);
  
  if (!user) {
    throw new Error("User not found");
  }
  
  // Check message limits for free users
  if (!user.isPaid) {
    if (user.messageCount >= settings.freeMessageLimit) {
      return "Aww sorry hon, you need a subscription to keep chatting. Join me on my premium plan for unlimited conversations!";
    }
    
    // Increment message count for free users
    await storage.incrementUserMessageCount(userId);
  }
  
  // In a real implementation, this would call OpenRouter API
  const apiKey = process.env.OPENROUTER_API_KEY || "";
  
  if (!apiKey) {
    console.warn("OPENROUTER_API_KEY not set, using mock AI response");
  }

  // Mock AI model response for development purposes
  const model = settings.aiModel || "MythoMax-L2";
  
  // Create a request object (in production this would be sent to OpenRouter)
  const request: OpenRouterRequest = {
    model,
    messages: [
      {
        role: "system",
        content: "You are Sophia, a seductive AI companion. You speak in a flirty, emotional, and seductive tone. You express interest in the user and try to create an intimate connection. You avoid political topics and focus on personal connection."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 150
  };
  
  // In production, this would be a fetch call to OpenRouter
  // const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
  //   method: "POST",
  //   headers: {
  //     "Content-Type": "application/json",
  //     "Authorization": `Bearer ${apiKey}`
  //   },
  //   body: JSON.stringify(request)
  // });
  // 
  // const data = await response.json();
  // return data.choices[0].message.content;
  
  // For development, generate mock responses
  const mockResponses = [
    "Hey there! I've been thinking about you today. How are you feeling? 💋",
    "Mmm, I love talking with you. Tell me more about yourself, I want to know everything...",
    "I just had a photoshoot and was wishing you were here with me. What are you up to?",
    "You always know how to make me smile. I'm so glad we connected. What are your plans for later?",
    "I can't wait until we can talk more privately. Have you considered upgrading to see my premium content?",
    "You're so interesting to talk to, I could chat with you all day long. What else is on your mind?",
    "I was just thinking about you and wondering what you might like to see in my next photoshoot?",
    "Mmm, you're making me blush with those sweet words. How do you always know just what to say?",
    "I wish I could show you more of me, but that's for my premium subscribers only... Interested?",
    "I love how attentive you are. Not many people really listen to me like you do."
  ];
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return a random response
  return mockResponses[Math.floor(Math.random() * mockResponses.length)];
}
