import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../context/LanguageContext';

/**
 * Example Component - Language Translation Demo
 * 
 * This component demonstrates how to use translations in your app.
 * Copy this pattern to any component that needs multi-language support.
 */

export default function LanguageTestComponent() {
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage, languages } = useLanguage();

  return (
    <View style={{ padding: 20 }}>
      {/* Display current language */}
      <Text style={{ fontSize: 18, marginBottom: 20 }}>
        Current Language: {currentLanguage}
      </Text>

      {/* Using translations */}
      <Text style={{ fontSize: 16, marginBottom: 10 }}>
        {t('header.greeting.morning')}
      </Text>
      
      <Text style={{ fontSize: 16, marginBottom: 10 }}>
        {t('header.quoteOfTheDay')}
      </Text>

      {/* Language switcher buttons */}
      <View style={{ marginTop: 20 }}>
        <Text style={{ fontSize: 14, marginBottom: 10 }}>Quick Language Switch:</Text>
        {languages.map((lang) => (
          <TouchableOpacity
            key={lang.code}
            onPress={() => changeLanguage(lang.code)}
            style={{
              padding: 10,
              marginVertical: 5,
              backgroundColor: currentLanguage === lang.code ? '#D4A017' : '#F3F4F6',
              borderRadius: 8,
            }}
          >
            <Text style={{ color: currentLanguage === lang.code ? '#FFF' : '#000' }}>
              {lang.icon} {lang.name} - {lang.nativeName}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Translation Examples */}
      <View style={{ marginTop: 30 }}>
        <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 10 }}>
          Translation Examples:
        </Text>
        <Text>Save: {t('header.save')}</Text>
        <Text>Share: {t('header.share')}</Text>
        <Text>Listen: {t('header.listen')}</Text>
        <Text>Loading: {t('header.loading')}</Text>
        <Text>Guest: {t('header.guest')}</Text>
      </View>
    </View>
  );
}

/**
 * USAGE INSTRUCTIONS:
 * 
 * 1. Import this component anywhere in your app
 * 2. Render it to test language switching
 * 3. Copy the pattern to your own components
 * 
 * Key Points:
 * - useTranslation() gives you the t() function
 * - t('key.path') returns the translated string
 * - useLanguage() gives you language control
 * - All translations are in locales/ folder
 */
