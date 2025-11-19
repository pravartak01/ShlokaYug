import React from 'react';
import { View, Text } from 'react-native';

interface DailyQuoteProps {
  quote: {
    sanskrit: string;
    translation: string;
    timeOfDay: string;
  };
}

export default function DailyQuote({ quote }: DailyQuoteProps) {
  return (
    <View className="bg-white/10 p-4 rounded-2xl">
      <Text className="text-white/80 text-sm mb-2">🌅 Daily Wisdom</Text>
      <Text className="text-white text-base font-medium mb-2">
        {quote.sanskrit}
      </Text>
      <Text className="text-white/90 text-sm">
        {quote.translation}
      </Text>
    </View>
  );
}
