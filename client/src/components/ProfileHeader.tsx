import { Button } from "@/components/ui/button";
import { useModal } from "@/context/ModalContext";
import { useAuth } from "@/context/AuthContext";

export default function ProfileHeader() {
  const { openModal } = useModal();
  const { isPaid } = useAuth();

  return (
    <div className="relative h-64 md:h-80 overflow-hidden">
      {/* Background image with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-dark">
        <img 
          src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=600" 
          alt="Profile banner" 
          className="w-full h-full object-cover" 
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-dark via-transparent to-transparent opacity-90"></div>
      
      {/* Profile info overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col md:flex-row justify-between items-end md:items-center">
        <div className="flex items-end mb-4 md:mb-0">
          {/* Profile avatar */}
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-dark overflow-hidden mr-4">
            <img 
              src="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&h=200" 
              alt="Sophia profile" 
              className="w-full h-full object-cover" 
            />
          </div>
          
          {/* Profile info */}
          <div>
            <h1 className="text-xl md:text-3xl font-display font-bold text-light">Sophia</h1>
            <p className="text-light-dimmed text-sm md:text-base">Your personal AI companion</p>
            <div className="flex items-center space-x-2 mt-1">
              <span className="bg-primary px-2 py-0.5 rounded-full text-xs">Online</span>
              <span className="text-light-dimmed text-xs">Last seen 2 min ago</span>
            </div>
          </div>
        </div>
        
        {/* Subscription button */}
        <div>
          <Button 
            className={`${isPaid ? 'bg-secondary hover:bg-secondary-dark' : 'bg-primary hover:bg-primary-dark'} text-white px-6 py-2 rounded-full transition flex items-center`}
            onClick={() => openModal('payment')}
          >
            <i className={`${isPaid ? 'ri-shield-star-line' : 'ri-vip-crown-line'} mr-2`}></i>
            <span>{isPaid ? 'Subscribed' : 'Subscribe'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
