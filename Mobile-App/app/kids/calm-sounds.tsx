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

interface SoundTrack {
  id: number;
  title: string;
  description: string;
  icon: string;
  duration: number;
  frequency: number;
  color: string;
  type: 'tanpura' | 'nature' | 'bells' | 'ambient';
}

const SOUND_TRACKS: SoundTrack[] = [
  {
    id: 1,
    title: 'Tanpura Drone',
    description: 'Traditional Indian instrument, very calming',
    icon: 'musical-note',
    duration: 300000, // 5 minutes
    frequency: 196, // G3
    color: '#a855f7',
    type: 'tanpura',
  },
  {
    id: 2,
    title: 'Temple Bells',
    description: 'Peaceful bell sounds from ancient temples',
    icon: 'notifications',
    duration: 180000, // 3 minutes
    frequency: 528, // C5
    color: '#9333ea',
    type: 'bells',
  },
  {
    id: 3,
    title: 'Om Chanting',
    description: 'Continuous Om mantra for deep peace',
    icon: 'radio-button-on',
    duration: 240000, // 4 minutes
    frequency: 136.1, // Om frequency
    color: '#7c3aed',
    type: 'ambient',
  },
  {
    id: 4,
    title: 'Forest Peace',
    description: 'Nature sounds with gentle wind',
    icon: 'leaf',
    duration: 360000, // 6 minutes
    frequency: 432, // Healing frequency
    color: '#8b5cf6',
    type: 'nature',
  },
  {
    id: 5,
    title: 'Meditation Hum',
    description: 'Deep humming for concentration',
    icon: 'pulse',
    duration: 300000, // 5 minutes
    frequency: 256, // C4
    color: '#6d28d9',
    type: 'ambient',
  },
  {
    id: 6,
    title: 'Water Sounds',
    description: 'Flowing water and gentle rain',
    icon: 'water',
    duration: 420000, // 7 minutes
    frequency: 384, // G4
    color: '#a855f7',
    type: 'nature',
  },
];

const TRANSLATIONS: Record<string, Record<string, string>> = {
  welcome: {
    en: 'Welcome to Calm Sounds!',
    hi: 'शांत ध्वनि में आपका स्वागत है!',
    ta: 'அமைதியான ஒலிகளுக்கு வரவேற்கிறோம்!',
    te: 'ప్రశాంత శబ్దాలకు స్వాగతం!',
    kn: 'ಶಾಂತ ಶಬ್ದಗಳಿಗೆ ಸ್ವಾಗತ',
    ml: 'ശാന്തമായ ശബ്ദങ്ങളിലേക്ക് സ്വാഗതം!',
    bn: 'শান্ত সাউন্ডে স্বাগতম!',
    gu: 'શાંત સાઉન્ડમાં આપનું સ્વાગત છે!',
  },
  instructions: {
    en: 'Find a quiet place, sit comfortably, and let the sounds relax you.',
    hi: 'एक शांत जगह खोजें, आराम से बैठें, और ध्वनियों को आपको आराम देने दें।',
    ta: 'அமைதியான இடம் கண்டுபிடித்து, வசதியாக உட்காருங்கள்.',
    te: 'ప్రశాంతమైన స్థలం కనుగొనండి, సౌకర్యంగా కూర్చోండి.',
    kn: 'ಶಾಂತ ಸ್ಥಳವನ್ನು ಹುಡುಕಿ, ಆರಾಮವಾಗಿ ಕುಳಿತುಕೊಳ್ಳಿ.',
    ml: 'ശാന്തമായ സ്ഥലം കണ്ടെത്തി, സുഖമായി ഇരിക്കുക.',
    bn: 'একটি শান্ত জায়গা খুঁজুন, আরামে বসুন।',
    gu: 'શાંત જગ્યા શોધો, આરામથી બેસો.',
  },
  playing: {
    en: 'Playing calming sounds...',
    hi: 'शांत ध्वनि बज रही है...',
    ta: 'அமைதியான ஒலிகள் இசைக்கப்படுகின்றன...',
    te: 'ప్రశాంత శబ్దాలు ప్లే అవుతున్నాయి...',
    kn: 'ಶಾಂತ ಶಬ್ದಗಳು ಪ್ಲೇ ಆಗುತ್ತಿವೆ...',
    ml: 'ശാന്തമായ ശബ്ദങ്ങൾ പ്ലേ ചെയ്യുന്നു...',
    bn: 'শান্ত সাউন্ড বাজছে...',
    gu: 'શાંત સાઉન્ડ વાગી રહ્યો છે...',
  },
  stopped: {
    en: 'Sound stopped. Feel refreshed!',
    hi: 'ध्वनि बंद। तरोताजा महसूस करें!',
    ta: 'ஒலி நிறுத்தப்பட்டது. புத்துணர்ச்சி அடையுங்கள்!',
    te: 'శబ్దం ఆగిపోయింది. రిఫ్రెష్ అనిపించండి!',
    kn: 'ಶಬ್ದ ನಿಲ್ಲಿಸಲಾಗಿದೆ. ತಾಜಾ ಅನಿಸಿಕೊಳ್ಳಿ!',
    ml: 'ശബ്ദം നിർത്തി. സന്തോഷം തോന്നുക!',
    bn: 'সাউন্ড বন্ধ। সতেজ অনুভব করুন!',
    gu: 'સાઉન્ડ બંધ. તાજગી અનુભવો!',
  },
};

