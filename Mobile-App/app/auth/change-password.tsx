/**
 * Change Password Screen
 * Allows authenticated users to change their password
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

export default function ChangePasswordScreen() {
  const router = useRouter();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const validatePassword = (password: string): boolean => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  };

  const validateForm = (): boolean => {
    const newErrors: {
      currentPassword?: string;
      newPassword?: string;
      confirmPassword?: string;
    } = {};

    if (!currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (!validatePassword(newPassword)) {
      newErrors.newPassword = 'Password must be 8+ characters with uppercase, lowercase, and number';
    } else if (newPassword === currentPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await authService.changePassword({
        currentPassword,
        newPassword,
      });

      Alert.alert(
        'Password Changed Successfully! ✅',
        'Your password has been updated. Please use your new password on your next login.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );

      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      Alert.alert(
        'Change Password Failed',
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
              Change Password 🔐
            </Text>
            <Text className="text-base text-ancient-600">
              Update your password to keep your account secure
            </Text>
          </View>

          {/* Form */}
          <View className="px-6">
            {/* Current Password */}
            <View className="mb-4">
              <Text className="text-ancient-800 font-semibold mb-2">
                Current Password
              </Text>
              <View
                className={`flex-row items-center bg-white border ${
                  errors.currentPassword ? 'border-red-500' : 'border-ancient-200'
                } rounded-2xl px-4 py-3`}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={errors.currentPassword ? '#ef4444' : '#996f0a'}
                />
                <TextInput
                  className="flex-1 ml-3 text-ancient-800 text-base"
                  placeholder="Enter current password"
                  placeholderTextColor="#99999999"
                  value={currentPassword}
                  onChangeText={(text) => {
                    setCurrentPassword(text);
                    if (errors.currentPassword) {
                      setErrors({ ...errors, currentPassword: undefined });
                    }
                  }}
                  secureTextEntry={!showCurrentPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                  disabled={isLoading}
                >
                  <Ionicons
                    name={showCurrentPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#996f0a"
                  />
                </TouchableOpacity>
              </View>
              {errors.currentPassword && (
                <Text className="text-red-500 text-sm mt-1 ml-1">
                  {errors.currentPassword}
                </Text>
              )}
            </View>

            {/* New Password */}
            <View className="mb-4">
              <Text className="text-ancient-800 font-semibold mb-2">
                New Password
              </Text>
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
                <Text className="text-red-500 text-sm mt-1 ml-1">
                  {errors.newPassword}
                </Text>
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

            {/* Confirm New Password */}
            <View className="mb-6">
              <Text className="text-ancient-800 font-semibold mb-2">
                Confirm New Password
              </Text>
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
                <Text className="text-red-500 text-sm mt-1 ml-1">
                  {errors.confirmPassword}
                </Text>
              )}
            </View>

            {/* Change Password Button */}
            <TouchableOpacity
              onPress={handleChangePassword}
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
                    Update Password
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Security Tip */}
            <View className="bg-ancient-100 p-4 rounded-2xl mt-6 mb-8">
              <View className="flex-row items-start">
                <Ionicons name="shield-checkmark" size={20} color="#996f0a" />
                <View className="flex-1 ml-3">
                  <Text className="text-ancient-800 font-semibold text-sm mb-1">
                    Security Tip
                  </Text>
                  <Text className="text-ancient-600 text-xs">
                    Use a unique password that you don&apos;t use for other accounts. 
                    Consider using a password manager for better security.
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
