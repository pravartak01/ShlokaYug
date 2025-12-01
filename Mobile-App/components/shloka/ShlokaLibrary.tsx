import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ALL_SHLOKAS, 
  ShlokaData,
} from '../../data/shlokas';
import ShlokaCard from './ShlokaCard';
import ShlokaDetailModal from './ShlokaDetailModal';

interface ShlokaLibraryProps {
  initialCategory?: string;
}

export default function ShlokaLibrary({ initialCategory = 'all' }: ShlokaLibraryProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedShloka, setSelectedShloka] = useState<ShlokaData | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Categories with proper icons
  const categories = [
    { id: 'all', name: 'All', icon: 'grid-outline' as const },
    { id: 'vedic', name: 'Vedic', icon: 'book-outline' as const },
    { id: 'upanishadic', name: 'Upanishadic', icon: 'leaf-outline' as const },
    { id: 'devotional', name: 'Devotional', icon: 'heart-outline' as const },
  ];

  // Filter and search shlokas
  const filteredShlokas = useMemo(() => {
    let result = ALL_SHLOKAS;

    // Filter by category
    if (selectedCategory !== 'all') {
      result = result.filter(shloka => 
        shloka.category.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(shloka =>
        shloka.title.toLowerCase().includes(query) ||
        shloka.subtitle.includes(searchQuery) ||
        shloka.source.toLowerCase().includes(query) ||
        shloka.tags.some(tag => tag.toLowerCase().includes(query)) ||
        shloka.description.toLowerCase().includes(query)
      );
    }

    return result;
  }, [selectedCategory, searchQuery]);

  const handleShlokaPress = useCallback((shloka: ShlokaData) => {
    setSelectedShloka(shloka);
    setIsModalVisible(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalVisible(false);
    setTimeout(() => setSelectedShloka(null), 300);
  }, []);

  const renderHeader = () => (
    <View style={{ marginBottom: 16 }}>
      {/* Stats Row */}
      <View 
        style={{ 
          flexDirection: 'row', 
          paddingHorizontal: 16,
          marginBottom: 8,
        }}
      >
        <View 
          style={{ 
            flex: 1, 
            backgroundColor: '#fef7f0', 
            borderRadius: 12, 
            padding: 14,
            marginRight: 8,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#ea580c' }}>
            {ALL_SHLOKAS.length}
          </Text>
          <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Total Shlokas</Text>
        </View>
        <View 
          style={{ 
            flex: 1, 
            backgroundColor: '#f0fdf4', 
            borderRadius: 12, 
            padding: 14,
            marginRight: 8,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#22c55e' }}>
            {categories.length - 1}
          </Text>
          <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Categories</Text>
        </View>
        <View 
          style={{ 
            flex: 1, 
            backgroundColor: '#faf5ff', 
            borderRadius: 12, 
            padding: 14,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#a855f7' }}>
            {filteredShlokas.length}
          </Text>
          <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Showing</Text>
        </View>
      </View>

      {/* Section title */}
      <View style={{ paddingHorizontal: 16, marginTop: 12 }}>
        <Text style={{ fontSize: 13, fontWeight: '600', color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase' }}>
          {selectedCategory === 'all' ? 'All Shlokas' : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Shlokas`}
        </Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 60, paddingHorizontal: 40 }}>
      <View 
        style={{ 
          width: 80, 
          height: 80, 
          borderRadius: 40, 
          backgroundColor: '#f3f4f6', 
          alignItems: 'center', 
          justifyContent: 'center',
          marginBottom: 20,
        }}
      >
        <Ionicons name="search-outline" size={36} color="#9ca3af" />
      </View>
      <Text style={{ fontSize: 18, fontWeight: '600', color: '#4b5563', marginBottom: 8, textAlign: 'center' }}>
        No Shlokas Found
      </Text>
      <Text style={{ fontSize: 14, color: '#9ca3af', textAlign: 'center', lineHeight: 22 }}>
        Try adjusting your search or filter to find what you are looking for.
      </Text>
      <TouchableOpacity
        onPress={() => {
          setSearchQuery('');
          setSelectedCategory('all');
        }}
        style={{
          marginTop: 20,
          paddingHorizontal: 24,
          paddingVertical: 12,
          backgroundColor: '#f97316',
          borderRadius: 10,
        }}
      >
        <Text style={{ color: '#ffffff', fontWeight: '600' }}>Clear Filters</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a1a" />
      
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <LinearGradient
          colors={['#1a1a1a', '#2d2d2d']}
          style={{ paddingBottom: 20, paddingHorizontal: 16 }}
        >
          {/* Top Bar */}
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 8, paddingBottom: 16 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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

            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={{ fontSize: 22, fontWeight: '800', color: '#ffffff' }}>
                Shloka Library
              </Text>
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>
                Discover ancient wisdom
              </Text>
            </View>

            <TouchableOpacity
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(255,255,255,0.1)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="bookmark-outline" size={22} color="#ffffff" />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.12)',
              borderRadius: 14,
              paddingHorizontal: 14,
              height: 50,
            }}
          >
            <Ionicons name="search-outline" size={20} color="rgba(255,255,255,0.6)" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search shlokas, mantras..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              style={{
                flex: 1,
                marginLeft: 10,
                fontSize: 15,
                color: '#ffffff',
              }}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.6)" />
              </TouchableOpacity>
            )}
          </View>

          {/* Category Pills */}
          <View style={{ flexDirection: 'row', marginTop: 16, gap: 8 }}>
            {categories.map(category => (
              <TouchableOpacity
                key={category.id}
                onPress={() => setSelectedCategory(category.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 14,
                  paddingVertical: 10,
                  borderRadius: 10,
                  backgroundColor: selectedCategory === category.id 
                    ? '#f97316' 
                    : 'rgba(255,255,255,0.1)',
                }}
              >
                <Ionicons 
                  name={category.icon} 
                  size={16} 
                  color={selectedCategory === category.id ? '#ffffff' : 'rgba(255,255,255,0.7)'} 
                />
                <Text 
                  style={{ 
                    marginLeft: 6, 
                    fontSize: 13, 
                    fontWeight: '600',
                    color: selectedCategory === category.id ? '#ffffff' : 'rgba(255,255,255,0.7)',
                  }}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </LinearGradient>

        {/* Shloka List */}
        <FlatList
          data={filteredShlokas}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={{ paddingHorizontal: 16 }}>
              <ShlokaCard shloka={item} onPress={handleShlokaPress} />
            </View>
          )}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={{ 
            paddingTop: 16, 
            paddingBottom: 100,
            flexGrow: filteredShlokas.length === 0 ? 1 : undefined,
          }}
          showsVerticalScrollIndicator={false}
        />

        {/* Detail Modal */}
        <ShlokaDetailModal
          visible={isModalVisible}
          shloka={selectedShloka}
          onClose={handleCloseModal}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
