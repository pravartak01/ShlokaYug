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

interface MantraSound {
  id: number;
  title: string;
  mantra: string;
  pronunciation: string;
  meaning: string;
  duration: number;
  icon: string;
  color: string;
}

const MANTRAS: MantraSound[] = [
  {
    id: 1,
    title: 'Om',
    mantra: 'ॐ',
    pronunciation: 'Om',
    meaning: 'The primordial sound of the universe',
    duration: 3000,
    icon: 'radio-button-on',
    color: '#8b5cf6',
  },
  {
    id: 2,
    title: 'Om Shanti',
    mantra: 'ॐ शान्तिः',
    pronunciation: 'Om Shanti Shanti Shanti',
    meaning: 'Om, Peace, Peace, Peace',
    duration: 5000,
    icon: 'flower',
    color: '#7c3aed',
  },
  {
    id: 3,
    title: 'Gayatri Mantra',
    mantra: 'ॐ भूर्भुवः स्वः',
    pronunciation: 'Om Bhur Bhuvah Svah Tat Savitur Varenyam Bhargo Devasya Dhimahi Dhiyo Yo Nah Prachodayat',
    meaning: 'We meditate on the glory of the Creator',
    duration: 8000,
    icon: 'sunny',
    color: '#6d28d9',
  },
  {
    id: 4,
    title: 'Maha Mrityunjaya',
    mantra: 'ॐ त्र्यम्बकं',
    pronunciation: 'Om Tryambakam Yajamahe Sugandhim Pushtivardhanam Urvarukamiva Bandhanan Mrityor Mukshiya Maamritat',
    meaning: 'Great death-conquering mantra for healing',
    duration: 10000,
    icon: 'shield-checkmark',
    color: '#5b21b6',
  },
  {
    id: 5,
    title: 'Om Namah Shivaya',
    mantra: 'ॐ नमः शिवाय',
    pronunciation: 'Om Namah Shivaya',
    meaning: 'I bow to Shiva, the inner Self',
    duration: 4000,
    icon: 'moon',
    color: '#7c3aed',
  },
  {
    id: 6,
    title: 'Om Gam Ganapataye',
    mantra: 'ॐ गं गणपतये',
    pronunciation: 'Om Gam Ganapataye Namaha',
    meaning: 'Salutations to Lord Ganesha',
    duration: 4500,
    icon: 'leaf',
    color: '#8b5cf6',
  },
];

