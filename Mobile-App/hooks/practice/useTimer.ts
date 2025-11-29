import { useState, useCallback, useRef, useEffect } from 'react';

interface UseTimerOptions {
  mode?: 'stopwatch' | 'countdown';
  initialTime?: number; // in seconds
  autoStart?: boolean;
  interval?: number; // in milliseconds
  onComplete?: () => void;
  onTick?: (time: number) => void;
  onWarning?: () => void;
  onCritical?: () => void;
  warningThreshold?: number; // in seconds
  criticalThreshold?: number; // in seconds
}

interface UseTimerReturn {
  // State
  time: number; // current time in seconds
  isRunning: boolean;
  isPaused: boolean;
  isComplete: boolean;
  isWarning: boolean;
  isCritical: boolean;
  
  // Formatted time
  formattedTime: string;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
  
  // Progress (for countdown)
  progress: number; // 0-1
  remaining: number; // in seconds
  
  // Methods
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: (newTime?: number) => void;
  setTime: (time: number) => void;
  addTime: (seconds: number) => void;
  subtractTime: (seconds: number) => void;
}

export const useTimer = (options: UseTimerOptions = {}): UseTimerReturn => {
  const {
    mode = 'stopwatch',
    initialTime = 0,
    autoStart = false,
    interval = 100,
    onComplete,
    onTick,
    onWarning,
    onCritical,
    warningThreshold = 30,
    criticalThreshold = 10,
  } = options;

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  const [time, setTimeState] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [hasCalledWarning, setHasCalledWarning] = useState(false);
  const [hasCalledCritical, setHasCalledCritical] = useState(false);

  // Derived states
  const isWarning = mode === 'countdown' && time <= warningThreshold && time > criticalThreshold;
  const isCritical = mode === 'countdown' && time <= criticalThreshold && time > 0;
  const remaining = mode === 'countdown' ? time : 0;
  const progress = mode === 'countdown' && initialTime > 0 ? time / initialTime : 0;

  // Time breakdown
  const hours = Math.floor(time / 3600);
  const minutes = Math.floor((time % 3600) / 60);
  const seconds = Math.floor(time % 60);
  const milliseconds = Math.floor((time % 1) * 1000);

  // Formatted time string
  const formattedTime = hours > 0
    ? `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    : `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Auto start
  useEffect(() => {
    if (autoStart) {
      start();
    }
  }, [autoStart]);

  // Threshold callbacks
  useEffect(() => {
    if (mode === 'countdown') {
      if (time <= warningThreshold && time > criticalThreshold && !hasCalledWarning) {
        onWarning?.();
        setHasCalledWarning(true);
      }
      if (time <= criticalThreshold && time > 0 && !hasCalledCritical) {
        onCritical?.();
        setHasCalledCritical(true);
      }
    }
  }, [time, mode, warningThreshold, criticalThreshold, hasCalledWarning, hasCalledCritical, onWarning, onCritical]);

  const tick = useCallback(() => {
    const now = Date.now();
    const elapsed = (now - startTimeRef.current) / 1000;

    if (mode === 'countdown') {
      const newTime = Math.max(0, pausedTimeRef.current - elapsed);
      setTimeState(newTime);
      onTick?.(newTime);

      if (newTime <= 0) {
        setIsComplete(true);
        setIsRunning(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        onComplete?.();
      }
    } else {
      const newTime = pausedTimeRef.current + elapsed;
      setTimeState(newTime);
      onTick?.(newTime);
    }
  }, [mode, onTick, onComplete]);

  const start = useCallback(() => {
    if (isRunning) return;

    setIsRunning(true);
    setIsPaused(false);
    setIsComplete(false);
    setHasCalledWarning(false);
    setHasCalledCritical(false);

    startTimeRef.current = Date.now();
    pausedTimeRef.current = time;

    intervalRef.current = setInterval(tick, interval);
  }, [isRunning, time, tick, interval]);

  const pause = useCallback(() => {
    if (!isRunning || isPaused) return;

    setIsPaused(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Store the current time
    pausedTimeRef.current = time;
  }, [isRunning, isPaused, time]);

  const resume = useCallback(() => {
    if (!isPaused) return;

    setIsPaused(false);
    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(tick, interval);
  }, [isPaused, tick, interval]);

  const stop = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  const reset = useCallback((newTime?: number) => {
    stop();
    const resetTime = newTime !== undefined ? newTime : initialTime;
    setTimeState(resetTime);
    pausedTimeRef.current = resetTime;
    setIsComplete(false);
    setHasCalledWarning(false);
    setHasCalledCritical(false);
  }, [stop, initialTime]);

  const setTime = useCallback((newTime: number) => {
    setTimeState(Math.max(0, newTime));
    if (!isRunning) {
      pausedTimeRef.current = Math.max(0, newTime);
    }
  }, [isRunning]);

  const addTime = useCallback((secondsToAdd: number) => {
    setTimeState((prev) => {
      const newTime = prev + secondsToAdd;
      if (!isRunning) {
        pausedTimeRef.current = newTime;
      }
      return newTime;
    });
  }, [isRunning]);

  const subtractTime = useCallback((secondsToSubtract: number) => {
    setTimeState((prev) => {
      const newTime = Math.max(0, prev - secondsToSubtract);
      if (!isRunning) {
        pausedTimeRef.current = newTime;
      }
      return newTime;
    });
  }, [isRunning]);

  return {
    time,
    isRunning,
    isPaused,
    isComplete,
    isWarning,
    isCritical,
    formattedTime,
    hours,
    minutes,
    seconds,
    milliseconds,
    progress,
    remaining,
    start,
    pause,
    resume,
    stop,
    reset,
    setTime,
    addTime,
    subtractTime,
  };
};

export default useTimer;
