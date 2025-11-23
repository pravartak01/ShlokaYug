// Test if routes can be imported without errors
console.log('Testing route imports...');

try {
    const enrollmentRoutes = require('./src/routes/enrollments');
    console.log('✅ Enrollment routes imported successfully');
    
    const enrollmentController = require('./src/controllers/enrollmentController');
    console.log('✅ Enrollment controller imported successfully');
    
    const enrollmentValidation = require('./src/middleware/enrollmentValidation');
    console.log('✅ Enrollment validation imported successfully');
    
    console.log('All imports successful!');
} catch (error) {
    console.error('❌ Import error:', error.message);
    console.error('Stack:', error.stack);
}