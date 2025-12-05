import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';

// Beat pattern data
interface BeatPattern {
  id: number;
  title: string;
  description: string;
  pattern: ('tap' | 'pause')[];
  speed: number; // milliseconds per beat
  verse: string;
  difficulty: 'easy' | 'medium' | 'hard';
  pronunciation: string; // Full verse for audio chanting
}

const BEAT_PATTERNS: BeatPattern[] = [
  {
    id: 1,
    title: 'Simple Beat',
    description: 'Tap along with the basic rhythm!',
    pattern: ['tap', 'pause', 'tap', 'pause', 'tap', 'pause', 'tap', 'pause'],
    speed: 600,
    verse: 'ॐ नमः शिवाय',
    difficulty: 'easy',
    pronunciation: 'ॐ नमः शिवाय',
  },
  {
    id: 2,
    title: 'Double Rhythm',
    description: 'Two quick taps, then pause!',
    pattern: ['tap', 'tap', 'pause', 'tap', 'tap', 'pause', 'tap', 'tap', 'pause'],
    speed: 500,
    verse: 'गायत्री मंत्र',
    difficulty: 'easy',
    pronunciation: 'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्',
  },
  {
    id: 3,
    title: 'Dance Beat',
    description: 'Feel the dancing rhythm!',
    pattern: ['tap', 'pause', 'tap', 'tap', 'pause', 'tap', 'pause', 'tap', 'tap'],
    speed: 450,
    verse: 'हरे राम हरे कृष्णा',
    difficulty: 'medium',
    pronunciation: 'हरे राम हरे राम राम राम हरे हरे हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे',
  },
  {
    id: 4,
    title: 'Fast Flow',
    description: 'Quick taps, stay focused!',
    pattern: ['tap', 'tap', 'tap', 'pause', 'tap', 'tap', 'tap', 'pause'],
    speed: 400,
    verse: 'त्वमेव माता च पिता',
    difficulty: 'medium',
    pronunciation: 'त्वमेव माता च पिता त्वमेव त्वमेव बन्धुश्च सखा त्वमेव त्वमेव विद्या द्रविणं त्वमेव त्वमेव सर्वं मम देव देव',
  },
  {
    id: 5,
    title: 'Champion Beat',
    description: 'Complex rhythm master challenge!',
    pattern: ['tap', 'pause', 'tap', 'tap', 'pause', 'pause', 'tap', 'tap', 'tap', 'pause', 'tap'],
    speed: 350,
    verse: 'सर्वे भवन्तु सुखिनः',
    difficulty: 'hard',
    pronunciation: 'सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः सर्वे भद्राणि पश्यन्तु मा कश्चिद्दुःखभाग्भवेत्',
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
    en: 'Welcome to Tap the Beat! Listen to the rhythm and tap along!',
    hi: 'टैप द बीट में आपका स्वागत है! लय सुनें और साथ में थपथपाएं!',
  },
  listen: {
    en: 'Listen carefully to the beat pattern!',
    hi: 'बीट पैटर्न को ध्यान से सुनें!',
  },
  tapNow: {
    en: 'Now it is your turn! Tap the circles!',
    hi: 'अब आपकी बारी है! घेरे को थपथपाएं!',
  },
  perfect: {
    en: 'Perfect! You matched the rhythm exactly!',
    hi: 'बिल्कुल सही! आपने लय से मिलान किया!',
  },
  good: {
    en: 'Good job! Almost there! Try again!',
    hi: 'बढ़िया काम! लगभग हो गया! फिर से कोशिश करें!',
  },
  tryAgain: {
    en: 'Keep trying! You can do it!',
    hi: 'कोशिश करते रहें! आप कर सकते हैं!',
  },
  completed: {
    en: 'Amazing! You are a Rhythm Master!',
    hi: 'अद्भुत! आप एक लय मास्टर हैं!',
  },
};

