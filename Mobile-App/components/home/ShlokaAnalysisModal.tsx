import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  Animated,
  Dimensions,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { AI_BACKEND_URL, aiApi } from '../../services/api';
import { ALL_SHLOKAS } from '../../data/shlokas';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Theme Colors
const COLORS = {
  primaryBrown: '#4A2E1C',
  copper: '#B87333',
  gold: '#D4A017',
  saffron: '#DD7A1F',
  sand: '#F3E4C8',
  cream: '#FFF8E7',
  darkBrown: '#2D1810',
  lightCopper: '#D4956B',
  guruColor: '#D4A017',
  laghuColor: '#B87333',
};

interface ShlokaAnalysisModalProps {
  visible: boolean;
  onClose: () => void;
}

// API Response Types
interface SyllableBreakdown {
  syllable: string;
  type: 'guru' | 'laghu';
  position: number;
}

interface ChandasAPIResponse {
  chandas_name: string;
  syllable_breakdown: SyllableBreakdown[];
  laghu_guru_pattern: string;
  explanation: string;
  confidence: number;
}

interface AnalysisResult {
  inputText: string;
  chandasName: string;
  syllableBreakdown: SyllableBreakdown[];
  laghuGuruPattern: string;
  explanation: string;
  confidence: number;
  totalSyllables: number;
  guruCount: number;
  laghuCount: number;
}

// Analysis Stage for progressive animation
type AnalysisStage = 'idle' | 'scanning' | 'syllabification' | 'pattern-detection' | 'classification' | 'complete';

interface Particle {
  id: number;
  initialX: number;
  initialY: number;
  x: Animated.Value;
  y: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
}

// Audio file mapping - maps shloka IDs to audio file names in ShlokaAudios folder
const audioFileMap: Record<string, string> = {
  'gayatri-mantra': 'gayaytri mantra.mp3',
  'mahamrityunjaya-mantra': 'mahamrityunjay_mantra.mp3',
  'shanti-mantra': 'shanti mantra.mp3',
  'vakratunda-shloka': 'vakratunda.mp3',
  'asato-ma-mantra': 'astoma.mp3',
  'saraswati-vandana': 'Saraswati vandana.mp3',
  'om-namah-shivaya': 'om namah shivaya.mp3',
  'guru-brahma': 'Guru bramha.mp3',
  'hare-krishna-mantra': 'hare krishna.mp3',
};

// Icon mapping for different shloka categories
const getCategoryIcon = (category: string): string => {
  switch (category.toLowerCase()) {
    case 'vedic mantras': return 'sunny-outline';
    case 'upanishadic': return 'book-outline';
    case 'devotional': return 'heart-outline';
    default: return 'flower-outline';
  }
};

// Demo Shloka Examples - All shlokas from library
const demoShlokas = ALL_SHLOKAS.map(shloka => ({
  id: shloka.id,
  title: shloka.title,
  text: shloka.lines.map(line => line.text).join(' '),
  description: shloka.description.substring(0, 60) + '...',
  iconName: getCategoryIcon(shloka.category),
  audioFile: audioFileMap[shloka.id] || null,
  category: shloka.category,
}));

// Floating Particle Component
const FloatingParticle = ({ particle, initialX, initialY }: { 
  particle: Particle; 
  initialX: number; 
  initialY: number;
}) => {
  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: initialX,
        top: initialY,
        opacity: particle.opacity,
        transform: [
          { translateX: particle.x },
          { translateY: particle.y },
          { scale: particle.scale }
        ],
      }}
    >
      <Ionicons name="sparkles" size={20} color={COLORS.gold} />
    </Animated.View>
  );
};

