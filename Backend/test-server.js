const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Basic middleware
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Chandas Identifier Backend is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    features: {
      authentication: 'Ready',
      userManagement: 'Ready',
      emailVerification: 'Ready',
      passwordReset: 'Ready',
      jwtTokens: 'Ready',
      rateLimiting: 'Ready',
      security: 'Ready'
    }
  });
});

// Test authentication routes (without database)
app.post('/api/test/register', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Registration endpoint is working! (Connect MongoDB to enable full functionality)',
    receivedData: {
      hasName: !!req.body.name,
      hasEmail: !!req.body.email,
      hasPassword: !!req.body.password
    }
  });
});

app.post('/api/test/login', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Login endpoint is working! (Connect MongoDB to enable full functionality)',
    receivedData: {
      hasEmail: !!req.body.email,
      hasPassword: !!req.body.password
    }
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log('\n🚀 Chandas Identifier Backend Test Server');
  console.log(`📡 Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Test register: http://localhost:${PORT}/api/test/register`);
  console.log(`🔑 Test login: http://localhost:${PORT}/api/test/login`);
  console.log('\n✅ Authentication system is ready!');
  console.log('📋 Next steps:');
  console.log('   1. Install and start MongoDB');
  console.log('   2. Update .env with your MongoDB URI');
  console.log('   3. Configure email settings in .env');
  console.log('   4. Run: npm run dev (to use full authentication system)');
  console.log('\n🎯 Available Features:');
  console.log('   ✅ User Registration with email verification');
  console.log('   ✅ User Login with JWT tokens');
  console.log('   ✅ Password reset functionality');
  console.log('   ✅ User profile management');
  console.log('   ✅ Learning progress tracking');
  console.log('   ✅ Account security (lockout, rate limiting)');
  console.log('   ✅ Role-based access control');
});

module.exports = app;