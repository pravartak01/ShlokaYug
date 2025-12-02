/**
 * VideoCard Component
 * Displays a video thumbnail with metadata
 * Uses vintage color palette
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  PlayCircle, 
  Eye, 
  Heart, 
  Clock,
  User
} from 'lucide-react';
import type { Video } from '../../services/videoService';
import { formatDuration, formatViewCount, formatTimeAgo } from '../../services/videoService';

// Vintage color palette
const colors = {
  cream: '#F5F1E8',
  gold: '#644A07',
  goldLight: '#8B6914',
  white: '#FFFEF7',
  border: '#D4C5A9',
  dark: '#2C2416',
  muted: '#6B5D4F',
  accent1: '#FFE5B4',
  accent2: '#E6D5B8',
  accent3: '#F4E4C1',
  accent4: '#FAF0DC',
};

interface VideoCardProps {
  video: Video;
  variant?: 'default' | 'compact' | 'horizontal';
}

const VideoCard: React.FC<VideoCardProps> = ({ video, variant = 'default' }) => {
  // Get thumbnail URL from various possible locations
  const thumbnailUrl = video.thumbnailUrl || 
    video.video?.thumbnail?.url || 
    `https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg`;
  
  // Get creator name from various possible field names
  const creatorName = video.creator?.displayName || video.creator?.name || video.creator?.username || 'Unknown Creator';
  
  // Get creator avatar from various possible field names
  const creatorAvatar = video.creator?.profilePicture || video.creator?.avatar;
  
  // Get video duration from various possible locations
  const videoDuration = video.duration || video.video?.duration || video.formattedDuration;
  
  // Helper to extract number from stats that might be objects
  const getStatValue = (stat: number | { count?: number; users?: string[] } | undefined): number => {
    if (typeof stat === 'object' && stat !== null) {
      return stat.count || 0;
    }
    return stat || 0;
  };

  // Helper to get title as string (handles object format)
  const getTitleText = (): string => {
    const title = video.title;
    if (!title) return 'Untitled';
    if (typeof title === 'string') return title;
    if (typeof title === 'object' && 'text' in title) {
      return String((title as { text?: string }).text || 'Untitled');
    }
    return String(title);
  };

  // Get views and likes handling object structure
  const viewCount = getStatValue(video.stats?.views) || getStatValue(video.metrics?.views);
  const likeCount = getStatValue(video.stats?.likes) || getStatValue(video.metrics?.likes);

  if (variant === 'horizontal') {
    return (
      <Link to={`/videos/${video._id}`}>
        <motion.div
          className="flex gap-3 p-2 rounded-xl transition-colors cursor-pointer group"
          style={{ backgroundColor: 'transparent' }}
          whileHover={{ x: 4, backgroundColor: colors.accent4 }}
        >
          {/* Thumbnail */}
          <div className="relative w-40 h-24 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={thumbnailUrl}
              alt={getTitleText()}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
            
            {/* Duration Badge */}
            {videoDuration && (
              <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 rounded text-white text-xs font-medium">
                {typeof videoDuration === 'string' ? videoDuration : formatDuration(videoDuration)}
              </div>
            )}
            
            {/* Play Icon */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <PlayCircle className="w-10 h-10 text-white drop-shadow-lg" fill={colors.gold} />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm line-clamp-2 mb-1" style={{ color: colors.dark }}>
              {getTitleText()}
            </h3>
            <p className="text-xs mb-1" style={{ color: colors.muted }}>
              {creatorName}
            </p>
            <div className="flex items-center gap-2 text-xs" style={{ color: colors.muted }}>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {formatViewCount(viewCount)}
              </span>
              <span>•</span>
              <span>{formatTimeAgo(video.createdAt)}</span>
            </div>
          </div>
        </motion.div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link to={`/videos/${video._id}`}>
        <motion.div
          className="group cursor-pointer"
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
        >
          {/* Thumbnail */}
          <div className="relative aspect-video rounded-lg overflow-hidden mb-2">
            <img
              src={thumbnailUrl}
              alt={getTitleText()}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            {/* Duration Badge */}
            {videoDuration && (
              <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 rounded text-white text-xs font-medium">
                {typeof videoDuration === 'string' ? videoDuration : formatDuration(videoDuration)}
              </div>
            )}
            
            {/* Play Icon */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <PlayCircle className="w-12 h-12 text-white drop-shadow-lg" fill={colors.gold} />
            </div>
          </div>

          {/* Info */}
          <h3 className="font-semibold text-sm line-clamp-2" style={{ color: colors.dark }}>
            {getTitleText()}
          </h3>
          <p className="text-xs mt-1" style={{ color: colors.muted }}>
            {formatViewCount(viewCount)} views
          </p>
        </motion.div>
      </Link>
    );
  }

  // Default variant
  return (
    <Link to={`/videos/${video._id}`}>
      <motion.div
        className="group cursor-pointer rounded-2xl overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl"
        style={{ 
          backgroundColor: colors.white, 
          border: `1px solid ${colors.border}`,
          boxShadow: `0 4px 12px rgba(100, 74, 7, 0.08)`
        }}
        whileHover={{ y: -6, boxShadow: `0 12px 24px rgba(100, 74, 7, 0.15)` }}
        transition={{ duration: 0.3 }}
      >
        {/* Thumbnail */}
        <div className="relative aspect-video overflow-hidden">
          <img
            src={thumbnailUrl}
            alt={getTitleText()}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Top Badges */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            {video.type === 'short' && (
              <span 
                className="px-2 py-1 text-white text-xs font-bold rounded-full"
                style={{ background: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldLight} 100%)` }}
              >
                SHORT
              </span>
            )}
            <span 
              className="px-2 py-1 text-xs font-medium rounded-full capitalize"
              style={{ backgroundColor: colors.accent1, color: colors.gold }}
            >
              {video.category}
            </span>
          </div>
          
          {/* Duration Badge */}
          {videoDuration && (
            <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/80 backdrop-blur-sm rounded-lg text-white text-sm font-medium flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {typeof videoDuration === 'string' ? videoDuration : formatDuration(videoDuration)}
            </div>
          )}
          
          {/* Play Button */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
            <motion.div
              className="w-16 h-16 rounded-full flex items-center justify-center shadow-lg"
              style={{ backgroundColor: colors.gold }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <PlayCircle className="w-10 h-10 text-white ml-1" fill="white" />
            </motion.div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Creator Info */}
          <div className="flex items-center gap-3 mb-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldLight} 100%)` }}
            >
              {creatorAvatar ? (
                <img
                  src={creatorAvatar}
                  alt={creatorName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: colors.dark }}>
                {creatorName}
              </p>
              <p className="text-xs" style={{ color: colors.muted }}>
                {formatTimeAgo(video.createdAt)}
              </p>
            </div>
          </div>

          {/* Title */}
          <h3 
            className="font-semibold text-base line-clamp-2 mb-3 transition-colors group-hover:text-amber-700"
            style={{ color: colors.dark }}
          >
            {getTitleText()}
          </h3>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm" style={{ color: colors.muted }}>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" style={{ color: colors.gold }} />
                {formatViewCount(viewCount)}
              </span>
              <span className="flex items-center gap-1">
                <Heart className="w-4 h-4" style={{ color: colors.gold }} />
                {formatViewCount(likeCount)}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default VideoCard;
