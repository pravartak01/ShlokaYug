# Chandas Identifier Backend

Backend API for the Chandas Identifier application - A Sanskrit Shloka meter identification system with authentication and user management.

## Features

### Authentication System
- ✅ User Registration with email verification
- ✅ User Login with JWT tokens
- ✅ Password reset functionality
- ✅ Refresh token mechanism
- ✅ Account lockout after failed attempts
- ✅ Email verification
- ✅ Secure password hashing with bcrypt

### User Management
- ✅ User profile management
- ✅ Learning progress tracking
- ✅ Password change functionality
- ✅ Account deletion
- ✅ User statistics

### Security Features
- ✅ JWT-based authentication
- ✅ Rate limiting
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Input validation
- ✅ Password complexity requirements
- ✅ Account lockout mechanism

## API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `POST /logout` - User logout
- `POST /refresh` - Refresh access token
- `GET /verify-email/:token` - Verify email address
- `POST /forgot-password` - Request password reset
- `PUT /reset-password/:token` - Reset password
- `GET /me` - Get current user info

### User Routes (`/api/user`)
- `PUT /profile` - Update user profile
- `PUT /progress` - Update learning progress
- `PUT /change-password` - Change password
- `DELETE /account` - Delete user account
- `GET /stats` - Get user statistics

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```

3. **Configure MongoDB:**
   - Install MongoDB locally or use MongoDB Atlas
   - Update `MONGODB_URI` in `.env`

4. **Configure Email:**
   - Update email settings in `.env` for password reset functionality
   - Use Gmail or any SMTP service

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

### Testing
```bash
npm test
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | development |
| `PORT` | Server port | 5000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/chandas-identifier |
| `JWT_SECRET` | JWT signing secret | - |
| `JWT_REFRESH_SECRET` | Refresh token secret | - |
| `JWT_EXPIRE` | Access token expiry | 15m |
| `JWT_REFRESH_EXPIRE` | Refresh token expiry | 7d |
| `EMAIL_HOST` | SMTP host | smtp.gmail.com |
| `EMAIL_PORT` | SMTP port | 587 |
| `EMAIL_USER` | SMTP username | - |
| `EMAIL_PASS` | SMTP password | - |
| `EMAIL_FROM` | From email address | - |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 |
| `PASSWORD_RESET_EXPIRE` | Password reset token expiry (minutes) | 10 |

## User Model Schema

The user model includes:
- Basic information (name, email, password)
- Role-based access control
- Email verification status
- Password reset functionality
- Refresh token management
- Account security features
- Chandas-specific profile data:
  - Learning level (beginner, intermediate, advanced)
  - Favorite meters
  - Learning progress (completed shlokas, accuracy, streak)
  - Preferences (language, notifications)

## Security Features

1. **Password Security:**
   - Bcrypt hashing with salt rounds of 12
   - Password complexity requirements
   - Password history (prevents reuse)

2. **Account Protection:**
   - Account lockout after 5 failed login attempts
   - 2-hour lockout duration
   - Login attempt tracking

3. **Token Security:**
   - JWT with short expiry (15 minutes)
   - Refresh tokens with longer expiry (7 days)
   - Token rotation on refresh
   - Secure token storage

4. **Rate Limiting:**
   - 100 requests per 15 minutes per IP
   - Configurable limits

## Error Handling

The API includes comprehensive error handling:
- Validation errors
- Authentication errors
- Database errors
- Rate limiting errors
- Generic server errors

All errors return a consistent JSON format:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Optional validation errors
}
```

## Database Schema

### User Collection
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (user/admin),
  isEmailVerified: Boolean,
  profile: {
    level: String,
    favoriteMeters: [String],
    learningProgress: {
      shlokasCompleted: Number,
      accuracy: Number,
      streakDays: Number,
      lastPracticeDate: Date
    },
    preferences: {
      language: String,
      notifications: {
        email: Boolean,
        push: Boolean
      }
    }
  },
  refreshTokens: [{ token: String, createdAt: Date }],
  // ... other security fields
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details.