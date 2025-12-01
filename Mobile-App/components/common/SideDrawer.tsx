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
import { LinearGradient } from 'expo-linear-gradient';
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
            
            {/* Elegant Header */}
            <View style={{ backgroundColor: '#1a1a1a', paddingTop: 56, paddingBottom: 28, paddingHorizontal: 24 }}>
              {/* Decorative element */}
              <View style={{ position: 'absolute', top: 0, right: 0, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(249,115,22,0.15)', transform: [{ translateX: 40 }, { translateY: -40 }] }} />
              
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
                    {/* Avatar with gradient border */}
                    <View style={{ marginRight: 16 }}>
                      <LinearGradient
                        colors={['#f97316', '#fb923c', '#fdba74']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={{
                          width: 64,
                          height: 64,
                          borderRadius: 32,
                          padding: 2,
                        }}
                      >
                        <View
                          style={{
                            flex: 1,
                            borderRadius: 30,
                            backgroundColor: '#2a2a2a',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Text style={{ color: '#f97316', fontSize: 24, fontWeight: '700' }}>
                            {getInitials()}
                          </Text>
                        </View>
                      </LinearGradient>
                    </View>
                    
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#ffffff', fontSize: 18, fontWeight: '700', letterSpacing: 0.3 }}>
                        {user?.profile?.firstName || user?.username || 'Guest'}
                      </Text>
                      <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, marginTop: 4, fontWeight: '400' }}>
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
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => handleMenuItemPress(item.route)}
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
                          backgroundColor: '#fef7f0',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 14,
                        }}
                      >
                        <Ionicons name={item.icon} size={20} color="#ea580c" />
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
                              backgroundColor: item.badge === 'NEW' ? '#dcfce7' : '#fef3c7',
                              paddingHorizontal: 6,
                              paddingVertical: 2,
                              borderRadius: 4,
                            }}>
                              <Text style={{
                                fontSize: 9,
                                fontWeight: '700',
                                color: item.badge === 'NEW' ? '#16a34a' : '#d97706',
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
                  ))}

                </ScrollView>

                {/* Minimalist Footer */}
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
                      <Text style={{ fontSize: 16, fontWeight: '700', color: '#f97316' }}>Yug</Text>
                    </View>
                    <Text
                      style={{
                        fontSize: 11,
                        color: '#9ca3af',
                        fontWeight: '500',
                      }}
                    >
                      v1.0.0
                    </Text>
                  </View>
                </View>
              </View>
          </Animated.View>
      </View>
    </Modal>
  );
}
