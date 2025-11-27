const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1';

async function testAuth() {
  console.log('🧪 Testing Authentication...');
  
  // Test registration with proper format
  try {
    const testUser = {
      email: `test${Date.now().toString().slice(-6)}@example.com`,
      username: `user${Date.now().toString().slice(-6)}`,
      password: 'TestPass123!',
      firstName: 'Test',
      lastName: 'User'
    };
    
    console.log('📝 Attempting user registration...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
    
    console.log('✅ Registration Response:', JSON.stringify(registerResponse.data, null, 2));
    
    if (registerResponse.data.success && registerResponse.data.data?.token) {
      console.log('🎉 Registration successful!');
      console.log('🎫 Token:', registerResponse.data.data.token.substring(0, 20) + '...');
      
      // Test login
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        identifier: testUser.email,
        password: testUser.password
      });
      
      console.log('✅ Login Response:', JSON.stringify(loginResponse.data, null, 2));
      
      if (loginResponse.data.success) {
        console.log('🎉 Login successful!');
        
        // Test video endpoints
        const token = loginResponse.data.data.tokens.access;
        console.log('\n🎬 Testing video endpoints...');
        
        // Test videos feed
        const feedResponse = await axios.get(`${BASE_URL}/videos/feed`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('✅ Videos Feed Response:', JSON.stringify(feedResponse.data, null, 2));
        
        // Test shorts feed
        const shortsResponse = await axios.get(`${BASE_URL}/shorts/feed`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        console.log('✅ Shorts Feed Response:', JSON.stringify(shortsResponse.data, null, 2));
      }
    }
    
  } catch (error) {
    console.error('❌ Auth Error:', JSON.stringify(error.response?.data, null, 2) || error.message);
  }
}

testAuth();