import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Video as ExpoVideo, ResizeMode } from 'expo-av';
import videoService, { Video, Comment } from '../../services/videoService';

export default function VideoDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const videoRef = useRef<ExpoVideo>(null);
  const lastViewRecordTime = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);
  const isBufferingRef = useRef<boolean>(false);

  const [video, setVideo] = useState<Video | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [showDescription, setShowDescription] = useState(false);

  useEffect(() => {
    loadVideoData();
  }, [id]);

  const loadVideoData = async () => {
    try {
      setLoading(true);
      const [videoRes, commentsRes, relatedRes] = await Promise.all([
        videoService.getVideoById(id as string),
        videoService.getComments(id as string, 1, 20),
        videoService.getRelatedVideos(id as string, 10),
      ]);

      // Extract video data - handle nested structures
      const videoData = videoRes.data?.data?.video || videoRes.data?.video || videoRes.video || videoRes.data;
      setVideo(videoData);
      setComments(commentsRes.data?.comments || commentsRes.comments || []);
      setRelatedVideos(relatedRes.data?.relatedVideos || relatedRes.data?.videos || relatedRes.videos || []);
    } catch (error) {
      console.error('Error loading video:', error);
      Alert.alert('Error', 'Failed to load video');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!video) return;
    try {
      await videoService.reactToVideo(video._id, 'like');
      setVideo({
        ...video,
        isLiked: !video.isLiked,
        isDisliked: false,
        metrics: {
          ...video.metrics,
          likes: video.isLiked ? (video.metrics?.likes || 1) - 1 : (video.metrics?.likes || 0) + 1,
          dislikes: video.isDisliked ? (video.metrics?.dislikes || 1) - 1 : (video.metrics?.dislikes || 0),
        },
      });
    } catch (error) {
      console.error('Error liking video:', error);
    }
  };

  const handleDislike = async () => {
    if (!video) return;
    try {
      await videoService.reactToVideo(video._id, 'dislike');
      setVideo({
        ...video,
        isDisliked: !video.isDisliked,
        isLiked: false,
        metrics: {
          ...video.metrics,
          dislikes: video.isDisliked ? (video.metrics?.dislikes || 1) - 1 : (video.metrics?.dislikes || 0) + 1,
          likes: video.isLiked ? (video.metrics?.likes || 1) - 1 : (video.metrics?.likes || 0),
        },
      });
    } catch (error) {
      console.error('Error disliking video:', error);
    }
  };

  const handleSubscribe = async () => {
    if (!video || !video.creator?.userId) return;
    try {
      if (video.isSubscribed) {
        await videoService.unsubscribeFromChannel(video.creator.userId);
      } else {
        await videoService.subscribeToChannel(video.creator.userId);
      }
      setVideo({ ...video, isSubscribed: !video.isSubscribed });
    } catch (error) {
      console.error('Error subscribing:', error);
    }
  };

  const handleShare = async () => {
    if (!video) return;
    try {
      await Share.share({
        message: `Check out "${video.title}" on ShlokaYug!`,
        url: `https://shlokayug.com/videos/${video._id}`,
      });
      await videoService.shareVideo(video._id);
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim() || !video) return;
    try {
      const response = await videoService.addComment(video._id, commentText);
      setComments([response.data || response.comment, ...comments]);
      setCommentText('');
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to post comment');
    }
  };

  const formatViews = (views: number): string => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const formatTimeAgo = (date: string): string => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" color="#f97316" />
        <Text className="text-white mt-3">Loading video...</Text>
      </SafeAreaView>
    );
  }

  if (!video) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50 items-center justify-center">
        <Ionicons name="videocam-off" size={64} color="#d1d5db" />
        <Text className="text-gray-500 text-lg mt-4">Video not found</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-6 bg-orange-500 px-6 py-3 rounded-full"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Get video URL - simplified
  const getVideoUrl = () => {
    // Try all possible paths
    const possibleUrls = [
      video.video?.processedVersions?.['720p']?.url,
      video.video?.processedVersions?.['480p']?.url,
      video.video?.processedVersions?.['1080p']?.url,
      video.video?.originalFile?.url,
      (video as any).bestVideoUrl,
    ];
    
    // Return first valid URL
    for (const url of possibleUrls) {
      if (url) {
        return url.startsWith('http://') ? url.replace('http://', 'https://') : url;
      }
    }
    
    return null;
  };

  const videoUrl = getVideoUrl();
  const thumbnailUrl = video.video?.thumbnail?.url || null;

  return (
    <SafeAreaView className="flex-1 bg-black">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Video Player */}
          <View className="bg-black">
            {videoUrl ? (
              <View style={{ width: '100%', aspectRatio: 16 / 9 }}>
                <ExpoVideo
                  ref={videoRef}
                  source={{ uri: videoUrl }}
                  style={{ width: '100%', height: '100%' }}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                  onPlaybackStatusUpdate={(status: any) => {
                    if (status.isLoaded && status.isPlaying) {
                      const currentTime = Math.floor(status.positionMillis / 1000);
                      if (currentTime - lastViewRecordTime.current >= 30) {
                        lastViewRecordTime.current = currentTime;
                        videoService.recordView(video._id, currentTime).catch(() => {});
                      }
                    }
                  }}
                />
              </View>
            ) : (
              <View 
                style={{ width: '100%', aspectRatio: 16 / 9 }} 
                className="bg-gray-900 items-center justify-center"
              >
                {thumbnailUrl ? (
                  <Image 
                    source={{ uri: thumbnailUrl }} 
                    style={{ width: '100%', height: '100%' }}
                    resizeMode="cover"
                  />
                ) : null}
                <View className="absolute inset-0 items-center justify-center bg-black/50">
                  <ActivityIndicator size="large" color="#f97316" />
                  <Text className="text-white mt-3 text-center px-4">
                    Video is being processed...{'\n'}Please check back shortly.
                  </Text>
                </View>
              </View>
            )}
            
            {/* Back Button */}
            <TouchableOpacity
              onPress={() => router.back()}
              className="absolute top-4 left-4 bg-black/50 rounded-full p-2"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Video Info */}
          <View className="bg-white">
            <View className="px-4 pt-4">
              <Text className="text-gray-900 text-xl font-bold leading-6">
                {video.title}
              </Text>
              <View className="flex-row items-center mt-2">
                <Text className="text-gray-600 text-sm">
                  {formatViews(video.metrics?.views || 0)} views
                </Text>
                <View className="w-1 h-1 bg-gray-400 rounded-full mx-2" />
                <Text className="text-gray-600 text-sm">
                  {formatTimeAgo(video.createdAt)}
                </Text>
              </View>
            </View>

            {/* Engagement Buttons */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              className="px-4 py-3 border-b border-gray-200"
            >
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={handleLike}
                  className={`flex-row items-center px-4 py-2 rounded-full ${
                    video.isLiked ? 'bg-orange-100' : 'bg-gray-100'
                  }`}
                >
                  <Ionicons
                    name={video.isLiked ? 'thumbs-up' : 'thumbs-up-outline'}
                    size={20}
                    color={video.isLiked ? '#f97316' : '#6b7280'}
                  />
                  <Text
                    className={`ml-2 font-semibold ${
                      video.isLiked ? 'text-orange-600' : 'text-gray-700'
                    }`}
                  >
                    {formatViews(video.metrics?.likes || 0)}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleDislike}
                  className={`px-4 py-2 rounded-full ${
                    video.isDisliked ? 'bg-gray-200' : 'bg-gray-100'
                  }`}
                >
                  <Ionicons
                    name={video.isDisliked ? 'thumbs-down' : 'thumbs-down-outline'}
                    size={20}
                    color="#6b7280"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleShare}
                  className="flex-row items-center px-4 py-2 rounded-full bg-gray-100"
                >
                  <Ionicons name="share-social-outline" size={20} color="#6b7280" />
                  <Text className="ml-2 text-gray-700 font-semibold">Share</Text>
                </TouchableOpacity>

                <TouchableOpacity className="flex-row items-center px-4 py-2 rounded-full bg-gray-100">
                  <Ionicons name="bookmark-outline" size={20} color="#6b7280" />
                  <Text className="ml-2 text-gray-700 font-semibold">Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Channel Info */}
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
              <View className="flex-row items-center flex-1">
                {video.creator?.avatar ? (
                  <Image
                    source={{ uri: video.creator.avatar }}
                    className="w-10 h-10 rounded-full bg-gray-300"
                  />
                ) : (
                  <View className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 items-center justify-center">
                    <Text className="text-white font-bold">
                      {(video.creator?.displayName || 'U')[0].toUpperCase()}
                    </Text>
                  </View>
                )}
                <View className="ml-3 flex-1">
                  <Text className="text-gray-900 font-semibold text-base">
                    {video.creator?.displayName || 'Unknown Creator'}
                  </Text>
                  <Text className="text-gray-500 text-sm">@{video.creator?.username || 'unknown'}</Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={handleSubscribe}
                className={`px-5 py-2 rounded-full ${
                  video.isSubscribed ? 'bg-gray-200' : 'bg-orange-500'
                }`}
              >
                <Text
                  className={`font-bold ${
                    video.isSubscribed ? 'text-gray-700' : 'text-white'
                  }`}
                >
                  {video.isSubscribed ? 'Subscribed' : 'Subscribe'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Description */}
            <TouchableOpacity
              onPress={() => setShowDescription(!showDescription)}
              className="px-4 py-3 bg-gray-50"
            >
              <Text
                className="text-gray-800 text-sm leading-5"
                numberOfLines={showDescription ? undefined : 2}
              >
                {video.description}
              </Text>
              <Text className="text-orange-600 font-semibold text-sm mt-2">
                {showDescription ? 'Show less' : 'Show more'}
              </Text>
            </TouchableOpacity>

            {/* Comments Section */}
            <View className="px-4 py-4">
              <Text className="text-gray-900 text-lg font-bold mb-3">
                Comments {(video.metrics?.comments || 0) > 0 && `(${video.metrics?.comments || 0})`}
              </Text>

              {/* Add Comment */}
              <View className="flex-row items-center mb-4 bg-gray-50 rounded-xl p-2">
                <TextInput
                  value={commentText}
                  onChangeText={setCommentText}
                  placeholder="Add a comment..."
                  placeholderTextColor="#9ca3af"
                  className="flex-1 px-3 py-2 text-gray-900"
                  multiline
                />
                {commentText.trim() && (
                  <TouchableOpacity
                    onPress={handleAddComment}
                    className="bg-orange-500 rounded-full p-2 ml-2"
                  >
                    <Ionicons name="send" size={20} color="white" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Comments List */}
              {comments.map((comment) => (
                <View key={comment._id} className="mb-4">
                  <View className="flex-row">
                    {comment.author?.avatar ? (
                      <Image
                        source={{ uri: comment.author.avatar }}
                        className="w-8 h-8 rounded-full bg-gray-300"
                      />
                    ) : (
                      <View className="w-8 h-8 rounded-full bg-gray-300 items-center justify-center">
                        <Text className="text-gray-600 font-semibold text-sm">
                          {(comment.author?.displayName || 'U')[0].toUpperCase()}
                        </Text>
                      </View>
                    )}
                    <View className="ml-3 flex-1">
                      <View className="flex-row items-center">
                        <Text className="text-gray-900 font-semibold text-sm">
                          {comment.author?.displayName || 'User'}
                        </Text>
                        <Text className="text-gray-500 text-xs ml-2">
                          {formatTimeAgo(comment.createdAt)}
                        </Text>
                      </View>
                      <Text className="text-gray-800 text-sm mt-1 leading-5">
                        {comment.content?.text || ''}
                      </Text>
                      <View className="flex-row items-center mt-2">
                        <TouchableOpacity className="flex-row items-center mr-4">
                          <Ionicons
                            name={comment.isLiked ? 'thumbs-up' : 'thumbs-up-outline'}
                            size={16}
                            color={comment.isLiked ? '#f97316' : '#6b7280'}
                          />
                          {(comment.likes?.count || 0) > 0 && (
                            <Text className="text-gray-600 text-xs ml-1">
                              {comment.likes.count}
                            </Text>
                          )}
                        </TouchableOpacity>
                        <TouchableOpacity>
                          <Text className="text-gray-600 text-xs font-semibold">Reply</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Related Videos */}
            {relatedVideos.length > 0 && (
              <View className="px-4 py-4 border-t border-gray-200">
                <Text className="text-gray-900 text-lg font-bold mb-3">Related Videos</Text>
                {relatedVideos.map((relatedVideo) => {
                  if (!relatedVideo || !relatedVideo._id) return null;
                  const relatedThumbUrl = relatedVideo.video?.thumbnail?.url;
                  return (
                    <TouchableOpacity
                      key={relatedVideo._id}
                      onPress={() => router.push(`/videos/${relatedVideo._id}`)}
                      className="flex-row mb-3"
                    >
                      {relatedThumbUrl ? (
                        <Image
                          source={{ uri: relatedThumbUrl }}
                          className="w-40 h-24 rounded-lg bg-gray-200"
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="w-40 h-24 rounded-lg bg-gradient-to-br from-orange-400 to-pink-500 items-center justify-center">
                          <Ionicons name="videocam" size={24} color="white" />
                        </View>
                      )}
                      <View className="flex-1 ml-3">
                        <Text className="text-gray-900 font-semibold text-sm leading-5" numberOfLines={2}>
                          {relatedVideo.title}
                        </Text>
                        <Text className="text-gray-600 text-xs mt-1">
                          {relatedVideo.creator?.displayName || 'Unknown'}
                        </Text>
                        <Text className="text-gray-500 text-xs mt-0.5">
                          {formatViews(relatedVideo.metrics?.views || 0)} views
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
