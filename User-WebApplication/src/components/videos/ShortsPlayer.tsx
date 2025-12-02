/**
 * ShortsPlayer Component
 * YouTube-like vertical shorts player with swipe navigation
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Define PanInfo type locally since it's not exported from framer-motion
interface PanInfo {
  point: { x: number; y: number };
  delta: { x: number; y: number };
  offset: { x: number; y: number };
  velocity: { x: number; y: number };
}
import {
  Play,
  Heart,
  MessageCircle,
  Share2,
  Volume2,
  VolumeX,
  ChevronUp,
  ChevronDown,
  User,
  X,
  MoreVertical,
  Music2,
  Bookmark,
} from 'lucide-react';
import type { Video } from '../../services/videoService';
import { formatViewCount, reactToVideo, bookmarkVideo, shareVideo } from '../../services/videoService';

interface ShortsPlayerProps {
  shorts: Video[];
  initialIndex?: number;
  onClose?: () => void;
}

const ShortsPlayer: React.FC<ShortsPlayerProps> = ({ shorts, initialIndex = 0, onClose }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [likedShorts, setLikedShorts] = useState<Set<string>>(new Set());
  const [bookmarkedShorts, setBookmarkedShorts] = useState<Set<string>>(new Set());
  const videoRefs = useRef<Map<number, HTMLVideoElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  const currentShort = shorts?.[currentIndex];

  // Get video URL from short
  const getVideoUrl = (video: Video): string | undefined => {
    // Try all possible video URL locations
    if (video.videoUrl) return video.videoUrl;
    if (video.bestVideoUrl) return video.bestVideoUrl;
    if (video.video?.originalFile?.url) return video.video.originalFile.url;
    
    // Check processed versions
    const versions = video.video?.processedVersions;
    if (versions) {
      if (versions['1080p']?.url) return versions['1080p'].url;
      if (versions['720p']?.url) return versions['720p'].url;
      if (versions['480p']?.url) return versions['480p'].url;
      if (versions['240p']?.url) return versions['240p'].url;
    }
    
    // Fallback: Try to construct video URL from thumbnail URL
    if (video.thumbnailUrl) {
      // Replace thumbnail transformations with video format
      // From: .../so_1,w_640,h_360,c_fill/v.../path_original.jpg
      // To: .../v.../path_original.mp4
      const videoUrl = video.thumbnailUrl
        .replace(/\/so_\d+,w_\d+,h_\d+,c_fill\//, '/')  // Remove thumbnail transformations
        .replace(/_original\.jpg$/, '_original.mp4');     // Change extension to mp4
      
      console.log('Constructed video URL from thumbnail:', videoUrl);
      return videoUrl;
    }
    
    // Debug log - show the ENTIRE video object to see what data we have
    console.warn('No video URL found for short:', video);
    
    return undefined;
  };

  // Get thumbnail URL
  const getThumbnailUrl = (video: Video): string | undefined => {
    return video.thumbnailUrl || video.video?.thumbnail?.url || undefined;
  };

  // Get creator info
  const getCreatorName = (video: Video): string => {
    return video.creator?.displayName || video.creator?.name || video.creator?.username || 'Unknown';
  };

  const getCreatorAvatar = (video: Video): string | undefined => {
    return video.creator?.profilePicture || video.creator?.avatar;
  };

  // Get stat value helper
  const getStatValue = (stat: number | { count?: number; users?: string[] } | undefined): number => {
    if (typeof stat === 'object' && stat !== null) return stat.count || 0;
    return stat || 0;
  };

  // Get title as string (handles object format)
  const getTitleText = (video: Video): string => {
    const title = video.title;
    if (!title) return 'Untitled';
    if (typeof title === 'string') return title;
    if (typeof title === 'object' && 'text' in title) return (title as { text?: string }).text || 'Untitled';
    return 'Untitled';
  };

  // Navigate to next/previous short
  const goToNext = useCallback(() => {
    if (currentIndex < shorts.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, shorts.length]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  // Handle swipe gesture
  const handleDragEnd = (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.y < -threshold && info.velocity.y < 0) {
      goToNext();
    } else if (info.offset.y > threshold && info.velocity.y > 0) {
      goToPrevious();
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        goToPrevious();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        goToNext();
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPlaying((prev) => !prev);
      } else if (e.key === 'm') {
        setIsMuted((prev) => !prev);
      } else if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrevious, onClose]);

  // Control video playback
  useEffect(() => {
    const currentVideo = videoRefs.current.get(currentIndex);
    if (currentVideo) {
      if (isPlaying) {
        currentVideo.play().catch(console.error);
      } else {
        currentVideo.pause();
      }
      currentVideo.muted = isMuted;
    }

    // Pause other videos
    videoRefs.current.forEach((video, index) => {
      if (index !== currentIndex) {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, [currentIndex, isPlaying, isMuted]);

  // Handle video click
  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  // Handle like
  const handleLike = async () => {
    if (!currentShort) return;
    try {
      await reactToVideo(currentShort._id, 'like');
      setLikedShorts((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(currentShort._id)) {
          newSet.delete(currentShort._id);
        } else {
          newSet.add(currentShort._id);
        }
        return newSet;
      });
    } catch (err) {
      console.error('Failed to like:', err);
    }
  };

  // Handle bookmark
  const handleBookmark = async () => {
    if (!currentShort) return;
    try {
      await bookmarkVideo(currentShort._id);
      setBookmarkedShorts((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(currentShort._id)) {
          newSet.delete(currentShort._id);
        } else {
          newSet.add(currentShort._id);
        }
        return newSet;
      });
    } catch (err) {
      console.error('Failed to bookmark:', err);
    }
  };

  // Handle share
  const handleShare = async () => {
    if (!currentShort) return;
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/videos/${currentShort._id}`);
      await shareVideo(currentShort._id);
      // Show toast or feedback
    } catch (err) {
      console.error('Failed to share:', err);
    }
  };

  // Early return if no shorts (after all hooks)
  if (!shorts || shorts.length === 0) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        {onClose && (
          <button
            onClick={onClose}
            title="Close"
            className="absolute top-4 left-4 p-3 bg-white/10 rounded-full"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        )}
        <p className="text-white/50">No shorts available</p>
      </div>
    );
  }

  if (!currentShort) return null;

  const isLiked = likedShorts.has(currentShort._id);
  const isBookmarked = bookmarkedShorts.has(currentShort._id);

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          title="Close"
          className="absolute top-4 left-4 z-50 p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Navigation Hints */}
      <div className="absolute top-4 right-4 z-50 flex flex-col items-center gap-2">
        <button
          onClick={goToPrevious}
          disabled={currentIndex === 0}
          title="Previous"
          className="p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronUp className="w-5 h-5 text-white" />
        </button>
        <span className="text-white/60 text-sm">{currentIndex + 1}/{shorts.length}</span>
        <button
          onClick={goToNext}
          disabled={currentIndex === shorts.length - 1}
          title="Next"
          className="p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronDown className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Main Container */}
      <div
        ref={containerRef}
        className="relative w-full h-full max-w-[400px] mx-auto overflow-hidden"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            className="absolute inset-0"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
          >
            {/* Video */}
            <div className="relative w-full h-full bg-black" onClick={togglePlay}>
              {getVideoUrl(currentShort) ? (
                <video
                  ref={(el) => {
                    if (el) videoRefs.current.set(currentIndex, el);
                  }}
                  src={getVideoUrl(currentShort)}
                  poster={getThumbnailUrl(currentShort)}
                  className="w-full h-full object-cover"
                  loop
                  playsInline
                  muted={isMuted}
                  autoPlay
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-white/50">Video unavailable</p>
                </div>
              )}

              {/* Play/Pause Indicator */}
              <AnimatePresence>
                {!isPlaying && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center bg-black/30"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.div
                      className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                    >
                      <Play className="w-10 h-10 text-white ml-1" fill="white" />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />
            </div>

            {/* Right Side Actions */}
            <div className="absolute right-3 bottom-32 flex flex-col items-center gap-5">
              {/* Like */}
              <motion.button
                onClick={handleLike}
                className="flex flex-col items-center gap-1"
                whileTap={{ scale: 0.9 }}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isLiked ? 'bg-[#C9463D]' : 'bg-white/10 backdrop-blur-sm'
                }`}>
                  <Heart className={`w-6 h-6 ${isLiked ? 'text-white fill-white' : 'text-white'}`} />
                </div>
                <span className="text-white text-xs font-medium">
                  {formatViewCount(getStatValue(currentShort.stats?.likes) + (isLiked ? 1 : 0))}
                </span>
              </motion.button>

              {/* Comments */}
              <motion.button
                onClick={() => navigate(`/videos/${currentShort._id}`)}
                className="flex flex-col items-center gap-1"
                whileTap={{ scale: 0.9 }}
              >
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <span className="text-white text-xs font-medium">
                  {formatViewCount(getStatValue(currentShort.stats?.comments))}
                </span>
              </motion.button>

              {/* Bookmark */}
              <motion.button
                onClick={handleBookmark}
                className="flex flex-col items-center gap-1"
                whileTap={{ scale: 0.9 }}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isBookmarked ? 'bg-[#D4A853]' : 'bg-white/10 backdrop-blur-sm'
                }`}>
                  <Bookmark className={`w-6 h-6 ${isBookmarked ? 'text-white fill-white' : 'text-white'}`} />
                </div>
                <span className="text-white text-xs font-medium">Save</span>
              </motion.button>

              {/* Share */}
              <motion.button
                onClick={handleShare}
                className="flex flex-col items-center gap-1"
                whileTap={{ scale: 0.9 }}
              >
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Share2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-white text-xs font-medium">Share</span>
              </motion.button>

              {/* More */}
              <motion.button
                className="flex flex-col items-center gap-1"
                whileTap={{ scale: 0.9 }}
              >
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <MoreVertical className="w-6 h-6 text-white" />
                </div>
              </motion.button>

              {/* Sound Toggle */}
              <motion.button
                onClick={() => setIsMuted((prev) => !prev)}
                className="flex flex-col items-center gap-1"
                whileTap={{ scale: 0.9 }}
              >
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                  {isMuted ? (
                    <VolumeX className="w-6 h-6 text-white" />
                  ) : (
                    <Volume2 className="w-6 h-6 text-white" />
                  )}
                </div>
              </motion.button>
            </div>

            {/* Bottom Info */}
            <div className="absolute left-4 right-20 bottom-8">
              {/* Creator Info */}
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4A853] to-[#C9463D] flex items-center justify-center overflow-hidden ring-2 ring-white/30">
                  {getCreatorAvatar(currentShort) ? (
                    <img
                      src={getCreatorAvatar(currentShort)}
                      alt={getCreatorName(currentShort)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-white" />
                  )}
                </div>
                <span className="text-white font-semibold text-sm">
                  @{getCreatorName(currentShort)}
                </span>
                <button className="px-4 py-1.5 bg-[#C9463D] text-white text-sm font-semibold rounded-full hover:bg-[#B33D35] transition-colors">
                  Follow
                </button>
              </div>

              {/* Title */}
              <p className="text-white font-medium text-sm line-clamp-2 mb-2">
                {getTitleText(currentShort)}
              </p>

              {/* Music/Sound */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full">
                  <Music2 className="w-4 h-4 text-white" />
                  <span className="text-white text-xs">Original Sound</span>
                </div>
              </div>

              {/* Category Tag */}
              {currentShort.category && (
                <div className="mt-2">
                  <span className="px-3 py-1 bg-[#D4A853]/30 backdrop-blur-sm text-[#D4A853] text-xs rounded-full capitalize">
                    #{currentShort.category}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Keyboard Hints (Desktop) */}
      <div className="hidden lg:flex absolute bottom-4 left-4 items-center gap-4 text-white/40 text-xs">
        <span>↑↓ Navigate</span>
        <span>Space Play/Pause</span>
        <span>M Mute</span>
        <span>Esc Close</span>
      </div>
    </div>
  );
};

export default ShortsPlayer;
