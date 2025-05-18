import { useModal } from "@/context/ModalContext";
import { useAuth } from "@/context/AuthContext";

export default function MobileHeader() {
  const { openModal } = useModal();
  const { isAuthenticated } = useAuth();

  return (
    <div className="lg:hidden bg-dark-lighter p-4 flex justify-between items-center border-b border-gray-800 sticky top-0 z-50">
      <div className="flex items-center space-x-2">
        <span className="text-primary font-display text-xl">Sophia</span>
      </div>
      <div className="flex items-center space-x-4">
        {isAuthenticated && (
          <button 
            id="mobile-notifications-btn" 
            className="text-light-dimmed relative"
            aria-label="Notifications"
          >
            <i className="ri-notification-3-line text-xl"></i>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full text-xs flex items-center justify-center">3</span>
          </button>
        )}
        <button 
          id="mobile-menu-btn" 
          className="text-light-dimmed"
          onClick={() => openModal('mobileMenu')}
          aria-label="Open menu"
        >
          <i className="ri-menu-line text-xl"></i>
        </button>
      </div>
    </div>
  );
}
