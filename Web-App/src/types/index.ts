// User types based on the backend User model
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isEmailVerified: boolean;
  avatar?: string;
  profile: UserProfile;
  lastLogin?: string;
  createdAt: string;
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
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
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
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
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