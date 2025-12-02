import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  Animated, 
  Dimensions,
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface TimeBasedContent {
  greeting: string;
  friendlyMessage: string;
  shloka: string;
  shlokaTranslation: string;
  source: string;
  icon: keyof typeof Ionicons.glyphMap;
  accentColor: string;
  bgGradient: string;
}

// Time-based motivational content
const getTimeBasedContent = (): TimeBasedContent => {
  const hour = new Date().getHours();
  const randomIndex = Math.floor(Math.random() * 3);
  
  // Early Morning (4-7)
  if (hour >= 4 && hour < 7) {
    const content = [
      {
        greeting: 'Early Bird!',
        friendlyMessage: "You're up before the sun! That's the spirit of a true learner. Let's make today amazing together!",
        shloka: 'ब्रह्म मुहूर्ते उत्तिष्ठेत्',
        shlokaTranslation: 'One should wake up during Brahma Muhurta (the divine hour before sunrise)',
        source: 'Ashtanga Hridayam',
      },
      {
        greeting: 'Divine Morning!',
        friendlyMessage: "The world is still sleeping, but you chose growth. I'm proud of you! Let's begin with wisdom.",
        shloka: 'उद्यमेन हि सिध्यन्ति कार्याणि न मनोरथैः',
        shlokaTranslation: 'Success comes through effort, not just by wishful thinking',
        source: 'Hitopadesha',
      },
      {
        greeting: 'Sacred Hour!',
        friendlyMessage: "This is the most powerful time for learning. Your dedication inspires me! Ready for some wisdom?",
        shloka: 'योगस्थः कुरु कर्माणि',
        shlokaTranslation: 'Perform your actions being steadfast in yoga',
        source: 'Bhagavad Gita 2.48',
      },
    ];
    return { ...content[randomIndex], icon: 'sparkles', accentColor: '#8b5cf6', bgGradient: '#ede9fe' };
  }
  
  // Morning (7-12)
  if (hour >= 7 && hour < 12) {
    const content = [
      {
        greeting: 'Good Morning, Champion!',
        friendlyMessage: "A fresh day, a fresh start! Your morning practice sets the tone for everything. Let's make it count!",
        shloka: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन',
        shlokaTranslation: 'You have the right to work only, but never to its fruits',
        source: 'Bhagavad Gita 2.47',
      },
      {
        greeting: 'Rise & Conquer!',
        friendlyMessage: "The sun is up and so are you! That's my favorite human right there. Let's learn something beautiful today!",
        shloka: 'विद्या ददाति विनयं',
        shlokaTranslation: 'Knowledge gives humility',
        source: 'Hitopadesha',
      },
      {
        greeting: 'Morning Warrior!',
        friendlyMessage: "Every morning is a chance to rewrite your story. I believe in you! Here's some ancient wisdom to fuel your day.",
        shloka: 'सत्यं वद धर्मं चर',
        shlokaTranslation: 'Speak the truth, follow righteousness',
        source: 'Taittiriya Upanishad',
      },
    ];
    return { ...content[randomIndex], icon: 'sunny', accentColor: '#f59e0b', bgGradient: '#fef3c7' };
  }
  
  // Afternoon (12-17)
  if (hour >= 12 && hour < 17) {
    const content = [
      {
        greeting: 'Afternoon Check-in!',
        friendlyMessage: "Hey! Taking a break to learn? That's what winners do. Let me share something that'll boost your energy!",
        shloka: 'नायमात्मा बलहीनेन लभ्यः',
        shlokaTranslation: 'This Self cannot be attained by the weak',
        source: 'Mundaka Upanishad',
      },
      {
        greeting: 'Midday Motivation!',
        friendlyMessage: "Halfway through the day and you're still going strong! I knew you had it in you. Here's a powerful verse!",
        shloka: 'श्रद्धावान् लभते ज्ञानम्',
        shlokaTranslation: 'One who has faith attains knowledge',
        source: 'Bhagavad Gita 4.39',
      },
      {
        greeting: 'Power Hour!',
        friendlyMessage: "This is the time when most people give up, but not you! You're different. Let's fuel that fire!",
        shloka: 'उत्तिष्ठत जाग्रत प्राप्य वरान्निबोधत',
        shlokaTranslation: 'Arise! Awake! And stop not till the goal is reached',
        source: 'Katha Upanishad',
      },
    ];
    return { ...content[randomIndex], icon: 'flame', accentColor: '#f97316', bgGradient: '#ffedd5' };
  }
  
  // Evening (17-20)
  if (hour >= 17 && hour < 20) {
    const content = [
      {
        greeting: 'Evening Wisdom!',
        friendlyMessage: "The day is winding down, but your spirit isn't! Taking time to learn in the evening? You're amazing!",
        shloka: 'शान्ति: शान्ति: शान्ति:',
        shlokaTranslation: 'Peace, Peace, Peace - may there be peace in all realms',
        source: 'Upanishadic Prayer',
      },
      {
        greeting: 'Sunset Seeker!',
        friendlyMessage: "As the sun sets, your wisdom rises. I love that about you! Here's a calming verse to reflect upon.",
        shloka: 'यो मां पश्यति सर्वत्र',
        shlokaTranslation: 'One who sees Me everywhere',
        source: 'Bhagavad Gita 6.30',
      },
      {
        greeting: 'Golden Hour!',
        friendlyMessage: "The evening light is magical, just like your commitment to learning. Let's end this day with grace!",
        shloka: 'तमसो मा ज्योतिर्गमय',
        shlokaTranslation: 'Lead me from darkness to light',
        source: 'Brihadaranyaka Upanishad',
      },
    ];
    return { ...content[randomIndex], icon: 'moon', accentColor: '#8b5cf6', bgGradient: '#ede9fe' };
  }
  
  // Night (20-4)
  const content = [
    {
      greeting: 'Night Owl!',
      friendlyMessage: "Learning at night? The universe rewards the dedicated! Here's some peaceful wisdom before you rest.",
      shloka: 'ॐ सर्वे भवन्तु सुखिनः',
      shlokaTranslation: 'May all beings be happy',
      source: 'Shanti Mantra',
    },
    {
      greeting: 'Starlight Scholar!',
      friendlyMessage: "While the world sleeps, you seek wisdom. That's truly special! Let me share something beautiful with you.",
      shloka: 'निद्रायाः पूर्वमुत्थाय',
      shlokaTranslation: 'Rising before the end of sleep brings clarity',
      source: 'Charaka Samhita',
    },
    {
      greeting: 'Peaceful Night!',
      friendlyMessage: "The night is for reflection and rest. You've done well today! Carry this blessing into your dreams.",
      shloka: 'स्वस्ति प्रजाभ्यः परिपालयन्ताम्',
      shlokaTranslation: 'May there be well-being for all people',
      source: 'Vedic Prayer',
    },
  ];
  return { ...content[randomIndex], icon: 'star', accentColor: '#855332', bgGradient: '#F5EDE8' };
};

