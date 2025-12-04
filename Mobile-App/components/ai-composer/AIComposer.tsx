import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import axios from 'axios';
import { GeneratedShloka } from '../../services/aiComposerService';
import GeneratedShlokaCard from './GeneratedShlokaCard';

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
  deepMaroon: '#5D1A0B',
};

// API Configuration - Matches your backend (SvaramAI on port 8000)
const LOCAL_IP = '10.245.97.46'; // Update this to match your machine's IP
const getDevIP = () => LOCAL_IP;

// SvaramAI Backend URL (Port 8000) - For shloka generation
const API_BASE_URL = __DEV__
  ? `http://${getDevIP()}:8000`  // Development - SvaramAI runs on port 8000
  : 'https://ai.shlokayug.com'; // Production

type MoodType = 'devotional' | 'peaceful' | 'philosophical' | 'heroic' | 'romantic';
type StyleType = 'vedic' | 'classical' | 'modern' | 'puranic';

// Mood options with icons instead of emojis
const MOODS: { id: MoodType; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'peaceful', label: 'Peaceful', icon: 'leaf-outline' },
  { id: 'devotional', label: 'Devotional', icon: 'heart-outline' },
  { id: 'philosophical', label: 'Philosophical', icon: 'bulb-outline' },
  { id: 'heroic', label: 'Heroic', icon: 'shield-outline' },
  { id: 'romantic', label: 'Romantic', icon: 'flower-outline' },
];

// Style options - matching backend enum
const STYLES: { id: StyleType; label: string; desc: string }[] = [
  { id: 'classical', label: 'Classical', desc: 'Traditional Sanskrit style' },
  { id: 'vedic', label: 'Vedic', desc: 'Ancient Vedic style' },
  { id: 'puranic', label: 'Puranic', desc: 'Epic narrative style' },
  { id: 'modern', label: 'Modern', desc: 'Contemporary Sanskrit' },
];

// Deity/Theme presets with icons instead of emojis
const PRESETS: { id: string; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: 'ganesha', label: 'Ganesha', icon: 'flower-outline' },
  { id: 'krishna', label: 'Krishna', icon: 'musical-note-outline' },
  { id: 'shiva', label: 'Shiva', icon: 'water-outline' },
  { id: 'saraswati', label: 'Saraswati', icon: 'book-outline' },
  { id: 'nature', label: 'Nature', icon: 'leaf-outline' },
  { id: 'wisdom', label: 'Wisdom', icon: 'school-outline' },
];

// Generation stages for animation
const GENERATION_STAGES = [
  { id: 1, label: 'Invoking Muse', description: 'Gathering divine inspiration...', icon: 'sparkles' as keyof typeof Ionicons.glyphMap },
  { id: 2, label: 'Weaving Words', description: 'Composing Sanskrit verses...', icon: 'pencil' as keyof typeof Ionicons.glyphMap },
  { id: 3, label: 'Applying Meter', description: 'Structuring with Chandas...', icon: 'musical-notes' as keyof typeof Ionicons.glyphMap },
  { id: 4, label: 'Final Polish', description: 'Perfecting the composition...', icon: 'checkmark-done' as keyof typeof Ionicons.glyphMap },
];

