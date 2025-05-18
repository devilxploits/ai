import { Link, useLocation } from "wouter";
import { useModal } from "@/context/ModalContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export default function MobileMenu() {
  const { closeModal } = useModal();
  const [location] = useLocation();
  const { isAuthenticated, isAdmin, logout } = useAuth();

  const NavItem = ({ href, icon, label, active }: { href: string, icon: string, label: string, active?: boolean }) => (
    <li>
      <Link 
        href={href}
        className={cn(
          "flex items-center space-x-3 p-3 rounded-lg text-light-dimmed hover:text-light transition",
          active ? "bg-secondary bg-opacity-20 text-secondary-light" : "hover:bg-dark-card"
        )}
        onClick={closeModal}
      >
        <i className={`${icon} text-xl`}></i>
        <span>{label}</span>
      </Link>
    </li>
  );

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col" style={{backgroundColor: "#121212"}}>
      <div className="flex justify-between items-center p-4 border-b border-gray-800">
        <h1 className="text-primary font-display text-2xl">Sophia</h1>
        <button 
          className="text-light"
          onClick={closeModal}
          aria-label="Close menu"
        >
          <i className="ri-close-line text-2xl"></i>
        </button>
      </div>
      
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-2">
          <NavItem 
            href="/" 
            icon="ri-home-5-line" 
            label="Home" 
            active={location === "/"}
          />
          <NavItem 
            href="/chat" 
            icon="ri-chat-3-line" 
            label="Chat" 
            active={location === "/chat"}
          />
          <NavItem 
            href="/calls" 
            icon="ri-phone-line" 
            label="Voice Calls" 
            active={location === "/calls"}
          />
          <NavItem 
            href="/photos" 
            icon="ri-image-2-line" 
            label="Photos" 
            active={location === "/photos"}
          />
          <NavItem 
            href="/videos" 
            icon="ri-video-line" 
            label="Videos" 
            active={location === "/videos"}
          />
          <NavItem 
            href="/subscription" 
            icon="ri-vip-crown-line" 
            label="Subscription" 
            active={location === "/subscription"}
          />
          {isAdmin && (
            <NavItem 
              href="/admin" 
              icon="ri-dashboard-line" 
              label="Admin Panel" 
              active={location === "/admin"}
            />
          )}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-800">
        {!isAuthenticated ? (
          <Link 
            href="/login"
            className="flex items-center space-x-3 p-3 rounded-lg hover:bg-dark-card text-light-dimmed hover:text-light transition"
            onClick={closeModal}
          >
            <i className="ri-login-box-line text-xl"></i>
            <span>Log in</span>
          </Link>
        ) : (
          <>
            <Link 
              href="/settings"
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-dark-card text-light-dimmed hover:text-light transition"
              onClick={closeModal}
            >
              <i className="ri-settings-4-line text-xl"></i>
              <span>Settings</span>
            </Link>
            <button 
              onClick={() => {
                logout();
                closeModal();
              }}
              className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-dark-card text-light-dimmed hover:text-light transition"
            >
              <i className="ri-logout-box-r-line text-xl"></i>
              <span>Log out</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