export default function CalmSounds() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>({
    code: 'en',
    name: 'English',
    icon: 'language',
    speechCode: 'en-US',
  });
  const [playingTrack, setPlayingTrack] = useState<number | null>(null);
  const [currentSound, setCurrentSound] = useState<Audio.Sound | null>(null);
  const [remainingTime, setRemainingTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadLanguagePreference();
    speakWelcome();
    
    return () => {
      if (currentSound) {
        currentSound.unloadAsync();
      }
      if (timerInterval) {
        clearInterval(timerInterval);
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

  const generateContinuousTone = async (frequency: number, duration: number) => {
    try {
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
      
      // Generate continuous tone with envelope
      for (let i = 0; i < numSamples; i++) {
        const envelope = Math.min(1, i / (sampleRate * 0.1)); // Fade in
        const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate) * envelope * 0.25;
        view.setInt16(44 + i * 2, sample * 32767, true);
      }
      
      const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
      const uri = `data:audio/wav;base64,${base64}`;
      
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, volume: 0.5, isLooping: true },
        onPlaybackStatusUpdate
      );
      
      setCurrentSound(sound);
    } catch (error) {
      console.log('Error generating tone:', error);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.didJustFinish && !status.isLooping) {
      handleStop();
    }
  };

  const handleTrackPlay = async (track: SoundTrack) => {
    // Stop current if playing
    if (currentSound) {
      await currentSound.unloadAsync();
      setCurrentSound(null);
    }

    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }

    if (playingTrack === track.id) {
      handleStop();
      return;
    }

    setPlayingTrack(track.id);
    setRemainingTime(track.duration);

    const message = TRANSLATIONS.playing[selectedLanguage.code] || TRANSLATIONS.playing.en;
    speakText(message);

    setTimeout(async () => {
      await generateContinuousTone(track.frequency, track.duration);

      // Start countdown timer
      const interval = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1000) {
            clearInterval(interval);
            handleStop();
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
      
      setTimerInterval(interval);
    }, 1500);
  };

  const handleStop = async () => {
    if (currentSound) {
      await currentSound.unloadAsync();
      setCurrentSound(null);
    }

    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }

    setPlayingTrack(null);
    setRemainingTime(0);

    const message = TRANSLATIONS.stopped[selectedLanguage.code] || TRANSLATIONS.stopped.en;
    speakText(message);
  };

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#a855f7', '#9333ea']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={28} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Calm Sounds</Text>
          <View style={styles.headerIcon}>
            <Ionicons name="headset" size={28} color="#ffffff" />
          </View>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <Animatable.View animation="fadeInDown" duration={800}>
            <View style={styles.titleContainer}>
              <Ionicons name="sparkles" size={48} color="#ffffff" />
              <Text style={styles.title}>Peaceful Sounds</Text>
              <Text style={styles.subtitle}>
                Close your eyes and feel the peace
              </Text>
            </View>
          </Animatable.View>

          {/* Timer Display */}
          {playingTrack !== null && (
            <Animatable.View 
              animation="fadeIn" 
              duration={600}
              style={styles.timerCard}
            >
              <Ionicons name="time" size={32} color="#a855f7" />
              <Text style={styles.timerText}>{formatTime(remainingTime)}</Text>
              <Text style={styles.timerLabel}>Remaining</Text>
              
              <TouchableOpacity
                style={styles.stopButton}
                onPress={handleStop}
              >
                <Ionicons name="stop-circle" size={28} color="#ffffff" />
                <Text style={styles.stopText}>Stop</Text>
              </TouchableOpacity>
            </Animatable.View>
          )}

          {/* Sound Tracks */}
          <View style={styles.tracksContainer}>
            {SOUND_TRACKS.map((track, index) => (
              <Animatable.View
                key={track.id}
                animation="fadeInUp"
                delay={index * 100}
                duration={600}
              >
                <TouchableOpacity
                  style={[
                    styles.trackCard,
                    playingTrack === track.id && styles.trackCardActive,
                  ]}
                  onPress={() => handleTrackPlay(track)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={
                      playingTrack === track.id
                        ? ['#fbbf24', '#f59e0b']
                        : [track.color + '30', track.color + '10']
                    }
                    style={styles.trackGradient}
                  >
                    <View style={styles.trackHeader}>
                      <View style={[
                        styles.trackIconContainer,
                        playingTrack === track.id && styles.trackIconActive,
                      ]}>
                        <Ionicons 
                          name={track.icon as any} 
                          size={32} 
                          color={playingTrack === track.id ? '#fbbf24' : '#ffffff'} 
                        />
                      </View>

                      {playingTrack === track.id && (
                        <Animatable.View
                          animation="pulse"
                          iterationCount="infinite"
                          duration={1500}
                        >
                          <Ionicons name="radio-button-on" size={24} color="#fbbf24" />
                        </Animatable.View>
                      )}
                    </View>

                    <Text style={[
                      styles.trackTitle,
                      playingTrack === track.id && styles.trackTitleActive,
                    ]}>
                      {track.title}
                    </Text>

                    <Text style={[
                      styles.trackDescription,
                      playingTrack === track.id && styles.trackDescriptionActive,
                    ]}>
                      {track.description}
                    </Text>

                    <View style={styles.trackInfo}>
                      <View style={styles.trackDuration}>
                        <Ionicons 
                          name="time-outline" 
                          size={16} 
                          color={playingTrack === track.id ? '#92400e' : '#e9d5ff'} 
                        />
                        <Text style={[
                          styles.trackDurationText,
                          playingTrack === track.id && styles.trackDurationActive,
                        ]}>
                          {formatTime(track.duration)}
                        </Text>
                      </View>

                      <View style={[
                        styles.trackType,
                        playingTrack === track.id && styles.trackTypeActive,
                      ]}>
                        <Text style={[
                          styles.trackTypeText,
                          playingTrack === track.id && styles.trackTypeTextActive,
                        ]}>
                          {track.type.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </Animatable.View>
            ))}
          </View>

          <View style={styles.infoBox}>
            <Ionicons name="heart" size={24} color="#f3e8ff" />
            <Text style={styles.infoText}>
              Listen daily for a few minutes to feel calm and peaceful
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
    backgroundColor: '#a855f7',
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
  headerIcon: {
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
    color: '#f3e8ff',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  timerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#a855f7',
    marginTop: 12,
  },
  timerLabel: {
    fontSize: 16,
    color: '#7c3aed',
    marginBottom: 16,
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  stopText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  tracksContainer: {
    gap: 16,
  },
  trackCard: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  trackCardActive: {
    elevation: 8,
  },
  trackGradient: {
    padding: 20,
  },
  trackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  trackIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackIconActive: {
    backgroundColor: '#ffffff',
  },
  trackTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
  },
  trackTitleActive: {
    color: '#92400e',
  },
  trackDescription: {
    fontSize: 14,
    color: '#f3e8ff',
    marginBottom: 12,
    lineHeight: 20,
  },
  trackDescriptionActive: {
    color: '#78350f',
  },
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  trackDuration: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  trackDurationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#e9d5ff',
  },
  trackDurationActive: {
    color: '#92400e',
  },
  trackType: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  trackTypeActive: {
    backgroundColor: '#fef3c7',
  },
  trackTypeText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#f3e8ff',
  },
  trackTypeTextActive: {
    color: '#92400e',
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
