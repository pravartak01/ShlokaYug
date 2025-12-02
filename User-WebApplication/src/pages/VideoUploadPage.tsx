import { useState, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload,
  Video,
  Image,
  X,
  Check,
  AlertCircle,
  Plus,
  Home,
  Bell,
  User,
  ArrowLeft,
  FileVideo,
  Eye,
  Globe,
  Lock,
  Tag,
  Type,
  Sparkles,
  CheckCircle2,
  Film,
  Zap
} from 'lucide-react';
import { uploadVideo } from '../services/videoService';

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
  success: '#22C55E',
  error: '#EF4444',
};

// Categories
const categories = [
  { id: 'vedic', name: 'Vedic Studies', icon: '📿' },
  { id: 'sanskrit', name: 'Sanskrit Language', icon: '📜' },
  { id: 'chandas', name: 'Chandas (Prosody)', icon: '🎵' },
  { id: 'philosophy', name: 'Philosophy', icon: '🧘' },
  { id: 'literature', name: 'Literature', icon: '📚' },
  { id: 'history', name: 'History', icon: '🏛️' },
  { id: 'tutorial', name: 'Tutorials', icon: '🎓' },
  { id: 'lecture', name: 'Lectures', icon: '🎤' },
  { id: 'other', name: 'Other', icon: '📦' },
];

// Visibility options
const visibilityOptions = [
  { id: 'public', name: 'Public', description: 'Everyone can watch this video', icon: Globe },
  { id: 'unlisted', name: 'Unlisted', description: 'Only people with the link can watch', icon: Eye },
  { id: 'private', name: 'Private', description: 'Only you can watch this video', icon: Lock },
];

// Video type options
const videoTypeOptions = [
  { id: 'video', name: 'Regular Video', description: 'Standard horizontal video format', icon: Video },
  { id: 'short', name: 'Short', description: 'Vertical video under 60 seconds', icon: Zap },
];

type UploadStep = 'details' | 'uploading' | 'processing' | 'complete';

