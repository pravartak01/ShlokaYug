/**
 * Login Screen
 * User authentication screen with email/username and password
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});

  const validateForm = (): boolean => {
    const newErrors: { identifier?: string; password?: string } = {};

    // Validate identifier (email or username)
    if (!identifier.trim()) {
      newErrors.identifier = 'Email or username is required';
    }

    // Validate password
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await login({ identifier: identifier.trim(), password });
      
      // Navigation will be handled by _layout.tsx based on auth state
      // Just show success message
      Alert.alert('Success', 'Welcome back to ShlokaYug!');
    } catch (error) {
      Alert.alert(
        'Login Failed',
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-ancient-50">
      <StatusBar barStyle="dark-content" backgroundColor="#fdf6e3" />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="px-6 pt-8 pb-6">
            <TouchableOpacity
              onPress={() => router.back()}
              className="w-10 h-10 bg-white rounded-full items-center justify-center mb-6 border border-ancient-200"
            >
              <Ionicons name="arrow-back" size={24} color="#996f0a" />
            </TouchableOpacity>

            <Text className="text-4xl font-bold text-ancient-800 mb-2">
              Welcome Back 🙏
            </Text>
            <Text className="text-base text-ancient-600">
              Sign in to continue your Sanskrit learning journey
            </Text>
          </View>

          {/* Login Form */}
          <View className="px-6">
            {/* Email/Username Input */}
            <View className="mb-4">
              <Text className="text-ancient-800 font-semibold mb-2">
                Email or Username
              </Text>
              <View
                className={`flex-row items-center bg-white border ${
                  errors.identifier ? 'border-red-500' : 'border-ancient-200'
                } rounded-2xl px-4 py-3`}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={errors.identifier ? '#ef4444' : '#996f0a'}
                />
                <TextInput
                  className="flex-1 ml-3 text-ancient-800 text-base"
                  placeholder="Enter your email or username"
                  placeholderTextColor="#99999999"
                  value={identifier}
                  onChangeText={(text) => {
                    setIdentifier(text);
                    if (errors.identifier) {
                      setErrors({ ...errors, identifier: undefined });
                    }
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  editable={!isLoading}
                />
              </View>
              {errors.identifier && (
                <Text className="text-red-500 text-sm mt-1 ml-1">
                  {errors.identifier}
                </Text>
              )}
            </View>

            {/* Password Input */}
            <View className="mb-4">
              <Text className="text-ancient-800 font-semibold mb-2">Password</Text>
              <View
                className={`flex-row items-center bg-white border ${
                  errors.password ? 'border-red-500' : 'border-ancient-200'
                } rounded-2xl px-4 py-3`}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={errors.password ? '#ef4444' : '#996f0a'}
                />
                <TextInput
                  className="flex-1 ml-3 text-ancient-800 text-base"
                  placeholder="Enter your password"
                  placeholderTextColor="#99999999"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errors.password) {
                      setErrors({ ...errors, password: undefined });
                    }
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#996f0a"
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text className="text-red-500 text-sm mt-1 ml-1">
                  {errors.password}
                </Text>
              )}
            </View>

            {/* Forgot Password Link */}
            <TouchableOpacity
              onPress={() => router.push('/auth/forgot-password')}
              className="self-end mb-6"
              disabled={isLoading}
            >
              <Text className="text-saffron-600 font-semibold">
                Forgot Password?
              </Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#f97316', '#ea580c']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="rounded-2xl py-4 items-center justify-center"
              >
                {isLoading ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text className="text-white font-bold text-lg">Sign In</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center my-6">
              <View className="flex-1 h-px bg-ancient-300" />
              <Text className="text-ancient-600 mx-4">or continue with</Text>
              <View className="flex-1 h-px bg-ancient-300" />
            </View>

            {/* Social Login Buttons */}
            <View className="flex-row justify-center space-x-4 mb-6">
              <TouchableOpacity
                className="flex-1 bg-white border border-ancient-200 rounded-2xl py-3 flex-row items-center justify-center"
                disabled={isLoading}
              >
                <Ionicons name="logo-google" size={24} color="#ea580c" />
                <Text className="text-ancient-800 font-semibold ml-2">
                  Google
                </Text>
              </TouchableOpacity>
            </View>

            {/* Register Link */}
            <View className="flex-row justify-center items-center mb-8">
              <Text className="text-ancient-600">Don&apos;t have an account? </Text>
              <TouchableOpacity
                onPress={() => router.push('/auth/register')}
                disabled={isLoading}
              >
                <Text className="text-saffron-600 font-bold">Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
