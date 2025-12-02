import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import PostCard from '../components/community/PostCard';
import CreatePost from '../components/community/CreatePost';
import TrendingSidebar from '../components/community/TrendingSidebar';

interface Post {
  _id: string;
  author: {
    _id: string;
    username: string;
    firstName: string;
    lastName: string;
    avatar?: string;
    isVerified?: boolean;
  };
  content: {
    text: string;
    hashtags?: string[];
    media?: {
      images?: Array<{ url: string; alt?: string }>;
      video?: { _id: string; title: string; thumbnail?: { url: string } };
    };
  };
  metrics: {
    likes: number;
    retweets: number;
    comments: number;
    views: number;
  };
  likedBy?: Array<{ user: string }>;
  createdAt: string;
  postType: string;
}

interface SuggestedUser {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  isVerified?: boolean;
}

const CommunityPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const currentUserId = user?.id || '';
  const [error, setError] = useState<string>('');
  const [trending, setTrending] = useState<Array<{ tag: string; count: number }>>([]);
  const [suggested, setSuggested] = useState<SuggestedUser[]>([]);

  // Load all data once on mount - NO AUTH REQUIRED
  useEffect(() => {
    const loadData = async () => {
      // Load posts (public endpoint, no auth)
      try {
        setLoading(true);
        const postsRes = await api.get('/community/explore');
        if (postsRes.data?.data?.posts) {
          setPosts(postsRes.data.data.posts);
        } else {
          setPosts([]);
        }
      } catch (err) {
        console.error('Posts error:', err);
        setError('Unable to load posts');
        setPosts([]);
      } finally {
        setLoading(false);
      }

      // Load trending (public endpoint, no auth)
      try {
        const trendingRes = await api.get('/community/trending/hashtags');
        if (trendingRes.data?.data?.hashtags) {
          setTrending(trendingRes.data.data.hashtags.slice(0, 5));
        }
      } catch (err) {
        console.error('Trending error:', err);
      }
    };

    loadData();
  }, []);

  // No longer needed - posts loaded on mount only

  const handleCreatePost = async (text: string, images: File[]) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('text', text);
      formData.append('visibility', 'public');
      images.forEach((img) => formData.append('images', img));

      await api.post('/community/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Reload posts
      const res = await api.get('/community/explore');
      setPosts(res.data?.data?.posts || []);
      setError('');
    } catch (err) {
      console.error('Post error:', err);
      setError('Failed to create post.');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await api.post(`/community/posts/${postId}/like`);
      setPosts(posts.map(p => {
        if (p._id === postId) {
          const isLiked = p.likedBy?.some(like => like.user === currentUserId);
          return {
            ...p,
            metrics: { ...p.metrics, likes: isLiked ? p.metrics.likes - 1 : p.metrics.likes + 1 },
            likedBy: isLiked 
              ? p.likedBy?.filter(like => like.user !== currentUserId)
              : [...(p.likedBy || []), { user: currentUserId }]
          };
        }
        return p;
      }));
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleFollow = async (username: string) => {
    try {
      await api.post(`/community/users/${username}/follow`);
      const res = await api.get('/community/suggestions/follow');
      setSuggested(res.data?.data?.suggestions || []);
    } catch (err) {
      console.error('Follow error:', err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      <nav className="bg-[#FFFEF7] shadow-sm border-b border-[#D4C5A9] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-[#644A07] flex items-center space-x-2">
                <span className="text-3xl">🕉️</span>
                <span>ShlokaYug Community</span>
              </h1>
              <div className="hidden md:flex space-x-2">
                <button onClick={() => navigate('/dashboard')} className="px-4 py-2 rounded-lg text-[#2C2416] hover:bg-[#F5F1E8] transition-colors">Dashboard</button>
                <button onClick={() => navigate('/learn')} className="px-4 py-2 rounded-lg text-[#2C2416] hover:bg-[#F5F1E8] transition-colors">Learn</button>
                <button onClick={() => navigate('/videos')} className="px-4 py-2 rounded-lg text-[#2C2416] hover:bg-[#F5F1E8] transition-colors">Videos</button>
                <button className="px-4 py-2 rounded-lg bg-[#644A07] text-white font-semibold shadow-md">Community</button>
              </div>
            </div>
            
            {/* User info */}
            {user && (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#644A07] rounded-full flex items-center justify-center text-white font-bold">
                  {user.profile?.firstName?.[0] || user.username?.[0] || 'U'}
                </div>
                <div className="hidden sm:block">
                  <p className="font-semibold text-[#2C2416]">{user.profile?.firstName || user.username}</p>
                  <p className="text-xs text-[#6B5D4F]">@{user.username}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24">
              <TrendingSidebar trendingTopics={trending} suggestedUsers={suggested} onFollowUser={handleFollow} />
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="bg-[#FFFEF7] rounded-xl shadow-md mb-6 border border-[#D4C5A9] p-6">
              <h2 className="text-2xl font-bold text-[#644A07] text-center">Explore Community</h2>
              <p className="text-[#6B5D4F] text-center mt-2">Discover posts from the Sanskrit learning community</p>
            </div>

            <div className="mb-6">
              <CreatePost onSubmit={handleCreatePost} />
            </div>

            <div className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl shadow-md p-6 text-center">
                  <p className="text-red-700 font-semibold">{error}</p>
                </div>
              )}

              {loading ? (
                <div className="bg-[#FFFEF7] rounded-xl shadow-md p-12 text-center border border-[#D4C5A9]">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#644A07] border-t-transparent mx-auto"></div>
                  <p className="text-[#6B5D4F] mt-4 font-medium">Loading...</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="bg-[#FFFEF7] rounded-xl shadow-md p-12 text-center border border-[#D4C5A9]">
                  <p className="text-[#2C2416] text-lg font-semibold">No posts yet</p>
                  <p className="text-[#6B5D4F] text-sm mt-2">Be the first to share!</p>
                </div>
              ) : (
                posts.map((post) => <PostCard key={post._id} post={post} currentUserId={currentUserId} onLike={handleLike} />)
              )}
            </div>
          </div>

          <div className="lg:hidden">
            <TrendingSidebar trendingTopics={trending} suggestedUsers={suggested} onFollowUser={handleFollow} />
          </div>

          <div className="hidden lg:block lg:col-span-3">
            <div className="sticky top-24 space-y-6">
              <div className="bg-[#FFFEF7] rounded-xl shadow-md border border-[#D4C5A9] p-6">
                <h3 className="text-lg font-bold text-[#2C2416] mb-4">Community Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B5D4F]">Active Members</span>
                    <span className="font-bold text-[#644A07]">12.5K</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B5D4F]">Posts Today</span>
                    <span className="font-bold text-[#644A07]">847</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#6B5D4F]">Discussions</span>
                    <span className="font-bold text-[#644A07]">2.1K</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#FFFEF7] rounded-xl shadow-md border border-[#D4C5A9] p-6">
                <h3 className="text-lg font-bold text-[#2C2416] mb-4">Quick Links</h3>
                <div className="space-y-2">
                  <a href="#" className="block text-[#644A07] hover:text-[#2C2416] transition-colors">Community Guidelines</a>
                  <a href="#" className="block text-[#644A07] hover:text-[#2C2416] transition-colors">Help Center</a>
                  <a href="#" className="block text-[#644A07] hover:text-[#2C2416] transition-colors">Report Issue</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;
