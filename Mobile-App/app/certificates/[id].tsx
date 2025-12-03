/**
 * Certificate Screen
 * Displays course completion certificate
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import courseService from '../../services/courseService';

export default function CertificateScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [certificate, setCertificate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCertificate();
  }, [id]);

  const loadCertificate = async () => {
    try {
      setLoading(true);
      const response = await courseService.getCertificate(id as string);
      setCertificate(response.data?.certificate);
    } catch (error) {
      console.error('Error loading certificate:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I just completed ${certificate?.courseName}! 🎓\n\nCertificate ID: ${certificate?.certificateId}`,
        title: 'Course Completion Certificate',
      });
    } catch (error) {
      console.error('Error sharing certificate:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#f97316" />
          <Text className="text-gray-600 mt-4">Loading certificate...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!certificate) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle" size={64} color="#ef4444" />
          <Text className="text-gray-900 text-xl font-bold mt-4">Certificate Not Found</Text>
          <Text className="text-gray-600 text-center mt-2">
            Complete the course to earn your certificate
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-orange-500 px-6 py-3 rounded-lg mt-6"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gradient-to-br from-orange-50 to-orange-100">
      {/* Header */}
      <View className="px-4 py-4 flex-row items-center border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text className="text-gray-900 text-lg font-bold flex-1">Certificate</Text>
        <TouchableOpacity onPress={handleShare}>
          <Ionicons name="share-social" size={24} color="#f97316" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
        {/* Certificate Card */}
        <View className="bg-white rounded-3xl shadow-xl p-8 border-4 border-orange-500">
          {/* Header Badge */}
          <View className="items-center mb-6">
            <View className="bg-orange-500 rounded-full p-4 mb-3">
              <Ionicons name="trophy" size={48} color="white" />
            </View>
            <Text className="text-gray-900 text-2xl font-bold text-center">
              Certificate of Completion
            </Text>
            <View className="h-1 w-24 bg-orange-500 rounded-full mt-2" />
          </View>

          {/* Content */}
          <View className="mb-6">
            <Text className="text-gray-600 text-center text-base mb-4">This is to certify that</Text>

            <View className="bg-orange-50 py-4 px-6 rounded-xl mb-4">
              <Text className="text-orange-900 text-2xl font-bold text-center">
                {certificate.studentName}
              </Text>
            </View>

            <Text className="text-gray-600 text-center text-base mb-4">
              has successfully completed the course
            </Text>

            <Text className="text-gray-900 text-xl font-bold text-center mb-6">
              {certificate.courseName}
            </Text>
          </View>

          {/* Details Grid */}
          <View className="border-t border-gray-200 pt-6 mb-6">
            <View className="flex-row justify-between mb-3">
              <View className="flex-1">
                <Text className="text-gray-500 text-xs mb-1">Certificate ID</Text>
                <Text className="text-gray-900 text-sm font-semibold">
                  {certificate.certificateId}
                </Text>
              </View>
              <View className="flex-1 items-end">
                <Text className="text-gray-500 text-xs mb-1">Completion Date</Text>
                <Text className="text-gray-900 text-sm font-semibold">
                  {new Date(certificate.completedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>
            </View>

            <View className="flex-row justify-between">
              <View className="flex-1">
                <Text className="text-gray-500 text-xs mb-1">Instructor</Text>
                <Text className="text-gray-900 text-sm font-semibold">
                  {certificate.instructorName}
                </Text>
              </View>
              <View className="flex-1 items-end">
                <Text className="text-gray-500 text-xs mb-1">Duration</Text>
                <Text className="text-gray-900 text-sm font-semibold">
                  {certificate.courseDuration || 'N/A'}
                </Text>
              </View>
            </View>
          </View>

          {/* Footer Seal */}
          <View className="items-center">
            <View className="border-2 border-orange-500 rounded-full w-20 h-20 items-center justify-center bg-orange-50">
              <Ionicons name="ribbon" size={32} color="#f97316" />
            </View>
            <Text className="text-gray-500 text-xs mt-2">Verified Certificate</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View className="mt-6 space-y-3">
          <TouchableOpacity
            onPress={handleShare}
            className="bg-orange-500 py-4 rounded-xl flex-row items-center justify-center mb-3"
          >
            <Ionicons name="share-social" size={20} color="white" />
            <Text className="text-white font-bold text-base ml-2">Share Certificate</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-white border-2 border-orange-500 py-4 rounded-xl flex-row items-center justify-center">
            <Ionicons name="download" size={20} color="#f97316" />
            <Text className="text-orange-500 font-bold text-base ml-2">Download PDF</Text>
          </TouchableOpacity>
        </View>

        {/* Achievements */}
        <View className="mt-6 bg-white rounded-2xl p-6">
          <Text className="text-gray-900 text-lg font-bold mb-4">Course Achievements</Text>

          <View className="space-y-3">
            <View className="flex-row items-center">
              <View className="bg-green-500 rounded-full p-2 mr-3">
                <Ionicons name="checkmark" size={20} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-semibold">All Lectures Completed</Text>
                <Text className="text-gray-500 text-sm">
                  {certificate.totalLectures || 0} lectures
                </Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="bg-blue-500 rounded-full p-2 mr-3">
                <Ionicons name="time" size={20} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-semibold">Time Invested</Text>
                <Text className="text-gray-500 text-sm">
                  {certificate.totalWatchTime || '0 hours'}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <View className="bg-sandalwood-600 rounded-full p-2 mr-3">
                <Ionicons name="star" size={20} color="white" />
              </View>
              <View className="flex-1">
                <Text className="text-gray-900 font-semibold">Final Score</Text>
                <Text className="text-gray-500 text-sm">
                  {certificate.finalScore || '100%'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Verify Certificate */}
        <View className="mt-6 bg-orange-50 rounded-2xl p-6 border border-orange-200">
          <View className="flex-row items-start">
            <Ionicons name="shield-checkmark" size={24} color="#f97316" />
            <View className="flex-1 ml-3">
              <Text className="text-orange-900 font-bold mb-1">Verify This Certificate</Text>
              <Text className="text-orange-700 text-sm">
                Anyone can verify this certificate online using the Certificate ID
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
