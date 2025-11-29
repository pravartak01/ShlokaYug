/**
 * CommentModal Component - Modal for viewing and adding comments
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PostComment } from '../../services/communityService';

interface CommentModalProps {
  visible: boolean;
  onClose: () => void;
  comments: PostComment[];
  onAddComment: (text: string) => Promise<void>;
  loading?: boolean;
  userAvatar?: string;
}

const CommentModal: React.FC<CommentModalProps> = ({
  visible,
  onClose,
  comments,
  onAddComment,
  loading = false,
  userAvatar,
}) => {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d`;
    if (diffHours > 0) return `${diffHours}h`;
    if (diffMins > 0) return `${diffMins}m`;
    return 'now';
  };

  const handleSubmit = async () => {
    if (!commentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddComment(commentText.trim());
      setCommentText('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderComment = ({ item }: { item: PostComment }) => {
    const author = item.author || {};
    const displayName = author.displayName || 
      (author.firstName && author.lastName 
        ? `${author.firstName} ${author.lastName}` 
        : author.username || 'User');

    return (
      <View className="flex-row px-4 py-3 border-b border-gray-100">
        {author.avatar ? (
          <Image
            source={{ uri: author.avatar }}
            className="w-10 h-10 rounded-full bg-gray-300"
          />
        ) : (
          <View className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 items-center justify-center">
            <Text className="text-white font-bold">
              {displayName[0]?.toUpperCase()}
            </Text>
          </View>
        )}

        <View className="flex-1 ml-3">
          <View className="flex-row items-center">
            <Text className="text-gray-900 font-semibold text-sm">
              {displayName}
            </Text>
            {author.isVerified && (
              <Ionicons name="checkmark-circle" size={14} color="#f97316" className="ml-1" />
            )}
            <Text className="text-gray-500 text-xs ml-2">
              {formatTimeAgo(item.createdAt)}
            </Text>
          </View>
          
          <Text className="text-gray-800 mt-1 text-sm leading-5">
            {item.text}
          </Text>

          <View className="flex-row items-center mt-2">
            <TouchableOpacity className="flex-row items-center mr-4">
              <Ionicons 
                name={item.isLiked ? 'heart' : 'heart-outline'} 
                size={16} 
                color={item.isLiked ? '#ef4444' : '#6b7280'} 
              />
              {item.likes > 0 && (
                <Text className={`text-xs ml-1 ${item.isLiked ? 'text-red-500' : 'text-gray-500'}`}>
                  {item.likes}
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity>
              <Text className="text-gray-500 text-xs font-medium">Reply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView className="flex-1 bg-white">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
            <TouchableOpacity onPress={onClose} className="p-1">
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-gray-900 font-bold text-lg">Comments</Text>
            <View className="w-8" />
          </View>

          {/* Comments List */}
          {loading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#f97316" />
            </View>
          ) : comments.length === 0 ? (
            <View className="flex-1 items-center justify-center px-8">
              <Ionicons name="chatbubble-outline" size={48} color="#d1d5db" />
              <Text className="text-gray-500 text-lg mt-4 text-center">
                No comments yet
              </Text>
              <Text className="text-gray-400 text-sm mt-1 text-center">
                Be the first to share your thoughts!
              </Text>
            </View>
          ) : (
            <FlatList
              data={comments}
              renderItem={renderComment}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
            />
          )}

          {/* Comment Input */}
          <View className="border-t border-gray-200 px-4 py-3">
            <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
              {userAvatar ? (
                <Image
                  source={{ uri: userAvatar }}
                  className="w-8 h-8 rounded-full bg-gray-300"
                />
              ) : (
                <View className="w-8 h-8 rounded-full bg-gray-300 items-center justify-center">
                  <Ionicons name="person" size={16} color="#9ca3af" />
                </View>
              )}
              
              <TextInput
                ref={inputRef}
                value={commentText}
                onChangeText={setCommentText}
                placeholder="Add a comment..."
                placeholderTextColor="#9ca3af"
                className="flex-1 mx-3 text-gray-900 text-base"
                multiline
                maxLength={280}
              />
              
              {commentText.trim() && (
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-orange-500 rounded-full p-2"
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Ionicons name="send" size={16} color="white" />
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

export default CommentModal;
