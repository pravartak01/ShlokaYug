import React, { useEffect, useRef, useCallback, useState } from 'react';
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
import * as Animatable from 'react-native-animatable';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { useKidsMode } from '../../context/KidsModeContext';

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

// Kids Menu Items - Fun & Engaging!
const kidsMenuItems: DrawerMenuItem[] = [
  {
    id: 'syllable-chanting',
    title: '🎵 Syllable Fun',
    icon: 'musical-notes',
    route: '/kids/syllable-chanting',
    description: 'Big colorful chanting',
  },
  {
    id: 'memory-games',
    title: '🧠 Memory Boost',
    icon: 'bulb',
    route: '/kids/memory-games',
    description: 'Complete the verse',
    badge: 'GAME',
  },
  {
    id: 'beat-games',
    title: '🎮 Tap the Beat',
    icon: 'game-controller',
    route: '/kids/beat-games',
    description: 'Rhythm pattern games',
    badge: 'FUN',
  },
  {
    id: 'om-chanting',
    title: '🕉️ Om Sounds',
    icon: 'volume-high',
    route: '/kids/om-chanting',
    description: 'Peaceful mantras',
  },
  {
    id: 'visual-beats',
    title: '✨ Visual Beats',
    icon: 'color-wand',
    route: '/kids/visual-beats',
    description: 'Animated rhythm guide',
  },
  {
    id: 'slow-mode',
    title: '🐢 Slow Mode',
    icon: 'speedometer-outline',
    route: '/kids/slow-mode',
    description: 'Easy chunked learning',
  },
  {
    id: 'rewards',
    title: '🏆 My Rewards',
    icon: 'gift',
    route: '/kids/rewards',
    description: 'Stars & achievements',
    badge: 'COOL',
  },
  {
    id: 'soundscapes',
    title: '🎼 Calm Sounds',
    icon: 'headset',
    route: '/kids/soundscapes',
    description: 'Soothing music loops',
  },
];

// Animated menu item component - Adult Mode
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
        return { bg: '#f4e6d7', text: '#4A2E1C' };
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
            backgroundColor: '#f4e6d7',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 14,
          }}
        >
          <Ionicons name={item.icon} size={20} color="#4A2E1C" />
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

// Animated Kids Menu Item - Fun & Playful!
const KidsMenuItem = ({ 
  item, 
  index, 
  onPress 
}: { 
  item: DrawerMenuItem; 
  index: number; 
  onPress: () => void;
}) => {
  const animations = ['bounceIn', 'zoomIn', 'fadeInUp', 'flipInX', 'rubberBand'];
  const animation = animations[index % animations.length];
  
  const getKidsBadgeStyle = (badge: string) => {
    switch (badge) {
      case 'GAME':
        return { bg: '#fef3c7', text: '#f59e0b', icon: '🎮' };
      case 'FUN':
        return { bg: '#fce7f3', text: '#ec4899', icon: '🎉' };
      case 'COOL':
        return { bg: '#dbeafe', text: '#3b82f6', icon: '⭐' };
      default:
        return { bg: '#f3f4f6', text: '#6b7280', icon: '✨' };
    }
  };

  const badgeInfo = item.badge ? getKidsBadgeStyle(item.badge) : null;

  return (
    <Animatable.View
      animation={animation as any}
      duration={800}
      delay={index * 100}
      useNativeDriver
    >
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        style={{
          marginBottom: 12,
          borderRadius: 20,
          overflow: 'hidden',
        }}
      >
        <LinearGradient
          colors={['#ffffff', '#fef9f3']}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            borderWidth: 3,
            borderColor: '#fbbf24',
            borderRadius: 20,
          }}
        >
          {/* Bouncy Icon Container */}
          <Animatable.View
            animation="pulse"
            iterationCount="infinite"
            duration={2000}
            delay={index * 200}
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              marginRight: 14,
              overflow: 'hidden',
            }}
          >
            <LinearGradient
              colors={['#fbbf24', '#f59e0b']}
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name={item.icon} size={28} color="#ffffff" />
            </LinearGradient>
          </Animatable.View>
          
          {/* Text Content */}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 18,
                fontWeight: '800',
                color: '#1f2937',
                letterSpacing: 0.3,
              }}
            >
              {item.title}
            </Text>
            {item.description && (
              <Text
                style={{
                  fontSize: 13,
                  color: '#6b7280',
                  marginTop: 2,
                  fontWeight: '500',
                }}
              >
                {item.description}
              </Text>
            )}
          </View>

          {/* Badge */}
          {badgeInfo && (
            <Animatable.View
              animation="tada"
              iterationCount="infinite"
              duration={3000}
              delay={index * 300}
              style={{
                backgroundColor: badgeInfo.bg,
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: badgeInfo.text,
              }}
            >
              <Text style={{
                fontSize: 11,
                fontWeight: '800',
                color: badgeInfo.text,
              }}>
                {badgeInfo.icon} {item.badge}
              </Text>
            </Animatable.View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </Animatable.View>
  );
};

