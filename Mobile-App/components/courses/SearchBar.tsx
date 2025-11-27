/**
 * SearchBar Component
 * Reusable search bar with filter button
 */

import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

export default function SearchBar({ 
  value, 
  onChangeText, 
  placeholder = 'Search courses...' 
}: SearchBarProps) {
  return (
    <View className="flex-row items-center bg-white rounded-xl px-4 shadow-sm border border-gray-200">
      <Ionicons name="search" size={20} color="#6b7280" />
      
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        className="flex-1 py-3 px-3 text-gray-800 text-base"
      />

      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText('')}>
          <Ionicons name="close-circle" size={20} color="#9ca3af" />
        </TouchableOpacity>
      )}
    </View>
  );
}
