import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

// Language options
interface Language {
  code: string;
  name: string;
  icon: string;
  speechCode: string;
}

const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', icon: 'language-outline', speechCode: 'en-US' },
  { code: 'hi', name: 'हिंदी', icon: 'book-outline', speechCode: 'hi-IN' },
  { code: 'mr', name: 'मराठी', icon: 'school-outline', speechCode: 'mr-IN' },
  { code: 'te', name: 'తెలుగు', icon: 'library-outline', speechCode: 'te-IN' },
  { code: 'ta', name: 'தமிழ்', icon: 'document-text-outline', speechCode: 'ta-IN' },
  { code: 'kn', name: 'ಕನ್ನಡ', icon: 'newspaper-outline', speechCode: 'kn-IN' },
  { code: 'bn', name: 'বাংলা', icon: 'reader-outline', speechCode: 'bn-IN' },
  { code: 'gu', name: 'ગુજરાતી', icon: 'pencil-outline', speechCode: 'gu-IN' },
];

// Translations for instructions
const TRANSLATIONS: Record<string, Record<string, string>> = {
  welcome: {
    en: 'Welcome to Syllable Fun! Tap on any level to start learning Sanskrit letters. Each letter has a beautiful sound!',
    hi: 'सिलेबल फन में आपका स्वागत है! संस्कृत अक्षर सीखने के लिए किसी भी स्तर पर टैप करें। प्रत्येक अक्षर में एक सुंदर ध्वनि है!',
    mr: 'सिलेबल फनमध्ये आपले स्वागत आहे! संस्कृत अक्षरे शिकण्यासाठी कोणत्याही स्तरावर टॅप करा। प्रत्येक अक्षराचा एक सुंदर आवाज आहे!',
    te: 'సిలబుల్ ఫన్‌కు స్వాగతం! సంస్కృత అక్షరాలు నేర్చుకోవడానికి ఏదైనా స్థాయిని నొక్కండి. ప్రతి అక్షరానికి అందమైన ధ్వని ఉంటుంది!',
    ta: 'சிலபுல் ஃபன் க்கு வரவேற்கிறோம்! சமஸ்கிருத எழுத்துக்களைக் கற்க எந்த நிலையையும் தட்டவும். ஒவ்வொரு எழுத்துக்கும் அழகான ஒலி உள்ளது!',
    kn: 'ಸಿಲಬಲ್ ಫನ್‌ಗೆ ಸ್ವಾಗತ! ಸಂಸ್ಕೃತ ಅಕ್ಷರಗಳನ್ನು ಕಲಿಯಲು ಯಾವುದೇ ಹಂತವನ್ನು ಟ್ಯಾಪ್ ಮಾಡಿ. ಪ್ರತಿ ಅಕ್ಷರಕ್ಕೂ ಸುಂದರವಾದ ಧ್ವನಿ ಇದೆ!',
    bn: 'সিলেবল ফানে স্বাগতম! সংস্কৃত অক্ষর শেখার জন্য যেকোনো স্তরে ট্যাপ করুন। প্রতিটি অক্ষরের একটি সুন্দর শব্দ আছে!',
    gu: 'સિલેબલ ફનમાં આપનું સ્વાગત છે! સંસ્કૃત અક્ષરો શીખવા માટે કોઈપણ સ્તર પર ટેપ કરો. દરેક અક્ષરમાં એક સુંદર અવાજ છે!',
  },
  locked: {
    en: 'Complete previous levels to unlock this one!',
    hi: 'इसे अनलॉक करने के लिए पिछले स्तर पूरे करें!',
    mr: 'हे अनलॉक करण्यासाठी मागील स्तर पूर्ण करा!',
    te: 'దీన్ని అన్‌లాక్ చేయడానికి మునుపటి స్థాయిలను పూర్తి చేయండి!',
    ta: 'இதைத் திறக்க முந்தைய நிலைகளை முடிக்கவும்!',
    kn: 'ಇದನ್ನು ಅನ್‌ಲಾಕ್ ಮಾಡಲು ಹಿಂದಿನ ಹಂತಗಳನ್ನು ಪೂರ್ಣಗೊಳಿಸಿ!',
    bn: 'এটি আনলক করতে আগের স্তরগুলি সম্পূর্ণ করুন!',
    gu: 'આને અનલૉક કરવા માટે અગાઉના સ્તરો પૂર્ણ કરો!',
  },
  backToLevels: {
    en: 'Going back to levels',
    hi: 'स्तरों पर वापस जा रहे हैं',
    mr: 'स्तरांकडे परत जात आहोत',
    te: 'స్థాయిలకు తిరిగి వెళ్తున్నాం',
    ta: 'நிலைகளுக்குத் திரும்புகிறோம்',
    kn: 'ಹಂತಗಳಿಗೆ ಹಿಂತಿರುಗುತ್ತಿದ್ದೇವೆ',
    bn: 'স্তরগুলিতে ফিরে যাচ্ছি',
    gu: 'સ્તરો પર પાછા જઈ રહ્યા છીએ',
  },
  completion: {
    en: 'Amazing work! You completed this level! Try the next one!',
    hi: 'शानदार काम! आपने यह स्तर पूरा कर लिया! अगला प्रयास करें!',
    mr: 'आश्चर्यकारक काम! तुम्ही हा स्तर पूर्ण केला! पुढचा प्रयत्न करा!',
    te: 'అద్భుతమైన పని! మీరు ఈ స్థాయిని పూర్తి చేసారు! తదుపరిది ప్రయత్నించండి!',
    ta: 'அற்புதமான வேலை! நீங்கள் இந்த நிலையை முடித்துவிட்டீர்கள்! அடுத்ததை முயற்சிக்கவும்!',
    kn: 'ಅದ್ಭುತ ಕೆಲಸ! ನೀವು ಈ ಹಂತವನ್ನು ಪೂರ್ಣಗೊಳಿಸಿದ್ದೀರಿ! ಮುಂದಿನದನ್ನು ಪ್ರಯತ್ನಿಸಿ!',
    bn: 'আশ্চর্যজনক কাজ! আপনি এই স্তরটি সম্পূর্ণ করেছেন! পরবর্তীটি চেষ্টা করুন!',
    gu: 'અદ્ભુત કામ! તમે આ સ્તર પૂર્ણ કર્યું! આગળનો પ્રયાસ કરો!',
  },
};

