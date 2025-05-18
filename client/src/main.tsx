import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { ModalProvider } from "./context/ModalContext";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <ModalProvider>
      <App />
    </ModalProvider>
  </AuthProvider>
);
