# 🕉️ Chandas Identifier - Web Application

A modern, responsive web application for learning and identifying Sanskrit Chandas (poetic meters) with an ancient-themed UI built with React, TypeScript, and Tailwind CSS.

## ✨ Features

### 🔐 Authentication System
- **User Registration** with email verification
- **Secure Login** with JWT tokens
- **Password Reset** functionality
- **Protected Routes** with role-based access
- **Session Management** with automatic token refresh

### 🎨 Ancient Sanskrit Theme
- **Traditional Colors** - Saffron, sandalwood, and ancient gold palettes
- **Sanskrit Typography** - Devanagari fonts with elegant serif typefaces
- **Ancient Patterns** - Subtle background textures and ornamental designs
- **Responsive Design** - Mobile-first approach with ancient aesthetics

### 👤 User Management
- **Profile Management** - Update personal information and preferences
- **Learning Progress** - Track shlokas completed, accuracy, and streaks
- **Skill Levels** - Beginner, Intermediate, Advanced progression
- **Language Preferences** - English, Hindi, Sanskrit support
- **Notification Settings** - Email and push notification controls

### 🏛️ Cultural Experience
- **Sanskrit Greetings** - Time-based traditional greetings
- **Daily Quotes** - Motivational Sanskrit verses with translations
- **Ancient Iconography** - ॐ symbols and traditional design elements
- **Cultural Context** - Maintaining authenticity in design and content

## 🛠️ Technology Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS with custom ancient theme
- **Routing**: React Router v6
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios with interceptors
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Fonts**: Google Fonts (Noto Sans Devanagari, Cinzel, Cormorant Garamond)

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── auth/            # Authentication-specific components
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   ├── ForgotPasswordForm.tsx
│   │   ├── ResetPasswordForm.tsx
│   │   └── ProtectedRoute.tsx
│   └── ui/              # Generic UI components
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Card.tsx
│       └── Alert.tsx
├── context/             # React context providers
│   └── AuthContext.tsx  # Global authentication state
├── pages/               # Page components
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   ├── ForgotPasswordPage.tsx
│   ├── ResetPasswordPage.tsx
│   └── DashboardPage.tsx
├── services/            # API and external services
│   └── api.ts           # Axios configuration and API calls
├── types/               # TypeScript type definitions
│   └── index.ts         # All type definitions
├── utils/               # Utility functions
│   └── helpers.ts       # Helper functions and utilities
└── App.tsx              # Main application component
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Chandas Identifier Backend API running

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Update .env with your backend API URL
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## 🔧 Configuration

### Environment Variables

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# App Configuration  
VITE_APP_NAME=Chandas Identifier
VITE_APP_VERSION=1.0.0

# Development flags
VITE_DEBUG_MODE=true
```

### Theme Customization

The ancient Sanskrit theme is configured in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      ancient: { /* Ancient gold palette */ },
      saffron: { /* Saffron color variations */ },
      sandalwood: { /* Sandalwood tones */ },
      lotus: { /* Lotus flower colors */ }
    },
    fontFamily: {
      'sanskrit': ['Noto Sans Devanagari', 'serif'],
      'ancient': ['Cinzel', 'serif'],
      'elegant': ['Cormorant Garamond', 'serif']
    }
  }
}
```

## 🎯 Key Components

### Authentication Context (`AuthContext.tsx`)
- Global authentication state management
- JWT token handling with automatic refresh
- User session persistence
- Error handling and loading states

### API Service (`api.ts`)
- Centralized API communication
- Request/response interceptors
- Automatic token refresh
- Error handling

### Protected Routes (`ProtectedRoute.tsx`)
- Route-level authentication checks
- Email verification requirements
- Automatic redirects

### Form Components
- **LoginForm**: Email/password authentication
- **RegisterForm**: Account creation with validation
- **ForgotPasswordForm**: Password reset request
- **ResetPasswordForm**: New password setting

## 🔐 Authentication Flow

1. **Registration**:
   - User submits registration form
   - Email verification sent
   - Account created in pending state

2. **Login**:
   - Credentials validated
   - JWT tokens issued (access + refresh)
   - User redirected to dashboard

3. **Session Management**:
   - Access tokens expire in 15 minutes
   - Refresh tokens valid for 7 days
   - Automatic token refresh on API calls

4. **Password Reset**:
   - Reset link sent via email
   - Time-limited token validation
   - Secure password update

## 🎨 Design System

### Colors
- **Ancient Gold**: Primary brand color
- **Saffron**: Action and accent color
- **Sandalwood**: Neutral and background tones
- **Lotus**: Special highlights and success states

### Typography
- **Headlines**: Cinzel (Ancient/Classical feel)
- **Body Text**: Cormorant Garamond (Elegant serif)
- **Sanskrit Text**: Noto Sans Devanagari (Authentic Devanagari)

### Components
- **Gradient Buttons**: Saffron to ancient gold
- **Glass Cards**: Subtle backdrop blur effects
- **Ancient Patterns**: SVG-based texture overlays
- **Responsive Grid**: Mobile-first layout system

## 🧪 Testing

```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Run e2e tests
npm run test:e2e
```

## 📦 Build & Deployment

```bash
# Production build
npm run build

# Preview production build
npm run preview

# Deploy to hosting service
npm run deploy
```

## 🔗 Integration with Backend

The web app integrates with the Chandas Identifier backend API:

- **Base URL**: `http://localhost:5000/api`
- **Authentication**: JWT Bearer tokens
- **Endpoints**: All backend auth and user management endpoints
- **Error Handling**: Comprehensive error states and user feedback

## 🎯 Future Enhancements

- **Chandas Practice Module**: Interactive meter identification
- **Progress Analytics**: Detailed learning statistics
- **Social Features**: Community sharing and challenges
- **Offline Mode**: PWA capabilities for offline access
- **Audio Support**: Sanskrit pronunciation guides
- **Advanced Theming**: Multiple cultural themes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Sanskrit Scholars**: For preserving the ancient knowledge of chandas
- **Design Inspiration**: Traditional Indian art and architecture
- **Typography**: Google Fonts for excellent Devanagari support
- **Community**: Open source contributors and Sanskrit enthusiasts

---

**🕉️ शुभं भवतु | May it be auspicious**
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
