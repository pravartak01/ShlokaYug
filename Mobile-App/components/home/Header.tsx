import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { getHinduDate, getDailySanskritQuote, getFormattedDate, fetchPanchangData, PanchangData } from './utils';
import { useAuth } from '../../context/AuthContext';
import { SideDrawer, LanguageSelector } from '../common';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  children?: React.ReactNode;
}

export default function Header({ children }: HeaderProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { t } = useTranslation();
  const [panchangData, setPanchangData] = useState<PanchangData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isLanguageSelectorVisible, setIsLanguageSelectorVisible] = useState(false);
  const [quoteExpanded, setQuoteExpanded] = useState(false);
  const hinduDate = getHinduDate();
  const dailyQuote = getDailySanskritQuote();
  const formattedDate = getFormattedDate();
  
  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-30)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const quoteSlide = useRef(new Animated.Value(30)).current;
  const quoteFade = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  // Get Sanskrit greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    const dayOfWeek = new Date().getDay();
    const random = Math.floor(Date.now() / 86400000) % 10; // Changes daily
    
    // Morning greetings (before 12) - प्रातःकाल (Prātaḥkāla)
    const morningGreetings = [
      'सुप्रभातम्', // Suprabhatam - Good Morning
      'प्रभाते नमः', // Prabhate Namah - Salutations to the Morning
      'उषसः स्वागतम्', // Ushasah Swagatam - Welcome to Dawn
      'प्रातः शुभम्', // Pratah Shubham - Auspicious Morning
      'नूतन दिवसः', // Nutan Divasah - New Day
    ];
    
    // Afternoon greetings (12-17) - मध्याह्न (Madhyāhna)
    const afternoonGreetings = [
      'मध्याह्न नमः', // Madhyahna Namah - Afternoon Salutations
      'दिवा शुभम्', // Diva Shubham - Blessed Day
      'मध्याह्न स्वागतम्', // Madhyahna Swagatam - Welcome Afternoon
      'दिवसस्य मध्ये', // Divasasya Madhye - Midst of Day
      'सूर्य तेजः', // Surya Tejah - Solar Radiance
    ];
    
    // Evening greetings (17-20) - सायंकाल (Sāyaṅkāla)
    const eveningGreetings = [
      'शुभ सायंकाल', // Shubha Sayamkala - Good Evening
      'सायं शुभम्', // Sayam Shubham - Auspicious Evening
      'सन्ध्या नमः', // Sandhya Namah - Salutations to Twilight
      'सायंकाल स्वागतम्', // Sayamkala Swagatam - Welcome Evening
      'दिवसान्तः', // Divasantah - Day's End
    ];
    
    // Night greetings (after 20) - रात्रि (Rātri)
    const nightGreetings = [
      'शुभ रात्रिः', // Shubha Ratri - Good Night
      'रात्रि शान्तिः', // Ratri Shantih - Peaceful Night
      'निशा नमः', // Nisha Namah - Salutations to Night
      'रात्रि स्वागतम्', // Ratri Swagatam - Welcome Night
      'चन्द्र दर्शनम्', // Chandra Darshanam - Moon Viewing
    ];
    
    // Weekend special - शनि/रवि वार (Shani/Ravi Vara)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      const weekendGreetings = [
        'विश्राम दिवसः', // Vishrama Divasah - Day of Rest
        'पवित्र दिनम्', // Pavitra Dinam - Sacred Day
        'रवि वारः', // Ravi Varah - Sunday
        'शनि वारः', // Shani Varah - Saturday
      ];
      return weekendGreetings[random % weekendGreetings.length];
    }
    
    if (hour < 12) return morningGreetings[random % morningGreetings.length];
    if (hour < 17) return afternoonGreetings[random % afternoonGreetings.length];
    if (hour < 20) return eveningGreetings[random % eveningGreetings.length];
    return nightGreetings[random % nightGreetings.length];
  };

  // Get greeting icon based on time
  const getGreetingIcon = (): keyof typeof Ionicons.glyphMap => {
    const hour = new Date().getHours();
    if (hour < 12) return 'sunny';
    if (hour < 17) return 'partly-sunny';
    if (hour < 20) return 'moon';
    return 'cloudy-night';
  };

  // Get time-based accent color - Using brighter Gold/Saffron/Copper palette
  const getTimeAccent = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { primary: '#D4A017', secondary: '#FDF8E8', text: '#8B6914' }; // Gold for morning
    if (hour < 17) return { primary: '#DD7A1F', secondary: '#FEF3E8', text: '#A85C15' }; // Saffron for afternoon
    if (hour < 20) return { primary: '#B87333', secondary: '#F9F0E6', text: '#8A5626' }; // Copper for evening
    return { primary: '#4A2E1C', secondary: '#F3E4C8', text: '#3D2617' }; // Deep brown for night
  };

  const timeAccent = getTimeAccent();

  useEffect(() => {
    // Staggered entrance animation
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 40,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(quoteFade, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(quoteSlide, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Subtle pulse animation for notification badge
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    // Shimmer effect
    const shimmer = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    );
    shimmer.start();

    const loadPanchangData = async () => {
      setLoading(true);
      const data = await fetchPanchangData();
      setPanchangData(data);
      setLoading(false);
    };

    loadPanchangData();

    return () => {
      pulse.stop();
      shimmer.stop();
    };
  }, [fadeAnim, slideAnim, scaleAnim, quoteFade, quoteSlide, pulseAnim, shimmerAnim]);

  return (
    <>
      {/* Side Drawer */}
      <SideDrawer
        isVisible={isDrawerVisible}
        onClose={() => setIsDrawerVisible(false)}
      />

      {/* Language Selector Modal */}
      <LanguageSelector
        visible={isLanguageSelectorVisible}
        onClose={() => setIsLanguageSelectorVisible(false)}
      />

      <View className="bg-white px-5 pt-3 pb-4">
        {/* Top Row - User Info & Actions */}
        <Animated.View 
          className="flex-row items-center justify-between mb-4"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
          }}
        >
          {/* Menu & User Info */}
          <View className="flex-row items-center flex-1">
            <TouchableOpacity 
              className="w-12 h-12 bg-gray-50 rounded-2xl items-center justify-center mr-3"
              onPress={() => setIsDrawerVisible(true)}
              activeOpacity={0.7}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Ionicons name="menu" size={24} color="#374151" />
            </TouchableOpacity>
            
            <View className="flex-1">
              <View className="flex-row items-center mb-0.5">
                <Ionicons name={getGreetingIcon()} size={16} color={timeAccent.primary} />
                <Text className="text-gray-500 text-sm ml-1.5 font-poppins-medium">{getGreeting()}</Text>
              </View>
              <Text className="text-gray-900 text-xl font-playfair-bold tracking-tight">
                {user?.profile?.firstName || user?.username || t('header.guest')}
              </Text>
            </View>
          </View>
          
          {/* Action Buttons */}
          <View className="flex-row items-center gap-3">
            <TouchableOpacity 
              className="w-12 h-12 bg-gray-50 rounded-2xl items-center justify-center"
              onPress={() => setIsLanguageSelectorVisible(true)}
              activeOpacity={0.7}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <Ionicons name="language" size={24} color="#374151" />
            </TouchableOpacity>
            <TouchableOpacity 
              className="w-12 h-12 bg-gray-50 rounded-2xl items-center justify-center"
              activeOpacity={0.7}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 4,
                elevation: 2,
              }}
            >
              <View className="relative">
                <Ionicons name="notifications" size={24} color="#374151" />
                <Animated.View 
                  className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"
                  style={{ transform: [{ scale: pulseAnim }] }}
                />
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              className="w-12 h-12 rounded-2xl items-center justify-center overflow-hidden"
              onPress={() => router.push('/profile')}
              activeOpacity={0.7}
              style={{
                backgroundColor: timeAccent.secondary,
                shadowColor: timeAccent.primary,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Ionicons name="person" size={22} color={timeAccent.primary} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Compact Date & Panchang Row */}
        <Animated.View 
          className="flex-row items-center justify-between mb-4 bg-gray-50 rounded-2xl px-4 py-3"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <View className="flex-row items-center flex-1">
            <View 
              className="w-9 h-9 rounded-xl items-center justify-center mr-3"
              style={{ backgroundColor: timeAccent.secondary }}
            >
              <Ionicons name="calendar" size={18} color={timeAccent.primary} />
            </View>
            <View className="flex-1">
              <Text className="text-gray-800 text-sm font-poppins-semibold">{formattedDate}</Text>
              <Text className="text-gray-500 text-xs mt-0.5 font-poppins">
                {loading ? t('header.loading') : (panchangData?.tithi || hinduDate.tithi)}
              </Text>
            </View>
          </View>
          
          {/* Panchang badge */}
          <View className="bg-white rounded-xl px-3 py-1.5 border border-gray-100">
            {loading ? (
              <ActivityIndicator size="small" color={timeAccent.primary} />
            ) : (
              <Text className="text-xs font-poppins-semibold" style={{ color: timeAccent.primary }}>
                {panchangData?.nakshatra || hinduDate.paksha}
              </Text>
            )}
          </View>
        </Animated.View>

        {/* Daily Quote Card - Modern Glassmorphism Style */}
        <Animated.View 
          style={{
            opacity: quoteFade,
            transform: [{ translateY: quoteSlide }],
          }}
        >
          <TouchableOpacity 
            activeOpacity={0.9}
            onPress={() => setQuoteExpanded(!quoteExpanded)}
          >
            <View 
              className="rounded-3xl overflow-hidden"
              style={{
                backgroundColor: '#FFFCF5',
                borderWidth: 1,
                borderColor: '#E8D9CF',
                shadowColor: '#4A2E1C',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
              }}
            >
              {/* Decorative top accent */}
              <View 
                className="h-1 w-full"
                style={{ 
                  backgroundColor: timeAccent.primary,
                }}
              />
              
              <View className="p-4">
                {/* Header Row */}
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center">
                    <View 
                      className="w-8 h-8 rounded-lg items-center justify-center mr-2"
                      style={{ backgroundColor: timeAccent.secondary }}
                    >
                      <Ionicons name="book" size={16} color={timeAccent.primary} />
                    </View>
                    <View>
                      <Text className="text-gray-900 text-xs font-poppins-bold uppercase tracking-wider">
                        {t('header.quoteOfTheDay')}
                      </Text>
                      <Text className="text-gray-400 text-[10px] font-poppins-medium">
                        {dailyQuote.source}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row items-center">
                    <Ionicons 
                      name={quoteExpanded ? 'chevron-up' : 'chevron-down'} 
                      size={16} 
                      color="#9ca3af" 
                    />
                  </View>
                </View>
                
                {/* Sanskrit Text */}
                <View className="bg-white rounded-xl p-3 mb-3 border border-gray-100">
                  <Text className="text-gray-800 text-base font-sanskrit-medium leading-6 text-center">
                    {dailyQuote.sanskrit}
                  </Text>
                </View>
                
                {/* Translation/Meaning */}
                <Text 
                  className="text-gray-600 text-sm leading-5 font-poppins"
                  numberOfLines={quoteExpanded ? undefined : 2}
                >
                  {dailyQuote.translation}
                </Text>
                
                {/* Expanded meaning section */}
                {quoteExpanded && dailyQuote.meaning && dailyQuote.meaning !== dailyQuote.translation && (
                  <View className="mt-3 pt-3 border-t border-gray-100">
                    <Text className="text-xs font-poppins-semibold text-gray-500 uppercase tracking-wider mb-2">
                      {t('header.deeperMeaning')}
                    </Text>
                    <Text className="text-gray-600 text-sm leading-5 font-poppins">
                      {dailyQuote.meaning}
                    </Text>
                  </View>
                )}
                
                {/* Action row */}
                <View className="flex-row items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <TouchableOpacity className="flex-row items-center">
                    <Ionicons name="heart-outline" size={16} color="#9ca3af" />
                    <Text className="text-gray-400 text-xs ml-1 font-poppins-medium">{t('header.save')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity className="flex-row items-center">
                    <Ionicons name="share-social-outline" size={16} color="#9ca3af" />
                    <Text className="text-gray-400 text-xs ml-1 font-poppins-medium">{t('header.share')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    className="flex-row items-center px-3 py-1.5 rounded-lg"
                    style={{ backgroundColor: timeAccent.secondary }}
                  >
                    <Ionicons name="play" size={12} color={timeAccent.primary} />
                    <Text className="text-xs ml-1 font-poppins-semibold" style={{ color: timeAccent.primary }}>
                      {t('header.listen')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>

        {children}
      </View>
    </>
  );
}
