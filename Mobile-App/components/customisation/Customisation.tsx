import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import TimeBasedShlokas from './TimeBasedShlokas';
import FestivalShlokas from './FestivalShlokas';
import {
  getNotificationPreferences,
  saveNotificationPreferences,
  NotificationPreferences,
  updateTimeNotification,
  updateFestivalNotification,
  requestNotificationPermissions,
} from '../../services/notificationService';
import { TimeOfDay, getCurrentTimeSlot } from '../../data/timeBasedShlokas';

type TabType = 'daily' | 'festivals';

export default function Customisation() {
  const [activeTab, setActiveTab] = useState<TabType>('daily');
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Current time slot highlight
  const currentSlot = getCurrentTimeSlot();

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const prefs = await getNotificationPreferences();
      setPreferences(prefs);
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPreferences();
    setRefreshing(false);
  }, []);

  const handleTimeSlotToggle = async (slotId: string, enabled: boolean) => {
    if (!preferences) return;

    // Request permissions if enabling
    if (enabled) {
      const hasPermission = await requestNotificationPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Permissions Required',
          'Please enable notifications in your device settings to receive shloka reminders.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    // Update local state immediately for responsiveness
    const updatedPrefs = {
      ...preferences,
      timeNotifications: {
        ...preferences.timeNotifications,
        [slotId]: enabled,
      },
    };
    setPreferences(updatedPrefs);

    // Save to storage
    await updateTimeNotification(slotId as TimeOfDay, enabled);
  };

  const handleFestivalToggle = async (enabled: boolean) => {
    if (!preferences) return;

    if (enabled) {
      const hasPermission = await requestNotificationPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Permissions Required',
          'Please enable notifications in your device settings to receive festival reminders.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    const updatedPrefs = {
      ...preferences,
      festivalNotifications: enabled,
    };
    setPreferences(updatedPrefs);
    await updateFestivalNotification(enabled);
  };

  const handleMasterToggle = async (enabled: boolean) => {
    if (!preferences) return;

    if (enabled) {
      const hasPermission = await requestNotificationPermissions();
      if (!hasPermission) {
        Alert.alert(
          'Permissions Required',
          'Please enable notifications in your device settings.',
          [{ text: 'OK' }]
        );
        return;
      }
    }

    const updatedPrefs = {
      ...preferences,
      enabled,
    };
    setPreferences(updatedPrefs);
    await saveNotificationPreferences(updatedPrefs);
  };

  const enabledSlots = preferences?.timeNotifications || {
    brahma_muhurta: false,
    morning: false,
    afternoon: false,
    evening: false,
    night: false,
  };

  const activeCount = Object.values(enabledSlots).filter(Boolean).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fafafa' }}>
      {/* Header */}
      <LinearGradient
        colors={['#1e293b', '#0f172a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <TouchableOpacity
            onPress={() => router.back()}
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

          <View style={{ alignItems: 'center', flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="color-palette" size={20} color="#fbbf24" />
              <Text style={{ fontSize: 20, fontWeight: '700', color: '#ffffff', marginLeft: 8 }}>
                Customisation
              </Text>
            </View>
            <Text style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
              Personalize your shloka experience
            </Text>
          </View>

          <View style={{ width: 40 }} />
        </View>

        {/* Current Time Slot Indicator */}
        {currentSlot && (
          <View
            style={{
              marginTop: 16,
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: 12,
              padding: 12,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 24, marginRight: 12 }}>{currentSlot.icon}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: '#94a3b8' }}>Current Chanting Time</Text>
              <Text style={{ fontSize: 15, fontWeight: '600', color: '#ffffff', marginTop: 2 }}>
                {currentSlot.label}
              </Text>
            </View>
            <TouchableOpacity
              style={{
                backgroundColor: currentSlot.color,
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 8,
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#ffffff' }}>
                Start Now
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </LinearGradient>

      {/* Tab Bar */}
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: '#ffffff',
          borderBottomWidth: 1,
          borderBottomColor: '#f3f4f6',
        }}
      >
        <TouchableOpacity
          onPress={() => setActiveTab('daily')}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 12,
            backgroundColor: activeTab === 'daily' ? '#1e293b' : 'transparent',
            alignItems: 'center',
            marginRight: 8,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons
              name="time-outline"
              size={18}
              color={activeTab === 'daily' ? '#ffffff' : '#6b7280'}
            />
            <Text
              style={{
                marginLeft: 8,
                fontSize: 14,
                fontWeight: '600',
                color: activeTab === 'daily' ? '#ffffff' : '#6b7280',
              }}
            >
              Daily Reminders
            </Text>
          </View>
          {activeCount > 0 && activeTab !== 'daily' && (
            <View
              style={{
                position: 'absolute',
                top: 8,
                right: 16,
                backgroundColor: '#22c55e',
                width: 18,
                height: 18,
                borderRadius: 9,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 10, fontWeight: '700', color: '#ffffff' }}>
                {activeCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('festivals')}
          style={{
            flex: 1,
            paddingVertical: 12,
            borderRadius: 12,
            backgroundColor: activeTab === 'festivals' ? '#1e293b' : 'transparent',
            alignItems: 'center',
            marginLeft: 8,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 16, marginRight: 6 }}>🎊</Text>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: activeTab === 'festivals' ? '#ffffff' : '#6b7280',
              }}
            >
              Festivals
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Master Toggle Card */}
        <View
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 16,
            padding: 16,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: '#f3f4f6',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                backgroundColor: preferences?.enabled ? '#dcfce7' : '#f3f4f6',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
              }}
            >
              <Ionicons
                name={preferences?.enabled ? 'notifications' : 'notifications-off-outline'}
                size={24}
                color={preferences?.enabled ? '#16a34a' : '#9ca3af'}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: '#1f2937' }}>
                Shloka Notifications
              </Text>
              <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>
                {preferences?.enabled ? 'Reminders are active' : 'Enable to receive reminders'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleMasterToggle(!preferences?.enabled)}
              activeOpacity={0.8}
            >
              <View
                style={{
                  width: 52,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: preferences?.enabled ? '#22c55e' : '#e5e7eb',
                  padding: 2,
                  justifyContent: 'center',
                }}
              >
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    backgroundColor: '#ffffff',
                    transform: [{ translateX: preferences?.enabled ? 22 : 2 }],
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                />
              </View>
            </TouchableOpacity>
          </View>

          {preferences?.enabled && (
            <View
              style={{
                marginTop: 14,
                paddingTop: 14,
                borderTopWidth: 1,
                borderTopColor: '#f3f4f6',
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 20, fontWeight: '700', color: '#1f2937' }}>
                    {activeCount}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                    Daily Slots
                  </Text>
                </View>
                <View style={{ width: 1, backgroundColor: '#f3f4f6' }} />
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontSize: 20, fontWeight: '700', color: '#1f2937' }}>
                    {preferences.festivalNotifications ? '✓' : '—'}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                    Festivals
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Tab Content */}
        {activeTab === 'daily' ? (
          <TimeBasedShlokas
            enabledSlots={enabledSlots}
            onToggleSlot={handleTimeSlotToggle}
          />
        ) : (
          <FestivalShlokas
            festivalNotificationsEnabled={preferences?.festivalNotifications ?? false}
            onToggleFestivalNotifications={handleFestivalToggle}
          />
        )}

        {/* Info Card */}
        <View
          style={{
            backgroundColor: '#eff6ff',
            borderRadius: 14,
            padding: 16,
            marginTop: 20,
            borderWidth: 1,
            borderColor: '#bfdbfe',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Ionicons name="information-circle" size={20} color="#3b82f6" style={{ marginTop: 2 }} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#1e40af', marginBottom: 4 }}>
                About Shloka Reminders
              </Text>
              <Text style={{ fontSize: 12, color: '#3b82f6', lineHeight: 18 }}>
                {activeTab === 'daily'
                  ? 'Each time slot has specific shlokas traditionally chanted during those hours. Enable notifications to receive gentle reminders for your daily spiritual practice.'
                  : 'Festival shlokas are sacred verses specific to Hindu celebrations. Enable festival reminders to receive notifications before important festivals with relevant shlokas to chant.'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
