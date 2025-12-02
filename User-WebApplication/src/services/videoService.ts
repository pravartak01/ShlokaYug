/**
 * Video Service
 * API service for video-related operations
 */

import api from '../config/api';

// Types
export interface Video {
  _id: string;
  title: string;
  description: string | { text?: string; mentions?: string[]; hashtags?: string[] };
  videoUrl?: string;
  thumbnailUrl?: string;
  duration?: number;
  type: 'video' | 'short';
  category: string;
  tags: string[];
  visibility: 'public' | 'private' | 'unlisted';
  creator: {
    _id?: string;
    userId?: string;
    name?: string;
    username?: string;
    displayName?: string;
    email?: string;
    profilePicture?: string;
    avatar?: string;
  };
  stats?: {
    views: number | { count?: number; users?: string[] };
    likes: number | { count?: number; users?: string[] };
    dislikes: number | { count?: number; users?: string[] };
    shares: number | { count?: number; users?: string[] };
    comments: number | { count?: number; users?: string[] };
  };
  // Backend virtual fields
  bestVideoUrl?: string;
  formattedDuration?: string;
  // Video object from backend
  video?: {
    originalFile?: {
      url?: string;
      cloudinaryId?: string;
      size?: number;
      originalName?: string;
    };
    processedVersions?: {
      '240p'?: { url?: string };
      '480p'?: { url?: string };
      '720p'?: { url?: string };
      '1080p'?: { url?: string };
    };
    thumbnail?: {
      url?: string;
    };
    duration?: number;
  };
  metrics?: {
    views: number;
    likes: number;
    dislikes: number;
    shares: number;
    comments: number;
  };
  reactions?: {
    type: 'like' | 'dislike';
    userId: string;
  }[];
  isBookmarked?: boolean;
  userReaction?: 'like' | 'dislike' | null;
  createdAt: string;
  updatedAt: string;
}

export interface VideoComment {
  _id: string;
  content: string | { text?: string; mentions?: string[]; hashtags?: string[] };
  user: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  videoId: string;
  parentId?: string;
  likes: number | { count?: number; users?: string[] };
  replies?: VideoComment[];
  createdAt: string;
  updatedAt: string;
}

export interface Channel {
  _id: string;
  name: string;
  email: string;
  profilePicture?: string;
  bio?: string;
  subscriberCount: number;
  videoCount: number;
  isSubscribed?: boolean;
}

export interface VideoStats {
  totalViews: number;
  totalLikes: number;
  totalVideos: number;
  totalShorts: number;
}

export interface VideoFeedParams {
  page?: number;
  limit?: number;
  type?: 'video' | 'short' | 'all';
  category?: string;
  feedType?: 'trending' | 'popular' | 'recent';
}

export interface VideoSearchParams {
  query: string;
  page?: number;
  limit?: number;
  type?: 'video' | 'short' | 'all';
  category?: string;
}

export interface VideoUploadData {
  title: string;
  description: string;
  type: 'video' | 'short';
  category: string;
  visibility: 'public' | 'private' | 'unlisted';
  tags: string[];
  videoFile: File;
  thumbnailFile?: File;
}