interface WelcomePopupProps {
  userName?: string;
}

export default function WelcomePopup({ userName = 'Friend' }: WelcomePopupProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [content, setContent] = useState<TimeBasedContent | null>(null);
  
  // Animation refs
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const iconRotate = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const checkAndShowPopup = async () => {
    try {
      const lastShown = await AsyncStorage.getItem('welcomePopupLastShown');
      const now = Date.now();
      const fourHours = 4 * 60 * 60 * 1000; // Show every 4 hours max
      
      if (!lastShown || (now - parseInt(lastShown)) > fourHours) {
        // Set content and show popup
        setContent(getTimeBasedContent());
        setIsVisible(true);
        await AsyncStorage.setItem('welcomePopupLastShown', now.toString());
        
        // Animate in
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            tension: 50,
            friction: 8,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.spring(slideAnim, {
            toValue: 0,
            tension: 50,
            friction: 8,
            useNativeDriver: true,
          }),
        ]).start();

        // Icon animation
        Animated.loop(
          Animated.sequence([
            Animated.timing(iconRotate, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(iconRotate, {
              toValue: 0,
              duration: 2000,
              useNativeDriver: true,
            }),
          ])
        ).start();

        // Pulse animation for CTA
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.05,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }
    } catch (error) {
      console.log('Error checking popup status:', error);
    }
  };

  useEffect(() => {
    checkAndShowPopup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
    });
  };

  const iconSpin = iconRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!isVisible || !content) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
        <Animated.View
          style={{
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }, { translateY: slideAnim }],
            width: SCREEN_WIDTH - 48,
            maxHeight: SCREEN_HEIGHT * 0.75,
          }}
        >
          <View 
            className="bg-white rounded-3xl overflow-hidden"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.25,
              shadowRadius: 20,
              elevation: 15,
            }}
          >
            {/* Close Button */}
            <TouchableOpacity
              onPress={handleClose}
              className="absolute top-4 right-4 z-10 w-9 h-9 bg-white/90 rounded-full items-center justify-center"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Ionicons name="close" size={20} color="#6b7280" />
            </TouchableOpacity>

            {/* Header Section */}
            <View 
              className="pt-8 pb-6 px-6 items-center"
              style={{ backgroundColor: content.bgGradient }}
            >
              {/* Animated Icon */}
              <Animated.View
                className="w-20 h-20 rounded-full items-center justify-center mb-4"
                style={{
                  backgroundColor: content.accentColor,
                  transform: [{ rotate: iconSpin }],
                  shadowColor: content.accentColor,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 6,
                }}
              >
                <Ionicons name={content.icon} size={36} color="#ffffff" />
              </Animated.View>
              
              {/* Greeting */}
              <Text 
                className="text-2xl font-bold text-center mb-2"
                style={{ color: content.accentColor }}
              >
                {content.greeting}
              </Text>
              
              {/* Friendly Message */}
              <Text className="text-gray-600 text-center text-sm leading-5 px-2">
                {content.friendlyMessage.replace('human', userName)}
              </Text>
            </View>

            {/* Shloka Section */}
            <View className="px-6 py-5">
              {/* Shloka Card */}
              <View 
                className="bg-gray-50 rounded-2xl p-4 mb-4 border border-gray-100"
              >
                <View className="flex-row items-center mb-3">
                  <View 
                    className="w-6 h-6 rounded-md items-center justify-center mr-2"
                    style={{ backgroundColor: content.bgGradient }}
                  >
                    <Ionicons name="book" size={12} color={content.accentColor} />
                  </View>
                  <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Today&apos;s Blessing
                  </Text>
                </View>
                
                {/* Sanskrit Text */}
                <Text 
                  className="text-gray-800 text-lg font-semibold text-center leading-7 mb-3"
                  style={{ fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif' }}
                >
                  {content.shloka}
                </Text>
                
                {/* Translation */}
                <Text className="text-gray-600 text-sm text-center leading-5 italic">
                  &ldquo;{content.shlokaTranslation}&rdquo;
                </Text>
                
                {/* Source */}
                <Text 
                  className="text-xs text-center mt-2 font-medium"
                  style={{ color: content.accentColor }}
                >
                  — {content.source}
                </Text>
              </View>

              {/* Action Button */}
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <TouchableOpacity
                  onPress={handleClose}
                  className="py-4 rounded-2xl items-center"
                  style={{ 
                    backgroundColor: content.accentColor,
                    shadowColor: content.accentColor,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 5,
                  }}
                  activeOpacity={0.8}
                >
                  <View className="flex-row items-center">
                    <Ionicons name="sparkles" size={18} color="#ffffff" />
                    <Text className="text-white font-bold text-base ml-2">
                      Let&apos;s Begin!
                    </Text>
                  </View>
                </TouchableOpacity>
              </Animated.View>

              {/* Motivational footer */}
              <Text className="text-gray-400 text-xs text-center mt-4">
                Every verse brings you closer to wisdom ✨
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
