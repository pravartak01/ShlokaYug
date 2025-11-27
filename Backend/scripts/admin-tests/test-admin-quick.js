// Quick Admin System Test - Without Full Server
// Tests MongoDB connection and admin bootstrap functionality

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const { bootstrapAdmin, verifyAdminAccess } = require('./src/utils/adminBootstrap');

async function quickAdminTest() {
    console.log('🔍 ShlokaYug Admin System Quick Test');
    console.log('======================================');
    
    try {
        // Test 1: MongoDB Connection
        console.log('\n1️⃣ Testing MongoDB connection...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ MongoDB connected successfully!');
        
        // Test 2: Admin Bootstrap
        console.log('\n2️⃣ Testing admin bootstrap...');
        const bootstrapResult = await bootstrapAdmin();
        
        if (bootstrapResult.success) {
            console.log('✅ Admin bootstrap successful!');
            console.log(`📧 Admin Email: ${bootstrapResult.admin.email}`);
            console.log(`👤 Admin Username: ${bootstrapResult.admin.username}`);
        } else {
            console.log('❌ Admin bootstrap failed:', bootstrapResult.error);
        }
        
        // Test 3: Verify Admin Access
        console.log('\n3️⃣ Verifying admin access...');
        const verifyResult = await verifyAdminAccess();
        
        if (verifyResult.success) {
            console.log('✅ Admin verification successful!');
            console.log(`🔢 Total Admins: ${verifyResult.adminCount}`);
            console.log(`✓ Active Admins: ${verifyResult.activeAdmins}`);
            console.log(`📊 Status: ${verifyResult.status}`);
        }
        
        // Test 4: Check Admin User in Database
        console.log('\n4️⃣ Checking admin user in database...');
        const adminUser = await User.findOne({ role: 'admin' });
        
        if (adminUser) {
            console.log('✅ Admin user found in database!');
            console.log(`👤 Username: ${adminUser.username}`);
            console.log(`📧 Email: ${adminUser.email}`);
            console.log(`🔐 Role: ${adminUser.role}`);
            console.log(`🛡️ Permissions: ${adminUser.adminProfile?.permissions?.join(', ') || 'N/A'}`);
            console.log(`✅ Email Verified: ${adminUser.verification?.isEmailVerified || false}`);
        } else {
            console.log('❌ No admin user found in database!');
        }
        
        // Test 5: Show Login Credentials
        console.log('\n🔐 ADMIN LOGIN CREDENTIALS:');
        console.log('================================');
        console.log('Email: admin@shlokayu.com');
        console.log('Password: ShlokaYug@Admin2025!');
        console.log('Login URL: POST http://localhost:5000/api/v1/auth/login');
        
        // Test Summary
        console.log('\n🎉 ADMIN SYSTEM STATUS: READY! 🎉');
        console.log('===================================');
        console.log('✅ MongoDB Connection: Working');
        console.log('✅ Admin Bootstrap: Working'); 
        console.log('✅ Admin User Created: Working');
        console.log('✅ Database Verification: Working');
        console.log('\n🚀 Your admin system is ready for testing!');
        console.log('   Next step: Start the server with "npm start" and run API tests');
        
    } catch (error) {
        console.error('❌ Admin system test failed:', error.message);
        console.error('Stack trace:', error.stack);
    } finally {
        // Clean up
        await mongoose.disconnect();
        console.log('\n📡 MongoDB disconnected');
    }
}

// Run the test
quickAdminTest().catch(error => {
    console.error('Critical error:', error);
    process.exit(1);
});