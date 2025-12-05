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
import * as Animatable from 'react-native-animatable';

const { width, height } = Dimensions.get('window');

interface Language {
  code: string;
  name: string;
  icon: string;
  speechCode: string;
}

interface VerseChunk {
  sanskrit: string;
  transliteration: string;
  meaning: string;
}

interface Verse {
  id: number;
  title: string;
  fullVerse: string;
  fullPronunciation: string;
  chunks: VerseChunk[];
  icon: string;
}

const VERSES: Verse[] = [
  {
    id: 1,
    title: 'Gayatri Mantra',
    fullVerse: 'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्',
    fullPronunciation: 'Om Bhur Bhuvah Svah Tat Savitur Varenyam Bhargo Devasya Dhimahi Dhiyo Yo Nah Prachodayat',
    icon: 'sunny',
    chunks: [
      {
        sanskrit: 'ॐ भूर्भुवः स्वः',
        transliteration: 'Om Bhur Bhuvah Svah',
        meaning: 'Om, Earth, Atmosphere, Heaven',
      },
      {
        sanskrit: 'तत्सवितुर्वरेण्यं',
        transliteration: 'Tat Savitur Varenyam',
        meaning: 'That divine light, most adorable',
      },
      {
        sanskrit: 'भर्गो देवस्य धीमहि',
        transliteration: 'Bhargo Devasya Dhimahi',
        meaning: 'Radiance of God, we meditate',
      },
      {
        sanskrit: 'धियो यो नः प्रचोदयात्',
        transliteration: 'Dhiyo Yo Nah Prachodayat',
        meaning: 'May it illuminate our minds',
      },
    ],
  },
  {
    id: 2,
    title: 'Shanti Mantra',
    fullVerse: 'ॐ सह नाववतु सह नौ भुनक्तु सह वीर्यं करवावहै',
    fullPronunciation: 'Om Saha Navavatu Saha Nau Bhunaktu Saha Viryam Karavavahai',
    icon: 'flower',
    chunks: [
      {
        sanskrit: 'ॐ सह नाववतु',
        transliteration: 'Om Saha Navavatu',
        meaning: 'May we be protected together',
      },
      {
        sanskrit: 'सह नौ भुनक्तु',
        transliteration: 'Saha Nau Bhunaktu',
        meaning: 'May we be nourished together',
      },
      {
        sanskrit: 'सह वीर्यं करवावहै',
        transliteration: 'Saha Viryam Karavavahai',
        meaning: 'May we work together with energy',
      },
    ],
  },
  {
    id: 3,
    title: 'Ganesh Mantra',
    fullVerse: 'ॐ गं गणपतये नमः',
    fullPronunciation: 'Om Gam Ganapataye Namaha',
    icon: 'leaf',
    chunks: [
      {
        sanskrit: 'ॐ गं',
        transliteration: 'Om Gam',
        meaning: 'Om, the seed sound of Ganesha',
      },
      {
        sanskrit: 'गणपतये',
        transliteration: 'Ganapataye',
        meaning: 'To Ganapati (Lord of hosts)',
      },
      {
        sanskrit: 'नमः',
        transliteration: 'Namaha',
        meaning: 'Salutations, I bow',
      },
    ],
  },
];

