// User types based on the backend User model
export interface User {
  id: string;
  email: string;
  username: string;
  role: 'student' | 'guru' | 'admin' | 'moderator';
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
    dateOfBirth?: string;
    location?: string;
    bio?: string;
    phoneNumber?: string;
    preferredScript?: 'devanagari' | 'iast' | 'bengali' | 'gujarati' | 'telugu';
    nativeLanguage?: string;
    learningGoals?: string[];
  };
  guruProfile?: GuruProfile;
  studentProfile?: StudentProfile;
  subscription?: {
    plan: 'free' | 'basic' | 'premium' | 'guru';
    status: 'active' | 'expired' | 'cancelled' | 'trial';
    startDate: string;
    endDate?: string;
  };
  gamification?: {
    level: number;
    totalXP: number;
    currentXP: number;
    xpToNextLevel: number;
    badges: Array<{
      badgeId: string;
      earnedAt: string;
      category: string;
    }>;
    streaks: {
      current: number;
      longest: number;
      lastActivity: string;
    };
  };
  verification: {
    isEmailVerified: boolean;
  };
  metadata: {
    lastLogin: string;
    loginCount: number;
    accountCreated: string;
    isActive: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface GuruProfile {
  applicationStatus: 'not_applied' | 'pending' | 'approved' | 'rejected';
  credentials: Array<{
    type: 'degree' | 'certificate' | 'experience' | 'publication';
    title: string;
    institution?: string;
    year?: number;
    description?: string;
    documentUrl?: string;
    isVerified: boolean;
  }>;
  experience: {
    years: number;
    description?: string;
    previousInstitutions?: Array<{
      name: string;
      position: string;
      duration: {
        from: string;
        to: string;
      };
      responsibilities?: string;
    }>;
    specializations?: string[];
    languages?: Array<{
      language: string;
      proficiency: 'beginner' | 'intermediate' | 'advanced' | 'native';
    }>;
  };
  verification: {
    isVerified: boolean;
    verifiedBy?: string;
    verifiedAt?: string;
    verificationNotes?: string;
    rejectionReason?: string;
    applicationDate?: string;
  };
  teachingStats?: {
    totalStudents: number;
    totalCourses: number;
    publishedCourses: number;
    averageRating?: number;
    totalRatings: number;
    totalEarnings: number;
    thisMonthEarnings: number;
  };
  preferences?: {
    acceptNewStudents: boolean;
    maxStudentsPerCourse: number;
    teachingLanguages: string[];
  };
}

export interface StudentProfile {
  learningGoals?: Array<{
    goal: string;
    priority: 'low' | 'medium' | 'high';
    targetDate?: string;
    isCompleted: boolean;
  }>;
  currentLevel?: {
    overall: 'absolute_beginner' | 'beginner' | 'intermediate' | 'advanced' | 'expert';
    pronunciation?: 'beginner' | 'intermediate' | 'advanced';
    grammar?: 'beginner' | 'intermediate' | 'advanced';
    chanting?: 'beginner' | 'intermediate' | 'advanced';
    philosophy?: 'beginner' | 'intermediate' | 'advanced';
  };
  interests?: Array<{
    category: string;
    level: 'curious' | 'interested' | 'passionate';
  }>;
  learningStats?: {
    totalCoursesEnrolled: number;
    totalCoursesCompleted: number;
    totalLearningHours: number;
    averageCompletionRate: number;
    currentStreak: number;
    longestStreak: number;
  };
}

export interface UserProfile {
  level: 'beginner' | 'intermediate' | 'advanced';
  favoriteMeters: string[];
  learningProgress: LearningProgress;
  preferences: UserPreferences;
}

export interface LearningProgress {
  shlokasCompleted: number;
  accuracy: number;
  streakDays: number;
  lastPracticeDate?: string;
}

export interface UserPreferences {
  language: 'english' | 'hindi' | 'sanskrit';
  notifications: {
    email: boolean;
    push: boolean;
  };
}

// Authentication types
export interface LoginCredentials {
  identifier: string; // email or username
  password: string;
}

export interface RegisterCredentials {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  preferredScript?: 'devanagari' | 'iast' | 'bengali' | 'gujarati' | 'telugu';
}

export interface GuruRegistrationCredentials extends RegisterCredentials {
  credentials: Array<{
    type: 'degree' | 'certificate' | 'experience' | 'publication';
    title: string;
    institution?: string;
    year?: number;
    description?: string;
  }>;
  experience: {
    years: number;
    description?: string;
    specializations?: string[];
    languages?: Array<{
      language: string;
      proficiency: 'beginner' | 'intermediate' | 'advanced' | 'native';
    }>;
  };
}

export interface AuthTokens {
  access: string;
  refresh: string;
  expiresIn: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    tokens: AuthTokens;
  };
  errors?: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}

// Form types
export interface LoginFormData {
  identifier: string; // email or username
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
  role?: 'student' | 'guru';
}

export interface GuruRegistrationFormData extends RegisterFormData {
  // Credential fields
  credentials: Array<{
    type: 'degree' | 'certificate' | 'experience' | 'publication';
    title: string;
    institution?: string;
    year?: number;
    description?: string;
    document?: File;
  }>;
  // Experience fields
  experienceYears: number;
  experienceDescription: string;
  specializations: string[];
  teachingLanguages: Array<{
    language: string;
    proficiency: 'beginner' | 'intermediate' | 'advanced' | 'native';
  }>;
  // Additional guru info
  bio?: string;
  phoneNumber?: string;
  location?: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface UpdateProfileFormData {
  name: string;
  avatar?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  favoriteMeters: string[];
  language: 'english' | 'hindi' | 'sanskrit';
  emailNotifications: boolean;
  pushNotifications: boolean;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: ValidationError[];
}

export interface UserStats {
  totalShlokasCompleted: number;
  currentAccuracy: number;
  currentStreak: number;
  level: string;
  favoriteMetersCount: number;
  memberSince: string;
  lastPractice?: string;
}

// Context types
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  registerGuru: (guruData: GuruRegistrationFormData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshToken: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

// Route types
export interface ProtectedRouteProps {
  children: React.ReactNode;
  requireEmailVerification?: boolean;
}

// Sanskrit/Chandas specific types
export interface ChandasMeter {
  id: string;
  name: string;
  sanskritName: string;
  pattern: string;
  description: string;
  example: string;
}

export interface Shloka {
  id: string;
  text: string;
  transliteration: string;
  translation: string;
  meter: string;
  source: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}