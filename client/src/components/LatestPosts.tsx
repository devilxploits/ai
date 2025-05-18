import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { getPosts } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import type { Post } from '@shared/schema';
import { formatDistanceToNow } from 'date-fns';

export default function LatestPosts() {
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['/api/posts'],
    queryFn: () => getPosts(3, 0)
  });

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-display font-semibold">Latest Posts</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="post-card bg-dark-card rounded-xl overflow-hidden animate-pulse">
              <div className="h-48 bg-dark-lighter"></div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-4 bg-dark-lighter rounded w-1/3"></div>
                  <div className="flex items-center space-x-3">
                    <div className="h-4 bg-dark-lighter rounded w-12"></div>
                    <div className="h-4 bg-dark-lighter rounded w-12"></div>
                  </div>
                </div>
                <div className="h-4 bg-dark-lighter rounded w-full mb-2"></div>
                <div className="h-4 bg-dark-lighter rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-display font-semibold">Latest Posts</h2>
        </div>
        <div className="bg-dark-card rounded-xl p-6 text-center">
          <p className="text-light-dimmed">Failed to load posts. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-display font-semibold">Latest Posts</h2>
        <Link href="/posts">
          <a className="text-primary text-sm flex items-center">
            View All <i className="ri-arrow-right-line ml-1"></i>
          </a>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts?.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}

type PostCardProps = {
  post: Post;
};

function PostCard({ post }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  
  const handleLike = () => {
    setLiked(!liked);
  };
  
  return (
    <div className="post-card bg-dark-card rounded-xl overflow-hidden">
      {/* Post image */}
      <div className="h-48 overflow-hidden">
        <img 
          src={post.imageUrl} 
          alt={post.title} 
          className="w-full h-full object-cover" 
        />
      </div>
      
      {/* Post content */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-light-dimmed text-sm">
            {post.timestamp ? formatDistanceToNow(new Date(post.timestamp), { addSuffix: true }) : 'Recently'}
          </span>
          <div className="flex items-center space-x-3">
            <span className="flex items-center text-light-dimmed text-sm">
              <i className="ri-heart-line mr-1"></i> {post.likes}
            </span>
            <span className="flex items-center text-light-dimmed text-sm">
              <i className="ri-chat-1-line mr-1"></i> {post.comments}
            </span>
          </div>
        </div>
        <p className="text-light">{post.content}</p>
        <div className="mt-3 flex justify-between">
          <button 
            className={`${liked ? 'text-primary' : 'text-light-dimmed hover:text-primary'} transition`}
            onClick={handleLike}
            aria-label={liked ? "Unlike" : "Like"}
          >
            <i className={`${liked ? 'ri-heart-fill' : 'ri-heart-line'} text-xl`}></i>
          </button>
          <button 
            className="text-light-dimmed hover:text-secondary transition"
            onClick={() => {}}
            aria-label="Comment"
          >
            <i className="ri-chat-1-line text-xl"></i>
          </button>
          <button 
            className="text-light-dimmed hover:text-light transition"
            onClick={() => {}}
            aria-label="Share"
          >
            <i className="ri-share-line text-xl"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
