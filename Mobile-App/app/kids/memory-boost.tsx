import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';

const { width } = Dimensions.get('window');

// Game data
interface GameChallenge {
  id: number;
  type: 'complete-verse' | 'fill-missing' | 'sequence';
  title: string;
  description: string;
  verse: string[];
  correctAnswer: string;
  options?: string[];
  missingIndex?: number;
  pronunciation: string; // Full verse pronunciation
}

const CHALLENGES: GameChallenge[] = [
  {
    id: 1,
    type: 'complete-verse',
    title: 'Complete the Verse',
    description: 'Listen and complete the Sanskrit verse!',
    verse: ['धर्मो', 'रक्षति', '___', 'रक्षितः'],
    correctAnswer: 'रक्षितः',
    options: ['रक्षितः', 'नाशितः', 'पालितः', 'वर्धितः'],
    missingIndex: 2,
    pronunciation: 'धर्मो रक्षति रक्षितः रक्षितः',
  },
  {
    id: 2,
    type: 'fill-missing',
    title: 'Fill the Missing Word',
    description: 'Find the missing syllable!',
    verse: ['सत्यं', '___', 'धर्मः'],
    correctAnswer: 'वद',
    options: ['वद', 'कुरु', 'गच्छ', 'पठ'],
    missingIndex: 1,
    pronunciation: 'सत्यं वद धर्मः',
  },
  {
    id: 3,
    type: 'sequence',
    title: 'Arrange in Order',
    description: 'Put the words in correct sequence!',
    verse: ['योगः', 'कर्मसु', 'कौशलम्'],
    correctAnswer: 'योगः कर्मसु कौशलम्',
    options: ['कर्मसु', 'योगः', 'कौशलम्'],
    pronunciation: 'योगः कर्मसु कौशलम्',
  },
];

interface Language {
  code: string;
  name: string;
  icon: string;
  speechCode: string;
}

const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', icon: 'language-outline', speechCode: 'en-US' },
  { code: 'hi', name: 'हिंदी', icon: 'book-outline', speechCode: 'hi-IN' },
];

const TRANSLATIONS: Record<string, Record<string, string>> = {
  welcome: {
    en: 'Welcome to Memory Boost! Test your Sanskrit memory with fun challenges!',
    hi: 'मेमोरी बूस्ट में आपका स्वागत है! मजेदार चुनौतियों के साथ अपनी संस्कृत स्मृति का परीक्षण करें!',
  },
  correct: {
    en: 'Excellent! That is correct! You are doing great!',
    hi: 'शानदार! यह सही है! आप बहुत अच्छा कर रहे हैं!',
  },
  wrong: {
    en: 'Oops! Try again! You can do it!',
    hi: 'उफ़! फिर से कोशिश करें! आप कर सकते हैं!',
  },
  completed: {
    en: 'Amazing! You completed all challenges! You are a Memory Champion!',
    hi: 'अद्भुत! आपने सभी चुनौतियाँ पूरी कर लीं! आप मेमोरी चैंपियन हैं!',
  },
};

