/**
 * PostCard Component - Clean Light Design
 * Professional card matching Learn tab aesthetics
 */

import React, { useState, memo } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CommunityPost } from '../../services/communityService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Light Theme Colors - Matching Learn Tab
const COLORS = {
  saffron: '#DD7A1F',
  copper: '#B87333',
  gold: '#D4A017',
  white: '#FFFFFF',
  background: '#F9FAFB',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
};

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
    return 'just now';
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    onLike?.(post._id);
  };

  const handleRepost = () => {
    Alert.alert(
      'Share This Post',
      'How would you like to share?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Repost', 
          onPress: () => {
            setIsRetweeted(true);
            onRepost?.(post._id);
          }
        },
        { text: 'Quote', onPress: () => onRepost?.(post._id) },
      ]
    );
  };

  const handleUserPress = () => {
    if (author.username) {
      onUserPress?.(author.username);
    }
  };

  const handleHashtagClick = (hashtag: string) => {
    onHashtagPress?.(hashtag);
  };

  const renderHashtags = () => {
    const hashtags = post.content?.hashtags || [];
    if (hashtags.length === 0) return null;

    return (
      <View style={styles.hashtagsContainer}>
        {hashtags.slice(0, 3).map((tag, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleHashtagClick(tag)}
            style={styles.hashtagBadge}
          >
            <Text style={styles.hashtagText}>#{tag}</Text>
          </TouchableOpacity>
        ))}
        {hashtags.length > 3 && (
          <Text style={styles.moreHashtags}>+{hashtags.length - 3}</Text>
        )}
      </View>
    );
  };

  const renderMedia = () => {
    const images = post.content?.media?.images || [];
    if (images.length === 0) return null;

    return (
      <View style={styles.mediaContainer}>
        {images.length === 1 ? (
          <Image 
            source={{ uri: images[0].url }} 
            style={styles.singleImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.multiImageGrid}>
            {images.slice(0, 4).map((img, index) => (
              <View 
                key={index} 
                style={[
                  styles.gridImage,
                  images.length === 2 && styles.gridImageTwo,
                  images.length === 3 && index === 0 && styles.gridImageThreeMain,
                ]}
              >
                <Image 
                  source={{ uri: img.url }} 
                  style={styles.gridImageFull}
                  resizeMode="cover"
                />
                {index === 3 && images.length > 4 && (
                  <View style={styles.moreImagesOverlay}>
                    <Text style={styles.moreImagesText}>+{images.length - 4}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.cardContainer}>
      {/* Header - User Info */}
      <TouchableOpacity 
        style={styles.header}
        onPress={handleUserPress}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          {author.avatar ? (
            <Image source={{ uri: author.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {displayName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.displayName} numberOfLines={1}>
              {displayName}
            </Text>
            {author.isVerified && (
              <Ionicons name="checkmark-circle" size={14} color={COLORS.saffron} style={styles.verifiedIcon} />
            )}
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.username}>@{author.username}</Text>
            <Text style={styles.separator}>•</Text>
            <Text style={styles.timeAgo}>{formatTimeAgo(post.createdAt)}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-horizontal" size={20} color={COLORS.gray400} />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Content */}
      <View style={styles.content}>
        {post.content?.text && (
          <Text style={styles.contentText}>
            {post.content.text}
          </Text>
        )}

        {renderHashtags()}
        {renderMedia()}

        {/* Location */}
        {post.location?.name && (
          <View style={styles.locationContainer}>
            <Ionicons name="location-outline" size={14} color={COLORS.gray400} />
            <Text style={styles.locationText}>{post.location.name}</Text>
          </View>
        )}
      </View>

      {/* Engagement Stats */}
      {(post.metrics?.views > 0 || post.metrics?.likes > 0) && (
        <View style={styles.statsRow}>
          {post.metrics?.views > 0 && (
            <View style={styles.statItem}>
              <Ionicons name="eye-outline" size={14} color={COLORS.gray400} />
              <Text style={styles.statText}>{formatNumber(post.metrics.views)} views</Text>
            </View>
          )}
          {post.metrics?.likes > 0 && (
            <View style={styles.statItem}>
              <Ionicons name="heart" size={14} color={COLORS.saffron} />
              <Text style={styles.statText}>{formatNumber(post.metrics.likes)} likes</Text>
            </View>
          )}
        </View>
      )}

      {/* Actions */}
      {showActions && (
        <View style={styles.actions}>
          <View style={styles.actionsDivider} />
          
          <View style={styles.actionsRow}>
            {/* Like */}
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleLike}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={isLiked ? 'heart' : 'heart-outline'} 
                size={20} 
                color={isLiked ? '#EF4444' : COLORS.gray500}
              />
              {likesCount > 0 && (
                <Text style={[styles.actionText, isLiked && styles.actionTextLiked]}>
                  {formatNumber(likesCount)}
                </Text>
              )}
            </TouchableOpacity>

            {/* Comment */}
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => onComment?.(post._id)}
              activeOpacity={0.7}
            >
              <Ionicons name="chatbubble-outline" size={20} color={COLORS.gray500} />
              {post.metrics?.comments > 0 && (
                <Text style={styles.actionText}>
                  {formatNumber(post.metrics.comments)}
                </Text>
              )}
            </TouchableOpacity>

            {/* Repost */}
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleRepost}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={isRetweeted ? 'repeat' : 'repeat-outline'} 
                size={20} 
                color={isRetweeted ? '#22C55E' : COLORS.gray500}
              />
              {post.metrics?.retweets > 0 && (
                <Text style={[styles.actionText, isRetweeted && styles.actionTextRetweeted]}>
                  {formatNumber(post.metrics.retweets)}
                </Text>
              )}
            </TouchableOpacity>

            {/* Share */}
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => onShare?.(post._id)}
              activeOpacity={0.7}
            >
              <Ionicons name="share-outline" size={20} color={COLORS.gray500} />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: 12,
    marginVertical: 6,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.gray100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.saffron,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  displayName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.gray800,
    maxWidth: SCREEN_WIDTH - 150,
  },
  verifiedIcon: {
    marginLeft: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  username: {
    fontSize: 14,
    color: COLORS.gray500,
  },
  separator: {
    marginHorizontal: 6,
    color: COLORS.gray300,
    fontSize: 12,
  },
  timeAgo: {
    fontSize: 13,
    color: COLORS.gray400,
  },
  moreButton: {
    padding: 4,
  },
  content: {
    marginBottom: 8,
  },
  contentText: {
    fontSize: 15,
    lineHeight: 22,
    color: COLORS.gray700,
    marginBottom: 8,
  },
  hashtagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    marginBottom: 8,
    gap: 8,
  },
  hashtagBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: COLORS.gray100,
    borderRadius: 12,
  },
  hashtagText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.saffron,
  },
  moreHashtags: {
    fontSize: 13,
    color: COLORS.gray400,
    fontWeight: '500',
    alignSelf: 'center',
  },
  mediaContainer: {
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  singleImage: {
    width: '100%',
    height: 280,
    borderRadius: 12,
  },
  multiImageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  gridImage: {
    width: (SCREEN_WIDTH - 60) / 2,
    height: 160,
    borderRadius: 8,
    overflow: 'hidden',
  },
  gridImageTwo: {
    width: (SCREEN_WIDTH - 60) / 2,
    height: 200,
  },
  gridImageThreeMain: {
    width: SCREEN_WIDTH - 48,
    height: 200,
  },
  gridImageFull: {
    width: '100%',
    height: '100%',
  },
  moreImagesOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreImagesText: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.white,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    color: COLORS.gray500,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingTop: 4,
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 13,
    color: COLORS.gray500,
  },
  actions: {
    marginTop: 4,
  },
  actionsDivider: {
    height: 1,
    backgroundColor: COLORS.gray100,
    marginBottom: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 6,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray500,
  },
  actionTextLiked: {
    color: '#EF4444',
  },
  actionTextRetweeted: {
    color: '#22C55E',
  },
});

PostCard.displayName = 'PostCard';

export default PostCard;
