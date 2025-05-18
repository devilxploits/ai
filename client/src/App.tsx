import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/HomePage";
import PhotosPage from "@/pages/PhotosPage";
import VideosPage from "@/pages/VideosPage";
import PostsPage from "@/pages/PostsPage";
import AdminPanel from "@/pages/AdminPanel";
import LoginPage from "@/pages/LoginPage";
import SettingsPage from "@/pages/SettingsPage";
import Layout from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { ModalProvider } from "@/context/ModalContext";
import { AuthProvider } from "@/context/AuthContext";
import ModalRedirectPage from "@/pages/ModalRedirectPage";

function Router() {
  const { isAuthenticated, isAdmin } = useAuth();

  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/posts" component={PostsPage} />
      <Route path="/photos" component={PhotosPage} />
      <Route path="/videos" component={VideosPage} />
      <Route path="/login">
        {() => (isAuthenticated ? <HomePage /> : <LoginPage />)}
      </Route>
      <Route path="/admin">
        {() => (isAdmin ? <AdminPanel /> : <HomePage />)}
      </Route>
      <Route path="/settings">
        {() => (isAuthenticated ? <SettingsPage /> : <LoginPage />)}
      </Route>
      {/* Modal redirect pages */}
      <Route path="/chat">
        {() => <ModalRedirectPage modalName="chat" title="Chat with Sophia" />}
      </Route>
      <Route path="/calls">
        {() => <ModalRedirectPage modalName="call" title="Voice Call with Sophia" />}
      </Route>
      <Route path="/subscription">
        {() => <ModalRedirectPage modalName="payment" title="Sophia Subscription" />}
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
