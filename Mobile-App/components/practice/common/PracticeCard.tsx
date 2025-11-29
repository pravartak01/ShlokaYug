import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions,
  Image 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { DifficultyLevel } from '../../../types/practice';

interface PracticeCardProps {
  // Content
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  
  // Type & Category
  type: 'karaoke' | 'voice-analysis' | 'challenge';
  category?: string;
  difficulty?: DifficultyLevel;
  
  // Stats
  duration?: number; // in seconds
  practiceCount?: number;
  rating?: number;
  participants?: number;
  
  // Status
  isLocked?: boolean;
  isCompleted?: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
  progress?: number; // 0-100
  
  // Actions
  onPress?: () => void;
  onBookmark?: () => void;
  isBookmarked?: boolean;
  
  // Size & Style
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'compact' | 'featured' | 'list';
  style?: object;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CARD_COLORS: Record<string, { primary: string; secondary: string; gradient: [string, string] }> = {
  karaoke: { primary: '#FF6B35', secondary: '#FFB89A', gradient: ['#FF6B35', '#FF8F6B'] },
  'voice-analysis': { primary: '#6B5CE7', secondary: '#A39BF7', gradient: ['#6B5CE7', '#8B7EF7'] },
  challenge: { primary: '#00BFA5', secondary: '#64FFDA', gradient: ['#00BFA5', '#00E5CC'] },
};

const DIFFICULTY_COLORS = {
  beginner: '#4CAF50',
  intermediate: '#FF9800',
  advanced: '#F44336',
  expert: '#9C27B0',
};

const TYPE_ICONS: Record<string, string> = {
  karaoke: 'microphone-variant',
  'voice-analysis': 'waveform',
  challenge: 'trophy-variant',
};

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins > 0) {
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  return `${secs}s`;
};

const formatCount = (count: number): string => {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
  return count.toString();
};

