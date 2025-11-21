/**
 * Email Verification Screen
 * Verify email address with token or resend verification
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../../context/AuthContext';
import authService from '../../services/authService';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const { user, refreshUser } = useAuth();

  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    setIsVerifying(true);
    setErrorMessage('');

    try {
      await authService.verifyEmail(verificationToken);
      setVerificationStatus('success');
      
      // Refresh user data to update verification status
      if (user) {
        await refreshUser();
      }

      Alert.alert(
        'Email Verified! ✅',
        'Your email has been successfully verified. You can now access all features.',
        [
          {
            text: 'Continue',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (error) {
      setVerificationStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendVerification = async () => {
    setIsResending(true);
    setErrorMessage('');

    try {
      await authService.resendVerification();
      Alert.alert(
        'Email Sent! 📧',
        'A new verification email has been sent. Please check your inbox.'
      );
    } catch (error) {
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to resend verification email'
      );
    } finally {
      setIsResending(false);
    }
  };

  const handleSkipForNow = () => {
    router.replace('/(tabs)');
  };

  if (isVerifying) {
    return (
      <SafeAreaView className="flex-1 bg-ancient-50">
        <StatusBar barStyle="dark-content" backgroundColor="#fdf6e3" />
        
        <View className="flex-1 px-6 justify-center items-center">
          <ActivityIndicator size="large" color="#f97316" />
          <Text className="text-ancient-800 text-lg font-semibold mt-4">
            Verifying your email...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (verificationStatus === 'success') {
    return (
      <SafeAreaView className="flex-1 bg-ancient-50">
        <StatusBar barStyle="dark-content" backgroundColor="#fdf6e3" />
        
        <View className="flex-1 px-6 justify-center items-center">
          <View className="w-24 h-24 bg-green-100 rounded-full items-center justify-center mb-6">
            <Ionicons name="checkmark-circle" size={64} color="#22c55e" />
          </View>
          
          <Text className="text-3xl font-bold text-ancient-800 mb-3 text-center">
            Email Verified! ✅
          </Text>
          
          <Text className="text-base text-ancient-600 text-center mb-8 px-4">
            Your email has been successfully verified. You're all set!
          </Text>

          <TouchableOpacity
            onPress={() => router.replace('/(tabs)')}
            activeOpacity={0.8}
            className="w-full"
          >
            <LinearGradient
              colors={['#f97316', '#ea580c']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="rounded-2xl py-4 items-center justify-center"
            >
              <Text className="text-white font-bold text-lg">Continue to App</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-ancient-50">
      <StatusBar barStyle="dark-content" backgroundColor="#fdf6e3" />
      
      <View className="flex-1 px-6 justify-center items-center">
        {verificationStatus === 'error' ? (
          <>
            <View className="w-24 h-24 bg-red-100 rounded-full items-center justify-center mb-6">
              <Ionicons name="close-circle" size={64} color="#ef4444" />
            </View>
            
            <Text className="text-3xl font-bold text-ancient-800 mb-3 text-center">
              Verification Failed ❌
            </Text>
            
            <Text className="text-base text-ancient-600 text-center mb-4 px-4">
              {errorMessage || 'The verification link is invalid or has expired.'}
            </Text>
          </>
        ) : (
          <>
            <View className="w-24 h-24 bg-saffron-100 rounded-full items-center justify-center mb-6">
              <Ionicons name="mail-outline" size={64} color="#f97316" />
            </View>
            
            <Text className="text-3xl font-bold text-ancient-800 mb-3 text-center">
              Verify Your Email 📧
            </Text>
            
            <Text className="text-base text-ancient-600 text-center mb-4 px-4">
              We've sent a verification email to
            </Text>
            
            {user?.email && (
              <Text className="text-lg font-semibold text-ancient-800 mb-8">
                {user.email}
              </Text>
            )}
          </>
        )}

        <View className="bg-ancient-100 p-4 rounded-2xl mb-8 w-full">
          <Text className="text-ancient-700 text-sm text-center">
            {verificationStatus === 'error'
              ? 'Please request a new verification link.'
              : "Check your inbox and click the verification link. Don't forget to check your spam folder!"}
          </Text>
        </View>

        {/* Resend Verification Button */}
        {user && !user.isEmailVerified && (
          <TouchableOpacity
            onPress={handleResendVerification}
            disabled={isResending}
            activeOpacity={0.8}
            className="w-full mb-4"
          >
            <LinearGradient
              colors={['#f97316', '#ea580c']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="rounded-2xl py-4 items-center justify-center"
            >
              {isResending ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className="text-white font-bold text-lg">
                  Resend Verification Email
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Skip Button */}
        {user && (
          <TouchableOpacity
            onPress={handleSkipForNow}
            className="mt-4"
            disabled={isResending}
          >
            <Text className="text-ancient-600 font-semibold">
              Skip for now
            </Text>
          </TouchableOpacity>
        )}

        {/* Back to Login */}
        {!user && (
          <TouchableOpacity
            onPress={() => router.replace('/auth/login')}
            className="mt-4"
          >
            <Text className="text-saffron-600 font-semibold">
              Back to Login
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
