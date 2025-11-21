/**
 * Reset Password Screen
 * Set new password using reset token
 */

import React, { useState, useEffect } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import authService from '../../services/authService';

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string }>();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string }>({});

  useEffect(() => {
    if (!token) {
      Alert.alert(
        'Invalid Link',
        'This password reset link is invalid or has expired. Please request a new one.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/auth/forgot-password'),
          },
        ]
      );
    }
  }, [token]);

  const validatePassword = (password: string): boolean => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  };

  const validateForm = (): boolean => {
    const newErrors: { newPassword?: string; confirmPassword?: string } = {};

    if (!newPassword) {
      newErrors.newPassword = 'Password is required';
    } else if (!validatePassword(newPassword)) {
      newErrors.newPassword = 'Password must be 8+ characters with uppercase, lowercase, and number';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!token) {
      Alert.alert('Error', 'Invalid reset token');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await authService.resetPassword({
        token,
        newPassword,
      });

      Alert.alert(
        'Password Reset Successful! ✅',
        'Your password has been reset. You can now login with your new password.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/auth/login'),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Reset Failed',
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return null;
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
        >
          {/* Header */}
          <View className="px-6 pt-8 pb-6">
            <Text className="text-4xl font-bold text-ancient-800 mb-2">
              Reset Password 🔐
            </Text>
            <Text className="text-base text-ancient-600">
              Please enter your new password
            </Text>
          </View>

          {/* Illustration */}
          <View className="items-center justify-center py-8">
            <View className="w-32 h-32 bg-saffron-100 rounded-full items-center justify-center">
              <Ionicons name="shield-checkmark-outline" size={64} color="#f97316" />
            </View>
          </View>

          {/* Form */}
          <View className="px-6">
            {/* New Password Input */}
            <View className="mb-4">
              <Text className="text-ancient-800 font-semibold mb-2">New Password</Text>
              <View
                className={`flex-row items-center bg-white border ${
                  errors.newPassword ? 'border-red-500' : 'border-ancient-200'
                } rounded-2xl px-4 py-3`}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={errors.newPassword ? '#ef4444' : '#996f0a'}
                />
                <TextInput
                  className="flex-1 ml-3 text-ancient-800 text-base"
                  placeholder="Enter new password"
                  placeholderTextColor="#99999999"
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    if (errors.newPassword) {
                      setErrors({ ...errors, newPassword: undefined });
                    }
                  }}
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword(!showNewPassword)}
                  disabled={isLoading}
                >
                  <Ionicons
                    name={showNewPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#996f0a"
                  />
                </TouchableOpacity>
              </View>
              {errors.newPassword && (
                <Text className="text-red-500 text-sm mt-1 ml-1">{errors.newPassword}</Text>
              )}
              
              {/* Password Requirements */}
              <View className="bg-ancient-100 p-3 rounded-xl mt-2">
                <Text className="text-ancient-700 text-xs font-semibold mb-1">
                  Password must contain:
                </Text>
                <Text className="text-ancient-600 text-xs">• At least 8 characters</Text>
                <Text className="text-ancient-600 text-xs">• One uppercase letter</Text>
                <Text className="text-ancient-600 text-xs">• One lowercase letter</Text>
                <Text className="text-ancient-600 text-xs">• One number</Text>
              </View>
            </View>

            {/* Confirm Password Input */}
            <View className="mb-6">
              <Text className="text-ancient-800 font-semibold mb-2">Confirm Password</Text>
              <View
                className={`flex-row items-center bg-white border ${
                  errors.confirmPassword ? 'border-red-500' : 'border-ancient-200'
                } rounded-2xl px-4 py-3`}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={errors.confirmPassword ? '#ef4444' : '#996f0a'}
                />
                <TextInput
                  className="flex-1 ml-3 text-ancient-800 text-base"
                  placeholder="Confirm new password"
                  placeholderTextColor="#99999999"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errors.confirmPassword) {
                      setErrors({ ...errors, confirmPassword: undefined });
                    }
                  }}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#996f0a"
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text className="text-red-500 text-sm mt-1 ml-1">{errors.confirmPassword}</Text>
              )}
            </View>

            {/* Reset Button */}
            <TouchableOpacity
              onPress={handleResetPassword}
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
                    Reset Password
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Back to Login Link */}
            <View className="flex-row justify-center items-center mt-6 mb-8">
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
