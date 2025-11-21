/**
 * Root Index - Redirects based on authentication status
 * The _layout.tsx handles the actual routing logic
 */

import { Redirect } from "expo-router";
import { useAuth } from "../context/AuthContext";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-ancient-50">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  // Redirect to appropriate screen based on auth status
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/auth/login" as any />;
}
