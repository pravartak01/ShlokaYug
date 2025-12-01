/**
 * Community Service - Twitter-like social media API
 * Handles posts, follows, timeline, trending, and social interactions
 */

import api, { handleApiError } from './api';

// =====================================
// TYPES & INTERFACES
// =====================================

export interface CommunityUser {
  _id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatar?: string;
  isVerified?: boolean;
  bio?: string;
}

export interface PostMedia {
  video?: {
    _id: string;
    title: string;
    thumbnail?: { url: string };
    duration?: number;
    views?: number;
  };
  images?: Array<{
    url: string;
    publicId: string;
    alt?: string;
  }>;
  audio?: {
    url: string;
    publicId: string;
    duration: number;
  };
}

export interface PostMetrics {
  likes: number;
  retweets: number;
  comments: number;
  views: number;
}

export interface PostComment {
  _id: string;
  author: CommunityUser;
  text: string;
  createdAt: string;
  likes: number;
  likedBy?: string[];
  isLiked?: boolean;
}

export interface CommunityPost {
  _id: string;
  author: CommunityUser;
  content: {
    text?: string;
    media?: PostMedia;
    hashtags?: string[];
    mentions?: CommunityUser[];
  };
  postType: 'text' | 'video' | 'image' | 'audio' | 'retweet' | 'quote';
  originalPost?: CommunityPost;
  quoteText?: string;
  metrics: PostMetrics;
  comments?: PostComment[];
  visibility: 'public' | 'followers' | 'private';
  location?: {
    name: string;
    coordinates?: [number, number];
  };
  createdAt: string;
  updatedAt: string;
  isLiked?: boolean;
  isRetweeted?: boolean;
  timeAgo?: string;
  engagementRate?: number;
}

export interface FollowRelation {
  _id: string;
  follower: CommunityUser;
  following: CommunityUser;
  status: 'active' | 'pending' | 'blocked';
  isMutual: boolean;
  followedAt: string;
}

export interface TrendingHashtag {
  _id: string;
  count: number;
  totalEngagement: number;
}

export interface CommunityStats {
  totalUsers: number;
  totalPosts: number;
  activeToday: number;
  trendingTopics: number;
}

export interface PaginationInfo {
  current: number;
  total: number;
  hasMore: boolean;
}

// =====================================
// API RESPONSE TYPES
// =====================================

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: {
    message: string;
    code?: string;
    details?: string;
  };
}

// =====================================
// COMMUNITY SERVICE CLASS
// =====================================

class CommunityService {
  // =====================================
  // POST MANAGEMENT
  // =====================================

