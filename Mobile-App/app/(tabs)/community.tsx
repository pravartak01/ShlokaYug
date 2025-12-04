/**
 * Community Screen - Premium Light Social Experience
 * Clean, professional design matching Learn tab aesthetics
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Share,
  TextInput,
  Dimensions,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import communityService, { CommunityPost } from '../../services/communityService';
import {
  PostCard,
  CreatePostModal,
  CommentModal,
} from '../../components/community';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Light Theme Colors - Matching Learn Tab (White with warm accents)
const COLORS = {
  // Primary colors
  saffron: '#DD7A1F',
  copper: '#B87333',
  gold: '#D4A017',
  
  // Brown tones (lighter)
  primaryBrown: '#6B4423',
  lightBrown: '#8B6914',
  
  // Background colors (light/white)
  white: '#FFFFFF',
  background: '#F9FAFB',
  cardBg: '#FFFFFF',
  
  // Neutral grays
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  
  // Accent
  sand: '#FEF3C7',
  cream: '#FFFBEB',
};

type TabMode = 'timeline' | 'explore' | 'trending';
type ExploreSort = 'recent' | 'popular' | 'trending';

export default function CommunityScreen() {
  const router = useRouter();
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
      let postsData: CommunityPost[] = [];
      
      if (activeTab === 'timeline') {
        try {
          const timelineRes = await communityService.getTimeline({ page: 1, limit: 20 });
          postsData = timelineRes.posts || [];
          setHasMore(timelineRes.pagination?.hasMore || false);
        } catch {
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
      setHasMore(false);
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
      await loadContent();
    } catch (error: any) {
      throw error;
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      const result = await communityService.likePost(postId);
      setPosts(prev => prev.map(post => 
        post._id === postId 
          ? { ...post, isLiked: result.liked, metrics: { ...post.metrics, likes: result.likesCount } }
          : post
      ));
    } catch (error) {
      console.error('Like failed:', error);
    }
  };

  const handleRepostPost = async (postId: string) => {
    try {
      await communityService.repost(postId);
      Alert.alert('Success', 'Post shared to your timeline!');
      await loadContent();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to repost');
    }
  };

  const handleCommentPost = async (postId: string) => {
    setSelectedPostId(postId);
    const post = posts.find(p => p._id === postId);
    setSelectedPostComments(post?.comments || []);
    setShowCommentModal(true);
  };

  const handleAddComment = async (text: string) => {
    if (!selectedPostId) return;
    
    try {
      await communityService.addComment(selectedPostId, text);
      await loadContent();
      setShowCommentModal(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add comment');
    }
  };

  const handleSharePost = async (postId: string) => {
    const post = posts.find(p => p._id === postId);
    if (!post) return;

    try {
      await Share.share({
        message: `Check out this post on ShlokaYug:\n\n"${post.content?.text?.slice(0, 100) || ''}"`,
        url: `https://shlokayug.com/community/posts/${postId}`,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleUserPress = (username: string) => {
    Alert.alert('User Profile', `Viewing @${username}'s profile`);
  };

  const handleHashtagPress = (hashtag: string) => {
    Alert.alert('Hashtag', `Viewing #${hashtag} posts`);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    Alert.alert('Search', `Searching for: ${searchQuery}`);
  };

  const renderHeader = () => (
    <View>
      {/* Explore Sort Options */}
      {activeTab === 'explore' && (
        <View style={styles.sortContainer}>
          <View style={styles.sortButtonsRow}>
            {(['recent', 'popular', 'trending'] as ExploreSort[]).map((sort) => {
              const isActive = exploreSort === sort;
              const iconName = sort === 'recent' ? 'time' : sort === 'popular' ? 'flame' : 'trending-up';
              return (
                <TouchableOpacity
                  key={sort}
                  onPress={() => setExploreSort(sort)}
                  style={[
                    styles.sortButton,
                    isActive && styles.sortButtonActive
                  ]}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={isActive ? iconName : `${iconName}-outline` as any}
                    size={16}
                    color={isActive ? COLORS.white : COLORS.gray500}
                    style={styles.sortIcon}
                  />
                  <Text style={[
                    styles.sortButtonText,
                    isActive && styles.sortButtonTextActive
                  ]}>
                    {sort.charAt(0).toUpperCase() + sort.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Error Message */}
      {apiError && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={20} color="#DC2626" />
          <View style={styles.errorContent}>
            <Text style={styles.errorText}>{apiError}</Text>
            <TouchableOpacity onPress={loadContent}>
              <Text style={styles.retryText}>Tap to retry</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
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
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="chatbubbles-outline" size={64} color={COLORS.gray300} />
      </View>
      <Text style={styles.emptyTitle}>
        {activeTab === 'timeline' 
          ? 'Your Timeline is Empty' 
          : 'No Posts Yet'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'timeline' 
          ? 'Follow users to see their posts here' 
          : 'Be the first to share something!'}
      </Text>
      <TouchableOpacity
        onPress={() => setShowCreateModal(true)}
        style={styles.emptyButton}
        activeOpacity={0.8}
      >
        <Ionicons name="create-outline" size={20} color={COLORS.white} />
        <Text style={styles.emptyButtonText}>Create Post</Text>
      </TouchableOpacity>
    </View>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.saffron} />
        <Text style={styles.footerText}>Loading more posts...</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Fixed Header - No shrinking */}
      <View style={styles.header}>
        {/* Header Top */}
        <View style={styles.headerTop}>
          <View style={styles.headerTitleContainer}>
            <Ionicons name="people-circle" size={28} color={COLORS.saffron} />
            <Text style={styles.headerTitle}>Community</Text>
          </View>
          
          <TouchableOpacity
            onPress={() => setShowSearch(!showSearch)}
            style={styles.headerIconButton}
          >
            <Ionicons 
              name={showSearch ? 'close-circle' : 'search'} 
              size={24} 
              color={COLORS.gray600} 
            />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        {showSearch && (
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={20} color={COLORS.gray400} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search posts, users, hashtags..."
                placeholderTextColor={COLORS.gray400}
                style={styles.searchInput}
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={COLORS.gray400} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {(['timeline', 'explore', 'trending'] as TabMode[]).map((tab) => {
            const isActive = activeTab === tab;
            const iconName = tab === 'timeline' ? 'home' : tab === 'explore' ? 'compass' : 'flame';
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
                activeOpacity={0.8}
              >
                <Ionicons
                  name={isActive ? iconName : `${iconName}-outline` as any}
                  size={18}
                  color={isActive ? COLORS.white : COLORS.gray500}
                />
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.saffron} />
          <Text style={styles.loaderText}>Loading community...</Text>
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
              tintColor={COLORS.saffron}
              colors={[COLORS.saffron, COLORS.copper]}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Floating Action Button - Positioned higher and smaller */}
      <TouchableOpacity
        onPress={() => setShowCreateModal(true)}
        style={styles.fab}
        activeOpacity={0.9}
      >
        <Ionicons name="add" size={24} color={COLORS.white} />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.gray800,
    marginLeft: 10,
  },
  headerIconButton: {
    padding: 8,
    backgroundColor: COLORS.gray100,
    borderRadius: 20,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray100,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.gray800,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: COLORS.gray100,
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: COLORS.saffron,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray500,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  sortContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  sortButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  sortButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: COLORS.gray100,
    gap: 4,
  },
  sortButtonActive: {
    backgroundColor: COLORS.copper,
  },
  sortIcon: {
    marginRight: 2,
  },
  sortButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray500,
  },
  sortButtonTextActive: {
    color: COLORS.white,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 14,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  errorContent: {
    flex: 1,
    marginLeft: 12,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '500',
  },
  retryText: {
    color: COLORS.saffron,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.gray800,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    color: COLORS.gray500,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.saffron,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  emptyButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  footerLoader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  footerText: {
    color: COLORS.gray500,
    fontSize: 14,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderText: {
    marginTop: 16,
    color: COLORS.gray500,
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 90, // Higher position to avoid navbar
    right: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.saffron,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.saffron,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