const TRANSLATIONS: Record<string, Record<string, string>> = {
  welcome: {
    en: 'Welcome to Om Sounds!',
    hi: 'ओम ध्वनि में आपका स्वागत है!',
    ta: 'ஓம் ஒலிகளுக்கு வரவேற்கிறோம்!',
    te: 'ఓమ్ శబ్దాలకు స్వాగతం!',
    kn: 'ಓಂ ಶಬ್ದಗಳಿಗೆ ಸ್ವಾಗತ',
    ml: 'ഓം ശബ്ദങ്ങളിലേക്ക് സ്വാഗതം!',
    bn: 'ওম সাউন্ডে স্বাগতম!',
    gu: 'ઓમ સાઉન્ડમાં આપનું સ્વાગત છે!',
  },
  instructions: {
    en: 'Tap any mantra to hear it chanted. Close your eyes and feel peaceful.',
    hi: 'किसी भी मंत्र को सुनने के लिए टैप करें। आँखें बंद करें और शांति महसूस करें।',
    ta: 'எந்த மந்திரத்தையும் கேட்க தட்டவும். கண்களை மூடி அமைதியை உணருங்கள்.',
    te: 'ఏదైనా మంత్రాన్ని వినడానికి నొక్కండి. కళ్ళు మూసుకుని శాంతిని అనుభవించండి.',
    kn: 'ಯಾವುದೇ ಮಂತ್ರವನ್ನು ಕೇಳಲು ಟ್ಯಾಪ್ ಮಾಡಿ. ಕಣ್ಣುಗಳನ್ನು ಮುಚ್ಚಿ ಶಾಂತಿಯನ್ನು ಅನುಭವಿಸಿ.',
    ml: 'ഏതെങ്കിലും മന്ത്രം കേൾക്കാൻ ടാപ്പ് ചെയ്യുക. കണ്ണുകൾ അടച്ച് സമാധാനം അനുഭവിക്കുക.',
    bn: 'যেকোনো মন্ত্র শুনতে ট্যাপ করুন। চোখ বন্ধ করে শান্তি অনুভব করুন।',
    gu: 'કોઈપણ મંત્ર સાંભળવા માટે ટેપ કરો. આંખો બંધ કરો અને શાંતિ અનુભવો.',
  },
  chanting: {
    en: 'Chanting mantra...',
    hi: 'मंत्र का जाप हो रहा है...',
    ta: 'மந்திரம் ஓதுகிறது...',
    te: 'మంత్రం జపిస్తోంది...',
    kn: 'ಮಂತ್ರವನ್ನು ಪಠಿಸಲಾಗುತ್ತಿದೆ...',
    ml: 'മന്ത്രം ജപിക്കുന്നു...',
    bn: 'মন্ত্র জপ করা হচ্ছে...',
    gu: 'મંત્ર જપ કરવામાં આવી રહ્યો છે...',
  },
  loopOn: {
    en: 'Loop is ON',
    hi: 'लूप चालू है',
    ta: 'லூப் இயக்கத்தில் உள்ளது',
    te: 'లూప్ ఆన్ అయింది',
    kn: 'ಲೂಪ್ ಆನ್ ಆಗಿದೆ',
    ml: 'ലൂപ്പ് ഓണാണ്',
    bn: 'লুপ চালু আছে',
    gu: 'લૂપ ચાલુ છે',
  },
  loopOff: {
    en: 'Loop is OFF',
    hi: 'लूप बंद है',
    ta: 'லூப் நிறுத்தப்பட்டது',
    te: 'లూప్ ఆఫ్ అయింది',
    kn: 'ಲೂಪ್ ಆಫ್ ಆಗಿದೆ',
    ml: 'ലൂപ്പ് ഓഫാണ്',
    bn: 'লুপ বন্ধ আছে',
    gu: 'લૂપ બંધ છે',
  },
};