// Mathematical Analysis Animation Component
const MathematicalAnalysisAnimation = ({ 
  stage, 
  text 
}: { 
  stage: AnalysisStage; 
  text: string;
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Rotation animation (uses native driver)
    const rotate = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    rotate.start();

    // Progress bar animation (cannot use native driver due to width property)
    const progress = Animated.loop(
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      })
    );
    progress.start();

    // Scanning line animation
    const scanAnimation = Animated.loop(
      Animated.timing(scanLineAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    scanAnimation.start();

    // Glow pulse
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    glow.start();

    // Generate particles
    const particleArray: Particle[] = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      initialX: Math.random() * SCREEN_WIDTH,
      initialY: Math.random() * 300,
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
    }));

    setParticles(particleArray);

    // Animate particles
    particleArray.forEach((particle, index) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(index * 200),
          Animated.parallel([
            Animated.timing(particle.opacity, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(particle.scale, {
              toValue: 1,
              duration: 800,
              easing: Easing.out(Easing.back(2)),
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(particle.y, {
              toValue: -50,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(particle.opacity, {
              toValue: 0,
              duration: 1000,
              delay: 1000,
              useNativeDriver: true,
            }),
          ]),
        ])
      ).start();
    });

    return () => {
      rotate.stop();
      progress.stop();
      scanAnimation.stop();
      glow.stop();
    };
  }, [rotateAnim, progressAnim, scanLineAnim, glowAnim]);

  const scanLineTranslateY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 280],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 1],
  });

  const getStageInfo = () => {
    switch (stage) {
      case 'scanning':
        return { 
          iconName: 'scan-outline', 
          title: 'Step 1: Text Scanning', 
          desc: 'Parsing Devanagari script and removing punctuation',
          detail: 'Converting UTF-8 characters → Sanskrit phonemes'
        };
      case 'syllabification':
        return { 
          iconName: 'analytics-outline', 
          title: 'Step 2: Syllabification', 
          desc: 'Breaking text into syllables (वर्ण-विच्छेद)',
          detail: 'Identifying vowel-consonant clusters & conjuncts'
        };
      case 'pattern-detection':
        return { 
          iconName: 'grid-outline', 
          title: 'Step 3: Pattern Detection', 
          desc: 'Analyzing Guru (ग) and Laghu (ल) weights',
          detail: 'Calculating मात्रा (syllable duration) for each unit'
        };
      case 'classification':
        return { 
          iconName: 'checkmark-circle-outline', 
          title: 'Step 4: Chandas Classification', 
          desc: 'Matching against 50+ known meter patterns',
          detail: 'AI comparing with Vedic prosody database'
        };
      default:
        return { 
          iconName: 'leaf-outline', 
          title: 'Initializing Analysis', 
          desc: 'Preparing AI-powered chandas detection',
          detail: 'Loading Sanskrit prosody engine...'
        };
    }
  };

  const stageInfo = getStageInfo();

  return (
    <View style={{ alignItems: 'center', paddingVertical: 30 }}>
      {/* Particle effects */}
      <View style={{ position: 'absolute', width: SCREEN_WIDTH, height: 300 }}>
        {particles.map((particle) => (
          <FloatingParticle 
            key={particle.id} 
            particle={particle} 
            initialX={particle.initialX}
            initialY={particle.initialY}
          />
        ))}
      </View>

      {/* Main analysis container */}
      <View style={{
        width: SCREEN_WIDTH - 80,
        backgroundColor: 'rgba(255,255,255,0.95)',
        borderRadius: 24,
        padding: 24,
        borderWidth: 2,
        borderColor: COLORS.gold,
        shadowColor: COLORS.gold,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
        elevation: 10,
      }}>
        {/* Animated glow border */}
        <Animated.View style={{
          position: 'absolute',
          top: -2,
          left: -2,
          right: -2,
          bottom: -2,
          borderRadius: 24,
          borderWidth: 2,
          borderColor: COLORS.saffron,
          opacity: glowOpacity,
        }} />

        {/* Stage icon with rotation */}
        <Animated.View style={{
          alignSelf: 'center',
          marginBottom: 16,
          transform: [{
            rotate: rotateAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0deg', '360deg'],
            }),
          }],
        }}>
          <LinearGradient
            colors={[COLORS.gold, COLORS.saffron]}
            style={{
              width: 70,
              height: 70,
              borderRadius: 35,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Ionicons name={stageInfo.iconName as any} size={32} color={COLORS.darkBrown} />
          </LinearGradient>
        </Animated.View>

        {/* Stage title */}
        <Text style={{
          color: COLORS.primaryBrown,
          fontSize: 20,
          fontWeight: '800',
          textAlign: 'center',
          marginBottom: 8,
        }}>
          {stageInfo.title}
        </Text>

        <Text style={{
          color: COLORS.copper,
          fontSize: 14,
          textAlign: 'center',
          marginBottom: 8,
        }}>
          {stageInfo.desc}
        </Text>
        
        <Text style={{
          color: COLORS.lightCopper,
          fontSize: 12,
          textAlign: 'center',
          marginBottom: 20,
          fontStyle: 'italic',
        }}>
          {stageInfo.detail}
        </Text>

        {/* Text display with scan line */}
        <View style={{
          backgroundColor: COLORS.cream,
          borderRadius: 16,
          padding: 16,
          minHeight: 100,
          justifyContent: 'center',
          overflow: 'hidden',
        }}>
          <Text style={{
            color: COLORS.primaryBrown,
            fontSize: 16,
            lineHeight: 26,
            textAlign: 'center',
            fontWeight: '600',
          }}>
            {text}
          </Text>
          
          {/* Animated scanning line */}
          <Animated.View style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: 2,
            backgroundColor: COLORS.saffron,
            opacity: 0.6,
            transform: [{ translateY: scanLineTranslateY }],
          }} />
        </View>

        {/* Progress indicators */}
        <View style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          marginTop: 20,
        }}>
          {['scanning', 'syllabification', 'pattern-detection', 'classification'].map((s, idx) => (
            <View
              key={s}
              style={{
                width: 12,
                height: 12,
                borderRadius: 6,
                backgroundColor: stage === s || idx < ['scanning', 'syllabification', 'pattern-detection', 'classification'].indexOf(stage as string)
                  ? COLORS.gold
                  : COLORS.sand,
              }}
            />
          ))}
        </View>

        {/* Mathematical formula display */}
        <View style={{
          marginTop: 16,
          padding: 12,
          backgroundColor: `${COLORS.gold}15`,
          borderRadius: 12,
          borderLeftWidth: 3,
          borderLeftColor: COLORS.gold,
        }}>
          <Text style={{
            color: COLORS.primaryBrown,
            fontSize: 11,
            fontFamily: 'monospace',
            textAlign: 'center',
          }}>
            {stage === 'pattern-detection' && 'Pattern = f(syllable_weight, position)'}
            {stage === 'classification' && 'Chandas ∈ {Anuṣṭup, Triṣṭup, Jagatī, ...}'}
            {stage === 'syllabification' && 'Σ syllables = count(vowel_units)'}
            {stage === 'scanning' && 'Input → UTF-8 Devanagari Parser'}
          </Text>
        </View>
      </View>

      {/* Bottom progress bar */}
      <View style={{
        width: SCREEN_WIDTH - 80,
        height: 4,
        backgroundColor: COLORS.sand,
        borderRadius: 2,
        marginTop: 20,
        overflow: 'hidden',
      }}>
        <Animated.View style={{
          height: '100%',
          backgroundColor: COLORS.gold,
          width: progressAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['30%', '95%'],
          }),
        }} />
      </View>

      <Text style={{
        color: COLORS.copper,
        fontSize: 13,
        marginTop: 12,
        fontStyle: 'italic',
      }}>
        Processing with AI-powered Sanskrit prosody engine
      </Text>
    </View>
  );
};

