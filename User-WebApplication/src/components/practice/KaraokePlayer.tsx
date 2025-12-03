import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Settings,
  Volume2,
  VolumeX,
  Clock,
  Type,
  Languages,
  ChevronDown,
  Loader2,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import type { ShlokaData, ShlokaWord } from '../../data/shlokas';
import { getAudioUrl, hasAudio } from '../../data/shlokas';

interface KaraokePlayerProps {
  shloka: ShlokaData;
  onBack: () => void;
}

const PLAYBACK_SPEEDS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

const KaraokePlayer: React.FC<KaraokePlayerProps> = ({ shloka, onBack }) => {
  // Audio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Display settings
  const [showTransliteration, setShowTransliteration] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Current word highlighting
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const audioAvailable = hasAudio(shloka.id);

  // Find current word based on time
  const updateHighlightedWord = useCallback(
    (time: number) => {
      const timeMs = time * 1000;

      for (let lineIdx = 0; lineIdx < shloka.lines.length; lineIdx++) {
        const line = shloka.lines[lineIdx];
        for (let wordIdx = 0; wordIdx < line.words.length; wordIdx++) {
          const word = line.words[wordIdx];
          if (timeMs >= word.startTime && timeMs < word.endTime) {
            setCurrentLineIndex(lineIdx);
            setCurrentWordIndex(wordIdx);
            return;
          }
        }
      }
    },
    [shloka.lines]
  );

  // Initialize audio
  useEffect(() => {
    const audioUrl = getAudioUrl(shloka.id);
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onloadedmetadata = () => {
        setDuration(audio.duration);
      };

      audio.oncanplay = () => {
        setIsLoading(false);
      };

      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime);
        updateHighlightedWord(audio.currentTime);
      };

      audio.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        setCurrentLineIndex(0);
        setCurrentWordIndex(-1);
      };

      audio.onerror = () => {
        setIsLoading(false);
        console.error('Audio load error');
      };

      setIsLoading(true);
      audio.load();
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [shloka.id, updateHighlightedWord]);

  // Update playback speed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed]);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Play/Pause
  const togglePlay = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        await audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Playback error:', error);
    }
  };

  // Seek
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !audioRef.current) return;

    const rect = progressRef.current.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;

    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Skip forward/backward
  const skip = (seconds: number) => {
    if (!audioRef.current) return;
    const newTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Restart
  const restart = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    setCurrentLineIndex(0);
    setCurrentWordIndex(-1);
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Render word with highlighting
  const renderWord = (word: ShlokaWord, lineIdx: number, wordIdx: number) => {
    const isActive = lineIdx === currentLineIndex && wordIdx === currentWordIndex;
    const isPast = lineIdx < currentLineIndex || (lineIdx === currentLineIndex && wordIdx < currentWordIndex);

    return (
      <motion.span
        key={`${lineIdx}-${wordIdx}`}
        animate={isActive ? { scale: 1.1 } : { scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`inline-block mx-1.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
          isActive
            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/40'
            : isPast
            ? 'text-gray-500'
            : 'text-white'
        }`}
      >
        {word.text}
      </motion.span>
    );
  };

  return (
    <div 
      ref={containerRef}
      className="bg-gradient-to-b from-[#0f0f1a] via-[#1a1a2e] to-[#0f0f1a] min-h-screen pb-36"
    >
      {/* Header */}
      <div className="sticky top-0 z-30 bg-gradient-to-b from-[#0f0f1a] to-transparent backdrop-blur-xl">
        <div className="flex items-center justify-between p-4 md:px-8 max-w-5xl mx-auto">
          <button
            onClick={onBack}
            className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all border border-white/5"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          <div className="flex-1 text-center mx-4">
            <h1 className="text-white font-bold text-lg md:text-xl truncate">{shloka.title}</h1>
            <p className="text-gray-400 text-sm">{shloka.source}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all border border-white/5"
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-5 h-5 text-white" />
              ) : (
                <Maximize2 className="w-5 h-5 text-white" />
              )}
            </button>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all border ${
                showSettings 
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 border-orange-500/50 shadow-lg shadow-orange-500/30' 
                  : 'bg-white/10 backdrop-blur-sm border-white/5 hover:bg-white/20'
              }`}
              title="Settings"
            >
              <Settings className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="px-4 md:px-8 mb-6 max-w-5xl mx-auto"
          >
            <div className="bg-[#1a1a2e]/80 backdrop-blur-xl rounded-3xl p-5 border border-white/10">
              <div className="flex flex-wrap gap-3 md:gap-4">
                {/* Transliteration Toggle */}
                <button
                  onClick={() => setShowTransliteration(!showTransliteration)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all ${
                    showTransliteration 
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20' 
                      : 'bg-[#252545] text-gray-400 hover:text-white'
                  }`}
                >
                  <Type className="w-4 h-4" />
                  <span className="text-sm font-medium">Transliteration</span>
                </button>

                {/* Translation Toggle */}
                <button
                  onClick={() => setShowTranslation(!showTranslation)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all ${
                    showTranslation 
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/20' 
                      : 'bg-[#252545] text-gray-400 hover:text-white'
                  }`}
                >
                  <Languages className="w-4 h-4" />
                  <span className="text-sm font-medium">Translation</span>
                </button>

                {/* Volume Control */}
                <div className="flex items-center gap-3 bg-[#252545] rounded-xl px-4 py-2">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-1 rounded-lg text-gray-400 hover:text-white transition-colors"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-24 accent-orange-500 h-1.5 rounded-full cursor-pointer"
                    title="Volume control"
                    aria-label="Volume control"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lyrics Display */}
      <div className="px-4 md:px-8 py-8 max-w-5xl mx-auto">
        {shloka.lines.map((line, lineIdx) => (
          <motion.div
            key={lineIdx}
            initial={{ opacity: 0.5 }}
            animate={{ 
              opacity: lineIdx === currentLineIndex ? 1 : 0.6,
              scale: lineIdx === currentLineIndex ? 1 : 0.98
            }}
            transition={{ duration: 0.3 }}
            className={`mb-10 p-6 rounded-3xl transition-all duration-500 ${
              lineIdx === currentLineIndex
                ? 'bg-gradient-to-r from-[#252545]/80 to-[#1a1a2e]/80 border border-orange-500/20 shadow-xl shadow-orange-500/5'
                : 'bg-transparent'
            }`}
          >
            {/* Sanskrit Text */}
            <div className="text-center mb-4">
              <div className="flex flex-wrap justify-center text-xl md:text-3xl font-medium leading-relaxed">
                {line.words.map((word, wordIdx) => renderWord(word, lineIdx, wordIdx))}
              </div>
            </div>

            {/* Transliteration */}
            <AnimatePresence>
              {showTransliteration && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`text-center text-base md:text-xl transition-colors font-medium ${
                    lineIdx === currentLineIndex ? 'text-orange-300' : 'text-gray-500'
                  }`}
                >
                  {line.transliteration}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Translation */}
            <AnimatePresence>
              {showTranslation && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`text-center text-sm md:text-base mt-3 italic transition-colors ${
                    lineIdx === currentLineIndex ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {line.translation}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* Fixed Bottom Player Controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#0f0f1a] via-[#0f0f1a]/98 to-transparent pt-12 pb-8 px-4 md:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-6">
            <div
              ref={progressRef}
              onClick={handleSeek}
              className="h-2.5 bg-[#252545] rounded-full cursor-pointer group relative overflow-hidden"
            >
              {/* Background glow */}
              <div 
                className="absolute h-full bg-gradient-to-r from-orange-500/30 to-amber-500/30 blur-xl"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
              {/* Progress fill */}
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full relative transition-all"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-lg shadow-orange-500/50 opacity-0 group-hover:opacity-100 transition-opacity ring-4 ring-orange-500/30" />
              </div>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-gray-400 text-sm font-mono">{formatTime(currentTime)}</span>
              <span className="text-gray-400 text-sm font-mono">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3 md:gap-5">
            {/* Speed Control */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1a1a2e] rounded-xl text-gray-300 hover:text-white hover:bg-[#252545] transition-all border border-white/5"
                title="Playback speed"
              >
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">{playbackSpeed}x</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${showSpeedMenu ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showSpeedMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full left-0 mb-2 bg-[#1a1a2e] rounded-xl overflow-hidden shadow-2xl border border-white/10"
                  >
                    {PLAYBACK_SPEEDS.map((speed) => (
                      <button
                        key={speed}
                        onClick={() => {
                          setPlaybackSpeed(speed);
                          setShowSpeedMenu(false);
                        }}
                        className={`block w-full px-5 py-2.5 text-sm text-left transition-colors ${
                          playbackSpeed === speed
                            ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                            : 'text-gray-300 hover:bg-[#252545] hover:text-white'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Skip Back */}
            <button
              onClick={() => skip(-10)}
              className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[#1a1a2e] flex items-center justify-center text-white hover:bg-[#252545] transition-all border border-white/5 hover:scale-105"
              title="Skip back 10 seconds"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              disabled={!audioAvailable || isLoading}
              className="w-18 h-18 md:w-20 md:h-20 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-2xl shadow-orange-500/40 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isLoading ? (
                <Loader2 className="w-8 h-8 animate-spin" />
              ) : isPlaying ? (
                <Pause className="w-8 h-8 fill-white" />
              ) : (
                <Play className="w-8 h-8 fill-white ml-1" />
              )}
            </button>

            {/* Skip Forward */}
            <button
              onClick={() => skip(10)}
              className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[#1a1a2e] flex items-center justify-center text-white hover:bg-[#252545] transition-all border border-white/5 hover:scale-105"
              title="Skip forward 10 seconds"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            {/* Restart */}
            <button
              onClick={restart}
              className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[#1a1a2e] flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#252545] transition-all border border-white/5 hover:scale-105"
              title="Restart"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          {/* No Audio Warning */}
          {!audioAvailable && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-yellow-400/80 text-sm mt-4 bg-yellow-500/10 py-2 px-4 rounded-xl inline-flex items-center gap-2 mx-auto"
            >
              ⚠️ Audio not available for this shloka
            </motion.p>
          )}
        </div>
      </div>
    </div>
  );
};

export default KaraokePlayer;