const PracticeCard: React.FC<PracticeCardProps> = ({
  title,
  subtitle,
  description,
  imageUrl,
  type,
  category,
  difficulty,
  duration,
  practiceCount,
  rating,
  participants,
  isLocked = false,
  isCompleted = false,
  isNew = false,
  isFeatured = false,
  progress,
  onPress,
  onBookmark,
  isBookmarked = false,
  size = 'medium',
  variant = 'default',
  style = {},
}) => {
  const colors = CARD_COLORS[type];
  const difficultyColor = difficulty ? DIFFICULTY_COLORS[difficulty] : colors.primary;
  const typeIcon = TYPE_ICONS[type] || 'help-circle';

  // Size configurations
  const sizeConfig = {
    small: { width: 140, height: 180, imageHeight: 80, fontSize: 12, iconSize: 14 },
    medium: { width: 180, height: 220, imageHeight: 100, fontSize: 14, iconSize: 16 },
    large: { width: SCREEN_WIDTH - 32, height: 280, imageHeight: 160, fontSize: 16, iconSize: 20 },
  };
  const config = sizeConfig[size];

  // Featured Card
  if (variant === 'featured') {
    return (
      <TouchableOpacity
        style={[styles.featuredCard, style]}
        onPress={onPress}
        disabled={isLocked}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={colors.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.featuredGradient}
        >
          <View style={styles.featuredContent}>
            <View style={styles.featuredHeader}>
              <View style={styles.typeBadge}>
                <MaterialCommunityIcons name={typeIcon as any} size={16} color="#fff" />
                <Text style={styles.typeBadgeText}>
                  {type.replace('-', ' ').toUpperCase()}
                </Text>
              </View>
              {onBookmark && (
                <TouchableOpacity onPress={onBookmark} style={styles.bookmarkBtn}>
                  <MaterialCommunityIcons
                    name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                    size={24}
                    color="#fff"
                  />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.featuredMain}>
              <Text style={styles.featuredTitle}>{title}</Text>
              {subtitle && <Text style={styles.featuredSubtitle}>{subtitle}</Text>}
            </View>

            <View style={styles.featuredFooter}>
              <View style={styles.featuredStats}>
                {duration && (
                  <View style={styles.statItem}>
                    <MaterialCommunityIcons name="clock-outline" size={14} color="#fff" />
                    <Text style={styles.statText}>{formatDuration(duration)}</Text>
                  </View>
                )}
                {practiceCount !== undefined && (
                  <View style={styles.statItem}>
                    <MaterialCommunityIcons name="account-group" size={14} color="#fff" />
                    <Text style={styles.statText}>{formatCount(practiceCount)}</Text>
                  </View>
                )}
                {difficulty && (
                  <View style={[styles.difficultyBadge, { backgroundColor: '#ffffff30' }]}>
                    <Text style={styles.difficultyText}>
                      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </Text>
                  </View>
                )}
              </View>
              
              <View style={styles.playButton}>
                <MaterialCommunityIcons name="play" size={24} color={colors.primary} />
              </View>
            </View>
          </View>

          {/* Decorative elements */}
          <View style={styles.featuredDecor1} />
          <View style={styles.featuredDecor2} />
        </LinearGradient>

        {isLocked && (
          <View style={styles.lockedOverlay}>
            <MaterialCommunityIcons name="lock" size={32} color="#fff" />
            <Text style={styles.lockedText}>Locked</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // List Card
  if (variant === 'list') {
    return (
      <TouchableOpacity
        style={[styles.listCard, style]}
        onPress={onPress}
        disabled={isLocked}
        activeOpacity={0.8}
      >
        {/* Thumbnail */}
        <View style={[styles.listThumbnail, { backgroundColor: colors.secondary }]}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.listImage} />
          ) : (
            <MaterialCommunityIcons name={typeIcon as any} size={24} color={colors.primary} />
          )}
          {isCompleted && (
            <View style={styles.completedBadge}>
              <MaterialCommunityIcons name="check" size={12} color="#fff" />
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.listContent}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle} numberOfLines={1}>{title}</Text>
            {isNew && <View style={styles.newBadge}><Text style={styles.newBadgeText}>NEW</Text></View>}
          </View>
          {subtitle && <Text style={styles.listSubtitle} numberOfLines={1}>{subtitle}</Text>}
          
          <View style={styles.listMeta}>
            {duration && (
              <View style={styles.metaItem}>
                <MaterialCommunityIcons name="clock-outline" size={12} color="#888" />
                <Text style={styles.metaText}>{formatDuration(duration)}</Text>
              </View>
            )}
            {difficulty && (
              <View style={[styles.miniDifficultyBadge, { backgroundColor: difficultyColor + '20' }]}>
                <Text style={[styles.miniDifficultyText, { color: difficultyColor }]}>
                  {difficulty.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            {rating !== undefined && (
              <View style={styles.metaItem}>
                <MaterialCommunityIcons name="star" size={12} color="#FFD700" />
                <Text style={styles.metaText}>{rating.toFixed(1)}</Text>
              </View>
            )}
          </View>

          {/* Progress bar */}
          {progress !== undefined && progress > 0 && (
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: colors.primary }]} />
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.listActions}>
          {onBookmark && (
            <TouchableOpacity onPress={onBookmark} style={styles.listBookmark}>
              <MaterialCommunityIcons
                name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                size={20}
                color={isBookmarked ? colors.primary : '#888'}
              />
            </TouchableOpacity>
          )}
          <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
        </View>

        {isLocked && (
          <View style={styles.listLockedOverlay}>
            <MaterialCommunityIcons name="lock" size={20} color="#fff" />
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // Default Card
  return (
    <TouchableOpacity
      style={[
        styles.defaultCard,
        { width: config.width, height: config.height },
        style,
      ]}
      onPress={onPress}
      disabled={isLocked}
      activeOpacity={0.85}
    >
      {/* Image/Thumbnail */}
      <View style={[styles.cardImage, { height: config.imageHeight, backgroundColor: colors.secondary }]}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <MaterialCommunityIcons name={typeIcon as any} size={config.iconSize * 2} color={colors.primary} />
        )}
        
        {/* Badges */}
        <View style={styles.badgeContainer}>
          {isNew && (
            <View style={[styles.badge, { backgroundColor: '#FF4444' }]}>
              <Text style={styles.badgeText}>NEW</Text>
            </View>
          )}
          {isFeatured && (
            <View style={[styles.badge, { backgroundColor: '#FFD700' }]}>
              <MaterialCommunityIcons name="star" size={10} color="#fff" />
            </View>
          )}
        </View>

        {/* Completed indicator */}
        {isCompleted && (
          <View style={styles.completedOverlay}>
            <MaterialCommunityIcons name="check-circle" size={24} color="#4CAF50" />
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.cardContent}>
        <Text style={[styles.cardTitle, { fontSize: config.fontSize }]} numberOfLines={2}>
          {title}
        </Text>

        <View style={styles.cardMeta}>
          {category && (
            <Text style={[styles.cardCategory, { color: colors.primary }]} numberOfLines={1}>
              {category}
            </Text>
          )}
          
          <View style={styles.cardStats}>
            {duration && (
              <View style={styles.cardStatItem}>
                <MaterialCommunityIcons name="clock-outline" size={config.iconSize - 2} color="#888" />
                <Text style={styles.cardStatText}>{formatDuration(duration)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Difficulty indicator */}
        {difficulty && (
          <View style={[styles.difficultyIndicator, { backgroundColor: difficultyColor + '20' }]}>
            <View style={[styles.difficultyDot, { backgroundColor: difficultyColor }]} />
            <Text style={[styles.difficultyLabel, { color: difficultyColor }]}>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </Text>
          </View>
        )}
      </View>

      {/* Progress overlay */}
      {progress !== undefined && progress > 0 && (
        <View style={[styles.cardProgress, { width: `${progress}%`, backgroundColor: colors.primary + '30' }]} />
      )}

      {/* Locked overlay */}
      {isLocked && (
        <View style={styles.cardLockedOverlay}>
          <MaterialCommunityIcons name="lock" size={24} color="#fff" />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Featured Card Styles
  featuredCard: {
    width: SCREEN_WIDTH - 32,
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    marginVertical: 8,
  },
  featuredGradient: {
    flex: 1,
    padding: 20,
  },
  featuredContent: {
    flex: 1,
    justifyContent: 'space-between',
    zIndex: 1,
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  typeBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  bookmarkBtn: {
    padding: 4,
  },
  featuredMain: {
    marginVertical: 12,
  },
  featuredTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  featuredSubtitle: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 4,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    color: '#fff',
    fontSize: 12,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  difficultyText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featuredDecor1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  featuredDecor2: {
    position: 'absolute',
    bottom: -40,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  lockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockedText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },

  // List Card Styles
  listCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  listThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  listImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  completedBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  newBadge: {
    backgroundColor: '#FF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  newBadgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  listSubtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  listMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: 11,
    color: '#888',
  },
  miniDifficultyBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniDifficultyText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  progressContainer: {
    height: 3,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  listActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  listBookmark: {
    padding: 4,
  },
  listLockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Default Card Styles
  defaultCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    marginHorizontal: 8,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgeContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    gap: 4,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  completedOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 2,
  },
  cardContent: {
    flex: 1,
    padding: 12,
  },
  cardTitle: {
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  cardMeta: {
    flex: 1,
  },
  cardCategory: {
    fontSize: 11,
    fontWeight: '500',
  },
  cardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  cardStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  cardStatText: {
    fontSize: 10,
    color: '#888',
  },
  difficultyIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginTop: 6,
    gap: 4,
  },
  difficultyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  difficultyLabel: {
    fontSize: 9,
    fontWeight: '600',
  },
  cardProgress: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 3,
  },
  cardLockedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PracticeCard;
