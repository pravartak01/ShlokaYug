import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import videoService, { Video } from '../../services/videoService';

const { width } = Dimensions.get('window');

type TabMode = 'discover' | 'studio';
type VideoFilter = 'all' | 'videos' | 'shorts';
type FeedType = 'trending' | 'popular' | 'recent';

const CATEGORIES = [
  { id: 'all', name: 'All', icon: 'apps' },
  { id: 'sanskrit', name: 'Sanskrit', icon: 'book' },
  { id: 'chandas', name: 'Chandas', icon: 'musical-notes' },
  { id: 'spiritual', name: 'Spiritual', icon: 'flower' },
  { id: 'educational', name: 'Educational', icon: 'school' },
  { id: 'tutorials', name: 'Tutorials', icon: 'bulb' },
];

export default function VideosScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabMode>('discover');
  const [videos, setVideos] = useState<Video[]>([]);
  const [myVideos, setMyVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [videoFilter, setVideoFilter] = useState<VideoFilter>('all');
  const [feedType, setFeedType] = useState<FeedType>('trending');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadVideos();
  }, [feedType, selectedCategory, videoFilter]);

  useEffect(() => {
    if (activeTab === 'studio') {
      loadMyVideos();
    }
  }, [activeTab, videoFilter]);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const params: any = {
        type: feedType,
        limit: 20,
        page: 1,
      };

      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }

      const response = await videoService.getVideoFeed(params);
      let videosData = response.data?.videos || response.videos || [];

      // Filter by video type
      if (videoFilter === 'videos') {
        videosData = videosData.filter((v: Video) => v.type === 'video');
      } else if (videoFilter === 'shorts') {
        videosData = videosData.filter((v: Video) => v.type === 'short');
      }

      setVideos(videosData);
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyVideos = async () => {
    try {
      const params: any = { limit: 50, page: 1 };
      if (videoFilter !== 'all') {
        params.type = videoFilter === 'videos' ? 'video' : 'short';
      }

      const response = await videoService.getMyVideos(params);
      setMyVideos(response.data?.videos || response.videos || []);
    } catch (error) {
      console.error('Error loading my videos:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    if (activeTab === 'discover') {
      await loadVideos();
    } else {
      await loadMyVideos();
    }
    setRefreshing(false);
  };

  const formatViews = (views: number): string => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimeAgo = (date: string): string => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    const diffMonths = Math.floor(diffDays / 30);
    const diffYears = Math.floor(diffDays / 365);

    if (diffYears > 0) return `${diffYears}y ago`;
    if (diffMonths > 0) return `${diffMonths}mo ago`;
    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  };

  const renderVideoCard = (video: Video) => {
    // Get thumbnail URL with fallback
    const thumbnailUrl = video.video?.thumbnail?.url || 
                         video.video?.originalFile?.url ||
                         null;
    
    return (
      <TouchableOpacity
        key={video._id}
        onPress={() => router.push(`/videos/${video._id}`)}
        className="mb-4"
      >
        {/* Thumbnail */}
        <View className="relative">
          {thumbnailUrl ? (
            <Image
              source={{ uri: thumbnailUrl }}
              className="w-full h-52 rounded-xl bg-gray-200"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-52 rounded-xl bg-[#F3E4C8] items-center justify-center">
              <Ionicons name="videocam" size={48} color="#B87333" />
              <Text className="text-[#B87333] font-medium mt-2">Video Processing</Text>
            </View>
          )}
          {/* Duration Badge */}
          <View className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded">
            <Text className="text-white text-xs font-semibold">
              {formatDuration(video.video?.duration || 0)}
            </Text>
          </View>
          {/* Short Badge */}
          {video.type === 'short' && (
            <View className="absolute top-2 left-2 bg-[#DD7A1F] px-2 py-1 rounded-full">
              <Text className="text-white text-xs font-bold">SHORT</Text>
            </View>
          )}
          {/* Draft Badge */}
          {video.status === 'draft' && (
            <View className="absolute top-2 right-2 bg-yellow-500 px-2 py-1 rounded-full">
              <Text className="text-white text-xs font-bold">DRAFT</Text>
            </View>
          )}
        </View>

        {/* Video Info */}
        <View className="flex-row mt-3 px-1">
          {/* Creator Avatar */}
          <View className="mr-3">
            {video.creator?.avatar ? (
              <Image
                source={{ uri: video.creator.avatar }}
                className="w-9 h-9 rounded-full bg-gray-300"
              />
            ) : (
              <View className="w-9 h-9 rounded-full bg-[#B87333] items-center justify-center">
                <Text className="text-white font-bold text-sm">
                  {(video.creator?.displayName || 'U')[0].toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          {/* Title and Stats */}
          <View className="flex-1">
            <Text className="text-gray-900 font-semibold text-base leading-5" numberOfLines={2}>
              {video.title}
            </Text>
            <View className="flex-row items-center mt-1 flex-wrap">
              <Text className="text-gray-600 text-sm">{video.creator?.displayName || 'Unknown'}</Text>
              <View className="w-1 h-1 bg-gray-400 rounded-full mx-2" />
              <Text className="text-gray-600 text-sm">{formatViews(video.metrics?.views || 0)} views</Text>
              <View className="w-1 h-1 bg-gray-400 rounded-full mx-2" />
              <Text className="text-gray-600 text-sm">{formatTimeAgo(video.createdAt)}</Text>
            </View>
          </View>

          {/* More Options */}
          <TouchableOpacity className="ml-2 p-1">
            <Ionicons name="ellipsis-vertical" size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderShortsCard = (video: Video) => {
    const thumbnailUrl = video.video?.thumbnail?.url || 
                         video.video?.originalFile?.url ||
                         null;
    
    return (
      <TouchableOpacity
        key={video._id}
        onPress={() => router.push(`/shorts/${video._id}`)}
        className="mr-3 w-40"
      >
        <View className="relative">
          {thumbnailUrl ? (
            <Image
              source={{ uri: thumbnailUrl }}
              className="w-full h-64 rounded-xl bg-gray-200"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-64 rounded-xl bg-[#F3E4C8] items-center justify-center">
              <Ionicons name="videocam" size={32} color="#B87333" />
            </View>
          )}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            className="absolute bottom-0 left-0 right-0 h-24 rounded-b-xl p-3 justify-end"
          >
            <View className="flex-row items-center">
              <Ionicons name="play" size={16} color="white" />
              <Text className="text-white text-sm font-semibold ml-1">
                {formatViews(video.metrics?.views || 0)}
              </Text>
            </View>
            <Text className="text-white font-semibold text-sm mt-1" numberOfLines={2}>
              {video.title}
            </Text>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDiscoverTab = () => (
    <ScrollView
      className="flex-1"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#DD7A1F" />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header with gradient */}
      <LinearGradient
        colors={['#DD7A1F', '#B87333']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-5 pt-6 pb-4"
      >
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-white text-3xl font-bold">Discover Videos</Text>
          <TouchableOpacity onPress={() => router.push('/videos/search')} className="p-2">
            <Ionicons name="search" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Feed Type Tabs */}
        <View className="flex-row bg-white/20 rounded-full p-1">
          {(['trending', 'popular', 'recent'] as FeedType[]).map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setFeedType(type)}
              className={`flex-1 py-2 rounded-full ${
                feedType === type ? 'bg-white' : 'bg-transparent'
              }`}
            >
              <Text
                className={`text-center font-semibold capitalize ${
                  feedType === type ? 'text-[#DD7A1F]' : 'text-white'
                }`}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      {/* Category Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="px-5 py-3 bg-white border-b border-gray-200"
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            onPress={() => setSelectedCategory(cat.id)}
            className={`mr-2 px-4 py-2 rounded-full flex-row items-center ${
              selectedCategory === cat.id
                ? 'bg-[#DD7A1F]'
                : 'bg-gray-100 border border-gray-300'
            }`}
          >
            <Ionicons
              name={cat.icon as any}
              size={16}
              color={selectedCategory === cat.id ? 'white' : '#6b7280'}
            />
            <Text
              className={`ml-2 font-semibold ${
                selectedCategory === cat.id ? 'text-white' : 'text-gray-700'
              }`}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Video Type Filter */}
      <View className="flex-row px-5 py-3 bg-white border-b border-gray-200">
        {(['all', 'videos', 'shorts'] as VideoFilter[]).map((filter) => (
          <TouchableOpacity
            key={filter}
            onPress={() => setVideoFilter(filter)}
            className={`mr-3 px-4 py-2 rounded-full ${
              videoFilter === filter ? 'bg-[#FEF3E8] border-2 border-[#DD7A1F]' : 'bg-gray-100'
            }`}
          >
            <Text
              className={`font-semibold capitalize ${
                videoFilter === filter ? 'text-[#DD7A1F]' : 'text-gray-600'
              }`}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Shorts Section (if showing shorts or all) */}
      {(videoFilter === 'all' || videoFilter === 'shorts') && (
        <View className="py-4 bg-[#FDF8E8]">
          <View className="flex-row items-center justify-between px-5 mb-3">
            <View className="flex-row items-center">
              <Ionicons name="flash" size={24} color="#DD7A1F" />
              <Text className="text-gray-900 text-xl font-bold ml-2">Shorts</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/shorts')}>
              <Text className="text-[#DD7A1F] font-semibold">View All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-5">
            {videos.filter(v => v.type === 'short').slice(0, 10).map((video) => renderShortsCard(video))}
          </ScrollView>
        </View>
      )}

      {/* Regular Videos */}
      {loading ? (
        <View className="py-20 items-center justify-center">
          <ActivityIndicator size="large" color="#DD7A1F" />
          <Text className="text-gray-600 mt-3">Loading videos...</Text>
        </View>
      ) : videos.length === 0 ? (
        <View className="py-20 items-center justify-center">
          <Ionicons name="videocam-off-outline" size={64} color="#d1d5db" />
          <Text className="text-gray-500 text-lg font-medium mt-4">No videos found</Text>
          <Text className="text-gray-400 text-sm mt-2">Try changing your filters</Text>
        </View>
      ) : (
        <View className="px-5 py-4">
          <Text className="text-gray-900 text-lg font-bold mb-4">
            {videoFilter === 'shorts' ? 'All Shorts' : 'Recommended Videos'}
          </Text>
          {videos.filter(v => videoFilter === 'all' ? v.type === 'video' : true).map((video) => renderVideoCard(video))}
        </View>
      )}
    </ScrollView>
  );

  const renderStudioTab = () => (
    <ScrollView
      className="flex-1"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#B87333" />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <LinearGradient
        colors={['#B87333', '#4A2E1C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="px-5 pt-6 pb-4"
      >
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-white text-3xl font-bold">Creator Studio</Text>
          <TouchableOpacity onPress={() => router.push('/videos/analytics')} className="p-2">
            <Ionicons name="stats-chart" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Upload Button */}
        <TouchableOpacity
          onPress={() => router.push('/videos/upload')}
          className="bg-white rounded-xl py-4 flex-row items-center justify-center"
        >
          <Ionicons name="add-circle" size={24} color="#B87333" />
          <Text className="text-[#B87333] font-bold text-lg ml-2">Upload Video</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Stats Cards */}
      <View className="px-5 py-4 bg-white">
        <Text className="text-gray-900 text-lg font-bold mb-3">Channel Overview</Text>
        <View className="flex-row flex-wrap gap-3">
          <View className="flex-1 min-w-[45%] bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
            <View className="flex-row items-center justify-between mb-2">
              <Ionicons name="eye" size={24} color="#3b82f6" />
              <Text className="text-blue-600 text-xs font-semibold">TOTAL VIEWS</Text>
            </View>
            <Text className="text-gray-900 text-2xl font-bold">
              {formatViews(myVideos.reduce((sum, v) => sum + (v.metrics?.views || 0), 0))}
            </Text>
          </View>

          <View className="flex-1 min-w-[45%] bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
            <View className="flex-row items-center justify-between mb-2">
              <Ionicons name="heart" size={24} color="#10b981" />
              <Text className="text-green-600 text-xs font-semibold">TOTAL LIKES</Text>
            </View>
            <Text className="text-gray-900 text-2xl font-bold">
              {formatViews(myVideos.reduce((sum, v) => sum + (v.metrics?.likes || 0), 0))}
            </Text>
          </View>

          <View className="flex-1 min-w-[45%] bg-[#F9F0E6] p-4 rounded-xl border border-[#E5D1AF]">
            <View className="flex-row items-center justify-between mb-2">
              <Ionicons name="videocam" size={24} color="#B87333" />
              <Text className="text-[#B87333] text-xs font-semibold">VIDEOS</Text>
            </View>
            <Text className="text-gray-900 text-2xl font-bold">
              {myVideos.filter(v => v.type === 'video').length}
            </Text>
          </View>

          <View className="flex-1 min-w-[45%] bg-[#FEF3E8] p-4 rounded-xl border border-[#F5D4B3]">
            <View className="flex-row items-center justify-between mb-2">
              <Ionicons name="flash" size={24} color="#DD7A1F" />
              <Text className="text-[#DD7A1F] text-xs font-semibold">SHORTS</Text>
            </View>
            <Text className="text-gray-900 text-2xl font-bold">
              {myVideos.filter(v => v.type === 'short').length}
            </Text>
          </View>
        </View>
      </View>

      {/* Video Type Filter */}
      <View className="flex-row px-5 py-3 bg-white border-t border-gray-200">
        {(['all', 'videos', 'shorts'] as VideoFilter[]).map((filter) => (
          <TouchableOpacity
            key={filter}
            onPress={() => setVideoFilter(filter)}
            className={`mr-3 px-4 py-2 rounded-full ${
              videoFilter === filter ? 'bg-[#F9F0E6] border-2 border-[#B87333]' : 'bg-gray-100'
            }`}
          >
            <Text
              className={`font-semibold capitalize ${
                videoFilter === filter ? 'text-[#B87333]' : 'text-gray-600'
              }`}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* My Videos List */}
      <View className="px-5 py-4">
        <Text className="text-gray-900 text-lg font-bold mb-4">My Uploads</Text>
        {myVideos.length === 0 ? (
          <View className="py-20 items-center justify-center">
            <Ionicons name="videocam-outline" size={64} color="#d1d5db" />
            <Text className="text-gray-500 text-lg font-medium mt-4">No videos yet</Text>
            <Text className="text-gray-400 text-sm mt-2 text-center px-8">
              Start creating content and share your knowledge with the world!
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/videos/upload')}
              className="mt-6 bg-[#B87333] px-6 py-3 rounded-full"
            >
              <Text className="text-white font-semibold">Upload Your First Video</Text>
            </TouchableOpacity>
          </View>
        ) : (
          myVideos.map((video) => renderVideoCard(video))
        )}
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Tab Switcher */}
      <View className="bg-white border-b border-gray-200">
        <View className="flex-row p-2 mx-5 my-3 bg-gray-100 rounded-full">
          <TouchableOpacity
            onPress={() => setActiveTab('discover')}
            className={`flex-1 py-3 rounded-full flex-row items-center justify-center`}
            style={activeTab === 'discover' ? { backgroundColor: '#DD7A1F' } : undefined}
          >
            <Ionicons
              name="compass"
              size={20}
              color={activeTab === 'discover' ? 'white' : '#6b7280'}
            />
            <Text
              className={`ml-2 font-bold ${
                activeTab === 'discover' ? 'text-white' : 'text-gray-600'
              }`}
            >
              Discover
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setActiveTab('studio')}
            className={`flex-1 py-3 rounded-full flex-row items-center justify-center`}
            style={activeTab === 'studio' ? { backgroundColor: '#B87333' } : undefined}
          >
            <Ionicons
              name="create"
              size={20}
              color={activeTab === 'studio' ? 'white' : '#6b7280'}
            />
            <Text
              className={`ml-2 font-bold ${
                activeTab === 'studio' ? 'text-white' : 'text-gray-600'
              }`}
            >
              Studio
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      {activeTab === 'discover' ? renderDiscoverTab() : renderStudioTab()}
    </SafeAreaView>
  );
}
