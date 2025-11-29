/**
 * Community Screen - Twitter-like social media feed
 * Main community hub with timeline, explore, and trending content
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Share,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

import communityService, {
  CommunityPost,
} from '../../services/communityService';
import {
  PostCard,
  CreatePostModal,
  CommentModal,
} from '../../components/community';

type TabMode = 'timeline' | 'explore' | 'trending';
type ExploreSort = 'recent' | 'popular' | 'trending';

export default function CommunityScreen() {
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  // State
  const [activeTab, setActiveTab] = useState<TabMode>('explore');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [exploreSort, setExploreSort] = useState<ExploreSort>('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedPostComments, setSelectedPostComments] = useState<any[]>([]);

  // User info
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Load user data
  useEffect(() => {
    loadUserData();
  }, []);

  // Load content when tab changes
  useEffect(() => {
    loadContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, exploreSort]);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('@shlokayug:userData');
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadContent = async () => {
    setLoading(true);
    setPage(1);
    setHasMore(true);
    setApiError(null);

    try {
      // Load posts based on active tab - single API call
      let postsData: CommunityPost[] = [];
      
      if (activeTab === 'timeline') {
        try {
          const timelineRes = await communityService.getTimeline({ page: 1, limit: 20 });
          postsData = timelineRes.posts || [];
          setHasMore(timelineRes.pagination?.hasMore || false);
        } catch {
          // If timeline fails (not authenticated), fall back to explore
          console.log('Timeline unavailable, using explore feed');
          try {
            const exploreRes = await communityService.getExploreFeed({ page: 1, limit: 20, sort: 'recent' });
            postsData = exploreRes.posts || [];
          } catch (err: any) {
            console.log('Explore feed also unavailable');
            setApiError(err?.message || 'Failed to load posts. Please try again.');
          }
        }
      } else if (activeTab === 'explore') {
        try {
          const exploreRes = await communityService.getExploreFeed({ 
            page: 1, 
            limit: 20, 
            sort: exploreSort 
          });
          postsData = exploreRes.posts || [];
        } catch (err: any) {
          console.log('Could not load explore feed');
          setApiError(err?.message || 'Failed to load posts. Please try again.');
        }
      } else if (activeTab === 'trending') {
        // Load trending posts (popular)
        try {
          const trendingRes = await communityService.getExploreFeed({ 
            page: 1, 
            limit: 20, 
            sort: 'trending' 
          });
          postsData = trendingRes.posts || [];
        } catch (err: any) {
          console.log('Could not load trending posts');
          setApiError(err?.message || 'Failed to load posts. Please try again.');
        }
      }

      setPosts(postsData);
    } catch (error: any) {
      console.error('Error loading content:', error);
      setApiError(error?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;

    try {
      let newPosts: CommunityPost[] = [];

      if (activeTab === 'timeline') {
        const res = await communityService.getTimeline({ page: nextPage, limit: 20 });
        newPosts = res.posts || [];
        setHasMore(res.pagination?.hasMore || false);
      } else {
        const res = await communityService.getExploreFeed({ 
          page: nextPage, 
          limit: 20, 
          sort: activeTab === 'explore' ? exploreSort : 'trending' 
        });
        newPosts = res.posts || [];
        setHasMore(newPosts.length === 20);
      }

      setPosts(prev => [...prev, ...newPosts]);
      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadContent();
    setRefreshing(false);
  };

  const handleCreatePost = async (data: any) => {
    try {
      await communityService.createPost(data);
      await loadContent(); // Refresh feed
    } catch (error: any) {
      throw error; // Let the modal handle the error
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      await communityService.likePost(postId);
    } catch (error) {
      console.error('Like failed:', error);
    }
  };

  const handleRepostPost = async (postId: string) => {
    try {
      await communityService.repost(postId);
      Alert.alert('Success', 'Post shared to your timeline!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to repost');
    }
  };

  const handleCommentPost = async (postId: string) => {
    setSelectedPostId(postId);
    // Find post comments
    const post = posts.find(p => p._id === postId);
    setSelectedPostComments(post?.comments || []);
    setShowCommentModal(true);
  };

  const handleAddComment = async (text: string) => {
    if (!selectedPostId) return;
    
    try {
      await communityService.addComment(selectedPostId, text);
      // Refresh the post to get updated comments
      await loadContent();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add comment');
    }
  };

  const handleSharePost = async (postId: string) => {
    const post = posts.find(p => p._id === postId);
    if (!post) return;

    try {
      await Share.share({
        message: `Check out this post on ShlokaYug: "${post.content?.text?.slice(0, 100) || ''}"`,
        url: `https://shlokayug.com/community/posts/${postId}`,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleUserPress = (username: string) => {
    // Navigate to user profile - for now just show alert
    Alert.alert('User Profile', `Viewing @${username}'s profile`);
    // router.push(`/community/profile/${username}`);
  };

  const handleHashtagPress = (hashtag: string) => {
    Alert.alert('Hashtag', `Viewing #${hashtag} posts`);
    // router.push(`/community/hashtag/${hashtag}`);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    Alert.alert('Search', `Searching for: ${searchQuery}`);
    // router.push(`/community/search?q=${encodeURIComponent(searchQuery)}`);
  };

  // Header animation
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [1, 0.9],
    extrapolate: 'clamp',
  });

  const renderHeader = () => (
    <Animated.View style={{ opacity: headerOpacity }}>
      {/* Explore Sort Options */}
      {activeTab === 'explore' && (
        <View className="bg-white px-4 py-3 border-b border-gray-100">
          <View className="flex-row">
            {(['recent', 'popular', 'trending'] as ExploreSort[]).map((sort) => (
              <TouchableOpacity
                key={sort}
                onPress={() => setExploreSort(sort)}
                className={`mr-3 px-4 py-2 rounded-full ${
                  exploreSort === sort ? 'bg-orange-500' : 'bg-gray-100'
                }`}
              >
                <Text className={`font-medium capitalize ${
                  exploreSort === sort ? 'text-white' : 'text-gray-700'
                }`}>
                  {sort}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Error Message */}
      {apiError && (
        <View className="bg-red-50 px-4 py-3 border-b border-red-100">
          <Text className="text-red-600 text-center">{apiError}</Text>
          <TouchableOpacity onPress={loadContent} className="mt-2">
            <Text className="text-orange-600 text-center font-medium">Tap to retry</Text>
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );

  const renderPost = ({ item }: { item: CommunityPost }) => (
    <PostCard
      post={item}
      onLike={handleLikePost}
      onRepost={handleRepostPost}
      onComment={handleCommentPost}
      onShare={handleSharePost}
      onUserPress={handleUserPress}
      onHashtagPress={handleHashtagPress}
    />
  );

  const renderEmpty = () => (
    <View className="flex-1 items-center justify-center py-20">
      <Ionicons name="chatbubbles-outline" size={64} color="#d1d5db" />
      <Text className="text-gray-500 text-lg mt-4 text-center">
        {activeTab === 'timeline' 
          ? 'Your timeline is empty' 
          : 'No posts found'}
      </Text>
      <Text className="text-gray-400 text-sm mt-2 text-center px-8">
        {activeTab === 'timeline' 
          ? 'Follow some users to see their posts here!' 
          : 'Be the first to share something!'}
      </Text>
      <TouchableOpacity
        onPress={() => setShowCreateModal(true)}
        className="mt-6 bg-orange-500 px-6 py-3 rounded-full"
      >
        <Text className="text-white font-semibold">Create Post</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View className="py-4">
        <ActivityIndicator size="small" color="#f97316" />
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
      {/* Header */}
      <View className="bg-white border-b border-gray-200">
        <View className="flex-row items-center justify-between px-4 py-3">
          <Text className="text-gray-900 font-bold text-2xl">Community</Text>
          
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => setShowSearch(!showSearch)}
              className="p-2 mr-2"
            >
              <Ionicons name="search" size={24} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/profile')}
              className="p-2"
            >
              <Ionicons name="person-circle-outline" size={26} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        {showSearch && (
          <View className="px-4 pb-3">
            <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
              <Ionicons name="search" size={18} color="#9ca3af" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search posts, users, hashtags..."
                placeholderTextColor="#9ca3af"
                className="flex-1 ml-2 text-gray-900"
                returnKeyType="search"
                onSubmitEditing={handleSearch}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color="#9ca3af" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Tab Navigation */}
        <View className="flex-row">
          {(['timeline', 'explore', 'trending'] as TabMode[]).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              className={`flex-1 py-3 ${
                activeTab === tab ? 'border-b-2 border-orange-500' : ''
              }`}
            >
              <Text className={`text-center font-semibold capitalize ${
                activeTab === tab ? 'text-orange-600' : 'text-gray-500'
              }`}>
                {tab === 'timeline' ? 'For You' : tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#f97316" />
          <Text className="text-gray-500 mt-3">Loading community...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item._id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#f97316"
              colors={['#f97316']}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: false }
          )}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => setShowCreateModal(true)}
        className="absolute bottom-6 right-6"
        style={{
          shadowColor: '#f97316',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <LinearGradient
          colors={['#f97316', '#ec4899']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="w-14 h-14 rounded-full items-center justify-center"
        >
          <Ionicons name="add" size={28} color="white" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Modals */}
      <CreatePostModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreatePost}
        userAvatar={currentUser?.avatar || currentUser?.profile?.avatar}
        userName={currentUser?.firstName || currentUser?.profile?.firstName || currentUser?.username}
      />

      <CommentModal
        visible={showCommentModal}
        onClose={() => setShowCommentModal(false)}
        comments={selectedPostComments}
        onAddComment={handleAddComment}
        userAvatar={currentUser?.avatar || currentUser?.profile?.avatar}
      />
    </SafeAreaView>
  );
}