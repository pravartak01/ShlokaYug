import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Animated,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import {
  ShlokaData,
  ALL_SHLOKAS,
  SHLOKA_CATEGORIES,
  DIFFICULTY_LEVELS,
  FEATURED_SHLOKAS,
  searchShlokas,
} from '../../../data/shlokas';
import { hasAudio, getAudioUrl } from '../../../data/shlokaAudioMap';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;

interface ShlokaListProps {
  onSelectShloka: (shloka: ShlokaData) => void;
}

const ShlokaList: React.FC<ShlokaListProps> = ({ onSelectShloka }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  
  // Audio preview state
  const [previewSound, setPreviewSound] = useState<Audio.Sound | null>(null);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  
  const scrollY = useRef(new Animated.Value(0)).current;

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (previewSound) {
        previewSound.unloadAsync();
      }
    };
  }, [previewSound]);

  // Audio preview function
  const handleAudioPreview = async (shloka: ShlokaData) => {
    try {
      const audioUrl = getAudioUrl(shloka.id);
      if (!audioUrl) {
        console.log('No audio available for this shloka');
        return;
      }

      // If already previewing this shloka, stop it
      if (previewingId === shloka.id) {
        if (previewSound) {
          await previewSound.stopAsync();
          await previewSound.unloadAsync();
        }
        setPreviewSound(null);
        setPreviewingId(null);
        return;
      }

      // Stop any existing preview
      if (previewSound) {
        await previewSound.stopAsync();
        await previewSound.unloadAsync();
      }

      setIsLoadingAudio(true);
      setPreviewingId(shloka.id);

      // Setup audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      // Load and play audio from URL
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded && status.didJustFinish) {
            // Audio finished playing - reset state
            setPreviewingId(null);
            setPreviewSound(null);
          }
        }
      );
      
      setPreviewSound(sound);
      setIsLoadingAudio(false);

    } catch (error) {
      console.error('Error playing audio preview:', error);
      setIsLoadingAudio(false);
      setPreviewingId(null);
    }
  };

  // Filter shlokas
  const filteredShlokas = React.useMemo(() => {
    let result = ALL_SHLOKAS;
    
    if (searchQuery) {
      result = searchShlokas(searchQuery);
    }
    
    if (selectedCategory !== 'all') {
      result = result.filter((s) =>
        s.category.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }
    
    if (selectedDifficulty !== 'all') {
      result = result.filter((s) => s.difficulty === selectedDifficulty);
    }
    
    return result;
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCount = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  // Featured Carousel Item
  const renderFeaturedItem = ({ item, index }: { item: ShlokaData; index: number }) => (
    <TouchableOpacity
      style={styles.featuredCard}
      onPress={() => onSelectShloka(item)}
      activeOpacity={0.9}
    >
      <LinearGradient
        colors={[item.thumbnailColor, item.thumbnailColor + '99', '#1a1a2e']}
        style={styles.featuredGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Decorative Elements */}
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />
        
        <View style={styles.featuredContent}>
          {/* Category Badge */}
          <View style={styles.categoryBadge}>
            <MaterialCommunityIcons name="bookmark" size={12} color="#fff" />
            <Text style={styles.categoryBadgeText}>{item.category}</Text>
          </View>
          
          <View style={styles.featuredMain}>
            <Text style={styles.featuredTitle}>{item.title}</Text>
            <Text style={styles.featuredSubtitle}>{item.subtitle}</Text>
            <Text style={styles.featuredSource}>{item.source}</Text>
          </View>

          <View style={styles.featuredFooter}>
            <View style={styles.featuredStats}>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="clock-outline" size={14} color="#fff" />
                <Text style={styles.statText}>{formatDuration(item.duration)}</Text>
              </View>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="account-group" size={14} color="#fff" />
                <Text style={styles.statText}>{formatCount(item.practiceCount)}</Text>
              </View>
              <View style={styles.statItem}>
                <MaterialCommunityIcons name="star" size={14} color="#FFD700" />
                <Text style={styles.statText}>{item.rating}</Text>
              </View>
            </View>
            
            <View style={styles.playNowButton}>
              <MaterialCommunityIcons name="play" size={20} color={item.thumbnailColor} />
              <Text style={[styles.playNowText, { color: item.thumbnailColor }]}>
                Practice
              </Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  // Shloka List Item
  const renderShlokaItem = ({ item, index }: { item: ShlokaData; index: number }) => {
    const difficultyColor = DIFFICULTY_LEVELS.find((d) => d.id === item.difficulty)?.color || '#888';
    const audioAvailable = hasAudio(item.id);
    const isPreviewing = previewingId === item.id;
    
    return (
      <TouchableOpacity
        style={styles.shlokaCard}
        onPress={() => onSelectShloka(item)}
        activeOpacity={0.8}
      >
        {/* Thumbnail */}
        <View style={[styles.shlokaThumb, { backgroundColor: item.thumbnailColor + '20' }]}>
          <MaterialCommunityIcons
            name="music-note"
            size={28}
            color={item.thumbnailColor}
          />
          <View style={[styles.durationBadge, { backgroundColor: item.thumbnailColor }]}>
            <Text style={styles.durationText}>{formatDuration(item.duration)}</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.shlokaContent}>
          <View style={styles.shlokaHeader}>
            <Text style={styles.shlokaTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={[styles.difficultyDot, { backgroundColor: difficultyColor }]} />
          </View>
          
          <Text style={styles.shlokaSubtitle} numberOfLines={1}>
            {item.subtitle}
          </Text>
          
          <View style={styles.shlokaMeta}>
            <Text style={styles.shlokaSource}>{item.source}</Text>
            <View style={styles.shlokaStats}>
              <MaterialCommunityIcons name="account-group" size={12} color="#888" />
              <Text style={styles.shlokaStatText}>{formatCount(item.practiceCount)}</Text>
              <MaterialCommunityIcons name="star" size={12} color="#FFD700" />
              <Text style={styles.shlokaStatText}>{item.rating}</Text>
            </View>
          </View>

          {/* Tags & Audio Badge */}
          <View style={styles.tagsContainer}>
            {item.tags.slice(0, 2).map((tag, idx) => (
              <View key={idx} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {audioAvailable && (
              <View style={[styles.tag, styles.audioTag]}>
                <MaterialCommunityIcons name="headphones" size={10} color="#4CAF50" />
                <Text style={[styles.tagText, { color: '#4CAF50', marginLeft: 2 }]}>Audio</Text>
              </View>
            )}
          </View>
        </View>

        {/* Buttons Container */}
        <View style={styles.buttonsContainer}>
          {/* Audio Preview Button */}
          {audioAvailable && (
            <TouchableOpacity
              style={[
                styles.listenButton, 
                isPreviewing && styles.listenButtonActive
              ]}
              onPress={() => handleAudioPreview(item)}
            >
              {isLoadingAudio && previewingId === item.id ? (
                <ActivityIndicator size="small" color="#4CAF50" />
              ) : (
                <MaterialCommunityIcons 
                  name={isPreviewing ? "stop" : "headphones"} 
                  size={18} 
                  color={isPreviewing ? "#fff" : "#4CAF50"} 
                />
              )}
            </TouchableOpacity>
          )}
          
          {/* Play/Practice Button */}
          <TouchableOpacity
            style={[styles.playButton, { backgroundColor: item.thumbnailColor }]}
            onPress={() => onSelectShloka(item)}
          >
            <MaterialCommunityIcons name="play" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  // Category Filter Item
  const renderCategoryItem = ({ item }: { item: typeof SHLOKA_CATEGORIES[0] }) => (
    <TouchableOpacity
      style={[
        styles.filterChip,
        selectedCategory === item.id && styles.filterChipActive,
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <MaterialCommunityIcons
        name={item.icon as any}
        size={16}
        color={selectedCategory === item.id ? '#fff' : '#666'}
      />
      <Text
        style={[
          styles.filterChipText,
          selectedCategory === item.id && styles.filterChipTextActive,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={22} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search shlokas, mantras..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <MaterialCommunityIcons name="close-circle" size={20} color="#888" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.filterButton, showFilters && styles.filterButtonActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <MaterialCommunityIcons
            name="tune-vertical"
            size={22}
            color={showFilters ? '#fff' : '#666'}
          />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      {showFilters && (
        <View style={styles.filtersContainer}>
          <Text style={styles.filterLabel}>Difficulty</Text>
          <View style={styles.difficultyFilters}>
            {DIFFICULTY_LEVELS.map((level) => (
              <TouchableOpacity
                key={level.id}
                style={[
                  styles.difficultyChip,
                  selectedDifficulty === level.id && { backgroundColor: level.color },
                ]}
                onPress={() => setSelectedDifficulty(level.id)}
              >
                <Text
                  style={[
                    styles.difficultyChipText,
                    selectedDifficulty === level.id && styles.difficultyChipTextActive,
                  ]}
                >
                  {level.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* Categories */}
        <FlatList
          data={SHLOKA_CATEGORIES}
          renderItem={renderCategoryItem}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />

        {/* Featured Section */}
        {!searchQuery && selectedCategory === 'all' && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>✨ Featured</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={FEATURED_SHLOKAS}
              renderItem={renderFeaturedItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              pagingEnabled
              snapToInterval={CARD_WIDTH + 16}
              decelerationRate="fast"
              contentContainerStyle={styles.featuredList}
            />
          </View>
        )}

        {/* All Shlokas */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              🎵 {selectedCategory === 'all' ? 'All Shlokas' : selectedCategory}
            </Text>
            <Text style={styles.countText}>{filteredShlokas.length} items</Text>
          </View>
          
          {filteredShlokas.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="music-note-off" size={48} color="#444" />
              <Text style={styles.emptyText}>No shlokas found</Text>
              <Text style={styles.emptySubtext}>Try a different search or filter</Text>
            </View>
          ) : (
            filteredShlokas.map((shloka, index) => (
              <View key={shloka.id}>
                {renderShlokaItem({ item: shloka, index })}
              </View>
            ))
          )}
        </View>

        <View style={{ height: 100 }} />
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1a',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
  },
  filterButton: {
    width: 48,
    height: 48,
    backgroundColor: '#1a1a2e',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#FF6B35',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  filterLabel: {
    fontSize: 12,
    color: '#888',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  difficultyFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  difficultyChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#1a1a2e',
  },
  difficultyChipText: {
    fontSize: 12,
    color: '#888',
  },
  difficultyChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  categoriesList: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1a1a2e',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#FF6B35',
  },
  filterChipText: {
    fontSize: 13,
    color: '#888',
  },
  filterChipTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  seeAllText: {
    fontSize: 14,
    color: '#FF6B35',
  },
  countText: {
    fontSize: 13,
    color: '#888',
  },
  featuredList: {
    paddingHorizontal: 16,
  },
  featuredCard: {
    width: CARD_WIDTH,
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 16,
  },
  featuredGradient: {
    flex: 1,
    padding: 20,
  },
  decorCircle1: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  decorCircle2: {
    position: 'absolute',
    bottom: -50,
    left: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  featuredContent: {
    flex: 1,
    justifyContent: 'space-between',
    zIndex: 1,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 10,
  },
  categoryBadgeText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
  },
  featuredMain: {
    marginVertical: 8,
  },
  featuredTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  featuredSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  featuredSource: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  featuredFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  featuredStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: '#fff',
  },
  playNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
  },
  playNowText: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  shlokaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
    borderRadius: 16,
  },
  shlokaThumb: {
    width: 70,
    height: 70,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  durationText: {
    fontSize: 9,
    color: '#fff',
    fontWeight: 'bold',
  },
  shlokaContent: {
    flex: 1,
    marginLeft: 14,
  },
  shlokaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  shlokaTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  shlokaSubtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  shlokaMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  shlokaSource: {
    fontSize: 11,
    color: '#666',
  },
  shlokaStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  shlokaStatText: {
    fontSize: 11,
    color: '#888',
    marginRight: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 6,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#252540',
    borderRadius: 8,
  },
  tagText: {
    fontSize: 10,
    color: '#888',
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  listenButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  listenButtonActive: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  audioTag: {
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#444',
    marginTop: 4,
  },
});

export default ShlokaList;