// Level data structure
interface Level {
  id: number;
  title: string;
  syllables: string[];
  instruction: string;
  locked: boolean;
  completed: boolean;
}

const LEVELS_DATA: Level[] = [
  {
    id: 1,
    title: 'Learn A-E-I',
    syllables: ['अ', 'आ', 'इ', 'ई'],
    instruction: 'Tap each letter to hear its sound!',
    locked: false,
    completed: false,
  },
  {
    id: 2,
    title: 'Learn U-O',
    syllables: ['उ', 'ऊ', 'ऋ', 'ए'],
    instruction: 'Great job! Now learn these sounds!',
    locked: false,
    completed: false,
  },
  {
    id: 3,
    title: 'Ka Family',
    syllables: ['क', 'का', 'कि', 'की'],
    instruction: 'Meet the Ka family of sounds!',
    locked: false,
    completed: false,
  },
  {
    id: 4,
    title: 'Ga Family',
    syllables: ['ग', 'गा', 'गि', 'गी'],
    instruction: 'Now the Ga family joins!',
    locked: true,
    completed: false,
  },
  {
    id: 5,
    title: 'Ta Family',
    syllables: ['त', 'ता', 'ति', 'ती'],
    instruction: 'Learn the Ta family sounds!',
    locked: true,
    completed: false,
  },
  {
    id: 6,
    title: 'Da Family',
    syllables: ['द', 'दा', 'दि', 'दी'],
    instruction: 'The Da family is here!',
    locked: true,
    completed: false,
  },
  {
    id: 7,
    title: 'Pa Family',
    syllables: ['प', 'पा', 'पि', 'पी'],
    instruction: 'Meet the Pa family!',
    locked: true,
    completed: false,
  },
  {
    id: 8,
    title: 'Ba Family',
    syllables: ['ब', 'बा', 'बि', 'बी'],
    instruction: 'The Ba family awaits!',
    locked: true,
    completed: false,
  },
  {
    id: 9,
    title: 'Ma Family',
    syllables: ['म', 'मा', 'मि', 'मी'],
    instruction: 'Learn the Ma family!',
    locked: true,
    completed: false,
  },
  {
    id: 10,
    title: 'Master Challenge',
    syllables: ['य', 'र', 'ल', 'व'],
    instruction: 'Final challenge awaits!',
    locked: true,
    completed: false,
  },
];

