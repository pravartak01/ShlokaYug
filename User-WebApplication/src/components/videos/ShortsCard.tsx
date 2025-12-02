/**
 * ShortsCard Component
 * Displays a short video in vertical format
 * Uses vintage color palette
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Play, 
  Heart, 
  MessageCircle,
  Eye,
  Zap
} from 'lucide-react';
import type { Video } from '../../services/videoService';
import { formatViewCount } from '../../services/videoService';

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

interface ShortsCardProps {
  video: Video;
  onClick?: () => void;
}

const ShortsCard: React.FC<ShortsCardProps> = ({ video, onClick }) => {
  // Get thumbnail URL from various possible locations
  const thumbnailUrl = video.thumbnailUrl || 
    video.video?.thumbnail?.url || 
    `https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg`;
  
  // Get creator name from various possible field names
  const creatorName = video.creator?.displayName || video.creator?.name || video.creator?.username || 'Unknown';
  
  // Get creator avatar from various possible field names
  const creatorAvatar = video.creator?.profilePicture || video.creator?.avatar;
  
  // Helper to extract number from stats that might be objects
  const getStatValue = (stat: number | { count?: number; users?: string[] } | undefined): number => {
    if (typeof stat === 'object' && stat !== null) {
      return stat.count || 0;
    }
    return stat || 0;
  };

  // Get stats handling object structure
  const viewCount = getStatValue(video.stats?.views) || getStatValue(video.metrics?.views);
  const likeCount = getStatValue(video.stats?.likes) || getStatValue(video.metrics?.likes);
  const commentCount = getStatValue(video.stats?.comments) || getStatValue(video.metrics?.comments);

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

  const CardContent = (
    <motion.div
      className="relative group cursor-pointer"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
    >
      {/* Card Container */}
      <div 
        className="relative aspect-[9/16] rounded-2xl overflow-hidden shadow-xl"
        style={{ backgroundColor: colors.dark }}
      >
        {/* Thumbnail */}
        <img
          src={thumbnailUrl}
          alt={getTitleText()}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30" />
        
        {/* Shorts Badge */}
        <div className="absolute top-3 left-3">
          <span 
            className="px-3 py-1.5 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1"
            style={{ background: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldLight} 100%)` }}
          >
            <Zap className="w-3 h-3" fill="white" />
            SHORTS
          </span>
        </div>

        {/* Play Button Center */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <motion.div
            className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border-2 border-white/40"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Play className="w-10 h-10 text-white ml-1" fill="white" />
          </motion.div>
        </div>

        {/* Side Engagement Bar */}
        <div className="absolute right-3 bottom-24 flex flex-col items-center gap-4">
          {/* Likes */}
          <motion.div
            className="flex flex-col items-center"
            whileHover={{ scale: 1.1 }}
          >
            <div className="w-11 h-11 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-white text-xs font-medium mt-1">
              {formatViewCount(likeCount)}
            </span>
          </motion.div>

          {/* Comments */}
          <motion.div
            className="flex flex-col items-center"
            whileHover={{ scale: 1.1 }}
          >
            <div className="w-11 h-11 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-white text-xs font-medium mt-1">
              {formatViewCount(commentCount)}
            </span>
          </motion.div>

          {/* Views */}
          <motion.div
            className="flex flex-col items-center"
            whileHover={{ scale: 1.1 }}
          >
            <div className="w-11 h-11 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <span className="text-white text-xs font-medium mt-1">
              {formatViewCount(viewCount)}
            </span>
          </motion.div>
        </div>

        {/* Bottom Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Creator */}
          <div className="flex items-center gap-2 mb-2">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden ring-2 ring-white/30"
              style={{ background: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldLight} 100%)` }}
            >
              {creatorAvatar ? (
                <img
                  src={creatorAvatar}
                  alt={creatorName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-xs font-bold">
                  {creatorName.charAt(0)}
                </span>
              )}
            </div>
            <span className="text-white text-sm font-medium">
              {creatorName}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-white font-semibold text-sm line-clamp-2">
            {getTitleText()}
          </h3>

          {/* Category Tag */}
          <div className="mt-2">
            <span 
              className="inline-block px-2 py-0.5 backdrop-blur-sm text-xs rounded-full capitalize"
              style={{ backgroundColor: `${colors.gold}80`, color: colors.white }}
            >
              #{video.category}
            </span>
          </div>
        </div>
      </div>

      {/* Glow Effect on Hover */}
      <div 
        className="absolute -inset-1 rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 -z-10"
        style={{ background: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldLight} 100%)` }}
      />
    </motion.div>
  );

  // If onClick is provided, don't wrap in Link
  if (onClick) {
    return CardContent;
  }

  return (
    <Link to={`/videos/${video._id}`}>
      {CardContent}
    </Link>
  );
};

export default ShortsCard;
