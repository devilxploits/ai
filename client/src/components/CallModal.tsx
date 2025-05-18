import { useState, useEffect } from "react";
import { useModal } from "@/context/ModalContext";
import { useAuth } from "@/context/AuthContext";
import { useWebRTC } from "@/hooks/useWebRTC";
import { useToast } from "@/hooks/use-toast";

export default function CallModal() {
  const { closeModal } = useModal();
  const { user, isPaid } = useAuth();
  const { toast } = useToast();
  const [muted, setMuted] = useState(false);
  
  const {
    isCallActive,
    callDuration,
    formattedDuration,
    audioStatus,
    isMuted,
    error,
    startCall,
    endCall,
    toggleMute
  } = useWebRTC();

  // Start call when modal opens
  useEffect(() => {
    if (isPaid && user) {
      startCall();
    }
    
    // Clean up on unmount
    return () => {
      endCall();
    };
  }, []);

  // Show errors from WebRTC hook
  useEffect(() => {
    if (error) {
      toast({
        title: "Call Error",
        description: error,
        variant: "destructive"
      });
    }
  }, [error, toast]);

  const handleEndCall = () => {
    endCall();
    closeModal();
  };

  const handleMuteToggle = () => {
    toggleMute();
    setMuted(!muted);
  };

  // Get status text to display
  const getStatusText = () => {
    if (error) return "Call failed";
    if (audioStatus === 'connecting') return "Connecting...";
    if (audioStatus === 'connected') return "Connected";
    return "Calling...";
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-end md:items-center justify-end">
      <div className="relative w-full md:w-96 bg-dark-lighter flex flex-col shadow-xl h-[80vh] md:h-[90vh] md:rounded-l-xl">
        {/* Call Header */}
        <div className="p-4 border-b border-gray-800 flex justify-between items-center">
          <div>
            <h3 className="font-semibold">Voice Call</h3>
            <p className="text-light-dimmed text-sm">Sophia</p>
          </div>
          <button 
            className="text-light-dimmed hover:text-light"
            onClick={handleEndCall}
            aria-label="Close call"
          >
            <i className="ri-close-line text-2xl"></i>
          </button>
        </div>
        
        {/* Call Content */}
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="w-28 h-28 rounded-full border-4 border-secondary overflow-hidden mb-6">
            <img 
              src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&h=200" 
              alt="Sophia call avatar" 
              className="w-full h-full object-cover" 
            />
          </div>
          
          <h3 className="text-xl font-semibold mb-1">Sophia</h3>
          <p className="text-light-dimmed mb-8" id="call-status">{getStatusText()}</p>
          
          <div className="flex items-center justify-center space-x-6">
            <button 
              className="w-12 h-12 bg-dark-card rounded-full flex items-center justify-center text-light hover:bg-dark transition"
              aria-label="Toggle speaker"
            >
              <i className="ri-volume-up-line text-xl"></i>
            </button>
            <button 
              className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white hover:bg-red-700 transition"
              onClick={handleEndCall}
              aria-label="End call"
            >
              <i className="ri-phone-off-line text-xl"></i>
            </button>
            <button 
              className={`w-12 h-12 ${muted ? 'bg-red-900' : 'bg-dark-card'} rounded-full flex items-center justify-center text-light hover:bg-dark transition`}
              onClick={handleMuteToggle}
              aria-label={muted ? "Unmute" : "Mute"}
            >
              <i className={`${muted ? 'ri-mic-off-line' : 'ri-mic-line'} text-xl`}></i>
            </button>
          </div>
          
          {isCallActive && (
            <div className="w-full mt-12">
              <div className="text-light-dimmed text-sm mb-2">Call duration: <span id="call-duration">{formattedDuration()}</span></div>
              <div className="w-full bg-dark-card rounded-full h-1.5">
                <div 
                  className="bg-primary h-1.5 rounded-full" 
                  style={{ width: `${Math.min(100, (callDuration / 300) * 100)}%` }}
                ></div>
              </div>
            </div>
          )}
          
          {/* Subscription Prompt (For Free Users) */}
          {!isPaid && (
            <div className="bg-dark-card rounded-xl p-4 mt-8 border border-primary border-opacity-50 text-center">
              <p className="text-light mb-2">Voice calls are available exclusively for premium subscribers!</p>
              <button 
                className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg text-sm transition"
                onClick={() => {
                  closeModal();
                  setTimeout(() => {
                    useModal().openModal('payment');
                  }, 100);
                }}
              >
                Upgrade Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