const TRANSLATIONS: Record<string, Record<string, string>> = {
  welcome: {
    en: 'Welcome to Slow Mode!',
    hi: 'स्लो मोड में आपका स्वागत है!',
    ta: 'ஸ்லோ மோடுக்கு வரவேற்கிறோம்!',
    te: 'స్లో మోడ్‌కు స్వాగతం!',
    kn: 'ಸ್ಲೋ ಮೋಡ್‌ಗೆ ಸ್ವಾಗತ',
    ml: 'സ്ലോ മോഡിലേക്ക് സ്വാഗതം!',
    bn: 'স্লো মোডে স্বাগতম!',
    gu: 'સ્લો મોડમાં આપનું સ્વાગત છે!',
  },
  instructions: {
    en: 'Learn slowly, piece by piece. Tap each chunk to hear it clearly.',
    hi: 'धीरे-धीरे सीखें, टुकड़े-टुकड़े में। प्रत्येक भाग को स्पष्ट रूप से सुनने के लिए टैप करें।',
    ta: 'மெதுவாக கற்றுக்கொள்ளுங்கள், ஒவ்வொரு பகுதியாக.',
    te: 'నెమ్మదిగా నేర్చుకోండి, భాగాలుగా.',
    kn: 'ನಿಧಾನವಾಗಿ ಕಲಿಯಿರಿ, ತುಂಡು ತುಂಡಾಗಿ.',
    ml: 'പതിയെ പഠിക്കുക, ഭാഗങ്ങളായി.',
    bn: 'ধীরে ধীরে শিখুন, টুকরো টুকরো করে।',
    gu: 'ધીમે ધીમે શીખો, ટુકડે ટુકડે.',
  },
  listening: {
    en: 'Listening to chunk...',
    hi: 'भाग सुन रहे हैं...',
    ta: 'பகுதியைக் கேட்கிறது...',
    te: 'భాగాన్ని వింటోంది...',
    kn: 'ಭಾಗವನ್ನು ಕೇಳುತ್ತಿದೆ...',
    ml: 'ഭാഗം കേൾക്കുന്നു...',
    bn: 'অংশ শুনছি...',
    gu: 'ભાગ સાંભળી રહ્યા છીએ...',
  },
};

