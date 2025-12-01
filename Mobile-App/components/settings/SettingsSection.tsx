import React from 'react';
import { View, Text } from 'react-native';

interface SettingsSectionProps {
  title?: string;
  children: React.ReactNode;
  description?: string;
}

export default function SettingsSection({
  title,
  children,
  description,
}: SettingsSectionProps) {
  return (
    <View style={{ marginBottom: 24 }}>
      {title && (
        <Text
          style={{
            fontSize: 12,
            fontWeight: '700',
            color: '#9ca3af',
            letterSpacing: 1,
            textTransform: 'uppercase',
            marginBottom: 12,
            marginLeft: 4,
          }}
        >
          {title}
        </Text>
      )}
      
      <View>{children}</View>
      
      {description && (
        <Text
          style={{
            fontSize: 12,
            color: '#9ca3af',
            marginTop: 8,
            marginLeft: 4,
            lineHeight: 18,
          }}
        >
          {description}
        </Text>
      )}
    </View>
  );
}
