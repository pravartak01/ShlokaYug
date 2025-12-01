/**
 * Dashboard Service
 * Handles dashboard-related API calls and utilities
 */

import api from '../config/api';

// Panchang API Types
export interface PanchangData {
  day: string;
  tithi: string;
  yog: string;
  nakshatra: string;
  karan: string;
  sunrise: string;
  sunset: string;
}

// Course types
export interface Course {
  _id: string;
  title: string;
  description: string;
  instructor: {
    userId: string;
    name: string;
    credentials: string;
  };
  thumbnail?: string;
  pricing: {
    type: 'free' | 'paid';
    amount?: number;
    currency?: string;
  };
  metadata: {
    category: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    thumbnail?: string;
    language: {
      instruction: string;
      content: string;
    };
    tags: string[];
  };
  basic?: {
    title: string;
    instructor: string;
  };
  structure: {
    totalUnits: number;
    totalLessons: number;
    totalLectures: number;
    totalDuration: number;
  };
  stats: {
    enrollments: number;
    rating: number;
    reviews: number;
  };
  publishing: {
    status: 'draft' | 'published' | 'archived';
  };
  isEnrolled?: boolean;
}

export interface Enrollment {
  _id: string;
  courseId: Course;
  course?: Course;
  progress: {
    sectionsProgress: Array<{
      completedLectures: string[];
      totalLectures: number;
    }>;
  };
  enrolledAt: string;
}

// Sanskrit quotes relevant to SVARAM's mission
export const DAILY_QUOTES = [
  {
    sanskrit: 'छन्दः पादौ तु वेदस्य',
    translation: 'Chandas (meter) is the feet of the Vedas',
    source: 'Paniniya Shiksha',
  },
  {
    sanskrit: 'स्वरो वर्णश्च मात्रा च बलं सामाथ सन्ततिः',
    translation: 'Svara, Varna, Matra, Bala, Sama, and Santana — the six elements of prosody',
    source: 'Chandas Shastra',
  },
  {
    sanskrit: 'गुरुलाघवयोगेन छन्दो जायते',
    translation: 'From the union of Guru and Laghu, Chandas is born',
    source: 'Pingala',
  },
  {
    sanskrit: 'विद्या ददाति विनयम्',
    translation: 'Knowledge bestows humility',
    source: 'Hitopadesha',
  },
  {
    sanskrit: 'अभ्यासेन तु कौन्तेय वैराग्येण च गृह्यते',
    translation: 'Through practice and detachment, it is attained',
    source: 'Bhagavad Gita',
  },
  {
    sanskrit: 'योगः कर्मसु कौशलम्',
    translation: 'Yoga is skill in action',
    source: 'Bhagavad Gita',
  },
  {
    sanskrit: 'श्रद्धावान् लभते ज्ञानम्',
    translation: 'One with faith attains knowledge',
    source: 'Bhagavad Gita',
  },
];

// Get time of day
export const getTimeOfDay = (): 'morning' | 'afternoon' | 'evening' | 'night' => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 20) return 'evening';
  return 'night';
};

// Get greeting based on time
export const getGreeting = (): string => {
  const time = getTimeOfDay();
  const greetings = {
    morning: 'Good Morning',
    afternoon: 'Good Afternoon',
    evening: 'Good Evening',
    night: 'Good Night',
  };
  return greetings[time];
};

// Get formatted date
export const getFormattedDate = (): string => {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  return now.toLocaleDateString('en-IN', options);
};

// Get daily quote based on day of year
export const getDailyQuote = () => {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
};

// Fetch Panchang data
export const fetchPanchangData = async (): Promise<PanchangData | null> => {
  try {
    const now = new Date();
    const day = now.getDate();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const hour = now.getHours();
    const minute = now.getMinutes();

    // Delhi coordinates as default
    const lat = 28.6139;
    const lon = 77.209;
    const tz = 5.5;

    const userId = '647638';
    const apiKey = 'fd87d1f7df94332f699d408c27447536c47cef3e';

    const credentials = btoa(`${userId}:${apiKey}`);

    const response = await fetch('https://json.astrologyapi.com/v1/basic_panchang', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        day,
        month,
        year,
        hour,
        min: minute,
        lat,
        lon,
        tzone: tz,
      }),
    });

    if (!response.ok) {
      console.error('Failed to fetch Panchang data:', response.status);
      return null;
    }

    const data: PanchangData = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Panchang data:', error);
    return null;
  }
};

// Fallback Hindu date
export const getHinduDate = () => {
  const now = new Date();
  const dayOfMonth = now.getDate();

  const TITHI_NAMES = [
    'Pratipada',
    'Dwitiya',
    'Tritiya',
    'Chaturthi',
    'Panchami',
    'Shashthi',
    'Saptami',
    'Ashtami',
    'Navami',
    'Dashami',
    'Ekadashi',
    'Dwadashi',
    'Trayodashi',
    'Chaturdashi',
    'Purnima/Amavasya',
  ];

  const lunarDay = Math.floor((dayOfMonth % 30) / 2);
  const tithiIndex = Math.min(lunarDay, 14);

  const paksha = dayOfMonth <= 15 ? 'Shukla Paksha' : 'Krishna Paksha';
  const tithi = TITHI_NAMES[tithiIndex];

  return {
    tithi,
    paksha,
    formatted: `${tithi}, ${paksha}`,
  };
};

// Dashboard API service
const dashboardService = {
  // Get enrolled courses
  getEnrolledCourses: async (): Promise<{ data: { enrollments: Enrollment[] } }> => {
    const response = await api.get('/enrollments/my-courses');
    return response.data;
  },

  // Get all courses
  getCourses: async (): Promise<{ data: { courses: Course[] } }> => {
    const response = await api.get('/courses');
    return response.data;
  },

  // Get user stats (mock for now - can be connected to real API)
  getUserStats: async () => {
    // This would connect to a real stats API
    return {
      shlokasCompleted: 42,
      accuracy: 85,
      streakDays: 7,
      totalTime: 156,
      lessonsCompleted: 12,
      quizzesPassed: 8,
    };
  },

  // Enroll in course
  enrollInCourse: async (courseId: string) => {
    const response = await api.post('/enrollments/enroll', { courseId });
    return response.data;
  },
};

export default dashboardService;
