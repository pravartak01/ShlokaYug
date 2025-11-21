# 🚀 Authentication Setup - Quick Start Guide

## ✅ What's Been Created

### 📂 File Structure
```
Mobile-App/
├── services/
│   ├── api.ts                 ✅ API client with axios & token management
│   └── authService.ts         ✅ All authentication API calls
├── context/
│   └── AuthContext.tsx        ✅ Global auth state management
└── app/
    ├── _layout.tsx            ✅ Updated with AuthProvider & route protection
    ├── index.tsx              ✅ Updated with auth-based redirects
    ├── auth/
    │   ├── login.tsx          ✅ Login screen with validation
    │   ├── register.tsx       ✅ Registration with strong validation
    │   ├── forgot-password.tsx ✅ Password reset request
    │   ├── reset-password.tsx  ✅ Set new password with token
    │   └── verify-email.tsx    ✅ Email verification flow
    └── (tabs)/
        └── profile.tsx        ✅ Updated with real auth data & logout
```

## 🎯 Quick Start (3 Steps)

### Step 1: Update Backend URL
Edit `Mobile-App/services/api.ts` line 7-9:

```typescript
// For testing on physical device, use your computer's IP
const BACKEND_URL = __DEV__ 
  ? 'http://192.168.1.YOUR_IP:5000/api/v1'  // ← Change this!
  : 'https://api.shlokayug.com/api/v1';
```

To find your IP:
- **Windows**: `ipconfig` → Look for IPv4 Address
- **Mac/Linux**: `ifconfig` → Look for inet address

### Step 2: Start Backend Server
```bash
cd Backend
npm run dev
```

You should see:
```
🕉️  ShlokaYug Backend API Server
📍 Running on port 5000
```

### Step 3: Start Mobile App
```bash
cd Mobile-App
npm start
```

Then press:
- `a` for Android
- `i` for iOS
- `w` for Web

## 🧪 Test the Authentication

### 1. Register New Account
- Open app → Should show Login screen
- Tap "Sign Up"
- Fill in details:
  - First Name: `Test`
  - Last Name: `User`
  - Email: `test@example.com`
  - Username: `testuser`
  - Password: `Test@123` (meets requirements)
- Tap "Create Account"

### 2. Verify Email (Optional)
- You'll see verification prompt
- Can skip for now or check backend logs for verification link

### 3. Check Profile
- Navigate to Profile tab
- Should see your real name and email
- Email verification status displayed

### 4. Test Logout
- Tap "Sign Out" button in Profile
- Confirm logout
- Should redirect to Login screen

### 5. Test Login
- Enter credentials:
  - Email/Username: `test@example.com` or `testuser`
  - Password: `Test@123`
- Tap "Sign In"
- Should navigate to Home screen

## 🔍 Verify Everything Works

### ✅ Checklist
- [ ] App shows Login screen on first launch
- [ ] Can register new account
- [ ] Can login with email
- [ ] Can login with username
- [ ] Profile shows real user data
- [ ] Logout redirects to login
- [ ] Forgot password flow works
- [ ] Protected routes require authentication

## 🐛 Common Issues & Solutions

### Issue: "Network Error"
**Solution**: 
- Backend not running → Start with `cd Backend && npm run dev`
- Wrong IP in api.ts → Update with your machine's IP
- Firewall blocking → Allow port 5000

### Issue: "Cannot connect to backend"
**Solution** (for physical devices):
1. Get your computer's IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Update `services/api.ts`: 
   ```typescript
   const BACKEND_URL = 'http://YOUR_IP:5000/api/v1';
   ```
3. Restart Expo: Press `r` in terminal

### Issue: "Invalid token" or "Authentication required"
**Solution**:
1. Clear app storage
2. On device: Settings → Apps → Expo Go → Clear Data
3. Restart app

### Issue: Form validation errors
**Solution**: Ensure:
- Email format: `user@example.com`
- Username: 3-20 chars, only letters, numbers, underscore
- Password: 8+ chars, uppercase, lowercase, number

## 📱 Features Available

### ✅ Implemented
- User Registration with validation
- Login (email or username)
- Logout with confirmation
- Forgot Password flow
- Reset Password with token
- Email Verification
- Protected Routes (auto-redirect)
- Profile with real data
- Token auto-refresh
- Secure token storage

### 🎨 UI Features
- Consistent saffron/orange theme
- Loading states
- Error handling & alerts
- Form validation with inline errors
- Password visibility toggle
- Keyboard-aware scrolling

## 📊 Backend Status Check

To verify backend is working:

```bash
# Open in browser or use curl
curl http://localhost:5000/health
```

Should return:
```json
{
  "success": true,
  "message": "ShlokaYug Backend API is running",
  "timestamp": "2025-11-21T..."
}
```

## 🔐 Security Features

- ✅ JWT token-based authentication
- ✅ Refresh token rotation
- ✅ Secure AsyncStorage for tokens
- ✅ Password strength validation
- ✅ Token blacklisting on logout
- ✅ Automatic token refresh on 401
- ✅ Request/response interceptors

## 📚 Usage in Your Code

### Get Current User
```typescript
import { useAuth } from '../context/AuthContext';

function MyComponent() {
  const { user, isAuthenticated } = useAuth();
  
  return (
    <View>
      {isAuthenticated && (
        <Text>Welcome, {user.profile.firstName}!</Text>
      )}
    </View>
  );
}
```

### Make Authenticated API Calls
```typescript
import api from '../services/api';

// Token automatically added to headers
const response = await api.get('/courses');
const courses = response.data;
```

### Logout User
```typescript
import { useAuth } from '../context/AuthContext';

function LogoutButton() {
  const { logout } = useAuth();
  
  const handleLogout = async () => {
    await logout();
    // User automatically redirected to login
  };
  
  return <Button onPress={handleLogout}>Logout</Button>;
}
```

## 🎯 Next: Configure Backend URL

**⚠️ IMPORTANT**: Before testing, update the backend URL in:
`Mobile-App/services/api.ts` (line 7-9)

Use your machine's IP address for physical device testing!

---

## 📖 Full Documentation

See `AUTH_README.md` for:
- Detailed API documentation
- Complete feature list
- Troubleshooting guide
- Security implementation details
- Testing checklist

---

**Ready to test? Start with Step 1 above! 🚀**
