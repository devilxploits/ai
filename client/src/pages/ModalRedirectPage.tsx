import { useEffect } from "react";
import { useLocation } from "wouter";
import { useModal } from "@/context/ModalContext";
import { Helmet } from "react-helmet";

type ModalName = 'chat' | 'call' | 'payment' | 'mobileMenu';

interface ModalRedirectPageProps {
  modalName: ModalName;
  title: string;
  returnPath?: string;
}

// This page automatically opens a modal and redirects to home or specified page
export default function ModalRedirectPage({ modalName, title, returnPath = "/" }: ModalRedirectPageProps) {
  const { openModal } = useModal();
  const [, navigate] = useLocation();

  useEffect(() => {
    // Open the modal
    openModal(modalName);
    
    // Return to the home page or specified path
    navigate(returnPath);
  }, [modalName, openModal, navigate, returnPath]);

  return (
    <Helmet>
      <title>{title}</title>
    </Helmet>
  );
}