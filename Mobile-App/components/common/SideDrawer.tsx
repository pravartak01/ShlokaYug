import React, { useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Animated,
  Dimensions,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface DrawerMenuItem {
  id: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
  description?: string;
  badge?: string;
}

interface SideDrawerProps {
  isVisible: boolean;
  onClose: () => void;
  menuItems?: DrawerMenuItem[];
}

const defaultMenuItems: DrawerMenuItem[] = [
  {
    id: 'shloka-library',
    title: 'Shloka Library',
    icon: 'library-outline',
    route: '/shloka-library',
    description: 'Ancient Sanskrit verses',
  },
  {
    id: 'ai-composer',
    title: 'AI Composer',
    icon: 'sparkles-outline',
    route: '/ai-composer',
    description: 'Create with AI assistance',
    badge: 'NEW',
  },
  {
    id: 'heal-with-shlokas',
    title: 'Heal with Shlokas',
    icon: 'heart-circle-outline',
    route: '/heal',
    description: 'Mood-based shloka therapy',
    badge: 'USP',
  },
  {
    id: 'customisation',
    title: 'Customisation',
    icon: 'color-palette-outline',
    route: '/customisation',
    description: 'Personalize experience',
  },
  {
    id: 'ai-tagline',
    title: 'Tagline Generator',
    icon: 'text-outline',
    route: '/ai-tagline',
    description: 'Creative Sanskrit taglines',
    badge: 'AI',
  },
  {
    id: 'achievements',
    title: 'Achievements',
    icon: 'trophy-outline',
    route: '/achievements',
    description: 'Progress & badges',
  },
  {
    id: 'settings',
    title: 'Settings',
    icon: 'settings-outline',
    route: '/settings',
    description: 'Preferences & account',
  },
];

// Animated menu item component
const AnimatedMenuItem = ({ 
  item, 
  index, 
  onPress 
}: { 
  item: DrawerMenuItem; 
  index: number; 
  onPress: () => void;
}) => {
  const translateX = useRef(new Animated.Value(-50)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: 0,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, [translateX, opacity, index]);

  const getBadgeStyle = (badge: string) => {
    switch (badge) {
      case 'NEW':
        return { bg: '#dcfce7', text: '#16a34a' };
      case 'AI':
        return { bg: '#dbeafe', text: '#2563eb' };
      case 'USP':
        return { bg: '#e0e7ff', text: '#6366f1' };
      default:
        return { bg: '#f3f4f6', text: '#6b7280' };
    }
  };

  return (
    <Animated.View
      style={{
        transform: [{ translateX }],
        opacity,
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 14,
          marginBottom: 6,
          backgroundColor: '#ffffff',
          borderRadius: 14,
          borderWidth: 1,
          borderColor: '#f3f4f6',
        }}
      >
        {/* Icon Container */}
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            backgroundColor: '#eef2ff',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 14,
          }}
        >
          <Ionicons name={item.icon} size={20} color="#6366f1" />
        </View>
        
        {/* Text Content */}
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: '600',
                color: '#1f2937',
                letterSpacing: 0.2,
              }}
            >
              {item.title}
            </Text>
            {item.badge && (
              <View style={{
                marginLeft: 8,
                backgroundColor: getBadgeStyle(item.badge).bg,
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 4,
              }}>
                <Text style={{
                  fontSize: 9,
                  fontWeight: '700',
                  color: getBadgeStyle(item.badge).text,
                  letterSpacing: 0.5,
                }}>
                  {item.badge}
                </Text>
              </View>
            )}
          </View>
          {item.description && (
            <Text
              style={{
                fontSize: 12,
                color: '#9ca3af',
                marginTop: 2,
              }}
            >
              {item.description}
            </Text>
          )}
        </View>
        {/* Arrow */}
        <Ionicons name="chevron-forward" size={18} color="#d1d5db" />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function SideDrawer({
  isVisible,
  onClose,
  menuItems = defaultMenuItems,
}: SideDrawerProps) {
  const router = useRouter();
  const { user } = useAuth();
  const slideAnim = useRef(new Animated.Value(-SCREEN_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isVisible) {
      // Reset values before animating in
      slideAnim.setValue(-SCREEN_WIDTH);
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
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -SCREEN_WIDTH,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isVisible]);

  const handleMenuItemPress = useCallback((route: string) => {
    onClose();
    setTimeout(() => {
      router.push(route as any);
    }, 300);
  }, [onClose, router]);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const getInitials = () => {
    if (user?.profile?.firstName) {
      return user.profile.firstName.charAt(0).toUpperCase();
    }
    if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return 'G';
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <StatusBar backgroundColor="transparent" barStyle="light-content" translucent />
      
      <View style={{ flex: 1 }}>
        {/* Backdrop - tapping closes drawer */}
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
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={handleClose}
          />
        </Animated.View>

        {/* Drawer Container */}
        <Animated.View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: SCREEN_WIDTH * 0.82,
            transform: [{ translateX: slideAnim }],
            shadowColor: '#000',
            shadowOffset: { width: 4, height: 0 },
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 25,
          }}
        >
          <View style={{ flex: 1, backgroundColor: '#FAFAFA', borderTopRightRadius: 24, borderBottomRightRadius: 24, overflow: 'hidden' }}>
            
            {/* Modern Header with Indigo Theme */}
            <View style={{ backgroundColor: '#1e1b4b', paddingTop: 56, paddingBottom: 28, paddingHorizontal: 24 }}>
              {/* Decorative element */}
              <View style={{ position: 'absolute', top: 0, right: 0, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(99,102,241,0.2)', transform: [{ translateX: 40 }, { translateY: -40 }] }} />
              <View style={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(99,102,241,0.15)' }} />
              
              {/* Close Button */}
              <TouchableOpacity
                onPress={handleClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={{
                  position: 'absolute',
                  top: 50,
                  right: 20,
                  width: 36,
                  height: 36,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  borderRadius: 18,
                  zIndex: 10,
                }}
              >
                <Ionicons name="close" size={20} color="#ffffff" />
              </TouchableOpacity>

              {/* User Profile */}
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {/* Avatar with border */}
                <View style={{ marginRight: 16 }}>
                  <View
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 32,
                      borderWidth: 3,
                      borderColor: '#6366f1',
                      padding: 2,
                    }}
                  >
                    <View
                      style={{
                        flex: 1,
                        borderRadius: 28,
                        backgroundColor: '#312e81',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text style={{ color: '#a5b4fc', fontSize: 24, fontWeight: '700' }}>
                        {getInitials()}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: '700', letterSpacing: 0.3 }}>
                    {user?.profile?.firstName || user?.username || 'Guest'}
                  </Text>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginTop: 4, fontWeight: '400' }}>
                    {user?.email || 'Welcome to ShlokaYug'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Menu Items */}
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingVertical: 20, paddingHorizontal: 16 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Section Label */}
              <Text style={{ fontSize: 11, fontWeight: '600', color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12, marginLeft: 8 }}>
                Features
              </Text>
              
              {menuItems.map((item, index) => (
                <AnimatedMenuItem
                  key={item.id}
                  item={item}
                  index={index}
                  onPress={() => handleMenuItemPress(item.route)}
                />
              ))}
            </ScrollView>

            {/* Modern Footer */}
            <View
              style={{
                paddingHorizontal: 24,
                paddingVertical: 20,
                borderTopWidth: 1,
                borderTopColor: '#f3f4f6',
                backgroundColor: '#ffffff',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#1a1a1a' }}>Shloka</Text>
                  <Text style={{ fontSize: 16, fontWeight: '700', color: '#6366f1' }}>Yug</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                  <Ionicons name="shield-checkmark" size={12} color="#6366f1" />
                  <Text
                    style={{
                      fontSize: 10,
                      color: '#6b7280',
                      fontWeight: '600',
                      marginLeft: 4,
                    }}
                  >
                    v1.0.0
                  </Text>
                </View>
              </View>
            </View>
          </View>
          </Animated.View>
      </View>
    </Modal>
  );
}
