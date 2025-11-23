// Debug script to check route registration
const express = require('express');
const app = express();

// Import the enrollment routes
const enrollmentRoutes = require('./src/routes/enrollments');

console.log('=== ROUTE DEBUGGING ===');
console.log('Enrollment Routes Object:', enrollmentRoutes);
console.log('Route Stack:', enrollmentRoutes.stack);

if (enrollmentRoutes.stack) {
    console.log('\n=== REGISTERED ROUTES ===');
    enrollmentRoutes.stack.forEach((layer, index) => {
        if (layer.route) {
            console.log(`${index + 1}. ${Object.keys(layer.route.methods)[0].toUpperCase()} ${layer.route.path}`);
        }
    });
}

// Test mounting the routes
app.use('/api/v1/enrollments', enrollmentRoutes);

console.log('\n=== APP ROUTES ===');
app._router.stack.forEach((layer, index) => {
    if (layer.route) {
        console.log(`${index + 1}. ${Object.keys(layer.route.methods)[0].toUpperCase()} ${layer.route.path}`);
    } else if (layer.name === 'router') {
        console.log(`${index + 1}. Router mounted at: ${layer.regexp}`);
    }
});