// API Response types
interface VideoFeedResponse {
  success: boolean;
  data: {
    videos: Video[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

interface MyVideosResponse {
  success: boolean;
  data: {
    videos: Video[];
    stats: VideoStats;
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

interface VideoDetailsResponse {
  success: boolean;
  data: {
    video: Video;
  };
}

interface RelatedVideosResponse {
  success: boolean;
  data: {
    videos: Video[];
  };
}

interface CommentsResponse {
  success: boolean;
  data: {
    comments: VideoComment[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

interface ReactionResponse {
  success: boolean;
  data: {
    reaction: 'like' | 'dislike' | null;
    likes: number;
    dislikes: number;
  };
}

interface SubscriptionResponse {
  success: boolean;
  data: {
    isSubscribed: boolean;
    subscriberCount: number;
  };
}

interface BookmarkResponse {
  success: boolean;
  data: {
    isBookmarked: boolean;
  };
}

interface UploadResponse {
  success: boolean;
  data: {
    video: Video;
  };
}

// Video Feed APIs
export const getVideoFeed = async (params: VideoFeedParams = {}): Promise<VideoFeedResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.type && params.type !== 'all') queryParams.append('videoType', params.type);
  if (params.category && params.category !== 'all') queryParams.append('category', params.category);
  if (params.feedType) queryParams.append('type', params.feedType);
  
  const response = await api.get<VideoFeedResponse>(`/videos/feed?${queryParams.toString()}`);
  return response.data;
};

export const searchVideos = async (params: VideoSearchParams): Promise<VideoFeedResponse> => {
  const queryParams = new URLSearchParams();
  
  queryParams.append('q', params.query);
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.type && params.type !== 'all') queryParams.append('type', params.type);
  if (params.category && params.category !== 'all') queryParams.append('category', params.category);
  
  const response = await api.get<VideoFeedResponse>(`/videos/search?${queryParams.toString()}`);
  return response.data;
};

export const getMyVideos = async (params: VideoFeedParams = {}): Promise<MyVideosResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.type && params.type !== 'all') queryParams.append('type', params.type);
  
  const response = await api.get<MyVideosResponse>(`/videos/my-videos?${queryParams.toString()}`);
  return response.data;
};

// Video Details APIs
export const getVideoById = async (videoId: string): Promise<VideoDetailsResponse> => {
  const response = await api.get<VideoDetailsResponse>(`/videos/${videoId}`);
  return response.data;
};

export const getRelatedVideos = async (videoId: string): Promise<RelatedVideosResponse> => {
  const response = await api.get<RelatedVideosResponse>(`/videos/${videoId}/related`);
  return response.data;
};

// Video Upload APIs
export const uploadVideo = async (data: VideoUploadData, onProgress?: (progress: number) => void): Promise<UploadResponse> => {
  const formData = new FormData();
  
  formData.append('title', data.title);
  formData.append('description', data.description);
  formData.append('type', data.type);
  formData.append('category', data.category);
  formData.append('visibility', data.visibility);
  formData.append('tags', JSON.stringify(data.tags));
  formData.append('video', data.videoFile);
  
  if (data.thumbnailFile) {
    formData.append('thumbnail', data.thumbnailFile);
  }

  // Debug: Log FormData contents
  console.log('📤 FormData contents:');
  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      console.log(`  ${key}: File(${value.name}, ${value.size} bytes, ${value.type})`);
    } else {
      console.log(`  ${key}: ${value}`);
    }
  }
  
  const response = await api.post<UploadResponse>('/videos/upload', formData, {
    headers: {
      // Don't set Content-Type manually - let browser set it with boundary
      'Content-Type': undefined,
    },
    onUploadProgress: (progressEvent: { loaded: number; total?: number }) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
  });
  
  return response.data;
};

export const updateVideo = async (videoId: string, data: Partial<VideoUploadData>): Promise<VideoDetailsResponse> => {
  const response = await api.put<VideoDetailsResponse>(`/videos/${videoId}`, data);
  return response.data;
};

export const deleteVideo = async (videoId: string): Promise<{ success: boolean }> => {
  const response = await api.delete<{ success: boolean }>(`/videos/${videoId}`);
  return response.data;
};

// Engagement APIs
export const reactToVideo = async (videoId: string, type: 'like' | 'dislike'): Promise<ReactionResponse> => {
  const response = await api.post<ReactionResponse>('/videos/react', {
    videoId,
    type,
  });
  return response.data;
};

export const bookmarkVideo = async (videoId: string): Promise<BookmarkResponse> => {
  const response = await api.post<BookmarkResponse>('/videos/bookmark', {
    videoId,
  });
  return response.data;
};

export const shareVideo = async (videoId: string): Promise<{ success: boolean }> => {
  const response = await api.post<{ success: boolean }>('/videos/share', {
    videoId,
  });
  return response.data;
};

// Comment APIs
export const getVideoComments = async (videoId: string, page: number = 1): Promise<CommentsResponse> => {
  const response = await api.get<CommentsResponse>(`/videos/${videoId}/comments?page=${page}`);
  return response.data;
};

export const addComment = async (videoId: string, content: string, parentId?: string): Promise<{ success: boolean; data: { comment: VideoComment } }> => {
  const response = await api.post<{ success: boolean; data: { comment: VideoComment } }>('/videos/comments', {
    videoId,
    content,
    parentId,
  });
  return response.data;
};

export const deleteComment = async (commentId: string): Promise<{ success: boolean }> => {
  const response = await api.delete<{ success: boolean }>(`/videos/comments/${commentId}`);
  return response.data;
};

// Subscription APIs
export const subscribeToChannel = async (channelId: string): Promise<SubscriptionResponse> => {
  const response = await api.post<SubscriptionResponse>(`/videos/channels/${channelId}/subscribe`);
  return response.data;
};

export const getChannelDetails = async (channelId: string): Promise<{ success: boolean; data: { channel: Channel } }> => {
  const response = await api.get<{ success: boolean; data: { channel: Channel } }>(`/videos/channels/${channelId}`);
  return response.data;
};

// View APIs
export const recordVideoView = async (videoId: string): Promise<{ success: boolean }> => {
  const response = await api.post<{ success: boolean }>(`/videos/${videoId}/view`);
  return response.data;
};

// Helper functions
export const formatDuration = (seconds?: number): string => {
  if (!seconds) return '0:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export const formatViewCount = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

export const formatTimeAgo = (date: string): string => {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffYears > 0) return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
  if (diffMonths > 0) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  if (diffWeeks > 0) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  return 'Just now';
};

// Constants
export const VIDEO_CATEGORIES = [
  { id: 'all', label: 'All', icon: '📚' },
  { id: 'sanskrit', label: 'Sanskrit', icon: '🕉️' },
  { id: 'chandas', label: 'Chandas', icon: '📜' },
  { id: 'mantras', label: 'Mantras', icon: '🙏' },
  { id: 'shlokas', label: 'Shlokas', icon: '📿' },
  { id: 'bhajans', label: 'Bhajans', icon: '🎵' },
  { id: 'tutorials', label: 'Tutorials', icon: '🎓' },
  { id: 'spiritual', label: 'Spiritual', icon: '✨' },
  { id: 'classical-music', label: 'Classical Music', icon: '🎶' },
  { id: 'dance', label: 'Dance', icon: '💃' },
  { id: 'yoga', label: 'Yoga', icon: '🧘' },
  { id: 'meditation', label: 'Meditation', icon: '🧘‍♀️' },
  { id: 'other', label: 'Other', icon: '📁' },
];

export const FEED_TYPES = [
  { id: 'trending', label: 'Trending', icon: '🔥' },
  { id: 'popular', label: 'Popular', icon: '⭐' },
  { id: 'recent', label: 'Recent', icon: '🕐' },
];

export const VIDEO_TYPES = [
  { id: 'all', label: 'All' },
  { id: 'video', label: 'Videos' },
  { id: 'short', label: 'Shorts' },
];
