import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Play, X, Headphones, Music, Clock, Users, Star, Loader2, ChevronRight, Sparkles } from 'lucide-react';
import type { ShlokaData } from '../../data/shlokas';
import {
  ALL_SHLOKAS,
  SHLOKA_CATEGORIES,
  DIFFICULTY_LEVELS,
  FEATURED_SHLOKAS,
  searchShlokas,
  hasAudio,
  getAudioUrl,
} from '../../data/shlokas';

interface ShlokaListProps {
  onSelectShloka: (shloka: ShlokaData) => void;
}

const ShlokaList: React.FC<ShlokaListProps> = ({ onSelectShloka }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Audio preview state
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Audio preview function
  const handleAudioPreview = async (shloka: ShlokaData, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const audioUrl = getAudioUrl(shloka.id);
      if (!audioUrl) {
        console.log('No audio available for this shloka');
        return;
      }

      // If already previewing this shloka, stop it
      if (previewingId === shloka.id) {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        setPreviewingId(null);
        return;
      }

      // Stop any existing preview
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      setIsLoadingAudio(true);
      setPreviewingId(shloka.id);

      // Create and play audio
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.oncanplaythrough = () => {
        setIsLoadingAudio(false);
        audio.play();
      };

      audio.onended = () => {
        setPreviewingId(null);
        audioRef.current = null;
      };

      audio.onerror = () => {
        setIsLoadingAudio(false);
        setPreviewingId(null);
        audioRef.current = null;
        console.error('Error loading audio');
      };

      audio.load();
    } catch (error) {
      console.error('Error playing audio preview:', error);
      setIsLoadingAudio(false);
      setPreviewingId(null);
    }
  };

  // Filter shlokas
  const filteredShlokas = useMemo(() => {
    let result = ALL_SHLOKAS;

    if (searchQuery) {
      result = searchShlokas(searchQuery);
    }

    if (selectedCategory !== 'all') {
      result = result.filter((s) =>
        s.category.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    if (selectedDifficulty !== 'all') {
      result = result.filter((s) => s.difficulty === selectedDifficulty);
    }

    return result;
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCount = (count: number) => {
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  // Featured Carousel Item
  const renderFeaturedItem = (shloka: ShlokaData, index: number) => (
    <motion.div
      key={shloka.id}
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={() => onSelectShloka(shloka)}
      className="min-w-[320px] md:min-w-[400px] h-[200px] rounded-3xl overflow-hidden cursor-pointer transform hover:scale-[1.02] transition-all duration-300 mr-4 group"
      style={{
        background: `linear-gradient(135deg, ${shloka.thumbnailColor}, ${shloka.thumbnailColor}88, #1a1a2e)`,
      }}
    >
      <div className="relative h-full p-5 flex flex-col justify-between">
        {/* Decorative Elements */}
        <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-white/10 blur-xl" />
        <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-white/5 blur-2xl" />

        {/* Content */}
        <div className="relative z-10 flex items-start justify-between">
          {/* Category Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full">
            <Sparkles className="w-3 h-3 text-white" />
            <span className="text-white text-xs font-semibold">{shloka.category}</span>
          </div>
          
          {/* Difficulty */}
          <div
            className="px-2.5 py-1 rounded-full text-[10px] font-bold text-white"
            style={{ backgroundColor: DIFFICULTY_LEVELS.find(d => d.id === shloka.difficulty)?.color || '#888' }}
          >
            {shloka.difficulty.toUpperCase()}
          </div>
        </div>

        <div className="relative z-10">
          <h3 className="text-xl font-bold text-white group-hover:translate-x-1 transition-transform">{shloka.title}</h3>
          <p className="text-white/80 text-sm mt-1">{shloka.subtitle}</p>
          <p className="text-white/60 text-xs mt-1">{shloka.source}</p>
        </div>

        <div className="relative z-10 flex justify-between items-center">
          <div className="flex gap-4">
            <div className="flex items-center gap-1.5 bg-black/20 px-2 py-1 rounded-lg">
              <Clock className="w-3 h-3 text-white" />
              <span className="text-white text-xs font-medium">{formatDuration(shloka.duration)}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/20 px-2 py-1 rounded-lg">
              <Users className="w-3 h-3 text-white" />
              <span className="text-white text-xs font-medium">{formatCount(shloka.practiceCount)}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/20 px-2 py-1 rounded-lg">
              <Star className="w-3 h-3 text-yellow-400" />
              <span className="text-white text-xs font-medium">{shloka.rating}</span>
            </div>
          </div>

          <button
            className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-full hover:bg-white/90 transition-all hover:scale-105 shadow-lg"
            style={{ color: shloka.thumbnailColor }}
          >
            <Play className="w-4 h-4 fill-current" />
            <span className="text-sm font-bold">Practice</span>
          </button>
        </div>
      </div>
    </motion.div>
  );

  // Shloka List Item - Improved Card Design
  const renderShlokaItem = (shloka: ShlokaData, index: number) => {
    const difficultyColor = DIFFICULTY_LEVELS.find((d) => d.id === shloka.difficulty)?.color || '#888';
    const audioAvailable = hasAudio(shloka.id);
    const isPreviewing = previewingId === shloka.id;

    return (
      <motion.div
        key={shloka.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className="group bg-gradient-to-r from-[#1a1a2e] to-[#1a1a2e]/80 rounded-2xl p-4 mb-3 hover:from-[#252545] hover:to-[#252545]/80 transition-all duration-300 cursor-pointer border border-transparent hover:border-white/10 hover:shadow-xl hover:shadow-black/20"
        onClick={() => onSelectShloka(shloka)}
      >
        <div className="flex items-center">
          {/* Thumbnail */}
          <div
            className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center relative flex-shrink-0 overflow-hidden group-hover:scale-105 transition-transform"
            style={{ 
              background: `linear-gradient(135deg, ${shloka.thumbnailColor}40, ${shloka.thumbnailColor}20)`,
              border: `1px solid ${shloka.thumbnailColor}30`
            }}
          >
            <Music className="w-7 h-7" style={{ color: shloka.thumbnailColor }} />
            <div
              className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-md text-[9px] text-white font-bold shadow-lg"
              style={{ backgroundColor: shloka.thumbnailColor }}
            >
              {formatDuration(shloka.duration)}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 ml-4 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-white font-semibold truncate group-hover:text-orange-300 transition-colors">{shloka.title}</h3>
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0 ring-2 ring-black/20"
                style={{ backgroundColor: difficultyColor }}
                title={shloka.difficulty}
              />
            </div>
            <p className="text-gray-400 text-sm truncate">{shloka.subtitle}</p>

            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-500 text-xs">{shloka.source}</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3 text-gray-500" />
                  <span className="text-gray-500 text-xs">{formatCount(shloka.practiceCount)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400" />
                  <span className="text-gray-400 text-xs font-medium">{shloka.rating}</span>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="flex gap-1.5 mt-2.5 flex-wrap">
              {shloka.tags.slice(0, 2).map((tag, idx) => (
                <span key={idx} className="px-2.5 py-0.5 bg-[#252545] text-gray-400 text-[10px] rounded-full border border-white/5">
                  {tag}
                </span>
              ))}
              {audioAvailable && (
                <span className="px-2.5 py-0.5 bg-green-500/10 text-green-400 text-[10px] rounded-full flex items-center gap-1 border border-green-500/20">
                  <Headphones className="w-2.5 h-2.5" />
                  Audio
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col items-center gap-2 ml-3">
            {/* Audio Preview Button */}
            {audioAvailable && (
              <button
                onClick={(e) => handleAudioPreview(shloka, e)}
                title={isPreviewing ? 'Stop preview' : 'Preview audio'}
                className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-200 ${
                  isPreviewing
                    ? 'bg-green-500 border-green-500 scale-110'
                    : 'bg-green-500/10 border-green-500/30 hover:bg-green-500/20 hover:scale-105'
                }`}
              >
                {isLoadingAudio && previewingId === shloka.id ? (
                  <Loader2 className="w-4 h-4 text-green-400 animate-spin" />
                ) : (
                  <Headphones className={`w-4 h-4 ${isPreviewing ? 'text-white' : 'text-green-400'}`} />
                )}
              </button>
            )}

            {/* Play Button */}
            <button
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg hover:scale-105 transition-all duration-200 group-hover:shadow-xl"
              style={{ 
                background: `linear-gradient(135deg, ${shloka.thumbnailColor}, ${shloka.thumbnailColor}cc)`,
                boxShadow: `0 4px 20px ${shloka.thumbnailColor}40`
              }}
              title="Practice this shloka"
              onClick={(e) => {
                e.stopPropagation();
                onSelectShloka(shloka);
              }}
            >
              <Play className="w-5 h-5 text-white fill-white" />
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen pb-8">
      {/* Search and Filter Section */}
      <div className="sticky top-0 z-30 bg-gradient-to-b from-[#0f0f1a] via-[#0f0f1a] to-transparent pb-4 pt-2">
        <div className="px-4 md:px-6 lg:px-8">
          <div className="flex gap-3">
            {/* Search Bar */}
            <div className="flex-1 flex items-center bg-[#1a1a2e] rounded-2xl px-4 h-14 gap-3 border border-white/5 focus-within:border-orange-500/30 transition-colors">
              <Search className="w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search shlokas, mantras, sources..."
                className="flex-1 bg-transparent text-white text-sm outline-none placeholder-gray-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery.length > 0 && (
                <button onClick={() => setSearchQuery('')} title="Clear search" className="hover:bg-white/10 p-1.5 rounded-lg transition-colors">
                  <X className="w-4 h-4 text-gray-500 hover:text-white transition-colors" />
                </button>
              )}
            </div>
            
            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              title={showFilters ? 'Hide filters' : 'Show filters'}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                showFilters 
                  ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30' 
                  : 'bg-[#1a1a2e] text-gray-400 hover:text-white border border-white/5 hover:border-orange-500/30'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 md:px-6 lg:px-8 pb-4">
              <div className="bg-[#1a1a2e] rounded-2xl p-4 border border-white/5">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-3 font-medium">Difficulty Level</p>
                <div className="flex flex-wrap gap-2">
                  {DIFFICULTY_LEVELS.map((level) => (
                    <button
                      key={level.id}
                      onClick={() => setSelectedDifficulty(level.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-medium transition-all duration-200 ${
                        selectedDifficulty === level.id
                          ? 'text-white shadow-lg scale-105'
                          : 'bg-[#252545] text-gray-400 hover:text-white hover:bg-[#303060]'
                      }`}
                      style={{
                        backgroundColor: selectedDifficulty === level.id ? level.color : undefined,
                        boxShadow: selectedDifficulty === level.id ? `0 4px 15px ${level.color}50` : undefined,
                      }}
                    >
                      {level.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Categories - Horizontal Scroll */}
      <div className="px-4 md:px-6 lg:px-8 pb-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {SHLOKA_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl whitespace-nowrap transition-all duration-200 ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25 scale-105'
                  : 'bg-[#1a1a2e] text-gray-400 hover:text-white hover:bg-[#252545] border border-white/5'
              }`}
            >
              <span className="text-base">{category.icon}</span>
              <span className="text-sm font-medium">{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Section */}
      {!searchQuery && selectedCategory === 'all' && (
        <div className="mb-8">
          <div className="flex justify-between items-center px-4 md:px-6 lg:px-8 mb-4">
            <h2 className="text-white font-bold text-xl flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Featured Shlokas
            </h2>
            <button className="flex items-center gap-1 text-orange-400 text-sm hover:text-orange-300 transition-colors group">
              See All
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
          <div className="flex overflow-x-auto px-4 md:px-6 lg:px-8 pb-2 scrollbar-hide">
            {FEATURED_SHLOKAS.map((shloka, index) => renderFeaturedItem(shloka, index))}
          </div>
        </div>
      )}

      {/* All Shlokas Section */}
      <div className="px-4 md:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white font-bold text-xl flex items-center gap-2">
            <Music className="w-5 h-5 text-orange-400" />
            {selectedCategory === 'all' ? 'All Shlokas' : selectedCategory}
          </h2>
          <span className="text-gray-500 text-sm bg-[#1a1a2e] px-3 py-1 rounded-full">
            {filteredShlokas.length} {filteredShlokas.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        {filteredShlokas.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-20 bg-[#1a1a2e]/50 rounded-3xl border border-white/5"
          >
            <div className="w-20 h-20 rounded-full bg-[#252545] flex items-center justify-center mb-4">
              <Music className="w-10 h-10 text-gray-600" />
            </div>
            <p className="text-gray-400 text-lg font-medium">No shlokas found</p>
            <p className="text-gray-600 text-sm mt-1">Try a different search or filter</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedDifficulty('all');
              }}
              className="mt-4 px-6 py-2 bg-orange-500/20 text-orange-400 rounded-xl hover:bg-orange-500/30 transition-colors"
            >
              Clear Filters
            </button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filteredShlokas.map((shloka, index) => renderShlokaItem(shloka, index))}
          </div>
        )}

        <div className="h-8" />
      </div>
    </div>
  );
};

export default ShlokaList;
