/**
 * UserCard Component - Displays user info with follow button
 * Used in suggestions, followers list, search results
 */

import React, { useState, memo } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CommunityUser } from '../../services/communityService';

interface UserCardProps {
  user: CommunityUser;
  isFollowing?: boolean;
  onFollow?: (username: string) => Promise<void>;
  onUnfollow?: (username: string) => Promise<void>;
  onPress?: (username: string) => void;
  showFollowButton?: boolean;
  compact?: boolean;
}

const UserCard: React.FC<UserCardProps> = memo(({
  user,
  isFollowing = false,
  onFollow,
  onUnfollow,
  onPress,
  showFollowButton = true,
  compact = false,
}) => {
  const [following, setFollowing] = useState(isFollowing);
  const [isLoading, setIsLoading] = useState(false);

  const displayName = user.displayName || 
    (user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}` 
      : user.username || 'Unknown');

  const handleFollowPress = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      if (following) {
        await onUnfollow?.(user.username!);
        setFollowing(false);
      } else {
        await onFollow?.(user.username!);
        setFollowing(true);
      }
    } catch (error) {
      console.error('Follow action failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (compact) {
    return (
      <TouchableOpacity
        onPress={() => onPress?.(user.username!)}
        className="flex-row items-center py-2"
      >
        {user.avatar ? (
          <Image
            source={{ uri: user.avatar }}
            className="w-10 h-10 rounded-full bg-gray-300"
          />
        ) : (
          <View className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 items-center justify-center">
            <Text className="text-white font-bold">
              {displayName[0]?.toUpperCase()}
            </Text>
          </View>
        )}
        <View className="ml-3 flex-1">
          <View className="flex-row items-center">
            <Text className="text-gray-900 font-semibold text-sm">
              {displayName}
            </Text>
            {user.isVerified && (
              <Ionicons name="checkmark-circle" size={14} color="#f97316" className="ml-1" />
            )}
          </View>
          <Text className="text-gray-500 text-xs">@{user.username}</Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View className="bg-white border-b border-gray-100 px-4 py-3">
      <View className="flex-row items-start">
        <TouchableOpacity onPress={() => onPress?.(user.username!)}>
          {user.avatar ? (
            <Image
              source={{ uri: user.avatar }}
              className="w-12 h-12 rounded-full bg-gray-300"
            />
          ) : (
            <View className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 items-center justify-center">
              <Text className="text-white font-bold text-lg">
                {displayName[0]?.toUpperCase()}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <View className="flex-1 ml-3">
          <TouchableOpacity onPress={() => onPress?.(user.username!)}>
            <View className="flex-row items-center">
              <Text className="text-gray-900 font-bold text-base">
                {displayName}
              </Text>
              {user.isVerified && (
                <Ionicons name="checkmark-circle" size={16} color="#f97316" className="ml-1" />
              )}
            </View>
            <Text className="text-gray-500 text-sm">@{user.username}</Text>
          </TouchableOpacity>
          
          {user.bio && (
            <Text className="text-gray-700 mt-1 text-sm" numberOfLines={2}>
              {user.bio}
            </Text>
          )}
        </View>

        {showFollowButton && (
          <TouchableOpacity
            onPress={handleFollowPress}
            disabled={isLoading}
            className={`px-4 py-2 rounded-full ${
              following ? 'bg-gray-200' : 'bg-orange-500'
            }`}
          >
            <Text className={`font-semibold text-sm ${
              following ? 'text-gray-700' : 'text-white'
            }`}>
              {isLoading ? '...' : following ? 'Following' : 'Follow'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

UserCard.displayName = 'UserCard';

export default UserCard;
