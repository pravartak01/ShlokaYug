import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface VideoCreator {
  userId: string;
  username: string;
  displayName: string;
  avatar?: string;
}

export interface VideoMetrics {
  views: number;
  likes: number;
  dislikes: number;
  comments: number;
  shares: number;
  watchTime?: {
    total: number;
    average: number;
  };
  engagement?: {
    rate: number;
    lastCalculated: string;
  };
}

export interface Video {
  _id: string;
  title: string;
  description: string;
  creator: VideoCreator;
  type: 'video' | 'short';
  category: string;
  tags: string[];
  language: string;
  visibility: 'public' | 'unlisted' | 'private';
  video: {
    originalFile: { url: string; cloudinaryId: string; size: number };
    processedVersions?: {
      '240p'?: { url: string; cloudinaryId: string; size: number };
      '480p'?: { url: string; cloudinaryId: string; size: number };
      '720p'?: { url: string; cloudinaryId: string; size: number };
      '1080p'?: { url: string; cloudinaryId: string; size: number };
    };
    thumbnail: { url: string; cloudinaryId: string; timestamps?: number[] };
    duration: number;
    resolution: { width: number; height: number };
    aspectRatio: string;
  };
  metrics: VideoMetrics;
  shorts?: {
    isLoop: boolean;
    music?: { title: string; artist: string; isOriginal: boolean };
    effects?: string[];
    hashtags?: string[];
  };
  createdAt: string;
  updatedAt: string;
  isLiked?: boolean;
  isDisliked?: boolean;
  isSubscribed?: boolean;
}

export interface Comment {
  _id: string;
  videoId: string;
  author: {
    userId: string;
    username: string;
    displayName: string;
    avatar?: string;
    isVerified: boolean;
  };
  content: {
    text: string;
    mentions?: Array<{
      userId: string;
      username: string;
      startIndex: number;
      endIndex: number;
    }>;
    hashtags?: string[];
  };
  parentComment?: string;
  likes: {
    count: number;
    users: string[];
  };
  replies: {
    count: number;
    latest: string[];
  };
  createdAt: string;
  updatedAt: string;
  isLiked?: boolean;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

class VideoService {
  // Video Feed & Discovery
  async getVideoFeed(params: {
    type?: 'trending' | 'popular' | 'recent';
    category?: string;
    limit?: number;
    page?: number;
  }) {
    // For development: include all videos regardless of status
    const response = await api.get('/videos/feed', { 
      params: { ...params, includeAll: 'true' } 
    });
    return response.data;
  }

  async searchVideos(params: {
    q: string;
    category?: string;
    language?: string;
    duration?: 'short' | 'medium' | 'long';
    sortBy?: 'relevance' | 'views' | 'date' | 'rating';
    limit?: number;
    page?: number;
  }) {
    const response = await api.get('/videos/search', { params });
    return response.data;
  }

  async getVideoById(videoId: string) {
    const response = await api.get(`/videos/${videoId}`);
    return response.data;
  }

  async getRelatedVideos(videoId: string, limit: number = 10) {
    const response = await api.get(`/videos/${videoId}/related`, {
      params: { limit },
    });
    return response.data;
  }

  // Shorts Platform
  async getShortsFeed(params: {
    lastVideoId?: string;
    limit?: number;
    category?: string;
  }) {
    const response = await api.get('/shorts/feed', { params });
    return response.data;
  }

  async getTrendingHashtags(limit: number = 20) {
    const response = await api.get('/shorts/hashtags/trending', {
      params: { limit },
    });
    return response.data;
  }

  async getShortsByHashtag(hashtag: string, page: number = 1, limit: number = 20) {
    const response = await api.get(`/shorts/hashtag/${hashtag}`, {
      params: { page, limit },
    });
    return response.data;
  }

  // Engagement
  async reactToVideo(videoId: string, type: 'like' | 'dislike') {
    const response = await api.post(`/videos/${videoId}/react`, { type });
    return response.data;
  }

  async recordView(videoId: string, watchTime: number, deviceInfo: string = 'mobile') {
    const response = await api.post(`/videos/${videoId}/view`, {
      watchTime,
      deviceInfo,
    });
    return response.data;
  }

  async shareVideo(videoId: string) {
    const response = await api.post(`/videos/${videoId}/share`, {});
    return response.data;
  }

  // Comments
  async getComments(videoId: string, page: number = 1, limit: number = 20, sortBy: string = 'top') {
    const response = await api.get(`/videos/${videoId}/comments`, {
      params: { page, limit, sortBy },
    });
    return response.data;
  }

  async addComment(videoId: string, text: string, parentCommentId?: string) {
    const response = await api.post(`/videos/${videoId}/comments`, {
      text,
      parentCommentId,
    });
    return response.data;
  }

  async likeComment(videoId: string, commentId: string) {
    const response = await api.post(`/videos/${videoId}/comments/${commentId}/like`, {});
    return response.data;
  }

  async deleteComment(videoId: string, commentId: string) {
    const response = await api.delete(`/videos/${videoId}/comments/${commentId}`);
    return response.data;
  }

  // Subscriptions
  async subscribeToChannel(channelId: string) {
    const response = await api.post(`/videos/channels/${channelId}/subscribe`, {});
    return response.data;
  }

