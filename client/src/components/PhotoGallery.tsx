import { Link } from 'wouter';
import { getPhotos } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useModal } from '@/context/ModalContext';
import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import type { Photo } from '@shared/schema';

export default function PhotoGallery() {
  const { data: photos, isLoading, error } = useQuery({
    queryKey: ['/api/photos'],
    queryFn: getPhotos
  });
  
  const { isPaid } = useAuth();
  const { openModal } = useModal();

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-display font-semibold">Photos</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="aspect-square rounded-xl bg-dark-card animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-display font-semibold">Photos</h2>
        </div>
        <div className="bg-dark-card rounded-xl p-6 text-center">
          <p className="text-light-dimmed">Failed to load photos. Please try again later.</p>
        </div>
      </div>
    );
  }

  // Filter out premium photos for display in the limited gallery
  const displayPhotos = photos?.filter(photo => !photo.isPremium || isPaid).slice(0, 4);
  const hasPremiumPhotos = photos?.some(photo => photo.isPremium);
  
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-display font-semibold">Photos</h2>
        <Link href="/photos" className="text-primary text-sm flex items-center">
          View All <i className="ri-arrow-right-line ml-1"></i>
        </Link>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayPhotos?.map((photo) => (
          <PhotoItem key={photo.id} photo={photo} />
        ))}
      </div>
      
      {hasPremiumPhotos && !isPaid && (
        <div className="mt-6 bg-dark-card rounded-xl p-6 border border-primary border-opacity-30">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">Unlock Premium Photos</h3>
              <p className="text-light-dimmed mb-4 md:mb-0">
                Subscribe to access all exclusive photos and premium content.
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
    </div>
  );
}

type PhotoItemProps = {
  photo: Photo;
};

function PhotoItem({ photo }: PhotoItemProps) {
  const [liked, setLiked] = useState(false);
  
  const handleLike = () => {
    setLiked(!liked);
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="image-gallery-item aspect-square rounded-xl overflow-hidden relative group cursor-pointer">
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
      </DialogTrigger>
      <DialogContent className="p-0 max-w-3xl bg-dark-card">
        <div className="relative">
          <img 
            src={photo.imageUrl} 
            alt={photo.title} 
            className="w-full h-auto object-contain max-h-[80vh]" 
          />
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
            <h2 className="text-white text-lg font-semibold">{photo.title}</h2>
            {photo.description && (
              <p className="text-light-dimmed text-sm mt-1">{photo.description}</p>
            )}
          </div>
        </div>
        <div className="p-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button 
              className={`${liked ? 'text-primary' : 'text-light-dimmed hover:text-primary'} transition`}
              onClick={handleLike}
              aria-label={liked ? "Unlike" : "Like"}
            >
              <i className={`${liked ? 'ri-heart-fill' : 'ri-heart-line'} text-xl`}></i>
            </button>
            <span className="text-light-dimmed">
              {liked ? (photo.likes || 0) + 1 : (photo.likes || 0)} likes
            </span>
          </div>
          <button
            className="text-light-dimmed hover:text-light transition"
            onClick={() => {}}
            aria-label="Download"
          >
            <i className="ri-download-line text-xl"></i>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
