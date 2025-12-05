import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, StatusBar, Text, TouchableOpacity, Modal } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { useRouter } from 'expo-router';
import { useKidsMode } from '../../context/KidsModeContext';
import { KidsHeader } from './KidsHeader';
import { ActivityCard } from './ActivityCard';
import { KidsFooter } from './KidsFooter';
import { kidsActivities } from '../../constants/kidsActivities';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Language options
interface Language {
  code: string;
  name: string;
  icon: string; // Using icon names instead of flags
  speechCode: string;
}

const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', icon: 'language-outline', speechCode: 'en-US' },
  { code: 'hi', name: 'हिंदी', icon: 'book-outline', speechCode: 'hi-IN' },
  { code: 'mr', name: 'मराठी', icon: 'school-outline', speechCode: 'mr-IN' },
  { code: 'te', name: 'తెలుగు', icon: 'library-outline', speechCode: 'te-IN' },
  { code: 'ta', name: 'தமிழ்', icon: 'document-text-outline', speechCode: 'ta-IN' },
  { code: 'kn', name: 'ಕನ್ನಡ', icon: 'newspaper-outline', speechCode: 'kn-IN' },
  { code: 'bn', name: 'বাংলা', icon: 'reader-outline', speechCode: 'bn-IN' },
  { code: 'gu', name: 'ગુજરાતી', icon: 'pencil-outline', speechCode: 'gu-IN' },
];

