const express = require('express');
const router = express.Router();

// Test the exact imports and route
const { auth } = require('./src/middleware/auth');
const { checkRole } = require('./src/middleware/roleCheck');
const { validateInitiateEnrollment } = require('./src/middleware/enrollmentValidation');
const { initiateEnrollment } = require('./src/controllers/enrollmentController');

console.log('auth type:', typeof auth);
console.log('checkRole type:', typeof checkRole);
console.log('validateInitiateEnrollment type:', typeof validateInitiateEnrollment);
console.log('Array check:', Array.isArray(validateInitiateEnrollment));
console.log('initiateEnrollment type:', typeof initiateEnrollment);

if (Array.isArray(validateInitiateEnrollment)) {
  validateInitiateEnrollment.forEach((item, i) => {
    console.log(`Validation item ${i}:`, typeof item);
  });
}

// Try the exact route
try {
  router.post('/test',
    auth,
    checkRole(['student']),
    ...validateInitiateEnrollment,
    initiateEnrollment
  );
  console.log('Route created successfully');
} catch (error) {
  console.error('Route creation failed:', error.message);
}