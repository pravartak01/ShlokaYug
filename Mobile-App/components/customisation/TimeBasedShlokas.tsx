import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { TimeSlot, timeSlots } from '../../data/timeBasedShlokas';

interface TimeSlotCardProps {
  slot: TimeSlot;
  isEnabled: boolean;
  onToggle: (id: string, enabled: boolean) => void;
  onViewShlokas: (slot: TimeSlot) => void;
}

function TimeSlotCard({ slot, isEnabled, onToggle, onViewShlokas }: TimeSlotCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const toggleAnim = useRef(new Animated.Value(isEnabled ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(toggleAnim, {
      toValue: isEnabled ? 1 : 0,
      tension: 50,
      friction: 8,
      useNativeDriver: false,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEnabled]);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.98,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const toggleBackgroundColor = toggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#e5e7eb', slot.color],
  });

  const toggleTranslateX = toggleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22],
  });

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.95}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 16,
          marginBottom: 12,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: isEnabled ? slot.color + '40' : '#f3f4f6',
        }}
      >
        {/* Color accent bar */}
        <LinearGradient
          colors={slot.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ height: 4 }}
        />

        <View style={{ padding: 16 }}>
          {/* Header Row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            {/* Icon */}
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                backgroundColor: slot.color + '15',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
              }}
            >
              <Text style={{ fontSize: 24 }}>{slot.icon}</Text>
            </View>

            {/* Info */}
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#1f2937' }}>
                {slot.label}
              </Text>
              <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                {slot.timeRange}
              </Text>
            </View>

            {/* Toggle */}
            <TouchableOpacity
              onPress={() => onToggle(slot.id, !isEnabled)}
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

          {/* Description */}
          <Text style={{ fontSize: 13, color: '#6b7280', lineHeight: 20, marginBottom: 12 }}>
            {slot.description}
          </Text>

          {/* Footer */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="musical-notes-outline" size={14} color="#9ca3af" />
              <Text style={{ fontSize: 12, color: '#9ca3af', marginLeft: 6 }}>
                {slot.shlokas.length} Shlokas
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => onViewShlokas(slot)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: slot.color + '15',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 8,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: slot.color }}>
                View Shlokas
              </Text>
              <Ionicons name="chevron-forward" size={14} color={slot.color} style={{ marginLeft: 4 }} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

interface ShlokaDetailModalProps {
  visible: boolean;
  slot: TimeSlot | null;
  onClose: () => void;
}

function ShlokaDetailModal({ visible, slot, onClose }: ShlokaDetailModalProps) {
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(300);
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
        toValue: 300,
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

  if (!slot) return null;

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
            backgroundColor: 'rgba(0,0,0,0.5)',
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
            maxHeight: '85%',
            backgroundColor: '#ffffff',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Handle */}
          <View style={{ alignItems: 'center', paddingTop: 12, paddingBottom: 8 }}>
            <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: '#e5e7eb' }} />
          </View>

          {/* Header */}
          <View style={{ paddingHorizontal: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={{ fontSize: 32, marginRight: 12 }}>{slot.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 20, fontWeight: '700', color: '#1f2937' }}>
                  {slot.label}
                </Text>
                <Text style={{ fontSize: 13, color: '#9ca3af', marginTop: 2 }}>
                  {slot.timeRange} • {slot.shlokas.length} Shlokas
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleClose}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: '#f3f4f6',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="close" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Shlokas List */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {slot.shlokas.map((shloka, index) => (
              <View
                key={shloka.id}
                style={{
                  backgroundColor: '#fffbf5',
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: '#fde68a',
                }}
              >
                {/* Shloka Number */}
                <View
                  style={{
                    position: 'absolute',
                    top: -10,
                    left: 16,
                    backgroundColor: slot.color,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 10,
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '700', color: '#ffffff' }}>
                    #{index + 1}
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
                    marginTop: 8,
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

                {/* Meta Info */}
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {shloka.deity && (
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#ffffff',
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        borderRadius: 8,
                      }}
                    >
                      <Ionicons name="star-outline" size={12} color={slot.color} />
                      <Text style={{ fontSize: 11, color: '#6b7280', marginLeft: 6 }}>
                        {shloka.deity}
                      </Text>
                    </View>
                  )}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      backgroundColor: '#ffffff',
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 8,
                    }}
                  >
                    <Ionicons name="time-outline" size={12} color={slot.color} />
                    <Text style={{ fontSize: 11, color: '#6b7280', marginLeft: 6 }}>
                      {shloka.duration}
                    </Text>
                  </View>
                </View>

                {/* Benefits */}
                <View
                  style={{
                    marginTop: 12,
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
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

interface TimeBasedShlokasProps {
  enabledSlots: Record<string, boolean>;
  onToggleSlot: (slotId: string, enabled: boolean) => void;
}

export default function TimeBasedShlokas({ enabledSlots, onToggleSlot }: TimeBasedShlokasProps) {
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleViewShlokas = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    setModalVisible(true);
  };

  return (
    <View>
      {/* Section Header */}
      <View style={{ marginBottom: 16 }}>
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
            <Ionicons name="time-outline" size={20} color="#d97706" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#1f2937' }}>
              Daily Shloka Reminders
            </Text>
            <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
              Get notified at sacred times for chanting
            </Text>
          </View>
        </View>
      </View>

      {/* Time Slots */}
      {timeSlots.map((slot) => (
        <TimeSlotCard
          key={slot.id}
          slot={slot}
          isEnabled={enabledSlots[slot.id] ?? false}
          onToggle={onToggleSlot}
          onViewShlokas={handleViewShlokas}
        />
      ))}

      {/* Shloka Detail Modal */}
      <ShlokaDetailModal
        visible={modalVisible}
        slot={selectedSlot}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}