// Static Syllable Chip Component - Easy to Read
const SyllableChip = ({ syllable, type }: { 
  syllable: string; 
  type: 'guru' | 'laghu'; 
}) => {
  const isGuru = type === 'guru';
  
  return (
    <View>
      <LinearGradient
        colors={isGuru ? [COLORS.gold, '#E8B939'] : [COLORS.copper, '#9A5F2B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderRadius: 14,
          margin: 4,
          shadowColor: isGuru ? COLORS.gold : COLORS.copper,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.4,
          shadowRadius: 6,
          elevation: 5,
          minWidth: 50,
          alignItems: 'center',
        }}
      >
        <Text style={{ 
          color: isGuru ? COLORS.darkBrown : '#FFF', 
          fontSize: 18, 
          fontWeight: '700',
          textAlign: 'center',
          textShadowColor: 'rgba(0,0,0,0.2)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 2,
        }}>
          {syllable}
        </Text>
        <View style={{
          backgroundColor: isGuru ? 'rgba(77,46,28,0.2)' : 'rgba(255,255,255,0.3)',
          paddingHorizontal: 8,
          paddingVertical: 2,
          borderRadius: 8,
          marginTop: 4,
        }}>
          <Text style={{ 
            color: isGuru ? COLORS.darkBrown : '#FFF', 
            fontSize: 9, 
            fontWeight: '700',
            opacity: 0.9,
          }}>
            {isGuru ? '●●' : '○'}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
};

// Static Pattern Display - Easy to Read
const PatternDisplay = ({ pattern }: { pattern: string }) => {
  const chars = pattern.replace(/\./g, '').split('');
  
  return (
    <View style={{ 
      flexDirection: 'row', 
      flexWrap: 'wrap', 
      justifyContent: 'center',
      backgroundColor: COLORS.cream,
      padding: 16,
      borderRadius: 16,
      marginTop: 12,
    }}>
      {chars.map((char, idx) => {
        const isGuru = char === 'G';
        
        return (
          <View
            key={idx}
            style={{ margin: 3 }}
          >
            <LinearGradient
              colors={isGuru 
                ? [COLORS.gold, '#F5D76E', COLORS.gold] 
                : [COLORS.copper, '#D4956B', COLORS.copper]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: isGuru ? COLORS.gold : COLORS.copper,
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: 0.5,
                shadowRadius: 4,
                elevation: 6,
              }}
            >
              <Text style={{ 
                color: isGuru ? COLORS.darkBrown : '#FFF', 
                fontWeight: '800',
                fontSize: 16,
                textShadowColor: 'rgba(0,0,0,0.3)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
              }}>
                {char}
              </Text>
            </LinearGradient>
          </View>
        );
      })}
    </View>
  );
};

