import { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Bookmark,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Home,
  Search,
  Bell,
  User,
  ArrowLeft,
  Eye,
  Calendar,
  Reply,
  Settings,
  Loader2,
  X,
  Check,
  Copy,
  Twitter,
  Facebook,
  Linkedin,
  Link2,
  BookOpen
} from 'lucide-react';
import type { Video, VideoComment } from '../services/videoService';
import { 
  getVideoById,
  getVideoFeed,
  getVideoComments,
  addComment,
  reactToVideo,
  bookmarkVideo
} from '../services/videoService';

// Use VideoComment type
type Comment = VideoComment;

// Helper function to extract video URL from backend response
const getVideoUrlFromVideo = (video: Video): string => {
  if (video.videoUrl) return video.videoUrl;
  if (video.bestVideoUrl) return video.bestVideoUrl;
  if (video.video?.originalFile?.url) return video.video.originalFile.url;
  // Check processed versions
  if (video.video?.processedVersions) {
    const versions = video.video.processedVersions;
    return versions['1080p']?.url || versions['720p']?.url || versions['480p']?.url || versions['240p']?.url || '';
  }
  
  // Fallback: Try to construct video URL from thumbnail URL
  if (video.thumbnailUrl) {
    // Replace thumbnail transformations with video format
    const videoUrl = video.thumbnailUrl
      .replace(/\/so_\d+,w_\d+,h_\d+,c_fill\//, '/')  // Remove thumbnail transformations
      .replace(/_original\.jpg$/, '_original.mp4');     // Change extension to mp4
    
    console.log('Constructed video URL from thumbnail:', videoUrl);
    return videoUrl;
  }
  
  console.warn('No video URL found:', {
    id: video._id,
    hasVideoUrl: !!video.videoUrl,
    hasBestVideoUrl: !!video.bestVideoUrl,
    hasOriginalFile: !!video.video?.originalFile?.url,
    hasProcessedVersions: !!video.video?.processedVersions,
    videoObject: video.video,
  });
  
  return '';
};

// Helper function to get description text from description field
const getDescriptionText = (description: string | { text?: string; mentions?: string[]; hashtags?: string[] } | undefined): string => {
  if (!description) return 'No description available.';
  if (typeof description === 'string') return description;
  if (typeof description === 'object' && description.text) return description.text;
  return 'No description available.';
};

// Helper function to get title text (handles object format)
const getTitleText = (title: unknown): string => {
  if (!title) return 'Untitled';
  if (typeof title === 'string') return title;
  if (typeof title === 'object' && title !== null && 'text' in title) {
    return String((title as { text?: string }).text || 'Untitled');
  }
  return String(title);
};

// Helper function to get content text from comment/reply (handles object format)
const getContentText = (content: unknown): string => {
  if (!content) return '';
  if (typeof content === 'string') return content;
  if (typeof content === 'object' && content !== null && 'text' in content) {
    return String((content as { text?: string }).text || '');
  }
  return String(content);
};

// Helper function to get thumbnail URL safely
const getThumbnailUrl = (video: Video): string => {
  if (video.thumbnailUrl) return video.thumbnailUrl;
  if (video.video?.thumbnail?.url) return video.video.thumbnail.url;
  return '/placeholder-video.jpg';
};

// Helper function to get view count from stats
const getViewCount = (video: Video): number => {
  if (video.metrics?.views) return video.metrics.views;
  if (video.stats?.views) {
    if (typeof video.stats.views === 'number') return video.stats.views;
    if (typeof video.stats.views === 'object' && video.stats.views.count) return video.stats.views.count;
  }
  return 0;
};

// Helper function to get like count from stats  
const getLikeCount = (video: Video): number => {
  if (video.metrics?.likes) return video.metrics.likes;
  if (video.stats?.likes) {
    if (typeof video.stats.likes === 'number') return video.stats.likes;
    if (typeof video.stats.likes === 'object' && video.stats.likes.count) return video.stats.likes.count;
  }
  return 0;
};

// Helper function to get creator name
const getCreatorName = (video: Video): string => {
  return video.creator?.displayName || video.creator?.name || video.creator?.username || 'Unknown Creator';
};

// Helper function to get creator avatar
const getCreatorAvatar = (video: Video): string | undefined => {
  return video.creator?.avatar || video.creator?.profilePicture;
};

// Helper function to format view count
const formatViews = (views: number): string => {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views.toString();
};

// Helper function to format relative time
const formatRelativeTime = (date: string): string => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
  if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  return `${Math.floor(diffInSeconds / 31536000)} years ago`;
};

