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
  subscriptionPlan: text("subscription_plan").default("free"),
  subscriptionExpiry: timestamp("subscription_expiry"),
  paypalSubscriptionId: text("paypal_subscription_id"),
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
  telegramMessageLimit: integer("telegram_message_limit").default(50),
  paypalClientId: text("paypal_client_id"),
  paypalSecret: text("paypal_secret"),
  paypalWebhook: text("paypal_webhook"),
  autoPostEnabled: boolean("auto_post_enabled").default(false),
  autoPostTime: text("auto_post_time").default("12:00"),
  autoPostFrequency: integer("auto_post_frequency").default(1),
  lastUpdated: timestamp("last_updated").defaultNow(),
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

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;
export type InsertVideo = z.infer<typeof insertVideoSchema>;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type InsertCall = z.infer<typeof insertCallSchema>;

export type User = typeof users.$inferSelect;
export type Message = typeof messages.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type Photo = typeof photos.$inferSelect;
export type Video = typeof videos.$inferSelect;
export type Settings = typeof settings.$inferSelect;
export type Call = typeof calls.$inferSelect;
