import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility function to merge Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password validation
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Format date for display
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Format relative time (e.g., "2 days ago")
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  }
  
  return formatDate(dateString);
};

// Generate avatar URL or initials
export const getAvatarUrl = (user: { name: string; avatar?: string }): string => {
  if (user.avatar) {
    return user.avatar;
  }
  
  // Generate initials-based avatar using UI Avatars service
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=f97316&color=fff&size=128&font-size=0.6&bold=true&format=svg`;
};

// Sanskrit text utilities
export const getSanskritGreeting = (timeOfDay: 'morning' | 'afternoon' | 'evening'): string => {
  const greetings = {
    morning: 'शुभ प्रभात',   // Shubh Prabhat
    afternoon: 'शुभ दिन',     // Shubh Din  
    evening: 'शुभ संध्या'     // Shubh Sandhya
  };
  
  return greetings[timeOfDay];
};

export const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' => {
  const hour = new Date().getHours();
  
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
};

// Level progression utilities
export const getLevelProgress = (shlokasCompleted: number): {
  currentLevel: 'beginner' | 'intermediate' | 'advanced';
  progress: number;
  nextLevel?: 'intermediate' | 'advanced';
  shlokasNeeded?: number;
} => {
  if (shlokasCompleted < 25) {
    return {
      currentLevel: 'beginner',
      progress: (shlokasCompleted / 25) * 100,
      nextLevel: 'intermediate',
      shlokasNeeded: 25 - shlokasCompleted
    };
  } else if (shlokasCompleted < 100) {
    return {
      currentLevel: 'intermediate',
      progress: ((shlokasCompleted - 25) / 75) * 100,
      nextLevel: 'advanced',
      shlokasNeeded: 100 - shlokasCompleted
    };
  } else {
    return {
      currentLevel: 'advanced',
      progress: 100
    };
  }
};

// Generate random Sanskrit quote for motivation
export const getMotivationalQuote = (): { sanskrit: string; transliteration: string; translation: string } => {
  const quotes = [
    {
      sanskrit: 'विद्या ददाति विनयं',
      transliteration: 'Vidyā dadāti vinayaṃ',
      translation: 'Knowledge gives humility'
    },
    {
      sanskrit: 'योगः कर्मसु कौशलम्',
      transliteration: 'Yogaḥ karmasu kauśalam',
      translation: 'Yoga is skill in action'
    },
    {
      sanskrit: 'सत्यं शिवं सुन्दरम्',
      transliteration: 'Satyaṃ śivaṃ sundaram',
      translation: 'Truth, goodness, and beauty'
    },
    {
      sanskrit: 'श्रद्धावाँल्लभते ज्ञानम्',
      transliteration: 'Śraddhāvāṁl labhate jñānam',
      translation: 'The faithful gain knowledge'
    }
  ];
  
  return quotes[Math.floor(Math.random() * quotes.length)];
};

// Error message utilities
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
};

// Local storage utilities with error handling
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  
  set: <T>(key: string, value: T): void => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },
  
  remove: (key: string): void => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  }
};

// Debounce utility for search/input
export const debounce = <T extends (...args: unknown[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void => {
  let timeout: number;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = window.setTimeout(() => func(...args), wait);
  };
};