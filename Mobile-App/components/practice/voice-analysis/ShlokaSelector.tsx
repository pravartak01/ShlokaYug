// ShlokaSelector Component - Select shloka for voice analysis
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ShlokaForAnalysis } from '../../../types/voiceAnalysis';

// Shlokas available for voice analysis
export const ANALYSIS_SHLOKAS: ShlokaForAnalysis[] = [
  {
    id: 'gayatri-mantra',
    title: 'Gayatri Mantra',
    subtitle: 'The most sacred Vedic mantra',
    devanagariText: 'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात्',
    transliteration: 'Om Bhur Bhuvah Svah Tat Savitur Varenyam Bhargo Devasya Dhimahi Dhiyo Yo Nah Prachodayat',
    chandas: 'Gayatri',
    expectedDuration: 25000,
  },
  {
    id: 'mahamrityunjaya',
    title: 'Mahamrityunjaya Mantra',
    subtitle: 'The Great Death-conquering Mantra',
    devanagariText: 'ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय माऽमृतात्',
    transliteration: 'Om Tryambakam Yajamahe Sugandhim Pushti-Vardhanam Urvarukamiva Bandhanan Mrityor Mukshiya Maamritat',
    chandas: 'Anushtup',
    expectedDuration: 30000,
  },
  {
    id: 'shanti-mantra',
    title: 'Shanti Mantra',
    subtitle: 'Peace Invocation',
    devanagariText: 'ॐ सह नाववतु सह नौ भुनक्तु सह वीर्यं करवावहै तेजस्विनावधीतमस्तु मा विद्विषावहै ॐ शान्तिः शान्तिः शान्तिः',
    transliteration: 'Om Saha Navavatu Saha Nau Bhunaktu Saha Viryam Karavavahai Tejasvi Navadhitamastu Ma Vidvishavahai Om Shantih Shantih Shantih',
    chandas: 'Anushtup',
    expectedDuration: 35000,
  },
  {
    id: 'vakratunda',
    title: 'Vakratunda Mahakaya',
    subtitle: 'Ganesha Shloka',
    devanagariText: 'वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा',
    transliteration: 'Vakratunda Mahakaya Suryakoti Samaprabha Nirvighnam Kuru Me Deva Sarvakaryeshu Sarvada',
    chandas: 'Anushtup',
    expectedDuration: 20000,
  },
  {
    id: 'asato-ma',
    title: 'Asato Ma Sadgamaya',
    subtitle: 'Lead us from darkness to light',
    devanagariText: 'ॐ असतो मा सद्गमय तमसो मा ज्योतिर्गमय मृत्योर्मा अमृतं गमय ॐ शान्तिः शान्तिः शान्तिः',
    transliteration: 'Om Asato Ma Sadgamaya Tamaso Ma Jyotirgamaya Mrityorma Amritam Gamaya Om Shantih Shantih Shantih',
    chandas: 'Anushtup',
    expectedDuration: 28000,
  },
  {
    id: 'saraswati-vandana',
    title: 'Saraswati Vandana',
    subtitle: 'Goddess of Knowledge',
    devanagariText: 'या कुन्देन्दुतुषारहारधवला या शुभ्रवस्त्रावृता या वीणावरदण्डमण्डितकरा या श्वेतपद्मासना',
    transliteration: 'Ya Kundendu Tusharahara Dhavala Ya Shubhra Vastravrita Ya Veena Varadanda Mandita Kara Ya Shweta Padmasana',
    chandas: 'Mandakranta',
    expectedDuration: 25000,
  },
  {
    id: 'om-namah-shivaya',
    title: 'Om Namah Shivaya',
    subtitle: 'Panchakshari Mantra',
    devanagariText: 'ॐ नमः शिवाय',
    transliteration: 'Om Namah Shivaya',
    chandas: 'Simple',
    expectedDuration: 8000,
  },
  {
    id: 'guru-brahma',
    title: 'Guru Brahma',
    subtitle: 'Guru Shloka',
    devanagariText: 'गुरुर्ब्रह्मा गुरुर्विष्णुः गुरुर्देवो महेश्वरः गुरुः साक्षात् परं ब्रह्म तस्मै श्री गुरवे नमः',
    transliteration: 'Gurur Brahma Gurur Vishnu Gurur Devo Maheshwarah Guruh Sakshat Param Brahma Tasmai Shri Gurave Namah',
    chandas: 'Anushtup',
    expectedDuration: 22000,
  },
  {
    id: 'hare-krishna',
    title: 'Hare Krishna Mahamantra',
    subtitle: 'The Great Mantra',
    devanagariText: 'हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे हरे राम हरे राम राम राम हरे हरे',
    transliteration: 'Hare Krishna Hare Krishna Krishna Krishna Hare Hare Hare Rama Hare Rama Rama Rama Hare Hare',
    chandas: 'Simple',
    expectedDuration: 18000,
  },
  {
    id: 'surya-mantra',
    title: 'Surya Namaskar Mantra',
    subtitle: 'Sun Salutation',
    devanagariText: 'ॐ मित्राय नमः ॐ रवये नमः ॐ सूर्याय नमः ॐ भानवे नमः ॐ खगाय नमः ॐ पूष्णे नमः',
    transliteration: 'Om Mitraya Namah Om Ravaye Namah Om Suryaya Namah Om Bhanave Namah Om Khagaya Namah Om Pushne Namah',
    chandas: 'Simple',
    expectedDuration: 30000,
  },
];

