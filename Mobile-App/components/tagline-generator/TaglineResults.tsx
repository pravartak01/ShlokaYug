import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Share,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GeneratedTagline, TaglineResult } from '../../services/taglineService';

interface TaglineResultsProps {
  result: TaglineResult;
  onReset: () => void;
}

interface TaglineCardProps {
  tagline: GeneratedTagline;
  index: number;
  onCopy: () => void;
  onShare: () => void;
  onFavorite: () => void;
  isFavorite: boolean;
}

function TaglineCard({ tagline, index, onCopy, onShare, onFavorite, isFavorite }: TaglineCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 150,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 8,
        delay: index * 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim, index]);

  const cardColors: [string, string][] = [
    ['#fef3c7', '#fde68a'],
    ['#fee2e2', '#fecaca'],
    ['#e0e7ff', '#c7d2fe'],
    ['#d1fae5', '#a7f3d0'],
    ['#fce7f3', '#fbcfe8'],
  ];

  const accentColors = ['#d97706', '#dc2626', '#4f46e5', '#059669', '#db2777'];
  const colorIndex = index % cardColors.length;

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
        marginBottom: 16,
      }}
    >
      <View
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 20,
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          elevation: 5,
        }}
      >
        {/* Gradient Header */}
        <LinearGradient
          colors={cardColors[colorIndex]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ padding: 20 }}
        >
          {/* Sanskrit Text */}
          <Text
            style={{
              fontSize: 28,
              fontWeight: '700',
              color: '#1f2937',
              textAlign: 'center',
              letterSpacing: 1,
              marginBottom: 8,
            }}
          >
            {tagline.sanskrit}
          </Text>

          {/* Transliteration */}
          <Text
            style={{
              fontSize: 16,
              color: accentColors[colorIndex],
              textAlign: 'center',
              fontStyle: 'italic',
              fontWeight: '500',
            }}
          >
            {tagline.transliteration}
          </Text>
        </LinearGradient>

        {/* Content */}
        <View style={{ padding: 20 }}>
          {/* Meaning */}
          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  backgroundColor: cardColors[colorIndex][0],
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 10,
                }}
              >
                <Ionicons name="language-outline" size={16} color={accentColors[colorIndex]} />
              </View>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Meaning
              </Text>
            </View>
            <Text style={{ fontSize: 16, color: '#374151', fontWeight: '500', lineHeight: 24 }}>
              &ldquo;{tagline.meaning}&rdquo;
            </Text>
          </View>

          {/* Expandable Details */}
          <TouchableOpacity
            onPress={() => setExpanded(!expanded)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 12,
              borderTopWidth: 1,
              borderTopColor: '#f3f4f6',
              marginBottom: expanded ? 16 : 0,
            }}
          >
            <Text style={{ fontSize: 13, color: accentColors[colorIndex], fontWeight: '600', marginRight: 6 }}>
              {expanded ? 'Show Less' : 'Show More Details'}
            </Text>
            <Ionicons
              name={expanded ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={accentColors[colorIndex]}
            />
          </TouchableOpacity>

          {expanded && (
            <View>
              {/* Explanation */}
              <View style={{ marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      backgroundColor: cardColors[colorIndex][0],
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 10,
                    }}
                  >
                    <Ionicons name="book-outline" size={16} color={accentColors[colorIndex]} />
                  </View>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Explanation
                  </Text>
                </View>
                <Text style={{ fontSize: 14, color: '#6b7280', lineHeight: 22 }}>
                  {tagline.explanation}
                </Text>
              </View>

              {/* Relevance */}
              <View
                style={{
                  backgroundColor: cardColors[colorIndex][0],
                  borderRadius: 12,
                  padding: 14,
                  borderLeftWidth: 4,
                  borderLeftColor: accentColors[colorIndex],
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <Ionicons name="checkmark-circle" size={18} color={accentColors[colorIndex]} style={{ marginRight: 8 }} />
                  <Text style={{ fontSize: 12, fontWeight: '700', color: accentColors[colorIndex], textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Why This Fits Your Brand
                  </Text>
                </View>
                <Text style={{ fontSize: 13, color: '#4b5563', lineHeight: 20 }}>
                  {tagline.relevance}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View
          style={{
            flexDirection: 'row',
            borderTopWidth: 1,
            borderTopColor: '#f3f4f6',
          }}
        >
          <TouchableOpacity
            onPress={onFavorite}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 14,
              borderRightWidth: 1,
              borderRightColor: '#f3f4f6',
            }}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={18}
              color={isFavorite ? '#ef4444' : '#9ca3af'}
              style={{ marginRight: 6 }}
            />
            <Text style={{ fontSize: 13, color: isFavorite ? '#ef4444' : '#6b7280', fontWeight: '500' }}>
              {isFavorite ? 'Saved' : 'Save'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onCopy}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 14,
              borderRightWidth: 1,
              borderRightColor: '#f3f4f6',
            }}
          >
            <Ionicons name="copy-outline" size={18} color="#9ca3af" style={{ marginRight: 6 }} />
            <Text style={{ fontSize: 13, color: '#6b7280', fontWeight: '500' }}>Copy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onShare}
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 14,
            }}
          >
            <Ionicons name="share-outline" size={18} color="#9ca3af" style={{ marginRight: 6 }} />
            <Text style={{ fontSize: 13, color: '#6b7280', fontWeight: '500' }}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

