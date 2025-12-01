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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { generateShloka, GeneratedShloka, ShlokaGenerationRequest } from '../../services/aiComposerService';
import GeneratedShlokaCard from './GeneratedShlokaCard';

type MoodType = 'devotional' | 'peaceful' | 'inspiring' | 'philosophical' | 'celebratory';
type StyleType = 'vedic' | 'classical' | 'simple';

// Mood options
const MOODS: { id: MoodType; label: string; icon: string }[] = [
  { id: 'peaceful', label: 'Peaceful', icon: '🕊️' },
  { id: 'devotional', label: 'Devotional', icon: '🙏' },
  { id: 'inspiring', label: 'Inspirational', icon: '✨' },
  { id: 'philosophical', label: 'Contemplative', icon: '🧘' },
  { id: 'celebratory', label: 'Joyful', icon: '🎉' },
];

// Style options
const STYLES: { id: StyleType; label: string; desc: string }[] = [
  { id: 'classical', label: 'Classical', desc: 'Traditional Sanskrit style' },
  { id: 'simple', label: 'Simple', desc: 'Easy to understand' },
  { id: 'vedic', label: 'Vedic', desc: 'Ancient Vedic style' },
];

// Deity/Theme presets
const PRESETS = [
  { id: 'ganesha', label: 'Ganesha', icon: '🕉️' },
  { id: 'krishna', label: 'Krishna', icon: '🪈' },
  { id: 'shiva', label: 'Shiva', icon: '🔱' },
  { id: 'saraswati', label: 'Saraswati', icon: '📚' },
  { id: 'nature', label: 'Nature', icon: '🌿' },
  { id: 'wisdom', label: 'Wisdom', icon: '💡' },
];

