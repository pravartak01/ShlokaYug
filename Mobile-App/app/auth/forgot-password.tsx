/**
 * Forgot Password Screen
 * Request password reset email
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
import authService from '../../services/authService';

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    setError('');

    // Validate email
    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      await authService.forgotPassword({ email: email.trim().toLowerCase() });
      setEmailSent(true);
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <SafeAreaView className="flex-1 bg-ancient-50">
        <StatusBar barStyle="dark-content" backgroundColor="#fdf6e3" />
        
        <View className="flex-1 px-6 justify-center items-center">
          <View className="w-20 h-20 bg-saffron-100 rounded-full items-center justify-center mb-6">
            <Ionicons name="mail-outline" size={40} color="#f97316" />
          </View>
          
          <Text className="text-3xl font-bold text-ancient-800 mb-3 text-center">
            Check Your Email 📧
          </Text>
          
          <Text className="text-base text-ancient-600 text-center mb-8 px-4">
            We've sent a password reset link to{'\n'}
            <Text className="font-semibold text-ancient-800">{email}</Text>
          </Text>

          <View className="bg-ancient-100 p-4 rounded-2xl mb-8">
            <Text className="text-ancient-700 text-sm text-center">
              The link will expire in 10 minutes. If you don't see the email, check your spam folder.
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push('/auth/login')}
            activeOpacity={0.8}
            className="w-full"
          >
            <LinearGradient
              colors={['#f97316', '#ea580c']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="rounded-2xl py-4 items-center justify-center"
            >
              <Text className="text-white font-bold text-lg">Back to Login</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setEmailSent(false);
              setEmail('');
            }}
            className="mt-6"
          >
            <Text className="text-saffron-600 font-semibold">
              Try different email
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
          contentContainerStyle={{ flexGrow: 1 }}
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
              Forgot Password? 🔒
            </Text>
            <Text className="text-base text-ancient-600">
              Enter your email and we'll send you a link to reset your password
            </Text>
          </View>

          {/* Illustration */}
          <View className="items-center justify-center py-8">
            <View className="w-32 h-32 bg-saffron-100 rounded-full items-center justify-center">
              <Ionicons name="key-outline" size={64} color="#f97316" />
            </View>
          </View>

          {/* Form */}
          <View className="px-6 flex-1 justify-between">
            <View>
              {/* Email Input */}
              <View className="mb-6">
                <Text className="text-ancient-800 font-semibold mb-2">Email Address</Text>
                <View
                  className={`flex-row items-center bg-white border ${
                    error ? 'border-red-500' : 'border-ancient-200'
                  } rounded-2xl px-4 py-3`}
                >
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={error ? '#ef4444' : '#996f0a'}
                  />
                  <TextInput
                    className="flex-1 ml-3 text-ancient-800 text-base"
                    placeholder="Enter your registered email"
                    placeholderTextColor="#99999999"
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (error) setError('');
                    }}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    editable={!isLoading}
                  />
                </View>
                {error && (
                  <Text className="text-red-500 text-sm mt-1 ml-1">{error}</Text>
                )}
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmit}
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
                    <Text className="text-white font-bold text-lg">
                      Send Reset Link
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Back to Login Link */}
            <View className="flex-row justify-center items-center mb-8 mt-6">
              <Text className="text-ancient-600">Remember your password? </Text>
              <TouchableOpacity
                onPress={() => router.push('/auth/login')}
                disabled={isLoading}
              >
                <Text className="text-saffron-600 font-bold">Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
