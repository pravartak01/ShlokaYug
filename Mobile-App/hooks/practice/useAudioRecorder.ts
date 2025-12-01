import { useState, useCallback, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

interface UseAudioRecorderOptions {
  maxDuration?: number; // in seconds
  sampleRate?: number;
  channels?: 1 | 2;
  bitRate?: number;
  onRecordingComplete?: (uri: string, duration: number) => void;
  onRecordingError?: (error: string) => void;
  onMeteringUpdate?: (metering: number) => void;
}

interface UseAudioRecorderReturn {
  // State
  isRecording: boolean;
  isPaused: boolean;
  isProcessing: boolean;
  error: string | null;
  hasPermission: boolean | null;
  
  // Recording info
  recordingUri: string | null;
  recordingDuration: number; // in seconds
  meteringLevel: number; // 0-1
  
  // Methods
  requestPermission: () => Promise<boolean>;
  startRecording: () => Promise<void>;
  pauseRecording: () => Promise<void>;
  resumeRecording: () => Promise<void>;
  stopRecording: () => Promise<string | null>;
  cancelRecording: () => Promise<void>;
  deleteRecording: () => Promise<void>;
  
  // Utility
  getRecordingInfo: () => Promise<{ duration: number; size: number } | null>;
}

export const useAudioRecorder = (options: UseAudioRecorderOptions = {}): UseAudioRecorderReturn => {
  const {
    maxDuration = 300, // 5 minutes default
    sampleRate = 44100,
    channels = 1,
    bitRate = 128000,
    onRecordingComplete,
    onRecordingError,
    onMeteringUpdate,
  } = options;

  const recordingRef = useRef<Audio.Recording | null>(null);
  const meteringIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [meteringLevel, setMeteringLevel] = useState(0);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync();
      }
      if (meteringIntervalRef.current) {
        clearInterval(meteringIntervalRef.current);
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      const granted = status === 'granted';
      setHasPermission(granted);
      return granted;
    } catch (err: any) {
      setError(err.message);
      setHasPermission(false);
      return false;
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      // Check permission
      if (hasPermission === null) {
        const granted = await requestPermission();
        if (!granted) {
          setError('Microphone permission not granted');
          return;
        }
      } else if (!hasPermission) {
        setError('Microphone permission not granted');
        return;
      }

      setError(null);
      setRecordingDuration(0);
      setMeteringLevel(0);

      // Configure audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      // Create recording with options
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync({
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate,
          numberOfChannels: channels,
          bitRate,
        },
        ios: {
          extension: '.m4a',
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate,
          numberOfChannels: channels,
          bitRate,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: bitRate,
        },
      });

      // Enable metering
      recording.setOnRecordingStatusUpdate((status) => {
        if (status.isRecording && status.metering !== undefined) {
          // Convert dB to 0-1 range
          const normalizedLevel = Math.max(0, Math.min(1, (status.metering + 160) / 160));
          setMeteringLevel(normalizedLevel);
          onMeteringUpdate?.(normalizedLevel);
        }
      });

      await recording.startAsync();
      recordingRef.current = recording;
      setIsRecording(true);
      setIsPaused(false);

      // Start duration counter
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => {
          const newDuration = prev + 0.1;
          if (newDuration >= maxDuration) {
            stopRecording();
          }
          return newDuration;
        });
      }, 100);

    } catch (err: any) {
      setError(err.message || 'Failed to start recording');
      onRecordingError?.(err.message);
    }
  }, [hasPermission, requestPermission, sampleRate, channels, bitRate, maxDuration, onMeteringUpdate, onRecordingError]);

  const pauseRecording = useCallback(async () => {
    try {
      if (recordingRef.current) {
        await recordingRef.current.pauseAsync();
        setIsPaused(true);
        
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current);
        }
      }
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  const resumeRecording = useCallback(async () => {
    try {
      if (recordingRef.current) {
        await recordingRef.current.startAsync();
        setIsPaused(false);
        
        // Resume duration counter
        durationIntervalRef.current = setInterval(() => {
          setRecordingDuration((prev) => {
            const newDuration = prev + 0.1;
            if (newDuration >= maxDuration) {
              stopRecording();
            }
            return newDuration;
          });
        }, 100);
      }
    } catch (err: any) {
      setError(err.message);
    }
  }, [maxDuration]);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    try {
      setIsProcessing(true);
      
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }

      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        const uri = recordingRef.current.getURI();
        
        recordingRef.current = null;
        setIsRecording(false);
        setIsPaused(false);
        setIsProcessing(false);
        
        if (uri) {
          setRecordingUri(uri);
          onRecordingComplete?.(uri, recordingDuration);
          return uri;
        }
      }

      setIsProcessing(false);
      return null;
    } catch (err: any) {
      setError(err.message);
      setIsProcessing(false);
      return null;
    }
  }, [recordingDuration, onRecordingComplete]);

  const cancelRecording = useCallback(async () => {
    try {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }

      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        const uri = recordingRef.current.getURI();
        
        // Delete the recorded file
        if (uri) {
          await FileSystem.deleteAsync(uri, { idempotent: true });
        }
        
        recordingRef.current = null;
      }

      setIsRecording(false);
      setIsPaused(false);
      setRecordingDuration(0);
      setMeteringLevel(0);
      setRecordingUri(null);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  const deleteRecording = useCallback(async () => {
    try {
      if (recordingUri) {
        await FileSystem.deleteAsync(recordingUri, { idempotent: true });
        setRecordingUri(null);
      }
    } catch (err: any) {
      setError(err.message);
    }
  }, [recordingUri]);

  const getRecordingInfo = useCallback(async (): Promise<{ duration: number; size: number } | null> => {
    try {
      if (recordingUri) {
        const info = await FileSystem.getInfoAsync(recordingUri);
        if (info.exists && 'size' in info) {
          return {
            duration: recordingDuration,
            size: info.size,
          };
        }
      }
      return null;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, [recordingUri, recordingDuration]);

  return {
    isRecording,
    isPaused,
    isProcessing,
    error,
    hasPermission,
    recordingUri,
    recordingDuration,
    meteringLevel,
    requestPermission,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    cancelRecording,
    deleteRecording,
    getRecordingInfo,
  };
};

export default useAudioRecorder;