// Helper function to format duration
const formatDuration = (seconds: number): string => {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

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

export default function VideoPlayerPage() {
  const { videoId } = useParams<{ videoId: string }>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);

  // State
  const [video, setVideo] = useState<Video | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [buffered, setBuffered] = useState(0);

  // Engagement state
  const [isLiked, setIsLiked] = useState(false);
  const [isDisliked, setIsDisliked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Comment state
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [commentSort, setCommentSort] = useState<'newest' | 'top'>('top');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Load video data
  useEffect(() => {
    const loadVideo = async () => {
      if (!videoId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const videoResponse = await getVideoById(videoId);
        setVideo(videoResponse.data.video);
        
        // Load comments
        try {
          const commentsResponse = await getVideoComments(videoId);
          setComments(commentsResponse.data.comments || []);
        } catch (e) {
          console.warn('Could not load comments');
        }
        
        // Load related videos
        try {
          const related = await getVideoFeed({ limit: 8 });
          setRelatedVideos(related.data.videos.filter(v => v._id !== videoId));
        } catch (e) {
          console.warn('Could not load related videos');
        }
      } catch (err) {
        setError('Failed to load video');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadVideo();
  }, [videoId]);

  // Video player controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleFullscreen = () => {
    const container = document.querySelector('.video-container');
    if (!container) return;
    
    if (!isFullscreen) {
      container.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      
      // Update buffered
      if (videoRef.current.buffered.length > 0) {
        setBuffered(videoRef.current.buffered.end(videoRef.current.buffered.length - 1));
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  // Control visibility
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    
    const hideControls = () => {
      if (isPlaying) {
        timeout = setTimeout(() => setShowControls(false), 3000);
      }
    };

    hideControls();
    
    return () => clearTimeout(timeout);
  }, [isPlaying, showControls]);

  // Engagement handlers
  const handleLike = async () => {
    if (!video) return;
    try {
      if (isLiked) {
        await reactToVideo(video._id, 'like');
      } else {
        await reactToVideo(video._id, 'like');
        if (isDisliked) setIsDisliked(false);
      }
      setIsLiked(!isLiked);
    } catch (err) {
      console.error('Failed to like video');
    }
  };

  const handleDislike = () => {
    setIsDisliked(!isDisliked);
    if (isLiked) setIsLiked(false);
  };

  const handleSave = async () => {
    if (!video) return;
    try {
      await bookmarkVideo(video._id);
      setIsSaved(!isSaved);
    } catch (err) {
      console.error('Failed to save video');
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Comment handlers
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!video || !newComment.trim()) return;
    
    setSubmittingComment(true);
    try {
      const response = await addComment(video._id, newComment.trim());
      setComments([response.data.comment, ...comments]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!video || !replyText.trim()) return;
    
    try {
      const response = await addComment(video._id, replyText.trim(), parentId);
      setComments(comments.map(c => 
        c._id === parentId 
          ? { ...c, replies: [...(c.replies || []), response.data.comment] }
          : c
      ));
      setReplyText('');
      setReplyingTo(null);
    } catch (err) {
      console.error('Failed to add reply');
    }
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: colors.cream }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Loader2 className="w-12 h-12" style={{ color: colors.gold }} />
        </motion.div>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center gap-4"
        style={{ backgroundColor: colors.cream }}
      >
        <p style={{ color: colors.dark }} className="text-xl">{error || 'Video not found'}</p>
        <button
          onClick={() => navigate('/videos')}
          className="px-6 py-3 rounded-full font-medium transition-all hover:opacity-80"
          style={{ backgroundColor: colors.gold, color: colors.white }}
        >
          Back to Videos
        </button>
      </div>
    );
  }

  const videoUrl = getVideoUrlFromVideo(video);

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.cream }}>
      {/* Navbar */}
      <header 
        className="sticky top-0 z-50 border-b backdrop-blur-lg"
        style={{ 
          backgroundColor: 'rgba(255, 254, 247, 0.95)',
          borderColor: colors.border 
        }}
      >
        <div className="max-w-[1800px] mx-auto px-4 h-16 flex items-center justify-between">
          {/* Left - Back & Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-full transition-all hover:opacity-80"
              style={{ backgroundColor: colors.accent3 }}
            >
              <ArrowLeft className="w-5 h-5" style={{ color: colors.gold }} />
            </button>
            
            <Link to="/videos" className="flex items-center gap-2">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: colors.gold }}
              >
                स
              </div>
              <span className="hidden md:block text-lg font-bold" style={{ color: colors.dark }}>
                Chandas
              </span>
            </Link>
          </div>

          {/* Center - Search */}
          <div className="flex-1 max-w-xl mx-4 hidden sm:block">
            <div 
              className="relative flex items-center rounded-full overflow-hidden"
              style={{ backgroundColor: colors.accent3, border: `1px solid ${colors.border}` }}
            >
              <input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 py-2.5 px-5 bg-transparent outline-none"
                style={{ color: colors.dark }}
              />
              <button 
                className="px-4 h-full transition-all hover:opacity-80"
                style={{ backgroundColor: colors.gold }}
              >
                <Search className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-2">
            <button 
              className="sm:hidden p-2.5 rounded-full transition-all hover:opacity-80"
              style={{ backgroundColor: colors.accent3 }}
              onClick={() => setShowSearch(!showSearch)}
            >
              <Search className="w-5 h-5" style={{ color: colors.gold }} />
            </button>
            
            <Link 
              to="/"
              className="p-2.5 rounded-full transition-all hover:opacity-80"
              style={{ backgroundColor: colors.accent3 }}
            >
              <Home className="w-5 h-5" style={{ color: colors.gold }} />
            </Link>
            
            <button 
              className="relative p-2.5 rounded-full transition-all hover:opacity-80"
              style={{ backgroundColor: colors.accent3 }}
            >
              <Bell className="w-5 h-5" style={{ color: colors.gold }} />
              <span 
                className="absolute top-1 right-1 w-2 h-2 rounded-full"
                style={{ backgroundColor: '#EF4444' }}
              />
            </button>
            
            <button 
              className="p-2.5 rounded-full transition-all hover:opacity-80"
              style={{ backgroundColor: colors.accent3 }}
            >
              <User className="w-5 h-5" style={{ color: colors.gold }} />
            </button>
          </div>
        </div>
        
        {/* Mobile Search */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 pb-3 sm:hidden"
            >
              <div 
                className="relative flex items-center rounded-full overflow-hidden"
                style={{ backgroundColor: colors.accent3, border: `1px solid ${colors.border}` }}
              >
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 py-2.5 px-5 bg-transparent outline-none"
                  style={{ color: colors.dark }}
                />
                <button 
                  className="px-4 h-full"
                  style={{ backgroundColor: colors.gold }}
                >
                  <Search className="w-5 h-5 text-white" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto flex flex-col lg:flex-row gap-6 p-4">
        {/* Video Player & Info Column */}
        <div className="flex-1 space-y-4">
          {/* Video Player */}
          <div 
            className="video-container relative rounded-2xl overflow-hidden shadow-xl"
            style={{ backgroundColor: colors.dark }}
            onMouseEnter={() => setShowControls(true)}
            onMouseMove={() => setShowControls(true)}
          >
            {videoUrl ? (
              <video
                ref={videoRef}
                src={videoUrl}
                className="w-full aspect-video object-contain"
                onClick={togglePlay}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                poster={getThumbnailUrl(video)}
              />
            ) : (
              <div className="w-full aspect-video flex items-center justify-center">
                <p className="text-white">Video unavailable</p>
              </div>
            )}

            {/* Play/Pause Overlay */}
            <AnimatePresence>
              {!isPlaying && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={togglePlay}
                  className="absolute inset-0 flex items-center justify-center bg-black/30"
                >
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: colors.gold }}
                  >
                    <Play className="w-10 h-10 text-white ml-1" fill="white" />
                  </div>
                </motion.button>
              )}
            </AnimatePresence>

            {/* Video Controls */}
            <AnimatePresence>
              {showControls && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4"
                >
                  {/* Progress Bar */}
                  <div className="relative mb-3 group">
                    {/* Buffered */}
                    <div 
                      className="absolute h-1 rounded-full bg-white/30"
                      style={{ width: `${(buffered / duration) * 100}%` }}
                    />
                    <input
                      type="range"
                      min={0}
                      max={duration || 100}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-1 rounded-full appearance-none cursor-pointer"
                      style={{ 
                        background: `linear-gradient(to right, ${colors.gold} ${(currentTime / duration) * 100}%, rgba(255,255,255,0.2) 0%)` 
                      }}
                    />
                  </div>

                  {/* Controls Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={togglePlay}
                        className="text-white hover:opacity-80 transition-opacity"
                      >
                        {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                      </button>

                      <div className="flex items-center gap-2 group">
                        <button
                          onClick={toggleMute}
                          className="text-white hover:opacity-80 transition-opacity"
                        >
                          {isMuted || volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                        </button>
                        <input
                          type="range"
                          min={0}
                          max={1}
                          step={0.1}
                          value={isMuted ? 0 : volume}
                          onChange={handleVolumeChange}
                          className="w-0 group-hover:w-20 transition-all duration-300 h-1 rounded-full appearance-none cursor-pointer"
                          style={{ backgroundColor: colors.gold }}
                        />
                      </div>

                      <span className="text-white text-sm font-mono">
                        {formatDuration(currentTime)} / {formatDuration(duration)}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button className="text-white hover:opacity-80 transition-opacity">
                        <Settings className="w-5 h-5" />
                      </button>
                      <button
                        onClick={toggleFullscreen}
                        className="text-white hover:opacity-80 transition-opacity"
                      >
                        {isFullscreen ? <Minimize className="w-6 h-6" /> : <Maximize className="w-6 h-6" />}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Video Info */}
          <div 
            className="rounded-2xl p-6 shadow-lg"
            style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}` }}
          >
            {/* Title */}
            <h1 
              className="text-2xl font-bold mb-3"
              style={{ color: colors.dark }}
            >
              {getTitleText(video.title)}
            </h1>

            {/* Stats & Actions Row */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              {/* Stats */}
              <div className="flex items-center gap-4 text-sm" style={{ color: colors.muted }}>
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4" />
                  <span>{formatViews(getViewCount(video))} views</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>{formatRelativeTime(video.createdAt)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                    isLiked ? 'text-white' : ''
                  }`}
                  style={{ 
                    backgroundColor: isLiked ? colors.gold : colors.accent3,
                    color: isLiked ? colors.white : colors.dark
                  }}
                >
                  <ThumbsUp className="w-5 h-5" fill={isLiked ? 'white' : 'none'} />
                  <span>{getLikeCount(video)}</span>
                </button>

                <button
                  onClick={handleDislike}
                  className="flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all"
                  style={{ 
                    backgroundColor: isDisliked ? colors.muted : colors.accent3,
                    color: isDisliked ? colors.white : colors.dark
                  }}
                >
                  <ThumbsDown className="w-5 h-5" fill={isDisliked ? 'white' : 'none'} />
                </button>

                <button
                  onClick={() => setShowShareModal(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all hover:opacity-80"
                  style={{ backgroundColor: colors.accent3, color: colors.dark }}
                >
                  <Share2 className="w-5 h-5" />
                  <span className="hidden sm:inline">Share</span>
                </button>

                <button
                  onClick={handleSave}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                    isSaved ? 'text-white' : ''
                  }`}
                  style={{ 
                    backgroundColor: isSaved ? colors.gold : colors.accent3,
                    color: isSaved ? colors.white : colors.dark
                  }}
                >
                  <Bookmark className="w-5 h-5" fill={isSaved ? 'white' : 'none'} />
                  <span className="hidden sm:inline">Save</span>
                </button>
              </div>
            </div>

            {/* Creator Info */}
            <div 
              className="flex items-center justify-between p-4 rounded-xl mb-4"
              style={{ backgroundColor: colors.accent4 }}
            >
              <Link 
                to={`/creator/${video.creator?._id || video.creator}`}
                className="flex items-center gap-3"
              >
                {getCreatorAvatar(video) ? (
                  <img
                    src={getCreatorAvatar(video)}
                    alt={getCreatorName(video)}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: colors.gold }}
                  >
                    <User className="w-6 h-6 text-white" />
                  </div>
                )}
                <div>
                  <h3 className="font-semibold" style={{ color: colors.dark }}>
                    {getCreatorName(video)}
                  </h3>
                  <p className="text-sm" style={{ color: colors.muted }}>
                    Creator
                  </p>
                </div>
              </Link>

              <button
                className="px-6 py-2.5 rounded-full font-medium transition-all hover:opacity-80"
                style={{ backgroundColor: colors.gold, color: colors.white }}
              >
                Subscribe
              </button>
            </div>

            {/* Description */}
            <div 
              className="rounded-xl p-4 cursor-pointer transition-all hover:opacity-90"
              style={{ backgroundColor: colors.accent3 }}
              onClick={() => setShowDescription(!showDescription)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium" style={{ color: colors.dark }}>Description</span>
                {showDescription ? (
                  <ChevronUp className="w-5 h-5" style={{ color: colors.muted }} />
                ) : (
                  <ChevronDown className="w-5 h-5" style={{ color: colors.muted }} />
                )}
              </div>
              <motion.div
                initial={false}
                animate={{ height: showDescription ? 'auto' : '3rem' }}
                className="overflow-hidden"
              >
                <p className="text-sm whitespace-pre-wrap" style={{ color: colors.muted }}>
                  {getDescriptionText(video.description)}
                </p>
                {video.tags && video.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {video.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full text-sm"
                        style={{ backgroundColor: colors.accent1, color: colors.gold }}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>
          </div>

          {/* Comments Section */}
          <div 
            className="rounded-2xl p-6 shadow-lg"
            style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}` }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: colors.dark }}>
                <MessageCircle className="w-6 h-6" style={{ color: colors.gold }} />
                {comments.length} Comments
              </h2>
              <select
                value={commentSort}
                onChange={(e) => setCommentSort(e.target.value as 'newest' | 'top')}
                className="px-4 py-2 rounded-lg outline-none cursor-pointer"
                style={{ backgroundColor: colors.accent3, color: colors.dark, border: `1px solid ${colors.border}` }}
              >
                <option value="top">Top Comments</option>
                <option value="newest">Newest First</option>
              </select>
            </div>

            {/* Add Comment */}
            <form onSubmit={handleSubmitComment} className="flex items-start gap-3 mb-8">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: colors.gold }}
              >
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full p-3 rounded-xl outline-none transition-all"
                  style={{ 
                    backgroundColor: colors.accent3, 
                    color: colors.dark,
                    border: `1px solid ${colors.border}` 
                  }}
                />
                {newComment && (
                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setNewComment('')}
                      className="px-4 py-2 rounded-full font-medium"
                      style={{ color: colors.muted }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingComment}
                      className="px-6 py-2 rounded-full font-medium transition-all hover:opacity-80 disabled:opacity-50"
                      style={{ backgroundColor: colors.gold, color: colors.white }}
                    >
                      {submittingComment ? 'Posting...' : 'Comment'}
                    </button>
                  </div>
                )}
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-6">
              {comments.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-30" style={{ color: colors.muted }} />
                  <p style={{ color: colors.muted }}>No comments yet. Be the first to comment!</p>
                </div>
              ) : (
                comments
                  .sort((a, b) => {
                    if (commentSort === 'newest') {
                      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    }
                    // Handle likes which might be objects {count, users}
                    const aLikes = typeof a.likes === 'object' && a.likes !== null ? (a.likes.count || 0) : (a.likes || 0);
                    const bLikes = typeof b.likes === 'object' && b.likes !== null ? (b.likes.count || 0) : (b.likes || 0);
                    return bLikes - aLikes;
                  })
                  .map((comment) => (
                    <motion.div
                      key={comment._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3"
                    >
                      {comment.user?.profilePicture ? (
                        <img
                          src={comment.user.profilePicture}
                          alt={comment.user.name}
                          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: colors.accent2 }}
                        >
                          <User className="w-5 h-5" style={{ color: colors.gold }} />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium" style={{ color: colors.dark }}>
                            {comment.user?.name || 'Anonymous'}
                          </span>
                          <span className="text-xs" style={{ color: colors.muted }}>
                            {formatRelativeTime(comment.createdAt)}
                          </span>
                        </div>
                        <p className="mb-2" style={{ color: colors.dark }}>{getContentText(comment.content)}</p>
                        <div className="flex items-center gap-4">
                          <button className="flex items-center gap-1 text-sm" style={{ color: colors.muted }}>
                            <ThumbsUp className="w-4 h-4" />
                            <span>{typeof comment.likes === 'object' && comment.likes !== null ? (comment.likes.count || 0) : (comment.likes || 0)}</span>
                          </button>
                          <button className="flex items-center gap-1 text-sm" style={{ color: colors.muted }}>
                            <ThumbsDown className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setReplyingTo(replyingTo === comment._id ? null : comment._id)}
                            className="flex items-center gap-1 text-sm font-medium"
                            style={{ color: colors.gold }}
                          >
                            <Reply className="w-4 h-4" />
                            Reply
                          </button>
                        </div>

                        {/* Reply Input */}
                        <AnimatePresence>
                          {replyingTo === comment._id && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-3 flex gap-2"
                            >
                              <input
                                type="text"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Add a reply..."
                                className="flex-1 p-2 rounded-lg text-sm outline-none"
                                style={{ 
                                  backgroundColor: colors.accent3, 
                                  color: colors.dark,
                                  border: `1px solid ${colors.border}` 
                                }}
                              />
                              <button
                                onClick={() => handleSubmitReply(comment._id)}
                                disabled={!replyText.trim()}
                                className="px-4 py-2 rounded-lg font-medium transition-all hover:opacity-80 disabled:opacity-50"
                                style={{ backgroundColor: colors.gold, color: colors.white }}
                              >
                                Reply
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                          <div className="mt-4 space-y-4 pl-4 border-l-2" style={{ borderColor: colors.border }}>
                            {comment.replies.map((reply) => (
                              <div key={reply._id} className="flex gap-3">
                                <div 
                                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                  style={{ backgroundColor: colors.accent2 }}
                                >
                                  <User className="w-4 h-4" style={{ color: colors.gold }} />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-medium text-sm" style={{ color: colors.dark }}>
                                      {reply.user?.name || 'Anonymous'}
                                    </span>
                                    <span className="text-xs" style={{ color: colors.muted }}>
                                      {formatRelativeTime(reply.createdAt)}
                                    </span>
                                  </div>
                                  <p className="text-sm" style={{ color: colors.dark }}>{getContentText(reply.content)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
              )}
            </div>
          </div>
        </div>

        {/* Related Videos Sidebar */}
        <div className="lg:w-[400px] space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: colors.dark }}>
            <BookOpen className="w-5 h-5" style={{ color: colors.gold }} />
            Related Videos
          </h2>
          <div className="space-y-3">
            {relatedVideos.map((relatedVideo) => (
              <Link
                key={relatedVideo._id}
                to={`/videos/${relatedVideo._id}`}
                className="flex gap-3 p-3 rounded-xl transition-all hover:shadow-md"
                style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}` }}
              >
                <div className="relative w-40 aspect-video rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={getThumbnailUrl(relatedVideo)}
                    alt={getTitleText(relatedVideo.title)}
                    className="w-full h-full object-cover"
                  />
                  <div 
                    className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-xs text-white"
                    style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
                  >
                    {formatDuration(relatedVideo.duration || 0)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 
                    className="font-medium text-sm line-clamp-2 mb-1"
                    style={{ color: colors.dark }}
                  >
                    {getTitleText(relatedVideo.title)}
                  </h3>
                  <p className="text-xs mb-1" style={{ color: colors.muted }}>
                    {getCreatorName(relatedVideo)}
                  </p>
                  <p className="text-xs" style={{ color: colors.muted }}>
                    {formatViews(getViewCount(relatedVideo))} views • {formatRelativeTime(relatedVideo.createdAt)}
                  </p>
                </div>
              </Link>
            ))}

            {relatedVideos.length === 0 && (
              <div 
                className="text-center py-8 rounded-xl"
                style={{ backgroundColor: colors.accent4 }}
              >
                <p style={{ color: colors.muted }}>No related videos found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl p-6"
              style={{ backgroundColor: colors.white }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold" style={{ color: colors.dark }}>Share Video</h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="p-2 rounded-full transition-all hover:opacity-80"
                  style={{ backgroundColor: colors.accent3 }}
                >
                  <X className="w-5 h-5" style={{ color: colors.muted }} />
                </button>
              </div>

              <div className="grid grid-cols-4 gap-4 mb-6">
                <button
                  className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:opacity-80"
                  style={{ backgroundColor: colors.accent3 }}
                >
                  <Twitter className="w-8 h-8" style={{ color: '#1DA1F2' }} />
                  <span className="text-xs" style={{ color: colors.dark }}>Twitter</span>
                </button>
                <button
                  className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:opacity-80"
                  style={{ backgroundColor: colors.accent3 }}
                >
                  <Facebook className="w-8 h-8" style={{ color: '#4267B2' }} />
                  <span className="text-xs" style={{ color: colors.dark }}>Facebook</span>
                </button>
                <button
                  className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:opacity-80"
                  style={{ backgroundColor: colors.accent3 }}
                >
                  <Linkedin className="w-8 h-8" style={{ color: '#0A66C2' }} />
                  <span className="text-xs" style={{ color: colors.dark }}>LinkedIn</span>
                </button>
                <button
                  onClick={handleCopyLink}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:opacity-80"
                  style={{ backgroundColor: colors.accent3 }}
                >
                  {copied ? (
                    <Check className="w-8 h-8" style={{ color: '#22C55E' }} />
                  ) : (
                    <Link2 className="w-8 h-8" style={{ color: colors.gold }} />
                  )}
                  <span className="text-xs" style={{ color: colors.dark }}>
                    {copied ? 'Copied!' : 'Copy Link'}
                  </span>
                </button>
              </div>

              <div 
                className="flex items-center gap-2 p-3 rounded-xl"
                style={{ backgroundColor: colors.accent3, border: `1px solid ${colors.border}` }}
              >
                <input
                  type="text"
                  value={window.location.href}
                  readOnly
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: colors.muted }}
                />
                <button
                  onClick={handleCopyLink}
                  className="p-2 rounded-lg transition-all hover:opacity-80"
                  style={{ backgroundColor: colors.gold }}
                >
                  <Copy className="w-4 h-4 text-white" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
