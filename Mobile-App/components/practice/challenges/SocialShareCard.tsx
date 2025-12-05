// SocialShareCard - Shareable achievement cards for social media
import React, { useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { UserChallengeProgress, Challenge, BadgeInfo, UserStats } from '../../../types/challenges';

// Note: Install these packages for full functionality:
// npx expo install react-native-view-shot expo-media-library expo-sharing

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SocialShareCardProps {
  type: 'achievement' | 'certificate' | 'badge' | 'streak' | 'level-up';
  challenge?: Challenge;
  progress?: UserChallengeProgress;
  userStats: UserStats;
  badge?: BadgeInfo;
  onClose: () => void;
}

export const SocialShareCard: React.FC<SocialShareCardProps> = ({
  type,
  challenge,
  progress,
  userStats,
  badge,
  onClose,
}) => {
  const cardRef = useRef<View>(null);

  const handleShare = useCallback(async (platform: 'instagram' | 'linkedin' | 'twitter' | 'general') => {
    try {
      // Generate share message based on platform
      let message = '';
      const hashtags = '#ShlokaYug #SanskritLearning #IndianCulture #Shlokas';

      switch (type) {
        case 'achievement':
          message = `🏆 Just scored ${progress?.percentage}% on "${challenge?.title}" challenge!\n\n${hashtags}`;
          break;
        case 'badge':
          message = `🎖️ Earned the "${badge?.name}" badge on ShlokaYug!\n\n${hashtags}`;
          break;
        case 'streak':
          message = `🔥 ${userStats.currentStreak} day streak on ShlokaYug! Learning Sanskrit daily!\n\n${hashtags}`;
          break;
        case 'level-up':
          message = `⬆️ Reached Level ${userStats.level} on ShlokaYug!\n\n${hashtags}`;
          break;
        default:
          message = `Learning Sanskrit on ShlokaYug! 🙏\n\n${hashtags}`;
      }

      if (platform === 'general') {
        await Share.share({
          message,
        });
      } else {
        // For specific platforms, show instructions
        Alert.alert(
          'Share Your Achievement! 📸',
          `Share on ${platform.charAt(0).toUpperCase() + platform.slice(1)} with this caption:\n\n"${message}"\n\nNote: Install npx expo install react-native-view-shot expo-media-library expo-sharing for full image sharing.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share. Please try again.');
    }
  }, [type, challenge, progress, userStats, badge]);

  const renderAchievementCard = () => (
    <LinearGradient
      colors={challenge?.gradient || ['#8D6E63', '#6D4C41']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      {/* App Branding */}
      <View style={styles.branding}>
        <MaterialCommunityIcons name="om" size={24} color="white" />
        <Text style={styles.brandName}>ShlokaYug</Text>
      </View>

      {/* Trophy */}
      <View style={styles.trophyContainer}>
        <MaterialCommunityIcons name="trophy" size={60} color="#FFD700" />
      </View>

      {/* Achievement */}
      <Text style={styles.achievementTitle}>Challenge Completed!</Text>
      <Text style={styles.challengeName}>{challenge?.title}</Text>
      <Text style={styles.challengeNameHindi}>{challenge?.titleHindi}</Text>

      {/* Score */}
      <View style={styles.scoreContainer}>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreValue}>{progress?.percentage}%</Text>
          <Text style={styles.scoreLabel}>Score</Text>
        </View>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreValue}>+{progress?.earnedXp}</Text>
          <Text style={styles.scoreLabel}>XP</Text>
        </View>
      </View>

      {/* User Info */}
      <View style={styles.userInfo}>
        <MaterialCommunityIcons name="account-circle" size={24} color="white" />
        <Text style={styles.userName}>{userStats.username}</Text>
        <Text style={styles.userLevel}>Level {userStats.level}</Text>
      </View>

      {/* Decorative Elements */}
      <View style={styles.decorLeft}>
        <MaterialCommunityIcons name="star-four-points" size={20} color="rgba(255,255,255,0.3)" />
      </View>
      <View style={styles.decorRight}>
        <MaterialCommunityIcons name="star-four-points" size={20} color="rgba(255,255,255,0.3)" />
      </View>
    </LinearGradient>
  );

  const renderBadgeCard = () => (
    <LinearGradient
      colors={['#0A0A0A', '#1A1A1A', '#2A2A2A']}
      style={styles.card}
    >
      {/* App Branding */}
      <View style={styles.branding}>
        <MaterialCommunityIcons name="om" size={24} color="white" />
        <Text style={styles.brandName}>ShlokaYug</Text>
      </View>

      {/* Badge */}
      <View style={[styles.badgeIconLarge, { backgroundColor: badge?.color || '#FFD700' }]}>
        <MaterialCommunityIcons name={badge?.icon as any || 'medal'} size={50} color="white" />
      </View>

      <Text style={styles.badgeEarned}>Badge Earned! 🎖️</Text>
      <Text style={styles.badgeName}>{badge?.name}</Text>
      <Text style={styles.badgeNameHindi}>{badge?.nameHindi}</Text>

      <View style={[styles.rarityBadge, { backgroundColor: badge?.color }]}>
        <Text style={styles.rarityText}>{badge?.rarity?.toUpperCase()}</Text>
      </View>

      <Text style={styles.badgeDescription}>{badge?.description}</Text>

      {/* User Info */}
      <View style={styles.userInfo}>
        <MaterialCommunityIcons name="account-circle" size={24} color="white" />
        <Text style={styles.userName}>{userStats.username}</Text>
        <Text style={styles.userLevel}>Level {userStats.level}</Text>
      </View>
    </LinearGradient>
  );

  const renderStreakCard = () => (
    <LinearGradient
      colors={['#8D6E63', '#6D4C41', '#4A2E1C']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      {/* App Branding */}
      <View style={styles.branding}>
        <MaterialCommunityIcons name="om" size={24} color="white" />
        <Text style={styles.brandName}>ShlokaYug</Text>
      </View>

      {/* Fire Animation */}
      <View style={styles.streakIconContainer}>
        <MaterialCommunityIcons name="fire" size={80} color="white" />
      </View>

      <Text style={styles.streakNumber}>{userStats.currentStreak}</Text>
      <Text style={styles.streakLabel}>Day Streak! 🔥</Text>

      <Text style={styles.streakMessage}>
        Consistently learning Sanskrit for {userStats.currentStreak} days!
      </Text>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{userStats.totalXp.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Total XP</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{userStats.challengesCompleted}</Text>
          <Text style={styles.statLabel}>Challenges</Text>
        </View>
      </View>

      {/* User Info */}
      <View style={styles.userInfo}>
        <MaterialCommunityIcons name="account-circle" size={24} color="white" />
        <Text style={styles.userName}>{userStats.username}</Text>
        <Text style={styles.userLevel}>Level {userStats.level}</Text>
      </View>
    </LinearGradient>
  );

  const renderCard = () => {
    switch (type) {
      case 'achievement':
      case 'certificate':
        return renderAchievementCard();
      case 'badge':
        return renderBadgeCard();
      case 'streak':
      case 'level-up':
        return renderStreakCard();
      default:
        return renderAchievementCard();
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0A0A', '#1A1A1A', '#2A2A2A']}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <MaterialCommunityIcons name="close" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Share Your Achievement</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Preview Card */}
      <View style={styles.previewContainer}>
        <View ref={cardRef} collapsable={false}>
          {renderCard()}
        </View>
      </View>

      {/* Share Buttons */}
      <View style={styles.shareContainer}>
        <Text style={styles.shareTitle}>Share to:</Text>

        <View style={styles.platformButtons}>
          <TouchableOpacity
            style={[styles.platformButton, { backgroundColor: '#E1306C' }]}
            onPress={() => handleShare('instagram')}
          >
            <MaterialCommunityIcons name="instagram" size={32} color="white" />
            <Text style={styles.platformName}>Instagram</Text>
            <Text style={styles.platformNote}>Story/Post</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.platformButton, { backgroundColor: '#0077B5' }]}
            onPress={() => handleShare('linkedin')}
          >
            <MaterialCommunityIcons name="linkedin" size={32} color="white" />
            <Text style={styles.platformName}>LinkedIn</Text>
            <Text style={styles.platformNote}>Post</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.platformButton, { backgroundColor: '#1DA1F2' }]}
            onPress={() => handleShare('twitter')}
          >
            <MaterialCommunityIcons name="twitter" size={32} color="white" />
            <Text style={styles.platformName}>Twitter</Text>
            <Text style={styles.platformNote}>Tweet</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.moreButton}
          onPress={() => handleShare('general')}
        >
          <MaterialCommunityIcons name="share-variant" size={24} color="white" />
          <Text style={styles.moreButtonText}>More Options</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  previewContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  card: {
    width: SCREEN_WIDTH - 40,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    minHeight: 400,
    justifyContent: 'center',
  },
  branding: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandName: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  trophyContainer: {
    marginBottom: 20,
  },
  achievementTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
  },
  challengeName: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  challengeNameHindi: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
    marginBottom: 20,
  },
  scoreContainer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  scoreBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
  },
  scoreLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  userLevel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  decorLeft: {
    position: 'absolute',
    bottom: 20,
    left: 20,
  },
  decorRight: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  badgeIconLarge: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 10,
  },
  badgeEarned: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFD700',
  },
  badgeNameHindi: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  rarityBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 16,
  },
  rarityText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
  },
  badgeDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  streakIconContainer: {
    marginBottom: 10,
  },
  streakNumber: {
    fontSize: 72,
    fontWeight: '900',
    color: 'white',
    lineHeight: 80,
  },
  streakLabel: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 16,
  },
  streakMessage: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 30,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  shareContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  shareTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 16,
  },
  platformButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  platformButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    borderRadius: 16,
    gap: 6,
  },
  platformName: {
    fontSize: 12,
    fontWeight: '700',
    color: 'white',
  },
  platformNote: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
  },
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 25,
    gap: 10,
  },
  moreButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default SocialShareCard;
