import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  isAdmin: boolean("is_admin").default(false),
  isPaid: boolean("is_paid").default(false),
  
  // Social media identifiers
  telegramId: text("telegram_id"),
  telegramUsername: text("telegram_username"),
  telegramMessageCount: integer("telegram_message_count").default(0),
  telegramLastInteraction: timestamp("telegram_last_interaction"),
  
  instagramId: text("instagram_id"),
  instagramUsername: text("instagram_username"),
  instagramMessageCount: integer("instagram_message_count").default(0),
  instagramLastInteraction: timestamp("instagram_last_interaction"),
  
  // Subscription information
  subscriptionPlan: text("subscription_plan").default("free"),
  subscriptionTier: text("subscription_tier").default("free"), // basic, premium, vip
  subscriptionDuration: text("subscription_duration").default(""), // week, month, 6month, year
  subscriptionExpiry: timestamp("subscription_expiry"),
  paypalSubscriptionId: text("paypal_subscription_id"),
  
  // User activity
  createdAt: timestamp("created_at").defaultNow(),
  lastLogin: timestamp("last_login"),
  messageCount: integer("message_count").default(0),
  aiSettings: json("ai_settings").$type<AISettings>(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  content: text("content").notNull(),
  fromUser: boolean("from_user").default(true),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  likes: integer("likes").default(0),
  comments: integer("comments").default(0),
  timestamp: timestamp("timestamp").defaultNow(),
  isPremium: boolean("is_premium").default(false),
});

export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  likes: integer("likes").default(0),
  timestamp: timestamp("timestamp").defaultNow(),
  isPremium: boolean("is_premium").default(false),
});

export const videos = pgTable("videos", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  videoUrl: text("video_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  likes: integer("likes").default(0),
  views: integer("views").default(0),
  timestamp: timestamp("timestamp").defaultNow(),
  isPremium: boolean("is_premium").default(false),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  aiModel: text("ai_model").default("MythoMax-L2"),
  voiceTone: text("voice_tone").default("seductive"),
  voiceAccent: text("voice_accent").default("american"),
  imagePrompt: text("image_prompt").default("full body ultra realistic photo of seductive blonde woman soft skin natural curves beautiful eyes same face each time"),
  freeMessageLimit: integer("free_message_limit").default(1),
  
  // Telegram Settings
  telegramApiKey: text("telegram_api_key"),
  telegramBotUsername: text("telegram_bot_username"),
  telegramChannelId: text("telegram_channel_id"),
  telegramMessageLimit: integer("telegram_message_limit").default(50),
  telegramRedirectMessage: text("telegram_redirect_message").default("You've reached your message limit. Visit our website to continue chatting!"),
  telegramWebhookUrl: text("telegram_webhook_url"),

  // Instagram Settings
  instagramUsername: text("instagram_username"),
  instagramPassword: text("instagram_password"),
  instagramApiKey: text("instagram_api_key"),
  instagramMessageLimit: integer("instagram_message_limit").default(50),
  instagramRedirectMessage: text("instagram_redirect_message").default("You've reached your message limit. Visit our website to continue chatting!"),
  
  // Payment Settings
  paypalClientId: text("paypal_client_id"),
  paypalSecret: text("paypal_secret"),
  paypalWebhook: text("paypal_webhook"),
  
  // API Configuration Settings
  // OpenRouter API
  openRouterApiKey: text("openrouter_api_key"),
  
  // AI Models
  useMythoMax: boolean("use_mythomax").default(true),
  useOpenHermes: boolean("use_openhermes").default(true),
  useDeepseek: boolean("use_deepseek").default(true),
  
  // Voice/Audio APIs
  piperTTSEnabled: boolean("piper_tts_enabled").default(true),
  whisperEnabled: boolean("whisper_enabled").default(true),
  
  // Communication APIs
  webRTCEnabled: boolean("webrtc_enabled").default(true),
  socketIOEnabled: boolean("socketio_enabled").default(true),
  
  // Image Generation
  googleCollabUrl: text("google_collab_url"),
  automatic1111Url: text("automatic1111_url"),
  stableDiffusionModel: text("stable_diffusion_model").default("RealisticVision"),
  useRealisticVision: boolean("use_realistic_vision").default(true),
  useDreamshaper: boolean("use_dreamshaper").default(true),
  useDeliberate: boolean("use_deliberate").default(true),
  dreamBoothEnabled: boolean("dreambooth_enabled").default(true),
  loraEnabled: boolean("lora_enabled").default(true),
  
  // Automation Settings
  autoPostEnabled: boolean("auto_post_enabled").default(false),
  autoPostTime: text("auto_post_time").default("12:00"),
  autoPostFrequency: integer("auto_post_frequency").default(1),
  
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Subscription plans table to manage different tiers and durations
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),           // Display name (e.g. "Basic Monthly")
  tier: text("tier").notNull(),           // basic, premium, vip
  duration: text("duration").notNull(),   // week, month, 6month, year
  price: integer("price").notNull(),      // Price in cents (e.g. 999 for $9.99)
  featuresJson: json("features_json").$type<string[]>(), // Array of features as strings
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const calls = pgTable("calls", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  duration: integer("duration").default(0),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Types
export type AISettings = {
  model: string;
  prompt: string;
  temperature: number;
};

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  userId: true,
  content: true,
  fromUser: true,
});

export const insertPostSchema = createInsertSchema(posts).pick({
  title: true,
  content: true,
  imageUrl: true,
  isPremium: true,
});

export const insertPhotoSchema = createInsertSchema(photos).pick({
  title: true,
  description: true,
  imageUrl: true,
  isPremium: true,
});

export const insertVideoSchema = createInsertSchema(videos).pick({
  title: true,
  description: true,
  videoUrl: true,
  thumbnailUrl: true,
  isPremium: true,
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
  lastUpdated: true,
});

export const insertCallSchema = createInsertSchema(calls).pick({
  userId: true,
  duration: true,
});

export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type InsertCall = z.infer<typeof insertCallSchema>;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;

export type User = typeof users.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Photo = typeof photos.$inferSelect;
export type Video = typeof videos.$inferSelect;
export type Settings = typeof settings.$inferSelect;
export type Call = typeof calls.$inferSelect;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
