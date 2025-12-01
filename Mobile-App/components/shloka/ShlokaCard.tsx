import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ShlokaData } from '../../data/shlokas';

interface ShlokaCardProps {
  shloka: ShlokaData;
  onPress: (shloka: ShlokaData) => void;
  compact?: boolean;
}

export default function ShlokaCard({ shloka, onPress, compact = false }: ShlokaCardProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return '#22c55e';
      case 'intermediate':
        return '#f59e0b';
      case 'advanced':
        return '#ef4444';
      case 'expert':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  if (compact) {
    return (
      <TouchableOpacity
        onPress={() => onPress(shloka)}
        activeOpacity={0.7}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 12,
          padding: 14,
          marginBottom: 10,
          borderWidth: 1,
          borderColor: '#f3f4f6',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        {/* Color indicator */}
        <View
          style={{
            width: 4,
            height: 40,
            backgroundColor: shloka.thumbnailColor,
            borderRadius: 2,
            marginRight: 12,
          }}
        />

        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: '#1f2937', marginBottom: 2 }}>
            {shloka.title}
          </Text>
          <Text style={{ fontSize: 12, color: '#9ca3af' }}>
            {shloka.source}
          </Text>
        </View>

        <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={() => onPress(shloka)}
      activeOpacity={0.7}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 18,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#f3f4f6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
      }}
    >
      {/* Header Row */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
        {/* Left color accent */}
        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            backgroundColor: `${shloka.thumbnailColor}15`,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 14,
          }}
        >
          <Text style={{ fontSize: 24 }}>
            {shloka.category === 'Vedic Mantras' ? '🕉️' : 
             shloka.category === 'Devotional' ? '🙏' : 
             shloka.category === 'Upanishadic' ? '📿' : '✨'}
          </Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#1f2937', marginBottom: 2 }}>
            {shloka.title}
          </Text>
          <Text style={{ fontSize: 14, color: '#6b7280', fontWeight: '500' }}>
            {shloka.subtitle}
          </Text>
        </View>

        {/* Difficulty badge */}
        <View
          style={{
            backgroundColor: `${getDifficultyColor(shloka.difficulty)}15`,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 6,
          }}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: '600',
              color: getDifficultyColor(shloka.difficulty),
              textTransform: 'capitalize',
            }}
          >
            {shloka.difficulty}
          </Text>
        </View>
      </View>

      {/* Sanskrit Preview */}
      <View
        style={{
          backgroundColor: '#fffbf5',
          borderRadius: 10,
          padding: 12,
          marginBottom: 12,
          borderLeftWidth: 3,
          borderLeftColor: shloka.thumbnailColor,
        }}
      >
        <Text
          style={{
            fontSize: 15,
            color: '#92400e',
            fontWeight: '500',
            lineHeight: 24,
          }}
          numberOfLines={2}
        >
          {shloka.lines[0]?.text || ''}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: '#b45309',
            fontStyle: 'italic',
            marginTop: 4,
          }}
        >
          {shloka.lines[0]?.transliteration || ''}
        </Text>
      </View>

      {/* Meta Row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Ionicons name="book-outline" size={14} color="#9ca3af" />
          <Text style={{ fontSize: 12, color: '#9ca3af', marginLeft: 4 }}>
            {shloka.source}
          </Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="musical-notes-outline" size={14} color="#9ca3af" />
            <Text style={{ fontSize: 12, color: '#9ca3af', marginLeft: 4 }}>
              {shloka.lines.length} verses
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="star" size={14} color="#fbbf24" />
            <Text style={{ fontSize: 12, color: '#6b7280', marginLeft: 4, fontWeight: '500' }}>
              {shloka.rating}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}
