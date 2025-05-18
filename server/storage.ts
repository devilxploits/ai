import {
  users, messages, posts, photos, videos, settings, calls,
  type User, type Message, type Post, type Photo, type Video, type Settings, type Call,
  type InsertUser, type InsertMessage, type InsertPost, type InsertPhoto, type InsertVideo, 
  type InsertSettings, type InsertCall
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
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private messages: Map<number, Message>;
  private posts: Map<number, Post>;
  private photos: Map<number, Photo>;
  private videos: Map<number, Video>;
  private settings: Settings | undefined;
  private calls: Map<number, Call>;
  
  private userAutoInc: number;
  private messageAutoInc: number;
  private postAutoInc: number;
  private photoAutoInc: number;
  private videoAutoInc: number;
  private callAutoInc: number;
  
  constructor() {
    this.users = new Map();
    this.messages = new Map();
    this.posts = new Map();
    this.photos = new Map();
    this.videos = new Map();
    this.calls = new Map();
    
    this.userAutoInc = 1;
    this.messageAutoInc = 1;
    this.postAutoInc = 1;
    this.photoAutoInc = 1;
    this.videoAutoInc = 1;
    this.callAutoInc = 1;
    
    // Initialize with admin user
    this.createUser({
      username: 'admin',
      password: 'admin',
      email: 'admin@sophia.ai'
    }).then(user => {
      this.updateUser(user.id, { isAdmin: true });
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
      (user) => user.username === username,
    );
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
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
        telegramMessageLimit: 50,
        paypalClientId: "",
        paypalSecret: "",
        paypalWebhook: "",
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
}

export const storage = new MemStorage();
