import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Share,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Video as ExpoVideo, ResizeMode } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import videoService, { Video } from '../../services/videoService';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

interface ShortItem extends Video {
  viewportEntered?: boolean;
}

export default function ShortsViewerScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const lastViewRecordTime = useRef<Record<string, number>>({});
  
  const [shorts, setShorts] = useState<ShortItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    loadShorts();
  }, [id]);

  const loadShorts = async () => {
    try {
      setLoading(true);
      // Get the specific short and feed
      const [shortRes, feedRes] = await Promise.all([
        videoService.getVideoById(id as string),
        videoService.getShortsFeed({ limit: 20 }),
      ]);

      const currentShort = shortRes.data?.video || shortRes.data || shortRes.video;
      // API returns shorts in data.data.shorts structure
      let feedShorts = feedRes.data?.data?.shorts || feedRes.data?.shorts || feedRes.shorts || [];
      
      // Aggressively filter: only valid items with _id
      feedShorts = feedShorts.filter((v: any) => v && v._id && v._id !== id);
      
      // Build clean array - only include current short if it has _id
      const allShorts = [];
      if (currentShort && currentShort._id) {
        allShorts.push(currentShort);
      }
      allShorts.push(...feedShorts);
      
      setShorts(allShorts);
      setActiveIndex(0);
    } catch (error) {
      console.error('Error loading shorts:', error);
      Alert.alert('Error', 'Failed to load shorts');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreShorts = async () => {
    try {
      const lastShort = shorts[shorts.length - 1];
      if (!lastShort || !lastShort._id) return;
      
      const response = await videoService.getShortsFeed({
        lastVideoId: lastShort._id,
        limit: 10,
      });
      // API returns shorts in data.data.shorts structure
      const newShorts = response.data?.data?.shorts || response.data?.shorts || response.shorts || [];
      
      // Filter out invalid items
      const validShorts = newShorts.filter((s: any) => s && s._id);
      
      setShorts([...shorts, ...validShorts]);
    } catch (error) {
      console.error('Error loading more shorts:', error);
    }
  };

  const handleLike = async (short: Video) => {
    try {
      await videoService.reactToVideo(short._id, 'like');
      setShorts(shorts.map(s => 
        s._id === short._id
          ? {
              ...s,
              isLiked: !s.isLiked,
              isDisliked: false,
              metrics: {
                ...s.metrics,
                likes: s.isLiked ? s.metrics.likes - 1 : s.metrics.likes + 1,
                dislikes: s.isDisliked ? s.metrics.dislikes - 1 : s.metrics.dislikes,
              },
            }
          : s
      ));
    } catch (error) {
      console.error('Error liking short:', error);
    }
  };

  const handleDislike = async (short: Video) => {
    try {
      await videoService.reactToVideo(short._id, 'dislike');
      setShorts(shorts.map(s =>
        s._id === short._id
          ? {
              ...s,
              isDisliked: !s.isDisliked,
              isLiked: false,
              metrics: {
                ...s.metrics,
                dislikes: s.isDisliked ? s.metrics.dislikes - 1 : s.metrics.dislikes + 1,
                likes: s.isLiked ? s.metrics.likes - 1 : s.metrics.likes,
              },
            }
          : s
      ));
    } catch (error) {
      console.error('Error disliking short:', error);
    }
  };

  const handleShare = async (short: Video) => {
    try {
      await Share.share({
        message: `Check out this short on ShlokaYug: "${short.title}"`,
        url: `https://shlokayug.com/shorts/${short._id}`,
      });
      await videoService.shareVideo(short._id);
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const renderShort = ({ item, index }: { item: ShortItem; index: number }) => {
    // Guard: ensure item exists with required fields
    if (!item || !item._id || !item.creator || !item.metrics) {
      return (
        <View style={{ height: SCREEN_HEIGHT, width: SCREEN_WIDTH }} className="bg-black items-center justify-center">
          <Ionicons name="alert-circle" size={64} color="#6b7280" />
          <Text className="text-white mt-4">Invalid video data</Text>
        </View>
      );
    }

    const isActive = index === activeIndex;
    
    // Safe access to video URL
    const videoUrl = item.video?.processedVersions?.['720p']?.url || 
                     item.video?.originalFile?.url || 
                     null;

    // Skip rendering if no video URL available
    if (!videoUrl) {
      return (
        <View style={{ height: SCREEN_HEIGHT, width: SCREEN_WIDTH }} className="bg-black items-center justify-center">
          <Ionicons name="videocam-off" size={64} color="#6b7280" />
          <Text className="text-white mt-4">Video not available</Text>
        </View>
      );
    }

    return (
      <View style={{ height: SCREEN_HEIGHT, width: SCREEN_WIDTH }} className="bg-black">
        {/* Video Player */}
        <ExpoVideo
          source={{ uri: videoUrl }}
          style={{ flex: 1 }}
          resizeMode={ResizeMode.COVER}
          shouldPlay={isActive}
          isLooping
          useNativeControls={false}
        />

        {/* Overlay Controls */}
        <LinearGradient
          colors={['transparent', 'transparent', 'rgba(0,0,0,0.8)']}
          className="absolute bottom-0 left-0 right-0 pb-20 pt-40"
        >
          <View className="px-4">
            {/* Creator Info */}
            <View className="flex-row items-center mb-3">
              <View className="w-10 h-10 rounded-full bg-[#DD7A1F] items-center justify-center mr-3">
                <Text className="text-white font-bold">
                  {item.creator.displayName[0].toUpperCase()}
                </Text>
              </View>
              <Text className="text-white font-semibold text-base">
                @{item.creator.username}
              </Text>
              {!item.isSubscribed && (
                <TouchableOpacity
                  onPress={async () => {
                    await videoService.subscribeToChannel(item.creator.userId);
                    setShorts(shorts.map(s =>
                      s._id === item._id ? { ...s, isSubscribed: true } : s
                    ));
                  }}
                  className="ml-3 bg-[#DD7A1F] px-4 py-1 rounded-full"
                >
                  <Text className="text-white font-bold text-sm">Follow</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Title */}
            <Text className="text-white font-semibold text-base leading-5 mb-2">
              {item.title}
            </Text>

            {/* Hashtags */}
            {item.shorts?.hashtags && item.shorts.hashtags.length > 0 && (
              <View className="flex-row flex-wrap mb-2">
                {item.shorts.hashtags.map((tag, idx) => (
                  <Text key={idx} className="text-white text-sm mr-2">
                    #{tag}
                  </Text>
                ))}
              </View>
            )}

            {/* Music */}
            {item.shorts?.music && (
              <View className="flex-row items-center">
                <Ionicons name="musical-note" size={16} color="white" />
                <Text className="text-white text-sm ml-1">
                  {item.shorts.music.title} - {item.shorts.music.artist}
                </Text>
              </View>
            )}
          </View>
        </LinearGradient>

        {/* Right Side Actions */}
        <View className="absolute right-4 bottom-32 gap-6">
          {/* Like */}
          <TouchableOpacity
            onPress={() => handleLike(item)}
            className="items-center"
          >
            <View className={`p-2 rounded-full ${item.isLiked ? 'bg-[#DD7A1F]' : 'bg-black/30'}`}>
              <Ionicons
                name={item.isLiked ? 'heart' : 'heart-outline'}
                size={32}
                color="white"
              />
            </View>
            <Text className="text-white text-xs font-semibold mt-1">
              {formatCount(item.metrics.likes)}
            </Text>
          </TouchableOpacity>

          {/* Dislike */}
          <TouchableOpacity
            onPress={() => handleDislike(item)}
            className="items-center"
          >
            <View className={`p-2 rounded-full ${item.isDisliked ? 'bg-gray-500' : 'bg-black/30'}`}>
              <Ionicons
                name={item.isDisliked ? 'thumbs-down' : 'thumbs-down-outline'}
                size={28}
                color="white"
              />
            </View>
          </TouchableOpacity>

          {/* Comments */}
          <TouchableOpacity
            onPress={() => setShowComments(true)}
            className="items-center"
          >
            <View className="p-2 rounded-full bg-black/30">
              <Ionicons name="chatbubble-outline" size={28} color="white" />
            </View>
            <Text className="text-white text-xs font-semibold mt-1">
              {formatCount(item.metrics.comments)}
            </Text>
          </TouchableOpacity>

          {/* Share */}
          <TouchableOpacity
            onPress={() => handleShare(item)}
            className="items-center"
          >
            <View className="p-2 rounded-full bg-black/30">
              <Ionicons name="share-social-outline" size={28} color="white" />
            </View>
            <Text className="text-white text-xs font-semibold mt-1">Share</Text>
          </TouchableOpacity>

          {/* More */}
          <TouchableOpacity className="items-center">
            <View className="p-2 rounded-full bg-black/30">
              <Ionicons name="ellipsis-horizontal" size={28} color="white" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Close Button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute top-12 left-4 bg-black/50 rounded-full p-2"
        >
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#DD7A1F" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-black" edges={['top']}>
      {shorts.length === 0 ? (
        <View className="flex-1 items-center justify-center">
          <Ionicons name="film-outline" size={64} color="#6b7280" />
          <Text className="text-white mt-4">No shorts available</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={shorts}
          renderItem={renderShort}
          keyExtractor={(item, index) => item?._id || `short-${index}`}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          snapToInterval={SCREEN_HEIGHT}
          snapToAlignment="start"
          decelerationRate="fast"
          removeClippedSubviews={false}
          onViewableItemsChanged={({ viewableItems }) => {
            if (viewableItems.length > 0 && viewableItems[0].index !== null) {
              setActiveIndex(viewableItems[0].index);
            }
          }}
          viewabilityConfig={{
            itemVisiblePercentThreshold: 50,
          }}
          onEndReached={loadMoreShorts}
          onEndReachedThreshold={0.5}
        />
      )}
    </SafeAreaView>
  );
}
