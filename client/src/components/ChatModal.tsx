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

export default function ChatModal() {
  const { closeModal } = useModal();
  const { user, isPaid } = useAuth();
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
  const formatMessageTime = (timestamp: Date) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    
    // If message is from today, just show time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // Otherwise show relative time
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-end">
      <div className="relative w-full md:w-96 bg-dark-lighter flex flex-col shadow-xl h-[80vh] md:h-[90vh] md:rounded-l-xl">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
              <img 
                src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100" 
                alt="Sophia chat avatar" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div>
              <h3 className="font-semibold">Sophia</h3>
              <div className="flex items-center text-light-dimmed text-xs">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                <span>Online</span>
              </div>
            </div>
          </div>
          <button
            className="text-light-dimmed hover:text-light"
            onClick={closeModal}
            aria-label="Close chat"
          >
            <i className="ri-close-line text-2xl"></i>
          </button>
        </div>
        
        {/* Chat Messages */}
        <div className="flex-1 p-4 overflow-y-auto scrollbar-hide flex flex-col" ref={chatMessagesRef}>
          {isLoadingHistory ? (
            <div className="flex justify-center">
              <span className="text-light-dimmed">Loading messages...</span>
            </div>
          ) : messages.length === 0 ? (
            <div className="message-bubble incoming">
              <p>Hi there! I'm Sophia. It's so nice to meet you! How's your day going so far?</p>
              <div className="text-xs text-light-dimmed mt-1">Just now</div>
            </div>
          ) : (
            messages.map((message) => (
              <div 
                key={message.id} 
                className={`message-bubble ${message.fromUser ? 'outgoing' : 'incoming'}`}
              >
                <p>{message.content}</p>
                <div className="text-xs text-light-dimmed mt-1">
                  {formatMessageTime(message.timestamp)}
                </div>
              </div>
            ))
          )}
          
          {/* Subscription Prompt (For Free Users) */}
          {!isPaid && user && user.messageCount >= 1 && (
            <div className="bg-dark-card rounded-xl p-4 my-4 border border-primary border-opacity-50 text-center">
              <p className="text-light mb-2">
                Aww sorry hon, you need a subscription to keep chatting. Join me on my premium plan for unlimited conversations!
              </p>
              <button 
                className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm transition"
                onClick={() => {
                  closeModal();
                  setTimeout(() => {
                    useModal().openModal('payment');
                  }, 100);
                }}
              >
                Subscribe Now
              </button>
            </div>
          )}
          
          {/* Loading indicator when sending message */}
          {isLoading && (
            <div className="self-center my-2">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}
        </div>
        
        {/* Input Area */}
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center">
            <input 
              type="text" 
              placeholder="Type a message..." 
              className="flex-1 bg-dark-card text-light rounded-l-lg px-4 py-2 outline-none border border-gray-800 border-r-0"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading || (!isPaid && user && user.messageCount >= 1)}
            />
            <button 
              className={`${isLoading ? 'bg-primary-dark' : 'bg-primary hover:bg-primary-dark'} text-white p-2 rounded-r-lg transition`}
              onClick={handleSendMessage}
              disabled={isLoading || (!isPaid && user && user.messageCount >= 1)}
              aria-label="Send message"
            >
              <i className="ri-send-plane-fill text-xl"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
