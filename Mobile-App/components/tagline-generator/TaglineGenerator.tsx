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

type ViewState = 'form' | 'loading' | 'results';

export default function TaglineGenerator() {
  const [viewState, setViewState] = useState<ViewState>('form');
  const [result, setResult] = useState<TaglineResult | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Animations
  const headerAnim = useRef(new Animated.Value(0)).current;
  const loadingRotate = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

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

    try {
      const generatedResult = await generateTaglines(companyInfo, 5);
      setLoadingProgress(100);
      
      // Small delay to show 100%
      setTimeout(() => {
        setResult(generatedResult);
        setViewState('results');
      }, 500);
    } catch (error) {
      console.error('Error generating taglines:', error);
      setViewState('form');
    }
  };

  const handleReset = () => {
    setResult(null);
    setViewState('form');
    setLoadingProgress(0);
  };

  const spin = loadingRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: [0, SCREEN_WIDTH - 80],
  });

  const loadingMessages = [
    'Consulting ancient Sanskrit texts...',
    'Channeling vedic wisdom...',
    'Crafting your perfect tagline...',
    'Infusing meaning with tradition...',
    'Almost there...',
  ];

  const currentMessage = loadingMessages[Math.min(Math.floor(loadingProgress / 25), loadingMessages.length - 1)];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fafafa' }} edges={['top']}>
      {/* Header */}
      <Animated.View
        style={{
          transform: [{ scale: headerAnim }],
          opacity: headerAnim,
        }}
      >
        <LinearGradient
          colors={['#1f2937', '#374151']}
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

            {/* AI Badge */}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: 'rgba(249,115,22,0.2)',
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 12,
              }}
            >
              <Ionicons name="sparkles" size={14} color="#fb923c" style={{ marginRight: 4 }} />
              <Text style={{ fontSize: 11, color: '#fb923c', fontWeight: '700' }}>AI</Text>
            </View>
          </View>

          {/* Description */}
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
                backgroundColor: 'rgba(249,115,22,0.2)',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
              }}
            >
              <Text style={{ fontSize: 24 }}>🕉️</Text>
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
            {/* Animated Icon */}
            <Animated.View
              style={{
                transform: [{ rotate: spin }, { scale: pulseAnim }],
                marginBottom: 32,
              }}
            >
              <LinearGradient
                colors={['#ea580c', '#f97316', '#fb923c']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: '#ea580c',
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.4,
                  shadowRadius: 16,
                  elevation: 8,
                }}
              >
                <Text style={{ fontSize: 44 }}>✨</Text>
              </LinearGradient>
            </Animated.View>

            {/* Loading Text */}
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#1f2937', marginBottom: 8, textAlign: 'center' }}>
              {currentMessage}
            </Text>
            <Text style={{ fontSize: 14, color: '#9ca3af', marginBottom: 32, textAlign: 'center' }}>
              This may take a few moments
            </Text>

            {/* Progress Bar */}
            <View
              style={{
                width: SCREEN_WIDTH - 80,
                height: 8,
                backgroundColor: '#e5e7eb',
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
                  colors={['#ea580c', '#f97316']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ flex: 1, borderRadius: 4 }}
                />
              </Animated.View>
            </View>

            <Text style={{ fontSize: 13, color: '#6b7280', fontWeight: '600' }}>
              {Math.round(loadingProgress)}%
            </Text>

            {/* Fun Facts */}
            <View
              style={{
                marginTop: 48,
                backgroundColor: '#fff7ed',
                borderRadius: 16,
                padding: 20,
                width: '100%',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                <Ionicons name="book-outline" size={18} color="#ea580c" style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#ea580c' }}>Did You Know?</Text>
              </View>
              <Text style={{ fontSize: 13, color: '#92400e', lineHeight: 20 }}>
                Sanskrit is known as &ldquo;Devavani&rdquo; (language of the gods) and is considered one of the most scientific languages in the world, perfect for creating meaningful brand identities.
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
