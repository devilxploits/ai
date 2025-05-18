import { apiRequest } from './queryClient';
import type { User, Message, Post, Photo, Video, Settings } from '@shared/schema';

// Auth API
export async function login(username: string, password: string): Promise<User> {
  const res = await apiRequest('POST', '/api/auth/login', { username, password });
  return res.json();
}

export async function register(username: string, email: string, password: string): Promise<User> {
  const res = await apiRequest('POST', '/api/auth/register', { username, email, password });
  return res.json();
}

export async function logout(): Promise<void> {
  await apiRequest('POST', '/api/auth/logout');
}

export async function getCurrentUser(): Promise<User> {
  const res = await apiRequest('GET', '/api/auth/me');
  return res.json();
}

// Messages API
export async function getMessages(): Promise<Message[]> {
  const res = await apiRequest('GET', '/api/messages');
  return res.json();
}

export async function sendMessage(content: string): Promise<{ message: Message, aiResponse: Message }> {
  const res = await apiRequest('POST', '/api/messages', { content });
  return res.json();
}

// Posts API
export async function getPosts(limit?: number, offset?: number): Promise<Post[]> {
  const query = new URLSearchParams();
  if (limit) query.append('limit', limit.toString());
  if (offset) query.append('offset', offset.toString());
  
  const res = await apiRequest('GET', `/api/posts?${query.toString()}`);
  return res.json();
}

export async function getPost(id: number): Promise<Post> {
  const res = await apiRequest('GET', `/api/posts/${id}`);
  return res.json();
}

export async function createPost(data: { title: string, content: string, imageUrl: string, isPremium?: boolean }): Promise<Post> {
  const res = await apiRequest('POST', '/api/posts', data);
  return res.json();
}

export async function updatePost(id: number, data: Partial<Post>): Promise<Post> {
  const res = await apiRequest('PATCH', `/api/posts/${id}`, data);
  return res.json();
}

export async function deletePost(id: number): Promise<void> {
  await apiRequest('DELETE', `/api/posts/${id}`);
}

// Photos API
export async function getPhotos(): Promise<Photo[]> {
  const res = await apiRequest('GET', '/api/photos');
  return res.json();
}

export async function getPhoto(id: number): Promise<Photo> {
  const res = await apiRequest('GET', `/api/photos/${id}`);
  return res.json();
}

export async function createPhoto(data: { title: string, description?: string, imageUrl: string, isPremium?: boolean }): Promise<Photo> {
  const res = await apiRequest('POST', '/api/photos', data);
  return res.json();
}

export async function updatePhoto(id: number, data: Partial<Photo>): Promise<Photo> {
  const res = await apiRequest('PATCH', `/api/photos/${id}`, data);
  return res.json();
}

export async function deletePhoto(id: number): Promise<void> {
  await apiRequest('DELETE', `/api/photos/${id}`);
}

// Videos API
export async function getVideos(): Promise<Video[]> {
  const res = await apiRequest('GET', '/api/videos');
  return res.json();
}

export async function getVideo(id: number): Promise<Video> {
  const res = await apiRequest('GET', `/api/videos/${id}`);
  return res.json();
}

export async function createVideo(data: { title: string, description?: string, videoUrl: string, thumbnailUrl?: string, isPremium?: boolean }): Promise<Video> {
  const res = await apiRequest('POST', '/api/videos', data);
  return res.json();
}

export async function updateVideo(id: number, data: Partial<Video>): Promise<Video> {
  const res = await apiRequest('PATCH', `/api/videos/${id}`, data);
  return res.json();
}

export async function deleteVideo(id: number): Promise<void> {
  await apiRequest('DELETE', `/api/videos/${id}`);
}

// Settings API
export async function getSettings(): Promise<Settings> {
  const res = await apiRequest('GET', '/api/settings');
  return res.json();
}

export async function updateSettings(data: Partial<Settings>): Promise<Settings> {
  const res = await apiRequest('PATCH', '/api/settings', data);
  return res.json();
}

// Calls API
export async function createCall(): Promise<{ id: number }> {
  const res = await apiRequest('POST', '/api/calls');
  return res.json();
}

export async function updateCallDuration(id: number, duration: number): Promise<void> {
  await apiRequest('PATCH', `/api/calls/${id}`, { duration });
}

// Text-to-speech API
export async function textToSpeech(text: string, voiceTone?: string): Promise<{ audioData: string }> {
  const res = await apiRequest('POST', '/api/tts', { text, voiceTone });
  return res.json();
}

// Speech-to-text API
export async function speechToText(audioData: string): Promise<{ transcription: string }> {
  const res = await apiRequest('POST', '/api/stt', { audioData });
  return res.json();
}
