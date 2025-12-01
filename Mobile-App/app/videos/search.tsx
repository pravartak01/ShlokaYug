import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import videoService, { Video } from '../../services/videoService';

const CATEGORIES = [
  { id: 'all', name: 'All', icon: 'apps' },
  { id: 'sanskrit', name: 'Sanskrit', icon: 'book' },
  { id: 'chandas', name: 'Chandas', icon: 'musical-notes' },
  { id: 'spiritual', name: 'Spiritual', icon: 'flower' },
  { id: 'educational', name: 'Educational', icon: 'school' },
  { id: 'tutorials', name: 'Tutorials', icon: 'bulb' },
];

export default function SearchScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Video[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'views' | 'date'>('relevance');

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      const params: any = {
        q: searchQuery,
        sortBy,
        limit: 50,
      };

      if (selectedCategory !== 'all') {
        params.category = selectedCategory;
      }

      const response = await videoService.searchVideos(params);
      setResults(response.data?.videos || response.videos || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatViews = (views: number): string => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderVideoItem = ({ item }: { item: Video }) => (
    <TouchableOpacity
      onPress={() => router.push(`/videos/${item._id}`)}
      className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-200 mb-3"
    >
      <View className="relative">
        <Image
          source={{ uri: item.video.thumbnail.url }}
          className="w-full h-48"
          resizeMode="cover"
        />
        <View className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded">
          <Text className="text-white text-xs font-semibold">
            {formatDuration(item.video.duration)}
          </Text>
        </View>
        {item.type === 'short' && (
          <View className="absolute top-2 left-2 bg-orange-500 px-2 py-1 rounded-full">
            <Text className="text-white text-xs font-bold">SHORT</Text>
          </View>
        )}
      </View>

      <View className="p-3">
        <Text className="text-gray-900 font-semibold text-base" numberOfLines={2}>
          {item.title}
        </Text>
        <View className="flex-row items-center mt-2">
          <Text className="text-gray-600 text-sm">{item.creator.displayName}</Text>
          <View className="w-1 h-1 bg-gray-400 rounded-full mx-2" />
          <Text className="text-gray-600 text-sm">{formatViews(item.metrics.views)} views</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 py-2">
            <Ionicons name="search" size={20} color="#6b7280" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search videos..."
              placeholderTextColor="#9ca3af"
              className="flex-1 ml-2 text-gray-900"
              autoFocus
              onSubmitEditing={handleSearch}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#6b7280" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="bg-white border-b border-gray-200 px-4 py-3"
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            onPress={() => setSelectedCategory(cat.id)}
            className={`mr-2 px-4 py-2 rounded-full flex-row items-center ${
              selectedCategory === cat.id
                ? 'bg-orange-500'
                : 'bg-gray-100 border border-gray-300'
            }`}
          >
            <Ionicons
              name={cat.icon as any}
              size={16}
              color={selectedCategory === cat.id ? 'white' : '#6b7280'}
            />
            <Text
              className={`ml-2 font-semibold ${
                selectedCategory === cat.id ? 'text-white' : 'text-gray-700'
              }`}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sort Options */}
      <View className="bg-white border-b border-gray-200 px-4 py-2 flex-row items-center">
        <Ionicons name="swap-vertical" size={16} color="#6b7280" />
        <Text className="text-gray-600 text-sm ml-2 mr-3">Sort by:</Text>
        {(['relevance', 'views', 'date'] as const).map((sort) => (
          <TouchableOpacity
            key={sort}
            onPress={() => setSortBy(sort)}
            className={`mr-2 px-3 py-1 rounded-full ${
              sortBy === sort ? 'bg-orange-100' : 'bg-transparent'
            }`}
          >
            <Text
              className={`text-sm font-semibold capitalize ${
                sortBy === sort ? 'text-orange-600' : 'text-gray-600'
              }`}
            >
              {sort}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Results */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#f97316" />
          <Text className="text-gray-600 mt-3">Searching...</Text>
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          renderItem={renderVideoItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        />
      ) : searchQuery.length > 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="search-outline" size={64} color="#d1d5db" />
          <Text className="text-gray-500 text-lg font-medium mt-4 text-center">
            No results found
          </Text>
          <Text className="text-gray-400 text-sm mt-2 text-center">
            Try searching with different keywords
          </Text>
        </View>
      ) : (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="search" size={64} color="#d1d5db" />
          <Text className="text-gray-500 text-lg font-medium mt-4 text-center">
            Search for videos
          </Text>
          <Text className="text-gray-400 text-sm mt-2 text-center">
            Find tutorials, shorts, and educational content
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}
