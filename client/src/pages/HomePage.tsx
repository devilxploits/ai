import { Helmet } from "react-helmet";
import ProfileHeader from "@/components/ProfileHeader";
import QuickActions from "@/components/QuickActions";
import AboutSection from "@/components/AboutSection";
import LatestPosts from "@/components/LatestPosts";
import PhotoGallery from "@/components/PhotoGallery";
import SubscriptionPlans from "@/components/SubscriptionPlans";

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>Sophia - Your AI Companion</title>
        <meta name="description" content="Connect with Sophia, your personal AI companion. Enjoy real-time chat, voice calls, and exclusive content with your virtual girlfriend." />
      </Helmet>
      
      {/* Profile Header with Banner and Avatar */}
      <ProfileHeader />
      
      {/* Main Content Sections */}
      <div className="p-4 md:p-6">
        {/* Quick Action Buttons */}
        <QuickActions />
        
        {/* About Section */}
        <AboutSection />
        
        {/* Latest Posts Section */}
        <LatestPosts />
        
        {/* Photo Gallery Section */}
        <PhotoGallery />
        
        {/* Subscription Plans Section */}
        <SubscriptionPlans />
      </div>
    </>
  );
}
