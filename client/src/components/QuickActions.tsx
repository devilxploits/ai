import { useModal } from "@/context/ModalContext";
import { useLocation } from "wouter";

export default function QuickActions() {
  const { openModal } = useModal();
  const [_, navigate] = useLocation();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {/* Chat button */}
      <button 
        className="flex flex-col items-center justify-center p-4 bg-dark-card rounded-xl hover:bg-dark-lighter transition"
        onClick={() => openModal('chat')}
        aria-label="Chat Now"
      >
        <div className="w-12 h-12 rounded-full bg-secondary bg-opacity-20 flex items-center justify-center mb-2">
          <i className="ri-chat-3-line text-secondary-light text-xl"></i>
        </div>
        <span className="text-light text-sm">Chat Now</span>
      </button>
      
      {/* Voice Call button */}
      <button 
        className="flex flex-col items-center justify-center p-4 bg-dark-card rounded-xl hover:bg-dark-lighter transition"
        onClick={() => openModal('call')}
        aria-label="Voice Call"
      >
        <div className="w-12 h-12 rounded-full bg-primary bg-opacity-20 flex items-center justify-center mb-2">
          <i className="ri-phone-line text-primary-light text-xl"></i>
        </div>
        <span className="text-light text-sm">Voice Call</span>
      </button>
      
      {/* Photos button */}
      <button 
        className="flex flex-col items-center justify-center p-4 bg-dark-card rounded-xl hover:bg-dark-lighter transition"
        onClick={() => navigate('/photos')}
        aria-label="Photos"
      >
        <div className="w-12 h-12 rounded-full bg-secondary bg-opacity-20 flex items-center justify-center mb-2">
          <i className="ri-image-2-line text-secondary-light text-xl"></i>
        </div>
        <span className="text-light text-sm">Photos</span>
      </button>
      
      {/* Videos button */}
      <button 
        className="flex flex-col items-center justify-center p-4 bg-dark-card rounded-xl hover:bg-dark-lighter transition"
        onClick={() => navigate('/videos')}
        aria-label="Videos"
      >
        <div className="w-12 h-12 rounded-full bg-primary bg-opacity-20 flex items-center justify-center mb-2">
          <i className="ri-video-line text-primary-light text-xl"></i>
        </div>
        <span className="text-light text-sm">Videos</span>
      </button>
    </div>
  );
}
