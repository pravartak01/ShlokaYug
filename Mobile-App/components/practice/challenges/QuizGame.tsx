// QuizGame - Main game component for MCQ, fill-blanks, and other challenge types
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ScrollView,
  Vibration,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Challenge, GameSession, UserChallengeProgress } from '../../../types/challenges';

Dimensions.get('window');

interface QuizGameProps {
  challenge: Challenge;
  onComplete: (progress: UserChallengeProgress) => void;
  onExit: () => void;
}

export const QuizGame: React.FC<QuizGameProps> = ({
  challenge,
  onComplete,
  onExit,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(challenge.timeLimit);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(30);
  const [showExplanation, setShowExplanation] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [answers, setAnswers] = useState<GameSession['answers']>([]);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [showHint, setShowHint] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const streakAnim = useRef(new Animated.Value(0)).current;
  const optionAnims = useRef(challenge.questions[0]?.options?.map(() => new Animated.Value(0)) || []).current;

  const currentQuestion = challenge.questions[currentQuestionIndex];
  const totalQuestions = challenge.questions.length;
  const questionStartTime = useRef(Date.now());

  useEffect(() => {
    // Start countdown before game
    setTimeout(() => {
      setGameStarted(true);
      animateQuestionIn();
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!gameStarted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleGameEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStarted]);

  useEffect(() => {
    if (!gameStarted || isAnswered) return;

    const questionTimer = setInterval(() => {
      setQuestionTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(questionTimer);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(questionTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameStarted, currentQuestionIndex, isAnswered]);

  const animateQuestionIn = useCallback(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    optionAnims.forEach((anim) => anim.setValue(0));

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        friction: 8,
        tension: 100,
        useNativeDriver: true,
      }),
      ...optionAnims.map((anim, index) =>
        Animated.sequence([
          Animated.delay(100 + index * 80),
          Animated.spring(anim, {
            toValue: 1,
            friction: 6,
            tension: 100,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();

    Animated.timing(progressAnim, {
      toValue: (currentQuestionIndex + 1) / totalQuestions,
      duration: 300,
      useNativeDriver: false,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, totalQuestions]);

  const animateCorrect = () => {
    Vibration.vibrate(50);
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.sequence([
      Animated.timing(streakAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(streakAnim, {
        toValue: 0,
        duration: 200,
        delay: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateWrong = () => {
    Vibration.vibrate([0, 100, 50, 100]);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleTimeout = () => {
    if (!isAnswered) {
      setIsAnswered(true);
      setIsCorrect(false);
      setStreak(0);
      animateWrong();
      
      setAnswers((prev) => [
        ...prev,
        {
          questionId: currentQuestion.id,
          userAnswer: '',
          timeTaken: 30000,
        },
      ]);
    }
  };

  const handleSelectAnswer = (answer: string) => {
    if (isAnswered) return;

    const timeTaken = Date.now() - questionStartTime.current;
    setSelectedAnswer(answer);
    setIsAnswered(true);

    const correct = answer === currentQuestion.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      const basePoints = currentQuestion.points;
      const timeBonus = Math.max(0, Math.floor((currentQuestion.timeBonus || 5) * (questionTimeLeft / 30)));
      const streakBonus = Math.floor(basePoints * (streak * 0.1));
      const totalPoints = basePoints + timeBonus + streakBonus;
      
      setScore((prev) => prev + totalPoints);
      setStreak((prev) => prev + 1);
      animateCorrect();
    } else {
      setStreak(0);
      animateWrong();
    }

    setAnswers((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        userAnswer: answer,
        timeTaken,
      },
    ]);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setIsCorrect(false);
      setQuestionTimeLeft(30);
      setShowExplanation(false);
      setShowHint(false);
      questionStartTime.current = Date.now();
      
      // Reset option anims for new question
      const newQuestion = challenge.questions[currentQuestionIndex + 1];
      if (newQuestion?.options) {
        optionAnims.length = 0;
        newQuestion.options.forEach(() => optionAnims.push(new Animated.Value(0)));
      }
      
      setTimeout(() => animateQuestionIn(), 50);
    } else {
      handleGameEnd();
    }
  };

  const handleGameEnd = () => {
    const maxScore = challenge.questions.reduce((sum, q) => sum + q.points, 0);
    const percentage = Math.round((score / maxScore) * 100);
    const numCorrect = answers.filter((a, i) => {
      const q = challenge.questions[i];
      return a.userAnswer === q?.correctAnswer;
    }).length;

    const progress: UserChallengeProgress = {
      challengeId: challenge.id,
      completed: percentage >= challenge.passingScore && numCorrect > 0,
      score,
      maxScore,
      percentage,
      timeSpent: challenge.timeLimit - timeLeft,
      attempts: 1,
      bestTime: challenge.timeLimit - timeLeft,
      earnedXp: percentage >= challenge.passingScore ? challenge.xpReward : Math.floor(challenge.xpReward * (percentage / 100)),
      earnedCoins: percentage >= challenge.passingScore ? challenge.coinsReward : Math.floor(challenge.coinsReward * (percentage / 100)),
      earnedBadge: percentage >= 90 ? challenge.badge : undefined,
      completedAt: new Date(),
      answers: answers.map((a, i) => ({
        ...a,
        correct: a.userAnswer === challenge.questions[i]?.correctAnswer,
      })),
    };

    onComplete(progress);
  };

  const handleUseHint = () => {
    if (hintsUsed < 3 && currentQuestion.hint && !showHint) {
      setHintsUsed((prev) => prev + 1);
      setShowHint(true);
      Vibration.vibrate(30);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getOptionStyle = (option: string) => {
    if (!isAnswered) {
      return selectedAnswer === option ? styles.optionSelected : styles.option;
    }
    if (option === currentQuestion.correctAnswer) {
      return styles.optionCorrect;
    }
    if (option === selectedAnswer && !isCorrect) {
      return styles.optionWrong;
    }
    return styles.optionDisabled;
  };

  if (!gameStarted) {
    return (
      <View style={styles.countdownContainer}>
        <LinearGradient
          colors={challenge.gradient}
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.countdownText}>Get Ready!</Text>
        <MaterialCommunityIcons name={challenge.icon as any} size={80} color="white" />
        <Text style={styles.challengeTitle}>{challenge.title}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0A0A', '#1A1A1A', '#2A2A2A']}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.exitButton} onPress={onExit}>
          <MaterialCommunityIcons name="close" size={24} color="white" />
        </TouchableOpacity>

        {/* Progress Bar */}
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>

        <View style={styles.headerRight}>
          <MaterialCommunityIcons name="clock-outline" size={18} color={timeLeft < 30 ? '#8D6E63' : 'white'} />
          <Text style={[styles.timerText, timeLeft < 30 && styles.timerWarning]}>
            {formatTime(timeLeft)}
          </Text>
        </View>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Score</Text>
          <Text style={styles.statValue}>{score}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Streak</Text>
          <View style={styles.streakContainer}>
            <MaterialCommunityIcons name="fire" size={18} color={streak > 0 ? '#8D6E63' : '#666'} />
            <Text style={[styles.statValue, streak > 0 && styles.streakActive]}>{streak}</Text>
          </View>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Question</Text>
          <Text style={styles.statValue}>{currentQuestionIndex + 1}/{totalQuestions}</Text>
        </View>
      </View>

      {/* Streak Animation */}
      <Animated.View
        style={[
          styles.streakPopup,
          {
            opacity: streakAnim,
            transform: [
              { scale: streakAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) },
              { translateY: streakAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) },
            ],
          },
        ]}
      >
        <Text style={styles.streakPopupText}>🔥 {streak}x Streak!</Text>
      </Animated.View>

      {/* Question Timer */}
      <View style={styles.questionTimerContainer}>
        <View style={styles.questionTimerBar}>
          <Animated.View
            style={[
              styles.questionTimerFill,
              {
                width: `${(questionTimeLeft / 30) * 100}%`,
                backgroundColor: questionTimeLeft < 10 ? '#8D6E63' : '#6D4C41',
              },
            ]}
          />
        </View>
        <Text style={[styles.questionTimerText, questionTimeLeft < 10 && styles.timerWarning]}>
          {questionTimeLeft}s
        </Text>
      </View>

      {/* Question Card */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={[
            styles.questionCard,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { translateX: shakeAnim },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
            style={styles.questionGradient}
          >
            {/* Question Number Badge */}
            <View style={styles.questionBadge}>
              <Text style={styles.questionBadgeText}>Q{currentQuestionIndex + 1}</Text>
            </View>

            <Text style={styles.questionText}>{currentQuestion.question}</Text>
            
            {currentQuestion.questionHindi && (
              <Text style={styles.questionHindi}>{currentQuestion.questionHindi}</Text>
            )}

            {/* Hint */}
            {showHint && currentQuestion.hint && (
              <View style={styles.hintContainer}>
                <MaterialCommunityIcons name="lightbulb" size={18} color="#FFD700" />
                <Text style={styles.hintText}>{currentQuestion.hint}</Text>
              </View>
            )}
          </LinearGradient>
        </Animated.View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {currentQuestion.options?.map((option, index) => (
            <Animated.View
              key={index}
              style={{
                opacity: optionAnims[index] || 1,
                transform: [
                  {
                    translateX: (optionAnims[index] || new Animated.Value(1)).interpolate({
                      inputRange: [0, 1],
                      outputRange: [-50, 0],
                    }),
                  },
                  { scale: scaleAnim },
                ],
              }}
            >
              <TouchableOpacity
                style={getOptionStyle(option)}
                onPress={() => handleSelectAnswer(option)}
                disabled={isAnswered}
                activeOpacity={0.8}
              >
                <View style={styles.optionLetter}>
                  <Text style={styles.optionLetterText}>
                    {String.fromCharCode(65 + index)}
                  </Text>
                </View>
                <Text style={styles.optionText}>{option}</Text>
                {isAnswered && option === currentQuestion.correctAnswer && (
                  <MaterialCommunityIcons name="check-circle" size={24} color="#8D6E63" />
                )}
                {isAnswered && option === selectedAnswer && !isCorrect && (
                  <MaterialCommunityIcons name="close-circle" size={24} color="#A1887F" />
                )}
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Explanation */}
        {isAnswered && currentQuestion.explanation && showExplanation && (
          <Animated.View style={[styles.explanationCard, { opacity: fadeAnim }]}>
            <View style={styles.explanationHeader}>
              <MaterialCommunityIcons 
                name={isCorrect ? 'check-circle' : 'information'} 
                size={24} 
                color={isCorrect ? '#8D6E63' : '#A1887F'} 
              />
              <Text style={styles.explanationTitle}>
                {isCorrect ? 'Correct!' : 'Explanation'}
              </Text>
            </View>
            <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
            {currentQuestion.explanationHindi && (
              <Text style={styles.explanationHindi}>{currentQuestion.explanationHindi}</Text>
            )}
          </Animated.View>
        )}

        {/* Spacer */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        {!isAnswered && currentQuestion.hint && hintsUsed < 3 && (
          <TouchableOpacity style={styles.hintButton} onPress={handleUseHint}>
            <MaterialCommunityIcons name="lightbulb-outline" size={20} color="#FFD700" />
            <Text style={styles.hintButtonText}>Hint ({3 - hintsUsed})</Text>
          </TouchableOpacity>
        )}

        {isAnswered && !showExplanation && currentQuestion.explanation && (
          <TouchableOpacity 
            style={styles.explainButton} 
            onPress={() => setShowExplanation(true)}
          >
            <MaterialCommunityIcons name="information-outline" size={20} color="white" />
            <Text style={styles.explainButtonText}>Show Explanation</Text>
          </TouchableOpacity>
        )}

        {isAnswered && (
          <TouchableOpacity style={styles.nextButton} onPress={handleNextQuestion}>
            <LinearGradient
              colors={['#8D6E63', '#6D4C41']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextButtonGradient}
            >
              <Text style={styles.nextButtonText}>
                {currentQuestionIndex < totalQuestions - 1 ? 'Next Question' : 'Finish'}
              </Text>
              <MaterialCommunityIcons 
                name={currentQuestionIndex < totalQuestions - 1 ? 'arrow-right' : 'check'} 
                size={24} 
                color="white" 
              />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  countdownContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  countdownText: {
    fontSize: 32,
    fontWeight: '700',
    color: 'white',
  },
  challengeTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    gap: 12,
  },
  exitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#8D6E63',
    borderRadius: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timerText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  timerWarning: {
    color: '#FF6B6B',
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginHorizontal: 16,
    borderRadius: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },
  statValue: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  streakActive: {
    color: '#FF6B6B',
  },
  streakPopup: {
    position: 'absolute',
    top: 180,
    alignSelf: 'center',
    backgroundColor: 'rgba(255,107,107,0.9)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 100,
  },
  streakPopupText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  questionTimerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
  },
  questionTimerBar: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  questionTimerFill: {
    height: '100%',
    borderRadius: 2,
  },
  questionTimerText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    width: 30,
    textAlign: 'right',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  questionCard: {
    marginTop: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },
  questionGradient: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  questionBadge: {
    position: 'absolute',
    top: -12,
    left: 20,
    backgroundColor: '#9333EA',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  questionBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  questionText: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    lineHeight: 28,
    marginTop: 10,
  },
  questionHindi: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
    fontStyle: 'italic',
  },
  hintContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,215,0,0.1)',
    padding: 12,
    borderRadius: 12,
    marginTop: 12,
    gap: 10,
  },
  hintText: {
    flex: 1,
    color: '#FFD700',
    fontSize: 14,
    lineHeight: 20,
  },
  optionsContainer: {
    marginTop: 20,
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(147,51,234,0.2)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#9333EA',
  },
  optionCorrect: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76,175,80,0.2)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  optionWrong: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,107,107,0.2)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  optionDisabled: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    opacity: 0.5,
  },
  optionLetter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionLetterText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  optionText: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    lineHeight: 22,
  },
  explanationCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  explanationTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  explanationText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    lineHeight: 22,
  },
  explanationHindi: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 13,
    marginTop: 8,
    fontStyle: 'italic',
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 30,
    gap: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,215,0,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,215,0,0.3)',
  },
  hintButtonText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
  },
  explainButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
  },
  explainButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  nextButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default QuizGame;
