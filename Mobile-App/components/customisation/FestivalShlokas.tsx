import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Festival,
  festivalCategories,
  searchFestivals,
} from '../../data/festivalShlokas';

interface FestivalCardProps {
  festival: Festival;
  onPress: () => void;
}

function FestivalCard({ festival, onPress }: FestivalCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      tension: 100,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 8,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], marginRight: 12 }}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        style={{
          width: 160,
          backgroundColor: '#ffffff',
          borderRadius: 16,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: '#f3f4f6',
        }}
      >
        {/* Gradient Header */}
        <LinearGradient
          colors={festival.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            padding: 16,
            alignItems: 'center',
          }}
        >
          <Text style={{ fontSize: 40 }}>{festival.icon}</Text>
        </LinearGradient>

        {/* Content */}
        <View style={{ padding: 12 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: '#1f2937' }} numberOfLines={1}>
            {festival.name}
          </Text>
          <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }} numberOfLines={1}>
            {festival.deity}
          </Text>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: 8,
            }}
          >
            <Ionicons name="musical-notes-outline" size={12} color="#9ca3af" />
            <Text style={{ fontSize: 11, color: '#9ca3af', marginLeft: 4 }}>
              {festival.shlokas.length} Shlokas
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

interface FestivalDetailModalProps {
  visible: boolean;
  festival: Festival | null;
  onClose: () => void;
}