export default function SideDrawer({
  isVisible,
  onClose,
  menuItems = defaultMenuItems,
}: SideDrawerProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { isKidsMode, setKidsMode } = useKidsMode();
  const slideAnim = useRef(new Animated.Value(-SCREEN_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const [showTransition, setShowTransition] = useState(false);

  const currentMenuItems = isKidsMode ? kidsMenuItems : menuItems;

  const handleKidsModeToggle = (value: boolean) => {
    // Show transition animation
    setShowTransition(true);
    setTimeout(() => {
      setKidsMode(value);
      setShowTransition(false);
    }, 1500);
  };

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
          <View style={{ flex: 1, backgroundColor: isKidsMode ? '#fff5e6' : '#FAFAFA', borderTopRightRadius: 24, borderBottomRightRadius: 24, overflow: 'hidden' }}>
            
            {/* Transition Animation Overlay */}
            {showTransition && (
              <Animatable.View
                animation="zoomIn"
                duration={1500}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 1000,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LinearGradient
                  colors={['#fbbf24', '#f59e0b', '#f97316']}
                  style={{
                    flex: 1,
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Animatable.View
                    animation="bounceIn"
                    iterationCount="infinite"
                    duration={1000}
                  >
                    <Ionicons name="happy" size={80} color="#ffffff" />
                  </Animatable.View>
                  <Animatable.Text
                    animation="pulse"
                    iterationCount="infinite"
                    style={{
                      fontSize: 24,
                      fontWeight: '800',
                      color: '#ffffff',
                      marginTop: 20,
                    }}
                  >
                    {isKidsMode ? '🎉 Welcome Kids! 🎉' : '👋 Back to Adult Mode'}
                  </Animatable.Text>
                </LinearGradient>
              </Animatable.View>
            )}

            {/* Header - Dynamic based on mode */}
            {!isKidsMode ? (
              /* Adult Header */
              <View style={{ backgroundColor: '#3d2b04', paddingTop: 56, paddingBottom: 28, paddingHorizontal: 24 }}>
                <View style={{ position: 'absolute', top: 0, right: 0, width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(133,83,50,0.3)', transform: [{ translateX: 40 }, { translateY: -40 }] }} />
                <View style={{ position: 'absolute', bottom: -20, left: -20, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(133,83,50,0.2)' }} />
                
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

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={{ marginRight: 16 }}>
                    <View style={{ width: 64, height: 64, borderRadius: 32, borderWidth: 3, borderColor: '#a0704a', padding: 2 }}>
                      <View style={{ flex: 1, borderRadius: 28, backgroundColor: '#5c4106', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: '#e8ccae', fontSize: 24, fontWeight: '700' }}>{getInitials()}</Text>
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
            ) : (
              /* Kids Header - Colorful & Fun! */
              <Animatable.View
                animation="bounceInDown"
                duration={1000}
              >
                <LinearGradient
                  colors={['#fbbf24', '#f59e0b']}
                  style={{ paddingTop: 56, paddingBottom: 28, paddingHorizontal: 24 }}
                >
                  {/* Floating Stars */}
                  <Animatable.Text
                    animation="pulse"
                    iterationCount="infinite"
                    duration={2000}
                    style={{ position: 'absolute', top: 60, right: 30, fontSize: 30 }}
                  >
                    ⭐
                  </Animatable.Text>
                  <Animatable.Text
                    animation="bounce"
                    iterationCount="infinite"
                    duration={3000}
                    style={{ position: 'absolute', top: 100, right: 80, fontSize: 24 }}
                  >
                    🌟
                  </Animatable.Text>
                  
                  <TouchableOpacity
                    onPress={handleClose}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={{
                      position: 'absolute',
                      top: 50,
                      right: 20,
                      width: 40,
                      height: 40,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#ffffff',
                      borderRadius: 20,
                      zIndex: 10,
                      borderWidth: 3,
                      borderColor: '#f59e0b',
                    }}
                  >
                    <Ionicons name="close" size={24} color="#f59e0b" />
                  </TouchableOpacity>

                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Animatable.View
                      animation="rubberBand"
                      iterationCount="infinite"
                      duration={3000}
                      style={{ marginRight: 16 }}
                    >
                      <View style={{ width: 70, height: 70, borderRadius: 35, borderWidth: 4, borderColor: '#ffffff', padding: 3, backgroundColor: '#fff7ed' }}>
                        <View style={{ flex: 1, borderRadius: 32, backgroundColor: '#fbbf24', alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ fontSize: 36 }}>😊</Text>
                        </View>
                      </View>
                    </Animatable.View>
                    
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: '#ffffff', fontSize: 22, fontWeight: '900', letterSpacing: 0.5, textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 2, height: 2 }, textShadowRadius: 4 }}>
                        🎈 Kids Zone! 🎈
                      </Text>
                      <Text style={{ color: '#fffbeb', fontSize: 14, marginTop: 4, fontWeight: '700' }}>
                        Let&apos;s Learn & Have Fun!
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </Animatable.View>
            )}

            {/* Menu Items */}
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingVertical: 20, paddingHorizontal: 16 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Toggle Button - Changes based on mode */}
              <Animatable.View
                animation={isKidsMode ? "bounceIn" : "fadeIn"}
                duration={800}
              >
                <TouchableOpacity
                  onPress={() => handleKidsModeToggle(!isKidsMode)}
                  activeOpacity={0.8}
                  style={{
                    marginBottom: 20,
                    borderRadius: isKidsMode ? 20 : 14,
                    overflow: 'hidden',
                    borderWidth: isKidsMode ? 4 : 1,
                    borderColor: isKidsMode ? '#fbbf24' : '#f3f4f6',
                  }}
                >
                  <LinearGradient
                    colors={isKidsMode ? ['#fbbf24', '#f59e0b'] : ['#ffffff', '#ffffff']}
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 16,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <Animatable.View
                        animation={isKidsMode ? "pulse" : "fadeIn"}
                        iterationCount={isKidsMode ? "infinite" : 1}
                        duration={2000}
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 14,
                          backgroundColor: isKidsMode ? '#ffffff' : '#f4e6d7',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 14,
                        }}
                      >
                        <Ionicons 
                          name={isKidsMode ? "arrow-back" : "happy-outline"} 
                          size={24} 
                          color={isKidsMode ? '#fbbf24' : '#4A2E1C'} 
                        />
                      </Animatable.View>
                      <View style={{ flex: 1 }}>
                        <Text style={{
                          fontSize: isKidsMode ? 18 : 15,
                          fontWeight: isKidsMode ? '800' : '600',
                          color: isKidsMode ? '#ffffff' : '#1f2937',
                          letterSpacing: isKidsMode ? 0.5 : 0.2,
                        }}>
                          {isKidsMode ? '👋 Back to Adult' : '🎉 Kids Section'}
                        </Text>
                        <Text style={{
                          fontSize: isKidsMode ? 13 : 12,
                          color: isKidsMode ? '#fffbeb' : '#9ca3af',
                          marginTop: 2,
                          fontWeight: isKidsMode ? '600' : '400',
                        }}>
                          {isKidsMode ? 'Exit Kids Mode' : 'Fun learning for children'}
                        </Text>
                      </View>
                    </View>
                    <Ionicons 
                      name={isKidsMode ? "exit-outline" : "arrow-forward"} 
                      size={24} 
                      color={isKidsMode ? '#ffffff' : '#d1d5db'} 
                    />
                  </LinearGradient>
                </TouchableOpacity>
              </Animatable.View>

              {/* Section Label */}
              {!isKidsMode && (
                <Text style={{ fontSize: 11, fontWeight: '600', color: '#9ca3af', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12, marginLeft: 8 }}>
                  Features
                </Text>
              )}
              
              {isKidsMode && (
                <Animatable.Text
                  animation="bounceIn"
                  duration={1000}
                  style={{ fontSize: 16, fontWeight: '800', color: '#f59e0b', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 16, marginLeft: 8, textAlign: 'center' }}
                >
                  ✨ Choose Your Adventure! ✨
                </Animatable.Text>
              )}
              
              {/* Render appropriate menu items */}
              {currentMenuItems.map((item, index) => (
                isKidsMode ? (
                  <KidsMenuItem
                    key={item.id}
                    item={item}
                    index={index}
                    onPress={() => handleMenuItemPress(item.route)}
                  />
                ) : (
                  <AnimatedMenuItem
                    key={item.id}
                    item={item}
                    index={index}
                    onPress={() => handleMenuItemPress(item.route)}
                  />
                )
              ))}
            </ScrollView>

            {/* Footer */}
            {!isKidsMode ? (
              /* Adult Footer */
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
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#4A2E1C' }}>Yug</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                    <Ionicons name="shield-checkmark" size={12} color="#4A2E1C" />
                    <Text style={{ fontSize: 10, color: '#6b7280', fontWeight: '600', marginLeft: 4 }}>v1.0.0</Text>
                  </View>
                </View>
              </View>
            ) : (
              /* Kids Footer - Playful */
              <Animatable.View
                animation="bounceInUp"
                duration={1000}
              >
                <LinearGradient
                  colors={['#fef3c7', '#fbbf24']}
                  style={{
                    paddingHorizontal: 24,
                    paddingVertical: 20,
                    borderTopWidth: 3,
                    borderTopColor: '#f59e0b',
                  }}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Animatable.View
                      animation="swing"
                      iterationCount="infinite"
                      duration={2000}
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      <Text style={{ fontSize: 20, fontWeight: '900', color: '#1a1a1a' }}>Shloka</Text>
                      <Text style={{ fontSize: 20, fontWeight: '900', color: '#f59e0b' }}>Yug</Text>
                      <Text style={{ fontSize: 24, marginLeft: 8 }}>🎉</Text>
                    </Animatable.View>
                    <Animatable.Text
                      animation="pulse"
                      iterationCount="infinite"
                      duration={1500}
                      style={{ fontSize: 28 }}
                    >
                      ⭐
                    </Animatable.Text>
                  </View>
                </LinearGradient>
              </Animatable.View>
            )}
          </View>
          </Animated.View>
      </View>
    </Modal>
  );
}