export default function SlowMode() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>({
    code: 'en',
    name: 'English',
    icon: 'language',
    speechCode: 'en-US',
  });
  const [currentVerse, setCurrentVerse] = useState(0);
  const [playingChunk, setPlayingChunk] = useState<number | null>(null);
  const [speed, setSpeed] = useState<'slow' | 'normal' | 'fast'>('slow');

  useEffect(() => {
    loadLanguagePreference();
    speakWelcome();
  }, []);

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

  const getSpeechRate = (): number => {
    switch (speed) {
      case 'slow': return 0.3;
      case 'normal': return 0.5;
      case 'fast': return 0.7;
    }
  };

  const handleChunkTap = (index: number) => {
    if (playingChunk === index) {
      setPlayingChunk(null);
      Speech.stop();
      return;
    }

    setPlayingChunk(index);
    
    const message = TRANSLATIONS.listening[selectedLanguage.code] || TRANSLATIONS.listening.en;
    speakText(message);

    const verse = VERSES[currentVerse];
    const chunk = verse.chunks[index];

    setTimeout(() => {
      Speech.speak(chunk.transliteration, {
        language: 'en-IN',
        pitch: 0.9,
        rate: getSpeechRate(),
        onDone: () => setPlayingChunk(null),
      });
    }, 1500);
  };

  const playFullVerse = () => {
    Speech.stop();
    setPlayingChunk(null);

    const verse = VERSES[currentVerse];
    Speech.speak(verse.fullPronunciation, {
      language: 'en-IN',
      pitch: 0.9,
      rate: getSpeechRate(),
    });
  };

  const verse = VERSES[currentVerse];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#10b981', '#059669']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={28} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Slow Mode</Text>
          <View style={styles.speedSelector}>
            <Ionicons name="speedometer" size={24} color="#ffffff" />
          </View>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Verse Selector */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.verseScroll}
          >
            {VERSES.map((v, index) => (
              <TouchableOpacity
                key={v.id}
                style={[
                  styles.verseTab,
                  currentVerse === index && styles.verseTabActive,
                ]}
                onPress={() => setCurrentVerse(index)}
              >
                <Ionicons 
                  name={v.icon as any} 
                  size={24} 
                  color={currentVerse === index ? '#10b981' : '#ffffff'} 
                />
                <Text style={[
                  styles.verseTabText,
                  currentVerse === index && styles.verseTabTextActive,
                ]}>
                  {v.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Speed Control */}
          <Animatable.View animation="fadeInDown" duration={800}>
            <View style={styles.speedControl}>
              <Text style={styles.speedLabel}>Learning Speed</Text>
              <View style={styles.speedButtons}>
                {(['slow', 'normal', 'fast'] as const).map((s) => (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.speedButton,
                      speed === s && styles.speedButtonActive,
                    ]}
                    onPress={() => setSpeed(s)}
                  >
                    <Text style={[
                      styles.speedButtonText,
                      speed === s && styles.speedButtonTextActive,
                    ]}>
                      {s.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </Animatable.View>

          {/* Full Verse Card */}
          <Animatable.View animation="fadeIn" duration={1000}>
            <View style={styles.fullVerseCard}>
              <Text style={styles.fullVerseTitle}>Complete Verse</Text>
              <Text style={styles.fullVerseSanskrit}>{verse.fullVerse}</Text>
              <TouchableOpacity
                style={styles.playFullButton}
                onPress={playFullVerse}
              >
                <Ionicons name="play-circle" size={24} color="#ffffff" />
                <Text style={styles.playFullText}>Play Full Verse</Text>
              </TouchableOpacity>
            </View>
          </Animatable.View>

          {/* Chunks */}
          <Text style={styles.chunksTitle}>Learn Piece by Piece</Text>
          <View style={styles.chunksContainer}>
            {verse.chunks.map((chunk, index) => (
              <Animatable.View
                key={index}
                animation="fadeInUp"
                delay={index * 150}
                duration={600}
              >
                <TouchableOpacity
                  style={[
                    styles.chunkCard,
                    playingChunk === index && styles.chunkCardActive,
                  ]}
                  onPress={() => handleChunkTap(index)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={
                      playingChunk === index
                        ? ['#fbbf24', '#f59e0b']
                        : ['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.05)']
                    }
                    style={styles.chunkGradient}
                  >
                    <View style={styles.chunkHeader}>
                      <View style={styles.chunkNumber}>
                        <Text style={styles.chunkNumberText}>{index + 1}</Text>
                      </View>
                      {playingChunk === index && (
                        <Animatable.View
                          animation="pulse"
                          iterationCount="infinite"
                          duration={1000}
                        >
                          <Ionicons name="volume-high" size={24} color="#ffffff" />
                        </Animatable.View>
                      )}
                    </View>

                    <Text style={styles.chunkSanskrit}>{chunk.sanskrit}</Text>
                    <Text style={styles.chunkTranslit}>{chunk.transliteration}</Text>
                    <Text style={styles.chunkMeaning}>{chunk.meaning}</Text>

                    <View style={styles.tapHint}>
                      <Ionicons name="hand-left-outline" size={16} color="#d1fae5" />
                      <Text style={styles.tapHintText}>Tap to hear</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </Animatable.View>
            ))}
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="time" size={24} color="#d1fae5" />
            <Text style={styles.infoText}>
              Take your time! Learn each piece slowly before moving to the next.
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
    backgroundColor: '#10b981',
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
  speedSelector: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  verseScroll: {
    gap: 12,
    marginBottom: 24,
  },
  verseTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
  },
  verseTabActive: {
    backgroundColor: '#ffffff',
  },
  verseTabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  verseTabTextActive: {
    color: '#10b981',
  },
  speedControl: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  speedLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
  },
  speedButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  speedButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  speedButtonActive: {
    backgroundColor: '#fbbf24',
  },
  speedButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#d1fae5',
  },
  speedButtonTextActive: {
    color: '#ffffff',
  },
  fullVerseCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  fullVerseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  fullVerseSanskrit: {
    fontSize: 20,
    color: '#ffffff',
    lineHeight: 32,
    marginBottom: 16,
  },
  playFullButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fbbf24',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  playFullText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  chunksTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  chunksContainer: {
    gap: 16,
  },
  chunkCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  chunkCardActive: {
    elevation: 8,
  },
  chunkGradient: {
    padding: 20,
  },
  chunkHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  chunkNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chunkNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  chunkSanskrit: {
    fontSize: 24,
    color: '#ffffff',
    marginBottom: 8,
  },
  chunkTranslit: {
    fontSize: 18,
    fontWeight: '600',
    color: '#d1fae5',
    marginBottom: 6,
  },
  chunkMeaning: {
    fontSize: 14,
    color: '#d1fae5',
    lineHeight: 20,
    marginBottom: 12,
  },
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tapHintText: {
    fontSize: 12,
    color: '#d1fae5',
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
    color: '#d1fae5',
    lineHeight: 20,
  },
});
