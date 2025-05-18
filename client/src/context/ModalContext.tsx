import { createContext, useState, useContext, ReactNode } from 'react';

type ModalType = 'chat' | 'call' | 'payment' | 'mobileMenu' | null;

type ModalContextType = {
  activeModal: ModalType;
  openModal: (modal: ModalType) => void;
  closeModal: () => void;
};

const ModalContext = createContext<ModalContextType>({
  activeModal: null,
  openModal: () => {},
  closeModal: () => {}
});

export function ModalProvider({ children }: { children: ReactNode }) {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const openModal = (modal: ModalType) => {
    console.log("Opening modal:", modal);
    setActiveModal(modal);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <ModalContext.Provider
      value={{
        activeModal,
        openModal,
        closeModal
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export const useModal = () => useContext(ModalContext);