export default function OmSounds() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>({
    code: 'en',
    name: 'English',
    icon: 'language',
    speechCode: 'en-US',
  });
  const [playingMantra, setPlayingMantra] = useState<number | null>(null);
  const [isLooping, setIsLooping] = useState(false);
  const [currentSound, setCurrentSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    loadLanguagePreference();
    speakWelcome();
    
    return () => {
      if (currentSound) {
        currentSound.unloadAsync();
      }
    };
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

  const playMantraSound = async (frequency: number, duration: number) => {
    try {
      // Generate a simple sine wave tone for Om sound
      const sampleRate = 44100;
      const numSamples = Math.floor((duration / 1000) * sampleRate);
      const buffer = new ArrayBuffer(44 + numSamples * 2);
      const view = new DataView(buffer);
      
      // WAV header
      const writeString = (offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };
      
      writeString(0, 'RIFF');
      view.setUint32(4, 36 + numSamples * 2, true);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, 1, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2, true);
      view.setUint16(32, 2, true);
      view.setUint16(34, 16, true);
      writeString(36, 'data');
      view.setUint32(40, numSamples * 2, true);
      
      // Generate sine wave
      for (let i = 0; i < numSamples; i++) {
        const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.3;
        view.setInt16(44 + i * 2, sample * 32767, true);
      }
      
      const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
      const uri = `data:audio/wav;base64,${base64}`;
      
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, volume: 0.7, isLooping },
        onPlaybackStatusUpdate
      );
      
      setCurrentSound(sound);
    } catch (error) {
      console.log('Error playing mantra sound:', error);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.didJustFinish && !isLooping) {
      setPlayingMantra(null);
      setCurrentSound(null);
    }
  };

  const handleMantraTap = async (mantra: MantraSound) => {
    // Stop current sound if playing
    if (currentSound) {
      await currentSound.unloadAsync();
      setCurrentSound(null);
    }

    if (playingMantra === mantra.id) {
      setPlayingMantra(null);
      return;
    }

    setPlayingMantra(mantra.id);
    
    // Announce chanting
    const message = TRANSLATIONS.chanting[selectedLanguage.code] || TRANSLATIONS.chanting.en;
    speakText(message);

    // Wait a bit then play the mantra
    setTimeout(async () => {
      // Chant the mantra pronunciation
      Speech.speak(mantra.pronunciation, {
        language: 'en-IN',
        pitch: 0.8,
        rate: 0.4,
      });

      // Play Om sound (low frequency for meditative effect)
      await playMantraSound(136.1, mantra.duration); // Om frequency (C# - 136.1 Hz)
    }, 1500);
  };

  const toggleLoop = () => {
    const newLoopState = !isLooping;
    setIsLooping(newLoopState);
    
    const message = newLoopState 
      ? TRANSLATIONS.loopOn[selectedLanguage.code] 
      : TRANSLATIONS.loopOff[selectedLanguage.code];
    speakText(message);

    // If currently playing, update the sound's loop state
    if (currentSound) {
      currentSound.setIsLoopingAsync(newLoopState);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#8b5cf6', '#7c3aed']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={28} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Om Sounds</Text>
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
          <Animatable.View animation="fadeInDown" duration={800}>
            <View style={styles.titleContainer}>
              <Ionicons name="flower" size={48} color="#ffffff" />
              <Text style={styles.title}>Sacred Mantras</Text>
              <Text style={styles.subtitle}>
                Close your eyes and listen to the peaceful sounds
              </Text>
            </View>
          </Animatable.View>

          <View style={styles.mantrasGrid}>
            {MANTRAS.map((mantra, index) => (
              <Animatable.View
                key={mantra.id}
                animation="fadeInUp"
                delay={index * 100}
                duration={600}
              >
                <TouchableOpacity
                  style={[
                    styles.mantraCard,
                    playingMantra === mantra.id && styles.mantraCardActive,
                  ]}
                  onPress={() => handleMantraTap(mantra)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={
                      playingMantra === mantra.id
                        ? ['#ffffff', '#f3e8ff']
                        : [mantra.color + '20', mantra.color + '10']
                    }
                    style={styles.mantraGradient}
                  >
                    <View style={styles.mantraIconContainer}>
                      <Ionicons 
                        name={mantra.icon as any} 
                        size={32} 
                        color={playingMantra === mantra.id ? '#8b5cf6' : '#ffffff'} 
                      />
                    </View>

                    <Text style={[
                      styles.mantraSymbol,
                      playingMantra === mantra.id && styles.mantraSymbolActive,
                    ]}>
                      {mantra.mantra}
                    </Text>

                    <Text style={[
                      styles.mantraTitle,
                      playingMantra === mantra.id && styles.mantraTitleActive,
                    ]}>
                      {mantra.title}
                    </Text>

                    <Text style={[
                      styles.mantraMeaning,
                      playingMantra === mantra.id && styles.mantraMeaningActive,
                    ]}>
                      {mantra.meaning}
                    </Text>

                    {playingMantra === mantra.id && (
                      <Animatable.View
                        animation="pulse"
                        iterationCount="infinite"
                        duration={1500}
                        style={styles.playingIndicator}
                      >
                        <Ionicons name="radio-button-on" size={20} color="#8b5cf6" />
                        <Text style={styles.playingText}>Playing</Text>
                      </Animatable.View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </Animatable.View>
            ))}
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={24} color="#ddd6fe" />
            <Text style={styles.infoText}>
              Find a quiet place, sit comfortably, and let the mantras bring you peace
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
    backgroundColor: '#8b5cf6',
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
  titleContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 15,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#e9d5ff',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  mantrasGrid: {
    gap: 16,
  },
  mantraCard: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  mantraCardActive: {
    elevation: 8,
    shadowOpacity: 0.4,
  },
  mantraGradient: {
    padding: 20,
  },
  mantraIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  mantraSymbol: {
    fontSize: 36,
    color: '#ffffff',
    marginBottom: 8,
  },
  mantraSymbolActive: {
    color: '#8b5cf6',
  },
  mantraTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
  },
  mantraTitleActive: {
    color: '#7c3aed',
  },
  mantraMeaning: {
    fontSize: 14,
    color: '#e9d5ff',
    lineHeight: 20,
  },
  mantraMeaningActive: {
    color: '#8b5cf6',
  },
  playingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  playingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8b5cf6',
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
    color: '#f3e8ff',
    lineHeight: 20,
  },
});
