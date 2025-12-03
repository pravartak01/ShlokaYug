import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ShlokaData } from '../../data/shlokas';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ShlokaDetailModalProps {
  visible: boolean;
  shloka: ShlokaData | null;
  onClose: () => void;
}

export default function ShlokaDetailModal({
  visible,
  shloka,
  onClose,
}: ShlokaDetailModalProps) {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(SCREEN_HEIGHT);
      fadeAnim.setValue(0);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 12,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_HEIGHT,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handleShare = async () => {
    if (!shloka) return;
    try {
      await Share.share({
        message: `${shloka.title}\n\n${shloka.lines.map(l => l.text).join('\n')}\n\n${shloka.meaning}\n\n- From ${shloka.source}`,
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  if (!shloka) return null;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#22c55e';
      case 'intermediate': return '#f59e0b';
      case 'advanced': return '#ef4444';
      case 'expert': return '#a0704a';
      default: return '#6b7280';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <StatusBar backgroundColor="transparent" barStyle="light-content" translucent />
      
      <View style={{ flex: 1 }}>
        {/* Backdrop */}
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            opacity: fadeAnim,
          }}
        >
          <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        </Animated.View>

        {/* Modal Content */}
        <Animated.View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            maxHeight: SCREEN_HEIGHT * 0.92,
            transform: [{ translateY: slideAnim }],
            backgroundColor: '#ffffff',
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            overflow: 'hidden',
          }}
        >
          {/* Header with gradient */}
          <LinearGradient
            colors={[shloka.thumbnailColor, `${shloka.thumbnailColor}dd`]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingTop: 20, paddingBottom: 24, paddingHorizontal: 20 }}
          >
            {/* Handle bar */}
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <View style={{ width: 40, height: 4, backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 2 }} />
            </View>

            {/* Close and Share buttons */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
              <TouchableOpacity
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="close" size={20} color="#ffffff" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleShare}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="share-outline" size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Title section */}
            <View>
              <Text style={{ fontSize: 24, fontWeight: '800', color: '#ffffff', marginBottom: 4 }}>
                {shloka.title}
              </Text>
              <Text style={{ fontSize: 18, color: 'rgba(255,255,255,0.85)', fontWeight: '500' }}>
                {shloka.subtitle}
              </Text>
            </View>

            {/* Meta tags */}
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16, flexWrap: 'wrap', gap: 8 }}>
              <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 }}>
                <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '600' }}>{shloka.source}</Text>
              </View>
              <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 }}>
                <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '600' }}>{shloka.category}</Text>
              </View>
              <View style={{ backgroundColor: getDifficultyColor(shloka.difficulty), paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 }}>
                <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '600', textTransform: 'capitalize' }}>
                  {shloka.difficulty}
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Scrollable Content */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Description */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
                About
              </Text>
              <Text style={{ fontSize: 15, color: '#4b5563', lineHeight: 24 }}>
                {shloka.description}
              </Text>
            </View>

            {/* Shloka Verses */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
                Verses
              </Text>
              
              {shloka.lines.map((line, index) => (
                <View
                  key={line.id}
                  style={{
                    backgroundColor: '#fffbf5',
                    borderRadius: 14,
                    padding: 16,
                    marginBottom: 12,
                    borderLeftWidth: 4,
                    borderLeftColor: shloka.thumbnailColor,
                  }}
                >
                  {/* Verse number */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: shloka.thumbnailColor,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: '700' }}>{index + 1}</Text>
                    </View>
                  </View>

                  {/* Sanskrit Text */}
                  <Text style={{ fontSize: 18, color: '#92400e', fontWeight: '600', lineHeight: 28, marginBottom: 8 }}>
                    {line.text}
                  </Text>

                  {/* Transliteration */}
                  <Text style={{ fontSize: 14, color: '#b45309', fontStyle: 'italic', marginBottom: 10 }}>
                    {line.transliteration}
                  </Text>

                  {/* Translation */}
                  <View style={{ borderTopWidth: 1, borderTopColor: '#fde68a', paddingTop: 10 }}>
                    <Text style={{ fontSize: 13, color: '#78716c', lineHeight: 20 }}>
                      {line.translation}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Complete Meaning */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
                Complete Meaning
              </Text>
              <View
                style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: 14,
                  padding: 18,
                  borderWidth: 1,
                  borderColor: '#e2e8f0',
                }}
              >
                <Ionicons name="bulb-outline" size={24} color={shloka.thumbnailColor} style={{ marginBottom: 10 }} />
                <Text style={{ fontSize: 15, color: '#475569', lineHeight: 26, fontWeight: '400' }}>
                  {shloka.meaning}
                </Text>
              </View>
            </View>

            {/* Tags */}
            <View style={{ marginBottom: 32 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
                Tags
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {shloka.tags.map((tag, index) => (
                  <View
                    key={index}
                    style={{
                      backgroundColor: '#f3f4f6',
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 20,
                    }}
                  >
                    <Text style={{ fontSize: 13, color: '#6b7280', fontWeight: '500' }}>#{tag}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Stats Row */}
            <View
              style={{
                flexDirection: 'row',
                backgroundColor: '#f8fafc',
                borderRadius: 14,
                padding: 16,
                marginBottom: 20,
              }}
            >
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Ionicons name="people-outline" size={22} color="#6b7280" />
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#1f2937', marginTop: 6 }}>
                  {(shloka.practiceCount / 1000).toFixed(1)}K
                </Text>
                <Text style={{ fontSize: 11, color: '#9ca3af' }}>Practiced</Text>
              </View>
              <View style={{ width: 1, backgroundColor: '#e5e7eb', marginHorizontal: 16 }} />
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Ionicons name="star" size={22} color="#fbbf24" />
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#1f2937', marginTop: 6 }}>
                  {shloka.rating}
                </Text>
                <Text style={{ fontSize: 11, color: '#9ca3af' }}>Rating</Text>
              </View>
              <View style={{ width: 1, backgroundColor: '#e5e7eb', marginHorizontal: 16 }} />
              <View style={{ flex: 1, alignItems: 'center' }}>
                <Ionicons name="time-outline" size={22} color="#6b7280" />
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#1f2937', marginTop: 6 }}>
                  {shloka.duration}s
                </Text>
                <Text style={{ fontSize: 11, color: '#9ca3af' }}>Duration</Text>
              </View>
            </View>
          </ScrollView>

          {/* Bottom Action */}
          <View
            style={{
              padding: 16,
              paddingBottom: 28,
              borderTopWidth: 1,
              borderTopColor: '#f3f4f6',
              backgroundColor: '#ffffff',
            }}
          >
            <TouchableOpacity
              style={{
                backgroundColor: shloka.thumbnailColor,
                borderRadius: 14,
                paddingVertical: 16,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
              }}
              activeOpacity={0.8}
            >
              <Ionicons name="play-circle" size={24} color="#ffffff" />
              <Text style={{ color: '#ffffff', fontSize: 16, fontWeight: '700', marginLeft: 10 }}>
                Practice This Shloka
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
