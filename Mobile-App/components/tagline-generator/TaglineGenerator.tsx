import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import TaglineForm from './TaglineForm';
import TaglineResults from './TaglineResults';
import {
  CompanyInfo,
  TaglineResult,
  generateTaglines,
} from '../../services/taglineService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Vintage Theme Colors
const COLORS = {
  primaryBrown: '#4A2E1C',
  copper: '#B87333',
  gold: '#D4A017',
  saffron: '#DD7A1F',
  sand: '#F3E4C8',
  cream: '#FFF8E7',
  darkBrown: '#2D1810',
  warmWhite: '#FFFDF7',
};

// Generation stages for animation
const GENERATION_STAGES = [
  { id: 1, label: 'Analyzing Brand', icon: 'analytics-outline', duration: 1200 },
  { id: 2, label: 'Sanskrit Processing', icon: 'book-outline', duration: 1200 },
  { id: 3, label: 'Cultural Mapping', icon: 'compass-outline', duration: 1200 },
  { id: 4, label: 'Tagline Crafting', icon: 'create-outline', duration: 1200 },
];

type ViewState = 'form' | 'loading' | 'results';

export default function TaglineGenerator() {
  const [viewState, setViewState] = useState<ViewState>('form');
  const [result, setResult] = useState<TaglineResult | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const loadingRotate = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const stageOpacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(headerAnim, {
      toValue: 1,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [headerAnim]);

  // Loading animation
  useEffect(() => {
    if (viewState === 'loading') {
      // Rotate animation
      const rotateAnimation = Animated.loop(
        Animated.timing(loadingRotate, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      );
      rotateAnimation.start();

      // Pulse animation
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();

      // Simulated progress
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + Math.random() * 15;
        });
      }, 500);

      return () => {
        rotateAnimation.stop();
        pulseAnimation.stop();
        clearInterval(progressInterval);
      };
    }
  }, [viewState, loadingRotate, pulseAnim]);

  // Update progress animation
  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: loadingProgress,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [loadingProgress, progressAnim]);

  const handleFormSubmit = async (companyInfo: CompanyInfo) => {
    setViewState('loading');
    setLoadingProgress(0);
    setCurrentStage(0);

    // Start the API call
    const apiPromise = generateTaglines(companyInfo, 5);

    // Progressive stage animation with minimum duration
    const minStageDuration = 1200;
    const totalMinDuration = minStageDuration * 4;
    const startTime = Date.now();

    // Animate through stages
    for (let i = 0; i < GENERATION_STAGES.length; i++) {
      setCurrentStage(i);
      const stageProgress = ((i + 1) / GENERATION_STAGES.length) * 100;
      
      // Fade animation for stage transition
      Animated.sequence([
        Animated.timing(stageOpacityAnim, {
          toValue: 0.3,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(stageOpacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      await new Promise(resolve => setTimeout(resolve, GENERATION_STAGES[i].duration));
      setLoadingProgress(stageProgress);
    }

    // Wait for minimum duration and API
    const elapsedTime = Date.now() - startTime;
    const remainingTime = Math.max(0, totalMinDuration - elapsedTime);
    
    const [generatedResult] = await Promise.all([
      apiPromise,
      new Promise(resolve => setTimeout(resolve, remainingTime)),
    ]);

    setLoadingProgress(100);
    
    // Small delay to show 100%
    setTimeout(() => {
      setResult(generatedResult);
      setViewState('results');
    }, 500);
  };

  const handleReset = () => {
    setResult(null);
    setViewState('form');
    setLoadingProgress(0);
    setCurrentStage(0);
  };

  const spin = loadingRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [0, SCREEN_WIDTH - 80],
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.warmWhite }} edges={['top']}>
      {/* Header with vintage theme */}
      <Animated.View
        style={{
          transform: [{ scale: headerAnim }],
          opacity: headerAnim,
        }}
      >
        <LinearGradient
          colors={[COLORS.primaryBrown, COLORS.darkBrown]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 24,
            borderBottomLeftRadius: 28,
            borderBottomRightRadius: 28,
          }}
        >
          {/* Back Button & Title Row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: 'rgba(255,255,255,0.15)',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
              }}
            >
              <Ionicons name="arrow-back" size={22} color="#ffffff" />
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 22, fontWeight: '800', color: '#ffffff', letterSpacing: 0.3 }}>
                Sanskrit Tagline
              </Text>
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
                AI-Powered Brand Identity
              </Text>
            </View>

            {/* AI Badge with vintage colors */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: `${COLORS.saffron}33`,
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 12,
              }}
            >
              <Ionicons name="sparkles" size={14} color={COLORS.gold} style={{ marginRight: 4 }} />
              <Text style={{ fontSize: 11, color: COLORS.gold, fontWeight: '700' }}>AI</Text>
            </View>
          </View>

          {/* Description with vintage theme */}
          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: 14,
              padding: 14,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                backgroundColor: `${COLORS.saffron}33`,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
              }}
            >
              <Ionicons name="flower-outline" size={24} color={COLORS.gold} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)', lineHeight: 20 }}>
                Transform your brand with a powerful Sanskrit tagline that embodies your vision and values.
              </Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Content */}
      <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 24 }}>
        {viewState === 'form' && (
          <TaglineForm onSubmit={handleFormSubmit} isLoading={false} />
        )}

        {viewState === 'loading' && (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 }}>
            {/* Animated Icon with vintage colors */}
            <Animated.View
              style={{
                transform: [{ rotate: spin }, { scale: pulseAnim }],
                marginBottom: 32,
              }}
            >
              <LinearGradient
                colors={[COLORS.copper, COLORS.gold, COLORS.saffron]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: COLORS.saffron,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.4,
                  shadowRadius: 16,
                  elevation: 8,
                }}
              >
                <Ionicons name="sparkles" size={48} color={COLORS.warmWhite} />
              </LinearGradient>
            </Animated.View>

            {/* Current Stage with animation */}
            <Animated.View style={{ opacity: stageOpacityAnim, marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Ionicons 
                  name={GENERATION_STAGES[currentStage]?.icon as any} 
                  size={20} 
                  color={COLORS.copper} 
                  style={{ marginRight: 8 }} 
                />
                <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.primaryBrown }}>
                  {GENERATION_STAGES[currentStage]?.label}
                </Text>
              </View>
              <Text style={{ fontSize: 14, color: COLORS.darkBrown, textAlign: 'center', opacity: 0.7 }}>
                Processing your brand essence...
              </Text>
            </Animated.View>

            {/* Stage Indicators */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 32 }}>
              {GENERATION_STAGES.map((stage, index) => (
                <View
                  key={stage.id}
                  style={{
                    width: 40,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: index <= currentStage ? COLORS.copper : COLORS.sand,
                  }}
                />
              ))}
            </View>

            {/* Progress Bar with vintage theme */}
            <View
              style={{
                width: SCREEN_WIDTH - 80,
                height: 8,
                backgroundColor: COLORS.sand,
                borderRadius: 4,
                overflow: 'hidden',
                marginBottom: 12,
              }}
            >
              <Animated.View
                style={{
                  height: '100%',
                  width: progressWidth,
                  borderRadius: 4,
                }}
              >
                <LinearGradient
                  colors={[COLORS.copper, COLORS.gold]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ flex: 1, borderRadius: 4 }}
                />
              </Animated.View>
            </View>

            <Text style={{ fontSize: 13, color: COLORS.darkBrown, fontWeight: '600' }}>
              {Math.round(loadingProgress)}%
            </Text>

            {/* Info Card with vintage theme */}
            <View
              style={{
                marginTop: 48,
                backgroundColor: COLORS.cream,
                borderRadius: 16,
                padding: 20,
                width: '100%',
                borderWidth: 1,
                borderColor: COLORS.gold,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <Ionicons name="book-outline" size={18} color={COLORS.copper} style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 13, fontWeight: '700', color: COLORS.copper }}>Sanskrit Wisdom</Text>
              </View>
              <Text style={{ fontSize: 13, color: COLORS.darkBrown, lineHeight: 20 }}>
                Sanskrit is known as "Devavani" (language of the gods) and is considered one of the most scientific languages in the world, perfect for creating meaningful brand identities.
              </Text>
            </View>
          </View>
        )}

        {viewState === 'results' && result && (
          <TaglineResults
            result={result}
            onReset={handleReset}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
