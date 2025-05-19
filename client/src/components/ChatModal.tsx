import { useState, useEffect, useRef } from "react";
import { useModal } from "@/context/ModalContext";
import { useAuth } from "@/context/AuthContext";
import { Message } from "@shared/schema";
import { useSocket } from "@/hooks/useSocket";
import { getMessages } from "@/lib/api";
import { useOpenRouter } from "@/hooks/useOpenRouter";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { useWebRTC } from "@/hooks/useWebRTC";
import CustomChatInput from "./CustomChatInput";

export default function ChatModal() {
  const { closeModal } = useModal();
  const { user, isPaid, isAdmin } = useAuth();
  const { toast } = useToast();
  const [inputMessage, setInputMessage] = useState("");
  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const { isConnected, sendMessage, lastMessage } = useSocket();
  const { generateResponse, isLoading } = useOpenRouter();

  // Fetch message history
  const { data: messageHistory, isLoading: isLoadingHistory, refetch } = useQuery({
    queryKey: ['/api/messages'],
    queryFn: getMessages,
    enabled: !!user
  });

  // Messages state (combines API fetched messages and new WebSocket messages)
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Initialize messages from history when loaded
  useEffect(() => {
    if (messageHistory) {
      setMessages(messageHistory);
    }
  }, [messageHistory]);

  // Process incoming WebSocket messages
  useEffect(() => {
    if (lastMessage?.type === 'chat' && lastMessage.message) {
      setMessages(prevMessages => [...prevMessages, lastMessage.message]);
    } else if (lastMessage?.type === 'error') {
      toast({
        title: "Chat Error",
        description: lastMessage.message,
        variant: "destructive"
      });
    }
  }, [lastMessage, toast]);

  // Scroll to bottom of chat when messages change
  useEffect(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    }
  }, [messages]);

  // Send message handler (using WebSocket or REST API)
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Please log in to chat with Sophia",
        variant: "destructive"
      });
      return;
    }

    try {
      if (isConnected) {
        // Use WebSocket for real-time chat
        sendMessage({
          type: 'chat',
          content: inputMessage
        });
        
        // Add user message to UI immediately
        const userMessage: Message = {
          id: Date.now(), // Temporary ID
          userId: user.id,
          content: inputMessage,
          fromUser: true,
          timestamp: new Date()
        };
        
        setMessages(prevMessages => [...prevMessages, userMessage]);
      } else {
        // Fallback to REST API
        const result = await generateResponse(inputMessage);
        
        // Update messages with both user message and AI response
        setMessages(prevMessages => [
          ...prevMessages, 
          result.message, 
          result.aiResponse
        ]);
      }
      
      setInputMessage("");
    } catch (error) {
      toast({
        title: "Message Failed",
        description: "Could not send message. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle Enter key to send message
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Format message timestamp
  const formatMessageTime = (timestamp: Date | null) => {
    if (!timestamp) return "Just now";
    try {
      const date = new Date(timestamp);
      const now = new Date();
      
      // If message is from today, just show time
      if (date.toDateString() === now.toDateString()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      }
      
      // Otherwise show relative time
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return "Just now";
    }
  };

  const [isCallActive, setIsCallActive] = useState(false);
  // Use WebRTC hook for call functionality
  const { startCall, endCall, toggleMute, formattedDuration } = useWebRTC();

  const { openModal } = useModal();
  
  const handleStartCall = () => {
    // Admin users can access all features regardless of payment status
    if (!isPaid && !isAdmin && user) {
      toast({
        title: "Subscription Required",
        description: "Voice calls are available exclusively for premium subscribers!",
        variant: "destructive"
      });
      // Show upgrade prompt
      setTimeout(() => {
        closeModal();
        openModal('payment');
      }, 100);
      return;
    }
    
    startCall();
    setIsCallActive(true);
  };

  const handleEndCall = () => {
    endCall();
    setIsCallActive(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex flex-col">
      <div className="fixed inset-0 z-50 bg-[#000000b0] flex flex-col">
      {/* Chat Header */}
        <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-dark-lighter">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
              <img 
                src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100" 
                alt="Sophia chat avatar" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="flex-grow">
              <h3 className="font-semibold">Sophia</h3>
              <div className="flex items-center text-light-dimmed text-xs">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                <span>Online</span>
              </div>
            </div>
            {!isCallActive && (
              <button
                className="ml-2 mr-4 text-light-dimmed hover:text-light bg-dark-card hover:bg-dark p-2 rounded-full"
                onClick={handleStartCall}
                aria-label="Start voice call"
              >
                <i className="ri-phone-line text-xl"></i>
              </button>
            )}
            {isCallActive && (
              <div className="ml-2 mr-4 flex items-center text-light-dimmed">
                <i className="ri-phone-line text-xl mr-1"></i>
                <span className="text-xs">{formattedDuration()}</span>
                <button
                  className="ml-2 text-red-500 hover:text-red-400 bg-dark-card hover:bg-dark p-1 rounded-full"
                  onClick={handleEndCall}
                  aria-label="End call"
                >
                  <i className="ri-phone-off-line text-lg"></i>
                </button>
              </div>
            )}
          </div>
          <button
            className="text-light-dimmed hover:text-light"
            onClick={closeModal}
            aria-label="Close chat"
          >
            <i className="ri-close-line text-2xl"></i>
          </button>
        </div>
        
        {/* Call UI Overlay (when call is active) */}
        {isCallActive && (
          <div className="absolute top-16 right-4 bg-dark-card p-3 rounded-xl shadow-md z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-full border-2 border-secondary overflow-hidden mb-3">
              <img 
                src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&h=200" 
                alt="Sophia call avatar" 
                className="w-full h-full object-cover" 
              />
            </div>
            
            <div className="flex items-center mb-2 space-x-2">
              <button 
                className="w-8 h-8 bg-dark rounded-full flex items-center justify-center text-light hover:bg-dark-lighter transition"
                onClick={toggleMute}
                aria-label="Toggle mute"
              >
                <i className="ri-mic-line text-sm"></i>
              </button>
              <button 
                className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-700 transition"
                onClick={handleEndCall}
                aria-label="End call"
              >
                <i className="ri-phone-off-line text-sm"></i>
              </button>
            </div>
          </div>
        )}
        
        {/* Main Chat Area */}
        <div className="flex-1 max-w-screen-lg mx-auto w-full flex flex-col">
          {/* Chat Messages */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto scrollbar-hide flex flex-col" ref={chatMessagesRef}>
            {isLoadingHistory ? (
              <div className="flex justify-center my-8">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="max-w-[85%] md:max-w-[75%] lg:max-w-[65%] message-bubble incoming">
                <p>Hi there! I'm Sophia. It's so nice to meet you! How's your day going so far?</p>
                <div className="text-xs text-light-dimmed mt-1">Just now</div>
              </div>
            ) : (
              messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`message-bubble ${message.fromUser ? 'outgoing ml-auto' : 'incoming'} max-w-[85%] md:max-w-[75%] lg:max-w-[65%] mb-4`}
                >
                  <p>{message.content}</p>
                  <div className="text-xs text-light-dimmed mt-1">
                    {formatMessageTime(message.timestamp)}
                  </div>
                </div>
              ))
            )}
            
            {/* Subscription Prompt (For Free Users) - Hidden for admin users */}
            {!isPaid && !isAdmin && user && (
              <div className="bg-dark-card rounded-xl p-4 my-6 border border-primary border-opacity-50 text-center max-w-md mx-auto hidden">
                <p className="text-light mb-3">
                  Join me on my premium plan for unlimited conversations!
                </p>
                <button 
                  className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg transition"
                  onClick={() => {
                    closeModal();
                    setTimeout(() => {
                      openModal('payment');
                    }, 100);
                  }}
                >
                  Subscribe Now
                </button>
              </div>
            )}
            
            {/* Loading indicator when sending message */}
            {isLoading && (
              <div className="self-center my-4">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
          </div>
          
          {/* Login Message for Non-authenticated Users */}
          {!user && (
            <div className="bg-primary/20 border border-primary/40 rounded-lg p-3 mb-4 mx-4 md:mx-6 text-center">
              <p className="text-white font-medium">Please login to chat with Sophia</p>
            </div>
          )}
          
          {/* Input Area */}
          <div className="p-4 md:p-6 border-t border-gray-800 bg-dark-lighter">
            <div className="max-w-screen-lg mx-auto flex items-center">
              <CustomChatInput
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading || (!isPaid && !isAdmin && user ? false : false)}
              />
              <button 
                className={`${isLoading ? 'bg-primary-dark' : 'bg-primary hover:bg-primary-dark'} text-white p-3 rounded-r-lg transition`}
                onClick={handleSendMessage}
                disabled={isLoading || (!isPaid && !isAdmin && user ? false : false)}
                aria-label="Send message"
              >
                <i className="ri-send-plane-fill text-xl"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