interface ShlokaSelectorProps {
  onSelect: (shloka: ShlokaForAnalysis) => void;
  selectedShloka?: ShlokaForAnalysis;
}

export const ShlokaSelector: React.FC<ShlokaSelectorProps> = ({
  onSelect,
  selectedShloka,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All', icon: 'view-grid' },
    { id: 'vedic', name: 'Vedic', icon: 'book-open-variant' },
    { id: 'devotional', name: 'Devotional', icon: 'hands-pray' },
    { id: 'peace', name: 'Peace', icon: 'peace' },
  ];

  const filteredShlokas = ANALYSIS_SHLOKAS.filter((shloka) => {
    const matchesSearch = 
      shloka.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shloka.transliteration.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedCategory === 'all') return matchesSearch;
    // Add category filtering logic here
    return matchesSearch;
  });

  const getDifficultyColor = (duration: number) => {
    if (duration < 15000) return '#4CAF50';
    if (duration < 25000) return '#FF9800';
    return '#F44336';
  };

  const getDifficultyLabel = (duration: number) => {
    if (duration < 15000) return 'Easy';
    if (duration < 25000) return 'Medium';
    return 'Advanced';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Select Shloka</Text>
        <Text style={styles.subtitle}>Choose a shloka to practice and analyze</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color="rgba(255,255,255,0.5)" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search shlokas..."
          placeholderTextColor="rgba(255,255,255,0.4)"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialCommunityIcons name="close-circle" size={18} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
        contentContainerStyle={styles.categoriesContent}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            onPress={() => setSelectedCategory(category.id)}
            style={[
              styles.categoryChip,
              selectedCategory === category.id && styles.categoryChipActive,
            ]}
          >
            <MaterialCommunityIcons
              name={category.icon as keyof typeof MaterialCommunityIcons.glyphMap}
              size={16}
              color={selectedCategory === category.id ? 'white' : 'rgba(255,255,255,0.6)'}
            />
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Shloka List */}
      <ScrollView 
        showsVerticalScrollIndicator={false}
        style={styles.shlokaList}
        contentContainerStyle={styles.shlokaListContent}
      >
        {filteredShlokas.map((shloka) => (
          <TouchableOpacity
            key={shloka.id}
            onPress={() => onSelect(shloka)}
            activeOpacity={0.8}
          >
            <View
              style={[
                styles.shlokaCard,
                selectedShloka?.id === shloka.id && styles.shlokaCardSelected,
              ]}
            >
              <LinearGradient
                colors={
                  selectedShloka?.id === shloka.id
                    ? ['rgba(141,110,99,0.3)', 'rgba(109,76,65,0.3)'] as const
                    : ['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)'] as const
                }
                style={styles.shlokaCardGradient}
              >
                {/* Shloka Icon */}
                <View style={styles.shlokaIconContainer}>
                  <LinearGradient
                    colors={['#8D6E63', '#6D4C41'] as const}
                    style={styles.shlokaIcon}
                  >
                    <Text style={styles.shlokaIconText}>
                      {shloka.title.charAt(0)}
                    </Text>
                  </LinearGradient>
                </View>

                {/* Shloka Info */}
                <View style={styles.shlokaInfo}>
                  <Text style={styles.shlokaTitle}>{shloka.title}</Text>
                  <Text style={styles.shlokaSubtitle}>{shloka.subtitle}</Text>
                  
                  <View style={styles.shlokaMetaRow}>
                    <View style={styles.shlokaMetaItem}>
                      <MaterialCommunityIcons name="music-note" size={12} color="#8D6E63" />
                      <Text style={styles.shlokaMetaText}>{shloka.chandas}</Text>
                    </View>
                    <View style={styles.shlokaMetaItem}>
                      <MaterialCommunityIcons name="clock-outline" size={12} color="#A1887F" />
                      <Text style={styles.shlokaMetaText}>
                        {Math.floor(shloka.expectedDuration / 1000)}s
                      </Text>
                    </View>
                    <View 
                      style={[
                        styles.difficultyBadge,
                        { backgroundColor: getDifficultyColor(shloka.expectedDuration) + '30' }
                      ]}
                    >
                      <Text 
                        style={[
                          styles.difficultyText,
                          { color: getDifficultyColor(shloka.expectedDuration) }
                        ]}
                      >
                        {getDifficultyLabel(shloka.expectedDuration)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Selection Indicator */}
                {selectedShloka?.id === shloka.id && (
                  <View style={styles.selectedIndicator}>
                    <MaterialCommunityIcons name="check-circle" size={24} color="#8D6E63" />
                  </View>
                )}
              </LinearGradient>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: 'white',
    marginLeft: 10,
  },
  categoriesContainer: {
    maxHeight: 50,
    marginBottom: 16,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginRight: 10,
  },
  categoryChipActive: {
    backgroundColor: '#8D6E63',
  },
  categoryText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    marginLeft: 6,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: 'white',
  },
  shlokaList: {
    flex: 1,
  },
  shlokaListContent: {
    paddingHorizontal: 20,
  },
  shlokaCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  shlokaCardSelected: {
    borderColor: '#8D6E63',
  },
  shlokaCardGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  shlokaIconContainer: {
    marginRight: 14,
  },
  shlokaIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shlokaIconText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
  },
  shlokaInfo: {
    flex: 1,
  },
  shlokaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  shlokaSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  shlokaMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  shlokaMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shlokaMetaText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    marginLeft: 4,
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
  },
  selectedIndicator: {
    marginLeft: 10,
  },
});

export default ShlokaSelector;
