import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import * as Animatable from 'react-native-animatable';

const { width, height } = Dimensions.get('window');

interface Language {
  code: string;
  name: string;
  icon: string;
  speechCode: string;
}

interface RhythmPattern {
  id: number;
  title: string;
  verse: string;
  pronunciation: string;
  pattern: ('beat' | 'pause')[];
  bpm: number;
  icon: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

const RHYTHM_PATTERNS: RhythmPattern[] = [
  {
    id: 1,
    title: 'Gayatri Mantra',
    verse: 'ॐ भूर्भुवः स्वः',
    pronunciation: 'Om Bhur Bhuvah Svah',
    pattern: ['beat', 'pause', 'beat', 'pause', 'beat', 'pause', 'beat'],
    bpm: 60,
    icon: 'sunny',
    difficulty: 'EASY',
  },
  {
    id: 2,
    title: 'Shanti Mantra',
    verse: 'ॐ शान्तिः शान्तिः',
    pronunciation: 'Om Shanti Shanti Shanti',
    pattern: ['beat', 'beat', 'pause', 'beat', 'beat', 'pause', 'beat', 'beat'],
    bpm: 75,
    icon: 'flower',
    difficulty: 'EASY',
  },
  {
    id: 3,
    title: 'Ganesh Mantra',
    verse: 'ॐ गं गणपतये नमः',
    pronunciation: 'Om Gam Ganapataye Namaha',
    pattern: ['beat', 'pause', 'beat', 'beat', 'pause', 'beat', 'pause', 'beat', 'beat'],
    bpm: 80,
    icon: 'leaf',
    difficulty: 'MEDIUM',
  },
  {
    id: 4,
    title: 'Saraswati Mantra',
    verse: 'ॐ ऐं सरस्वत्यै नमः',
    pronunciation: 'Om Aim Saraswatyai Namaha',
    pattern: ['beat', 'beat', 'pause', 'beat', 'pause', 'beat', 'beat', 'pause', 'beat', 'beat'],
    bpm: 90,
    icon: 'book',
    difficulty: 'MEDIUM',
  },
  {
    id: 5,
    title: 'Mahamrityunjaya',
    verse: 'ॐ त्र्यम्बकं यजामहे',
    pronunciation: 'Om Tryambakam Yajamahe Sugandhim Pushtivardhanam',
    pattern: ['beat', 'pause', 'beat', 'beat', 'pause', 'beat', 'pause', 'beat', 'beat', 'pause', 'beat', 'beat'],
    bpm: 100,
    icon: 'shield-checkmark',
    difficulty: 'HARD',
  },
];

const TRANSLATIONS: Record<string, Record<string, string>> = {
  welcome: {
    en: 'Welcome to Visual Beats!',
    hi: 'विजुअल बीट्स में आपका स्वागत है!',
    ta: 'விஷுவல் பீட்ஸுக்கு வரவேற்கிறோம்!',
    te: 'విజువల్ బీట్స్‌కు స్వాగతం!',
    kn: 'ವಿಷುವಲ್ ಬೀಟ್ಸ್‌ಗೆ ಸ್ವಾಗತ',
    ml: 'വിഷ്വൽ ബീറ്റ്സിലേക്ക് സ്വാഗതം!',
    bn: 'ভিজ্যুয়াল বিটসে স্বাগতম!',
    gu: 'વિઝ્યુઅલ બીટ્સમાં આપનું સ્વાગત છે!',
  },
  instructions: {
    en: 'Watch the rhythm and feel the beat. The circles will pulse with the mantra.',
    hi: 'लय देखें और ताल महसूस करें। मंत्र के साथ सर्कल धड़केंगे।',
    ta: 'தாளத்தைப் பாருங்கள் மற்றும் துடிப்பை உணருங்கள்.',
    te: 'లయను చూడండి మరియు బీట్‌ను అనుభవించండి.',
    kn: 'ಲಯವನ್ನು ನೋಡಿ ಮತ್ತು ಬೀಟ್ ಅನುಭವಿಸಿ.',
    ml: 'താളം കാണുകയും ബീറ്റ് അനുഭവിക്കുകയും ചെയ്യുക.',
    bn: 'ছন্দ দেখুন এবং বিট অনুভব করুন।',
    gu: 'લય જુઓ અને બીટ અનુભવો.',
  },
  playing: {
    en: 'Playing rhythm...',
    hi: 'लय बज रही है...',
    ta: 'தாளம் இசைக்கிறது...',
    te: 'లయ ప్లే అవుతోంది...',
    kn: 'ಲಯ ಪ್ಲೇ ಆಗುತ್ತಿದೆ...',
    ml: 'താളം പ്ലേ ചെയ്യുന്നു...',
    bn: 'ছন্দ বাজছে...',
    gu: 'લય વાગી રહ્યો છે...',
  },
};

export default function VisualBeats() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>({
    code: 'en',
    name: 'English',
    icon: 'language',
    speechCode: 'en-US',
  });
  const [currentPattern, setCurrentPattern] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBeatIndex, setCurrentBeatIndex] = useState(-1);
  const [isLooping, setIsLooping] = useState(false);

  useEffect(() => {
    loadLanguagePreference();
    speakWelcome();
  }, []);

  useEffect(() => {
    if (isPlaying) {
      playRhythm();
    }
  }, [isPlaying, currentPattern]);

  const loadLanguagePreference = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('globalKidsLanguage');
      if (savedLanguage) {
        setSelectedLanguage(JSON.parse(savedLanguage));
      }
    } catch (error) {
      console.log('Error loading language:', error);
    }
  };

  const speakWelcome = () => {
    const message = TRANSLATIONS.welcome[selectedLanguage.code] || TRANSLATIONS.welcome.en;
    speakText(message);
    
    setTimeout(() => {
      const instructions = TRANSLATIONS.instructions[selectedLanguage.code] || TRANSLATIONS.instructions.en;
      speakText(instructions);
    }, 2000);
  };

  const speakText = (text: string) => {
    Speech.speak(text, {
      language: selectedLanguage.speechCode,
      pitch: 1.2,
      rate: 0.6,
    });
  };

  const playBeatSound = async (beatType: 'dhaa' | 'tin' | 'na' = 'dhaa') => {
    try {
      const frequencies: Record<string, string> = {
        dhaa: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQAAAAA=',
        tin: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAiBMAABAnAAACABAAZGF0YQAAAAA=',
        na: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQAAAAA=',
      };

      const { sound } = await Audio.Sound.createAsync(
        { uri: frequencies[beatType] },
        { shouldPlay: true, volume: 0.8 }
      );

      setTimeout(() => {
        sound.unloadAsync();
      }, 200);
    } catch (error) {
      console.log('Error playing beat:', error);
    }
  };

  const playRhythm = async () => {
    const pattern = RHYTHM_PATTERNS[currentPattern];
    const beatDuration = (60 / pattern.bpm) * 1000;

    const message = TRANSLATIONS.playing[selectedLanguage.code] || TRANSLATIONS.playing.en;
    speakText(message);

    setTimeout(async () => {
      // Chant the verse
      Speech.speak(pattern.pronunciation, {
        language: 'en-IN',
        pitch: 0.9,
        rate: 0.5,
      });

      await new Promise(resolve => setTimeout(resolve, 2000));

      // Play rhythm pattern
      for (let i = 0; i < pattern.pattern.length; i++) {
        setCurrentBeatIndex(i);
        
        if (pattern.pattern[i] === 'beat') {
          // Determine beat type based on position
          let soundType: 'dhaa' | 'tin' | 'na' = 'dhaa';
          if (i === 0 || i % 4 === 0) soundType = 'dhaa';
          else if (i % 3 === 0) soundType = 'tin';
          else soundType = 'na';
          
          playBeatSound(soundType);
        }

        await new Promise(resolve => setTimeout(resolve, beatDuration));
      }

      setCurrentBeatIndex(-1);

      if (isLooping) {
        setTimeout(() => playRhythm(), 1000);
      } else {
        setIsPlaying(false);
      }
    }, 1500);
  };

  const handlePatternSelect = (index: number) => {
    setCurrentPattern(index);
    setIsPlaying(false);
    setCurrentBeatIndex(-1);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying) {
      setCurrentBeatIndex(-1);
    }
  };

  const toggleLoop = () => {
    setIsLooping(!isLooping);
  };

  const pattern = RHYTHM_PATTERNS[currentPattern];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#06b6d4', '#0891b2']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={28} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Visual Beats</Text>
          <TouchableOpacity
            style={[styles.loopButton, isLooping && styles.loopButtonActive]}
            onPress={toggleLoop}
          >
            <Ionicons 
              name={isLooping ? "repeat" : "repeat-outline"} 
              size={24} 
              color="#ffffff" 
            />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Current Pattern Display */}
          <Animatable.View animation="fadeInDown" duration={800}>
            <View style={styles.currentPatternContainer}>
              <Text style={styles.currentPatternTitle}>{pattern.title}</Text>
              <Text style={styles.currentPatternVerse}>{pattern.verse}</Text>
              
              <View style={styles.difficultyBadge}>
                <Text style={styles.difficultyText}>{pattern.difficulty}</Text>
              </View>

              <Text style={styles.bpmText}>{pattern.bpm} BPM</Text>
            </View>
          </Animatable.View>

          {/* Visual Beat Circles */}
          <View style={styles.beatVisualization}>
            {pattern.pattern.map((type, index) => {
              const isActive = currentBeatIndex === index;
              const isPast = currentBeatIndex > index;
              
              return (
                <Animatable.View
                  key={index}
                  animation={isActive ? 'pulse' : undefined}
                  iterationCount={isActive ? 'infinite' : 1}
                  duration={500}
                  style={styles.beatCircleWrapper}
                >
                  {type === 'beat' ? (
                    <LinearGradient
                      colors={
                        isActive
                          ? ['#fbbf24', '#f59e0b']
                          : isPast
                          ? ['#10b981', '#059669']
                          : ['#ffffff40', '#ffffff20']
                      }
                      style={styles.beatCircle}
                    >
                      <Ionicons 
                        name={isActive ? "hand-left" : "hand-left-outline"} 
                        size={isActive ? 32 : 24} 
                        color="#ffffff" 
                      />
                    </LinearGradient>
                  ) : (
                    <View style={styles.pauseCircle}>
                      <View style={styles.pauseDot} />
                    </View>
                  )}
                </Animatable.View>
              );
            })}
          </View>

          {/* Play Controls */}
          <View style={styles.controls}>
            <TouchableOpacity
              style={[styles.playButton, isPlaying && styles.playButtonActive]}
              onPress={togglePlay}
            >
              <Ionicons 
                name={isPlaying ? "pause" : "play"} 
                size={40} 
                color="#ffffff" 
              />
            </TouchableOpacity>
          </View>

          {/* Pattern Selector */}
          <Text style={styles.selectorTitle}>Choose a Rhythm</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.patternsScroll}
          >
            {RHYTHM_PATTERNS.map((p, index) => (
              <TouchableOpacity
                key={p.id}
                style={[
                  styles.patternCard,
                  currentPattern === index && styles.patternCardActive,
                ]}
                onPress={() => handlePatternSelect(index)}
              >
                <Ionicons 
                  name={p.icon as any} 
                  size={28} 
                  color={currentPattern === index ? '#06b6d4' : '#ffffff'} 
                />
                <Text style={[
                  styles.patternCardTitle,
                  currentPattern === index && styles.patternCardTitleActive,
                ]}>
                  {p.title}
                </Text>
                <View style={[
                  styles.patternBadge,
                  p.difficulty === 'EASY' && styles.badgeEasy,
                  p.difficulty === 'MEDIUM' && styles.badgeMedium,
                  p.difficulty === 'HARD' && styles.badgeHard,
                ]}>
                  <Text style={styles.patternBadgeText}>{p.difficulty}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.infoBox}>
            <Ionicons name="eye" size={24} color="#cffafe" />
            <Text style={styles.infoText}>
              Watch the circles light up with each beat. Yellow means active, green means completed!
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#06b6d4',
  },
  gradient: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  loopButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loopButtonActive: {
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  currentPatternContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 30,
  },
  currentPatternTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  currentPatternVerse: {
    fontSize: 32,
    color: '#ffffff',
    marginBottom: 12,
  },
  difficultyBadge: {
    backgroundColor: '#fbbf24',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  bpmText: {
    fontSize: 16,
    color: '#cffafe',
    fontWeight: '600',
  },
  beatVisualization: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  beatCircleWrapper: {
    marginVertical: 6,
  },
  beatCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  pauseCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  pauseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#cffafe',
  },
  controls: {
    alignItems: 'center',
    marginBottom: 30,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  playButtonActive: {
    backgroundColor: '#fbbf24',
  },
  selectorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  patternsScroll: {
    paddingRight: 20,
    gap: 12,
  },
  patternCard: {
    width: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  patternCardActive: {
    backgroundColor: '#ffffff',
  },
  patternCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  patternCardTitleActive: {
    color: '#0891b2',
  },
  patternBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeEasy: {
    backgroundColor: '#10b981',
  },
  badgeMedium: {
    backgroundColor: '#fbbf24',
  },
  badgeHard: {
    backgroundColor: '#ef4444',
  },
  patternBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: 16,
    borderRadius: 16,
    marginTop: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#e0f2fe',
    lineHeight: 20,
  },
});
