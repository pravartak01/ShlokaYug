# ShlokaYug Backend - Setup & Installation Guide

## 🚀 Quick Start

### **Prerequisites**
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher
- **MongoDB Atlas**: Cloud database account
- **Cloudinary**: Media storage account
- **Google OAuth** (optional): For social authentication

### **System Requirements**
- **Operating System**: Windows 10+, macOS 10.15+, or Linux
- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: 500MB free space
- **Network**: Broadband internet connection

---

## 📥 Installation Steps

### **1. Clone Repository**
```bash
git clone https://github.com/pravartak01/ShlokaYug.git
cd ShlokaYug/Backend
```

### **2. Install Dependencies**
```bash
npm install
```

**Dependencies Installed:**
- **express**: Web framework
- **mongoose**: MongoDB ODM  
- **jsonwebtoken**: JWT authentication
- **bcryptjs**: Password hashing
- **nodemailer**: Email service
- **cloudinary**: File storage
- **express-validator**: Input validation
- **helmet**: Security middleware
- **cors**: Cross-origin requests
- **morgan**: HTTP logging
- **google-auth-library**: Google OAuth

### **3. Environment Configuration**

#### **Copy Environment Template**
```bash
cp .env.example .env
```

#### **Configure Environment Variables**
Edit the `.env` file with your actual credentials:

```env
# ================================
# APPLICATION SETTINGS
# ================================
NODE_ENV=development
PORT=5000
API_VERSION=v1

# ================================
# FRONTEND URLS
# ================================
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# ================================
# DATABASE CONFIGURATION
# ================================
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>
MONGODB_TEST_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>_test

# ================================
# JWT AUTHENTICATION
# ================================
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-characters
JWT_EXPIRE=7d
JWT_REFRESH_EXPIRE=30d

# ================================
# EMAIL SERVICE CONFIGURATION
# ================================
EMAIL_FROM=noreply@yourdomain.com
EMAIL_FROM_NAME=ShlokaYug

# Gmail SMTP Settings
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-gmail-app-password

# ================================
# CLOUDINARY FILE STORAGE
# ================================
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# ================================
# GOOGLE OAUTH (OPTIONAL)
# ================================
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/v1/auth/google/callback
```

---

## 🔧 Service Configuration

### **MongoDB Atlas Setup**

#### **1. Create MongoDB Atlas Account**
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Sign up for free account
3. Create a new cluster

#### **2. Database Configuration**
1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Replace `<dbname>` with `shlokayug`

#### **3. Network Access**
1. Go to Network Access → IP Access List
2. Add IP Address: `0.0.0.0/0` (for development)
3. For production, add only your server's IP

#### **4. Database User**
1. Go to Database Access
2. Create new user with read/write permissions
3. Use these credentials in your connection string

### **Cloudinary Setup**

#### **1. Create Cloudinary Account**
1. Go to [Cloudinary](https://cloudinary.com/)
2. Sign up for free account
3. Go to Dashboard

#### **2. Get Credentials**
1. Copy **Cloud name**
2. Copy **API Key**  
3. Copy **API Secret**
4. Add these to your `.env` file

#### **3. Configure Upload Settings**
```javascript
// Already configured in src/config/cloudinary.js
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
```

### **Email Service Setup**

#### **Gmail SMTP Configuration**
1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Use App Password** in `SMTP_PASS` environment variable

#### **Alternative Email Providers**
```env
# SendGrid
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key

# Mailgun
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-smtp-username
SMTP_PASS=your-mailgun-smtp-password
```

### **Google OAuth Setup (Optional)**

#### **1. Create Google Cloud Project**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Google+ API

#### **2. Configure OAuth Consent**
1. APIs & Services → OAuth consent screen
2. Configure application details
3. Add authorized domains

#### **3. Create OAuth Credentials**
1. APIs & Services → Credentials
2. Create OAuth 2.0 Client ID
3. Set authorized redirect URIs:
   - `http://localhost:5000/api/v1/auth/google/callback`
4. Copy Client ID and Client Secret

---

## 🚀 Running the Application

### **Development Mode**
```bash
npm run dev
```
Server starts with **nodemon** for auto-restart on file changes.

### **Production Mode**
```bash
npm start
```
Server starts with **node** for production deployment.

### **Available Scripts**
```bash
npm run dev          # Start development server with nodemon
npm start            # Start production server
npm test             # Run test suite (when implemented)
npm run test:watch   # Run tests in watch mode
npm run lint         # Run ESLint code checking
npm run lint:fix     # Fix ESLint issues automatically
```

---

## ✅ Verification Steps

### **1. Server Startup Verification**
Look for these success messages:
```bash
🕉️  ShlokaYug Backend API Server
📍 Running on port 5000
🌍 Environment: development
📚 API Version: v1
🙏 Sanskrit Learning Platform Backend Ready!

✅ MongoDB connected successfully
✅ Cloudinary configured successfully
✅ Email service initialized successfully
✅ Loaded 3 email templates
```

### **2. Health Check**
```bash
curl http://localhost:5000/api/v1/auth/health
```
**Expected Response:**
```json
{
  "success": true,
  "message": "Authentication service is healthy",
  "timestamp": "2025-11-19T17:45:57.790Z"
}
```

### **3. Database Connection**
Check for MongoDB connection message:
```
MongoDB Connected: cluster0-shard-00-00.mongodb.net
```

### **4. Test User Registration**
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "Test123!@#",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### **5. Test User Login**
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "test@example.com",
    "password": "Test123!@#"
  }'
