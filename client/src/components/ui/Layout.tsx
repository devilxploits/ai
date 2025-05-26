import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import MobileHeader from "./MobileHeader";
import MobileMenu from "./MobileMenu";
import ChatModal from "./ChatModal";
import CallModal from "./CallModal";
import PaymentModal from "./PaymentModal";
import { useModal } from "@/context/ModalContext";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  const { activeModal } = useModal();

  return (
    <div className="flex flex-col lg:flex-row min-h-screen relative">
      {/* Mobile Header - visible on small screens */}
      <MobileHeader />

      {/* Sidebar - hidden on small screens, visible on large screens */}
      <Sidebar />

      {/* Mobile Menu Modal */}
      {activeModal === 'mobileMenu' && <MobileMenu />}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>

      {/* Modals */}
      <div className="modal-container">
        {activeModal === 'chat' && <ChatModal />}
        {activeModal === 'call' && <CallModal />}
        {activeModal === 'payment' && <PaymentModal />}
      </div>
    </div>
  );
}