export default function SyllableFunScreen() {
  const router = useRouter();
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [levels, setLevels] = useState<Level[]>(LEVELS_DATA);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [selectedSyllable, setSelectedSyllable] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(LANGUAGES[0]);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  useEffect(() => {
    loadLanguagePreference();
    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  const loadLanguagePreference = async () => {
    try {
      const savedLangData = await AsyncStorage.getItem('globalKidsLanguage');
      if (savedLangData) {
        const lang = JSON.parse(savedLangData);
        setSelectedLanguage(lang);
        // Play welcome in saved language
        setTimeout(() => {
          const message = TRANSLATIONS.welcome[lang.code];
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
    try {
      const message = TRANSLATIONS.welcome[selectedLanguage.code];
      speakText(message);
    } catch (error) {
      console.log('Error playing welcome:', error);
    }
  };

  const speakText = async (text: string, isSyllable: boolean = false) => {
    try {
      const Speech = require('expo-speech');
      
      // Stop any ongoing speech
      await Speech.stop();
      
      Speech.speak(text, {
        language: selectedLanguage.speechCode,
        pitch: 1.2, // Higher pitch for kid-friendly tone
        rate: isSyllable ? 0.6 : 0.7, // Slower for syllables, very slow for sentences
        // Different voice options for different platforms
        onDone: () => console.log('Speech completed'),
        onError: (error: any) => console.log('Speech error:', error),
      });
    } catch (error) {
      console.log('Speech error:', error);
    }
  };

  const handleLevelPress = (level: Level) => {
    if (level.locked) {
      const message = TRANSLATIONS.locked[selectedLanguage.code];
      speakText(message);
      return;
    }
    setSelectedLevel(level);
    speakText(level.instruction);
  };

  const handleSyllableTap = (syllable: string) => {
    setSelectedSyllable(syllable);
    // Play syllable pronunciation - extra slow for kids
    speakText(syllable, true);
    
    setTimeout(() => {
      setSelectedSyllable(null);
    }, 1000);
  };

  const handleLevelComplete = () => {
    if (selectedLevel) {
      const updatedLevels = levels.map(level => {
        if (level.id === selectedLevel.id) {
          return { ...level, completed: true };
        }
        if (level.id === selectedLevel.id + 1) {
          return { ...level, locked: false };
        }
        return level;
      });
      setLevels(updatedLevels);
      setSelectedLevel(null);
      const message = TRANSLATIONS.completion[selectedLanguage.code];
      speakText(message);
    }
  };

  const handleLanguageChange = (language: Language) => {
    setSelectedLanguage(language);
    setShowLanguageModal(false);
    // Speak welcome in new language
    const message = TRANSLATIONS.welcome[language.code];
    speakText(message);
  };

  useEffect(() => {
    // Only load language preference, don't play welcome here
    // Welcome is played in loadLanguagePreference
  }, []);

  if (selectedLevel) {
    return (
      <View style={styles.container}>
        {/* Level Header */}
        <LinearGradient
          colors={['#fbbf24', '#f59e0b']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <TouchableOpacity
            onPress={() => {
              setSelectedLevel(null);
              const message = TRANSLATIONS.backToLevels[selectedLanguage.code];
              speakText(message);
            }}
            style={styles.backButton}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={28} color="#ffffff" />
          </TouchableOpacity>
          <Animatable.Text animation="fadeIn" duration={800} style={styles.headerTitle}>
            {selectedLevel.title}
          </Animatable.Text>
          <View style={styles.headerSpacer} />
        </LinearGradient>

        <ScrollView style={styles.content} contentContainerStyle={styles.levelContentContainer}>
          {/* Instruction Card */}
          <Animatable.View animation="bounceIn" duration={1000} style={styles.instructionCard}>
            <Ionicons name="volume-high" size={40} color="#f59e0b" />
            <Text style={styles.instructionText}>{selectedLevel.instruction}</Text>
            <TouchableOpacity
              onPress={() => speakText(selectedLevel.instruction)}
              style={styles.playButton}
            >
              <Ionicons name="play-circle" size={36} color="#ffffff" />
              <Text style={styles.playButtonText}>Hear Instructions</Text>
            </TouchableOpacity>
          </Animatable.View>

          {/* Syllable Cards */}
          <View style={styles.syllablesGrid}>
            {selectedLevel.syllables.map((syllable, index) => (
              <Animatable.View
                key={syllable}
                animation="zoomIn"
                duration={600}
                delay={index * 150}
              >
                <TouchableOpacity
                  onPress={() => handleSyllableTap(syllable)}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={
                      selectedSyllable === syllable
                        ? ['#fbbf24', '#f59e0b']
                        : ['#fef3c7', '#fde68a']
                    }
                    style={[
                      styles.syllableCard,
                      selectedSyllable === syllable && styles.syllableCardActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.syllableText,
                        selectedSyllable === syllable && styles.syllableTextActive,
                      ]}
                    >
                      {syllable}
                    </Text>
                    <Ionicons
                      name="volume-medium"
                      size={24}
                      color={selectedSyllable === syllable ? '#ffffff' : '#f59e0b'}
                      style={styles.syllableIcon}
                    />
                  </LinearGradient>
                </TouchableOpacity>
              </Animatable.View>
            ))}
          </View>

          {/* Complete Button */}
          <Animatable.View animation="fadeInUp" duration={1000} delay={800}>
            <TouchableOpacity
              onPress={handleLevelComplete}
              style={styles.completeButton}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#10b981', '#059669']}
                style={styles.completeButtonGradient}
              >
                <Ionicons name="checkmark-circle" size={32} color="#ffffff" />
                <Text style={styles.completeButtonText}>I Know These Sounds!</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animatable.View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#fbbf24', '#f59e0b']}
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
        <Animatable.Text animation="fadeIn" duration={1000} style={styles.headerTitle}>
          Syllable Fun
        </Animatable.Text>
        <TouchableOpacity
          onPress={() => setShowLanguageModal(true)}
          style={styles.backButton}
          activeOpacity={0.8}
        >
          <Ionicons name={selectedLanguage.icon as any} size={28} color="#ffffff" />
        </TouchableOpacity>
      </LinearGradient>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Animatable.View animation="zoomIn" duration={400} style={styles.modalContent}>
            <LinearGradient
              colors={['#fef3c7', '#fde68a']}
              style={styles.modalGradient}
            >
              <View style={styles.modalHeader}>
                <Ionicons name="language" size={36} color="#f59e0b" />
                <Text style={styles.modalTitle}>Choose Language</Text>
                <Text style={styles.modalSubtitle}>भाषा चुनें</Text>
              </View>

                <ScrollView style={styles.languageList}>
                  {LANGUAGES.map((lang) => (
                    <TouchableOpacity
                      key={lang.code}
                      onPress={() => handleLanguageChange(lang)}
                      style={[
                        styles.languageItem,
                        selectedLanguage.code === lang.code && styles.languageItemSelected,
                      ]}
                      activeOpacity={0.7}
                    >
                      <View style={[
                        styles.languageIconCircle,
                        selectedLanguage.code === lang.code && styles.languageIconCircleSelected,
                      ]}>
                        <Ionicons 
                          name={lang.icon as any} 
                          size={32} 
                          color={selectedLanguage.code === lang.code ? '#10b981' : '#f59e0b'} 
                        />
                      </View>
                      <Text style={styles.languageName}>{lang.name}</Text>
                      {selectedLanguage.code === lang.code && (
                        <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>              <TouchableOpacity
                onPress={() => setShowLanguageModal(false)}
                style={styles.modalCloseButton}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#f59e0b', '#d97706']}
                  style={styles.modalCloseGradient}
                >
                  <Text style={styles.modalCloseText}>Done</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
          </Animatable.View>
        </View>
      </Modal>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Welcome Message */}
        <Animatable.View animation="fadeInDown" duration={1000} style={styles.welcomeCard}>
          <Ionicons name="sparkles" size={48} color="#f59e0b" />
          <Text style={styles.welcomeTitle}>Choose Your Level!</Text>
          <Text style={styles.welcomeSubtitle}>Tap any unlocked level to start learning</Text>
        </Animatable.View>

        {/* Levels Grid */}
        <View style={styles.levelsGrid}>
          {levels.map((level, index) => (
            <Animatable.View
              key={level.id}
              animation="fadeInUp"
              duration={800}
              delay={index * 100}
              style={styles.levelCardWrapper}
            >
              <TouchableOpacity
                onPress={() => handleLevelPress(level)}
                activeOpacity={0.8}
                disabled={level.locked}
              >
                <LinearGradient
                  colors={
                    level.locked
                      ? ['#d1d5db', '#9ca3af']
                      : level.completed
                      ? ['#10b981', '#059669']
                      : ['#fbbf24', '#f59e0b']
                  }
                  style={styles.levelCard}
                >
                  {level.locked && (
                    <View style={styles.lockOverlay}>
                      <Ionicons name="lock-closed" size={40} color="#6b7280" />
                    </View>
                  )}
                  
                  {level.completed && (
                    <View style={styles.completeBadge}>
                      <Ionicons name="checkmark-circle" size={28} color="#ffffff" />
                    </View>
                  )}

                  <Text style={styles.levelNumber}>Level {level.id}</Text>
                  <Text style={styles.levelTitle}>{level.title}</Text>
                  
                  <View style={styles.syllablePreview}>
                    {level.syllables.slice(0, 2).map((syl, i) => (
                      <Text key={i} style={styles.previewText}>
                        {syl}
                      </Text>
                    ))}
                  </View>

                  {!level.locked && (
                    <View style={styles.playIconContainer}>
                      <Ionicons name="play-circle" size={32} color="#ffffff" />
                    </View>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animatable.View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff5e6',
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
  headerSpacer: {
    width: 48,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  levelContentContainer: {
    padding: 20,
    paddingBottom: 60,
  },
  welcomeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 3,
    borderColor: '#fbbf24',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#f59e0b',
    marginTop: 12,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#78350f',
    textAlign: 'center',
  },
  levelsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  levelCardWrapper: {
    width: '48%',
    marginBottom: 16,
  },
  levelCard: {
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    minHeight: 160,
    justifyContent: 'center',
    position: 'relative',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  completeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 5,
  },
  levelNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
    opacity: 0.9,
  },
  levelTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  syllablePreview: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  previewText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  playIconContainer: {
    marginTop: 8,
  },
  instructionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 3,
    borderColor: '#fbbf24',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  instructionText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#78350f',
    textAlign: 'center',
    marginVertical: 16,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
    marginLeft: 8,
  },
  syllablesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  syllableCard: {
    width: (width - 60) / 2,
    aspectRatio: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#fbbf24',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  syllableCardActive: {
    borderColor: '#ffffff',
    transform: [{ scale: 1.05 }],
  },
  syllableText: {
    fontSize: 72,
    fontWeight: '900',
    color: '#f59e0b',
    marginBottom: 8,
  },
  syllableTextActive: {
    color: '#ffffff',
  },
  syllableIcon: {
    marginTop: 4,
  },
  completeButton: {
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  completeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  completeButtonText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    marginLeft: 12,
  },
  languageIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  languageIconCircleSelected: {
    backgroundColor: '#d1fae5',
    borderColor: '#10b981',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  modalGradient: {
    padding: 24,
    borderWidth: 3,
    borderColor: '#fbbf24',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#f59e0b',
    marginTop: 12,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#78350f',
  },
  languageList: {
    maxHeight: 400,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#fde68a',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  languageItemSelected: {
    borderColor: '#10b981',
    backgroundColor: '#d1fae5',
    borderWidth: 3,
  },
  languageName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#78350f',
    flex: 1,
  },
  modalCloseButton: {
    marginTop: 20,
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalCloseGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
  },
});
