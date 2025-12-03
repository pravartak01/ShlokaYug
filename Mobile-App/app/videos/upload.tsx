import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import videoService, { UploadProgress } from '../../services/videoService';

const CATEGORIES = [
  'sanskrit', 'chandas', 'spiritual', 'educational', 'tutorials', 'cultural'
];

const LANGUAGES = [
  { code: 'hindi', name: 'Hindi' },
  { code: 'english', name: 'English' },
  { code: 'sanskrit', name: 'Sanskrit' },
];

export default function UploadVideoScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [videoFile, setVideoFile] = useState<any>(null);
  const [videoType, setVideoType] = useState<'video' | 'short'>('video');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('educational');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [language, setLanguage] = useState('hindi');
  const [visibility, setVisibility] = useState<'public' | 'unlisted' | 'private'>('public');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const pickVideo = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        copyToCacheDirectory: true,
      });

      console.log('DocumentPicker result:', JSON.stringify(result, null, 2));

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        
        // Check file size (max 500MB)
        if (file.size && file.size > 500 * 1024 * 1024) {
          Alert.alert('Error', 'Video file size must be less than 500MB');
          return;
        }

        console.log('Selected file:', {
          uri: file.uri,
          name: file.name,
          size: file.size,
          mimeType: file.mimeType,
        });

        setVideoFile(file);
        setStep(2);
      }
    } catch (error) {
      console.error('Error picking video:', error);
      Alert.alert('Error', 'Failed to pick video');
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const addHashtag = () => {
    if (hashtagInput.trim() && !hashtags.includes(hashtagInput.trim())) {
      setHashtags([...hashtags, hashtagInput.trim().replace('#', '')]);
      setHashtagInput('');
    }
  };

  const handleUpload = async () => {
    if (!videoFile || !title.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    console.log('Starting upload with file:', {
      uri: videoFile.uri,
      name: videoFile.name,
      size: videoFile.size,
      mimeType: videoFile.mimeType,
    });

    try {
      setUploading(true);
      
      const metadata = {
        title,
        description,
        type: videoType,
        category,
        tags,
        language,
        visibility,
        hashtags: videoType === 'short' ? hashtags : undefined,
      };

      await videoService.uploadVideo(videoFile, metadata, (progress: UploadProgress) => {
        setUploadProgress(progress.percentage);
      });

      Alert.alert(
        'Success',
        'Video uploaded successfully! It will be processed and available shortly.',
        [
          {
            text: 'OK',
            onPress: () => router.push('/(tabs)/videos'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Upload error:', error);
      Alert.alert('Upload Failed', error.response?.data?.message || 'Failed to upload video');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  if (uploading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <LinearGradient
          colors={['#a0704a', '#4A2E1C']}
          className="flex-1 items-center justify-center px-8"
        >
          <View className="bg-white rounded-3xl p-8 w-full items-center">
            <Ionicons name="cloud-upload" size={64} color="#a0704a" />
            <Text className="text-gray-900 text-2xl font-bold mt-4">Uploading Video</Text>
            <Text className="text-gray-600 text-center mt-2 mb-6">
              Please wait while we upload your video to the cloud
            </Text>
            
            {/* Progress Bar */}
            <View className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mb-3">
              <View
                className="bg-[#DD7A1F] h-full rounded-full"
                style={{ width: `${uploadProgress}%` }}
              />
            </View>
            <Text className="text-[#DD7A1F] font-bold text-lg">{uploadProgress}%</Text>
            
            <Text className="text-gray-500 text-sm mt-4 text-center">
              This may take a few minutes depending on video size
            </Text>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3 flex-row items-center justify-between">
        <TouchableOpacity
          onPress={() => {
            if (step === 1) {
              router.back();
            } else {
              setStep(step - 1);
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text className="text-gray-900 text-lg font-bold">
          Upload Video • Step {step} of 4
        </Text>
        <View className="w-6" />
      </View>

      {/* Step Indicator */}
      <View className="bg-white px-4 py-3 flex-row items-center">
        <View className={`flex-1 h-1 rounded ${step >= 1 ? 'bg-[#DD7A1F]' : 'bg-gray-200'}`} />
        <View className={`flex-1 h-1 rounded ml-2 ${step >= 2 ? 'bg-[#DD7A1F]' : 'bg-gray-200'}`} />
        <View className={`flex-1 h-1 rounded ml-2 ${step >= 3 ? 'bg-[#DD7A1F]' : 'bg-gray-200'}`} />
        <View className={`flex-1 h-1 rounded ml-2 ${step >= 4 ? 'bg-[#DD7A1F]' : 'bg-gray-200'}`} />
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {step === 1 && (
          <View className="p-6">
            <Text className="text-gray-900 text-2xl font-bold mb-2">Choose Video Type</Text>
            <Text className="text-gray-600 mb-6">
              Select the type of content you want to upload
            </Text>

            {/* Video Type Selection */}
            <TouchableOpacity
              onPress={() => setVideoType('video')}
              className={`p-6 rounded-2xl mb-4 border-2 ${
                videoType === 'video'
                  ? 'bg-[#FEF3E8] border-[#B87333]'
                  : 'bg-white border-gray-200'
              }`}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className={`w-12 h-12 rounded-full items-center justify-center ${
                    videoType === 'video' ? 'bg-[#B87333]' : 'bg-gray-200'
                  }`}>
                    <Ionicons
                      name="videocam"
                      size={24}
                      color={videoType === 'video' ? 'white' : '#6b7280'}
                    />
                  </View>
                  <View className="ml-4 flex-1">
                    <Text className={`font-bold text-lg ${
                      videoType === 'video' ? 'text-[#4A2E1C]' : 'text-gray-900'
                    }`}>
                      Regular Video
                    </Text>
                    <Text className="text-gray-600 text-sm mt-1">
                      Full-length educational content, tutorials, and lectures
                    </Text>
                  </View>
                </View>
                {videoType === 'video' && (
                  <Ionicons name="checkmark-circle" size={24} color="#B87333" />
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setVideoType('short')}
              className={`p-6 rounded-2xl border-2 ${
                videoType === 'short'
                  ? 'bg-[#FEF3E8] border-[#DD7A1F]'
                  : 'bg-white border-gray-200'
              }`}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View className={`w-12 h-12 rounded-full items-center justify-center ${
                    videoType === 'short' ? 'bg-[#DD7A1F]' : 'bg-gray-200'
                  }`}>
                    <Ionicons
                      name="flash"
                      size={24}
                      color={videoType === 'short' ? 'white' : '#6b7280'}
                    />
                  </View>
                  <View className="ml-4 flex-1">
                    <Text className={`font-bold text-lg ${
                      videoType === 'short' ? 'text-[#4A2E1C]' : 'text-gray-900'
                    }`}>
                      Short Video
                    </Text>
                    <Text className="text-gray-600 text-sm mt-1">
                      Vertical videos up to 60 seconds for quick consumption
                    </Text>
                  </View>
                </View>
                {videoType === 'short' && (
                  <Ionicons name="checkmark-circle" size={24} color="#DD7A1F" />
                )}
              </View>
            </TouchableOpacity>

            {/* Next Button */}
            <TouchableOpacity
              onPress={() => setStep(2)}
              className="mt-8 rounded-xl py-4 shadow-lg"
            >
              <LinearGradient
                colors={videoType === 'video' ? ['#B87333', '#4A2E1C'] : ['#DD7A1F', '#B87333']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="rounded-xl py-4 flex-row items-center justify-center"
              >
                <Text className="text-white text-center font-bold text-lg mr-2">
                  Continue
                </Text>
                <Ionicons name="arrow-forward" size={24} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {step === 2 && (
          <View className="p-6">
            <Text className="text-gray-900 text-2xl font-bold mb-2">Select Video File</Text>
            <Text className="text-gray-600 mb-6">
              Choose a {videoType === 'short' ? 'short video (up to 60 seconds)' : 'video'} from your device
            </Text>

            {/* Video File Picker */}
            {!videoFile ? (
              <TouchableOpacity
                onPress={pickVideo}
                className="border-2 border-dashed border-[#B87333] bg-[#FEF3E8] rounded-2xl py-16 items-center justify-center"
              >
                <View className="w-20 h-20 bg-[#DD7A1F] rounded-full items-center justify-center mb-4">
                  <Ionicons name="cloud-upload" size={40} color="white" />
                </View>
                <Text className="text-[#4A2E1C] font-bold text-lg mb-2">
                  Select Video File
                </Text>
                <Text className="text-gray-600 text-sm text-center px-8">
                  Tap to browse and select a video from your device
                </Text>
                <Text className="text-gray-500 text-xs text-center mt-3">
                  Maximum file size: 500MB
                </Text>
              </TouchableOpacity>
            ) : (
              <>
                {/* Selected Video Preview */}
                <View className="bg-white border-2 border-[#B87333] rounded-xl p-4 mb-4">
                  <View className="flex-row items-center">
                    <View className="w-16 h-16 bg-[#FEF3E8] rounded-xl items-center justify-center mr-4">
                      <Ionicons name="videocam" size={32} color="#B87333" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-gray-900 font-semibold" numberOfLines={1}>
                        {videoFile.name}
                      </Text>
                      <Text className="text-gray-500 text-sm mt-1">
                        {videoFile.size ? `${(videoFile.size / (1024 * 1024)).toFixed(2)} MB` : 'Unknown size'}
                      </Text>
                      <View className="flex-row items-center mt-1">
                        <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                        <Text className="text-green-600 text-xs font-semibold ml-1">
                          Ready to upload
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Change Video Button */}
                <TouchableOpacity
                  onPress={pickVideo}
                  className="bg-gray-100 rounded-xl py-3 mb-6 flex-row items-center justify-center"
                >
                  <Ionicons name="refresh" size={20} color="#6b7280" />
                  <Text className="text-gray-700 font-semibold ml-2">
                    Choose Different Video
                  </Text>
                </TouchableOpacity>

                {/* Continue Button */}
                <TouchableOpacity
                  onPress={() => setStep(3)}
                  className="rounded-xl shadow-lg"
                >
                  <LinearGradient
                    colors={['#B87333', '#4A2E1C']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    className="rounded-xl py-4 flex-row items-center justify-center"
                  >
                    <Text className="text-white text-center font-bold text-lg mr-2">
                      Continue to Details
                    </Text>
                    <Ionicons name="arrow-forward" size={24} color="white" />
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        {step === 3 && videoFile && (
          <View className="p-6">
            <Text className="text-gray-900 text-2xl font-bold mb-2">Video Details</Text>
            <Text className="text-gray-600 mb-6">
              Add information about your video
            </Text>

            {/* Title */}
            <Text className="text-gray-900 font-semibold mb-2">Title *</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Enter video title..."
              className="bg-white border border-gray-300 rounded-xl px-4 py-3 mb-4 text-gray-900"
              maxLength={100}
            />

            {/* Description */}
            <Text className="text-gray-900 font-semibold mb-2">Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Tell viewers about your video..."
              className="bg-white border border-gray-300 rounded-xl px-4 py-3 mb-4 text-gray-900"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={5000}
            />

            {/* Category */}
            <Text className="text-gray-900 font-semibold mb-2">Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  className={`mr-2 px-4 py-2 rounded-full ${
                    category === cat ? 'bg-[#DD7A1F]' : 'bg-gray-200'
                  }`}
                >
                  <Text
                    className={`font-semibold capitalize ${
                      category === cat ? 'text-white' : 'text-gray-700'
                    }`}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Tags */}
            <Text className="text-gray-900 font-semibold mb-2">Tags</Text>
            <View className="flex-row items-center mb-2">
              <TextInput
                value={tagInput}
                onChangeText={setTagInput}
                placeholder="Add tag..."
                className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 mr-2"
                onSubmitEditing={addTag}
              />
              <TouchableOpacity
                onPress={addTag}
                className="bg-[#DD7A1F] rounded-xl px-4 py-3"
              >
                <Text className="text-white font-semibold">Add</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row flex-wrap mb-4">
              {tags.map((tag, index) => (
                <View key={index} className="bg-[#FEF3E8] rounded-full px-3 py-1 mr-2 mb-2 flex-row items-center">
                  <Text className="text-[#B87333] font-semibold mr-1">{tag}</Text>
                  <TouchableOpacity onPress={() => setTags(tags.filter((_, i) => i !== index))}>
                    <Ionicons name="close-circle" size={16} color="#B87333" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Hashtags (for shorts) */}
            {videoType === 'short' && (
              <>
                <Text className="text-gray-900 font-semibold mb-2">Hashtags</Text>
                <View className="flex-row items-center mb-2">
                  <TextInput
                    value={hashtagInput}
                    onChangeText={setHashtagInput}
                    placeholder="Add hashtag..."
                    className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 mr-2"
                    onSubmitEditing={addHashtag}
                  />
                  <TouchableOpacity
                    onPress={addHashtag}
                    className="bg-[#DD7A1F] rounded-xl px-4 py-3"
                  >
                    <Text className="text-white font-semibold">Add</Text>
                  </TouchableOpacity>
                </View>
                <View className="flex-row flex-wrap mb-4">
                  {hashtags.map((tag, index) => (
                    <View key={index} className="bg-[#FEF3E8] rounded-full px-3 py-1 mr-2 mb-2 flex-row items-center">
                      <Text className="text-[#DD7A1F] font-semibold mr-1">#{tag}</Text>
                      <TouchableOpacity onPress={() => setHashtags(hashtags.filter((_, i) => i !== index))}>
                        <Ionicons name="close-circle" size={16} color="#DD7A1F" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </>
            )}

            <TouchableOpacity
              onPress={() => setStep(4)}
              disabled={!title.trim()}
              className={`rounded-xl py-4 mt-4 shadow-lg ${!title.trim() ? 'opacity-50' : ''}`}
            >
              <LinearGradient
                colors={['#B87333', '#4A2E1C']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="rounded-xl py-4 flex-row items-center justify-center"
              >
                <Text className="text-white text-center font-bold text-lg mr-2">Continue</Text>
                <Ionicons name="arrow-forward" size={24} color="white" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {step === 4 && (
          <View className="p-6">
            <Text className="text-gray-900 text-2xl font-bold mb-2">Publish Settings</Text>
            <Text className="text-gray-600 mb-6">
              Choose who can see your video
            </Text>

            {/* Language */}
            <Text className="text-gray-900 font-semibold mb-3">Language</Text>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                onPress={() => setLanguage(lang.code)}
                className={`p-4 rounded-xl mb-3 border ${
                  language === lang.code
                    ? 'bg-[#FEF3E8] border-[#B87333]'
                    : 'bg-white border-gray-200'
                }`}
              >
                <View className="flex-row items-center justify-between">
                  <Text
                    className={`font-semibold ${
                      language === lang.code ? 'text-[#B87333]' : 'text-gray-900'
                    }`}
                  >
                    {lang.name}
                  </Text>
                  {language === lang.code && (
                    <Ionicons name="checkmark-circle" size={24} color="#B87333" />
                  )}
                </View>
              </TouchableOpacity>
            ))}

            {/* Visibility */}
            <Text className="text-gray-900 font-semibold mb-3 mt-4">Visibility</Text>
            
            <TouchableOpacity
              onPress={() => setVisibility('public')}
              className={`p-4 rounded-xl mb-3 border ${
                visibility === 'public'
                  ? 'bg-green-50 border-green-500'
                  : 'bg-white border-gray-200'
              }`}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className={`font-semibold ${
                    visibility === 'public' ? 'text-green-700' : 'text-gray-900'
                  }`}>
                    Public
                  </Text>
                  <Text className="text-gray-600 text-sm mt-1">
                    Everyone can watch your video
                  </Text>
                </View>
                {visibility === 'public' && (
                  <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setVisibility('unlisted')}
              className={`p-4 rounded-xl mb-3 border ${
                visibility === 'unlisted'
                  ? 'bg-yellow-50 border-yellow-500'
                  : 'bg-white border-gray-200'
              }`}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className={`font-semibold ${
                    visibility === 'unlisted' ? 'text-yellow-700' : 'text-gray-900'
                  }`}>
                    Unlisted
                  </Text>
                  <Text className="text-gray-600 text-sm mt-1">
                    Anyone with the link can watch
                  </Text>
                </View>
                {visibility === 'unlisted' && (
                  <Ionicons name="checkmark-circle" size={24} color="#eab308" />
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setVisibility('private')}
              className={`p-4 rounded-xl mb-6 border ${
                visibility === 'private'
                  ? 'bg-red-50 border-red-500'
                  : 'bg-white border-gray-200'
              }`}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className={`font-semibold ${
                    visibility === 'private' ? 'text-red-700' : 'text-gray-900'
                  }`}>
                    Private
                  </Text>
                  <Text className="text-gray-600 text-sm mt-1">
                    Only you can watch this video
                  </Text>
                </View>
                {visibility === 'private' && (
                  <Ionicons name="checkmark-circle" size={24} color="#ef4444" />
                )}
              </View>
            </TouchableOpacity>

            {/* Upload Button */}
            <TouchableOpacity
              onPress={handleUpload}
              disabled={!title.trim()}
              className={`rounded-xl shadow-lg ${!title.trim() ? 'opacity-50' : ''}`}
            >
              <LinearGradient
                colors={['#10b981', '#059669']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="rounded-xl py-4 flex-row items-center justify-center"
              >
                <Ionicons name="cloud-upload" size={24} color="white" />
                <Text className="text-white text-center font-bold text-lg ml-2">
                  Upload Video
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <Text className="text-gray-500 text-xs text-center mt-4">
              By uploading, you agree to our Terms of Service and Community Guidelines
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