export default function MemoryBoostScreen() {
  const router = useRouter();
  const [currentChallenge, setCurrentChallenge] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [completedChallenges, setCompletedChallenges] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(LANGUAGES[0]);
  const [sequenceOrder, setSequenceOrder] = useState<string[]>([]);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    loadLanguagePreference();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const loadLanguagePreference = async () => {
    try {
      const savedLangData = await AsyncStorage.getItem('globalKidsLanguage');
      if (savedLangData) {
        const lang = JSON.parse(savedLangData);
        const matchedLang = LANGUAGES.find(l => l.code === lang.code) || LANGUAGES[0];
        setSelectedLanguage(matchedLang);
        setTimeout(() => {
          const message = TRANSLATIONS.welcome[matchedLang.code];
          speakText(message);
        }, 500);
      } else {
        playWelcomeMessage();
      }
    } catch (error) {
      console.log('Error loading language:', error);
      playWelcomeMessage();
    }
  };

  const playWelcomeMessage = async () => {
    const message = TRANSLATIONS.welcome[selectedLanguage.code];
    speakText(message);
  };

  const speakText = async (text: string, isSyllable: boolean = false) => {
    try {
      const Speech = require('expo-speech');
      await Speech.stop();
      
      Speech.speak(text, {
        language: selectedLanguage.speechCode,
        pitch: 1.2,
        rate: isSyllable ? 0.5 : 0.7,
      });
    } catch (error) {
      console.log('Speech error:', error);
    }
  };

  const playBeatSound = async () => {
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        // Using a simple beep sound - in production, use actual tabla/beat sound file
        { uri: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjOR0+3MfC4GKHzN8OOVQQ' },
        { shouldPlay: true }
      );
      setSound(newSound);
      await newSound.playAsync();
      // Auto cleanup after playing
      setTimeout(() => {
        newSound.unloadAsync();
      }, 200);
    } catch (error) {
      console.log('Beat sound error:', error);
    }
  };

  const playVerseAudio = async (verse: string) => {
    try {
      // First speak the verse in Sanskrit using TTS
      const Speech = require('expo-speech');
      await Speech.stop();
      
      Speech.speak(verse, {
        language: 'hi-IN', // Sanskrit pronunciation using Hindi voice
        pitch: 1.0,
        rate: 0.5, // Slow and clear for learning
      });
    } catch (error) {
      console.log('Verse audio error:', error);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    const challenge = CHALLENGES[currentChallenge];
    
    // Play beat sound on tap
    playBeatSound();
    
    if (challenge.type === 'sequence') {
      const newSequence = [...sequenceOrder, answer];
      setSequenceOrder(newSequence);
      
      if (newSequence.length === challenge.options!.length) {
        const userAnswer = newSequence.join(' ');
        checkAnswer(userAnswer);
      }
    } else {
      setSelectedAnswer(answer);
      checkAnswer(answer);
    }
  };

  const checkAnswer = (answer: string) => {
    const challenge = CHALLENGES[currentChallenge];
    const correct = answer === challenge.correctAnswer;
    
    setIsCorrect(correct);
    setShowResult(true);
    
    if (correct) {
      setScore(score + 1);
      const message = TRANSLATIONS.correct[selectedLanguage.code];
      speakText(message);
    } else {
      const message = TRANSLATIONS.wrong[selectedLanguage.code];
      speakText(message);
    }
  };

  const handleNext = () => {
    setShowResult(false);
    setSelectedAnswer(null);
    setSequenceOrder([]);
    
    if (currentChallenge < CHALLENGES.length - 1) {
      setCurrentChallenge(currentChallenge + 1);
      setCompletedChallenges(completedChallenges + 1);
    } else {
      setCompletedChallenges(completedChallenges + 1);
      const message = TRANSLATIONS.completed[selectedLanguage.code];
      speakText(message);
    }
  };

  const challenge = CHALLENGES[currentChallenge];
  const isSequenceComplete = challenge.type === 'sequence' && sequenceOrder.length === challenge.options!.length;
  const allCompleted = completedChallenges >= CHALLENGES.length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#ec4899', '#db2777']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={28} color="#ffffff" />
        </TouchableOpacity>
        <Animatable.Text animation="fadeIn" duration={800} style={styles.headerTitle}>
          Memory Boost
        </Animatable.Text>
        <View style={styles.scoreContainer}>
          <Ionicons name="star" size={24} color="#fbbf24" />
          <Text style={styles.scoreText}>{score}</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {!allCompleted ? (
          <>
            {/* Progress */}
            <Animatable.View animation="fadeInDown" duration={800} style={styles.progressCard}>
              <Text style={styles.progressText}>
                Challenge {currentChallenge + 1} of {CHALLENGES.length}
              </Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${((currentChallenge + 1) / CHALLENGES.length) * 100}%` }
                  ]} 
                />
              </View>
            </Animatable.View>

            {/* Challenge Card */}
            <Animatable.View animation="zoomIn" duration={800} delay={200} style={styles.challengeCard}>
              <LinearGradient
                colors={['#fef3c7', '#fde68a']}
                style={styles.challengeGradient}
              >
                <View style={styles.challengeHeader}>
                  <Ionicons name="bulb" size={48} color="#ec4899" />
                  <Text style={styles.challengeTitle}>{challenge.title}</Text>
                </View>
                
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    onPress={() => speakText(challenge.description)}
                    style={styles.instructionButton}
                  >
                    <Ionicons name="volume-high" size={24} color="#ffffff" />
                    <Text style={styles.instructionText}>Instructions</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={() => playVerseAudio(challenge.pronunciation)}
                    style={styles.chantButton}
                  >
                    <Ionicons name="musical-notes" size={24} color="#ffffff" />
                    <Text style={styles.chantText}>Chant Verse</Text>
                  </TouchableOpacity>
                </View>

                {/* Verse Display */}
                <View style={styles.verseContainer}>
                  {challenge.verse.map((word, index) => (
                    <Animatable.View
                      key={index}
                      animation="bounceIn"
                      delay={index * 200}
                      style={styles.wordContainer}
                    >
                      {word === '___' ? (
                        <View style={styles.blankWord}>
                          <Text style={styles.blankText}>?</Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          onPress={() => {
                            playBeatSound();
                            speakText(word, true);
                          }}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.verseWord}>{word}</Text>
                        </TouchableOpacity>
                      )}
                    </Animatable.View>
                  ))}
                </View>

                {/* Sequence Display */}
                {challenge.type === 'sequence' && sequenceOrder.length > 0 && (
                  <View style={styles.sequenceDisplay}>
                    <Text style={styles.sequenceLabel}>Your Answer:</Text>
                    <View style={styles.sequenceContainer}>
                      {sequenceOrder.map((word, index) => (
                        <View key={index} style={styles.sequenceWord}>
                          <Text style={styles.sequenceWordText}>{word}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </LinearGradient>
            </Animatable.View>

            {/* Options */}
            {!showResult && (
              <View style={styles.optionsContainer}>
                {challenge.options?.map((option, index) => {
                  const isUsed = challenge.type === 'sequence' && sequenceOrder.includes(option);
                  return (
                    <Animatable.View
                      key={index}
                      animation="fadeInUp"
                      delay={400 + index * 100}
                      style={styles.optionWrapper}
                    >
                      <TouchableOpacity
                        onPress={() => !isUsed && handleAnswerSelect(option)}
                        style={[
                          styles.optionButton,
                          selectedAnswer === option && styles.optionSelected,
                          isUsed && styles.optionDisabled,
                        ]}
                        activeOpacity={0.7}
                        disabled={isUsed}
                      >
                        <LinearGradient
                          colors={
                            isUsed
                              ? ['#d1d5db', '#9ca3af']
                              : selectedAnswer === option
                              ? ['#3b82f6', '#2563eb']
                              : ['#ffffff', '#fef3c7']
                          }
                          style={styles.optionGradient}
                        >
                          <Text
                            style={[
                              styles.optionText,
                              (selectedAnswer === option || isUsed) && styles.optionTextSelected,
                            ]}
                          >
                            {option}
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </Animatable.View>
                  );
                })}
              </View>
            )}

            {/* Result Feedback */}
            {showResult && (
              <Animatable.View animation="bounceIn" duration={800} style={styles.resultCard}>
                <LinearGradient
                  colors={isCorrect ? ['#10b981', '#059669'] : ['#ef4444', '#dc2626']}
                  style={styles.resultGradient}
                >
                  <Ionicons
                    name={isCorrect ? 'checkmark-circle' : 'close-circle'}
                    size={80}
                    color="#ffffff"
                  />
                  <Text style={styles.resultText}>
                    {isCorrect ? 'Excellent!' : 'Try Again!'}
                  </Text>
                  <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
                    <Text style={styles.nextButtonText}>
                      {currentChallenge < CHALLENGES.length - 1 ? 'Next Challenge' : 'Finish'}
                    </Text>
                    <Ionicons name="arrow-forward-circle" size={28} color="#ffffff" />
                  </TouchableOpacity>
                </LinearGradient>
              </Animatable.View>
            )}
          </>
        ) : (
          // Completion Screen
          <Animatable.View animation="zoomIn" duration={1000} style={styles.completionCard}>
            <LinearGradient
              colors={['#a855f7', '#9333ea']}
              style={styles.completionGradient}
            >
              <Ionicons name="trophy" size={100} color="#fbbf24" />
              <Text style={styles.completionTitle}>You Did It!</Text>
              <Text style={styles.completionScore}>Score: {score}/{CHALLENGES.length}</Text>
              <Text style={styles.completionMessage}>You are a Memory Champion!</Text>
              
              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.homeButton}
                activeOpacity={0.8}
              >
                <Ionicons name="home" size={24} color="#a855f7" />
                <Text style={styles.homeButtonText}>Back to Games</Text>
              </TouchableOpacity>
            </LinearGradient>
          </Animatable.View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fce7f3',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#ffffff',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  scoreText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  progressCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#ec4899',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ec4899',
    marginBottom: 12,
    textAlign: 'center',
  },
  progressBar: {
    height: 12,
    backgroundColor: '#fce7f3',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ec4899',
    borderRadius: 6,
  },
  challengeCard: {
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  challengeGradient: {
    padding: 24,
    borderWidth: 3,
    borderColor: '#fbbf24',
  },
  challengeHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  challengeTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ec4899',
    marginTop: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  instructionButton: {
    flex: 1,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  instructionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 8,
  },
  chantButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ec4899',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  chantText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginLeft: 8,
  },
  verseContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  wordContainer: {
    marginBottom: 12,
  },
  verseWord: {
    fontSize: 32,
    fontWeight: '900',
    color: '#78350f',
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#fbbf24',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  blankWord: {
    width: 80,
    height: 60,
    backgroundColor: '#fce7f3',
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#ec4899',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  blankText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#ec4899',
  },
  sequenceDisplay: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  sequenceLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#3b82f6',
    marginBottom: 12,
  },
  sequenceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sequenceWord: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  sequenceWordText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1e40af',
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  optionWrapper: {
    width: '100%',
  },
  optionButton: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  optionSelected: {
    elevation: 8,
    shadowOpacity: 0.3,
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionGradient: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fbbf24',
  },
  optionText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#78350f',
  },
  optionTextSelected: {
    color: '#ffffff',
  },
  resultCard: {
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  resultGradient: {
    padding: 40,
    alignItems: 'center',
  },
  resultText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: 20,
    marginBottom: 24,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 28,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  nextButtonText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ec4899',
    marginRight: 12,
  },
  completionCard: {
    borderRadius: 32,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  completionGradient: {
    padding: 48,
    alignItems: 'center',
  },
  completionTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: 24,
    marginBottom: 16,
  },
  completionScore: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fbbf24',
    marginBottom: 12,
  },
  completionMessage: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 32,
  },
  homeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 28,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  homeButtonText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#a855f7',
    marginLeft: 12,
  },
});
