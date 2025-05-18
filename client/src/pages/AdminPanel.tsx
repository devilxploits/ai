import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Helmet } from "react-helmet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSettings, updateSettings, createPost, createPhoto, createVideo } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function AdminPanel() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['/api/settings'],
    queryFn: getSettings
  });

  // Settings form state
  const [aiModel, setAiModel] = useState<string>(settings?.aiModel || "MythoMax-L2");
  const [voiceTone, setVoiceTone] = useState<string>(settings?.voiceTone || "seductive");
  const [voiceAccent, setVoiceAccent] = useState<string>(settings?.voiceAccent || "american");
  const [imagePrompt, setImagePrompt] = useState<string>(settings?.imagePrompt || "");
  const [freeMessageLimit, setFreeMessageLimit] = useState<number>(settings?.freeMessageLimit || 1);
  const [telegramMessageLimit, setTelegramMessageLimit] = useState<number>(settings?.telegramMessageLimit || 50);
  const [paypalClientId, setPaypalClientId] = useState<string>(settings?.paypalClientId || "");
  const [paypalSecret, setPaypalSecret] = useState<string>(settings?.paypalSecret || "");
  const [paypalWebhook, setPaypalWebhook] = useState<string>(settings?.paypalWebhook || "");
  const [autoPostEnabled, setAutoPostEnabled] = useState<boolean>(settings?.autoPostEnabled || false);
  const [autoPostTime, setAutoPostTime] = useState<string>(settings?.autoPostTime || "12:00");
  const [autoPostFrequency, setAutoPostFrequency] = useState<number>(settings?.autoPostFrequency || 1);

  // Content form state
  const [postTitle, setPostTitle] = useState<string>("");
  const [postContent, setPostContent] = useState<string>("");
  const [postImageUrl, setPostImageUrl] = useState<string>("");
  const [postIsPremium, setPostIsPremium] = useState<boolean>(false);

  const [photoTitle, setPhotoTitle] = useState<string>("");
  const [photoDescription, setPhotoDescription] = useState<string>("");
  const [photoImageUrl, setPhotoImageUrl] = useState<string>("");
  const [photoIsPremium, setPhotoIsPremium] = useState<boolean>(false);

  const [videoTitle, setVideoTitle] = useState<string>("");
  const [videoDescription, setVideoDescription] = useState<string>("");
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [videoThumbnailUrl, setVideoThumbnailUrl] = useState<string>("");
  const [videoIsPremium, setVideoIsPremium] = useState<boolean>(false);

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Settings Updated",
        description: "AI settings have been updated successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Could not update settings",
        variant: "destructive"
      });
    }
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      toast({
        title: "Post Created",
        description: "New post has been created successfully."
      });
      // Reset form
      setPostTitle("");
      setPostContent("");
      setPostImageUrl("");
      setPostIsPremium(false);
    },
    onError: (error) => {
      toast({
        title: "Create Failed",
        description: error instanceof Error ? error.message : "Could not create post",
        variant: "destructive"
      });
    }
  });

  // Create photo mutation
  const createPhotoMutation = useMutation({
    mutationFn: createPhoto,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/photos'] });
      toast({
        title: "Photo Created",
        description: "New photo has been created successfully."
      });
      // Reset form
      setPhotoTitle("");
      setPhotoDescription("");
      setPhotoImageUrl("");
      setPhotoIsPremium(false);
    },
    onError: (error) => {
      toast({
        title: "Create Failed",
        description: error instanceof Error ? error.message : "Could not create photo",
        variant: "destructive"
      });
    }
  });

  // Create video mutation
  const createVideoMutation = useMutation({
    mutationFn: createVideo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      toast({
        title: "Video Created",
        description: "New video has been created successfully."
      });
      // Reset form
      setVideoTitle("");
      setVideoDescription("");
      setVideoUrl("");
      setVideoThumbnailUrl("");
      setVideoIsPremium(false);
    },
    onError: (error) => {
      toast({
        title: "Create Failed",
        description: error instanceof Error ? error.message : "Could not create video",
        variant: "destructive"
      });
    }
  });

  // Save AI settings
  const handleSaveAISettings = () => {
    updateSettingsMutation.mutate({
      aiModel,
      voiceTone,
      voiceAccent,
      imagePrompt,
      freeMessageLimit,
      telegramMessageLimit
    });
  };

  // Save payment settings
  const handleSavePaymentSettings = () => {
    updateSettingsMutation.mutate({
      paypalClientId,
      paypalSecret,
      paypalWebhook
    });
  };

  // Save automation settings
  const handleSaveAutomationSettings = () => {
    updateSettingsMutation.mutate({
      autoPostEnabled,
      autoPostTime,
      autoPostFrequency
    });
  };

  // Create new post
  const handleCreatePost = () => {
    if (!postTitle || !postContent || !postImageUrl) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    createPostMutation.mutate({
      title: postTitle,
      content: postContent,
      imageUrl: postImageUrl,
      isPremium: postIsPremium
    });
  };

  // Create new photo
  const handleCreatePhoto = () => {
    if (!photoTitle || !photoImageUrl) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    createPhotoMutation.mutate({
      title: photoTitle,
      description: photoDescription,
      imageUrl: photoImageUrl,
      isPremium: photoIsPremium
    });
  };

  // Create new video
  const handleCreateVideo = () => {
    if (!videoTitle || !videoUrl) {
      toast({
        title: "Missing Information",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    createVideoMutation.mutate({
      title: videoTitle,
      description: videoDescription,
      videoUrl,
      thumbnailUrl: videoThumbnailUrl,
      isPremium: videoIsPremium
    });
  };

  // If not admin, show error
  if (!isAdmin) {
    return (
      <div className="p-4 md:p-6">
        <h1 className="text-2xl font-display font-semibold mb-6">Admin Panel</h1>
        <div className="bg-dark-card rounded-xl p-6 text-center">
          <p className="text-light-dimmed">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Panel | Sophia AI Companion</title>
        <meta name="description" content="Admin control panel for Sophia AI Companion. Manage AI settings, content, and user subscriptions." />
      </Helmet>
      
      <div className="p-4 md:p-6">
        <h1 className="text-2xl font-display font-semibold mb-6">Admin Panel</h1>
        
        <Tabs defaultValue="ai-settings">
          <TabsList className="mb-6">
            <TabsTrigger value="ai-settings">AI Settings</TabsTrigger>
            <TabsTrigger value="content">Content Management</TabsTrigger>
            <TabsTrigger value="payment">Payment Settings</TabsTrigger>
            <TabsTrigger value="automation">Automation</TabsTrigger>
          </TabsList>
          
          {/* AI Settings Tab */}
          <TabsContent value="ai-settings">
            <Card>
              <CardHeader>
                <CardTitle>AI Model Settings</CardTitle>
                <CardDescription>Configure AI model behavior and parameters for chat and voice features.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ai-model">AI Model</Label>
                    <Select value={aiModel} onValueChange={setAiModel}>
                      <SelectTrigger id="ai-model">
                        <SelectValue placeholder="Select AI model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MythoMax-L2">MythoMax-L2</SelectItem>
                        <SelectItem value="OpenHermes-2.5-Mistral">OpenHermes-2.5-Mistral</SelectItem>
                        <SelectItem value="Deepseek-Chat-7B-NSFW">Deepseek-Chat 7B NSFW</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="voice-tone">Voice Tone</Label>
                    <Select value={voiceTone} onValueChange={setVoiceTone}>
                      <SelectTrigger id="voice-tone">
                        <SelectValue placeholder="Select voice tone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="seductive">Seductive</SelectItem>
                        <SelectItem value="flirty">Flirty</SelectItem>
                        <SelectItem value="emotional">Emotional</SelectItem>
                        <SelectItem value="playful">Playful</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="voice-accent">Voice Accent</Label>
                    <Select value={voiceAccent} onValueChange={setVoiceAccent}>
                      <SelectTrigger id="voice-accent">
                        <SelectValue placeholder="Select voice accent" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="american">American</SelectItem>
                        <SelectItem value="british">British</SelectItem>
                        <SelectItem value="australian">Australian</SelectItem>
                        <SelectItem value="french">French</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="free-message-limit">Free Message Limit</Label>
                    <Input
                      id="free-message-limit"
                      type="number"
                      min="1"
                      value={freeMessageLimit}
                      onChange={(e) => setFreeMessageLimit(parseInt(e.target.value))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="telegram-message-limit">Telegram Message Limit</Label>
                    <Input
                      id="telegram-message-limit"
                      type="number"
                      min="1"
                      value={telegramMessageLimit}
                      onChange={(e) => setTelegramMessageLimit(parseInt(e.target.value))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="image-prompt">Default Image Generation Prompt</Label>
                  <Textarea
                    id="image-prompt"
                    placeholder="Enter default image generation prompt"
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    rows={4}
                  />
                  <p className="text-sm text-light-dimmed">This prompt will be used as the base for all AI image generation</p>
                </div>
                
                <Button 
                  onClick={handleSaveAISettings}
                  disabled={updateSettingsMutation.isPending}
                >
                  {updateSettingsMutation.isPending ? "Saving..." : "Save AI Settings"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Content Management Tab */}
          <TabsContent value="content">
            <div className="grid grid-cols-1 gap-6">
              {/* Create Post */}
              <Card>
                <CardHeader>
                  <CardTitle>Create New Post</CardTitle>
                  <CardDescription>Add a new post to Sophia's timeline</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="post-title">Title</Label>
                    <Input
                      id="post-title"
                      placeholder="Post title"
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="post-content">Content</Label>
                    <Textarea
                      id="post-content"
                      placeholder="Post content"
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="post-image-url">Image URL</Label>
                    <Input
                      id="post-image-url"
                      placeholder="Image URL"
                      value={postImageUrl}
                      onChange={(e) => setPostImageUrl(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="post-is-premium"
                      checked={postIsPremium}
                      onCheckedChange={setPostIsPremium}
                    />
                    <Label htmlFor="post-is-premium">Premium Content</Label>
                  </div>
                  
                  <Button 
                    onClick={handleCreatePost}
                    disabled={createPostMutation.isPending}
                  >
                    {createPostMutation.isPending ? "Creating..." : "Create Post"}
                  </Button>
                </CardContent>
              </Card>
              
              {/* Create Photo */}
              <Card>
                <CardHeader>
                  <CardTitle>Add New Photo</CardTitle>
                  <CardDescription>Add a new photo to Sophia's gallery</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="photo-title">Title</Label>
                    <Input
                      id="photo-title"
                      placeholder="Photo title"
                      value={photoTitle}
                      onChange={(e) => setPhotoTitle(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="photo-description">Description</Label>
                    <Textarea
                      id="photo-description"
                      placeholder="Photo description"
                      value={photoDescription}
                      onChange={(e) => setPhotoDescription(e.target.value)}
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="photo-image-url">Image URL</Label>
                    <Input
                      id="photo-image-url"
                      placeholder="Image URL"
                      value={photoImageUrl}
                      onChange={(e) => setPhotoImageUrl(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="photo-is-premium"
                      checked={photoIsPremium}
                      onCheckedChange={setPhotoIsPremium}
                    />
                    <Label htmlFor="photo-is-premium">Premium Content</Label>
                  </div>
                  
                  <Button 
                    onClick={handleCreatePhoto}
                    disabled={createPhotoMutation.isPending}
                  >
                    {createPhotoMutation.isPending ? "Creating..." : "Add Photo"}
                  </Button>
                </CardContent>
              </Card>
              
              {/* Create Video */}
              <Card>
                <CardHeader>
                  <CardTitle>Add New Video</CardTitle>
                  <CardDescription>Add a new video to Sophia's collection</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="video-title">Title</Label>
                    <Input
                      id="video-title"
                      placeholder="Video title"
                      value={videoTitle}
                      onChange={(e) => setVideoTitle(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="video-description">Description</Label>
                    <Textarea
                      id="video-description"
                      placeholder="Video description"
                      value={videoDescription}
                      onChange={(e) => setVideoDescription(e.target.value)}
                      rows={2}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="video-url">Video URL</Label>
                    <Input
                      id="video-url"
                      placeholder="Video URL"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="video-thumbnail-url">Thumbnail URL</Label>
                    <Input
                      id="video-thumbnail-url"
                      placeholder="Thumbnail URL (optional)"
                      value={videoThumbnailUrl}
                      onChange={(e) => setVideoThumbnailUrl(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="video-is-premium"
                      checked={videoIsPremium}
                      onCheckedChange={setVideoIsPremium}
                    />
                    <Label htmlFor="video-is-premium">Premium Content</Label>
                  </div>
                  
                  <Button 
                    onClick={handleCreateVideo}
                    disabled={createVideoMutation.isPending}
                  >
                    {createVideoMutation.isPending ? "Creating..." : "Add Video"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Payment Settings Tab */}
          <TabsContent value="payment">
            <Card>
              <CardHeader>
                <CardTitle>Payment Settings</CardTitle>
                <CardDescription>Configure payment system integration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="paypal-client-id">PayPal Client ID</Label>
                  <Input
                    id="paypal-client-id"
                    placeholder="PayPal Client ID"
                    value={paypalClientId}
                    onChange={(e) => setPaypalClientId(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="paypal-secret">PayPal Secret</Label>
                  <Input
                    id="paypal-secret"
                    type="password"
                    placeholder="PayPal Secret"
                    value={paypalSecret}
                    onChange={(e) => setPaypalSecret(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="paypal-webhook">PayPal Webhook URL</Label>
                  <Input
                    id="paypal-webhook"
                    placeholder="PayPal Webhook URL"
                    value={paypalWebhook}
                    onChange={(e) => setPaypalWebhook(e.target.value)}
                  />
                </div>
                
                <Button 
                  onClick={handleSavePaymentSettings}
                  disabled={updateSettingsMutation.isPending}
                >
                  {updateSettingsMutation.isPending ? "Saving..." : "Save Payment Settings"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Automation Tab */}
          <TabsContent value="automation">
            <Card>
              <CardHeader>
                <CardTitle>Automation Settings</CardTitle>
                <CardDescription>Configure automatic posting and content scheduling</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-post-enabled"
                    checked={autoPostEnabled}
                    onCheckedChange={setAutoPostEnabled}
                  />
                  <Label htmlFor="auto-post-enabled">Enable Automatic Posting</Label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="auto-post-time">Post Time</Label>
                    <Input
                      id="auto-post-time"
                      type="time"
                      value={autoPostTime}
                      onChange={(e) => setAutoPostTime(e.target.value)}
                      disabled={!autoPostEnabled}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="auto-post-frequency">Posts Per Day</Label>
                    <Input
                      id="auto-post-frequency"
                      type="number"
                      min="1"
                      max="5"
                      value={autoPostFrequency}
                      onChange={(e) => setAutoPostFrequency(parseInt(e.target.value))}
                      disabled={!autoPostEnabled}
                    />
                  </div>
                </div>
                
                <Button 
                  onClick={handleSaveAutomationSettings}
                  disabled={updateSettingsMutation.isPending || !autoPostEnabled}
                >
                  {updateSettingsMutation.isPending ? "Saving..." : "Save Automation Settings"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
