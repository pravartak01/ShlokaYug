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

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  stars: number;
  color: string;
}

interface Progress {
  totalStars: number;
  activitiesCompleted: number;
  totalActivities: number;
  streak: number;
  achievements: Achievement[];
}

const TRANSLATIONS: Record<string, Record<string, string>> = {
  welcome: {
    en: 'Welcome to My Rewards!',
    hi: 'मेरे पुरस्कार में आपका स्वागत है!',
    ta: 'எனது வெகுமதிகளுக்கு வரவேற்கிறோம்!',
    te: 'నా రివార్డ్స్‌కు స్వాగతం!',
    kn: 'ನನ್ನ ಪ್ರತಿಫಲಗಳಿಗೆ ಸ್ವಾಗತ',
    ml: 'എൻ്റെ റിവാർഡുകളിലേക്ക് സ്വാഗതം!',
    bn: 'আমার পুরস্কারে স্বাগতম!',
    gu: 'મારા પુરસ્કારોમાં આપનું સ્વાગત છે!',
  },
  celebration: {
    en: 'You are doing amazing! Keep learning!',
    hi: 'आप शानदार काम कर रहे हैं! सीखते रहें!',
    ta: 'நீங்கள் அருமையாக செய்கிறீர்கள்! தொடர்ந்து கற்றுக்கொள்ளுங்கள்!',
    te: 'మీరు అద్భుతంగా చేస్తున్నారు! నేర్చుకోండి!',
    kn: 'ನೀವು ಅದ್ಭುತವಾಗಿ ಮಾಡುತ್ತಿದ್ದೀರಿ! ಕಲಿಯುತ್ತಿರಿ!',
    ml: 'നിങ്ങൾ മികച്ചതാണ്! പഠിക്കുന്നത് തുടരുക!',
    bn: 'আপনি দুর্দান্ত করছেন! শিখতে থাকুন!',
    gu: 'તમે અદ્ભુત કરી રહ્યા છો! શીખતા રહો!',
  },
  stars: {
    en: 'Total Stars',
    hi: 'कुल तारे',
    ta: 'மொத்த நட்சத்திரங்கள்',
    te: 'మొత్తం నక్షత్రాలు',
    kn: 'ಒಟ್ಟು ನಕ್ಷತ್ರಗಳು',
    ml: 'ആകെ നക്ഷത്രങ്ങൾ',
    bn: 'মোট তারা',
    gu: 'કુલ તારાઓ',
  },
  progress: {
    en: 'Activities Completed',
    hi: 'गतिविधियाँ पूर्ण',
    ta: 'செயல்பாடுகள் முடிந்தது',
    te: 'కార్యాచరణలు పూర్తయ్యాయి',
    kn: 'ಚಟುವಟಿಕೆಗಳು ಪೂರ್ಣಗೊಂಡಿವೆ',
    ml: 'പ്രവർത്തനങ്ങൾ പൂർത്തിയായി',
    bn: 'কার্যক্রম সম্পন্ন',
    gu: 'પ્રવૃત્તિઓ પૂર્ણ થઈ',
  },
  streak: {
    en: 'Day Streak',
    hi: 'दिन की लकीर',
    ta: 'நாள் தொடர்ச்சி',
    te: 'రోజు స్ట్రీక్',
    kn: 'ದಿನದ ಸರಣಿ',
    ml: 'ദിവസ സ്ട്രീക്ക്',
    bn: 'দিন স্ট্রিক',
    gu: 'દિવસ સ્ટ્રીક',
  },
};

