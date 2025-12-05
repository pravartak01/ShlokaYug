import { useEffect, useCallback } from 'react';
import { Slot, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { KidsModeProvider } from '../context/KidsModeContext';
import { LanguageProvider } from '../context/LanguageContext';
import { ChatBotProvider } from '../context/ChatBotContext';
import { FloatingChatBot } from '../components/chatbot/FloatingChatBot';
import { View, ActivityIndicator, Text } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from '../hooks/useFonts';
import "../global.css";
import '../i18n.config'; // Initialize i18n

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

/**
 * Protected Route Logic
 * Redirects users based on authentication state
 */
function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return; // Don't do anything while loading

    const inAuthGroup = segments[0] === 'auth';
    const inTabsGroup = segments[0] === '(tabs)';

    if (!isAuthenticated && inAuthGroup !== true && segments[0] !== undefined) {
      // User is not signed in and trying to access protected routes
      router.replace('/auth/login');
    } else if (isAuthenticated && inAuthGroup) {
      // User is signed in but on auth screens
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments, isLoading]);

  // Show loading screen while checking auth status
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-ancient-50">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  const { fontsLoaded, fontError } = useFonts();

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded || fontError) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

  // Show loading screen while fonts are loading
  if (!fontsLoaded && !fontError) {
    return (
      <View className="flex-1 items-center justify-center bg-ancient-50">
        <ActivityIndicator size="large" color="#f97316" />
        <Text className="mt-4 text-sandalwood-700 text-base">Loading ShlokaYug...</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AuthProvider>
          <KidsModeProvider>
            <ChatBotProvider>
              <RootLayoutNav />
              <FloatingChatBot />
            </ChatBotProvider>
          </KidsModeProvider>
        </AuthProvider>
      </LanguageProvider>
    </SafeAreaProvider>
  );
}
