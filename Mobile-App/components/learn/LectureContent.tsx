/**
 * LectureContent Component
 * Displays lecture description, resources, and downloads
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface LectureContentProps {
  lecture: any;
  courseId: string;
}

export default function LectureContent({ lecture, courseId }: LectureContentProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'resources'>('overview');

  // Safety check for undefined lecture
  if (!lecture) {
    return (
      <View className="bg-gray-800 p-4">
        <View className="items-center justify-center py-12">
          <Ionicons name="alert-circle-outline" size={64} color="#9ca3af" />
          <Text className="text-gray-400 text-center mt-4">
            No lecture selected. Please select a lecture from the curriculum.
          </Text>
        </View>
      </View>
    );
  }

  const handleDownloadResource = async (url: string, name: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Error opening resource:', error);
    }
  };

  return (
    <View className="bg-gray-800 p-4">
      {/* Lecture Title */}
      <Text className="text-white text-2xl font-bold mb-2">
        {lecture.title || 'Lecture Title'}
      </Text>

      {/* Meta Info */}
      <View className="flex-row items-center mb-4">
        <Ionicons name="time-outline" size={16} color="#9ca3af" />
        <Text className="text-gray-400 text-sm ml-1">
          {lecture.duration || '10'} minutes
        </Text>
        {lecture.type && (
          <>
            <Text className="text-gray-400 mx-2">•</Text>
            <Text className="text-gray-400 text-sm capitalize">{lecture.type}</Text>
          </>
        )}
      </View>

      {/* Tabs */}
      <View className="flex-row border-b border-gray-700 mb-4">
        <TouchableOpacity
          onPress={() => setActiveTab('overview')}
          className={`py-3 px-6 ${
            activeTab === 'overview' ? 'border-b-2 border-orange-500' : ''
          }`}
        >
          <Text
            className={`font-semibold ${
              activeTab === 'overview' ? 'text-orange-500' : 'text-gray-400'
            }`}
          >
            Overview
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('resources')}
          className={`py-3 px-6 ${
            activeTab === 'resources' ? 'border-b-2 border-orange-500' : ''
          }`}
        >
          <Text
            className={`font-semibold ${
              activeTab === 'resources' ? 'text-orange-500' : 'text-gray-400'
            }`}
          >
            Resources
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'overview' ? (
        <View>
          <Text className="text-white text-base leading-6">
            {lecture.description ||
              'This lecture covers important concepts and practical applications. Follow along with the video and take notes for better understanding.'}
          </Text>

          {/* Learning Objectives */}
          {lecture.objectives && lecture.objectives.length > 0 && (
            <View className="mt-6">
              <Text className="text-white font-bold text-lg mb-3">
                Learning Objectives
              </Text>
              {lecture.objectives.map((objective: string, index: number) => (
                <View key={index} className="flex-row mb-2">
                  <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                  <Text className="text-gray-300 ml-2 flex-1">{objective}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Key Points */}
          {lecture.keyPoints && lecture.keyPoints.length > 0 && (
            <View className="mt-6">
              <Text className="text-white font-bold text-lg mb-3">Key Points</Text>
              {lecture.keyPoints.map((point: string, index: number) => (
                <View key={index} className="flex-row mb-2">
                  <Text className="text-orange-500 font-bold mr-2">•</Text>
                  <Text className="text-gray-300 flex-1">{point}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      ) : (
        <View>
          {/* Resources List */}
          {lecture.resources && lecture.resources.length > 0 ? (
            lecture.resources.map((resource: any, index: number) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleDownloadResource(resource.url, resource.name)}
                className="bg-gray-700 rounded-lg p-4 mb-3 flex-row items-center justify-between"
              >
                <View className="flex-row items-center flex-1">
                  <View className="bg-orange-500 rounded-lg p-2 mr-3">
                    <Ionicons
                      name={
                        resource.type === 'pdf'
                          ? 'document-text'
                          : resource.type === 'video'
                          ? 'play'
                          : 'download'
                      }
                      size={24}
                      color="white"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-semibold">{resource.name}</Text>
                    <Text className="text-gray-400 text-sm mt-1">
                      {resource.type?.toUpperCase()} • {resource.size || 'N/A'}
                    </Text>
                  </View>
                </View>
                <Ionicons name="download-outline" size={24} color="#9ca3af" />
              </TouchableOpacity>
            ))
          ) : (
            <View className="items-center justify-center py-12">
              <Ionicons name="folder-open-outline" size={64} color="#4b5563" />
              <Text className="text-gray-400 text-center mt-4">
                No resources available for this lecture
              </Text>
            </View>
          )}

          {/* Sample Resources for Demo */}
          <View className="mt-4">
            <Text className="text-gray-400 text-sm mb-3">Sample Resources:</Text>
            <TouchableOpacity className="bg-gray-700 rounded-lg p-4 mb-3 flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="bg-orange-500 rounded-lg p-2 mr-3">
                  <Ionicons name="document-text" size={24} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-semibold">Lecture Notes</Text>
                  <Text className="text-gray-400 text-sm mt-1">PDF • 2.5 MB</Text>
                </View>
              </View>
              <Ionicons name="download-outline" size={24} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity className="bg-gray-700 rounded-lg p-4 flex-row items-center justify-between">
              <View className="flex-row items-center flex-1">
                <View className="bg-orange-500 rounded-lg p-2 mr-3">
                  <Ionicons name="code" size={24} color="white" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-semibold">Code Examples</Text>
                  <Text className="text-gray-400 text-sm mt-1">ZIP • 1.2 MB</Text>
                </View>
              </View>
              <Ionicons name="download-outline" size={24} color="#9ca3af" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}
