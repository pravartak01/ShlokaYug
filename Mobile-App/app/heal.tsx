import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Audio } from 'expo-av';
import { moodCategories, MoodCategory, HealingShloka, getRandomShloka } from '../data/healingShlokas';
import { getAudioUrlFromFilename } from '../data/shlokaAudioMap';
import Slider from '@react-native-community/slider';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mood Category Card Component
const MoodCard = ({ 
  category, 
  index, 
  onPress, 
  isSelected 
}: { 
  category: MoodCategory; 
  index: number; 
  onPress: () => void;
  isSelected: boolean;
}) => {
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        delay: index * 80,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 80,
        useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View
      style={{
        opacity: opacityAnim,
        transform: [{ scale: scaleAnim }],
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.85}
        style={{
          width: (SCREEN_WIDTH - 48) / 2,
          marginBottom: 12,
        }}
      >
        <View
          style={{
            backgroundColor: isSelected ? category.color : category.bgColor,
            borderRadius: 20,
            padding: 16,
            borderWidth: 2,
            borderColor: isSelected ? category.color : 'transparent',
            shadowColor: category.color,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isSelected ? 0.3 : 0.1,
            shadowRadius: 12,
            elevation: isSelected ? 8 : 3,
          }}
        >
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : category.color + '20',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}
          >
            <Ionicons 
              name={category.icon as any} 
              size={24} 
              color={isSelected ? '#ffffff' : category.color} 
            />
          </View>
          
          <Text
            style={{
              fontSize: 15,
              fontWeight: '700',
              color: isSelected ? '#ffffff' : '#1f2937',
              marginBottom: 4,
            }}
          >
            {category.name}
          </Text>
          
          <Text
            style={{
              fontSize: 11,
              color: isSelected ? 'rgba(255,255,255,0.8)' : '#6b7280',
              marginBottom: 8,
            }}
            numberOfLines={2}
          >
            {category.description}
          </Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : category.color + '15',
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: '600',
                  color: isSelected ? '#ffffff' : category.color,
                }}
              >
                {category.shlokas.length} Shlokas
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Shloka Card Component
const ShlokaCard = ({
  shloka,
  index,
  onPlay,
  isPlaying,
  categoryColor,
}: {
  shloka: HealingShloka;
  index: number;
  onPlay: () => void;
  isPlaying: boolean;
  categoryColor: string;
}) => {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Animated.View
      style={{
        opacity: opacityAnim,
        transform: [{ translateY: slideAnim }],
        marginBottom: 16,
      }}
    >
      <View
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 20,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: isPlaying ? categoryColor : '#f3f4f6',
          shadowColor: isPlaying ? categoryColor : '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isPlaying ? 0.2 : 0.08,
          shadowRadius: 12,
          elevation: isPlaying ? 8 : 4,
        }}
      >
        {/* Header */}
        <View
          style={{
            backgroundColor: isPlaying ? categoryColor : '#f9fafb',
            paddingHorizontal: 16,
            paddingVertical: 14,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: isPlaying ? '#ffffff' : '#1f2937',
                marginBottom: 2,
              }}
            >
              {shloka.name}
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: isPlaying ? 'rgba(255,255,255,0.8)' : '#6b7280',
              }}
            >
              {shloka.nameHindi}
            </Text>
          </View>
          
          <TouchableOpacity
            onPress={onPlay}
            style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: isPlaying ? 'rgba(255,255,255,0.25)' : categoryColor,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={22}
              color="#ffffff"
            />
          </TouchableOpacity>
        </View>
        
        {/* Content */}
        <View style={{ padding: 16 }}>
          {/* Sanskrit Text */}
          <View
            style={{
              backgroundColor: '#faf5ff',
              borderRadius: 12,
              padding: 14,
              marginBottom: 12,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                color: '#581c87',
                fontWeight: '500',
                lineHeight: 26,
                textAlign: 'center',
              }}
            >
              {shloka.shloka}
            </Text>
          </View>
          
          {/* Meaning */}
          <Text
            style={{
              fontSize: 14,
              color: '#4b5563',
              lineHeight: 22,
              marginBottom: 12,
              fontStyle: 'italic',
            }}
          >
            {`"${shloka.meaning}"`}
          </Text>
          
          {/* Meta Info */}
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#f3f4f6',
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 8,
              }}
            >
              <Ionicons name="book-outline" size={12} color="#6b7280" />
              <Text style={{ fontSize: 11, color: '#6b7280', marginLeft: 4 }}>
                {shloka.source}
              </Text>
            </View>
            
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: categoryColor + '15',
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 8,
              }}
            >
              <Ionicons name="sparkles" size={12} color={categoryColor} />
              <Text style={{ fontSize: 11, color: categoryColor, marginLeft: 4, fontWeight: '600' }}>
                {shloka.benefit}
              </Text>
            </View>
            
            {shloka.duration && (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: '#f3f4f6',
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 8,
                }}
              >
                <Ionicons name="time-outline" size={12} color="#6b7280" />
                <Text style={{ fontSize: 11, color: '#6b7280', marginLeft: 4 }}>
                  {shloka.duration}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

