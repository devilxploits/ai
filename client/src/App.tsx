import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import PhotosPage from "@/pages/PhotosPage";
import VideosPage from "@/pages/VideosPage";
import AdminPanel from "@/pages/AdminPanel";
import LoginPage from "@/pages/LoginPage";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { ModalProvider } from "@/context/ModalContext";
import { AuthProvider } from "@/context/AuthContext";

function Router() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/photos" component={PhotosPage} />
      <Route path="/videos" component={VideosPage} />
      <Route path="/login">
        {() => (isAuthenticated ? <HomePage /> : <LoginPage />)}
      </Route>
      <Route path="/admin">
        {() => (isAdmin ? <AdminPanel /> : <LoginPage />)}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ModalProvider>
          <TooltipProvider>
            <Layout>
              <Toaster />
              <Router />
            </Layout>
          </TooltipProvider>
        </ModalProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
