/**
 * Register Screen
 * New user registration with form validation
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
import { RegisterData } from '../../services/authService';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    preferredScript: 'devanagari',
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterData | 'confirmPassword', string>>>({});

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateUsername = (username: string): boolean => {
    // Username: 3-20 characters, alphanumeric and underscore only
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    return usernameRegex.test(username);
  };

  const validatePassword = (password: string): boolean => {
    // Password: At least 8 characters, one uppercase, one lowercase, one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof RegisterData | 'confirmPassword', string>> = {};

    // Validate first name
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    // Validate last name
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate username
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (!validateUsername(formData.username)) {
      newErrors.username = 'Username must be 3-20 characters (letters, numbers, underscore)';
    }

    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be 8+ characters with uppercase, lowercase, and number';
    }

    // Validate confirm password
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await register({
        ...formData,
        email: formData.email.trim().toLowerCase(),
        username: formData.username.trim(),
      });

      Alert.alert(
        'Registration Successful! 🎉',
        'Please check your email to verify your account.',
        [
          {
            text: 'OK',
            onPress: () => router.push('/auth/verify-email'),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        'Registration Failed',
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: keyof RegisterData, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
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
              Create Account 📿
            </Text>
            <Text className="text-base text-ancient-600">
              Join ShlokaYug to start your Sanskrit learning journey
            </Text>
          </View>

          {/* Registration Form */}
          <View className="px-6">
            {/* First Name */}
            <View className="mb-4">
              <Text className="text-ancient-800 font-semibold mb-2">First Name</Text>
              <View
                className={`flex-row items-center bg-white border ${
                  errors.firstName ? 'border-red-500' : 'border-ancient-200'
                } rounded-2xl px-4 py-3`}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={errors.firstName ? '#ef4444' : '#996f0a'}
                />
                <TextInput
                  className="flex-1 ml-3 text-ancient-800 text-base"
                  placeholder="Enter your first name"
                  placeholderTextColor="#99999999"
                  value={formData.firstName}
                  onChangeText={(text) => updateField('firstName', text)}
                  autoCapitalize="words"
                  editable={!isLoading}
                />
              </View>
              {errors.firstName && (
                <Text className="text-red-500 text-sm mt-1 ml-1">{errors.firstName}</Text>
              )}
            </View>

            {/* Last Name */}
            <View className="mb-4">
              <Text className="text-ancient-800 font-semibold mb-2">Last Name</Text>
              <View
                className={`flex-row items-center bg-white border ${
                  errors.lastName ? 'border-red-500' : 'border-ancient-200'
                } rounded-2xl px-4 py-3`}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={errors.lastName ? '#ef4444' : '#996f0a'}
                />
                <TextInput
                  className="flex-1 ml-3 text-ancient-800 text-base"
                  placeholder="Enter your last name"
                  placeholderTextColor="#99999999"
                  value={formData.lastName}
                  onChangeText={(text) => updateField('lastName', text)}
                  autoCapitalize="words"
                  editable={!isLoading}
                />
              </View>
              {errors.lastName && (
                <Text className="text-red-500 text-sm mt-1 ml-1">{errors.lastName}</Text>
              )}
            </View>

            {/* Email */}
            <View className="mb-4">
              <Text className="text-ancient-800 font-semibold mb-2">Email</Text>
              <View
                className={`flex-row items-center bg-white border ${
                  errors.email ? 'border-red-500' : 'border-ancient-200'
                } rounded-2xl px-4 py-3`}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={errors.email ? '#ef4444' : '#996f0a'}
                />
                <TextInput
                  className="flex-1 ml-3 text-ancient-800 text-base"
                  placeholder="Enter your email"
                  placeholderTextColor="#99999999"
                  value={formData.email}
                  onChangeText={(text) => updateField('email', text)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  editable={!isLoading}
                />
              </View>
              {errors.email && (
                <Text className="text-red-500 text-sm mt-1 ml-1">{errors.email}</Text>
              )}
            </View>

            {/* Username */}
            <View className="mb-4">
              <Text className="text-ancient-800 font-semibold mb-2">Username</Text>
              <View
                className={`flex-row items-center bg-white border ${
                  errors.username ? 'border-red-500' : 'border-ancient-200'
                } rounded-2xl px-4 py-3`}
              >
                <Ionicons
                  name="at-outline"
                  size={20}
                  color={errors.username ? '#ef4444' : '#996f0a'}
                />
                <TextInput
                  className="flex-1 ml-3 text-ancient-800 text-base"
                  placeholder="Choose a unique username"
                  placeholderTextColor="#99999999"
                  value={formData.username}
                  onChangeText={(text) => updateField('username', text)}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
              </View>
              {errors.username && (
                <Text className="text-red-500 text-sm mt-1 ml-1">{errors.username}</Text>
              )}
            </View>

            {/* Password */}
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
                  placeholder="Create a strong password"
                  placeholderTextColor="#99999999"
                  value={formData.password}
                  onChangeText={(text) => updateField('password', text)}
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
                <Text className="text-red-500 text-sm mt-1 ml-1">{errors.password}</Text>
              )}
            </View>

            {/* Confirm Password */}
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
                  placeholder="Re-enter your password"
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

            {/* Register Button */}
            <TouchableOpacity
              onPress={handleRegister}
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
                  <Text className="text-white font-bold text-lg">Create Account</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Terms and Privacy */}
            <Text className="text-ancient-600 text-xs text-center mt-4 mb-6">
              By signing up, you agree to our{' '}
              <Text className="text-saffron-600 font-semibold">Terms of Service</Text> and{' '}
              <Text className="text-saffron-600 font-semibold">Privacy Policy</Text>
            </Text>

            {/* Login Link */}
            <View className="flex-row justify-center items-center mb-8">
              <Text className="text-ancient-600">Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/auth/login')} disabled={isLoading}>
                <Text className="text-saffron-600 font-bold">Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
