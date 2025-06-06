import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  getSettings, updateSettings, createPost, createPhoto, createVideo,
  getSubscriptionPlans, getSubscriptionPlan, createSubscriptionPlan, 
  updateSubscriptionPlan, deleteSubscriptionPlan 
} from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function AdminPanel() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Custom tab state
  const [activeTab, setActiveTab] = useState<string>('ai-settings');
  
  // API Configuration states
  // OpenRouter API
  const [openRouterApiKey, setOpenRouterApiKey] = useState<string>("");
  
  // AI Models
  const [useMythoMax, setUseMythoMax] = useState<boolean>(true);
  const [useOpenHermes, setUseOpenHermes] = useState<boolean>(true);
  const [useDeepseek, setUseDeepseek] = useState<boolean>(true);
  
  // Voice/Audio APIs
  const [piperTTSEnabled, setPiperTTSEnabled] = useState<boolean>(true);
  const [whisperEnabled, setWhisperEnabled] = useState<boolean>(true);
  
  // Communication APIs
  const [webRTCEnabled, setWebRTCEnabled] = useState<boolean>(true);
  const [socketIOEnabled, setSocketIOEnabled] = useState<boolean>(true);
  
  // Image Generation
  const [googleCollabUrl, setGoogleCollabUrl] = useState<string>("");
  const [automatic1111Url, setAutomatic1111Url] = useState<string>("");
  const [stableDiffusionModel, setStableDiffusionModel] = useState<string>("RealisticVision");
  const [dreamBoothEnabled, setDreamBoothEnabled] = useState<boolean>(true);
  const [loraEnabled, setLoraEnabled] = useState<boolean>(true);

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
  
  // Telegram settings
  const [telegramApiKey, setTelegramApiKey] = useState<string>(settings?.telegramApiKey || "");
  const [telegramBotUsername, setTelegramBotUsername] = useState<string>(settings?.telegramBotUsername || "");
  const [telegramChannelId, setTelegramChannelId] = useState<string>(settings?.telegramChannelId || "");
  const [telegramMessageLimit, setTelegramMessageLimit] = useState<number>(settings?.telegramMessageLimit || 50);
  const [telegramRedirectMessage, setTelegramRedirectMessage] = useState<string>(settings?.telegramRedirectMessage || "You've reached your message limit. Visit our website to continue chatting!");
  const [telegramWebhookUrl, setTelegramWebhookUrl] = useState<string>(settings?.telegramWebhookUrl || "");
  
  // Instagram settings
  const [instagramUsername, setInstagramUsername] = useState<string>(settings?.instagramUsername || "");
  const [instagramPassword, setInstagramPassword] = useState<string>(settings?.instagramPassword || "");
  const [instagramApiKey, setInstagramApiKey] = useState<string>(settings?.instagramApiKey || "");
  const [instagramMessageLimit, setInstagramMessageLimit] = useState<number>(settings?.instagramMessageLimit || 50);
  const [instagramRedirectMessage, setInstagramRedirectMessage] = useState<string>(settings?.instagramRedirectMessage || "You've reached your message limit. Visit our website to continue chatting!");
  
  // Payment settings
  const [paypalClientId, setPaypalClientId] = useState<string>(settings?.paypalClientId || "");
  const [paypalSecret, setPaypalSecret] = useState<string>(settings?.paypalSecret || "");
  const [paypalWebhook, setPaypalWebhook] = useState<string>(settings?.paypalWebhook || "");
  
  // Automation settings
  const [autoPostEnabled, setAutoPostEnabled] = useState<boolean>(settings?.autoPostEnabled || false);
  const [autoPostTime, setAutoPostTime] = useState<string>(settings?.autoPostTime || "12:00");
  const [autoPostFrequency, setAutoPostFrequency] = useState<number>(settings?.autoPostFrequency || 1);
  
  // Subscription plans
  const { data: subscriptionPlans = [] } = useQuery({
    queryKey: ['/api/subscription-plans'],
    queryFn: () => getSubscriptionPlans(true), // Use active=true to match how plans are fetched on homepage
  });
  
  // Subscription plan form state
  const [planName, setPlanName] = useState<string>("");
  const [planTier, setPlanTier] = useState<string>("basic");
  const [planDuration, setPlanDuration] = useState<string>("month");
  const [planPrice, setPlanPrice] = useState<number>(999);
  const [planFeatures, setPlanFeatures] = useState<string>("");
  const [planIsActive, setPlanIsActive] = useState<boolean>(true);
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null);

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

  // Update settings when fetched
  useEffect(() => {
    if (settings) {
      setAiModel(settings.aiModel || "MythoMax-L2");
      setVoiceTone(settings.voiceTone || "seductive");
      setVoiceAccent(settings.voiceAccent || "american");
      setImagePrompt(settings.imagePrompt || "");
      setFreeMessageLimit(settings.freeMessageLimit || 1);
      
      // API Configuration settings
      // OpenRouter API
      setOpenRouterApiKey(settings.openRouterApiKey || "");
      
      // AI Models
      setUseMythoMax(settings.useMythoMax === false ? false : true);
      setUseOpenHermes(settings.useOpenHermes === false ? false : true);
      setUseDeepseek(settings.useDeepseek === false ? false : true);
      
      // Voice/Audio APIs
      setPiperTTSEnabled(settings.piperTTSEnabled === false ? false : true);
      setWhisperEnabled(settings.whisperEnabled === false ? false : true);
      
      // Communication APIs
      setWebRTCEnabled(settings.webRTCEnabled === false ? false : true);
      setSocketIOEnabled(settings.socketIOEnabled === false ? false : true);
      
      // Image Generation
      setGoogleCollabUrl(settings.googleCollabUrl || "");
      setAutomatic1111Url(settings.automatic1111Url || "");
      setStableDiffusionModel(settings.stableDiffusionModel || "RealisticVision");
      setDreamBoothEnabled(settings.dreamBoothEnabled === false ? false : true);
      setLoraEnabled(settings.loraEnabled === false ? false : true);
      
      // Telegram settings
      setTelegramApiKey(settings.telegramApiKey || "");
      setTelegramBotUsername(settings.telegramBotUsername || "");
      setTelegramChannelId(settings.telegramChannelId || "");
      setTelegramMessageLimit(settings.telegramMessageLimit || 50);
      setTelegramRedirectMessage(settings.telegramRedirectMessage || "You've reached your message limit. Visit our website to continue chatting!");
      setTelegramWebhookUrl(settings.telegramWebhookUrl || "");
      
      // Instagram settings
      setInstagramUsername(settings.instagramUsername || "");
      setInstagramPassword(settings.instagramPassword || "");
      setInstagramApiKey(settings.instagramApiKey || "");
      setInstagramMessageLimit(settings.instagramMessageLimit || 50);
      setInstagramRedirectMessage(settings.instagramRedirectMessage || "You've reached your message limit. Visit our website to continue chatting!");
      
      // Payment settings
      setPaypalClientId(settings.paypalClientId || "");
      setPaypalSecret(settings.paypalSecret || "");
      setPaypalWebhook(settings.paypalWebhook || "");
      
      // Automation settings
      setAutoPostEnabled(settings.autoPostEnabled || false);
      setAutoPostTime(settings.autoPostTime || "12:00");
      setAutoPostFrequency(settings.autoPostFrequency || 1);
    }
  }, [settings]);

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
    toast({
      title: "Saving Changes",
      description: "Updating AI settings..."
    });
    
    updateSettingsMutation.mutate({
      aiModel,
      voiceTone,
      voiceAccent,
      imagePrompt,
      freeMessageLimit,
      telegramMessageLimit,
      instagramMessageLimit,
      telegramRedirectMessage,
      instagramRedirectMessage
    });
  };

  // Save API configuration settings
  const handleSaveAPIConfig = () => {
    toast({
      title: "Saving Changes",
      description: "Updating API configuration..."
    });
    
    updateSettingsMutation.mutate({
      // OpenRouter API
      openRouterApiKey,
      
      // AI Models
      useMythoMax,
      useOpenHermes,
      useDeepseek,
      
      // Voice/Audio APIs
      piperTTSEnabled,
      whisperEnabled,
      
      // Communication APIs
      webRTCEnabled, 
      socketIOEnabled,
      
      // Image Generation
      googleCollabUrl,
      automatic1111Url,
      stableDiffusionModel,
      useRealisticVision: stableDiffusionModel === "RealisticVision",
      useDreamshaper: stableDiffusionModel === "DreamShaper",
      useDeliberate: stableDiffusionModel === "Deliberate",
      dreamBoothEnabled,
      loraEnabled
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

  // Subscription plan mutations
  const createPlanMutation = useMutation({
    mutationFn: (data: any) => createSubscriptionPlan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription-plans'] });
      toast({
        title: "Plan Created",
        description: "Subscription plan has been created successfully."
      });
      resetPlanForm();
    },
    onError: (error) => {
      toast({
        title: "Create Failed",
        description: error instanceof Error ? error.message : "Could not create subscription plan",
        variant: "destructive"
      });
    }
  });
  
  const updatePlanMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => updateSubscriptionPlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription-plans'] });
      toast({
        title: "Plan Updated",
        description: "Subscription plan has been updated successfully."
      });
      resetPlanForm();
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Could not update subscription plan",
        variant: "destructive"
      });
    }
  });
  
  const deletePlanMutation = useMutation({
    mutationFn: (id: number) => deleteSubscriptionPlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/subscription-plans'] });
      toast({
        title: "Plan Deleted",
        description: "Subscription plan has been deleted successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Could not delete subscription plan",
        variant: "destructive"
      });
    }
  });
  
  // Helper functions for subscription plans
  const handleCreateOrUpdatePlan = () => {
    if (!planName || !planTier || !planDuration || planPrice <= 0 || !planFeatures) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    // Convert feature text to array
    const featuresArray = planFeatures.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
      
    const planData = {
      name: planName,
      tier: planTier,
      duration: planDuration,
      price: planPrice,
      featuresJson: featuresArray,
      isActive: planIsActive
    };
    
    if (editingPlanId) {
      updatePlanMutation.mutate({ id: editingPlanId, data: planData });
    } else {
      createPlanMutation.mutate(planData);
    }
  };
  
  const handleEditPlan = (plan: any) => {
    setEditingPlanId(plan.id);
    setPlanName(plan.name);
    setPlanTier(plan.tier);
    setPlanDuration(plan.duration);
    setPlanPrice(plan.price);
    
    // Convert features array to string for textarea
    if (plan.featuresJson && Array.isArray(plan.featuresJson)) {
      setPlanFeatures(plan.featuresJson.join('\n'));
    } else {
      setPlanFeatures('');
    }
    
    setPlanIsActive(plan.isActive);
  };
  
  const handleDeletePlan = (id: number) => {
    if (confirm("Are you sure you want to delete this subscription plan?")) {
      deletePlanMutation.mutate(id);
    }
  };
  
  const resetPlanForm = () => {
    setEditingPlanId(null);
    setPlanName("");
    setPlanTier("basic");
    setPlanDuration("month");
    setPlanPrice(999);
    setPlanFeatures("");
    setPlanIsActive(true);
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
    <div className="p-3 md:p-6">
      <h1 className="text-xl md:text-2xl font-display font-semibold mb-4 md:mb-6">Admin Panel</h1>
      
      {/* Custom tabs navigation */}
      <div className="mb-6 grid grid-cols-2 gap-2">
        <button 
          className={`bg-gray-800 border border-gray-700 text-white rounded-lg p-4 ${activeTab === 'ai-settings' ? 'bg-gray-700' : ''}`}
          onClick={() => setActiveTab('ai-settings')}
        >
          AI Settings
        </button>
        <button 
          className={`bg-gray-800 border border-gray-700 text-white rounded-lg p-4 ${activeTab === 'api-config' ? 'bg-gray-700' : ''}`}
          onClick={() => setActiveTab('api-config')}
        >
          API Configuration
        </button>
        <button 
          className={`bg-gray-800 border border-gray-700 text-white rounded-lg p-4 ${activeTab === 'social-media' ? 'bg-gray-700' : ''}`}
          onClick={() => setActiveTab('social-media')}
        >
          Social Media
        </button>
        <button 
          className={`bg-gray-800 border border-gray-700 text-white rounded-lg p-4 ${activeTab === 'social-connections' ? 'bg-gray-700' : ''}`}
          onClick={() => setActiveTab('social-connections')}
        >
          Connections
        </button>
        <button 
          className={`bg-gray-800 border border-gray-700 text-white rounded-lg p-4 ${activeTab === 'content' ? 'bg-gray-700' : ''}`}
          onClick={() => setActiveTab('content')}
        >
          Content
        </button>
        <button 
          className={`bg-gray-800 border border-gray-700 text-white rounded-lg p-4 ${activeTab === 'payment' ? 'bg-gray-700' : ''}`}
          onClick={() => setActiveTab('payment')}
        >
          Payment
        </button>
        <button 
          className={`bg-gray-800 border border-gray-700 text-white rounded-lg p-4 ${activeTab === 'subscriptions' ? 'bg-gray-700' : ''}`}
          onClick={() => setActiveTab('subscriptions')}
        >
          Subscriptions
        </button>
        <button 
          className={`col-span-2 bg-gray-800 border border-gray-700 text-white rounded-lg p-4 ${activeTab === 'automation' ? 'bg-gray-700' : ''}`}
          onClick={() => setActiveTab('automation')}
        >
          Automation
        </button>
      </div>
      
      {/* AI Settings Tab */}
      {activeTab === 'ai-settings' && (
        <Card className="border-0 md:border shadow-none md:shadow">
          <CardHeader className="px-3 md:px-6 py-4 md:py-6">
            <CardTitle className="text-lg md:text-xl">AI Model Settings</CardTitle>
            <CardDescription className="text-xs md:text-sm">Configure AI model behavior and parameters for chat and voice features.</CardDescription>
          </CardHeader>
          <CardContent className="px-3 md:px-6 pb-4 md:pb-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ai-model">AI Model</Label>
              <Select value={aiModel} onValueChange={setAiModel}>
                <SelectTrigger id="ai-model">
                  <SelectValue placeholder="Select AI model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MythoMax-L2">MythoMax-L2</SelectItem>
                  <SelectItem value="Starling-LM">Starling-LM</SelectItem>
                  <SelectItem value="Llama-3">Llama-3</SelectItem>
                  <SelectItem value="Claude-3-Opus">Claude-3-Opus</SelectItem>
                  <SelectItem value="GPT-4">GPT-4</SelectItem>
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
                  <SelectItem value="playful">Playful</SelectItem>
                  <SelectItem value="caring">Caring</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
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
              <Label htmlFor="image-prompt">Image Generation Prompt</Label>
              <Textarea 
                id="image-prompt" 
                rows={4}
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder="Enter base prompt for generating AI images" 
              />
              <p className="text-xs text-muted-foreground">Used as a base prompt for generating AI profile images and media content.</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="free-message-limit">Free Message Limit</Label>
              <Input 
                id="free-message-limit" 
                type="number" 
                min="1" 
                max="20"
                value={freeMessageLimit}
                onChange={(e) => setFreeMessageLimit(parseInt(e.target.value))}
              />
              <p className="text-xs text-muted-foreground">How many messages free users can send before being prompted to upgrade.</p>
            </div>
            
            <Button onClick={handleSaveAISettings}>Save AI Settings</Button>
          </CardContent>
        </Card>
      )}
      
      {/* Social Media Tab */}
      {activeTab === 'social-media' && (
        <Card className="border-0 md:border shadow-none md:shadow">
          <CardHeader className="px-3 md:px-6 py-4 md:py-6">
            <CardTitle className="text-lg md:text-xl">Social Media Settings</CardTitle>
            <CardDescription className="text-xs md:text-sm">Configure social media integrations for Telegram and Instagram.</CardDescription>
          </CardHeader>
          <CardContent className="px-3 md:px-6 pb-4 md:pb-6 space-y-4">
            <div className="space-y-4">
              <h3 className="text-md font-medium">Telegram Settings</h3>
              
              <div className="space-y-2">
                <Label htmlFor="telegram-api-key">Telegram Bot API Key</Label>
                <Input 
                  id="telegram-api-key" 
                  value={telegramApiKey}
                  onChange={(e) => setTelegramApiKey(e.target.value)}
                  placeholder="Enter Telegram Bot API key" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telegram-bot-username">Bot Username</Label>
                <Input 
                  id="telegram-bot-username" 
                  value={telegramBotUsername}
                  onChange={(e) => setTelegramBotUsername(e.target.value)}
                  placeholder="@your_bot_username" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telegram-channel-id">Channel ID (optional)</Label>
                <Input 
                  id="telegram-channel-id" 
                  value={telegramChannelId}
                  onChange={(e) => setTelegramChannelId(e.target.value)}
                  placeholder="Channel ID for announcements" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telegram-message-limit">Free Message Limit</Label>
                <Input 
                  id="telegram-message-limit" 
                  type="number" 
                  min="10" 
                  max="100"
                  value={telegramMessageLimit}
                  onChange={(e) => setTelegramMessageLimit(parseInt(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telegram-redirect-message">Limit Reached Message</Label>
                <Textarea 
                  id="telegram-redirect-message" 
                  rows={2}
                  value={telegramRedirectMessage}
                  onChange={(e) => setTelegramRedirectMessage(e.target.value)}
                  placeholder="Message to show when limit is reached" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="telegram-webhook-url">Webhook URL</Label>
                <Input 
                  id="telegram-webhook-url" 
                  value={telegramWebhookUrl}
                  onChange={(e) => setTelegramWebhookUrl(e.target.value)}
                  placeholder="https://your-website.com/api/telegram-webhook" 
                />
                <p className="text-xs text-muted-foreground">Set this in your Telegram bot settings</p>
              </div>
            </div>
            
            <div className="pt-4 space-y-4">
              <h3 className="text-md font-medium">Instagram Settings</h3>
              
              <div className="space-y-2">
                <Label htmlFor="instagram-username">Instagram Username</Label>
                <Input 
                  id="instagram-username" 
                  value={instagramUsername}
                  onChange={(e) => setInstagramUsername(e.target.value)}
                  placeholder="Your Instagram username" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="instagram-password">Instagram Password</Label>
                <Input 
                  id="instagram-password" 
                  type="password"
                  value={instagramPassword}
                  onChange={(e) => setInstagramPassword(e.target.value)}
                  placeholder="Your Instagram password" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="instagram-api-key">Instagram API Key (if using Meta API)</Label>
                <Input 
                  id="instagram-api-key" 
                  value={instagramApiKey}
                  onChange={(e) => setInstagramApiKey(e.target.value)}
                  placeholder="Meta API key" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="instagram-message-limit">Free Message Limit</Label>
                <Input 
                  id="instagram-message-limit" 
                  type="number" 
                  min="10" 
                  max="100"
                  value={instagramMessageLimit}
                  onChange={(e) => setInstagramMessageLimit(parseInt(e.target.value))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="instagram-redirect-message">Limit Reached Message</Label>
                <Textarea 
                  id="instagram-redirect-message" 
                  rows={2}
                  value={instagramRedirectMessage}
                  onChange={(e) => setInstagramRedirectMessage(e.target.value)}
                  placeholder="Message to show when limit is reached" 
                />
              </div>
            </div>
            
            <Button onClick={handleSaveAISettings} className="mt-4">Save Social Media Settings</Button>
          </CardContent>
        </Card>
      )}
      
      {/* Connections Tab */}
      {activeTab === 'social-connections' && (
        <Card className="border-0 md:border shadow-none md:shadow">
          <CardHeader className="px-3 md:px-6 py-4 md:py-6">
            <CardTitle className="text-lg md:text-xl">Social Media Connections</CardTitle>
            <CardDescription className="text-xs md:text-sm">Manage users connecting through Instagram and Telegram platforms</CardDescription>
          </CardHeader>
          <CardContent className="px-3 md:px-6 pb-4 md:pb-6 space-y-4">
            <Alert className="bg-pink-950 border-pink-800">
              <AlertTitle className="text-pink-300">Connection Management</AlertTitle>
              <AlertDescription className="text-sm">
                Users connecting through Instagram or Telegram receive 50 fresh messages with each new interaction. You can reset their message count or remove connections from this panel.
              </AlertDescription>
            </Alert>
            
            <div className="pt-4 space-y-4">
              <div className="flex space-x-2">
                <Button className="flex-1" variant="outline">Telegram Users</Button>
                <Button className="flex-1" variant="outline">Instagram Users</Button>
              </div>
              
              <div className="border border-gray-800 rounded-md">
                <div className="grid grid-cols-3 gap-4 p-4 border-b border-gray-800">
                  <div className="font-medium">Telegram ID</div>
                  <div className="font-medium">Username</div>
                  <div className="font-medium text-right">Actions</div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 p-4 border-b border-gray-800">
                  <div>123456789</div>
                  <div>@telegram_user1</div>
                  <div className="flex justify-end space-x-2">
                    <Button size="sm" variant="outline">Reset</Button>
                    <Button size="sm" variant="destructive">Remove</Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 p-4">
                  <div>987654321</div>
                  <div>@telegram_user2</div>
                  <div className="flex justify-end space-x-2">
                    <Button size="sm" variant="outline">Reset</Button>
                    <Button size="sm" variant="destructive">Remove</Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Content Tab */}
      {activeTab === 'content' && (
        <Card className="border-0 md:border shadow-none md:shadow">
          <CardHeader className="px-3 md:px-6 py-4 md:py-6">
            <CardTitle className="text-lg md:text-xl">Content Management</CardTitle>
            <CardDescription className="text-xs md:text-sm">Create and manage posts, photos, and videos.</CardDescription>
          </CardHeader>
          <CardContent className="px-3 md:px-6 pb-4 md:pb-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-md font-medium">Create New Post</h3>
              
              <div className="space-y-2">
                <Label htmlFor="post-title">Post Title</Label>
                <Input 
                  id="post-title" 
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  placeholder="Post title" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="post-content">Post Content</Label>
                <Textarea 
                  id="post-content" 
                  rows={4}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Post content" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="post-image-url">Image URL</Label>
                <Input 
                  id="post-image-url" 
                  value={postImageUrl}
                  onChange={(e) => setPostImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg" 
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="post-premium" 
                  checked={postIsPremium}
                  onCheckedChange={setPostIsPremium}
                />
                <Label htmlFor="post-premium">Premium Content</Label>
              </div>
              
              <Button onClick={handleCreatePost}>Create Post</Button>
            </div>
            
            <div className="pt-4 space-y-4">
              <h3 className="text-md font-medium">Create New Photo</h3>
              
              <div className="space-y-2">
                <Label htmlFor="photo-title">Photo Title</Label>
                <Input 
                  id="photo-title" 
                  value={photoTitle}
                  onChange={(e) => setPhotoTitle(e.target.value)}
                  placeholder="Photo title" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="photo-description">Description</Label>
                <Textarea 
                  id="photo-description" 
                  rows={2}
                  value={photoDescription}
                  onChange={(e) => setPhotoDescription(e.target.value)}
                  placeholder="Photo description" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="photo-image-url">Image URL</Label>
                <Input 
                  id="photo-image-url" 
                  value={photoImageUrl}
                  onChange={(e) => setPhotoImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg" 
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="photo-premium" 
                  checked={photoIsPremium}
                  onCheckedChange={setPhotoIsPremium}
                />
                <Label htmlFor="photo-premium">Premium Content</Label>
              </div>
              
              <Button onClick={handleCreatePhoto}>Create Photo</Button>
            </div>
            
            <div className="pt-4 space-y-4">
              <h3 className="text-md font-medium">Create New Video</h3>
              
              <div className="space-y-2">
                <Label htmlFor="video-title">Video Title</Label>
                <Input 
                  id="video-title" 
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="Video title" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="video-description">Description</Label>
                <Textarea 
                  id="video-description" 
                  rows={2}
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                  placeholder="Video description" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="video-url">Video URL</Label>
                <Input 
                  id="video-url" 
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://example.com/video.mp4" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="video-thumbnail-url">Thumbnail URL</Label>
                <Input 
                  id="video-thumbnail-url" 
                  value={videoThumbnailUrl}
                  onChange={(e) => setVideoThumbnailUrl(e.target.value)}
                  placeholder="https://example.com/thumbnail.jpg" 
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="video-premium" 
                  checked={videoIsPremium}
                  onCheckedChange={setVideoIsPremium}
                />
                <Label htmlFor="video-premium">Premium Content</Label>
              </div>
              
              <Button onClick={handleCreateVideo}>Create Video</Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Payment Tab */}
      {activeTab === 'payment' && (
        <Card className="border-0 md:border shadow-none md:shadow">
          <CardHeader className="px-3 md:px-6 py-4 md:py-6">
            <CardTitle className="text-lg md:text-xl">Payment Settings</CardTitle>
            <CardDescription className="text-xs md:text-sm">Configure PayPal integration for subscription payments.</CardDescription>
          </CardHeader>
          <CardContent className="px-3 md:px-6 pb-4 md:pb-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paypal-client-id">PayPal Client ID</Label>
              <Input 
                id="paypal-client-id" 
                value={paypalClientId}
                onChange={(e) => setPaypalClientId(e.target.value)}
                placeholder="Enter PayPal Client ID" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paypal-secret">PayPal Secret</Label>
              <Input 
                id="paypal-secret" 
                type="password"
                value={paypalSecret}
                onChange={(e) => setPaypalSecret(e.target.value)}
                placeholder="Enter PayPal Secret" 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="paypal-webhook">PayPal Webhook URL</Label>
              <Input 
                id="paypal-webhook" 
                value={paypalWebhook}
                onChange={(e) => setPaypalWebhook(e.target.value)}
                placeholder="https://your-website.com/api/paypal-webhook" 
              />
              <p className="text-xs text-muted-foreground">Configure this URL in your PayPal Developer Dashboard</p>
            </div>
            
            <Button onClick={handleSavePaymentSettings}>Save Payment Settings</Button>
          </CardContent>
        </Card>
      )}
      
      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <Card className="border-0 md:border shadow-none md:shadow">
          <CardHeader className="px-3 md:px-6 py-4 md:py-6">
            <CardTitle className="text-lg md:text-xl">Subscription Plans</CardTitle>
            <CardDescription className="text-xs md:text-sm">Create and manage subscription plans for premium users.</CardDescription>
          </CardHeader>
          <CardContent className="px-3 md:px-6 pb-4 md:pb-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-md font-medium">{editingPlanId ? 'Edit' : 'Create'} Subscription Plan</h3>
              
              <div className="space-y-2">
                <Label htmlFor="plan-name">Plan Name</Label>
                <Input 
                  id="plan-name" 
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="Basic Monthly" 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plan-tier">Tier</Label>
                  <Select value={planTier} onValueChange={setPlanTier}>
                    <SelectTrigger id="plan-tier">
                      <SelectValue placeholder="Select tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="plan-duration">Duration</Label>
                  <Select value={planDuration} onValueChange={setPlanDuration}>
                    <SelectTrigger id="plan-duration">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Weekly</SelectItem>
                      <SelectItem value="month">Monthly</SelectItem>
                      <SelectItem value="6month">6 Months</SelectItem>
                      <SelectItem value="year">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="plan-price">Price (in cents)</Label>
                <Input 
                  id="plan-price" 
                  type="number"
                  value={planPrice}
                  onChange={(e) => setPlanPrice(parseInt(e.target.value))}
                  placeholder="999 = $9.99" 
                />
                <p className="text-xs text-muted-foreground">Enter the price in cents (e.g. 999 for $9.99)</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="plan-features">Features (one per line)</Label>
                <Textarea 
                  id="plan-features" 
                  rows={4}
                  value={planFeatures}
                  onChange={(e) => setPlanFeatures(e.target.value)}
                  placeholder="Unlimited messages
Premium content access
Priority support" 
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch 
                  id="plan-active" 
                  checked={planIsActive}
                  onCheckedChange={setPlanIsActive}
                />
                <Label htmlFor="plan-active">Active Plan</Label>
              </div>
              
              <div className="flex space-x-2">
                <Button onClick={handleCreateOrUpdatePlan}>{editingPlanId ? 'Update' : 'Create'} Plan</Button>
                {editingPlanId && (
                  <Button variant="outline" onClick={resetPlanForm}>Cancel</Button>
                )}
              </div>
            </div>
            
            <div className="pt-4 space-y-4">
              <h3 className="text-md font-medium">Existing Plans</h3>
              
              {subscriptionPlans.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4">No subscription plans found. Create your first plan above.</p>
              ) : (
                <div className="border border-gray-800 rounded-md divide-y divide-gray-800">
                  {subscriptionPlans.map((plan: any) => (
                    <div key={plan.id} className="p-4 flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{plan.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {plan.tier.charAt(0).toUpperCase() + plan.tier.slice(1)} · 
                          {plan.duration === 'month' ? ' Monthly' : 
                           plan.duration === 'week' ? ' Weekly' : 
                           plan.duration === '6month' ? ' 6 Months' : ' Yearly'} · 
                          ${(plan.price / 100).toFixed(2)}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditPlan(plan)}>Edit</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeletePlan(plan.id)}>Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* API Configuration Tab */}
      {activeTab === 'api-config' && (
        <Card className="border-0 md:border shadow-none md:shadow">
          <CardHeader className="px-3 md:px-6 py-4 md:py-6">
            <CardTitle className="text-lg md:text-xl">API Configuration</CardTitle>
            <CardDescription className="text-xs md:text-sm">Manage API keys and service configurations for all integrations.</CardDescription>
          </CardHeader>
          <CardContent className="px-3 md:px-6 py-2 md:py-4 space-y-4">
            
            {/* OpenRouter API Section */}
            <div className="p-4 bg-gray-800 rounded-lg space-y-4">
              <h3 className="text-lg font-medium">OpenRouter API</h3>
              <p className="text-sm text-gray-400">Configure OpenRouter for AI text generation. Only NSFW-compatible models will be used.</p>
              
              <div className="space-y-2">
                <Label htmlFor="openrouter-api-key">OpenRouter API Key</Label>
                <Input 
                  id="openrouter-api-key" 
                  type="password"
                  value={openRouterApiKey}
                  onChange={(e) => setOpenRouterApiKey(e.target.value)}
                  placeholder="sk-or-..." 
                />
                <p className="text-xs text-gray-500">Get your API key from <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">openrouter.ai/keys</a></p>
              </div>
              
              <div className="space-y-2">
                <Label>Available AI Models</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="model-mythomax" 
                      checked={useMythoMax}
                      onCheckedChange={setUseMythoMax}
                    />
                    <Label htmlFor="model-mythomax">MythoMax-L2 (Best for explicit content)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="model-openhermes" 
                      checked={useOpenHermes}
                      onCheckedChange={setUseOpenHermes}
                    />
                    <Label htmlFor="model-openhermes">OpenHermes-2.5-Mistral (Balanced conversations)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="model-deepseek" 
                      checked={useDeepseek}
                      onCheckedChange={setUseDeepseek}
                    />
                    <Label htmlFor="model-deepseek">Deepseek-Chat-7B-NSFW (General conversation)</Label>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Voice/Audio API Section */}
            <div className="p-4 bg-gray-800 rounded-lg space-y-4">
              <h3 className="text-lg font-medium">Voice & Audio APIs</h3>
              <p className="text-sm text-gray-400">Configure text-to-speech and speech-to-text services.</p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="piper-tts-enabled" 
                      checked={piperTTSEnabled}
                      onCheckedChange={setPiperTTSEnabled}
                    />
                    <Label htmlFor="piper-tts-enabled">Piper TTS (Text-to-Speech)</Label>
                  </div>
                  <span className="text-xs text-gray-500">Self-hosted</span>
                </div>
                <p className="text-xs text-gray-500">Piper TTS generates natural, seductive voice for AI responses</p>
              </div>
              
              <div className="space-y-2 mt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="whisper-enabled" 
                      checked={whisperEnabled}
                      onCheckedChange={setWhisperEnabled}
                    />
                    <Label htmlFor="whisper-enabled">Whisper (Speech-to-Text)</Label>
                  </div>
                  <span className="text-xs text-gray-500">Self-hosted</span>
                </div>
                <p className="text-xs text-gray-500">Whisper converts user's voice to text during voice calls</p>
              </div>
            </div>
            
            {/* Communication APIs Section */}
            <div className="p-4 bg-gray-800 rounded-lg space-y-4">
              <h3 className="text-lg font-medium">Communication APIs</h3>
              <p className="text-sm text-gray-400">Configure real-time communication services.</p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="webrtc-enabled" 
                      checked={webRTCEnabled}
                      onCheckedChange={setWebRTCEnabled}
                    />
                    <Label htmlFor="webrtc-enabled">WebRTC (Voice/Video Calls)</Label>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Enables voice calls between users and AI companion</p>
              </div>
              
              <div className="space-y-2 mt-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="socketio-enabled" 
                      checked={socketIOEnabled}
                      onCheckedChange={setSocketIOEnabled}
                    />
                    <Label htmlFor="socketio-enabled">Socket.IO (Real-time Chat)</Label>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Powers real-time chat messaging with instant responses</p>
              </div>
            </div>
            
            {/* Image Generation APIs Section */}
            <div className="p-4 bg-gray-800 rounded-lg space-y-4">
              <h3 className="text-lg font-medium">Image Generation APIs</h3>
              <p className="text-sm text-gray-400">Configure AI image generation services (Stable Diffusion).</p>
              
              <div className="space-y-2">
                <Label htmlFor="google-collab-url">Google Colab URL</Label>
                <Input 
                  id="google-collab-url" 
                  value={googleCollabUrl}
                  onChange={(e) => setGoogleCollabUrl(e.target.value)}
                  placeholder="https://colab.research.google.com/drive/..." 
                />
                <p className="text-xs text-gray-500">Enter your Google Colab notebook URL for Stable Diffusion</p>
              </div>
              
              <div className="space-y-2 mt-3">
                <Label htmlFor="automatic1111-url">Automatic1111 URL</Label>
                <Input 
                  id="automatic1111-url" 
                  value={automatic1111Url}
                  onChange={(e) => setAutomatic1111Url(e.target.value)}
                  placeholder="http://127.0.0.1:7860" 
                />
                <p className="text-xs text-gray-500">URL for your Automatic1111 Stable Diffusion Web UI</p>
              </div>
              
              <div className="space-y-2 mt-4">
                <Label>Stable Diffusion Models</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="realistic-vision" 
                      checked={stableDiffusionModel === "RealisticVision" || true}
                      onCheckedChange={(checked) => {
                        if (checked) setStableDiffusionModel("RealisticVision");
                      }}
                    />
                    <Label htmlFor="realistic-vision">RealisticVision</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="dreamshaper" 
                      checked={stableDiffusionModel === "DreamShaper" || false}
                      onCheckedChange={(checked) => {
                        if (checked) setStableDiffusionModel("DreamShaper");
                      }}
                    />
                    <Label htmlFor="dreamshaper">DreamShaper</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="deliberate" 
                      checked={stableDiffusionModel === "Deliberate" || false}
                      onCheckedChange={(checked) => {
                        if (checked) setStableDiffusionModel("Deliberate");
                      }}
                    />
                    <Label htmlFor="deliberate">Deliberate</Label>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 mt-4">
                <Label>Training Methods</Label>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="dreambooth-enabled" 
                        checked={dreamBoothEnabled}
                        onCheckedChange={setDreamBoothEnabled}
                      />
                      <Label htmlFor="dreambooth-enabled">DreamBooth (Face Training)</Label>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Trains AI to generate consistent face images</p>
                </div>
                
                <div className="space-y-2 mt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="lora-enabled" 
                        checked={loraEnabled}
                        onCheckedChange={setLoraEnabled}
                      />
                      <Label htmlFor="lora-enabled">LoRA (Body Training)</Label>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">Trains AI to generate consistent body features</p>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={handleSaveAPIConfig} 
              className="w-full"
            >
              Save API Configuration
            </Button>
          </CardContent>
        </Card>
      )}
      
      {/* Automation Tab */}
      {activeTab === 'automation' && (
        <Card className="border-0 md:border shadow-none md:shadow">
          <CardHeader className="px-3 md:px-6 py-4 md:py-6">
            <CardTitle className="text-lg md:text-xl">Automation Settings</CardTitle>
            <CardDescription className="text-xs md:text-sm">Configure automated posting and content scheduling.</CardDescription>
          </CardHeader>
          <CardContent className="px-3 md:px-6 pb-4 md:pb-6 space-y-4">
            <div className="flex items-center space-x-2">
              <Switch 
                id="auto-post-enabled" 
                checked={autoPostEnabled}
                onCheckedChange={setAutoPostEnabled}
              />
              <Label htmlFor="auto-post-enabled">Enable Automated Posts</Label>
            </div>
            
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
            
            <Button onClick={handleSaveAutomationSettings} disabled={!autoPostEnabled}>Save Automation Settings</Button>
            
            <div className="pt-4">
              <Alert>
                <AlertTitle>Automation Information</AlertTitle>
                <AlertDescription className="text-sm">
                  Automated posts will be generated using your AI model and settings. Posts will be scheduled according to the frequency and time you set. Note that this feature requires an active subscription to OpenRouter API.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}