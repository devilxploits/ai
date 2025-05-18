import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPosts } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

export default function PostsPage() {
  const { user, isPaid } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  
  // Fetch posts
  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['/api/posts'],
    queryFn: () => getPosts()
  });
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-4">Posts</h1>
        <div className="text-center py-8">Loading posts...</div>
      </div>
    );
  }
  
  if (error || !posts) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold mb-4">Posts</h1>
        <div className="text-center py-8 text-red-500">
          Error loading posts. Please try again later.
        </div>
      </div>
    );
  }
  
  // Filter posts based on active tab
  const filteredPosts = activeTab === 'premium' 
    ? posts.filter(post => post.isPremium)
    : posts;
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Posts</h1>
      
      <Tabs 
        defaultValue="all" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="mb-6"
      >
        <TabsList className="w-full flex flex-wrap gap-1 mb-4">
          <TabsTrigger className="flex-1" value="all">All Posts</TabsTrigger>
          <TabsTrigger 
            className="flex-1" 
            value="premium"
            disabled={!isPaid}
          >
            Premium Posts {!isPaid && "🔒"}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          {filteredPosts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No posts available
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative">
                      {post.isPremium && (
                        <span className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full z-10">
                          Premium
                        </span>
                      )}
                      {post.imageUrl && (
                        <img 
                          src={post.imageUrl} 
                          alt={post.title} 
                          className="w-full h-48 object-cover"
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                      <p className="text-gray-600">{post.content}</p>
                      <div className="mt-4 text-sm text-gray-500">
                        {post.timestamp ? new Date(post.timestamp).toLocaleDateString() : ""}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="premium" className="space-y-4">
          {!isPaid ? (
            <div className="text-center py-8">
              <p className="text-xl mb-4">🔒 Premium Content</p>
              <p className="mb-4">Subscribe to access premium posts</p>
              <a 
                href="/subscription" 
                className="inline-block bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-full hover:opacity-90 transition-opacity"
              >
                View Subscription Plans
              </a>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No premium posts available
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="relative">
                      <span className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full z-10">
                        Premium
                      </span>
                      {post.imageUrl && (
                        <img 
                          src={post.imageUrl} 
                          alt={post.title} 
                          className="w-full h-48 object-cover"
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                      <p className="text-gray-600">{post.content}</p>
                      <div className="mt-4 text-sm text-gray-500">
                        {post.timestamp ? new Date(post.timestamp).toLocaleDateString() : ""}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}