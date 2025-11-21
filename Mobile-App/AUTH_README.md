# ShlokaYug Mobile App - Authentication System

## 📁 Authentication Structure

```
Mobile-App/
├── services/
│   ├── api.ts                    # Axios configuration & API client
│   └── authService.ts            # Authentication API calls
├── context/
│   └── AuthContext.tsx           # Global auth state management
└── app/
    ├── _layout.tsx               # Root layout with AuthProvider & route protection
    ├── index.tsx                 # Root redirect based on auth status
    └── auth/
        ├── login.tsx             # Login screen
        ├── register.tsx          # Registration screen
        ├── forgot-password.tsx   # Password reset request
        ├── reset-password.tsx    # Set new password with token
        └── verify-email.tsx      # Email verification
```

## 🚀 Quick Start

### 1. Backend Configuration

Update the backend URL in `services/api.ts`:

```typescript
// For development (use your machine's IP for physical devices)
const BACKEND_URL = 'http://192.168.1.100:5000/api/v1';

// For production
const BACKEND_URL = 'https://api.shlokayug.com/api/v1';
```

### 2. Start Backend Server

```bash
cd Backend
npm run dev
```

The backend should be running at `http://localhost:5000`

### 3. Start Mobile App

```bash
cd Mobile-App
npm start
```

## 🔐 Authentication Features

### ✅ Implemented Features

1. **User Registration**
   - Form validation (email, username, password strength)
   - Password confirmation
   - Preferred script selection
   - Terms acceptance

2. **Login**
   - Email or username login
   - Password visibility toggle
   - "Remember me" via token storage
   - Error handling

3. **Forgot Password**
   - Email-based password reset
   - Success confirmation screen
   - Resend option

4. **Reset Password**
   - Token-based password reset
   - Password strength validation
   - Confirmation matching

5. **Email Verification**
   - Token-based verification
   - Resend verification email
   - Skip option for later

6. **Protected Routes**
   - Automatic redirect to login if not authenticated
   - Automatic redirect to home if authenticated on auth screens
   - Loading states during auth checks

7. **Profile Integration**
   - Real user data display
   - Logout functionality
   - Email verification status
   - Subscription level display

## 📱 Screen Flow

```
App Start
    ↓
Check Auth Status
    ↓
┌─────────────────┬──────────────────┐
│  Authenticated  │  Not Authenticated│
└────────┬────────┴────────┬─────────┘
         ↓                 ↓
    Home Screen      Login Screen
         │                 │
         │                 ├── Register
         │                 ├── Forgot Password
         │                 └── Verify Email
         │
    Profile Screen
         │
    Logout → Login Screen
```

## 🔧 API Integration

### AuthService Methods

```typescript
// Registration
await authService.register({
  email: 'user@example.com',
  username: 'username',
  password: 'SecurePass123',
  firstName: 'John',
  lastName: 'Doe',
  preferredScript: 'devanagari'
});

// Login
await authService.login({
  identifier: 'user@example.com', // or username
  password: 'SecurePass123'
});

// Logout
await authService.logout();

// Forgot Password
await authService.forgotPassword({
  email: 'user@example.com'
});

// Reset Password
await authService.resetPassword({
  token: 'reset-token-from-email',
  newPassword: 'NewSecurePass123'
});

// Verify Email
await authService.verifyEmail('verification-token');

// Get Profile
const user = await authService.getProfile();
```

### Using Auth Context

```typescript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <LoginPrompt />;
  }

  return (
    <View>
      <Text>Welcome, {user.profile.firstName}!</Text>
      <Button title="Logout" onPress={logout} />
    </View>
  );
}
```

## 🔒 Security Features

1. **Token Management**
   - Access token stored securely in AsyncStorage
   - Refresh token for automatic token renewal
   - Token blacklisting on logout

2. **Request Interceptors**
   - Automatic token attachment to requests
   - Automatic token refresh on 401 errors
   - Request/response logging in development

3. **Form Validation**
   - Email format validation
   - Username pattern validation (3-20 chars, alphanumeric + underscore)
   - Password strength (8+ chars, uppercase, lowercase, number)
   - Real-time error feedback

4. **Error Handling**
   - Network error detection
   - Server error messages
   - User-friendly error display
   - Retry mechanisms

## 🎨 UI Features

- **Consistent Design**: Saffron/orange and ancient yellow color scheme
- **Form Validation**: Real-time inline error messages
- **Loading States**: Spinners during API calls
- **Success Feedback**: Alerts and confirmation screens
- **Password Toggle**: Show/hide password functionality
- **Responsive Layout**: Keyboard-aware scrolling

## 📝 Environment Configuration

### Backend `.env` (Already configured)

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d
FRONTEND_URL=http://localhost:3000
```

### Mobile App - No .env needed
All configuration is in `services/api.ts`

## 🐛 Troubleshooting

### Backend Connection Issues

1. **Cannot connect to backend**
   - Ensure backend is running: `cd Backend && npm run dev`
   - Check backend URL in `services/api.ts`
   - For physical devices, use your machine's IP address
   - Ensure ports are not blocked by firewall

2. **CORS Errors**
   - Backend already configured to allow mobile app origins
   - Check `Backend/src/app.js` CORS configuration

### Authentication Issues

1. **Token not persisting**
   - AsyncStorage should work automatically
   - Check if app has storage permissions

2. **Redirect loops**
   - Clear app data: Settings → Apps → ShlokaYug → Clear Data
   - Restart app

3. **Form validation errors**
   - Password must be 8+ characters with uppercase, lowercase, and number
   - Username must be 3-20 characters, alphanumeric + underscore only
   - Email must be valid format

## 🧪 Testing Authentication

### Test User Account

You can create a test account with these credentials:

```
Email: test@shlokayug.com
Username: testuser
Password: Test@123
```

### Manual Testing Checklist

- [ ] Register new user
- [ ] Verify email (check email for link)
- [ ] Login with email
- [ ] Login with username
- [ ] Logout
- [ ] Forgot password flow
- [ ] Reset password with token
- [ ] Access protected routes
- [ ] View profile with real data
- [ ] Email verification prompt shown if not verified

## 📚 Backend API Endpoints

All endpoints are prefixed with `/api/v1/auth`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register new user | No |
| POST | `/login` | Login user | No |
| POST | `/logout` | Logout user | Yes |
| POST | `/refresh-token` | Refresh access token | No |
| POST | `/forgot-password` | Request password reset | No |
| POST | `/reset-password` | Reset password with token | No |
| POST | `/verify-email` | Verify email with token | No |
| POST | `/resend-verification` | Resend verification email | Yes |
| POST | `/change-password` | Change password | Yes |
| GET | `/profile` | Get user profile | Yes |
| GET | `/status` | Check auth status | Yes |

## 🎯 Next Steps

1. **Google OAuth Integration** (Button already in UI, needs implementation)
2. **Biometric Authentication** (Face ID / Fingerprint)
3. **Two-Factor Authentication** (2FA)
4. **Session Management** (View active sessions)
5. **Account Deletion** (GDPR compliance)

## 📖 Additional Resources

- [Backend API Documentation](../../Backend/docs/API.md)
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [React Native AsyncStorage](https://react-native-async-storage.github.io/async-storage/)
- [Axios Documentation](https://axios-http.com/docs/intro)

## 🤝 Support

For issues or questions:
- Check Backend logs: `Backend/` terminal output
- Check Mobile logs: Expo DevTools console
- Review error messages in alerts

---

**Built with ❤️ for ShlokaYug - Sanskrit Learning Platform**
