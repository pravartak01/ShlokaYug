import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import SettingsSection from './SettingsSection';
import SettingsItem from './SettingsItem';

export default function Settings() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);

  const headerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadSettings();
    Animated.stagger(150, [
      Animated.spring(headerAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(contentAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, [headerAnim, contentAnim]);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('app_settings');
      if (settings) {
        const parsed = JSON.parse(settings);
        setNotifications(parsed.notifications ?? true);
        setDailyReminder(parsed.dailyReminder ?? true);
        setSoundEnabled(parsed.soundEnabled ?? true);
        setVibrationEnabled(parsed.vibrationEnabled ?? true);
        setDarkMode(parsed.darkMode ?? false);
        setAutoPlay(parsed.autoPlay ?? false);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSetting = async (key: string, value: boolean) => {
    try {
      const settings = await AsyncStorage.getItem('app_settings');
      const parsed = settings ? JSON.parse(settings) : {};
      parsed[key] = value;
      await AsyncStorage.setItem('app_settings', JSON.stringify(parsed));
    } catch (error) {
      console.error('Error saving setting:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear all cached data. Your account and progress will not be affected.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          onPress: async () => {
            // Clear specific cache keys
            await AsyncStorage.multiRemove(['shloka_cache', 'audio_cache']);
            Alert.alert('Success', 'Cache cleared successfully!');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data, progress, and achievements will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirm Deletion',
              'Type DELETE to confirm account deletion.',
              [{ text: 'Cancel', style: 'cancel' }]
            );
          },
        },
      ]
    );
  };

  const getInitials = () => {
    if (user?.profile?.firstName) {
      const first = user.profile.firstName.charAt(0).toUpperCase();
      const last = user.profile.lastName?.charAt(0).toUpperCase() || '';
      return first + last;
    }
    return user?.username?.charAt(0).toUpperCase() || 'G';
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fafafa' }} edges={['top']}>
      {/* Header */}
      <Animated.View
        style={{
          transform: [{ scale: headerAnim }],
          opacity: headerAnim,
        }}
      >
        <LinearGradient
          colors={['#1f2937', '#374151']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 24,
            borderBottomLeftRadius: 28,
            borderBottomRightRadius: 28,
          }}
        >
          {/* Back Button & Title */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: 'rgba(255,255,255,0.15)',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 14,
              }}
            >
              <Ionicons name="arrow-back" size={22} color="#ffffff" />
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 22, fontWeight: '800', color: '#ffffff' }}>
                Settings
              </Text>
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
                Customize your experience
              </Text>
            </View>
          </View>

          {/* User Profile Card */}
          <TouchableOpacity
            onPress={() => router.push('/profile')}
            activeOpacity={0.8}
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderRadius: 16,
              padding: 16,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <LinearGradient
              colors={['#f97316', '#fb923c', '#fdba74']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                padding: 2,
              }}
            >
              <View
                style={{
                  flex: 1,
                  borderRadius: 26,
                  backgroundColor: '#2a2a2a',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: '#f97316', fontSize: 20, fontWeight: '700' }}>
                  {getInitials()}
                </Text>
              </View>
            </LinearGradient>

            <View style={{ flex: 1, marginLeft: 14 }}>
              <Text style={{ fontSize: 17, fontWeight: '700', color: '#ffffff' }}>
                {user?.profile?.firstName || user?.username || 'Guest User'}
              </Text>
              <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>
                {user?.email || 'Tap to view profile'}
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
        </LinearGradient>
      </Animated.View>

      {/* Content */}
      <Animated.View
        style={{
          flex: 1,
          opacity: contentAnim,
          transform: [
            {
              translateY: contentAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [20, 0],
              }),
            },
          ],
        }}
      >
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Notifications Section */}
          <SettingsSection title="Notifications">
            <SettingsItem
              icon="notifications-outline"
              title="Push Notifications"
              subtitle="Receive alerts and reminders"
              type="toggle"
              value={notifications}
              onToggle={(val) => {
                setNotifications(val);
                saveSetting('notifications', val);
              }}
            />
            <SettingsItem
              icon="sunny-outline"
              iconColor="#f59e0b"
              iconBgColor="#fef3c7"
              title="Daily Shloka Reminder"
              subtitle="Get inspired every morning"
              type="toggle"
              value={dailyReminder}
              onToggle={(val) => {
                setDailyReminder(val);
                saveSetting('dailyReminder', val);
              }}
            />
            <SettingsItem
              icon="volume-high-outline"
              iconColor="#3b82f6"
              iconBgColor="#eff6ff"
              title="Sound"
              subtitle="Play sounds for notifications"
              type="toggle"
              value={soundEnabled}
              onToggle={(val) => {
                setSoundEnabled(val);
                saveSetting('soundEnabled', val);
              }}
            />
            <SettingsItem
              icon="phone-portrait-outline"
              iconColor="#8b5cf6"
              iconBgColor="#f5f3ff"
              title="Vibration"
              subtitle="Haptic feedback"
              type="toggle"
              value={vibrationEnabled}
              onToggle={(val) => {
                setVibrationEnabled(val);
                saveSetting('vibrationEnabled', val);
              }}
            />
          </SettingsSection>

          {/* Appearance Section */}
          <SettingsSection title="Appearance">
            <SettingsItem
              icon="moon-outline"
              iconColor="#6366f1"
              iconBgColor="#eef2ff"
              title="Dark Mode"
              subtitle="Coming soon"
              type="toggle"
              value={darkMode}
              onToggle={(val) => {
                setDarkMode(val);
                saveSetting('darkMode', val);
              }}
              badge="SOON"
              disabled
            />
            <SettingsItem
              icon="language-outline"
              iconColor="#10b981"
              iconBgColor="#ecfdf5"
              title="Language"
              subtitle="English"
              type="info"
              value="English"
              onPress={() => {}}
            />
          </SettingsSection>

          {/* Playback Section */}
          <SettingsSection title="Playback">
            <SettingsItem
              icon="play-circle-outline"
              iconColor="#ec4899"
              iconBgColor="#fdf2f8"
              title="Auto-Play Audio"
              subtitle="Play shloka audio automatically"
              type="toggle"
              value={autoPlay}
              onToggle={(val) => {
                setAutoPlay(val);
                saveSetting('autoPlay', val);
              }}
            />
            <SettingsItem
              icon="speedometer-outline"
              iconColor="#14b8a6"
              iconBgColor="#f0fdfa"
              title="Playback Speed"
              subtitle="Normal (1.0x)"
              type="navigation"
              onPress={() => {}}
            />
          </SettingsSection>

          {/* Data & Storage Section */}
          <SettingsSection title="Data & Storage">
            <SettingsItem
              icon="cloud-download-outline"
              iconColor="#0ea5e9"
              iconBgColor="#f0f9ff"
              title="Download Quality"
              subtitle="High"
              type="navigation"
              onPress={() => {}}
            />
            <SettingsItem
              icon="trash-outline"
              iconColor="#f97316"
              title="Clear Cache"
              subtitle="Free up storage space"
              type="action"
              onPress={handleClearCache}
            />
          </SettingsSection>

          {/* Support Section */}
          <SettingsSection title="Support">
            <SettingsItem
              icon="help-circle-outline"
              iconColor="#6366f1"
              iconBgColor="#eef2ff"
              title="Help & FAQ"
              subtitle="Get answers to common questions"
              type="navigation"
              onPress={() => {}}
            />
            <SettingsItem
              icon="chatbubble-outline"
              iconColor="#10b981"
              iconBgColor="#ecfdf5"
              title="Contact Us"
              subtitle="We'd love to hear from you"
              type="navigation"
              onPress={() => Linking.openURL('mailto:support@shlokayug.com')}
            />
            <SettingsItem
              icon="star-outline"
              iconColor="#f59e0b"
              iconBgColor="#fef3c7"
              title="Rate the App"
              subtitle="Share your feedback"
              type="navigation"
              onPress={() => {}}
            />
          </SettingsSection>

          {/* About Section */}
          <SettingsSection title="About">
            <SettingsItem
              icon="document-text-outline"
              iconColor="#6b7280"
              iconBgColor="#f3f4f6"
              title="Terms of Service"
              type="navigation"
              onPress={() => {}}
            />
            <SettingsItem
              icon="shield-checkmark-outline"
              iconColor="#6b7280"
              iconBgColor="#f3f4f6"
              title="Privacy Policy"
              type="navigation"
              onPress={() => {}}
            />
            <SettingsItem
              icon="information-circle-outline"
              iconColor="#6b7280"
              iconBgColor="#f3f4f6"
              title="App Version"
              type="info"
              value="1.0.0"
              showChevron={false}
            />
          </SettingsSection>

          {/* Account Actions */}
          <SettingsSection title="Account">
            <SettingsItem
              icon="log-out-outline"
              title="Sign Out"
              type="action"
              danger
              onPress={handleLogout}
            />
            <SettingsItem
              icon="warning-outline"
              title="Delete Account"
              subtitle="Permanently delete your account"
              type="action"
              danger
              onPress={handleDeleteAccount}
            />
          </SettingsSection>

          {/* Footer */}
          <View style={{ alignItems: 'center', marginTop: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#1f2937' }}>Shloka</Text>
              <Text style={{ fontSize: 18, fontWeight: '800', color: '#f97316' }}>Yug</Text>
            </View>
            <Text style={{ fontSize: 12, color: '#9ca3af' }}>
              Made with ❤️ for Sanskrit lovers
            </Text>
          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
}
