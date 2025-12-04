/**
 * CreatePostModal Component - Modal for creating new posts
 * Supports text, images, video sharing, and hashtags
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: {
    text: string;
    images?: any[];
    hashtags?: string[];
    visibility: 'public' | 'followers' | 'private';
  }) => Promise<void>;
  userAvatar?: string;
  userName?: string;
}

const MAX_CHARS = 500;
const MAX_IMAGES = 4;

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  visible,
  onClose,
  onSubmit,
  userAvatar,
  userName = 'User',
}) => {
  const [text, setText] = useState('');
  const [images, setImages] = useState<any[]>([]);
  const [visibility, setVisibility] = useState<'public' | 'followers' | 'private'>('public');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVisibilityOptions, setShowVisibilityOptions] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const charsRemaining = MAX_CHARS - text.length;
  const canPost = text.trim().length > 0 || images.length > 0;

  const extractHashtags = (content: string): string[] => {
    const matches = content.match(/#[\w\u0900-\u097F]+/g);
    return matches ? matches.map(tag => tag.slice(1).toLowerCase()) : [];
  };

  const handlePickImages = async () => {
    if (images.length >= MAX_IMAGES) {
      Alert.alert('Limit Reached', `You can only add up to ${MAX_IMAGES} images.`);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // Will be updated in next expo-image-picker version
      allowsMultipleSelection: true,
      selectionLimit: MAX_IMAGES - images.length,
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages([...images, ...result.assets].slice(0, MAX_IMAGES));
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!canPost || isSubmitting) return;

    setIsSubmitting(true);
    Keyboard.dismiss();

    try {
      await onSubmit({
        text: text.trim(),
        images: images.length > 0 ? images : undefined,
        hashtags: extractHashtags(text),
        visibility,
      });

      // Reset form
      setText('');
      setImages([]);
      setVisibility('public');
      onClose();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (text.trim() || images.length > 0) {
      Alert.alert(
        'Discard Post?',
        'You have unsaved changes. Are you sure you want to discard this post?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { 
            text: 'Discard', 
            style: 'destructive',
            onPress: () => {
              setText('');
              setImages([]);
              onClose();
            }
          },
        ]
      );
    } else {
      onClose();
    }
  };

  const visibilityOptions = [
    { value: 'public', label: 'Public', icon: 'earth', description: 'Anyone can see' },
    { value: 'followers', label: 'Followers', icon: 'people', description: 'Only followers' },
    { value: 'private', label: 'Private', icon: 'lock-closed', description: 'Only you' },
  ];

  const currentVisibility = visibilityOptions.find(v => v.value === visibility);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView className="flex-1 bg-white">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
            <TouchableOpacity onPress={handleClose}>
              <Text className="text-gray-600 text-base">Cancel</Text>
            </TouchableOpacity>

            <Text className="text-gray-900 font-bold text-lg">New Post</Text>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!canPost || isSubmitting}
              className={`px-5 py-2 rounded-full ${
                canPost && !isSubmitting ? 'bg-orange-500' : 'bg-gray-300'
              }`}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className={`font-bold ${canPost ? 'text-white' : 'text-gray-500'}`}>
                  Post
                </Text>
              )}
            </TouchableOpacity>
          </View>

          <ScrollView 
            className="flex-1" 
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ flexGrow: 1 }}
          >
            <View className="flex-row px-4 pt-4">
              {/* Avatar */}
              {userAvatar ? (
                <Image
                  source={{ uri: userAvatar }}
                  className="w-12 h-12 rounded-full bg-gray-300"
                />
              ) : (
                <View className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 items-center justify-center">
                  <Text className="text-white font-bold text-lg">
                    {userName[0]?.toUpperCase()}
                  </Text>
                </View>
              )}

              {/* Input */}
              <View className="flex-1 ml-3">
                <TextInput
                  ref={inputRef}
                  value={text}
                  onChangeText={setText}
                  placeholder="What's on your mind? Share your Sanskrit journey..."
                  placeholderTextColor="#9ca3af"
                  multiline
                  maxLength={MAX_CHARS}
                  className="text-gray-900 text-lg leading-6 min-h-[120px]"
                  autoFocus
                />

                {/* Images Preview */}
                {images.length > 0 && (
                  <View className="flex-row flex-wrap mt-3 -mx-1">
                    {images.map((image, index) => (
                      <View key={index} className="w-1/2 p-1">
                        <View className="relative">
                          <Image
                            source={{ uri: image.uri }}
                            className="w-full h-32 rounded-xl bg-gray-200"
                            resizeMode="cover"
                          />
                          <TouchableOpacity
                            onPress={() => handleRemoveImage(index)}
                            className="absolute top-2 right-2 bg-black/70 rounded-full p-1"
                          >
                            <Ionicons name="close" size={16} color="white" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </ScrollView>

          {/* Bottom Bar */}
          <View className="border-t border-gray-200 px-4 py-3">
            {/* Character count */}
            <View className="flex-row justify-between items-center mb-3">
              <View className="flex-row items-center">
                <Text 
                  className={`text-sm ${
                    charsRemaining < 50 
                      ? charsRemaining < 0 
                        ? 'text-red-500' 
                        : 'text-orange-500' 
                      : 'text-gray-500'
                  }`}
                >
                  {charsRemaining} characters remaining
                </Text>
              </View>

              {/* Visibility Selector */}
              <TouchableOpacity
                onPress={() => setShowVisibilityOptions(!showVisibilityOptions)}
                className="flex-row items-center bg-gray-100 px-3 py-1.5 rounded-full"
              >
                <Ionicons 
                  name={currentVisibility?.icon as any} 
                  size={14} 
                  color="#6b7280" 
                />
                <Text className="text-gray-600 text-sm ml-1.5">
                  {currentVisibility?.label}
                </Text>
                <Ionicons name="chevron-down" size={14} color="#6b7280" className="ml-1" />
              </TouchableOpacity>
            </View>

            {/* Visibility Options Dropdown */}
            {showVisibilityOptions && (
              <View className="bg-gray-50 rounded-xl mb-3 overflow-hidden">
                {visibilityOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => {
                      setVisibility(option.value as any);
                      setShowVisibilityOptions(false);
                    }}
                    className={`flex-row items-center px-4 py-3 ${
                      visibility === option.value ? 'bg-orange-50' : ''
                    }`}
                  >
                    <View className={`w-8 h-8 rounded-full items-center justify-center ${
                      visibility === option.value ? 'bg-orange-100' : 'bg-gray-200'
                    }`}>
                      <Ionicons 
                        name={option.icon as any} 
                        size={16} 
                        color={visibility === option.value ? '#f97316' : '#6b7280'} 
                      />
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className={`font-medium ${
                        visibility === option.value ? 'text-orange-600' : 'text-gray-900'
                      }`}>
                        {option.label}
                      </Text>
                      <Text className="text-gray-500 text-xs">{option.description}</Text>
                    </View>
                    {visibility === option.value && (
                      <Ionicons name="checkmark-circle" size={20} color="#f97316" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Media Actions */}
            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={handlePickImages}
                disabled={images.length >= MAX_IMAGES}
                className="mr-4"
              >
                <Ionicons 
                  name="image-outline" 
                  size={24} 
                  color={images.length >= MAX_IMAGES ? '#d1d5db' : '#f97316'} 
                />
              </TouchableOpacity>

              <TouchableOpacity className="mr-4">
                <Ionicons name="camera-outline" size={24} color="#f97316" />
              </TouchableOpacity>

              <TouchableOpacity className="mr-4">
                <Ionicons name="location-outline" size={24} color="#f97316" />
              </TouchableOpacity>

              <TouchableOpacity>
                <Ionicons name="at-outline" size={24} color="#f97316" />
              </TouchableOpacity>

              <View className="flex-1" />

              <Text className="text-gray-400 text-xs">
                {images.length}/{MAX_IMAGES} images
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

export default CreatePostModal;