export default function ShlokaAnalysisModal({ visible, onClose }: ShlokaAnalysisModalProps) {
  const [inputShloka, setInputShloka] = useState('');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisStage, setAnalysisStage] = useState<AnalysisStage>('idle');
  const [isListening, setIsListening] = useState(false);
  const [soundObject, setSoundObject] = useState<Audio.Sound | null>(null);
  const [recordingObject, setRecordingObject] = useState<Audio.Recording | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (soundObject) {
        soundObject.unloadAsync();
      }
      if (recordingObject) {
        recordingObject.stopAndUnloadAsync();
      }
    };
  }, [soundObject, recordingObject]);

  useEffect(() => {
    if (analysisResult) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
      
      // Scroll to results
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 300);
    }
  }, [analysisResult, fadeAnim]);

  // Audio playback function
  const playAudio = async (audioFileName: string) => {
    try {
      // Stop any currently playing audio
      if (soundObject) {
        await soundObject.stopAsync();
        await soundObject.unloadAsync();
      }

      const audioPath = `../../../ShlokaAudios/${audioFileName}`;
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioPath },
        { shouldPlay: true }
      );
      
      setSoundObject(sound);
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setSoundObject(null);
        }
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert('Error', 'Could not play audio file');
    }
  };

  // Simple voice input using Audio recording (works in Expo Go)
  const startVoiceRecognition = async () => {
    try {
      setIsListening(true);
      setError(null);

      // Request microphone permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Microphone permission is required for voice input');
        setIsListening(false);
        return;
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Show instruction dialog
      Alert.alert(
        'Voice Input',
        'This feature uses simple voice recording. After recording, you can manually type what you spoke.\n\nFor automatic transcription, please use the keyboard.',
        [
          {
            text: 'Use Keyboard',
            onPress: () => setIsListening(false),
            style: 'cancel',
          },
          {
            text: 'Start Recording',
            onPress: async () => {
              try {
                const recording = new Audio.Recording();
                await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
                await recording.startAsync();
                setRecordingObject(recording);
                
                // Show recording in progress
                Alert.alert(
                  'Recording...',
                  'Speak your shloka clearly. Tap "Stop" when done.',
                  [
                    {
                      text: 'Stop',
                      onPress: async () => {
                        await recording.stopAndUnloadAsync();
                        setRecordingObject(null);
                        setIsListening(false);
                        Alert.alert(
                          'Recording Complete',
                          'Please type the shloka you just spoke in the text box above.\n\nNote: Automatic speech-to-text for Sanskrit requires additional setup.',
                        );
                      },
                    },
                  ],
                );
              } catch (err) {
                console.error('Recording error:', err);
                setError('Could not start recording. Please try typing instead.');
                setIsListening(false);
              }
            },
          },
        ],
      );
    } catch (error) {
      console.error('Voice recognition error:', error);
      Alert.alert(
        'Voice Input Error',
        'Could not access microphone. Please type the shloka manually.',
      );
      setIsListening(false);
    }
  };

  // Stop recording
  const stopVoiceRecognition = async () => {
    try {
      if (recordingObject) {
        await recordingObject.stopAndUnloadAsync();
        setRecordingObject(null);
      }
      setIsListening(false);
    } catch (error) {
      console.error('Error stopping recording:', error);
      setIsListening(false);
    }
  };

  const analyzeShloka = async (text: string) => {
    if (!text.trim()) {
      Alert.alert('Error', 'Please enter a shloka to analyze');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);
    fadeAnim.setValue(0);

    // Scroll down to show animation box
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ y: 600, animated: true });
    }, 100);

    // Start animation immediately
    const stages: AnalysisStage[] = ['scanning', 'syllabification', 'pattern-detection', 'classification'];
    let currentStageIndex = 0;
    
    // Set first stage immediately
    setAnalysisStage(stages[0]);
    currentStageIndex = 1;

    const stageInterval = setInterval(() => {
      if (currentStageIndex < stages.length) {
        setAnalysisStage(stages[currentStageIndex]);
        currentStageIndex++;
      }
    }, 1200);

    // Record start time to ensure minimum animation duration
    const startTime = Date.now();
    const MIN_ANIMATION_DURATION = 4800; // 1200ms × 4 stages

    try {
      console.log('🔍 Sending request to:', `${AI_BACKEND_URL}/chandas/identify`);
      console.log('📝 Request body:', { shloka: text.trim() });
      
      // Force fresh API call - prevent caching
      const timestamp = new Date().getTime();
      const response = await aiApi.post('/chandas/identify', { 
        shloka: text.trim(),
        _t: timestamp
      });
      
      console.log('📨 Response status:', response.status);
      
      const data: ChandasAPIResponse = response.data;
      console.log('✅ Response data:', data);
      
      // Calculate stats from syllable breakdown
      const guruCount = data.syllable_breakdown.filter(s => s.type === 'guru').length;
      const laghuCount = data.syllable_breakdown.filter(s => s.type === 'laghu').length;
      
      const result: AnalysisResult = {
        inputText: text,
        chandasName: data.chandas_name,
        syllableBreakdown: data.syllable_breakdown,
        laghuGuruPattern: data.laghu_guru_pattern,
        explanation: data.explanation,
        confidence: data.confidence,
        totalSyllables: data.syllable_breakdown.length,
        guruCount,
        laghuCount,
      };
      
      // Calculate how long to wait to complete minimum animation duration
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, MIN_ANIMATION_DURATION - elapsedTime);
      
      console.log(`⏱️ API took ${elapsedTime}ms, waiting ${remainingTime}ms more for animation`);
      
      // Wait for remaining animation time
      setTimeout(() => {
        clearInterval(stageInterval);
        setAnalysisStage('complete');
        
        // Additional delay before showing results for smooth transition
        setTimeout(() => {
          setAnalysisResult(result);
          setIsAnalyzing(false);
        }, 800);
      }, remainingTime);
      
    } catch (err: unknown) {
      clearInterval(stageInterval);
      console.error('❌ Analysis error:', err);
      let errorMessage = 'Failed to analyze shloka';
      
      if (err && typeof err === 'object') {
        const error = err as any;
        
        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
          errorMessage = 'Request timed out. The AI server might be busy. Please try again.';
        } else if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
          errorMessage = `Cannot connect to AI server.\n\nPlease ensure:\n1. AI backend is running on port 8000\n2. Phone is on same WiFi as computer\n3. Firewall allows port 8000`;
        } else if (error.response?.data?.detail) {
          errorMessage = error.response.data.detail[0]?.msg || error.response.data.message || errorMessage;
        } else if (error.message) {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      Alert.alert('Analysis Error', errorMessage);
      setAnalysisStage('idle');
      setIsAnalyzing(false);
    }
  };

  const handleClose = () => {
    setInputShloka('');
    setAnalysisResult(null);
    setError(null);
    setAnalysisStage('idle');
    fadeAnim.setValue(0);
    onClose();
  };

  const clearResults = () => {
    setAnalysisResult(null);
    setError(null);
    setAnalysisStage('idle');
    fadeAnim.setValue(0);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.cream }}>
        <ScrollView 
          ref={scrollViewRef}
          style={{ flex: 1 }} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Gradient Header */}
          <LinearGradient
            colors={[COLORS.primaryBrown, COLORS.darkBrown]}
            style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 28 }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="leaf" size={28} color={COLORS.gold} style={{ marginRight: 10 }} />
                <Text style={{ color: '#FFF', fontSize: 24, fontWeight: '700' }}>
                  Chandas Identifier
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleClose}
                style={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)', 
                  padding: 10, 
                  borderRadius: 20,
                }}
              >
                <Ionicons name="close" size={22} color="white" />
              </TouchableOpacity>
            </View>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 15, lineHeight: 22 }}>
              Discover the prosodic meter of Sanskrit shlokas with AI-powered analysis
            </Text>
            
            {/* Stats Banner */}
            <View style={{ 
              flexDirection: 'row', 
              marginTop: 20,
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: 16,
              padding: 16,
            }}>
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ color: COLORS.gold, fontSize: 20, fontWeight: '700' }}>50+</Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Chandas Types</Text>
              </View>
              <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.2)' }} />
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ color: COLORS.gold, fontSize: 20, fontWeight: '700' }}>AI</Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Powered</Text>
              </View>
              <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.2)' }} />
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Text style={{ color: COLORS.gold, fontSize: 20, fontWeight: '700' }}>98%</Text>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Accuracy</Text>
              </View>
            </View>
          </LinearGradient>

          {/* Input Section */}
          <View style={{ padding: 20 }}>
            <View style={{ 
              flexDirection: 'row', 
              alignItems: 'center', 
              marginBottom: 12 
            }}>
              <Ionicons name="create-outline" size={22} color={COLORS.primaryBrown} />
              <Text style={{ 
                color: COLORS.primaryBrown, 
                fontSize: 18, 
                fontWeight: '600',
                marginLeft: 8,
              }}>
                Enter Sanskrit Shloka
              </Text>
            </View>
            
            <View style={{ 
              backgroundColor: '#FFF', 
              borderRadius: 20,
              borderWidth: 2,
              borderColor: COLORS.sand,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 4,
            }}>
              <TextInput
                value={inputShloka}
                onChangeText={(text) => {
                  setInputShloka(text);
                  if (analysisResult) clearResults();
                }}
                placeholder="टाइप करें या पेस्ट करें..."
                placeholderTextColor={COLORS.lightCopper}
                multiline
                numberOfLines={5}
                style={{
                  padding: 18,
                  fontSize: 18,
                  color: COLORS.primaryBrown,
                  lineHeight: 28,
                  minHeight: 140,
                  textAlignVertical: 'top',
                  fontWeight: '500',
                }}
              />
            </View>

            {/* Action Buttons */}
            <View style={{ flexDirection: 'row', marginTop: 16, gap: 12 }}>
              {/* Voice Input Button */}
              <TouchableOpacity
                onPress={isListening ? stopVoiceRecognition : startVoiceRecognition}
                disabled={isAnalyzing}
                style={{
                  backgroundColor: isListening ? COLORS.saffron : COLORS.sand,
                  paddingVertical: 16,
                  paddingHorizontal: 20,
                  borderRadius: 16,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isListening ? (
                  <>
                    <Ionicons name="stop-circle" size={20} color="#FFF" style={{ marginRight: 6 }} />
                    <Text style={{ color: '#FFF', fontSize: 12, fontWeight: '600' }}>Stop</Text>
                  </>
                ) : (
                  <Ionicons 
                    name="mic-outline" 
                    size={20} 
                    color={COLORS.copper} 
                  />
                )}
              </TouchableOpacity>

              {inputShloka.trim() ? (
                <TouchableOpacity
                  onPress={() => {
                    setInputShloka('');
                    clearResults();
                  }}
                  style={{
                    backgroundColor: COLORS.sand,
                    paddingVertical: 16,
                    paddingHorizontal: 20,
                    borderRadius: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons name="trash-outline" size={20} color={COLORS.copper} />
                </TouchableOpacity>
              ) : null}
              
              <TouchableOpacity
                onPress={() => analyzeShloka(inputShloka)}
                disabled={isAnalyzing || !inputShloka.trim()}
                style={{
                  flex: 1,
                  borderRadius: 16,
                  overflow: 'hidden',
                }}
              >
                <LinearGradient
                  colors={isAnalyzing || !inputShloka.trim() 
                    ? [COLORS.sand, COLORS.sand] 
                    : [COLORS.saffron, COLORS.copper]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    paddingVertical: 16,
                    paddingHorizontal: 24,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons 
                    name="analytics" 
                    size={22} 
                    color={!inputShloka.trim() ? COLORS.copper : '#FFF'} 
                    style={{ marginRight: 10 }} 
                  />
                  <Text style={{ 
                    color: !inputShloka.trim() ? COLORS.copper : '#FFF', 
                    fontSize: 17, 
                    fontWeight: '700',
                  }}>
                    {isAnalyzing ? 'Analyzing...' : 'Analyze Chandas'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Error Display */}
            {error && (
              <View style={{
                backgroundColor: '#FEE2E2',
                borderRadius: 12,
                padding: 16,
                marginTop: 16,
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <Ionicons name="alert-circle" size={24} color="#DC2626" style={{ marginRight: 12 }} />
                <Text style={{ color: '#DC2626', flex: 1 }}>{error}</Text>
              </View>
            )}

            {/* Demo Examples Section */}
            <View style={{ marginTop: 32 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <Ionicons name="sparkles" size={22} color={COLORS.gold} style={{ marginRight: 8 }} />
                <Text style={{ color: COLORS.primaryBrown, fontSize: 18, fontWeight: '700' }}>
                  Try These Examples
                </Text>
              </View>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 20 }}
              >
                {demoShlokas.map((demo) => (
                  <TouchableOpacity
                    key={demo.id}
                    onPress={() => {
                      setInputShloka(demo.text);
                      analyzeShloka(demo.text);
                    }}
                    disabled={isAnalyzing}
                    style={{
                      width: SCREEN_WIDTH * 0.7,
                      marginRight: 16,
                      backgroundColor: '#FFF',
                      borderRadius: 20,
                      padding: 20,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.1,
                      shadowRadius: 8,
                      elevation: 4,
                      borderWidth: 1,
                      borderColor: COLORS.sand,
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                      <View style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: COLORS.sand,
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginRight: 10,
                      }}>
                        <Ionicons name={demo.iconName as any} size={20} color={COLORS.copper} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ 
                          color: COLORS.gold, 
                          fontSize: 16, 
                          fontWeight: '700',
                        }}>
                          {demo.title}
                        </Text>
                        <Text style={{ 
                          color: COLORS.lightCopper, 
                          fontSize: 12,
                          marginTop: 2,
                        }}>
                          {demo.description}
                        </Text>
                      </View>
                      {demo.audioFile && (
                        <TouchableOpacity
                          onPress={(e) => {
                            e.stopPropagation();
                            playAudio(demo.audioFile!);
                          }}
                          style={{
                            backgroundColor: COLORS.saffron,
                            borderRadius: 12,
                            padding: 8,
                          }}
                        >
                          <Ionicons name="play" size={16} color="#FFF" />
                        </TouchableOpacity>
                      )}
                    </View>
                    <Text style={{ 
                      color: COLORS.primaryBrown, 
                      fontSize: 15,
                      lineHeight: 24,
                      fontWeight: '500',
                    }} numberOfLines={2}>
                      {demo.text}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Mathematical Analysis Animation */}
          {isAnalyzing && analysisStage !== 'idle' && (
            <View style={{ padding: 20 }}>
              <MathematicalAnalysisAnimation 
                stage={analysisStage} 
                text={inputShloka}
              />
            </View>
          )}

          {/* Analysis Results */}
          {analysisResult && !isAnalyzing && (
            <Animated.View style={{ 
              padding: 20, 
              opacity: fadeAnim,
              transform: [{
                translateY: fadeAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              }],
            }}>
              {/* Results Header */}
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                marginBottom: 20,
                justifyContent: 'space-between',
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{
                    backgroundColor: COLORS.gold,
                    borderRadius: 12,
                    padding: 10,
                    marginRight: 12,
                  }}>
                    <Ionicons name="checkmark-circle" size={24} color="#FFF" />
                  </View>
                  <Text style={{ 
                    color: COLORS.primaryBrown, 
                    fontSize: 22, 
                    fontWeight: '700' 
                  }}>
                    Analysis Complete
                  </Text>
                </View>
              </View>

              {/* Main Chandas Card */}
              <LinearGradient
                colors={[COLORS.primaryBrown, COLORS.darkBrown]}
                style={{
                  borderRadius: 24,
                  padding: 24,
                  marginBottom: 16,
                }}
              >
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '500' }}>
                    Identified Chandas
                  </Text>
                  <Text style={{ 
                    color: COLORS.gold, 
                    fontSize: 36, 
                    fontWeight: '800',
                    marginTop: 8,
                    textAlign: 'center',
                  }}>
                    {analysisResult.chandasName}
                  </Text>
                  <View style={{
                    flexDirection: 'row',
                    marginTop: 16,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: 12,
                    padding: 12,
                  }}>
                    <View style={{ alignItems: 'center', paddingHorizontal: 16 }}>
                      <Text style={{ color: COLORS.gold, fontSize: 24, fontWeight: '700' }}>
                        {analysisResult.totalSyllables}
                      </Text>
                      <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>Total</Text>
                    </View>
                    <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.2)' }} />
                    <View style={{ alignItems: 'center', paddingHorizontal: 16 }}>
                      <Text style={{ color: COLORS.gold, fontSize: 24, fontWeight: '700' }}>
                        {analysisResult.guruCount}
                      </Text>
                      <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>Guru</Text>
                    </View>
                    <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.2)' }} />
                    <View style={{ alignItems: 'center', paddingHorizontal: 16 }}>
                      <Text style={{ color: COLORS.copper, fontSize: 24, fontWeight: '700' }}>
                        {analysisResult.laghuCount}
                      </Text>
                      <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 11 }}>Laghu</Text>
                    </View>
                  </View>
                </View>
                
                {/* Confidence Meter inside card */}
                <View style={{ marginTop: 20 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontWeight: '600', fontSize: 13 }}>
                      Confidence
                    </Text>
                    <Text style={{ color: COLORS.gold, fontWeight: '700', fontSize: 15 }}>
                      {Math.round(analysisResult.confidence * 100)}%
                    </Text>
                  </View>
                  <View style={{ 
                    height: 8, 
                    backgroundColor: 'rgba(255,255,255,0.2)', 
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}>
                    <View
                      style={{
                        height: '100%',
                        backgroundColor: COLORS.gold,
                        borderRadius: 4,
                        width: `${analysisResult.confidence * 100}%`,
                      }}
                    />
                  </View>
                </View>
              </LinearGradient>

              {/* Syllable Breakdown Card */}
              <View style={{
                backgroundColor: '#FFF',
                borderRadius: 24,
                padding: 20,
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <View style={{
                    backgroundColor: `${COLORS.gold}20`,
                    borderRadius: 12,
                    padding: 10,
                    marginRight: 12,
                  }}>
                    <Ionicons name="grid" size={22} color={COLORS.gold} />
                  </View>
                  <View>
                    <Text style={{ color: COLORS.primaryBrown, fontSize: 18, fontWeight: '700' }}>
                      Syllable Breakdown
                    </Text>
                    <Text style={{ color: COLORS.lightCopper, fontSize: 12 }}>
                      Each syllable with its classification
                    </Text>
                  </View>
                </View>
                
                {/* Legend */}
                <View style={{ 
                  flexDirection: 'row', 
                  justifyContent: 'center', 
                  marginBottom: 16,
                  backgroundColor: COLORS.cream,
                  borderRadius: 12,
                  padding: 12,
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}>
                    <View style={{
                      width: 16,
                      height: 16,
                      borderRadius: 4,
                      backgroundColor: COLORS.gold,
                      marginRight: 8,
                    }} />
                    <Text style={{ color: COLORS.primaryBrown, fontWeight: '600' }}>Guru (गुरु) ●●</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{
                      width: 16,
                      height: 16,
                      borderRadius: 4,
                      backgroundColor: COLORS.copper,
                      marginRight: 8,
                    }} />
                    <Text style={{ color: COLORS.primaryBrown, fontWeight: '600' }}>Laghu (लघु) ○</Text>
                  </View>
                </View>
                
                {/* Syllable Chips */}
                <View style={{ 
                  flexDirection: 'row', 
                  flexWrap: 'wrap', 
                  justifyContent: 'center',
                }}>
                  {analysisResult.syllableBreakdown.map((item, idx) => (
                    <SyllableChip
                      key={idx}
                      syllable={item.syllable}
                      type={item.type}
                    />
                  ))}
                </View>
                
                {/* Pattern String */}
                <View style={{ marginTop: 20 }}>
                  <Text style={{ 
                    color: COLORS.primaryBrown, 
                    fontWeight: '600', 
                    fontSize: 14,
                    marginBottom: 8,
                    textAlign: 'center',
                  }}>
                    Pattern Representation (G = Guru, L = Laghu)
                  </Text>
                  <PatternDisplay pattern={analysisResult.laghuGuruPattern} />
                </View>
              </View>

              {/* Explanation Card */}
              <View style={{
                backgroundColor: '#FFF',
                borderRadius: 24,
                padding: 20,
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <View style={{
                    backgroundColor: `${COLORS.copper}20`,
                    borderRadius: 12,
                    padding: 10,
                    marginRight: 12,
                  }}>
                    <Ionicons name="book" size={22} color={COLORS.copper} />
                  </View>
                  <Text style={{ color: COLORS.primaryBrown, fontSize: 18, fontWeight: '700' }}>
                    Explanation
                  </Text>
                </View>
                
                <Text style={{ 
                  color: COLORS.primaryBrown, 
                  fontSize: 15,
                  lineHeight: 24,
                }}>
                  {analysisResult.explanation}
                </Text>
              </View>

              {/* Chandas Characteristics Card */}
              <View style={{
                backgroundColor: '#FFF',
                borderRadius: 24,
                padding: 20,
                marginBottom: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
                borderWidth: 2,
                borderColor: COLORS.saffron,
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <View style={{
                    backgroundColor: `${COLORS.saffron}20`,
                    borderRadius: 12,
                    padding: 10,
                    marginRight: 12,
                  }}>
                    <Ionicons name="information-circle" size={22} color={COLORS.saffron} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: COLORS.primaryBrown, fontSize: 18, fontWeight: '700' }}>
                      Meter Characteristics
                    </Text>
                    <Text style={{ color: COLORS.lightCopper, fontSize: 12, marginTop: 2 }}>
                      वृत्त विशेषताएँ (Vṛtta Viśeṣatāeṃ)
                    </Text>
                  </View>
                </View>
                
                {/* Characteristics Grid */}
                <View style={{ gap: 12 }}>
                  {/* Syllable Structure */}
                  <View style={{
                    backgroundColor: COLORS.cream,
                    borderRadius: 12,
                    padding: 14,
                    borderLeftWidth: 4,
                    borderLeftColor: COLORS.gold,
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                      <Ionicons name="layers-outline" size={18} color={COLORS.gold} />
                      <Text style={{ 
                        color: COLORS.primaryBrown, 
                        fontSize: 14, 
                        fontWeight: '700',
                        marginLeft: 8,
                      }}>
                        Syllable Structure
                      </Text>
                    </View>
                    <Text style={{ color: COLORS.copper, fontSize: 13, lineHeight: 20 }}>
                      {analysisResult.totalSyllables} syllables total • {analysisResult.totalSyllables / 4} per quarter (पाद)
                    </Text>
                  </View>

                  {/* Metrical Pattern */}
                  <View style={{
                    backgroundColor: COLORS.cream,
                    borderRadius: 12,
                    padding: 14,
                    borderLeftWidth: 4,
                    borderLeftColor: COLORS.copper,
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                      <Ionicons name="analytics-outline" size={18} color={COLORS.copper} />
                      <Text style={{ 
                        color: COLORS.primaryBrown, 
                        fontSize: 14, 
                        fontWeight: '700',
                        marginLeft: 8,
                      }}>
                        Metrical Pattern (गण)
                      </Text>
                    </View>
                    <Text style={{ color: COLORS.copper, fontSize: 13, lineHeight: 20 }}>
                      {analysisResult.laghuGuruPattern}
                    </Text>
                    <Text style={{ color: COLORS.lightCopper, fontSize: 11, marginTop: 4, fontStyle: 'italic' }}>
                      G = Guru (heavy) • L = Laghu (light)
                    </Text>
                  </View>

                  {/* Mātrā Count */}
                  <View style={{
                    backgroundColor: COLORS.cream,
                    borderRadius: 12,
                    padding: 14,
                    borderLeftWidth: 4,
                    borderLeftColor: COLORS.saffron,
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                      <Ionicons name="timer-outline" size={18} color={COLORS.saffron} />
                      <Text style={{ 
                        color: COLORS.primaryBrown, 
                        fontSize: 14, 
                        fontWeight: '700',
                        marginLeft: 8,
                      }}>
                        Mātrā Duration (मात्रा काल)
                      </Text>
                    </View>
                    <Text style={{ color: COLORS.copper, fontSize: 13, lineHeight: 20 }}>
                      {analysisResult.guruCount * 2 + analysisResult.laghuCount} mātrās total
                    </Text>
                    <Text style={{ color: COLORS.lightCopper, fontSize: 11, marginTop: 4, fontStyle: 'italic' }}>
                      ({analysisResult.guruCount} Guru × 2) + ({analysisResult.laghuCount} Laghu × 1)
                    </Text>
                  </View>

                  {/* Classification */}
                  <View style={{
                    backgroundColor: `${COLORS.gold}10`,
                    borderRadius: 12,
                    padding: 14,
                    borderWidth: 1,
                    borderColor: COLORS.gold,
                  }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                      <Ionicons name="ribbon-outline" size={18} color={COLORS.gold} />
                      <Text style={{ 
                        color: COLORS.primaryBrown, 
                        fontSize: 14, 
                        fontWeight: '700',
                        marginLeft: 8,
                      }}>
                        Meter Classification
                      </Text>
                    </View>
                    <Text style={{ color: COLORS.copper, fontSize: 13, lineHeight: 20 }}>
                      {analysisResult.chandasName}
                    </Text>
                    <Text style={{ color: COLORS.lightCopper, fontSize: 11, marginTop: 4, fontStyle: 'italic' }}>
                      Based on {analysisResult.totalSyllables}-syllable vṛtta pattern analysis
                    </Text>
                  </View>
                </View>

                {/* AI Analysis Badge */}
                <View style={{
                  marginTop: 16,
                  padding: 12,
                  backgroundColor: `${COLORS.primaryBrown}05`,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                  <Text style={{ fontSize: 20, marginRight: 10 }}>🤖</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: COLORS.primaryBrown, fontSize: 12, fontWeight: '600' }}>
                      AI-Powered Analysis
                    </Text>
                    <Text style={{ color: COLORS.lightCopper, fontSize: 11, marginTop: 2 }}>
                      Analyzed using deep learning trained on classical Sanskrit texts
                    </Text>
                  </View>
                </View>
              </View>

              {/* Input Text Reference */}
              <View style={{
                backgroundColor: COLORS.sand,
                borderRadius: 24,
                padding: 20,
                borderWidth: 1,
                borderColor: COLORS.lightCopper,
                borderStyle: 'dashed',
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <Ionicons name="text" size={18} color={COLORS.copper} />
                  <Text style={{ 
                    color: COLORS.copper, 
                    fontSize: 14, 
                    fontWeight: '600',
                    marginLeft: 8,
                  }}>
                    Analyzed Text
                  </Text>
                </View>
                <Text style={{ 
                  color: COLORS.primaryBrown, 
                  fontSize: 16,
                  lineHeight: 26,
                  fontWeight: '500',
                }}>
                  {analysisResult.inputText}
                </Text>
              </View>

              {/* Analyze Another Button */}
              <TouchableOpacity
                onPress={clearResults}
                style={{
                  marginTop: 20,
                  backgroundColor: COLORS.cream,
                  borderRadius: 16,
                  padding: 18,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: COLORS.gold,
                }}
              >
                <Ionicons name="refresh" size={22} color={COLORS.gold} style={{ marginRight: 10 }} />
                <Text style={{ color: COLORS.gold, fontSize: 17, fontWeight: '700' }}>
                  Analyze Another Shloka
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