export default function AIComposer() {
  const [theme, setTheme] = useState('');
  const [selectedMood, setSelectedMood] = useState<MoodType>('peaceful');
  const [selectedStyle, setSelectedStyle] = useState<StyleType>('classical');
  const [deity, setDeity] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedShloka, setGeneratedShloka] = useState<GeneratedShloka | null>(null);
  const [error, setError] = useState('');
  const [currentStage, setCurrentStage] = useState(0);

  // Animation refs
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const stageProgress = useRef(new Animated.Value(0)).current;
  const particleAnims = useRef(
    Array(8).fill(0).map(() => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
    }))
  ).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const iconRotateAnim = useRef(new Animated.Value(0)).current;

  // Animation control
  useEffect(() => {
    if (isGenerating) {
      // Spin animation
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Glow animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.4,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Scanning line animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanLineAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scanLineAnim, {
            toValue: 0,
            duration: 1500,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Icon rotation
      Animated.loop(
        Animated.timing(iconRotateAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      // Particle animations
      particleAnims.forEach((anim, index) => {
        const angle = (index / 8) * Math.PI * 2;
        const delay = index * 150;
        
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
              Animated.timing(anim.opacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
              }),
              Animated.timing(anim.scale, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
              }),
              Animated.timing(anim.x, {
                toValue: Math.cos(angle) * 60,
                duration: 1200,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
              Animated.timing(anim.y, {
                toValue: Math.sin(angle) * 60,
                duration: 1200,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
              }),
            ]),
            Animated.parallel([
              Animated.timing(anim.opacity, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
              }),
              Animated.timing(anim.scale, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
              }),
            ]),
            Animated.parallel([
              Animated.timing(anim.x, {
                toValue: 0,
                duration: 0,
                useNativeDriver: true,
              }),
              Animated.timing(anim.y, {
                toValue: 0,
                duration: 0,
                useNativeDriver: true,
              }),
            ]),
          ])
        ).start();
      });

    } else {
      spinAnim.setValue(0);
      pulseAnim.setValue(1);
      glowAnim.setValue(0);
      scanLineAnim.setValue(0);
      iconRotateAnim.setValue(0);
      particleAnims.forEach(anim => {
        anim.x.setValue(0);
        anim.y.setValue(0);
        anim.opacity.setValue(0);
        anim.scale.setValue(0);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGenerating]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const iconRotate = iconRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const scanLineY = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 120],
  });

  // API call to generate shloka using SvaramAI backend with axios
  const callGenerateAPI = async (): Promise<GeneratedShloka | null> => {
    try {
      console.log('Calling SvaramAI backend with axios...');
      
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/shloka/generate`,
        {
          theme: theme.trim(),
          deity: deity.trim() || undefined,
          mood: selectedMood,
          style: selectedStyle,
          meter: 'Anushtup',
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30s timeout for AI generation
        }
      );

      console.log('SvaramAI response:', response.data);
      
      const data = response.data;
      return {
        id: Date.now().toString(),
        sanskrit: data.shloka || '',
        transliteration: data.pattern || '',
        meaning: data.meaning || '',
        wordByWord: [],
        meter: data.meter || 'Anushtup',
        theme: theme.trim(),
        source: 'SvaramAI Generated',
        timestamp: new Date(),
      };
    } catch (err: any) {
      if (axios.isAxiosError(err)) {
        const errorDetail = err.response?.data?.detail || err.message;
        console.error('SvaramAI API error:', err.response?.status, errorDetail);
        throw new Error(errorDetail || `Server error: ${err.response?.status}`);
      }
      console.error('SvaramAI API error:', err);
      throw err;
    }
  };

  const handleGenerate = async () => {
    if (!theme.trim()) {
      setError('Please enter a theme or topic for your shloka');
      return;
    }

    setError('');
    setIsGenerating(true);
    setGeneratedShloka(null);
    setCurrentStage(0);

    // Fade out form
    Animated.timing(fadeAnim, {
      toValue: 0.3,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Start the API call
    const apiPromise = callGenerateAPI();

    // Progressive stage animation with minimum duration
    const minStageDuration = 1200;
    const totalMinDuration = minStageDuration * 4;
    const startTime = Date.now();

    // Stage progression
    for (let i = 0; i < 4; i++) {
      await new Promise<void>(resolve => {
        setTimeout(() => {
          setCurrentStage(i + 1);
          Animated.timing(stageProgress, {
            toValue: (i + 1) / 4,
            duration: 300,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
          }).start();
          resolve();
        }, i * minStageDuration);
      });
    }

    // Wait for API and minimum duration
    let result: GeneratedShloka | null = null;
    let apiError: string | null = null;
    
    try {
      const [apiResult] = await Promise.all([
        apiPromise,
        new Promise(resolve => {
          const elapsed = Date.now() - startTime;
          const remaining = Math.max(0, totalMinDuration - elapsed);
          setTimeout(resolve, remaining);
        }),
      ]);
      result = apiResult;
    } catch (err) {
      apiError = err instanceof Error ? err.message : 'Failed to generate shloka';
    }

    setIsGenerating(false);
    setCurrentStage(0);
    stageProgress.setValue(0);

    if (result) {
      setGeneratedShloka(result);
    } else {
      setError(apiError || 'Failed to generate shloka. Please check if the server is running.');
    }

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleNewShloka = () => {
    setGeneratedShloka(null);
  };

  const handlePresetSelect = (preset: typeof PRESETS[0]) => {
    setTheme(preset.label);
    if (['ganesha', 'krishna', 'shiva', 'saraswati'].includes(preset.id)) {
      setDeity(preset.label);
    }
  };

  // Render generation animation
  const renderGenerationAnimation = () => {
    const currentStageData = GENERATION_STAGES[currentStage - 1] || GENERATION_STAGES[0];
    
    return (
      <View style={{ alignItems: 'center', paddingVertical: 40 }}>
        {/* Main animated circle */}
        <Animated.View
          style={{
            transform: [{ scale: pulseAnim }],
          }}
        >
          <View
            style={{
              width: 140,
              height: 140,
              borderRadius: 70,
              backgroundColor: COLORS.cream,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 3,
              borderColor: COLORS.gold,
              overflow: 'hidden',
            }}
          >
            {/* Scan line effect */}
            <Animated.View
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                height: 3,
                backgroundColor: COLORS.saffron,
                opacity: 0.6,
                transform: [{ translateY: scanLineY }],
              }}
            />
            
            {/* Rotating icon */}
            <Animated.View style={{ transform: [{ rotate: iconRotate }] }}>
              <Ionicons 
                name={currentStageData.icon} 
                size={50} 
                color={COLORS.primaryBrown} 
              />
            </Animated.View>
          </View>

          {/* Particles */}
          {particleAnims.map((anim, index) => (
            <Animated.View
              key={index}
              style={{
                position: 'absolute',
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: index % 2 === 0 ? COLORS.gold : COLORS.saffron,
                opacity: anim.opacity,
                transform: [
                  { translateX: anim.x },
                  { translateY: anim.y },
                  { scale: anim.scale },
                ],
              }}
            />
          ))}

          {/* Outer rotating ring */}
          <Animated.View
            style={{
              position: 'absolute',
              width: 160,
              height: 160,
              borderRadius: 80,
              borderWidth: 2,
              borderColor: COLORS.copper,
              borderStyle: 'dashed',
              transform: [{ rotate: spin }],
            }}
          />
        </Animated.View>

        {/* Stage indicator */}
        <View style={{ marginTop: 30, alignItems: 'center' }}>
          <Animated.Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: COLORS.primaryBrown,
              opacity: glowAnim,
            }}
          >
            {currentStageData.label}
          </Animated.Text>
          <Text style={{ 
            fontSize: 14, 
            color: COLORS.copper, 
            marginTop: 6,
            textAlign: 'center',
          }}>
            {currentStageData.description}
          </Text>
        </View>

        {/* Progress stages */}
        <View style={{ 
          flexDirection: 'row', 
          marginTop: 30, 
          gap: 12,
        }}>
          {GENERATION_STAGES.map((stage, index) => (
            <View
              key={stage.id}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: index < currentStage ? COLORS.gold : COLORS.sand,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 2,
                borderColor: index < currentStage ? COLORS.saffron : COLORS.copper,
              }}
            >
              {index < currentStage ? (
                <Ionicons name="checkmark" size={20} color={COLORS.primaryBrown} />
              ) : index === currentStage - 1 ? (
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                  <Ionicons name="sync" size={18} color={COLORS.primaryBrown} />
                </Animated.View>
              ) : (
                <Ionicons name={stage.icon} size={18} color={COLORS.copper} />
              )}
            </View>
          ))}
        </View>

        {/* Stage labels */}
        <View style={{ 
          flexDirection: 'row', 
          marginTop: 8, 
          gap: 12,
        }}>
          {GENERATION_STAGES.map((stage, index) => (
            <Text
              key={stage.id}
              style={{
                width: 40,
                fontSize: 8,
                textAlign: 'center',
                color: index < currentStage ? COLORS.primaryBrown : COLORS.copper,
                fontWeight: index < currentStage ? '600' : '400',
              }}
            >
              {index + 1}
            </Text>
          ))}
        </View>

        {/* Progress bar */}
        <View style={{ 
          width: SCREEN_WIDTH - 80, 
          height: 6, 
          backgroundColor: COLORS.sand, 
          borderRadius: 3, 
          marginTop: 20,
          overflow: 'hidden',
        }}>
          <Animated.View
            style={{
              width: stageProgress.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
              height: '100%',
              backgroundColor: COLORS.gold,
              borderRadius: 3,
            }}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.cream }}>
      {/* Header */}
      <LinearGradient
        colors={[COLORS.primaryBrown, COLORS.darkBrown]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255,255,255,0.1)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="arrow-back" size={22} color={COLORS.cream} />
          </TouchableOpacity>

          <View style={{ alignItems: 'center', flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="sparkles" size={20} color={COLORS.gold} />
              <Text style={{ fontSize: 20, fontWeight: '700', color: COLORS.cream, marginLeft: 8 }}>
                AI Composer
              </Text>
            </View>
            <Text style={{ fontSize: 12, color: COLORS.sand, marginTop: 4 }}>
              Create Sanskrit shlokas with AI
            </Text>
          </View>

          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {generatedShloka ? (
            <GeneratedShlokaCard shloka={generatedShloka} onNewShloka={handleNewShloka} />
          ) : isGenerating ? (
            renderGenerationAnimation()
          ) : (
            <Animated.View style={{ opacity: fadeAnim }}>
              {/* Intro Card */}
              <View
                style={{
                  backgroundColor: COLORS.warmWhite,
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 20,
                  borderWidth: 1,
                  borderColor: COLORS.gold,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <View style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: COLORS.sand,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}>
                    <Ionicons name="flower" size={24} color={COLORS.saffron} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: COLORS.primaryBrown }}>
                      Divine Verse Creator
                    </Text>
                    <Text style={{ fontSize: 13, color: COLORS.copper, marginTop: 2 }}>
                      Powered by AI to craft meaningful shlokas
                    </Text>
                  </View>
                </View>
                <Text style={{ fontSize: 13, color: COLORS.primaryBrown, lineHeight: 20, opacity: 0.8 }}>
                  Enter a theme, select a mood, and let AI compose a beautiful Sanskrit shloka
                  with transliteration, meaning, and word-by-word analysis.
                </Text>
              </View>

              {/* Quick Presets */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.primaryBrown, marginBottom: 12 }}>
                  Quick Presets
                </Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    {PRESETS.map((preset) => (
                      <TouchableOpacity
                        key={preset.id}
                        onPress={() => handlePresetSelect(preset)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: theme === preset.label ? COLORS.sand : COLORS.warmWhite,
                          borderRadius: 20,
                          paddingHorizontal: 14,
                          paddingVertical: 8,
                          borderWidth: 1,
                          borderColor: theme === preset.label ? COLORS.gold : COLORS.copper,
                        }}
                      >
                        <Ionicons 
                          name={preset.icon} 
                          size={18} 
                          color={theme === preset.label ? COLORS.saffron : COLORS.copper} 
                          style={{ marginRight: 6 }}
                        />
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: '500',
                            color: theme === preset.label ? COLORS.primaryBrown : COLORS.copper,
                          }}
                        >
                          {preset.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Theme Input */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.primaryBrown, marginBottom: 8 }}>
                  Theme / Topic *
                </Text>
                <View
                  style={{
                    backgroundColor: COLORS.warmWhite,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: error && !theme.trim() ? '#ef4444' : COLORS.copper,
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 14,
                  }}
                >
                  <Ionicons name="bulb-outline" size={20} color={COLORS.copper} />
                  <TextInput
                    style={{
                      flex: 1,
                      paddingVertical: 14,
                      paddingHorizontal: 10,
                      fontSize: 15,
                      color: COLORS.primaryBrown,
                    }}
                    placeholder="e.g., Peace, Knowledge, Morning Prayer..."
                    placeholderTextColor={COLORS.copper}
                    value={theme}
                    onChangeText={(text) => {
                      setTheme(text);
                      if (error) setError('');
                    }}
                  />
                </View>
              </View>

              {/* Deity Input */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.primaryBrown, marginBottom: 8 }}>
                  Deity (Optional)
                </Text>
                <View
                  style={{
                    backgroundColor: COLORS.warmWhite,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: COLORS.copper,
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 14,
                  }}
                >
                  <Ionicons name="star-outline" size={20} color={COLORS.copper} />
                  <TextInput
                    style={{
                      flex: 1,
                      paddingVertical: 14,
                      paddingHorizontal: 10,
                      fontSize: 15,
                      color: COLORS.primaryBrown,
                    }}
                    placeholder="e.g., Ganesha, Krishna, Saraswati..."
                    placeholderTextColor={COLORS.copper}
                    value={deity}
                    onChangeText={setDeity}
                  />
                </View>
              </View>

              {/* Mood Selection */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.primaryBrown, marginBottom: 12 }}>
                  Mood
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                  {MOODS.map((moodItem) => (
                    <TouchableOpacity
                      key={moodItem.id}
                      onPress={() => setSelectedMood(moodItem.id)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: selectedMood === moodItem.id ? COLORS.sand : COLORS.warmWhite,
                        borderRadius: 12,
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        borderWidth: 1,
                        borderColor: selectedMood === moodItem.id ? COLORS.gold : COLORS.copper,
                      }}
                    >
                      <Ionicons 
                        name={moodItem.icon} 
                        size={18} 
                        color={selectedMood === moodItem.id ? COLORS.saffron : COLORS.copper} 
                        style={{ marginRight: 6 }}
                      />
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: '500',
                          color: selectedMood === moodItem.id ? COLORS.primaryBrown : COLORS.copper,
                        }}
                      >
                        {moodItem.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Style Selection */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.primaryBrown, marginBottom: 12 }}>
                  Style
                </Text>
                <View style={{ gap: 10 }}>
                  {STYLES.map((styleItem) => (
                    <TouchableOpacity
                      key={styleItem.id}
                      onPress={() => setSelectedStyle(styleItem.id)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: selectedStyle === styleItem.id ? COLORS.sand : COLORS.warmWhite,
                        borderRadius: 12,
                        padding: 14,
                        borderWidth: 1,
                        borderColor: selectedStyle === styleItem.id ? COLORS.gold : COLORS.copper,
                      }}
                    >
                      <View
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 10,
                          borderWidth: 2,
                          borderColor: selectedStyle === styleItem.id ? COLORS.saffron : COLORS.copper,
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 12,
                        }}
                      >
                        {selectedStyle === styleItem.id && (
                          <View
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: 5,
                              backgroundColor: COLORS.saffron,
                            }}
                          />
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: '600',
                            color: selectedStyle === styleItem.id ? COLORS.primaryBrown : COLORS.copper,
                          }}
                        >
                          {styleItem.label}
                        </Text>
                        <Text style={{ fontSize: 12, color: COLORS.copper, marginTop: 2 }}>
                          {styleItem.desc}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Error Message */}
              {error ? (
                <View
                  style={{
                    backgroundColor: '#fef2f2',
                    borderRadius: 12,
                    padding: 14,
                    marginBottom: 16,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <Ionicons name="alert-circle" size={20} color="#ef4444" />
                  <Text style={{ marginLeft: 10, color: '#dc2626', fontSize: 13, flex: 1 }}>
                    {error}
                  </Text>
                </View>
              ) : null}

              {/* Generate Button */}
              <TouchableOpacity
                onPress={handleGenerate}
                disabled={isGenerating}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[COLORS.saffron, COLORS.copper]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    borderRadius: 16,
                    padding: 18,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'row',
                  }}
                >
                  <Ionicons name="sparkles" size={22} color={COLORS.cream} />
                  <Text style={{ marginLeft: 10, color: COLORS.cream, fontSize: 16, fontWeight: '700' }}>
                    Generate Shloka
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}