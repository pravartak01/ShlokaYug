/**
 * VideosPage - YouTube-like Video Platform
 * Modern design with vintage colors, proper navbar, and vertical shorts
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Compass,
  Clapperboard,
  Play,
  Plus,
  Search,
  Grid3X3,
  LayoutGrid,
  Eye,
  Heart,
  Film,
  Zap,
  RefreshCw,
  ChevronRight,
  Upload,
  Settings,
  BarChart3,
  VideoIcon,
  Sparkles,
  Home,
  BookOpen,
  User,
  LogOut,
  Bell,
  X,
  TrendingUp,
  Clock,
  Flame,
  ChevronLeft,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import {
  getVideoFeed,
  getMyVideos,
  searchVideos,
  type Video,
  type VideoStats,
  type VideoFeedParams,
  VIDEO_TYPES,
  formatViewCount,
} from '../services/videoService';
import { VideoCard, StatsCard, CategoryFilter, ShortsPlayer } from '../components/videos';

// Helper function to get title text (handles object format)
const getTitleText = (title: unknown): string => {
  if (!title) return 'Untitled';
  if (typeof title === 'string') return title;
  if (typeof title === 'object' && title !== null && 'text' in title) {
    return String((title as { text?: string }).text || 'Untitled');
  }
  return String(title);
};

// Types
type TabMode = 'discover' | 'studio';
type VideoFilter = 'all' | 'video' | 'short';
type FeedType = 'trending' | 'popular' | 'recent';
type ViewMode = 'grid' | 'list';

const VideosPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // State
  const [activeTab, setActiveTab] = useState<TabMode>(() => 
    (searchParams.get('tab') as TabMode) || 'discover'
  );
  const [videos, setVideos] = useState<Video[]>([]);
  const [myVideos, setMyVideos] = useState<Video[]>([]);
  const [myStats, setMyStats] = useState<VideoStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [videoFilter, setVideoFilter] = useState<VideoFilter>('all');
  const [feedType, setFeedType] = useState<FeedType>('trending');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Shorts player state
  const [showShortsPlayer, setShowShortsPlayer] = useState(false);
  const [selectedShortIndex, setSelectedShortIndex] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Fetch videos based on current filters
  const fetchVideos = useCallback(async (reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
      }

      const params: VideoFeedParams = {
        page: reset ? 1 : page,
        limit: 12,
        type: videoFilter === 'all' ? undefined : videoFilter,
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        feedType: feedType,
      };

      let response;
      if (searchQuery.trim()) {
        response = await searchVideos({
          query: searchQuery,
          ...params,
        });
      } else {
        response = await getVideoFeed(params);
      }

      if (reset) {
        setVideos(response.data.videos);
      } else {
        setVideos((prev) => [...prev, ...response.data.videos]);
      }

      setHasMore(response.data.pagination.page < response.data.pagination.pages);
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, videoFilter, selectedCategory, feedType, searchQuery]);

  // Fetch user's videos for Studio tab
  const fetchMyVideos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getMyVideos({
        type: videoFilter === 'all' ? undefined : videoFilter,
      });
      setMyVideos(response.data.videos);
      setMyStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch my videos:', error);
    } finally {
      setLoading(false);
    }
  }, [videoFilter]);

  // Effects
  useEffect(() => {
    if (activeTab === 'discover') {
      fetchVideos(true);
    } else {
      fetchMyVideos();
    }
  }, [activeTab, selectedCategory, videoFilter, feedType, fetchVideos, fetchMyVideos]);

  useEffect(() => {
    setSearchParams({ tab: activeTab });
  }, [activeTab, setSearchParams]);

  // Handlers
  const handleRefresh = async () => {
    setRefreshing(true);
    if (activeTab === 'discover') {
      await fetchVideos(true);
    } else {
      await fetchMyVideos();
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVideos(true);
  };

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      setPage((prev) => prev + 1);
      fetchVideos(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Open shorts player
  const openShortsPlayer = (index: number) => {
    setSelectedShortIndex(index);
    setShowShortsPlayer(true);
  };

  // Separate videos and shorts
  const regularVideos = videos.filter((v) => v.type === 'video');
  const shorts = videos.filter((v) => v.type === 'short');
  const myRegularVideos = myVideos.filter((v) => v.type === 'video');
  const myShorts = myVideos.filter((v) => v.type === 'short');

  // Render YouTube-like Navbar
  const renderNavbar = () => (
    <header className="bg-[#FFFEF7] border-b border-[#D4C5A9] sticky top-0 z-40 shadow-sm">
      <div className="max-w-[1800px] mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo & Home */}
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-[#C9463D] to-[#D4A853] rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                <span className="text-white text-xl font-bold">स</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-[#2C2416] font-samarkan">SVARAM</h1>
                <p className="text-[10px] text-[#6B5D4F] -mt-1">Video Platform</p>
              </div>
            </Link>

            {/* Home Button */}
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#F5F1E8] hover:bg-[#E8DCC4] text-[#644A07] font-medium transition-colors"
            >
              <Home className="w-5 h-5" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </div>

          {/* Center: Search Bar */}
          <div className="flex-1 max-w-2xl mx-4 hidden md:block">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search videos, shorts, creators..."
                className="w-full pl-5 pr-12 py-2.5 rounded-full bg-[#F5F1E8] border border-[#D4C5A9] focus:border-[#C9463D] focus:ring-2 focus:ring-[#C9463D]/20 outline-none text-[#2C2416] placeholder:text-[#6B5D4F] transition-all"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 p-2 bg-[#644A07] hover:bg-[#4A3605] text-white rounded-full transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Right: Actions & Profile */}
          <div className="flex items-center gap-2">
            {/* Mobile Search */}
            <button
              onClick={() => setShowSearchInput(!showSearchInput)}
              className="md:hidden p-2 hover:bg-[#F5F1E8] rounded-full transition-colors"
            >
              <Search className="w-5 h-5 text-[#644A07]" />
            </button>

            {/* Upload Button */}
            <motion.button
              onClick={() => navigate('/videos/upload')}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#C9463D] to-[#B33D35] text-white rounded-full font-medium shadow-md hover:shadow-lg transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Upload</span>
            </motion.button>

            {/* Refresh */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2.5 hover:bg-[#F5F1E8] rounded-full transition-colors"
            >
              <RefreshCw className={`w-5 h-5 text-[#644A07] ${refreshing ? 'animate-spin' : ''}`} />
            </button>

            {/* Notifications */}
            <button className="p-2.5 hover:bg-[#F5F1E8] rounded-full transition-colors relative">
              <Bell className="w-5 h-5 text-[#644A07]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#C9463D] rounded-full" />
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-[#F5F1E8] transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#D4A853] to-[#C9463D] flex items-center justify-center overflow-hidden ring-2 ring-[#D4C5A9]">
                  {user?.profile?.avatar ? (
                    <img src={user.profile.avatar} alt={user.profile?.firstName || 'User'} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>
              </button>

              {/* Dropdown */}
              <AnimatePresence>
                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                    <motion.div
                      className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-[#D4C5A9] py-2 z-50"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <div className="px-4 py-3 border-b border-[#E8DCC4]">
                        <p className="font-semibold text-[#2C2416]">{user?.profile?.firstName ? `${user.profile.firstName} ${user.profile.lastName || ''}`.trim() : 'User'}</p>
                        <p className="text-sm text-[#6B5D4F]">{user?.email}</p>
                      </div>
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F5F1E8] text-[#2C2416] transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Home className="w-5 h-5 text-[#644A07]" />
                        Dashboard
                      </Link>
                      <Link
                        to="/learn"
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#F5F1E8] text-[#2C2416] transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <BookOpen className="w-5 h-5 text-[#644A07]" />
                        Learn
                      </Link>
                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          setActiveTab('studio');
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-[#F5F1E8] text-[#2C2416] transition-colors"
                      >
                        <Clapperboard className="w-5 h-5 text-[#644A07]" />
                        Your Studio
                      </button>
                      <div className="border-t border-[#E8DCC4] mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-red-600 transition-colors"
                        >
                          <LogOut className="w-5 h-5" />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <AnimatePresence>
          {showSearchInput && (
            <motion.div
              className="md:hidden pb-3"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-4 pr-10 py-2.5 rounded-full bg-[#F5F1E8] border border-[#D4C5A9] focus:border-[#C9463D] outline-none text-[#2C2416]"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowSearchInput(false)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B5D4F]"
                >
                  <X className="w-5 h-5" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );

  // Render Tab Bar
  const renderTabBar = () => (
    <div className="bg-[#FFFEF7] border-b border-[#D4C5A9] sticky top-16 z-30">
      <div className="max-w-[1800px] mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between py-3 overflow-x-auto scrollbar-hide">
          {/* Left: Tabs */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('discover')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all whitespace-nowrap ${
                activeTab === 'discover'
                  ? 'bg-[#2C2416] text-white shadow-md'
                  : 'bg-[#F5F1E8] text-[#2C2416] hover:bg-[#E8DCC4]'
              }`}
            >
              <Compass className="w-4 h-4" />
              Discover
            </button>
            <button
              onClick={() => setActiveTab('studio')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all whitespace-nowrap ${
                activeTab === 'studio'
                  ? 'bg-[#2C2416] text-white shadow-md'
                  : 'bg-[#F5F1E8] text-[#2C2416] hover:bg-[#E8DCC4]'
              }`}
            >
              <Clapperboard className="w-4 h-4" />
              Your Studio
            </button>

            <div className="h-6 w-px bg-[#D4C5A9] mx-2" />

            {/* Feed Type Pills */}
            {activeTab === 'discover' && (
              <>
                <button
                  onClick={() => setFeedType('trending')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    feedType === 'trending'
                      ? 'bg-[#C9463D] text-white'
                      : 'bg-[#FAF0DC] text-[#644A07] hover:bg-[#F4E4C1]'
                  }`}
                >
                  <Flame className="w-4 h-4" />
                  Trending
                </button>
                <button
                  onClick={() => setFeedType('popular')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    feedType === 'popular'
                      ? 'bg-[#C9463D] text-white'
                      : 'bg-[#FAF0DC] text-[#644A07] hover:bg-[#F4E4C1]'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  Popular
                </button>
                <button
                  onClick={() => setFeedType('recent')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                    feedType === 'recent'
                      ? 'bg-[#C9463D] text-white'
                      : 'bg-[#FAF0DC] text-[#644A07] hover:bg-[#F4E4C1]'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  New
                </button>
              </>
            )}
          </div>

          {/* Right: Filters */}
          <div className="flex items-center gap-2">
            {/* Video Type Filter */}
            <div className="flex items-center bg-[#F5F1E8] rounded-full p-1">
              {VIDEO_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setVideoFilter(type.id as VideoFilter)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    videoFilter === type.id
                      ? 'bg-[#D4A853] text-[#2C2416] shadow-sm'
                      : 'text-[#6B5D4F] hover:text-[#2C2416]'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>

            {/* View Mode */}
            <div className="hidden sm:flex items-center bg-[#F5F1E8] rounded-full p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-full transition-all ${
                  viewMode === 'grid' ? 'bg-[#D4A853] text-[#2C2416]' : 'text-[#6B5D4F]'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-full transition-all ${
                  viewMode === 'list' ? 'bg-[#D4A853] text-[#2C2416]' : 'text-[#6B5D4F]'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Render Shorts Section - YouTube Style
  const renderShortsSection = (shortsData: Video[], title: string = 'Shorts') => {
    if (shortsData.length === 0) return null;

    return (
      <section className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#FF6B6B] to-[#FFE66D] rounded-xl flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#2C2416]">{title}</h2>
              <p className="text-sm text-[#6B5D4F]">Quick vertical videos</p>
            </div>
          </div>
          <button className="flex items-center gap-1 text-[#C9463D] font-semibold text-sm hover:underline">
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Horizontal Scroll Container for Shorts */}
        <div className="relative group">
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
            {shortsData.map((short, index) => (
              <motion.div
                key={short._id}
                className="flex-shrink-0 snap-start cursor-pointer"
                whileHover={{ scale: 1.02 }}
                onClick={() => openShortsPlayer(index)}
              >
                <div className="relative w-[200px] h-[356px] rounded-2xl overflow-hidden bg-gradient-to-br from-[#2C2416] to-[#644A07] shadow-lg hover:shadow-xl transition-shadow">
                  {/* Thumbnail */}
                  <img
                    src={short.thumbnailUrl || short.video?.thumbnail?.url || '/api/placeholder/200/356'}
                    alt={getTitleText(short.title)}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
                  
                  {/* Shorts Badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 bg-gradient-to-r from-[#FF6B6B] to-[#FFE66D] text-white text-[10px] font-bold rounded-full flex items-center gap-1">
                      <Play className="w-2.5 h-2.5" fill="white" />
                      SHORTS
                    </span>
                  </div>

                  {/* Play Icon */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                      <Play className="w-8 h-8 text-white ml-1" fill="white" />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="absolute right-2 bottom-20 flex flex-col items-center gap-2">
                    <div className="flex flex-col items-center">
                      <Heart className="w-5 h-5 text-white" />
                      <span className="text-white text-[10px]">
                        {formatViewCount(typeof short.stats?.likes === 'object' ? (short.stats?.likes as { count?: number })?.count || 0 : short.stats?.likes || 0)}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-semibold text-sm line-clamp-2 mb-1">
                      {getTitleText(short.title)}
                    </p>
                    <p className="text-white/70 text-xs">
                      {formatViewCount(typeof short.stats?.views === 'object' ? (short.stats?.views as { count?: number })?.count || 0 : short.stats?.views || 0)} views
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Scroll Buttons */}
          <button className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 shadow-lg rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white -translate-x-1/2">
            <ChevronLeft className="w-5 h-5 text-[#2C2416]" />
          </button>
          <button className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 shadow-lg rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white translate-x-1/2">
            <ChevronRight className="w-5 h-5 text-[#2C2416]" />
          </button>
        </div>
      </section>
    );
  };

  // Render Discover Tab
  const renderDiscoverTab = () => (
    <div className="max-w-[1800px] mx-auto px-4 lg:px-6 py-6 space-y-6">
      {/* Category Filter */}
      <CategoryFilter selected={selectedCategory} onChange={setSelectedCategory} />

      {/* Loading State */}
      {loading && videos.length === 0 ? (
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-[#D4A853]/30 border-t-[#C9463D] rounded-full animate-spin" />
            <p className="text-[#6B5D4F] font-medium">Loading amazing videos...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Shorts Section */}
          {(videoFilter === 'all' || videoFilter === 'short') && shorts.length > 0 && (
            renderShortsSection(shorts)
          )}

          {/* Videos Section */}
          {(videoFilter === 'all' || videoFilter === 'video') && regularVideos.length > 0 && (
            <section className="space-y-5">
              {videoFilter === 'all' && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#C9463D] rounded-xl flex items-center justify-center">
                      <Film className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-[#2C2416]">Videos</h2>
                      <p className="text-sm text-[#6B5D4F]">Long-form content</p>
                    </div>
                  </div>
                  <button className="flex items-center gap-1 text-[#C9463D] font-semibold text-sm hover:underline">
                    View All <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6'
                    : 'space-y-4'
                }
              >
                {regularVideos.map((video) => (
                  <VideoCard
                    key={video._id}
                    video={video}
                    variant={viewMode === 'list' ? 'horizontal' : 'default'}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Empty State */}
          {videos.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-32 h-32 bg-[#FAF0DC] rounded-full flex items-center justify-center mb-6">
                <VideoIcon className="w-16 h-16 text-[#D4A853]" />
              </div>
              <h3 className="text-2xl font-bold text-[#2C2416] mb-3">No Videos Found</h3>
              <p className="text-[#6B5D4F] text-center max-w-md">
                {searchQuery
                  ? `No videos match your search "${searchQuery}"`
                  : 'There are no videos in this category yet. Be the first to upload!'}
              </p>
              <button
                onClick={() => navigate('/videos/upload')}
                className="mt-6 flex items-center gap-2 px-6 py-3 bg-[#C9463D] text-white rounded-full font-semibold hover:bg-[#B33D35] transition-colors"
              >
                <Upload className="w-5 h-5" />
                Upload Video
              </button>
            </div>
          )}

          {/* Load More */}
          {hasMore && videos.length > 0 && (
            <div className="flex justify-center pt-8">
              <motion.button
                onClick={handleLoadMore}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 bg-[#2C2416] text-white rounded-full font-semibold hover:bg-[#3D3526] transition-colors disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Load More
                    <ChevronRight className="w-5 h-5" />
                  </>
                )}
              </motion.button>
            </div>
          )}
        </>
      )}
    </div>
  );

  // Render Studio Tab
  const renderStudioTab = () => (
    <div className="max-w-[1800px] mx-auto px-4 lg:px-6 py-6 space-y-8">
      {/* Welcome Banner */}
      <motion.div
        className="relative bg-gradient-to-r from-[#2C2416] via-[#4A3605] to-[#2C2416] rounded-3xl p-8 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4A853] rounded-full blur-[150px] opacity-20" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#C9463D] rounded-full blur-[120px] opacity-20" />
        </div>

        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-3">
              Welcome to Your Studio, {user?.profile?.firstName || 'Creator'}! ✨
            </h2>
            <p className="text-[#D4A853] max-w-lg text-lg">
              Create and share your knowledge with the world. Upload videos, track your performance, and grow your audience.
            </p>
          </div>

          <motion.button
            onClick={() => navigate('/videos/upload')}
            className="flex items-center gap-4 px-8 py-5 bg-white text-[#2C2416] rounded-2xl font-semibold shadow-2xl hover:shadow-3xl transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-14 h-14 bg-gradient-to-br from-[#C9463D] to-[#D4A853] rounded-xl flex items-center justify-center">
              <Upload className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <p className="font-bold text-lg">Upload Video</p>
              <p className="text-sm text-[#6B5D4F]">Share your content</p>
            </div>
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={Eye}
          label="Total Views"
          value={formatViewCount(myStats?.totalViews || 0)}
          color="blue"
        />
        <StatsCard
          icon={Heart}
          label="Total Likes"
          value={formatViewCount(myStats?.totalLikes || 0)}
          color="red"
        />
        <StatsCard
          icon={Film}
          label="Videos"
          value={myStats?.totalVideos || 0}
          color="purple"
        />
        <StatsCard
          icon={Zap}
          label="Shorts"
          value={myStats?.totalShorts || 0}
          color="gold"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <motion.button
          onClick={() => navigate('/videos/upload')}
          className="flex flex-col items-center gap-4 p-6 bg-white rounded-2xl border-2 border-[#E8DCC4] hover:border-[#C9463D] hover:shadow-xl transition-all"
          whileHover={{ y: -4 }}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-[#C9463D] to-[#FF6B6B] rounded-2xl flex items-center justify-center shadow-lg">
            <Plus className="w-8 h-8 text-white" />
          </div>
          <span className="font-bold text-[#2C2416]">Upload Video</span>
        </motion.button>

        <motion.button
          onClick={() => navigate('/videos/upload?type=short')}
          className="flex flex-col items-center gap-4 p-6 bg-white rounded-2xl border-2 border-[#E8DCC4] hover:border-[#FFE66D] hover:shadow-xl transition-all"
          whileHover={{ y: -4 }}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-[#FFE66D] to-[#FF6B6B] rounded-2xl flex items-center justify-center shadow-lg">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <span className="font-bold text-[#2C2416]">Create Short</span>
        </motion.button>

        <motion.button
          className="flex flex-col items-center gap-4 p-6 bg-white rounded-2xl border-2 border-[#E8DCC4] hover:border-[#4A90D9] hover:shadow-xl transition-all"
          whileHover={{ y: -4 }}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-[#4A90D9] to-[#6366F1] rounded-2xl flex items-center justify-center shadow-lg">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <span className="font-bold text-[#2C2416]">Analytics</span>
        </motion.button>

        <motion.button
          className="flex flex-col items-center gap-4 p-6 bg-white rounded-2xl border-2 border-[#E8DCC4] hover:border-[#10B981] hover:shadow-xl transition-all"
          whileHover={{ y: -4 }}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-[#10B981] to-[#059669] rounded-2xl flex items-center justify-center shadow-lg">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <span className="font-bold text-[#2C2416]">Settings</span>
        </motion.button>
      </div>

      {/* Content Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#2C2416]">Your Content</h2>
        <div className="flex items-center gap-2 bg-[#F5F1E8] rounded-full p-1">
          {VIDEO_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setVideoFilter(type.id as VideoFilter)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                videoFilter === type.id
                  ? 'bg-[#2C2416] text-white'
                  : 'text-[#6B5D4F] hover:text-[#2C2416]'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 border-4 border-[#D4A853]/30 border-t-[#C9463D] rounded-full animate-spin" />
            <p className="text-[#6B5D4F] font-medium">Loading your content...</p>
          </div>
        </div>
      ) : myVideos.length === 0 ? (
        /* Empty State */
        <motion.div
          className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-[#D4C5A9]"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-32 h-32 bg-[#FAF0DC] rounded-full flex items-center justify-center mb-6">
            <Sparkles className="w-16 h-16 text-[#D4A853]" />
          </div>
          <h3 className="text-2xl font-bold text-[#2C2416] mb-3">Start Your Journey</h3>
          <p className="text-[#6B5D4F] text-center max-w-md mb-8">
            You haven't uploaded any videos yet. Share your knowledge and wisdom with the world!
          </p>
          <motion.button
            onClick={() => navigate('/videos/upload')}
            className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#C9463D] to-[#D4A853] text-white rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Upload className="w-6 h-6" />
            Upload Your First Video
          </motion.button>
        </motion.div>
      ) : (
        <>
          {/* My Shorts */}
          {(videoFilter === 'all' || videoFilter === 'short') && myShorts.length > 0 && (
            renderShortsSection(myShorts, `Your Shorts (${myShorts.length})`)
          )}

          {/* My Videos */}
          {(videoFilter === 'all' || videoFilter === 'video') && myRegularVideos.length > 0 && (
            <section className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#C9463D] rounded-xl flex items-center justify-center">
                  <Film className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#2C2416]">
                  Your Videos ({myRegularVideos.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                {myRegularVideos.map((video) => (
                  <VideoCard key={video._id} video={video} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F1E8]">
      {/* Navbar */}
      {renderNavbar()}

      {/* Tab Bar */}
      {renderTabBar()}

      {/* Main Content */}
      <main>
        <AnimatePresence mode="wait">
          {activeTab === 'discover' ? (
            <motion.div
              key="discover"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderDiscoverTab()}
            </motion.div>
          ) : (
            <motion.div
              key="studio"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderStudioTab()}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Shorts Player Modal */}
      {showShortsPlayer && (
        <ShortsPlayer
          shorts={shorts}
          initialIndex={selectedShortIndex}
          onClose={() => setShowShortsPlayer(false)}
        />
      )}
    </div>
  );
};

export default VideosPage;
