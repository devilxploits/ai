import { useState } from "react";
import { getVideos } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useModal } from "@/context/ModalContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Helmet } from "react-helmet";
import { Video } from "@shared/schema";

export default function VideosPage() {
  const { data: videos, isLoading, error } = useQuery({
    queryKey: ['/api/videos'],
    queryFn: getVideos
  });
  
  const { isPaid } = useAuth();
  const { openModal } = useModal();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

  // Filter videos based on user subscription
  const publicVideos = videos?.filter(video => !video.isPremium) || [];
  const premiumVideos = videos?.filter(video => video.isPremium) || [];

  // Handle video click
  const handleVideoClick = (video: Video) => {
    if (video.isPremium && !isPaid) {
      openModal('payment');
    } else {
      setSelectedVideo(video);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6">
        <h1 className="text-2xl font-display font-semibold mb-6">Sophia's Videos</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="aspect-video rounded-xl bg-dark-card animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <h1 className="text-2xl font-display font-semibold mb-6">Sophia's Videos</h1>
        <div className="bg-dark-card rounded-xl p-6 text-center">
          <p className="text-light-dimmed">Failed to load videos. Please try again later.</p>
        </div>
      </div>
    );
  }

  // If no videos are available yet
  if ((videos?.length || 0) === 0) {
    return (
      <div className="p-4 md:p-6">
        <h1 className="text-2xl font-display font-semibold mb-6">Sophia's Videos</h1>
        <div className="bg-dark-card rounded-xl p-6 text-center">
          <div className="text-6xl mb-4">
            <i className="ri-video-line"></i>
          </div>
          <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
          <p className="text-light-dimmed">
            Sophia is working on creating exciting video content just for you. Check back soon!
          </p>
          {!isPaid && (
            <button 
              className="mt-6 bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg transition"
              onClick={() => openModal('payment')}
            >
              Subscribe for First Access
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Sophia's Videos | AI Companion Gallery</title>
        <meta name="description" content="Watch exclusive videos of Sophia, your AI companion. Subscribe to unlock premium content and see more intimate videos." />
      </Helmet>
      
      <div className="p-4 md:p-6">
        <h1 className="text-2xl font-display font-semibold mb-6">Sophia's Videos</h1>
        
        {/* Public Videos Section */}
        {publicVideos.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Public Videos</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {publicVideos.map((video) => (
                <div 
                  key={video.id}
                  className="video-item group cursor-pointer rounded-xl overflow-hidden"
                  onClick={() => handleVideoClick(video)}
                >
                  <div className="aspect-video relative">
                    <img 
                      src={video.thumbnailUrl || video.videoUrl} 
                      alt={video.title} 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-primary rounded-full p-3">
                        <i className="ri-play-fill text-white text-2xl"></i>
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-dark-card bg-opacity-80 px-2 py-1 rounded text-xs">
                      03:24
                    </div>
                  </div>
                  <div className="p-3 bg-dark-card">
                    <h3 className="font-semibold text-sm mb-1">{video.title}</h3>
                    <div className="flex justify-between text-light-dimmed text-xs">
                      <span>{video.views} views</span>
                      <span className="flex items-center">
                        <i className="ri-heart-line mr-1"></i> {video.likes}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Premium Videos Section */}
        {premiumVideos.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Premium Videos</h2>
            
            {!isPaid && (
              <div className="mb-4 bg-dark-card rounded-xl p-6 border border-primary border-opacity-30">
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Unlock Premium Videos</h3>
                    <p className="text-light-dimmed mb-4 md:mb-0">
                      Subscribe to access all exclusive premium videos.
                    </p>
                  </div>
                  <button 
                    className="bg-primary hover:bg-primary-dark text-white px-6 py-2 rounded-lg transition"
                    onClick={() => openModal('payment')}
                  >
                    Subscribe Now
                  </button>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {premiumVideos.map((video) => (
                <div 
                  key={video.id}
                  className={`video-item group cursor-pointer rounded-xl overflow-hidden ${!isPaid ? 'opacity-70' : ''}`}
                  onClick={() => handleVideoClick(video)}
                >
                  <div className="aspect-video relative">
                    <img 
                      src={video.thumbnailUrl || video.videoUrl} 
                      alt={video.title} 
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-primary rounded-full p-3">
                        <i className="ri-play-fill text-white text-2xl"></i>
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-dark-card bg-opacity-80 px-2 py-1 rounded text-xs">
                      05:47
                    </div>
                    
                    {!isPaid && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                        <div className="bg-primary rounded-full p-2">
                          <i className="ri-lock-line text-white text-xl"></i>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-dark-card">
                    <h3 className="font-semibold text-sm mb-1">{video.title}</h3>
                    <div className="flex justify-between text-light-dimmed text-xs">
                      <span>{video.views} views</span>
                      <div className="flex items-center">
                        <i className="ri-vip-crown-line text-primary mr-1"></i>
                        <span>Premium</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Video Player Dialog */}
        <Dialog open={!!selectedVideo} onOpenChange={() => setSelectedVideo(null)}>
          <DialogContent className="p-0 max-w-4xl bg-dark-card">
            {selectedVideo && (
              <>
                <div className="aspect-video bg-black relative">
                  {/* This would be a video player in a real implementation */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-primary rounded-full p-4 cursor-pointer">
                      <i className="ri-play-fill text-white text-3xl"></i>
                    </div>
                  </div>
                  <img 
                    src={selectedVideo.thumbnailUrl || selectedVideo.videoUrl} 
                    alt={selectedVideo.title} 
                    className="w-full h-full object-cover opacity-50" 
                  />
                </div>
                <div className="p-4">
                  <h2 className="text-xl font-semibold mb-2">{selectedVideo.title}</h2>
                  {selectedVideo.description && (
                    <p className="text-light-dimmed mb-4">{selectedVideo.description}</p>
                  )}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <button className="text-light-dimmed hover:text-primary transition">
                        <i className="ri-heart-line text-xl"></i>
                      </button>
                      <span className="text-light-dimmed">{selectedVideo.likes} likes</span>
                      <span className="text-light-dimmed">{selectedVideo.views} views</span>
                    </div>
                    {selectedVideo.isPremium && (
                      <div className="flex items-center text-primary">
                        <i className="ri-vip-crown-line mr-1"></i>
                        <span>Premium Content</span>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