function FestivalDetailModal({ visible, festival, onClose }: FestivalDetailModalProps) {
  const slideAnim = useRef(new Animated.Value(500)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(500);
      fadeAnim.setValue(0);
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 500,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => onClose());
  };

  if (!festival) return null;

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>
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
          <TouchableOpacity style={{ flex: 1 }} onPress={handleClose} activeOpacity={1} />
        </Animated.View>

        {/* Content */}
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            maxHeight: '90%',
            backgroundColor: '#ffffff',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Header with Gradient */}
          <LinearGradient
            colors={festival.gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              paddingTop: 20,
              paddingBottom: 24,
              paddingHorizontal: 20,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
            }}
          >
            {/* Handle */}
            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.4)' }} />
            </View>

            {/* Close Button */}
            <TouchableOpacity
              onPress={handleClose}
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
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

            {/* Festival Info */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 48, marginRight: 16 }}>{festival.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 24, fontWeight: '800', color: '#ffffff' }}>
                  {festival.name}
                </Text>
                <Text style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 }}>
                  {festival.deity}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                  <View
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 8,
                    }}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '600', color: '#ffffff' }}>
                      {festival.month}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Description */}
            <Text
              style={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.9)',
                marginTop: 16,
                lineHeight: 20,
              }}
            >
              {festival.significance}
            </Text>
          </LinearGradient>

          {/* Shlokas */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 20 }}
            showsVerticalScrollIndicator={false}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: '600',
                color: '#9ca3af',
                letterSpacing: 1,
                textTransform: 'uppercase',
                marginBottom: 16,
              }}
            >
              Sacred Shlokas for {festival.name}
            </Text>

            {festival.shlokas.map((shloka, index) => (
              <View
                key={shloka.id}
                style={{
                  backgroundColor: '#fffbf5',
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: festival.color + '30',
                }}
              >
                {/* Number Badge */}
                <View
                  style={{
                    position: 'absolute',
                    top: -10,
                    left: 16,
                    backgroundColor: festival.color,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 10,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#ffffff' }}>
                    Shloka {index + 1}
                  </Text>
                </View>

                {/* Sanskrit */}
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: '#92400e',
                    lineHeight: 26,
                    textAlign: 'center',
                    marginTop: 12,
                    marginBottom: 12,
                  }}
                >
                  {shloka.sanskrit}
                </Text>

                {/* Transliteration */}
                <Text
                  style={{
                    fontSize: 13,
                    fontStyle: 'italic',
                    color: '#b45309',
                    textAlign: 'center',
                    marginBottom: 12,
                    lineHeight: 20,
                  }}
                >
                  {shloka.transliteration}
                </Text>

                {/* Divider */}
                <View style={{ height: 1, backgroundColor: '#fde68a', marginVertical: 12 }} />

                {/* Meaning */}
                <Text style={{ fontSize: 13, color: '#78716c', lineHeight: 20, marginBottom: 12 }}>
                  {shloka.meaning}
                </Text>

                {/* Benefits */}
                <View
                  style={{
                    backgroundColor: '#f0fdf4',
                    padding: 12,
                    borderRadius: 10,
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                    <Ionicons name="sparkles" size={14} color="#16a34a" />
                    <Text style={{ fontSize: 11, fontWeight: '600', color: '#16a34a', marginLeft: 6 }}>
                      BENEFITS
                    </Text>
                  </View>
                  <Text style={{ fontSize: 12, color: '#166534', lineHeight: 18 }}>
                    {shloka.benefits}
                  </Text>
                </View>
              </View>
            ))}

            <View style={{ height: 20 }} />
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

interface FestivalShlokasProps {
  festivalNotificationsEnabled: boolean;
  onToggleFestivalNotifications: (enabled: boolean) => void;
}

export default function FestivalShlokas({
  festivalNotificationsEnabled,
  onToggleFestivalNotifications,
}: FestivalShlokasProps) {
  const [selectedFestival, setSelectedFestival] = useState<Festival | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Festival[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const toggleAnim = useRef(new Animated.Value(festivalNotificationsEnabled ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(toggleAnim, {
      toValue: festivalNotificationsEnabled ? 1 : 0,
      tension: 50,
      friction: 8,
      useNativeDriver: false,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [festivalNotificationsEnabled]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setIsSearching(true);
      setSearchResults(searchFestivals(query));
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
  };

  const handleFestivalPress = (festival: Festival) => {
    setSelectedFestival(festival);
    setModalVisible(true);
  };

  const toggleBackgroundColor = toggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#e5e7eb', '#22c55e'],
  });

  const toggleTranslateX = toggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22],
  });

  return (
    <View>
      {/* Section Header */}
      <View style={{ marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: '#fef3c7',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <Text style={{ fontSize: 18 }}>🎊</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#1f2937' }}>
              Festival Shlokas
            </Text>
            <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
              Sacred verses for Hindu celebrations
            </Text>
          </View>
        </View>
      </View>

      {/* Notification Toggle Card */}
      <View
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 16,
          padding: 16,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: '#f3f4f6',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: '#fef3c7',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 14,
            }}
          >
            <Ionicons name="notifications-outline" size={22} color="#d97706" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#1f2937' }}>
              Festival Reminders
            </Text>
            <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
              Get notified before festivals
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => onToggleFestivalNotifications(!festivalNotificationsEnabled)}
            activeOpacity={0.8}
          >
            <Animated.View
              style={{
                width: 48,
                height: 28,
                borderRadius: 14,
                backgroundColor: toggleBackgroundColor,
                padding: 2,
                justifyContent: 'center',
              }}
            >
              <Animated.View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: '#ffffff',
                  transform: [{ translateX: toggleTranslateX }],
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 4,
                  elevation: 3,
                }}
              />
            </Animated.View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 14,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 14,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: '#e5e7eb',
        }}
      >
        <Ionicons name="search-outline" size={20} color="#9ca3af" />
        <TextInput
          style={{
            flex: 1,
            paddingVertical: 14,
            paddingHorizontal: 10,
            fontSize: 15,
            color: '#1f2937',
          }}
          placeholder="Search festivals..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Ionicons name="close-circle" size={20} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      {/* Search Results */}
      {isSearching ? (
        <View>
          <Text style={{ fontSize: 13, fontWeight: '600', color: '#6b7280', marginBottom: 12 }}>
            {searchResults.length} results found
          </Text>
          {searchResults.map((festival) => (
            <TouchableOpacity
              key={festival.id}
              onPress={() => handleFestivalPress(festival)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                borderRadius: 14,
                padding: 14,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: '#f3f4f6',
              }}
            >
              <Text style={{ fontSize: 32, marginRight: 14 }}>{festival.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: '#1f2937' }}>
                  {festival.name}
                </Text>
                <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                  {festival.deity} • {festival.shlokas.length} Shlokas
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        /* Category Lists */
        festivalCategories.map((category) => (
          <View key={category.id} style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 18, marginRight: 8 }}>{category.icon}</Text>
              <Text style={{ fontSize: 15, fontWeight: '700', color: '#374151' }}>
                {category.name}
              </Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {category.festivals.map((festival) => (
                <FestivalCard
                  key={festival.id}
                  festival={festival}
                  onPress={() => handleFestivalPress(festival)}
                />
              ))}
            </ScrollView>
          </View>
        ))
      )}

      {/* Festival Detail Modal */}
      <FestivalDetailModal
        visible={modalVisible}
        festival={selectedFestival}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}