export default function AIComposer() {
  const [theme, setTheme] = useState('');
  const [selectedMood, setSelectedMood] = useState<MoodType>('peaceful');
  const [selectedStyle, setSelectedStyle] = useState<StyleType>('classical');
  const [deity, setDeity] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedShloka, setGeneratedShloka] = useState<GeneratedShloka | null>(null);
  const [error, setError] = useState('');

  // Animation refs
  const spinAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Spin animation for loading
  useEffect(() => {
    if (isGenerating) {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.3,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      spinAnim.setValue(0);
      pulseAnim.setValue(1);
      glowAnim.setValue(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGenerating]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleGenerate = async () => {
    if (!theme.trim()) {
      setError('Please enter a theme or topic for your shloka');
      return;
    }

    setError('');
    setIsGenerating(true);
    setGeneratedShloka(null);

    // Fade out form
    Animated.timing(fadeAnim, {
      toValue: 0.3,
      duration: 300,
      useNativeDriver: true,
    }).start();

    try {
      const request: ShlokaGenerationRequest = {
        theme: theme.trim(),
        mood: selectedMood,
        deity: deity.trim() || undefined,
        style: selectedStyle,
      };

      const result = await generateShloka(request);
      if (result.success) {
        setGeneratedShloka(result.shloka);
      } else {
        setError(result.error.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate shloka');
    } finally {
      setIsGenerating(false);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fafafa' }}>
      {/* Header */}
      <LinearGradient
        colors={['#1e293b', '#0f172a']}
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
            <Ionicons name="arrow-back" size={22} color="#ffffff" />
          </TouchableOpacity>

          <View style={{ alignItems: 'center', flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="sparkles" size={20} color="#fbbf24" />
              <Text style={{ fontSize: 20, fontWeight: '700', color: '#ffffff', marginLeft: 8 }}>
                AI Composer
              </Text>
            </View>
            <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
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
          ) : (
            <Animated.View style={{ opacity: fadeAnim }}>
              {/* Intro Card */}
              <View
                style={{
                  backgroundColor: '#fffbf5',
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 20,
                  borderWidth: 1,
                  borderColor: '#fde68a',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={{ fontSize: 28, marginRight: 12 }}>🪷</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#92400e' }}>
                      Divine Verse Creator
                    </Text>
                    <Text style={{ fontSize: 13, color: '#b45309', marginTop: 2 }}>
                      Powered by AI to craft meaningful shlokas
                    </Text>
                  </View>
                </View>
                <Text style={{ fontSize: 13, color: '#78716c', lineHeight: 20 }}>
                  Enter a theme, select a mood, and let AI compose a beautiful Sanskrit shloka
                  with transliteration, meaning, and word-by-word analysis.
                </Text>
              </View>

              {/* Quick Presets */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 12 }}>
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
                          backgroundColor: theme === preset.label ? '#fef3c7' : '#ffffff',
                          borderRadius: 20,
                          paddingHorizontal: 14,
                          paddingVertical: 8,
                          borderWidth: 1,
                          borderColor: theme === preset.label ? '#fcd34d' : '#e5e7eb',
                        }}
                      >
                        <Text style={{ fontSize: 16, marginRight: 6 }}>{preset.icon}</Text>
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: '500',
                            color: theme === preset.label ? '#92400e' : '#6b7280',
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
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                  Theme / Topic *
                </Text>
                <View
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: error && !theme.trim() ? '#ef4444' : '#e5e7eb',
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 14,
                  }}
                >
                  <Ionicons name="bulb-outline" size={20} color="#9ca3af" />
                  <TextInput
                    style={{
                      flex: 1,
                      paddingVertical: 14,
                      paddingHorizontal: 10,
                      fontSize: 15,
                      color: '#1f2937',
                    }}
                    placeholder="e.g., Peace, Knowledge, Morning Prayer..."
                    placeholderTextColor="#9ca3af"
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
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                  Deity (Optional)
                </Text>
                <View
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: '#e5e7eb',
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 14,
                  }}
                >
                  <Ionicons name="star-outline" size={20} color="#9ca3af" />
                  <TextInput
                    style={{
                      flex: 1,
                      paddingVertical: 14,
                      paddingHorizontal: 10,
                      fontSize: 15,
                      color: '#1f2937',
                    }}
                    placeholder="e.g., Ganesha, Krishna, Saraswati..."
                    placeholderTextColor="#9ca3af"
                    value={deity}
                    onChangeText={setDeity}
                  />
                </View>
              </View>

              {/* Mood Selection */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 12 }}>
                  Mood
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                  {MOODS.map((mood) => (
                    <TouchableOpacity
                      key={mood.id}
                      onPress={() => setSelectedMood(mood.id)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: selectedMood === mood.id ? '#fef3c7' : '#ffffff',
                        borderRadius: 12,
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        borderWidth: 1,
                        borderColor: selectedMood === mood.id ? '#fcd34d' : '#e5e7eb',
                      }}
                    >
                      <Text style={{ fontSize: 16, marginRight: 6 }}>{mood.icon}</Text>
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: '500',
                          color: selectedMood === mood.id ? '#92400e' : '#6b7280',
                        }}
                      >
                        {mood.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Style Selection */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 12 }}>
                  Style
                </Text>
                <View style={{ gap: 10 }}>
                  {STYLES.map((style) => (
                    <TouchableOpacity
                      key={style.id}
                      onPress={() => setSelectedStyle(style.id)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: selectedStyle === style.id ? '#fef3c7' : '#ffffff',
                        borderRadius: 12,
                        padding: 14,
                        borderWidth: 1,
                        borderColor: selectedStyle === style.id ? '#fcd34d' : '#e5e7eb',
                      }}
                    >
                      <View
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: 10,
                          borderWidth: 2,
                          borderColor: selectedStyle === style.id ? '#f97316' : '#d1d5db',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 12,
                        }}
                      >
                        {selectedStyle === style.id && (
                          <View
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: 5,
                              backgroundColor: '#f97316',
                            }}
                          />
                        )}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: '600',
                            color: selectedStyle === style.id ? '#92400e' : '#374151',
                          }}
                        >
                          {style.label}
                        </Text>
                        <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                          {style.desc}
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
                  colors={isGenerating ? ['#9ca3af', '#6b7280'] : ['#f97316', '#ea580c']}
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
                  {isGenerating ? (
                    <>
                      <Animated.View style={{ transform: [{ rotate: spin }] }}>
                        <Ionicons name="sync" size={22} color="#ffffff" />
                      </Animated.View>
                      <Animated.Text
                        style={{
                          marginLeft: 10,
                          color: '#ffffff',
                          fontSize: 16,
                          fontWeight: '700',
                          opacity: glowAnim,
                        }}
                      >
                        Composing Shloka...
                      </Animated.Text>
                    </>
                  ) : (
                    <>
                      <Ionicons name="sparkles" size={22} color="#ffffff" />
                      <Text style={{ marginLeft: 10, color: '#ffffff', fontSize: 16, fontWeight: '700' }}>
                        Generate Shloka
                      </Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Loading Animation Overlay */}
              {isGenerating && (
                <Animated.View
                  style={{
                    marginTop: 30,
                    alignItems: 'center',
                    transform: [{ scale: pulseAnim }],
                  }}
                >
                  <View
                    style={{
                      width: 100,
                      height: 100,
                      borderRadius: 50,
                      backgroundColor: '#fff7ed',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 3,
                      borderColor: '#fed7aa',
                    }}
                  >
                    <Text style={{ fontSize: 40 }}>🪷</Text>
                  </View>
                  <Text style={{ marginTop: 16, fontSize: 14, color: '#78716c', textAlign: 'center' }}>
                    The AI is crafting your Sanskrit verse...
                  </Text>
                  <Text style={{ marginTop: 6, fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>
                    This may take a few moments
                  </Text>
                </Animated.View>
              )}
            </Animated.View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent" \
//   -H 'Content-Type: application/json' \
//   -H 'X-goog-api-key: AIzaSyBSWbBtRK9Q69aY_SJ0muXvrqoIWAdt2kE' \
//   -X POST \
//   -d '{
//     "contents": [
//       {
//         "parts": [
//           {
//             "text": "Explain how AI works in a few words"
//           }
//         ]
//       }
//     ]
//   }'