const KidsHomeScreen = () => {
  const router = useRouter();
  const { setKidsMode } = useKidsMode();
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(LANGUAGES[0]);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  React.useEffect(() => {
    loadLanguagePreference();
  }, []);

  const loadLanguagePreference = async () => {
    try {
      const savedLang = await AsyncStorage.getItem('kidsLanguagePreference');
      if (savedLang) {
        const lang = LANGUAGES.find(l => l.code === savedLang);
        if (lang) {
          setSelectedLanguage(lang);
        }
      }
    } catch (error) {
      console.log('Error loading language preference:', error);
    }
  };

  const handleLanguageChange = async (language: Language) => {
    setSelectedLanguage(language);
    setShowLanguageModal(false);
    try {
      await AsyncStorage.setItem('kidsLanguagePreference', language.code);
      // Also save to global context for use in other screens
      await AsyncStorage.setItem('globalKidsLanguage', JSON.stringify(language));
    } catch (error) {
      console.log('Error saving language preference:', error);
    }
  };

  const handleBackToAdult = () => {
    setKidsMode(false);
  };

  const handleActivityPress = (route: string) => {
    router.push(route as any);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#fbbf24" />
      
      {/* Header */}
      <KidsHeader onBackPress={handleBackToAdult} />

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Language Selector Card */}
        <Animatable.View
          animation="fadeInDown"
          duration={800}
          delay={100}
          style={styles.languageCard}
        >
          <LinearGradient
            colors={['#ffffff', '#fef3c7']}
            style={styles.languageGradient}
          >
            <View style={styles.languageHeader}>
              <Ionicons name="language" size={32} color="#f59e0b" />
              <View style={styles.languageTextContainer}>
                <Text style={styles.languageLabel}>Learning Language</Text>
                <Text style={styles.languageSubLabel}>Choose your preferred language</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setShowLanguageModal(true)}
              style={styles.languageSelector}
              activeOpacity={0.7}
            >
              <View style={styles.selectedLanguageDisplay}>
                <View style={styles.iconCircle}>
                  <Ionicons name={selectedLanguage.icon as any} size={28} color="#f59e0b" />
                </View>
                <Text style={styles.selectedLanguageName}>{selectedLanguage.name}</Text>
              </View>
              <Ionicons name="chevron-forward-circle" size={28} color="#f59e0b" />
            </TouchableOpacity>
          </LinearGradient>
        </Animatable.View>

        {/* Language Selection Modal */}
        <Modal
          visible={showLanguageModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowLanguageModal(false)}
        >
          <View style={styles.modalOverlay}>
            <Animatable.View animation="zoomIn" duration={400} style={styles.modalContent}>
              <LinearGradient
                colors={['#fef3c7', '#fde68a']}
                style={styles.modalGradient}
              >
                <View style={styles.modalHeader}>
                  <Ionicons name="language" size={40} color="#f59e0b" />
                  <Text style={styles.modalTitle}>Choose Language</Text>
                  <Text style={styles.modalSubtitle}>भाषा चुनें</Text>
                </View>

                <ScrollView style={styles.languageList} showsVerticalScrollIndicator={false}>
                  {LANGUAGES.map((lang) => (
                    <TouchableOpacity
                      key={lang.code}
                      onPress={() => handleLanguageChange(lang)}
                      style={[
                        styles.languageItem,
                        selectedLanguage.code === lang.code && styles.languageItemSelected,
                      ]}
                      activeOpacity={0.7}
                    >
                      <View style={[
                        styles.languageIconCircle,
                        selectedLanguage.code === lang.code && styles.languageIconCircleSelected,
                      ]}>
                        <Ionicons 
                          name={lang.icon as any} 
                          size={32} 
                          color={selectedLanguage.code === lang.code ? '#10b981' : '#f59e0b'} 
                        />
                      </View>
                      <Text style={styles.languageName}>{lang.name}</Text>
                      {selectedLanguage.code === lang.code && (
                        <Ionicons name="checkmark-circle" size={28} color="#10b981" />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <TouchableOpacity
                  onPress={() => setShowLanguageModal(false)}
                  style={styles.modalCloseButton}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#f59e0b', '#d97706']}
                    style={styles.modalCloseGradient}
                  >
                    <Ionicons name="checkmark-circle" size={24} color="#ffffff" />
                    <Text style={styles.modalCloseText}>Done</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </LinearGradient>
            </Animatable.View>
          </View>
        </Modal>

        {/* Section Title */}
        <Animatable.Text
          animation="fadeIn"
          duration={800}
          delay={300}
          style={styles.sectionTitle}
        >
          Choose Your Adventure
        </Animatable.Text>

        {/* Activities Grid */}
        <View style={styles.activitiesContainer}>
          {kidsActivities.map((activity, index) => (
            <ActivityCard
              key={activity.id}
              title={activity.title}
              description={activity.description}
              colors={activity.colors}
              icon={activity.icon}
              badge={activity.badge}
              index={index}
              onPress={() => handleActivityPress(activity.route)}
            />
          ))}
        </View>

        {/* Footer */}
        <KidsFooter />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff5e6',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#f59e0b',
    textAlign: 'center',
    marginBottom: 24,
    letterSpacing: 1.2,
    textShadowColor: 'rgba(245, 158, 11, 0.2)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  activitiesContainer: {
    marginBottom: 8,
  },
  languageCard: {
    marginBottom: 24,
    borderRadius: 24,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  languageGradient: {
    padding: 20,
    borderWidth: 3,
    borderColor: '#fbbf24',
  },
  languageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  languageTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  languageLabel: {
    fontSize: 18,
    fontWeight: '900',
    color: '#f59e0b',
  },
  languageSubLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#78350f',
    marginTop: 2,
  },
  languageSelector: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#fbbf24',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  selectedLanguageDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  selectedLanguageName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#78350f',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 28,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  modalGradient: {
    padding: 24,
    borderWidth: 3,
    borderColor: '#fbbf24',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#f59e0b',
    marginTop: 12,
  },
  modalSubtitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#78350f',
    marginTop: 4,
  },
  languageList: {
    maxHeight: 400,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 18,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#fbbf24',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  languageItemSelected: {
    borderColor: '#10b981',
    backgroundColor: '#d1fae5',
    borderWidth: 3,
    elevation: 4,
    shadowOpacity: 0.2,
  },
  languageIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fef3c7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  languageIconCircleSelected: {
    backgroundColor: '#d1fae5',
    borderColor: '#10b981',
  },
  languageName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#78350f',
    flex: 1,
  },
  modalCloseButton: {
    marginTop: 20,
    borderRadius: 24,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  modalCloseGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  modalCloseText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    marginLeft: 8,
  },
});

export default KidsHomeScreen;
