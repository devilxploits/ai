import { useState } from "react";
import { getPhotos } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useModal } from "@/context/ModalContext";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Helmet } from "react-helmet";
import { Photo } from "@shared/schema";

export default function PhotosPage() {
  const { data: photos, isLoading, error } = useQuery({
    queryKey: ['/api/photos'],
    queryFn: getPhotos
  });
  
  const { isPaid } = useAuth();
  const { openModal } = useModal();
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  // Filter photos based on user subscription
  const publicPhotos = photos?.filter(photo => !photo.isPremium) || [];
  const premiumPhotos = photos?.filter(photo => photo.isPremium) || [];

  // Handle photo click
  const handlePhotoClick = (photo: Photo) => {
    if (photo.isPremium && !isPaid) {
      openModal('payment');
    } else {
      setSelectedPhoto(photo);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6">
        <h1 className="text-2xl font-display font-semibold mb-6">Sophia's Photos</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[...Array(10)].map((_, index) => (
            <div 
              key={index} 
              className="aspect-square rounded-xl bg-dark-card animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6">
        <h1 className="text-2xl font-display font-semibold mb-6">Sophia's Photos</h1>
        <div className="bg-dark-card rounded-xl p-6 text-center">
          <p className="text-light-dimmed">Failed to load photos. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Sophia's Photos | AI Companion Gallery</title>
        <meta name="description" content="Browse through Sophia's exclusive photo gallery. Subscribe to unlock premium content and see more intimate photos of your AI companion." />
      </Helmet>
      
      <div className="p-4 md:p-6">
        <h1 className="text-2xl font-display font-semibold mb-6">Sophia's Photos</h1>
        
        {/* Public Photos Section */}
        {publicPhotos.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Public Photos</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {publicPhotos.map((photo) => (
                <div 
                  key={photo.id}
                  className="image-gallery-item aspect-square rounded-xl overflow-hidden relative group cursor-pointer"
                  onClick={() => handlePhotoClick(photo)}
                >
                  <img 
                    src={photo.imageUrl} 
                    alt={photo.title} 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                    <div className="p-3 w-full">
                      <div className="flex justify-between items-center">
                        <span className="text-white text-sm">{photo.title}</span>
                        <span className="flex items-center text-white text-sm">
                          <i className="ri-heart-line mr-1"></i> {photo.likes}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Premium Photos Section */}
        {premiumPhotos.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Premium Photos</h2>
            
            {!isPaid && (
              <div className="mb-4 bg-dark-card rounded-xl p-6 border border-primary border-opacity-30">
                <div className="flex flex-col md:flex-row items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Unlock Premium Photos</h3>
                    <p className="text-light-dimmed mb-4 md:mb-0">
                      Subscribe to access all exclusive premium photos.
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
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {premiumPhotos.map((photo) => (
                <div 
                  key={photo.id}
                  className={`image-gallery-item aspect-square rounded-xl overflow-hidden relative group cursor-pointer ${!isPaid ? 'opacity-70' : ''}`}
                  onClick={() => handlePhotoClick(photo)}
                >
                  <img 
                    src={photo.imageUrl} 
                    alt={photo.title} 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                    <div className="p-3 w-full">
                      <div className="flex justify-between items-center">
                        <span className="text-white text-sm">{photo.title}</span>
                        <span className="flex items-center text-white text-sm">
                          <i className="ri-heart-line mr-1"></i> {photo.likes}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {!isPaid && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                      <div className="bg-primary rounded-full p-2">
                        <i className="ri-lock-line text-white text-xl"></i>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Photo Viewer Dialog */}
        <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
          <DialogContent className="p-0 max-w-3xl bg-dark-card">
            {selectedPhoto && (
              <>
                <div className="relative">
                  <img 
                    src={selectedPhoto.imageUrl} 
                    alt={selectedPhoto.title} 
                    className="w-full h-auto object-contain max-h-[80vh]" 
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                    <h2 className="text-white text-lg font-semibold">{selectedPhoto.title}</h2>
                    {selectedPhoto.description && (
                      <p className="text-light-dimmed text-sm mt-1">{selectedPhoto.description}</p>
                    )}
                  </div>
                </div>
                <div className="p-4 flex justify-between items-center">
                  <div className="flex items-center space-x-4">
                    <button 
                      className="text-light-dimmed hover:text-primary transition"
                      aria-label="Like"
                    >
                      <i className="ri-heart-line text-xl"></i>
                    </button>
                    <span className="text-light-dimmed">
                      {selectedPhoto.likes} likes
                    </span>
                  </div>
                  <button
                    className="text-light-dimmed hover:text-light transition"
                    aria-label="Download"
                  >
                    <i className="ri-download-line text-xl"></i>
                  </button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
