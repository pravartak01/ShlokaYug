import { useState, useCallback, useRef, useEffect } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';

interface UseAudioPlayerOptions {
  autoPlay?: boolean;
  onPlaybackComplete?: () => void;
  onPlaybackError?: (error: string) => void;
  onProgress?: (position: number, duration: number) => void;
}

interface UseAudioPlayerReturn {
  // State
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
  
  // Progress
  currentPosition: number; // in seconds
  duration: number; // in seconds
  progress: number; // 0-1
  
  // Playback control
  playbackSpeed: number;
  volume: number;
  isMuted: boolean;
  
  // Methods
  loadAudio: (uri: string) => Promise<void>;
  play: () => Promise<void>;
  pause: () => Promise<void>;
  stop: () => Promise<void>;
  seekTo: (position: number) => Promise<void>;
  rewind: (seconds?: number) => Promise<void>;
  forward: (seconds?: number) => Promise<void>;
  setSpeed: (speed: number) => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
  toggleMute: () => Promise<void>;
  unload: () => Promise<void>;
}

export const useAudioPlayer = (options: UseAudioPlayerOptions = {}): UseAudioPlayerReturn => {
  const {
    autoPlay = false,
    onPlaybackComplete,
    onPlaybackError,
    onProgress,
  } = options;

  const soundRef = useRef<Audio.Sound | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [currentPosition, setCurrentPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolumeState] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const progress = duration > 0 ? currentPosition / duration : 0;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  // Handle playback status updates
  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setCurrentPosition(status.positionMillis / 1000);
      setDuration(status.durationMillis ? status.durationMillis / 1000 : 0);
      setIsPlaying(status.isPlaying);
      setIsPaused(!status.isPlaying && status.positionMillis > 0);
      
      if (status.didJustFinish) {
        setIsPlaying(false);
        onPlaybackComplete?.();
      }
      
      onProgress?.(status.positionMillis / 1000, (status.durationMillis || 0) / 1000);
    } else if (status.error) {
      setError(status.error);
      onPlaybackError?.(status.error);
    }
  }, [onPlaybackComplete, onPlaybackError, onProgress]);

  const loadAudio = useCallback(async (uri: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Unload existing audio
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      // Load new audio
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: autoPlay, progressUpdateIntervalMillis: 100 },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;
      setIsLoaded(true);
      setIsLoading(false);

      if (autoPlay) {
        setIsPlaying(true);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load audio');
      setIsLoading(false);
      onPlaybackError?.(err.message);
    }
  }, [autoPlay, onPlaybackStatusUpdate, onPlaybackError]);

  const play = useCallback(async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.playAsync();
        setIsPlaying(true);
        setIsPaused(false);
      }
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  const pause = useCallback(async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
        setIsPaused(true);
      }
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  const stop = useCallback(async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.setPositionAsync(0);
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentPosition(0);
      }
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  const seekTo = useCallback(async (position: number) => {
    try {
      if (soundRef.current) {
        await soundRef.current.setPositionAsync(position * 1000);
        setCurrentPosition(position);
      }
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  const rewind = useCallback(async (seconds: number = 10) => {
    const newPosition = Math.max(0, currentPosition - seconds);
    await seekTo(newPosition);
  }, [currentPosition, seekTo]);

  const forward = useCallback(async (seconds: number = 10) => {
    const newPosition = Math.min(duration, currentPosition + seconds);
    await seekTo(newPosition);
  }, [currentPosition, duration, seekTo]);

  const setSpeed = useCallback(async (speed: number) => {
    try {
      if (soundRef.current) {
        await soundRef.current.setRateAsync(speed, true);
        setPlaybackSpeed(speed);
      }
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  const setVolume = useCallback(async (vol: number) => {
    try {
      if (soundRef.current) {
        await soundRef.current.setVolumeAsync(vol);
        setVolumeState(vol);
        if (vol > 0) setIsMuted(false);
      }
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  const toggleMute = useCallback(async () => {
    try {
      if (soundRef.current) {
        const newMuted = !isMuted;
        await soundRef.current.setIsMutedAsync(newMuted);
        setIsMuted(newMuted);
      }
    } catch (err: any) {
      setError(err.message);
    }
  }, [isMuted]);

  const unload = useCallback(async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        setIsLoaded(false);
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentPosition(0);
        setDuration(0);
      }
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  return {
    isPlaying,
    isPaused,
    isLoading,
    isLoaded,
    error,
    currentPosition,
    duration,
    progress,
    playbackSpeed,
    volume,
    isMuted,
    loadAudio,
    play,
    pause,
    stop,
    seekTo,
    rewind,
    forward,
    setSpeed,
    setVolume,
    toggleMute,
    unload,
  };
};

export default useAudioPlayer;