export default function VideoUploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [videoType, setVideoType] = useState('video');

  // File state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);

  // Upload state
  const [uploadStep, setUploadStep] = useState<UploadStep>('details');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedVideoId, setUploadedVideoId] = useState<string | null>(null);

  // Drag state
  const [isDraggingVideo, setIsDraggingVideo] = useState(false);
  const [isDraggingThumbnail, setIsDraggingThumbnail] = useState(false);

  // Handle video file selection
  const handleVideoSelect = useCallback((file: File) => {
    if (!file.type.startsWith('video/')) {
      setError('Please select a valid video file');
      return;
    }

    const maxSize = 500 * 1024 * 1024; // 500MB
    if (file.size > maxSize) {
      setError('Video file must be under 500MB');
      return;
    }

    setVideoFile(file);
    setError(null);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setVideoPreview(url);

    // Get video duration
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      setVideoDuration(video.duration);
      URL.revokeObjectURL(video.src);
      
      // Auto-set to short if under 60 seconds and vertical
      if (video.duration <= 60) {
        setVideoType('short');
      }
    };
    video.src = url;

    // Auto-fill title from filename
    if (!title) {
      const name = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(name);
    }
  }, [title]);

  // Handle thumbnail file selection
  const handleThumbnailSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('Thumbnail must be under 5MB');
      return;
    }

    setThumbnailFile(file);
    setError(null);
    setThumbnailPreview(URL.createObjectURL(file));
  }, []);

  // Handle drag events
  const handleDragOver = (e: React.DragEvent, setDragging: (v: boolean) => void) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent, setDragging: (v: boolean) => void) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (
    e: React.DragEvent, 
    handler: (file: File) => void,
    setDragging: (v: boolean) => void
  ) => {
    e.preventDefault();
    setDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handler(file);
    }
  };

  // Handle tag input
  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / 1024).toFixed(2)} KB`;
  };

  // Format duration
  const formatDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Validate form
  const isValid = videoFile && title.trim() && category;

  // Handle upload
  const handleUpload = async () => {
    if (!isValid || !videoFile) return;

    setUploadStep('uploading');
    setError(null);

    try {
      // Actual upload with VideoUploadData
      const uploadData = {
        title: title.trim(),
        description: description.trim(),
        type: videoType as 'video' | 'short',
        category: category,
        visibility: visibility as 'public' | 'private' | 'unlisted',
        tags: tags,
        videoFile: videoFile,
        thumbnailFile: thumbnailFile || undefined
      };

      console.log('📤 Uploading with data:', {
        title: uploadData.title,
        description: uploadData.description,
        type: uploadData.type,
        category: uploadData.category,
        visibility: uploadData.visibility,
        tags: uploadData.tags,
        videoFileName: videoFile.name,
        videoFileSize: videoFile.size,
        thumbnailFileName: thumbnailFile?.name
      });

      const result = await uploadVideo(uploadData, (progress) => {
        setUploadProgress(progress);
      });
      
      setUploadProgress(100);
      setUploadStep('processing');

      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setUploadedVideoId(result.data?.video?._id || '');
      setUploadStep('complete');
    } catch (err: any) {
      console.error('Upload error:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error details:', {
        message: err.response?.data?.error?.message,
        code: err.response?.data?.error?.code,
        fullError: err.response?.data
      });
      const errorMessage = err.response?.data?.error?.message || err.message || 'Failed to upload video';
      setError(errorMessage);
      setUploadStep('details');
      setUploadProgress(0);
    }
  };

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
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Left - Back & Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/videos')}
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
                Chandas Studio
              </span>
            </Link>
          </div>

          {/* Right - Actions */}
          <div className="flex items-center gap-2">
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
            </button>
            
            <button 
              className="p-2.5 rounded-full transition-all hover:opacity-80"
              style={{ backgroundColor: colors.accent3 }}
            >
              <User className="w-5 h-5" style={{ color: colors.gold }} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4"
          >
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
              style={{ 
                background: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldLight} 100%)` 
              }}
            >
              <Upload className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: colors.dark }}>
                Upload Video
              </h1>
              <p style={{ color: colors.muted }}>
                Share your knowledge with the world
              </p>
            </div>
          </motion.div>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[
              { key: 'details', label: 'Details', icon: Type },
              { key: 'uploading', label: 'Uploading', icon: Upload },
              { key: 'processing', label: 'Processing', icon: Sparkles },
              { key: 'complete', label: 'Complete', icon: Check },
            ].map((step, index) => {
              const isActive = uploadStep === step.key;
              const isPast = ['details', 'uploading', 'processing', 'complete'].indexOf(uploadStep) > index;
              const Icon = step.icon;
              
              return (
                <div key={step.key} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <motion.div
                      animate={{
                        scale: isActive ? 1.1 : 1,
                        backgroundColor: isPast || isActive ? colors.gold : colors.accent3,
                      }}
                      className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
                    >
                      <Icon 
                        className={`w-6 h-6 ${isPast || isActive ? 'text-white' : ''}`}
                        style={{ color: isPast || isActive ? undefined : colors.muted }}
                      />
                    </motion.div>
                    <span 
                      className={`text-sm font-medium ${isActive ? 'font-bold' : ''}`}
                      style={{ color: isPast || isActive ? colors.dark : colors.muted }}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < 3 && (
                    <div 
                      className="w-20 h-1 mx-2 rounded-full"
                      style={{ 
                        backgroundColor: isPast ? colors.gold : colors.accent3 
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 rounded-xl flex items-center gap-3"
              style={{ backgroundColor: '#FEE2E2', border: `1px solid ${colors.error}` }}
            >
              <AlertCircle className="w-5 h-5" style={{ color: colors.error }} />
              <span style={{ color: colors.error }}>{error}</span>
              <button 
                onClick={() => setError(null)}
                className="ml-auto"
              >
                <X className="w-4 h-4" style={{ color: colors.error }} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Details Step */}
        {uploadStep === 'details' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Left Column - Video & Thumbnail */}
            <div className="lg:col-span-1 space-y-6">
              {/* Video Upload */}
              <div 
                className="rounded-2xl p-6 shadow-lg"
                style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}` }}
              >
                <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: colors.dark }}>
                  <FileVideo className="w-5 h-5" style={{ color: colors.gold }} />
                  Video File
                </h3>
                
                {!videoFile ? (
                  <div
                    onDragOver={(e) => handleDragOver(e, setIsDraggingVideo)}
                    onDragLeave={(e) => handleDragLeave(e, setIsDraggingVideo)}
                    onDrop={(e) => handleDrop(e, handleVideoSelect, setIsDraggingVideo)}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                      isDraggingVideo ? 'scale-105' : ''
                    }`}
                    style={{ 
                      borderColor: isDraggingVideo ? colors.gold : colors.border,
                      backgroundColor: isDraggingVideo ? colors.accent1 : colors.accent4
                    }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleVideoSelect(e.target.files[0])}
                    />
                    <Video className="w-12 h-12 mx-auto mb-4" style={{ color: colors.gold }} />
                    <p className="font-medium mb-2" style={{ color: colors.dark }}>
                      Drag & drop your video
                    </p>
                    <p className="text-sm mb-4" style={{ color: colors.muted }}>
                      or click to browse
                    </p>
                    <p className="text-xs" style={{ color: colors.muted }}>
                      MP4, MOV, AVI • Max 500MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative rounded-xl overflow-hidden" style={{ backgroundColor: colors.dark }}>
                      {videoPreview && (
                        <video
                          src={videoPreview}
                          className="w-full aspect-video object-contain"
                          controls
                        />
                      )}
                      <button
                        onClick={() => {
                          setVideoFile(null);
                          setVideoPreview(null);
                        }}
                        className="absolute top-2 right-2 p-2 rounded-full transition-all hover:opacity-80"
                        style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                    <div 
                      className="p-3 rounded-xl text-sm"
                      style={{ backgroundColor: colors.accent3 }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span style={{ color: colors.muted }}>File:</span>
                        <span className="font-medium truncate ml-2" style={{ color: colors.dark }}>
                          {videoFile.name}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-1">
                        <span style={{ color: colors.muted }}>Size:</span>
                        <span style={{ color: colors.dark }}>{formatFileSize(videoFile.size)}</span>
                      </div>
                      {videoDuration > 0 && (
                        <div className="flex items-center justify-between">
                          <span style={{ color: colors.muted }}>Duration:</span>
                          <span style={{ color: colors.dark }}>{formatDuration(videoDuration)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Thumbnail Upload */}
              <div 
                className="rounded-2xl p-6 shadow-lg"
                style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}` }}
              >
                <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: colors.dark }}>
                  <Image className="w-5 h-5" style={{ color: colors.gold }} />
                  Thumbnail (Optional)
                </h3>
                
                {!thumbnailFile ? (
                  <div
                    onDragOver={(e) => handleDragOver(e, setIsDraggingThumbnail)}
                    onDragLeave={(e) => handleDragLeave(e, setIsDraggingThumbnail)}
                    onDrop={(e) => handleDrop(e, handleThumbnailSelect, setIsDraggingThumbnail)}
                    onClick={() => thumbnailInputRef.current?.click()}
                    className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all"
                    style={{ 
                      borderColor: isDraggingThumbnail ? colors.gold : colors.border,
                      backgroundColor: isDraggingThumbnail ? colors.accent1 : colors.accent4
                    }}
                  >
                    <input
                      ref={thumbnailInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleThumbnailSelect(e.target.files[0])}
                    />
                    <Image className="w-8 h-8 mx-auto mb-2" style={{ color: colors.gold }} />
                    <p className="text-sm" style={{ color: colors.muted }}>
                      Click or drag to upload
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={thumbnailPreview!}
                      alt="Thumbnail preview"
                      className="w-full aspect-video object-cover rounded-xl"
                    />
                    <button
                      onClick={() => {
                        setThumbnailFile(null);
                        setThumbnailPreview(null);
                      }}
                      className="absolute top-2 right-2 p-2 rounded-full transition-all hover:opacity-80"
                      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title & Description */}
              <div 
                className="rounded-2xl p-6 shadow-lg"
                style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}` }}
              >
                <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: colors.dark }}>
                  <Type className="w-5 h-5" style={{ color: colors.gold }} />
                  Details
                </h3>

                {/* Title */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.dark }}>
                    Title <span style={{ color: colors.error }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter video title..."
                    maxLength={100}
                    className="w-full p-3 rounded-xl outline-none transition-all focus:ring-2"
                    style={{ 
                      backgroundColor: colors.accent3, 
                      color: colors.dark,
                      border: `1px solid ${colors.border}`,
                    }}
                  />
                  <p className="text-xs mt-1 text-right" style={{ color: colors.muted }}>
                    {title.length}/100
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.dark }}>
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Tell viewers about your video..."
                    rows={4}
                    maxLength={5000}
                    className="w-full p-3 rounded-xl outline-none transition-all focus:ring-2 resize-none"
                    style={{ 
                      backgroundColor: colors.accent3, 
                      color: colors.dark,
                      border: `1px solid ${colors.border}`,
                    }}
                  />
                  <p className="text-xs mt-1 text-right" style={{ color: colors.muted }}>
                    {description.length}/5000
                  </p>
                </div>
              </div>

              {/* Category & Tags */}
              <div 
                className="rounded-2xl p-6 shadow-lg"
                style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}` }}
              >
                <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: colors.dark }}>
                  <Tag className="w-5 h-5" style={{ color: colors.gold }} />
                  Category & Tags
                </h3>

                {/* Category */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.dark }}>
                    Category <span style={{ color: colors.error }}>*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={`p-3 rounded-xl text-sm font-medium transition-all ${
                          category === cat.id ? 'ring-2' : ''
                        }`}
                        style={{ 
                          backgroundColor: category === cat.id ? colors.accent1 : colors.accent3,
                          color: colors.dark,
                          borderColor: colors.gold
                        }}
                      >
                        <span className="text-lg mr-1">{cat.icon}</span>
                        <span className="hidden sm:inline">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.dark }}>
                    Tags (up to 10)
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full text-sm flex items-center gap-1"
                        style={{ backgroundColor: colors.accent1, color: colors.gold }}
                      >
                        #{tag}
                        <button onClick={() => handleRemoveTag(tag)}>
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      placeholder="Add a tag..."
                      className="flex-1 p-3 rounded-xl outline-none"
                      style={{ 
                        backgroundColor: colors.accent3, 
                        color: colors.dark,
                        border: `1px solid ${colors.border}`,
                      }}
                    />
                    <button
                      onClick={handleAddTag}
                      disabled={!tagInput.trim() || tags.length >= 10}
                      className="px-4 py-2 rounded-xl font-medium transition-all hover:opacity-80 disabled:opacity-50"
                      style={{ backgroundColor: colors.gold, color: colors.white }}
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Video Type & Visibility */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Video Type */}
                <div 
                  className="rounded-2xl p-6 shadow-lg"
                  style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}` }}
                >
                  <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: colors.dark }}>
                    <Film className="w-5 h-5" style={{ color: colors.gold }} />
                    Video Type
                  </h3>
                  <div className="space-y-2">
                    {videoTypeOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.id}
                          onClick={() => setVideoType(option.id)}
                          className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${
                            videoType === option.id ? 'ring-2' : ''
                          }`}
                          style={{ 
                            backgroundColor: videoType === option.id ? colors.accent1 : colors.accent3,
                            borderColor: colors.gold
                          }}
                        >
                          <Icon className="w-5 h-5" style={{ color: colors.gold }} />
                          <div className="text-left">
                            <p className="font-medium" style={{ color: colors.dark }}>{option.name}</p>
                            <p className="text-xs" style={{ color: colors.muted }}>{option.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Visibility */}
                <div 
                  className="rounded-2xl p-6 shadow-lg"
                  style={{ backgroundColor: colors.white, border: `1px solid ${colors.border}` }}
                >
                  <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: colors.dark }}>
                    <Eye className="w-5 h-5" style={{ color: colors.gold }} />
                    Visibility
                  </h3>
                  <div className="space-y-2">
                    {visibilityOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.id}
                          onClick={() => setVisibility(option.id)}
                          className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all ${
                            visibility === option.id ? 'ring-2' : ''
                          }`}
                          style={{ 
                            backgroundColor: visibility === option.id ? colors.accent1 : colors.accent3,
                            borderColor: colors.gold
                          }}
                        >
                          <Icon className="w-5 h-5" style={{ color: colors.gold }} />
                          <div className="text-left">
                            <p className="font-medium" style={{ color: colors.dark }}>{option.name}</p>
                            <p className="text-xs" style={{ color: colors.muted }}>{option.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => navigate('/videos')}
                  className="px-6 py-3 rounded-xl font-medium transition-all hover:opacity-80"
                  style={{ backgroundColor: colors.accent3, color: colors.dark }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!isValid}
                  className="px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
                  style={{ 
                    background: `linear-gradient(135deg, ${colors.gold} 0%, ${colors.goldLight} 100%)`,
                    color: colors.white 
                  }}
                >
                  <Upload className="w-5 h-5" />
                  Upload Video
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Uploading Step */}
        {uploadStep === 'uploading' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-xl mx-auto text-center py-12"
          >
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: colors.accent1 }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Upload className="w-12 h-12" style={{ color: colors.gold }} />
              </motion.div>
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: colors.dark }}>
              Uploading Your Video
            </h2>
            <p className="mb-8" style={{ color: colors.muted }}>
              Please don't close this page while uploading
            </p>
            
            {/* Progress Bar */}
            <div className="mb-4">
              <div 
                className="h-3 rounded-full overflow-hidden"
                style={{ backgroundColor: colors.accent3 }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: colors.gold }}
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-sm mt-2" style={{ color: colors.muted }}>
                {Math.round(uploadProgress)}% uploaded
              </p>
            </div>

            {/* File Info */}
            {videoFile && (
              <div 
                className="p-4 rounded-xl"
                style={{ backgroundColor: colors.accent4 }}
              >
                <p className="text-sm" style={{ color: colors.dark }}>
                  <strong>{videoFile.name}</strong>
                </p>
                <p className="text-xs" style={{ color: colors.muted }}>
                  {formatFileSize(videoFile.size)}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Processing Step */}
        {uploadStep === 'processing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-xl mx-auto text-center py-12"
          >
            <div 
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: colors.accent1 }}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Sparkles className="w-12 h-12" style={{ color: colors.gold }} />
              </motion.div>
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: colors.dark }}>
              Processing Your Video
            </h2>
            <p className="mb-8" style={{ color: colors.muted }}>
              We're optimizing your video for the best viewing experience
            </p>
            <div className="flex justify-center gap-2">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors.gold }}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 0.6, delay: i * 0.2, repeat: Infinity }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Complete Step */}
        {uploadStep === 'complete' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-xl mx-auto text-center py-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: '#D1FAE5' }}
            >
              <CheckCircle2 className="w-12 h-12" style={{ color: colors.success }} />
            </motion.div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: colors.dark }}>
              Upload Complete! 🎉
            </h2>
            <p className="mb-8" style={{ color: colors.muted }}>
              Your video has been uploaded and is now available
            </p>
            
            {/* Video Preview */}
            {thumbnailPreview && (
              <div className="mb-8 rounded-xl overflow-hidden mx-auto max-w-sm shadow-lg">
                <img
                  src={thumbnailPreview}
                  alt="Video thumbnail"
                  className="w-full aspect-video object-cover"
                />
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {uploadedVideoId && (
                <Link
                  to={`/videos/${uploadedVideoId}`}
                  className="px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all hover:opacity-80"
                  style={{ backgroundColor: colors.gold, color: colors.white }}
                >
                  <Eye className="w-5 h-5" />
                  View Video
                </Link>
              )}
              <button
                onClick={() => {
                  // Reset form
                  setTitle('');
                  setDescription('');
                  setCategory('');
                  setTags([]);
                  setVideoFile(null);
                  setVideoPreview(null);
                  setThumbnailFile(null);
                  setThumbnailPreview(null);
                  setUploadProgress(0);
                  setUploadStep('details');
                  setUploadedVideoId(null);
                }}
                className="px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all hover:opacity-80"
                style={{ backgroundColor: colors.accent3, color: colors.dark }}
              >
                <Plus className="w-5 h-5" />
                Upload Another
              </button>
              <Link
                to="/videos"
                className="px-6 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-all hover:opacity-80"
                style={{ backgroundColor: colors.accent3, color: colors.dark }}
              >
                <Home className="w-5 h-5" />
                Back to Videos
              </Link>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
