// Results Screen - Shows challenge completion results and rewards
import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Challenge, UserChallengeProgress } from '../../../types/challenges';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ResultsScreenProps {
  challenge: Challenge;
  progress: UserChallengeProgress;
  onRetry: () => void;
  onExit: () => void;
  onViewCertificate: () => void;
  onShare: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  challenge,
  progress,
  onRetry,
  onExit,
  onViewCertificate,
  onShare,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scoreAnim = useRef(new Animated.Value(0)).current;
  const starsAnim = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;
  const confettiAnims = useRef(
    Array(20).fill(0).map(() => ({
      y: new Animated.Value(0),
      x: new Animated.Value(Math.random() * SCREEN_WIDTH),
      rotate: new Animated.Value(0),
    }))
  ).current;

  const isPassed = progress.completed;
  const starsEarned = progress.percentage >= 90 ? 3 : progress.percentage >= 70 ? 2 : progress.percentage >= 50 ? 1 : 0;

  useEffect(() => {
    // Entrance animation
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(scoreAnim, {
          toValue: progress.percentage,
          duration: 1500,
          useNativeDriver: false,
        }),
        ...starsAnim.map((anim, index) =>
          Animated.sequence([
            Animated.delay(500 + index * 300),
            Animated.spring(anim, {
              toValue: index < starsEarned ? 1 : 0.3,
              friction: 4,
              tension: 100,
              useNativeDriver: true,
            }),
          ])
        ),
      ]),
    ]).start();

    // Trophy rotation
    if (isPassed) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    // Confetti animation for success
    if (isPassed && progress.percentage >= 70) {
      confettiAnims.forEach((anim, index) => {
        Animated.loop(
          Animated.parallel([
            Animated.sequence([
              Animated.timing(anim.y, {
                toValue: 1,
                duration: 2000 + Math.random() * 1000,
                useNativeDriver: true,
              }),
              Animated.timing(anim.y, {
                toValue: 0,
                duration: 0,
                useNativeDriver: true,
              }),
            ]),
            Animated.timing(anim.rotate, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
          ])
        ).start();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getResultMessage = () => {
    if (progress.percentage >= 90) return { title: 'Outstanding! 🌟', subtitle: 'You mastered this challenge!' };
    if (progress.percentage >= 70) return { title: 'Excellent! 🎉', subtitle: 'Great performance!' };
    if (progress.percentage >= 50) return { title: 'Good Job! 👏', subtitle: 'Keep practicing!' };
    return { title: 'Keep Learning! 📚', subtitle: 'Practice makes perfect!' };
  };

  const resultMessage = getResultMessage();

  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {starsAnim.map((anim, index) => (
          <Animated.View
            key={index}
            style={{
              transform: [
                { scale: anim },
                {
                  rotate: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
              ],
            }}
          >
            <MaterialCommunityIcons
              name={index < starsEarned ? 'star' : 'star-outline'}
              size={index === 1 ? 60 : 45}
              color={index < starsEarned ? '#FFD700' : 'rgba(255,255,255,0.3)'}
            />
          </Animated.View>
        ))}
      </View>
    );
  };

  const renderConfetti = () => {
    if (!isPassed || progress.percentage < 70) return null;

    const colors = ['#FF6B6B', '#4CAF50', '#FFD700', '#9333EA', '#00BCD4'];

    return confettiAnims.map((anim, index) => (
      <Animated.View
        key={index}
        style={[
          styles.confetti,
          {
            left: anim.x,
            transform: [
              {
                translateY: anim.y.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, SCREEN_WIDTH + 100],
                }),
              },
              {
                rotate: anim.rotate.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '720deg'],
                }),
              },
            ],
            backgroundColor: colors[index % colors.length],
          },
        ]}
      />
    ));
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isPassed ? ['#1a1a2e', '#16213e', '#0f3460'] : ['#1a1a2e', '#2d1f2d', '#1a1a2e']}
        style={StyleSheet.absoluteFill}
      />

      {/* Confetti */}
      {renderConfetti()}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Trophy/Result Icon */}
        <Animated.View
          style={[
            styles.trophyContainer,
            {
              transform: [
                { scale: scaleAnim },
                {
                  rotateY: rotateAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '10deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={isPassed ? ['#FFD700', '#FFA000'] : ['#666', '#444']}
            style={styles.trophyGradient}
          >
            <MaterialCommunityIcons
              name={isPassed ? 'trophy' : 'emoticon-sad-outline'}
              size={80}
              color={isPassed ? '#FFF' : 'rgba(255,255,255,0.5)'}
            />
          </LinearGradient>
        </Animated.View>

        {/* Stars */}
        {renderStars()}

        {/* Result Message */}
        <Text style={styles.resultTitle}>{resultMessage.title}</Text>
        <Text style={styles.resultSubtitle}>{resultMessage.subtitle}</Text>

        {/* Score Circle */}
        <View style={styles.scoreContainer}>
          <View style={styles.scoreCircle}>
            <LinearGradient
              colors={isPassed ? ['#4CAF50', '#2E7D32'] : ['#FF6B6B', '#CC2D26']}
              style={styles.scoreGradient}
            >
              <Animated.Text style={styles.scoreText}>
                {scoreAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['0', '100'],
                  extrapolate: 'clamp',
                })}
              </Animated.Text>
              <Text style={styles.scorePercent}>%</Text>
            </LinearGradient>
          </View>
          <Text style={styles.scoreLabel}>Your Score</Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="check-circle" size={28} color="#4CAF50" />
            <Text style={styles.statValue}>
              {progress.answers.filter(a => a.correct).length}/{challenge.questions.length}
            </Text>
            <Text style={styles.statLabel}>Correct</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="clock-outline" size={28} color="#2196F3" />
            <Text style={styles.statValue}>
              {Math.floor(progress.timeSpent / 60)}:{(progress.timeSpent % 60).toString().padStart(2, '0')}
            </Text>
            <Text style={styles.statLabel}>Time</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="star-circle" size={28} color="#FFD700" />
            <Text style={styles.statValue}>+{progress.earnedXp}</Text>
            <Text style={styles.statLabel}>XP Earned</Text>
          </View>
          <View style={styles.statCard}>
            <MaterialCommunityIcons name="gold" size={28} color="#FFC107" />
            <Text style={styles.statValue}>+{progress.earnedCoins}</Text>
            <Text style={styles.statLabel}>Coins</Text>
          </View>
        </View>

        {/* Badge Earned */}
        {progress.earnedBadge && (
          <View style={styles.badgeContainer}>
            <LinearGradient
              colors={['rgba(147,51,234,0.3)', 'rgba(255,107,107,0.2)']}
              style={styles.badgeCard}
            >
              <View style={styles.badgeIconContainer}>
                <MaterialCommunityIcons
                  name={progress.earnedBadge.icon as any}
                  size={40}
                  color={progress.earnedBadge.color}
                />
              </View>
              <Text style={styles.badgeEarnedText}>🎖️ Badge Earned!</Text>
              <Text style={styles.badgeName}>{progress.earnedBadge.name}</Text>
              <Text style={styles.badgeNameHindi}>{progress.earnedBadge.nameHindi}</Text>
              <View style={[styles.rarityBadge, { backgroundColor: progress.earnedBadge.color }]}>
                <Text style={styles.rarityText}>{progress.earnedBadge.rarity.toUpperCase()}</Text>
              </View>
            </LinearGradient>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsContainer}>
          {isPassed && (
            <>
              <TouchableOpacity style={styles.certificateButton} onPress={onViewCertificate}>
                <LinearGradient
                  colors={['#FFD700', '#FFA000']}
                  style={styles.actionButtonGradient}
                >
                  <MaterialCommunityIcons name="certificate" size={24} color="#1a1a2e" />
                  <Text style={styles.certificateButtonText}>View Certificate</Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity style={styles.shareButton} onPress={onShare}>
                <LinearGradient
                  colors={['#E1306C', '#833AB4']}
                  style={styles.actionButtonGradient}
                >
                  <MaterialCommunityIcons name="share-variant" size={24} color="white" />
                  <Text style={styles.shareButtonText}>Share Achievement</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}

          <View style={styles.bottomButtons}>
            <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
              <MaterialCommunityIcons name="replay" size={24} color="white" />
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.exitButton} onPress={onExit}>
              <MaterialCommunityIcons name="home" size={24} color="white" />
              <Text style={styles.exitButtonText}>Home</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  confetti: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  trophyContainer: {
    marginBottom: 20,
  },
  trophyGradient: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    textAlign: 'center',
  },
  resultSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 30,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
  },
  scoreGradient: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 48,
    fontWeight: '800',
    color: 'white',
  },
  scorePercent: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
    marginTop: 10,
  },
  scoreLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 30,
  },
  statCard: {
    width: (SCREEN_WIDTH - 64) / 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  badgeContainer: {
    width: '100%',
    marginBottom: 30,
  },
  badgeCard: {
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(147,51,234,0.3)',
  },
  badgeIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  badgeEarnedText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFD700',
  },
  badgeNameHindi: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  rarityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 10,
  },
  rarityText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'white',
  },
  actionsContainer: {
    width: '100%',
    gap: 12,
  },
  certificateButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  shareButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  certificateButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a2e',
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  bottomButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  retryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  exitButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 8,
  },
  exitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

export default ResultsScreen;
