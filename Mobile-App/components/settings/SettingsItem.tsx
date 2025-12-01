import React, { useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export type SettingsItemType = 'navigation' | 'toggle' | 'action' | 'info';

export interface SettingsItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  iconBgColor?: string;
  title: string;
  subtitle?: string;
  type?: SettingsItemType;
  value?: boolean | string;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
  showChevron?: boolean;
  danger?: boolean;
  disabled?: boolean;
  badge?: string;
}

export default function SettingsItem({
  icon,
  iconColor = '#ea580c',
  iconBgColor = '#fff7ed',
  title,
  subtitle,
  type = 'navigation',
  value,
  onPress,
  onToggle,
  showChevron = true,
  danger = false,
  disabled = false,
  badge,
}: SettingsItemProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const effectiveIconColor = danger ? '#ef4444' : iconColor;
  const effectiveIconBgColor = danger ? '#fef2f2' : iconBgColor;
  const textColor = danger ? '#ef4444' : disabled ? '#9ca3af' : '#1f2937';

  const renderRightContent = () => {
    switch (type) {
      case 'toggle':
        return (
          <Switch
            value={value as boolean}
            onValueChange={onToggle}
            trackColor={{ false: '#e5e7eb', true: '#fed7aa' }}
            thumbColor={value ? '#ea580c' : '#f4f4f5'}
            disabled={disabled}
          />
        );
      case 'info':
        return (
          <Text style={{ fontSize: 14, color: '#6b7280', fontWeight: '500' }}>
            {value as string}
          </Text>
        );
      case 'action':
      case 'navigation':
      default:
        return showChevron ? (
          <Ionicons name="chevron-forward" size={20} color="#d1d5db" />
        ) : null;
    }
  };

  const content = (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 14,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#f3f4f6',
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {/* Icon */}
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          backgroundColor: effectiveIconBgColor,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 14,
        }}
      >
        <Ionicons name={icon} size={20} color={effectiveIconColor} />
      </View>

      {/* Text Content */}
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text
            style={{
              fontSize: 15,
              fontWeight: '600',
              color: textColor,
              letterSpacing: 0.2,
            }}
          >
            {title}
          </Text>
          {badge && (
            <View
              style={{
                marginLeft: 8,
                backgroundColor: '#dcfce7',
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 9,
                  fontWeight: '700',
                  color: '#16a34a',
                  letterSpacing: 0.5,
                }}
              >
                {badge}
              </Text>
            </View>
          )}
        </View>
        {subtitle && (
          <Text
            style={{
              fontSize: 12,
              color: '#9ca3af',
              marginTop: 2,
            }}
          >
            {subtitle}
          </Text>
        )}
      </View>

      {/* Right Content */}
      {renderRightContent()}
    </Animated.View>
  );

  if (type === 'toggle' || disabled) {
    return content;
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
      disabled={disabled}
    >
      {content}
    </TouchableOpacity>
  );
}