// Audio Player Component
const AudioPlayer = ({
  currentShloka,
  isPlaying,
  onPlayPause,
  onClose,
  progress,
  duration,
  onSeek,
  categoryColor,
}: {
  currentShloka: HealingShloka | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onClose: () => void;
  progress: number;
  duration: number;
  onSeek: (value: number) => void;
  categoryColor: string;
}) => {
  const slideAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    if (currentShloka) {
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentShloka]);

  if (!currentShloka) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 90 : 70,
        left: 0,
        right: 0,
        transform: [{ translateY: slideAnim }],
        paddingHorizontal: 16,
        paddingBottom: 8,
      }}
    >
      <View
        style={{
          backgroundColor: categoryColor,
          borderRadius: 20,
          padding: 16,
          shadowColor: categoryColor,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.4,
          shadowRadius: 16,
          elevation: 12,
        }}
      >
        {/* Close button */}
        <TouchableOpacity
          onPress={onClose}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: 'rgba(255,255,255,0.2)',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          <Ionicons name="close" size={16} color="#ffffff" />
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {/* Play/Pause Button */}
          <TouchableOpacity
            onPress={onPlayPause}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: 'rgba(255,255,255,0.25)',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 14,
            }}
          >
            <Ionicons
              name={isPlaying ? 'pause' : 'play'}
              size={28}
              color="#ffffff"
            />
          </TouchableOpacity>

          {/* Info & Progress */}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '700',
                color: '#ffffff',
                marginBottom: 2,
              }}
              numberOfLines={1}
            >
              {currentShloka.name}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.7)',
                marginBottom: 8,
              }}
            >
              {currentShloka.benefit}
            </Text>

            {/* Progress Bar */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', width: 35 }}>
                {formatTime(progress)}
              </Text>
              <View style={{ flex: 1, marginHorizontal: 8 }}>
                <Slider
                  minimumValue={0}
                  maximumValue={duration || 1}
                  value={progress}
                  onSlidingComplete={onSeek}
                  minimumTrackTintColor="#ffffff"
                  maximumTrackTintColor="rgba(255,255,255,0.3)"
                  thumbTintColor="#ffffff"
                  style={{ height: 20 }}
                />
              </View>
              <Text style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', width: 35, textAlign: 'right' }}>
                {formatTime(duration)}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

export default function HealScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<MoodCategory | null>(null);
  const [currentShloka, setCurrentShloka] = useState<HealingShloka | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playbackStatus, setPlaybackStatus] = useState({ position: 0, duration: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [dailyShloka, setDailyShloka] = useState<HealingShloka | null>(null);

  const scrollViewRef = useRef<ScrollView>(null);
  const headerFade = useRef(new Animated.Value(0)).current;
  const headerSlide = useRef(new Animated.Value(-30)).current;

  useEffect(() => {
    // Header animation
    Animated.parallel([
      Animated.timing(headerFade, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(headerSlide, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Set daily shloka
    setDailyShloka(getRandomShloka());

    // Setup audio
    setupAudio();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setupAudio = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
    } catch (error) {
      console.error('Error setting up audio:', error);
    }
  };

  const playAudio = async (shloka: HealingShloka) => {
    try {
      setIsLoading(true);
      
      // Stop current audio if playing
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }

      // Get the audio URL from the filename
      const audioUrl = getAudioUrlFromFilename(shloka.audioFile);
      
      // Create and load new sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded) {
            if (status.didJustFinish) {
              setIsPlaying(false);
            }
          }
        }
      );
      
      setSound(newSound);
      setCurrentShloka(shloka);
      setIsPlaying(true);
      setIsLoading(false);
      
    } catch (error) {
      console.error('Error playing audio:', error);
      setIsLoading(false);
      // Still set the shloka to show UI even if audio fails
      setCurrentShloka(shloka);
    }
  };

  const togglePlayPause = async () => {
    if (!sound) {
      // If no sound loaded, just toggle UI state for demo
      setIsPlaying(!isPlaying);
      return;
    }
    
    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = async (value: number) => {
    if (sound) {
      await sound.setPositionAsync(value * 1000);
    }
  };

  const closePlayer = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
    }
    setCurrentShloka(null);
    setIsPlaying(false);
    setPlaybackStatus({ position: 0, duration: 0 });
  };

  const handleCategoryPress = (category: MoodCategory) => {
    if (selectedCategory?.id === category.id) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
      // Scroll to shlokas section
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 400, animated: true });
      }, 100);
    }
  };

  const categoryColor = selectedCategory?.color || '#4A2E1C';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: currentShloka ? 180 : 100 }}
      >
        {/* Header */}
        <Animated.View
          style={{
            opacity: headerFade,
            transform: [{ translateY: headerSlide }],
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 20,
          }}
        >
          {/* Back & Title */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: '#f3f4f6',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 12,
              }}
            >
              <Ionicons name="arrow-back" size={20} color="#374151" />
            </TouchableOpacity>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 24, fontWeight: '800', color: '#1f2937' }}>
                Heal with Shlokas
              </Text>
              <Text style={{ fontSize: 14, color: '#6b7280', marginTop: 2 }}>
                Mood-based shloka therapy
              </Text>
            </View>
            <View
              style={{
                backgroundColor: '#4A2E1C',
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 8,
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '700', color: '#ffffff' }}>USP</Text>
            </View>
          </View>

          {/* Daily Recommendation */}
          {dailyShloka && (
            <TouchableOpacity
              onPress={() => playAudio(dailyShloka)}
              activeOpacity={0.9}
            >
              <View
                style={{
                  backgroundColor: '#4A2E1C',
                  borderRadius: 20,
                  padding: 20,
                  marginBottom: 8,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                  <View
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 10,
                    }}
                  >
                    <Ionicons name="sunny" size={18} color="#ffffff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
                      {"Today's Recommendation"}
                    </Text>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#ffffff' }}>
                      {dailyShloka.name}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: 'rgba(255,255,255,0.25)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Ionicons name="play" size={20} color="#ffffff" />
                  </View>
                </View>
                <Text
                  style={{
                    fontSize: 13,
                    color: 'rgba(255,255,255,0.9)',
                    lineHeight: 20,
                  }}
                  numberOfLines={2}
                >
                  {dailyShloka.meaning}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </Animated.View>

        {/* Mood Selection */}
        <View style={{ paddingHorizontal: 20 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: '700',
              color: '#1f2937',
              marginBottom: 4,
            }}
          >
            How are you feeling?
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: '#6b7280',
              marginBottom: 16,
            }}
          >
            Select your mood to find the perfect healing shlokas
          </Text>

          {/* Mood Grid */}
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
            }}
          >
            {moodCategories.map((category, index) => (
              <MoodCard
                key={category.id}
                category={category}
                index={index}
                onPress={() => handleCategoryPress(category)}
                isSelected={selectedCategory?.id === category.id}
              />
            ))}
          </View>
        </View>

        {/* Selected Category Shlokas */}
        {selectedCategory && (
          <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: selectedCategory.color,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                <Ionicons
                  name={selectedCategory.icon as any}
                  size={20}
                  color="#ffffff"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, fontWeight: '700', color: '#1f2937' }}>
                  {selectedCategory.name}
                </Text>
                <Text style={{ fontSize: 12, color: '#6b7280' }}>
                  {selectedCategory.shlokas.length} healing shlokas
                </Text>
              </View>
            </View>

            {/* Shlokas List */}
            {selectedCategory.shlokas.map((shloka, index) => (
              <ShlokaCard
                key={shloka.id}
                shloka={shloka}
                index={index}
                onPlay={() => playAudio(shloka)}
                isPlaying={currentShloka?.id === shloka.id && isPlaying}
                categoryColor={selectedCategory.color}
              />
            ))}
          </View>
        )}

        {/* Empty State when no category selected */}
        {!selectedCategory && (
          <View
            style={{
              paddingHorizontal: 20,
              paddingTop: 20,
              alignItems: 'center',
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: '#f3f4f6',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}
            >
              <Ionicons name="hand-left-outline" size={36} color="#9ca3af" />
            </View>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '600',
                color: '#6b7280',
                textAlign: 'center',
              }}
            >
              Select a mood above to see healing shlokas
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Loading Indicator */}
      {isLoading && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.3)',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <View
            style={{
              backgroundColor: '#ffffff',
              padding: 24,
              borderRadius: 16,
              alignItems: 'center',
            }}
          >
            <ActivityIndicator size="large" color={categoryColor} />
            <Text style={{ marginTop: 12, color: '#6b7280' }}>Loading audio...</Text>
          </View>
        </View>
      )}

      {/* Audio Player */}
      <AudioPlayer
        currentShloka={currentShloka}
        isPlaying={isPlaying}
        onPlayPause={togglePlayPause}
        onClose={closePlayer}
        progress={playbackStatus.position / 1000}
        duration={playbackStatus.duration / 1000}
        onSeek={handleSeek}
        categoryColor={categoryColor}
      />
    </SafeAreaView>
  );
}