  /**
   * Create a new community post
   */
  async createPost(data: {
    text?: string;
    videoId?: string;
    hashtags?: string[];
    mentions?: string[];
    visibility?: 'public' | 'followers' | 'private';
    location?: { name: string };
    images?: any[];
  }): Promise<{ post: CommunityPost }> {
    try {
      // Check if we have images to upload
      if (data.images && data.images.length > 0) {
        const formData = new FormData();
        
        if (data.text) formData.append('text', data.text);
        if (data.videoId) formData.append('videoId', data.videoId);
        if (data.hashtags && data.hashtags.length > 0) {
          formData.append('hashtags', JSON.stringify(data.hashtags));
        }
        if (data.mentions && data.mentions.length > 0) {
          formData.append('mentions', JSON.stringify(data.mentions));
        }
        if (data.visibility) formData.append('visibility', data.visibility);
        if (data.location) formData.append('location', JSON.stringify(data.location));
        
        // Add images with proper React Native format
        data.images.forEach((image, index) => {
          const imageUri = image.uri;
          const filename = image.fileName || image.name || `image_${index}.jpg`;
          const type = image.mimeType || image.type || 'image/jpeg';
          
          // React Native requires this specific format for file uploads
          formData.append('images', {
            uri: imageUri,
            type: type,
            name: filename,
          } as any);
        });

        // Don't set Content-Type header - let React Native set it with boundary
        const response = await api.post('/community/posts', formData, {
          timeout: 60000, // 60 seconds for image uploads
        });
        return response.data.data;
      }

      // Regular JSON post (no images)
      const response = await api.post('/community/posts', data);
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get user's personalized timeline/feed
   */
  async getTimeline(params: {
    page?: number;
    limit?: number;
    type?: 'all' | 'text' | 'video' | 'image' | 'retweet';
  } = {}): Promise<{ posts: CommunityPost[]; pagination: PaginationInfo }> {
    try {
      const response = await api.get('/community/timeline', { params });
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get public/explore feed
   */
  async getExploreFeed(params: {
    page?: number;
    limit?: number;
    sort?: 'recent' | 'popular' | 'trending';
  } = {}): Promise<{ posts: CommunityPost[] }> {
    try {
      const response = await api.get('/community/explore', { params });
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get user's posts by username
   */
  async getUserPosts(
    username: string,
    params: { page?: number; limit?: number } = {}
  ): Promise<{ posts: CommunityPost[]; user: CommunityUser }> {
    try {
      const response = await api.get(`/community/users/${username}/posts`, { params });
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Like/Unlike a post
   */
  async likePost(postId: string): Promise<{ liked: boolean; likesCount: number }> {
    try {
      const response = await api.post(`/community/posts/${postId}/like`);
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Repost/Quote a post
   */
  async repost(
    postId: string,
    quoteText?: string
  ): Promise<{ post: CommunityPost; originalPost: CommunityPost }> {
    try {
      const response = await api.post(`/community/posts/${postId}/repost`, { quoteText });
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Add comment to a post
   */
  async addComment(postId: string, text: string): Promise<{ comment: PostComment }> {
    try {
      const response = await api.post(`/community/posts/${postId}/comments`, { text });
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // =====================================
  // FOLLOW SYSTEM
  // =====================================

  /**
   * Follow a user
   */
  async followUser(username: string): Promise<{ follow: FollowRelation; isMutual: boolean }> {
    try {
      const response = await api.post(`/community/users/${username}/follow`);
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Unfollow a user
   */
  async unfollowUser(username: string): Promise<{ message: string }> {
    try {
      const response = await api.delete(`/community/users/${username}/follow`);
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get user's followers
   */
  async getFollowers(
    username: string,
    params: { page?: number; limit?: number } = {}
  ): Promise<{ followers: FollowRelation[]; total: number }> {
    try {
      const response = await api.get(`/community/users/${username}/followers`, { params });
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get user's following
   */
  async getFollowing(
    username: string,
    params: { page?: number; limit?: number } = {}
  ): Promise<{ following: FollowRelation[]; total: number }> {
    try {
      const response = await api.get(`/community/users/${username}/following`, { params });
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get suggested users to follow
   */
  async getSuggestedFollows(limit: number = 10): Promise<{ suggestions: CommunityUser[] }> {
    try {
      const response = await api.get('/community/suggestions/follow', { params: { limit } });
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  // =====================================
  // DISCOVERY & TRENDING
  // =====================================

  /**
   * Get trending hashtags
   */
  async getTrendingHashtags(timeframe: number = 24): Promise<{ hashtags: TrendingHashtag[] }> {
    try {
      const response = await api.get('/community/trending/hashtags', { params: { timeframe } });
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get posts by hashtag
   */
  async getPostsByHashtag(
    hashtag: string,
    params: { page?: number; limit?: number } = {}
  ): Promise<{ posts: CommunityPost[] }> {
    try {
      const response = await api.get(`/community/hashtags/${hashtag}/posts`, { params });
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Search posts, users, and hashtags
   */
  async search(
    query: string,
    params: { type?: 'all' | 'posts' | 'users' | 'hashtags'; page?: number; limit?: number } = {}
  ): Promise<{
    posts?: CommunityPost[];
    users?: CommunityUser[];
    hashtags?: TrendingHashtag[];
  }> {
    try {
      const response = await api.get('/community/search', { params: { q: query, ...params } });
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get community statistics
   */
  async getStats(): Promise<CommunityStats> {
    try {
      const response = await api.get('/community/stats');
      return response.data.data;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Check community service health
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await api.get('/community/health');
      return response.data.success;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export default new CommunityService();
