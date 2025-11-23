const jwt = require('jsonwebtoken');

// Generate a test JWT token for integration testing
const testPayload = {
  id: '507f1f77bcf86cd799439011',
  email: 'test@example.com',
  role: 'student',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour expiry
};

// Use default JWT secret or fallback
const secret = process.env.JWT_SECRET || 'your_jwt_secret_here_for_development_only';

const token = jwt.sign(testPayload, secret);

console.log('🔑 Generated test JWT token:');
console.log(token);
console.log('\n📋 Token payload:');
console.log(testPayload);
console.log('\n💡 Use this token in Authorization header as: Bearer ' + token);