/**
 * PostCard Component - Displays a single community post
 * Twitter-like post card with engagement actions
 */

import React, { useState, memo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CommunityPost } from '../../services/communityService';

interface PostCardProps {
  post: CommunityPost;
  onLike?: (postId: string) => void;
  onRepost?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onUserPress?: (username: string) => void;
  onHashtagPress?: (hashtag: string) => void;
  showActions?: boolean;
}

const PostCard: React.FC<PostCardProps> = memo(({
  post,
  onLike,
  onRepost,
  onComment,
  onShare,
  onUserPress,
  onHashtagPress,
  showActions = true,
}) => {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.metrics?.likes || 0);
  const [isRetweeted, setIsRetweeted] = useState(post.isRetweeted || false);

  const author = post.author || {};
  const displayName = author.displayName || 
    (author.firstName && author.lastName 
      ? `${author.firstName} ${author.lastName}` 
      : author.username || 'Unknown');

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatTimeAgo = (dateString: string): string => {
    if (!dateString) return '';
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 7) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    if (diffDays > 0) return `${diffDays}d`;
    if (diffHours > 0) return `${diffHours}h`;
    if (diffMins > 0) return `${diffMins}m`;
    return 'now';
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    onLike?.(post._id);
  };

  const handleRepost = () => {
    Alert.alert(
      'Repost',
      'How would you like to share this?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Repost', onPress: () => {
          setIsRetweeted(true);
          onRepost?.(post._id);
        }},
        { text: 'Quote', onPress: () => onRepost?.(post._id) },
      ]
    );
  };

  const handleUserPress = () => {
    if (author.username) {
      onUserPress?.(author.username);
    }
  };

  const renderHashtags = (text: string) => {
    if (!text) return null;
    
    const parts = text.split(/(#[\w\u0900-\u097F]+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('#')) {
        return (
          <Text
            key={index}
            className="text-orange-600 font-medium"
            onPress={() => onHashtagPress?.(part.slice(1))}
          >
            {part}
          </Text>
        );
      }
      return <Text key={index}>{part}</Text>;
    });
  };

  const renderMedia = () => {
    const media = post.content?.media;
    if (!media) return null;

    // Render images
    if (media.images && media.images.length > 0) {
      const imageCount = media.images.length;
      return (
        <View className="mt-3 rounded-2xl overflow-hidden">
          {imageCount === 1 ? (
            <Image
              source={{ uri: media.images[0].url }}
              className="w-full h-52 bg-gray-200"
              resizeMode="cover"
            />
          ) : (
            <View className="flex-row flex-wrap">
              {media.images.slice(0, 4).map((img, idx) => (
                <View 
                  key={idx} 
                  className={`${imageCount === 2 ? 'w-1/2' : 'w-1/2'} h-32 p-0.5`}
                >
                  <Image
                    source={{ uri: img.url }}
                    className="w-full h-full rounded-lg bg-gray-200"
                    resizeMode="cover"
                  />
                  {idx === 3 && imageCount > 4 && (
                    <View className="absolute inset-0 bg-black/50 rounded-lg items-center justify-center m-0.5">
                      <Text className="text-white font-bold text-lg">+{imageCount - 4}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      );
    }

    // Render video thumbnail
    if (media.video) {
      return (
        <TouchableOpacity 
          className="mt-3 rounded-2xl overflow-hidden bg-gray-900"
          onPress={() => router.push(`/videos/${media.video?._id}`)}
        >
          {media.video.thumbnail?.url ? (
            <Image
              source={{ uri: media.video.thumbnail.url }}
              className="w-full h-44"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-44 bg-gray-800 items-center justify-center">
              <Ionicons name="videocam" size={40} color="#9ca3af" />
            </View>
          )}
          <View className="absolute inset-0 items-center justify-center">
            <View className="bg-black/60 rounded-full p-3">
              <Ionicons name="play" size={28} color="white" />
            </View>
          </View>
          {media.video.duration && (
            <View className="absolute bottom-2 right-2 bg-black/70 px-2 py-0.5 rounded">
              <Text className="text-white text-xs font-medium">
                {Math.floor(media.video.duration / 60)}:{String(Math.floor(media.video.duration % 60)).padStart(2, '0')}
              </Text>
            </View>
          )}
          <View className="p-3 bg-gray-900">
            <Text className="text-white font-medium" numberOfLines={1}>
              {media.video.title}
            </Text>
            <Text className="text-gray-400 text-sm mt-1">
              {formatNumber(media.video.views || 0)} views
            </Text>
          </View>
        </TouchableOpacity>
      );
    }

    return null;
  };

  // Render quoted/original post for retweets
  const renderOriginalPost = () => {
    if (!post.originalPost) return null;

    const original = post.originalPost;
    const originalAuthor = original.author || {};
    const originalDisplayName = originalAuthor.displayName || 
      (originalAuthor.firstName && originalAuthor.lastName 
        ? `${originalAuthor.firstName} ${originalAuthor.lastName}` 
        : originalAuthor.username || 'Unknown');

    return (
      <View className="mt-3 border border-gray-200 rounded-2xl p-3 bg-gray-50">
        <View className="flex-row items-center">
          {originalAuthor.avatar ? (
            <Image
              source={{ uri: originalAuthor.avatar }}
              className="w-5 h-5 rounded-full bg-gray-300"
            />
          ) : (
            <View className="w-5 h-5 rounded-full bg-orange-100 items-center justify-center">
              <Text className="text-orange-600 text-xs font-bold">
                {(originalDisplayName)[0]?.toUpperCase()}
              </Text>
            </View>
          )}
          <Text className="text-gray-900 font-semibold text-sm ml-2">
            {originalDisplayName}
          </Text>
          <Text className="text-gray-500 text-sm ml-1">
            @{originalAuthor.username}
          </Text>
        </View>
        {original.content?.text && (
          <Text className="text-gray-800 mt-2 text-sm" numberOfLines={3}>
            {original.content.text}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View className="bg-white border-b border-gray-100">
      {/* Retweet indicator */}
      {post.postType === 'retweet' && (
        <View className="flex-row items-center px-4 pt-3 pb-1">
          <Ionicons name="repeat" size={14} color="#6b7280" />
          <Text className="text-gray-500 text-xs ml-2 font-medium">
            {displayName} reposted
          </Text>
        </View>
      )}

      <View className="flex-row px-4 py-3">
        {/* Avatar */}
        <TouchableOpacity onPress={handleUserPress}>
          {author.avatar ? (
            <Image
              source={{ uri: author.avatar }}
              className="w-12 h-12 rounded-full bg-gray-300"
            />
          ) : (
            <View className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 items-center justify-center">
              <Text className="text-white font-bold text-lg">
                {displayName[0]?.toUpperCase() || '?'}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Content */}
        <View className="flex-1 ml-3">
          {/* Header */}
          <View className="flex-row items-center flex-wrap">
            <TouchableOpacity onPress={handleUserPress} className="flex-row items-center">
              <Text className="text-gray-900 font-bold text-base">
                {displayName}
              </Text>
              {author.isVerified && (
                <Ionicons name="checkmark-circle" size={16} color="#f97316" className="ml-1" />
              )}
            </TouchableOpacity>
            <Text className="text-gray-500 text-sm ml-1">
              @{author.username}
            </Text>
            <Text className="text-gray-400 text-sm ml-1">·</Text>
            <Text className="text-gray-500 text-sm ml-1">
              {formatTimeAgo(post.createdAt)}
            </Text>
          </View>

          {/* Quote text (for quote tweets) */}
          {post.postType === 'quote' && post.quoteText && (
            <Text className="text-gray-900 mt-2 text-base leading-5">
              {renderHashtags(post.quoteText)}
            </Text>
          )}

          {/* Post text */}
          {post.content?.text && (
            <Text className="text-gray-900 mt-1 text-base leading-5">
              {renderHashtags(post.content.text)}
            </Text>
          )}

          {/* Media */}
          {renderMedia()}

          {/* Original post for retweets/quotes */}
          {renderOriginalPost()}

          {/* Actions */}
          {showActions && (
            <View className="flex-row items-center justify-between mt-3 pr-8">
              {/* Comment */}
              <TouchableOpacity 
                className="flex-row items-center"
                onPress={() => onComment?.(post._id)}
              >
                <Ionicons name="chatbubble-outline" size={18} color="#6b7280" />
                {(post.metrics?.comments || 0) > 0 && (
                  <Text className="text-gray-500 text-sm ml-1.5">
                    {formatNumber(post.metrics.comments)}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Repost */}
              <TouchableOpacity 
                className="flex-row items-center"
                onPress={handleRepost}
              >
                <Ionicons 
                  name="repeat" 
                  size={18} 
                  color={isRetweeted ? '#22c55e' : '#6b7280'} 
                />
                {(post.metrics?.retweets || 0) > 0 && (
                  <Text className={`text-sm ml-1.5 ${isRetweeted ? 'text-green-500' : 'text-gray-500'}`}>
                    {formatNumber(post.metrics.retweets)}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Like */}
              <TouchableOpacity 
                className="flex-row items-center"
                onPress={handleLike}
              >
                <Ionicons 
                  name={isLiked ? 'heart' : 'heart-outline'} 
                  size={18} 
                  color={isLiked ? '#ef4444' : '#6b7280'} 
                />
                {likesCount > 0 && (
                  <Text className={`text-sm ml-1.5 ${isLiked ? 'text-red-500' : 'text-gray-500'}`}>
                    {formatNumber(likesCount)}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Share */}
              <TouchableOpacity 
                className="flex-row items-center"
                onPress={() => onShare?.(post._id)}
              >
                <Ionicons name="share-outline" size={18} color="#6b7280" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
});

PostCard.displayName = 'PostCard';

export default PostCard;