export default function TapBeatScreen() {
  const router = useRouter();
  const [currentPattern, setCurrentPattern] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [isTapping, setIsTapping] = useState(false);
  const [userTaps, setUserTaps] = useState<number[]>([]);
  const [currentBeatIndex, setCurrentBeatIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [completedPatterns, setCompletedPatterns] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(LANGUAGES[0]);
  const [showResult, setShowResult] = useState(false);
  const [resultType, setResultType] = useState<'perfect' | 'good' | 'tryAgain'>('perfect');

  useEffect(() => {
    loadLanguagePreference();
  }, []);

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

  const speakText = async (text: string) => {
    try {
      const Speech = require('expo-speech');
      await Speech.stop();
      
      Speech.speak(text, {
        language: selectedLanguage.speechCode,
        pitch: 1.2,
        rate: 0.7,
      });
    } catch (error) {
      console.log('Speech error:', error);
    }
  };

  const playBeatSound = async (beatType: 'dhaa' | 'tin' | 'na' = 'dhaa') => {
    try {
      // Create different tabla sounds for rhythm variety
      // Dhaa (bass), Tin (high), Na (middle)
      const frequencies: Record<string, string> = {
        dhaa: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=',
        tin: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAIlYAAESsAAACABAAZGF0YQAAAAA=',
        na: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAVHoAAKjUAAACABAAZGF0YQAAAAA=',
      };

      const { sound: beatSound } = await Audio.Sound.createAsync(
        { uri: frequencies[beatType] },
        { shouldPlay: true, volume: 0.8 }
      );
      await beatSound.playAsync();
      setTimeout(() => {
        beatSound.unloadAsync();
      }, 200);
    } catch (error) {
      console.log('Beat sound error:', error);
    }
  };

  const playRhythmPattern = async (pattern: BeatPattern) => {
    // Play a full rhythm cycle with tabla sounds
    const rhythmSounds: ('dhaa' | 'tin' | 'na')[] = [];
    
    // Create rhythm based on pattern - alternating tabla sounds
    for (let i = 0; i < pattern.pattern.length; i++) {
      if (pattern.pattern[i] === 'tap') {
        // Alternate between different tabla sounds for musical rhythm
        if (i === 0 || i % 4 === 0) rhythmSounds.push('dhaa'); // Start with bass
        else if (i % 3 === 0) rhythmSounds.push('tin'); // High accent
        else rhythmSounds.push('na'); // Middle filler
      }
    }

    // Play the rhythm sequence
    for (let i = 0; i < rhythmSounds.length; i++) {
      await new Promise(resolve => setTimeout(resolve, pattern.speed));
      playBeatSound(rhythmSounds[i]);
      setCurrentBeatIndex(i);
    }
  };

  const playVerseAudio = async (verse: string) => {
    try {
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

  const startListening = async () => {
    setIsListening(true);
    setUserTaps([]);
    setCurrentBeatIndex(0);
    
    const pattern = BEAT_PATTERNS[currentPattern];
    
    // First chant the verse
    const message = TRANSLATIONS.listen[selectedLanguage.code];
    speakText(message);
    
    setTimeout(() => {
      playVerseAudio(pattern.pronunciation);
    }, 1500);
    
    // Then play the rhythm pattern
    setTimeout(() => {
      playPatternDemo(pattern);
    }, 5000);
  };

  const playPatternDemo = async (pattern: BeatPattern) => {
    // Play the full rhythm pattern
    await playRhythmPattern(pattern);
    
    setTimeout(() => {
      setIsListening(false);
      setIsTapping(true);
      setCurrentBeatIndex(0);
      const message = TRANSLATIONS.tapNow[selectedLanguage.code];
      speakText(message);
    }, 1000);
  };

  const handleTap = () => {
    if (!isTapping) return;
    
    const tapTime = Date.now();
    const newTaps = [...userTaps, tapTime];
    setUserTaps(newTaps);
    
    // Play different tabla sounds based on tap position for musical variety
    const tapCount = newTaps.length;
    let soundType: 'dhaa' | 'tin' | 'na' = 'dhaa';
    if (tapCount === 1 || tapCount % 4 === 1) soundType = 'dhaa'; // Bass on strong beats
    else if (tapCount % 3 === 0) soundType = 'tin'; // High accent
    else soundType = 'na'; // Middle filler
    
    playBeatSound(soundType);
    
    const pattern = BEAT_PATTERNS[currentPattern];
    const expectedTaps = pattern.pattern.filter(b => b === 'tap').length;
    
    if (tapCount >= expectedTaps) {
      finishTapping(newTaps);
    }
  };

  const finishTapping = (taps: number[]) => {
    setIsTapping(false);
    
    const pattern = BEAT_PATTERNS[currentPattern];
    const expectedTaps = pattern.pattern.filter(b => b === 'tap').length;
    
    // Calculate accuracy based on number of taps
    const tapAccuracy = (Math.min(taps.length, expectedTaps) / expectedTaps) * 100;
    
    let result: 'perfect' | 'good' | 'tryAgain';
    let points = 0;
    
    if (tapAccuracy >= 90 && taps.length === expectedTaps) {
      result = 'perfect';
      points = 100;
      setCompletedPatterns(completedPatterns + 1);
    } else if (tapAccuracy >= 70) {
      result = 'good';
      points = 50;
    } else {
      result = 'tryAgain';
      points = 25;
    }
    
    setResultType(result);
    setScore(score + points);
    setAccuracy(tapAccuracy);
    setShowResult(true);
    
    const message = TRANSLATIONS[result][selectedLanguage.code];
    speakText(message);
  };

  const handleNext = () => {
    setShowResult(false);
    setUserTaps([]);
    setCurrentBeatIndex(0);
    
    if (currentPattern < BEAT_PATTERNS.length - 1) {
      setCurrentPattern(currentPattern + 1);
    }
  };

  const handleRetry = () => {
    setShowResult(false);
    setUserTaps([]);
    setCurrentBeatIndex(0);
    setIsListening(false);
    setIsTapping(false);
  };

  const pattern = BEAT_PATTERNS[currentPattern];
  const allCompleted = completedPatterns >= BEAT_PATTERNS.length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#3b82f6', '#2563eb']}
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
          Tap the Beat
        </Animatable.Text>
        <View style={styles.scoreContainer}>
          <Ionicons name="musical-note" size={24} color="#fbbf24" />
          <Text style={styles.scoreText}>{score}</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {!allCompleted ? (
          <>
            {/* Progress */}
            <Animatable.View animation="fadeInDown" duration={800} style={styles.progressCard}>
              <Text style={styles.progressText}>
                Pattern {currentPattern + 1} of {BEAT_PATTERNS.length}
              </Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${((currentPattern + 1) / BEAT_PATTERNS.length) * 100}%` }
                  ]} 
                />
              </View>
              <View style={styles.difficultyBadge}>
                <Text style={styles.difficultyText}>
                  {pattern.difficulty.toUpperCase()}
                </Text>
              </View>
            </Animatable.View>

            {/* Pattern Card */}
            <Animatable.View animation="zoomIn" duration={800} delay={200} style={styles.patternCard}>
              <LinearGradient
                colors={['#dbeafe', '#bfdbfe']}
                style={styles.patternGradient}
              >
                <View style={styles.patternHeader}>
                  <Ionicons name="headset" size={56} color="#3b82f6" />
                  <Text style={styles.patternTitle}>{pattern.title}</Text>
                  <Text style={styles.patternDescription}>{pattern.description}</Text>
                </View>

                <View style={styles.verseContainer}>
                  <Text style={styles.verseLabel}>Sanskrit Verse:</Text>
                  <Text style={styles.verseText}>{pattern.verse}</Text>
                  <TouchableOpacity
                    onPress={() => playVerseAudio(pattern.pronunciation)}
                    style={styles.chantButton}
                  >
                    <Ionicons name="musical-notes" size={20} color="#ffffff" />
                    <Text style={styles.chantButtonText}>Chant Full Verse</Text>
                  </TouchableOpacity>
                </View>

                {/* Beat Pattern Visualization */}
                <View style={styles.beatVisualization}>
                  <Text style={styles.visualLabel}>Pattern:</Text>
                  <View style={styles.beatsRow}>
                    {pattern.pattern.map((beat, index) => (
                      <Animatable.View
                        key={index}
                        animation={
                          isListening && currentBeatIndex === index && beat === 'tap'
                            ? 'pulse'
                            : undefined
                        }
                        iterationCount="infinite"
                        duration={300}
                        style={styles.beatIconWrapper}
                      >
                        {beat === 'tap' ? (
                          <View
                            style={[
                              styles.beatCircle,
                              isListening && currentBeatIndex === index && styles.beatCircleActive,
                            ]}
                          >
                            <Ionicons name="hand-left" size={24} color="#ffffff" />
                          </View>
                        ) : (
                          <View style={styles.beatPause}>
                            <Text style={styles.beatPauseText}>·</Text>
                          </View>
                        )}
                      </Animatable.View>
                    ))}
                  </View>
                </View>

                {/* Control Buttons */}
                {!isListening && !isTapping && !showResult && (
                  <TouchableOpacity
                    onPress={startListening}
                    style={styles.startButton}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#3b82f6', '#2563eb']}
                      style={styles.startGradient}
                    >
                      <Ionicons name="play-circle" size={32} color="#ffffff" />
                      <Text style={styles.startButtonText}>Listen to Beat</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                )}

                {isListening && (
                  <Animatable.View animation="pulse" iterationCount="infinite" style={styles.listeningCard}>
                    <Ionicons name="ear" size={48} color="#3b82f6" />
                    <Text style={styles.listeningText}>Listen Carefully...</Text>
                  </Animatable.View>
                )}
              </LinearGradient>
            </Animatable.View>

            {/* Tapping Area */}
            {isTapping && !showResult && (
              <Animatable.View animation="bounceIn" duration={800} style={styles.tappingArea}>
                <LinearGradient
                  colors={['#fef3c7', '#fde68a']}
                  style={styles.tappingGradient}
                >
                  <Text style={styles.tappingTitle}>Your Turn!</Text>
                  <Text style={styles.tappingSubtitle}>
                    Tap the circle {pattern.pattern.filter(b => b === 'tap').length} times
                  </Text>
                  
                  <TouchableOpacity
                    onPress={handleTap}
                    style={styles.tapButton}
                    activeOpacity={0.7}
                  >
                    <Animatable.View
                      animation="pulse"
                      iterationCount="infinite"
                      duration={800}
                      style={styles.tapButtonInner}
                    >
                      <LinearGradient
                        colors={['#3b82f6', '#2563eb']}
                        style={styles.tapButtonGradient}
                      >
                        <Ionicons name="hand-left" size={80} color="#ffffff" />
                      </LinearGradient>
                    </Animatable.View>
                  </TouchableOpacity>

                  <View style={styles.tapCounter}>
                    <Text style={styles.tapCounterText}>
                      Taps: {userTaps.length} / {pattern.pattern.filter(b => b === 'tap').length}
                    </Text>
                  </View>
                </LinearGradient>
              </Animatable.View>
            )}

            {/* Result Feedback */}
            {showResult && (
              <Animatable.View animation="bounceIn" duration={800} style={styles.resultCard}>
                <LinearGradient
                  colors={
                    resultType === 'perfect'
                      ? ['#10b981', '#059669']
                      : resultType === 'good'
                      ? ['#f59e0b', '#d97706']
                      : ['#ef4444', '#dc2626']
                  }
                  style={styles.resultGradient}
                >
                  <Ionicons
                    name={
                      resultType === 'perfect'
                        ? 'trophy'
                        : resultType === 'good'
                        ? 'thumbs-up'
                        : 'refresh-circle'
                    }
                    size={80}
                    color="#ffffff"
                  />
                  <Text style={styles.resultText}>
                    {resultType === 'perfect'
                      ? 'Perfect!'
                      : resultType === 'good'
                      ? 'Good Job!'
                      : 'Try Again!'}
                  </Text>
                  <Text style={styles.accuracyText}>Accuracy: {Math.round(accuracy)}%</Text>
                  
                  <View style={styles.resultButtons}>
                    {resultType !== 'perfect' && (
                      <TouchableOpacity onPress={handleRetry} style={styles.retryButton}>
                        <Ionicons name="refresh" size={24} color="#ffffff" />
                        <Text style={styles.retryButtonText}>Retry</Text>
                      </TouchableOpacity>
                    )}
                    {(resultType === 'perfect' || resultType === 'good') && currentPattern < BEAT_PATTERNS.length - 1 && (
                      <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
                        <Text style={styles.nextButtonText}>Next Pattern</Text>
                        <Ionicons name="arrow-forward-circle" size={28} color="#ffffff" />
                      </TouchableOpacity>
                    )}
                  </View>
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
              <Text style={styles.completionTitle}>Rhythm Master!</Text>
              <Text style={styles.completionScore}>Total Score: {score}</Text>
              <Text style={styles.completionMessage}>You mastered all the beats!</Text>
              
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
    backgroundColor: '#eff6ff',
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
    borderColor: '#3b82f6',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#3b82f6',
    marginBottom: 12,
    textAlign: 'center',
  },
  progressBar: {
    height: 12,
    backgroundColor: '#dbeafe',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 6,
  },
  difficultyBadge: {
    alignSelf: 'center',
    backgroundColor: '#fbbf24',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#ffffff',
  },
  patternCard: {
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  patternGradient: {
    padding: 24,
    borderWidth: 3,
    borderColor: '#3b82f6',
  },
  patternHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  patternTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1e40af',
    marginTop: 12,
  },
  patternDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e3a8a',
    textAlign: 'center',
    marginTop: 8,
  },
  verseContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  verseLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3b82f6',
    marginBottom: 8,
  },
  verseText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1e40af',
    textAlign: 'center',
    marginBottom: 12,
  },
  chantButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  chantButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
    marginLeft: 8,
  },
  beatVisualization: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  visualLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#3b82f6',
    marginBottom: 12,
    textAlign: 'center',
  },
  beatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  beatIconWrapper: {
    marginBottom: 8,
  },
  beatCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  beatCircleActive: {
    backgroundColor: '#fbbf24',
    elevation: 8,
    shadowOpacity: 0.4,
  },
  beatPause: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#9ca3af',
    borderStyle: 'dashed',
  },
  beatPauseText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#6b7280',
  },
  startButton: {
    borderRadius: 24,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  startGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    marginLeft: 12,
  },
  listeningCard: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  listeningText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#3b82f6',
    marginTop: 12,
  },
  tappingArea: {
    borderRadius: 28,
    overflow: 'hidden',
    marginBottom: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  tappingGradient: {
    padding: 32,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fbbf24',
  },
  tappingTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#f59e0b',
    marginBottom: 8,
  },
  tappingSubtitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#78350f',
    marginBottom: 32,
  },
  tapButton: {
    marginBottom: 24,
  },
  tapButtonInner: {
    borderRadius: 100,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  tapButtonGradient: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapCounter: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  tapCounterText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#3b82f6',
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
    marginBottom: 12,
  },
  accuracyText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 24,
  },
  resultButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  retryButtonText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#3b82f6',
    marginLeft: 8,
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
    color: '#3b82f6',
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
