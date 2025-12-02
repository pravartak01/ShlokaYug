import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Animated, Platform } from 'react-native';
import { useEffect, useRef } from 'react';

// Icon mapping - solid and outline variants
const iconMap: Record<string, { solid: keyof typeof Ionicons.glyphMap; outline: keyof typeof Ionicons.glyphMap }> = {
  home: { solid: 'home', outline: 'home-outline' },
  book: { solid: 'book', outline: 'book-outline' },
  'play-circle': { solid: 'play-circle', outline: 'play-circle-outline' },
  mic: { solid: 'mic', outline: 'mic-outline' },
  people: { solid: 'people', outline: 'people-outline' },
};

// Modern Professional Tab Icon with enhanced animations
const TabIcon = ({ name, color, focused }: { name: string; color: string; focused: boolean }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const bgOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: focused ? 1.15 : 1,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: focused ? -3 : 0,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }),
      Animated.timing(bgOpacity, {
        toValue: focused ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused, scaleAnim, translateY, bgOpacity]);

  // Get the correct icon name
  const icons = iconMap[name] || { solid: 'help-circle', outline: 'help-circle-outline' };
  const iconName = focused ? icons.solid : icons.outline;

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', position: 'relative', width: 60, height: 40 }}>
      {/* Background pill for active state */}
      <Animated.View
        style={{
          position: 'absolute',
          width: 52,
          height: 34,
          borderRadius: 17,
          backgroundColor: '#eef2ff',
          opacity: bgOpacity,
        }}
      />
      
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }, { translateY }],
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons
          name={iconName}
          size={24}
          color={focused ? '#6366f1' : '#64748b'}
        />
      </Animated.View>
      
      {/* Active indicator dot */}
      {focused && (
        <View
          style={{
            position: 'absolute',
            bottom: -2,
            width: 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: '#6366f1',
          }}
        />
      )}
    </View>
  );
};

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingBottom: Platform.OS === 'ios' ? 30 : 12,
          paddingTop: 12,
          elevation: 24,
          shadowColor: '#6366f1',
          shadowOffset: { width: 0, height: -8 },
          shadowOpacity: 0.08,
          shadowRadius: 24,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          position: 'absolute',
        },
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#94a3b8',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 4,
          letterSpacing: 0.3,
        },
        tabBarItemStyle: {
          paddingVertical: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="home" color="#6366f1" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="book" color="#6366f1" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="videos"
        options={{
          title: 'Videos',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="play-circle" color="#6366f1" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: 'Practice',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="mic" color="#6366f1" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: 'Community',
          tabBarIcon: ({ focused }) => (
            <TabIcon name="people" color="#6366f1" focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="my-learning"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}