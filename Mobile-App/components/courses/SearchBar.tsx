/**
 * SearchBar Component - Modern Indigo Theme
 * Reusable search bar with clear button and smooth animations
 */

import React, { useRef, useState } from 'react';
import { View, TextInput, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export default function SearchBar({ 
  value, 
  onChangeText, 
  placeholder = 'Search courses, topics, instructors...' 
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const borderAnim = useRef(new Animated.Value(0)).current;
  const clearButtonAnim = useRef(new Animated.Value(0)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.spring(borderAnim, {
      toValue: 1,
      friction: 8,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.spring(borderAnim, {
      toValue: 0,
      friction: 8,
      useNativeDriver: false,
    }).start();
  };

  // Animate clear button
  React.useEffect(() => {
    Animated.spring(clearButtonAnim, {
      toValue: value.length > 0 ? 1 : 0,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [value.length, clearButtonAnim]);

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#e5e7eb', '#6366f1'],
  });

  const shadowOpacity = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.05, 0.15],
  });

  return (
    <Animated.View 
      className="flex-1 flex-row items-center bg-white rounded-xl ml-2"
      style={{
        borderWidth: 1.5,
        borderColor,
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity,
        shadowRadius: 8,
        elevation: isFocused ? 4 : 2,
      }}
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        className="flex-1 py-3 px-2 text-gray-800 text-base"
        returnKeyType="search"
      />

      <Animated.View
        style={{
          opacity: clearButtonAnim,
          transform: [{ scale: clearButtonAnim }],
        }}
      >
        {value.length > 0 && (
          <TouchableOpacity 
            onPress={() => onChangeText('')}
            className="p-2 mr-1"
            activeOpacity={0.7}
          >
            <View className="w-6 h-6 bg-gray-100 rounded-full items-center justify-center">
              <Ionicons name="close" size={14} color="#6b7280" />
            </View>
          </TouchableOpacity>
        )}
      </Animated.View>
    </Animated.View>
  );
}