export default function MyRewards() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>({
    code: 'en',
    name: 'English',
    icon: 'language',
    speechCode: 'en-US',
  });

  const [progress, setProgress] = useState<Progress>({
    totalStars: 42,
    activitiesCompleted: 5,
    totalActivities: 8,
    streak: 7,
    achievements: [
      {
        id: 1,
        title: 'First Steps',
        description: 'Completed your first activity',
        icon: 'footsteps',
        unlocked: true,
        stars: 5,
        color: '#fbbf24',
      },
      {
        id: 2,
        title: 'Rhythm Master',
        description: 'Completed all Tap the Beat levels',
        icon: 'hand-left',
        unlocked: true,
        stars: 10,
        color: '#3b82f6',
      },
      {
        id: 3,
        title: 'Memory Champion',
        description: 'Completed all Memory Boost challenges',
        icon: 'bulb',
        unlocked: true,
        stars: 10,
        color: '#ec4899',
      },
      {
        id: 4,
        title: 'Syllable Expert',
        description: 'Mastered all 10 syllable levels',
        icon: 'musical-notes',
        unlocked: false,
        stars: 15,
        color: '#f59e0b',
      },
      {
        id: 5,
        title: 'Om Seeker',
        description: 'Listened to all mantras',
        icon: 'flower',
        unlocked: true,
        stars: 8,
        color: '#8b5cf6',
      },
      {
        id: 6,
        title: 'Visual Learner',
        description: 'Completed all Visual Beats patterns',
        icon: 'eye',
        unlocked: false,
        stars: 12,
        color: '#06b6d4',
      },
      {
        id: 7,
        title: 'Patient Student',
        description: 'Finished all Slow Mode verses',
        icon: 'time',
        unlocked: false,
        stars: 10,
        color: '#10b981',
      },
      {
        id: 8,
        title: 'Peace Keeper',
        description: 'Used Calm Sounds for 30 minutes',
        icon: 'headset',
        unlocked: false,
        stars: 7,
        color: '#a855f7',
      },
      {
        id: 9,
        title: 'Week Warrior',
        description: 'Maintained a 7-day learning streak',
        icon: 'flame',
        unlocked: true,
        stars: 20,
        color: '#ef4444',
      },
      {
        id: 10,
        title: 'Sanskrit Star',
        description: 'Earned 100 total stars',
        icon: 'star',
        unlocked: false,
        stars: 25,
        color: '#fbbf24',
      },
    ],
  });

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
      const celebration = TRANSLATIONS.celebration[selectedLanguage.code] || TRANSLATIONS.celebration.en;
      speakText(celebration);
    }, 2000);
  };

  const speakText = (text: string) => {
    Speech.speak(text, {
      language: selectedLanguage.speechCode,
      pitch: 1.2,
      rate: 0.6,
    });
  };

  const progressPercentage = (progress.activitiesCompleted / progress.totalActivities) * 100;
  const unlockedAchievements = progress.achievements.filter(a => a.unlocked).length;

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#f59e0b', '#d97706']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={28} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Rewards</Text>
          <View style={styles.headerIcon}>
            <Ionicons name="trophy" size={28} color="#ffffff" />
          </View>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Stats Cards */}
          <View style={styles.statsGrid}>
            {/* Total Stars */}
            <Animatable.View animation="fadeInLeft" duration={600}>
              <LinearGradient
                colors={['#fbbf24', '#f59e0b']}
                style={styles.statCard}
              >
                <Ionicons name="star" size={40} color="#ffffff" />
                <Text style={styles.statNumber}>{progress.totalStars}</Text>
                <Text style={styles.statLabel}>
                  {TRANSLATIONS.stars[selectedLanguage.code] || TRANSLATIONS.stars.en}
                </Text>
              </LinearGradient>
            </Animatable.View>

            {/* Streak */}
            <Animatable.View animation="fadeInRight" duration={600}>
              <LinearGradient
                colors={['#ef4444', '#dc2626']}
                style={styles.statCard}
              >
                <Ionicons name="flame" size={40} color="#ffffff" />
                <Text style={styles.statNumber}>{progress.streak}</Text>
                <Text style={styles.statLabel}>
                  {TRANSLATIONS.streak[selectedLanguage.code] || TRANSLATIONS.streak.en}
                </Text>
              </LinearGradient>
            </Animatable.View>
          </View>

          {/* Progress Card */}
          <Animatable.View animation="fadeInUp" delay={200} duration={800}>
            <View style={styles.progressCard}>
              <Text style={styles.progressTitle}>
                {TRANSLATIONS.progress[selectedLanguage.code] || TRANSLATIONS.progress.en}
              </Text>
              <Text style={styles.progressText}>
                {progress.activitiesCompleted} / {progress.totalActivities}
              </Text>
              
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBg}>
                  <Animatable.View 
                    animation="slideInLeft" 
                    duration={1000}
                    style={[styles.progressBarFill, { width: `${progressPercentage}%` }]}
                  />
                </View>
              </View>

              <Text style={styles.progressPercentage}>{Math.round(progressPercentage)}% Complete</Text>
            </View>
          </Animatable.View>

          {/* Achievements */}
          <Text style={styles.sectionTitle}>Achievements</Text>
          <Text style={styles.sectionSubtitle}>
            {unlockedAchievements} of {progress.achievements.length} unlocked
          </Text>

          <View style={styles.achievementsGrid}>
            {progress.achievements.map((achievement, index) => (
              <Animatable.View
                key={achievement.id}
                animation="fadeInUp"
                delay={index * 80}
                duration={600}
              >
                <TouchableOpacity
                  style={[
                    styles.achievementCard,
                    !achievement.unlocked && styles.achievementLocked,
                  ]}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={
                      achievement.unlocked
                        ? [achievement.color + 'dd', achievement.color]
                        : ['#9ca3af', '#6b7280']
                    }
                    style={styles.achievementGradient}
                  >
                    <View style={styles.achievementHeader}>
                      <View style={[
                        styles.achievementIconContainer,
                        !achievement.unlocked && styles.achievementIconLocked,
                      ]}>
                        <Ionicons 
                          name={achievement.icon as any} 
                          size={32} 
                          color="#ffffff" 
                        />
                      </View>
                      
                      <View style={styles.starsContainer}>
                        <Ionicons name="star" size={16} color="#fbbf24" />
                        <Text style={styles.achievementStars}>{achievement.stars}</Text>
                      </View>
                    </View>

                    <Text style={styles.achievementTitle}>{achievement.title}</Text>
                    <Text style={styles.achievementDescription}>{achievement.description}</Text>

                    {achievement.unlocked ? (
                      <View style={styles.unlockedBadge}>
                        <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                        <Text style={styles.unlockedText}>Unlocked</Text>
                      </View>
                    ) : (
                      <View style={styles.lockedBadge}>
                        <Ionicons name="lock-closed" size={16} color="#9ca3af" />
                        <Text style={styles.lockedText}>Locked</Text>
                      </View>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </Animatable.View>
            ))}
          </View>

          {/* Motivational Message */}
          <Animatable.View 
            animation="pulse" 
            iterationCount="infinite"
            duration={2000}
            style={styles.motivationCard}
          >
            <Ionicons name="happy" size={32} color="#fbbf24" />
            <Text style={styles.motivationText}>
              Keep going! You're becoming a Sanskrit expert!
            </Text>
          </Animatable.View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f59e0b',
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
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  statNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#ffffff',
    marginTop: 4,
    textAlign: 'center',
  },
  progressCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d97706',
    marginBottom: 8,
  },
  progressText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f59e0b',
    marginBottom: 16,
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressBarBg: {
    height: 12,
    backgroundColor: '#fef3c7',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#f59e0b',
    borderRadius: 6,
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#fef3c7',
    marginBottom: 20,
  },
  achievementsGrid: {
    gap: 16,
  },
  achievementCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  achievementLocked: {
    opacity: 0.7,
  },
  achievementGradient: {
    padding: 20,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  achievementIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementIconLocked: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  achievementStars: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400e',
  },
  achievementTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
  },
  achievementDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 12,
    lineHeight: 20,
  },
  unlockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 6,
  },
  unlockedText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#10b981',
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 6,
  },
  lockedText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  motivationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 20,
    borderRadius: 20,
    marginTop: 24,
    gap: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  motivationText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    lineHeight: 22,
  },
});