  async unsubscribeFromChannel(channelId: string) {
    const response = await api.delete(`/videos/channels/${channelId}/subscribe`);
    return response.data;
  }

  async getSubscriptions() {
    const response = await api.get('/videos/subscriptions');
    return response.data;
  }

  // Upload & Creator Studio
  async uploadVideo(
    videoFile: any,
    metadata: {
      title: string;
      description: string;
      type: 'video' | 'short';
      category: string;
      tags: string[];
      language: string;
      visibility: 'public' | 'unlisted' | 'private';
      hashtags?: string[];
      music?: { title: string; artist: string; isOriginal: boolean };
    },
    onProgress?: (progress: UploadProgress) => void
  ) {
    // Use XMLHttpRequest for more reliable file uploads in React Native
    return new Promise(async (resolve, reject) => {
      try {
        const token = await AsyncStorage.getItem('@shlokayug:accessToken');
        
        if (!token) {
          reject(new Error('No authentication token found'));
          return;
        }

        const formData = new FormData();
        
        // React Native requires a specific format for file uploads
        const fileToUpload = {
          uri: videoFile.uri,
          type: videoFile.mimeType || 'video/mp4',
          name: videoFile.name || `video-${Date.now()}.mp4`,
        };
        
        console.log('📤 Preparing upload with file:', fileToUpload);
        
        // @ts-ignore - React Native FormData accepts this format
        formData.append('video', fileToUpload);
        formData.append('title', metadata.title);
        formData.append('description', metadata.description || '');
        formData.append('type', metadata.type);
        formData.append('category', metadata.category);
        formData.append('tags', JSON.stringify(metadata.tags || []));
        formData.append('language', metadata.language);
        formData.append('visibility', metadata.visibility);
        
        if (metadata.hashtags && metadata.hashtags.length > 0) {
          formData.append('hashtags', JSON.stringify(metadata.hashtags));
        }
        if (metadata.music) {
          formData.append('music', JSON.stringify(metadata.music));
        }

        // Get base URL from api.ts
        const baseURL = __DEV__ 
          ? 'http://10.245.97.46:5000/api/v1'
          : 'https://api.shlokayug.com/api/v1';

        console.log('📤 Starting XMLHttpRequest upload to:', `${baseURL}/videos/upload`);

        const xhr = new XMLHttpRequest();
        
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable && onProgress) {
            const percentage = Math.round((event.loaded * 100) / event.total);
            console.log(`📊 Upload progress: ${percentage}%`);
            onProgress({
              loaded: event.loaded,
              total: event.total,
              percentage,
            });
          }
        };

        xhr.onload = () => {
          console.log('📥 Upload response status:', xhr.status);
          console.log('📥 Upload response:', xhr.responseText);
          
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);
              resolve(response);
            } catch {
              resolve({ success: true, data: xhr.responseText });
            }
          } else {
            try {
              const errorResponse = JSON.parse(xhr.responseText);
              reject(new Error(errorResponse.error?.message || `Upload failed with status ${xhr.status}`));
            } catch {
              reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.responseText}`));
            }
          }
        };

        xhr.onerror = () => {
          console.error('❌ XMLHttpRequest error:', xhr.status, xhr.statusText);
          reject(new Error(`Network error during upload: ${xhr.statusText || 'Connection failed'}`));
        };

        xhr.ontimeout = () => {
          console.error('❌ Upload timeout');
          reject(new Error('Upload timed out. Please try again.'));
        };

        xhr.open('POST', `${baseURL}/videos/upload`);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        // Don't set Content-Type - let XHR handle multipart boundary
        xhr.timeout = 600000; // 10 minutes
        
        console.log('📤 Sending FormData...');
        xhr.send(formData);
        
      } catch (error) {
        console.error('❌ Upload preparation error:', error);
        reject(error);
      }
    });
  }

  async getMyVideos(params: { type?: 'video' | 'short'; page?: number; limit?: number }) {
    const response = await api.get('/videos/my-videos', { params });
    return response.data;
  }

  async updateVideo(
    videoId: string,
    updates: {
      title?: string;
      description?: string;
      category?: string;
      tags?: string[];
      visibility?: 'public' | 'unlisted' | 'private';
    }
  ) {
    const response = await api.patch(`/videos/${videoId}`, updates);
    return response.data;
  }

  async deleteVideo(videoId: string) {
    const response = await api.delete(`/videos/${videoId}`);
    return response.data;
  }

  async getVideoAnalytics(videoId: string) {
    const response = await api.get(`/videos/${videoId}/analytics`);
    return response.data;
  }

  async getChannelAnalytics() {
    const response = await api.get('/videos/channel/analytics');
    return response.data;
  }

  // Bookmarks
  async bookmarkVideo(videoId: string) {
    const response = await api.post(`/videos/${videoId}/bookmark`, {});
    return response.data;
  }

  async removeBookmark(videoId: string) {
    const response = await api.delete(`/videos/${videoId}/bookmark`);
    return response.data;
  }

  async getBookmarks(page: number = 1, limit: number = 20) {
    const response = await api.get('/videos/bookmarks', {
      params: { page, limit },
    });
    return response.data;
  }
}

export default new VideoService();