export default function TaglineResults({ result, onReset }: TaglineResultsProps) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(headerAnim, {
      toValue: 1,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [headerAnim]);

  const handleCopy = async (tagline: GeneratedTagline) => {
    const text = `${tagline.sanskrit}\n${tagline.transliteration}\n"${tagline.meaning}"`;
    // Using Share API as cross-platform clipboard solution
    try {
      await Share.share({ message: text });
    } catch {
      Alert.alert('Copied!', 'Tagline ready to share', [{ text: 'OK' }]);
    }
  };

  const handleShare = async (tagline: GeneratedTagline) => {
    try {
      await Share.share({
        message: `✨ Sanskrit Tagline for ${result.companyName}\n\n${tagline.sanskrit}\n${tagline.transliteration}\n\n"${tagline.meaning}"\n\n${tagline.explanation}\n\nGenerated with ShlokaYug`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleFavorite = (taglineId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(taglineId)) {
        newFavorites.delete(taglineId);
      } else {
        newFavorites.add(taglineId);
      }
      return newFavorites;
    });
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* Success Header */}
      <Animated.View
        style={{
          transform: [{ scale: headerAnim }],
          opacity: headerAnim,
          marginBottom: 24,
        }}
      >
        <LinearGradient
          colors={['#dcfce7', '#bbf7d0', '#86efac']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: 20,
            padding: 24,
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: '#22c55e',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
              shadowColor: '#22c55e',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Ionicons name="checkmark" size={36} color="#ffffff" />
          </View>

          <Text style={{ fontSize: 20, fontWeight: '700', color: '#166534', marginBottom: 8 }}>
            Taglines Generated!
          </Text>
          <Text style={{ fontSize: 14, color: '#15803d', textAlign: 'center', lineHeight: 20 }}>
            {result.taglines.length} unique Sanskrit taglines created for{'\n'}
            <Text style={{ fontWeight: '700' }}>{result.companyName}</Text>
          </Text>
        </LinearGradient>
      </Animated.View>

      {/* Tagline Cards */}
      {result.taglines.map((tagline, index) => (
        <TaglineCard
          key={tagline.id}
          tagline={tagline}
          index={index}
          onCopy={() => handleCopy(tagline)}
          onShare={() => handleShare(tagline)}
          onFavorite={() => handleFavorite(tagline.id)}
          isFavorite={favorites.has(tagline.id)}
        />
      ))}

      {/* Generate More Button */}
      <TouchableOpacity
        onPress={onReset}
        activeOpacity={0.8}
        style={{ marginTop: 8 }}
      >
        <LinearGradient
          colors={['#1f2937', '#374151', '#4b5563']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 18,
            borderRadius: 16,
          }}
        >
          <Ionicons name="refresh" size={22} color="#ffffff" style={{ marginRight: 10 }} />
          <Text style={{ fontSize: 17, fontWeight: '700', color: '#ffffff' }}>
            Generate New Taglines
          </Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Share All Button */}
      <TouchableOpacity
        onPress={async () => {
          const allTaglines = result.taglines
            .map((t, i) => `${i + 1}. ${t.sanskrit}\n   ${t.transliteration}\n   "${t.meaning}"`)
            .join('\n\n');
          
          await Share.share({
            message: `✨ Sanskrit Taglines for ${result.companyName}\n\n${allTaglines}\n\nGenerated with ShlokaYug`,
          });
        }}
        activeOpacity={0.8}
        style={{
          marginTop: 12,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 16,
          borderRadius: 16,
          borderWidth: 2,
          borderColor: '#e5e7eb',
          backgroundColor: '#ffffff',
        }}
      >
        <Ionicons name="share-social-outline" size={20} color="#6b7280" style={{ marginRight: 8 }} />
        <Text style={{ fontSize: 15, fontWeight: '600', color: '#6b7280' }}>
          Share All Taglines
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