```

---

## 🛠️ Troubleshooting

### **Common Issues**

#### **1. MongoDB Connection Failed**
```
Error: connect ENOTFOUND cluster0-shard-00-00.mongodb.net
```
**Solutions:**
- Check MongoDB URI in `.env` file
- Verify database user credentials  
- Check network access settings in Atlas
- Ensure cluster is not paused

#### **2. Email Service Failed**
```
Error: Invalid login: 534-5.7.9 Application-specific password required
```
**Solutions:**
- Enable 2-factor authentication on Gmail
- Generate app-specific password
- Use app password instead of regular password

#### **3. Cloudinary Connection Failed**
```
Error: Must supply api_key
```
**Solutions:**
- Verify Cloudinary credentials in `.env`
- Check for typos in environment variable names
- Ensure `.env` file is in correct directory

#### **4. JWT Token Issues**
```
Error: secret or key required
```
**Solutions:**
- Set `JWT_SECRET` in `.env` file
- Ensure secret is at least 32 characters long
- Restart server after changing `.env`

#### **5. Port Already in Use**
```
Error: listen EADDRINUSE :::5000
```
**Solutions:**
```bash
# Find process using port 5000
netstat -ano | findstr :5000  # Windows
lsof -i :5000                 # macOS/Linux

# Kill the process
taskkill /PID <PID> /F        # Windows
kill -9 <PID>                # macOS/Linux

# Or change port in .env
PORT=5001
```

### **Debugging Commands**

#### **Check Environment Variables**
```bash
node -e "require('dotenv').config(); console.log('NODE_ENV:', process.env.NODE_ENV); console.log('PORT:', process.env.PORT); console.log('DB:', !!process.env.MONGODB_URI);"
```

#### **Test Database Connection**
```bash
node -e "require('dotenv').config(); const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI).then(() => console.log('DB Connected')).catch(err => console.error('DB Error:', err.message));"
```

#### **Test Cloudinary**
```bash
node -e "require('dotenv').config(); const cloudinary = require('cloudinary').v2; cloudinary.config({cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET}); cloudinary.api.ping().then(r => console.log('Cloudinary OK:', r)).catch(e => console.error('Cloudinary Error:', e.message));"
```

---

## 🔒 Security Configuration

### **Production Security Checklist**

#### **Environment Variables**
- [ ] Use strong JWT secrets (min 32 characters)
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper CORS origins
- [ ] Use HTTPS URLs for callbacks

#### **Database Security**
- [ ] Use database user with minimal permissions
- [ ] Restrict IP access to your server only
- [ ] Enable MongoDB audit logging
- [ ] Regular database backups

#### **API Security**
- [ ] Configure rate limiting appropriately
- [ ] Enable HTTPS/SSL certificates
- [ ] Set secure cookie flags
- [ ] Configure CSP headers

#### **Monitoring**
- [ ] Set up error logging (Winston/Sentry)
- [ ] Configure health check endpoints
- [ ] Monitor API performance
- [ ] Set up database monitoring

---

## 📊 Performance Optimization

### **MongoDB Optimization**
```javascript
// Already implemented in models
- Proper indexing on frequently queried fields
- Compound indexes for complex queries
- Sparse indexes for optional fields
- Text indexes for search functionality
```

### **API Optimization**
```javascript
// Already configured in app.js
- Compression middleware for response size
- Rate limiting to prevent abuse
- Input validation to prevent malformed requests
- Error handling to prevent crashes
```

### **Memory Management**
```javascript
// Recommended for production
process.env.NODE_OPTIONS = '--max-old-space-size=4096';
```

---

## 📱 Frontend Integration

### **Environment Variables for Frontend**
```env
# React .env.local
REACT_APP_API_BASE_URL=http://localhost:5000/api/v1
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id

# Next.js .env.local  
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

### **API Client Setup**
```javascript
// api/client.js
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

class APIClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('accessToken');
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers
      },
      ...options
    };

    const response = await fetch(url, config);
    return response.json();
  }
}

export default new APIClient();
```

---

## 🚀 Deployment Guide

### **Heroku Deployment**
```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create shlokayug-backend

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-production-secret
heroku config:set MONGODB_URI=your-mongodb-uri

# Deploy
git push heroku main
```

### **AWS EC2 Deployment**
```bash
# Install PM2 for process management
npm install -g pm2

# Start application with PM2
pm2 start src/app.js --name "shlokayug-backend"

# Configure PM2 for auto-restart
pm2 startup
pm2 save
```

### **Docker Deployment**
```dockerfile
# Dockerfile (create in Backend directory)
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

---

*Setup Guide - ShlokaYug Backend*  
*Last updated: November 19, 2025*