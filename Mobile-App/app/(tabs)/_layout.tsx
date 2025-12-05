import { Tabs, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Animated, Platform } from 'react-native';
import { useEffect, useRef, useMemo } from 'react';
import { useKidsMode } from '../../context/KidsModeContext';
import { useTranslation } from 'react-i18next';
import KidsHomeScreen from '../../components/kids/KidsHomeScreen';

// Theme colors - Vintage Brown with Gold/Saffron/Copper highlights
const COPPER = '#B87333';           // Copper for warmth (tab icons)
const SAND = '#F3E4C8';             // Sand/Beige for backgrounds

// Dark theme colors for Practice tab
const DARK_BG = '#0A0A0A';          // Deep black background matching Practice
const DARK_ACCENT = '#8D6E63';      // Brown accent for Practice
const DARK_INACTIVE = 'rgba(255,255,255,0.5)';  // Inactive icon color in dark mode

// Icon mapping - solid and outline variants
const iconMap: Record<string, { solid: keyof typeof Ionicons.glyphMap; outline: keyof typeof Ionicons.glyphMap }> = {
  home: { solid: 'home', outline: 'home-outline' },
  book: { solid: 'book', outline: 'book-outline' },
  'play-circle': { solid: 'play-circle', outline: 'play-circle-outline' },
  mic: { solid: 'mic', outline: 'mic-outline' },
  people: { solid: 'people', outline: 'people-outline' },
};

// Modern Professional Tab Icon with enhanced animations
const TabIcon = ({ name, color, focused, isDarkMode }: { name: string; color: string; focused: boolean; isDarkMode: boolean }) => {
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

  // Dynamic colors based on dark mode
  const activeColor = isDarkMode ? DARK_ACCENT : COPPER;
  const inactiveColor = isDarkMode ? DARK_INACTIVE : '#64748b';
  const pillBgColor = isDarkMode ? 'rgba(141, 110, 99, 0.2)' : SAND;

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', position: 'relative', width: 60, height: 40 }}>
      {/* Background pill for active state */}
      <Animated.View
        style={{
          position: 'absolute',
          width: 52,
          height: 34,
          borderRadius: 17,
          backgroundColor: pillBgColor,
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
          color={focused ? activeColor : inactiveColor}
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
            backgroundColor: activeColor,
          }}
        />
      )}
    </View>
  );
};

export default function TabLayout() {
  const pathname = usePathname();
  const isPracticeTab = pathname === '/practice';
  const { isKidsMode } = useKidsMode();
  const { t } = useTranslation();
  
  // Animated value for smooth color transition
  const bgColorAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.spring(bgColorAnim, {
      toValue: isPracticeTab ? 1 : 0,
      friction: 8,
      tension: 40,
      useNativeDriver: false,
    }).start();
  }, [isPracticeTab, bgColorAnim]);
  
  // Interpolate background color
  const animatedBgColor = bgColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#ffffff', DARK_BG],
  });
  
  // Dynamic styles based on practice tab
  const dynamicTabBarStyle = useMemo(() => ({
    borderTopWidth: 0,
    height: Platform.OS === 'ios' ? 90 : 70,
    paddingBottom: Platform.OS === 'ios' ? 30 : 12,
    paddingTop: 12,
    elevation: 24,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: isPracticeTab ? 0.3 : 0.08,
    shadowRadius: 24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    position: 'absolute' as const,
    borderTopColor: isPracticeTab ? 'rgba(141, 110, 99, 0.3)' : 'transparent',
  }), [isPracticeTab]);

  // If Kids Mode is active, show Kids Home Screen instead of tabs
  if (isKidsMode) {
    return <KidsHomeScreen />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarBackground: () => (
          <Animated.View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: animatedBgColor,
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              // Add subtle glow effect for dark mode
              ...(isPracticeTab && {
                borderTopWidth: 1,
                borderLeftWidth: 1,
                borderRightWidth: 1,
                borderColor: 'rgba(141, 110, 99, 0.3)',
              }),
            }}
          />
        ),
        tabBarStyle: dynamicTabBarStyle,
        tabBarActiveTintColor: isPracticeTab ? DARK_ACCENT : COPPER,
        tabBarInactiveTintColor: isPracticeTab ? DARK_INACTIVE : '#94a3b8',
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
          title: t('tabs.home'),
          tabBarIcon: ({ focused }) => (
            <TabIcon name="home" color={COPPER} focused={focused} isDarkMode={isPracticeTab} />
          ),
        }}
      />
      <Tabs.Screen
        name="learn"
        options={{
          title: t('tabs.learn'),
          tabBarIcon: ({ focused }) => (
            <TabIcon name="book" color={COPPER} focused={focused} isDarkMode={isPracticeTab} />
          ),
        }}
      />
      <Tabs.Screen
        name="videos"
        options={{
          title: t('tabs.videos'),
          tabBarIcon: ({ focused }) => (
            <TabIcon name="play-circle" color={COPPER} focused={focused} isDarkMode={isPracticeTab} />
          ),
        }}
      />
      <Tabs.Screen
        name="practice"
        options={{
          title: t('tabs.practice'),
          tabBarIcon: ({ focused }) => (
            <TabIcon name="mic" color={COPPER} focused={focused} isDarkMode={isPracticeTab} />
          ),
        }}
      />
      <Tabs.Screen
        name="community"
        options={{
          title: t('tabs.community'),
          tabBarIcon: ({ focused }) => (
            <TabIcon name="people" color={COPPER} focused={focused} isDarkMode={isPracticeTab} />
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