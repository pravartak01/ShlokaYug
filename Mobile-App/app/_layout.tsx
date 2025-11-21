import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import "../global.css";

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

    if (!isAuthenticated && !inAuthGroup) {
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
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
