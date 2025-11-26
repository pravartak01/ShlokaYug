// Check Admin User Details in Database
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const bcrypt = require('bcryptjs');

async function checkAdminDetails() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('🔍 Checking admin user details...');
        
        // Find all admin users
        const admins = await User.find({ role: 'admin' });
        
        console.log(`Found ${admins.length} admin user(s):`);
        
        for (const admin of admins) {
            console.log('\n👤 Admin User Details:');
            console.log(`   ID: ${admin._id}`);
            console.log(`   Username: ${admin.username}`);
            console.log(`   Email: ${admin.email}`);
            console.log(`   Role: ${admin.role}`);
            console.log(`   Active: ${admin.metadata?.isActive}`);
            console.log(`   Email Verified: ${admin.verification?.isEmailVerified}`);
            console.log(`   Created: ${admin.metadata?.accountCreated || admin.createdAt}`);
            
            // Test password
            console.log('\n🔐 Testing Password:');
            const testPasswords = [
                'ShlokaYug@Admin2025!',
                'admin123',
                'password',
                'admin'
            ];
            
            for (const pwd of testPasswords) {
                try {
                    const isMatch = await bcrypt.compare(pwd, admin.password);
                    console.log(`   ${pwd}: ${isMatch ? '✅ MATCH' : '❌'}`);
                    if (isMatch) {
                        console.log(`\n🎉 FOUND WORKING CREDENTIALS:`);
                        console.log(`   Email: ${admin.email}`);
                        console.log(`   Password: ${pwd}`);
                        
                        // Test login via API
                        console.log('\n🧪 Testing API Login...');
                        const axios = require('axios');
                        try {
                            const response = await axios.post('http://localhost:5000/api/v1/auth/login', {
                                identifier: admin.email,
                                password: pwd
                            });
                            console.log('✅ API Login successful!');
                            console.log(`Access Token: ${response.data.data.tokens.access.substring(0, 50)}...`);
                        } catch (apiError) {
                            console.log('❌ API Login failed:', apiError.response?.data?.message || apiError.message);
                        }
                    }
                } catch (error) {
                    console.log(`   ${pwd}: ❌ (Error: ${error.message})`);
                }
            }
        }
        
        await mongoose.disconnect();
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

checkAdminDetails();