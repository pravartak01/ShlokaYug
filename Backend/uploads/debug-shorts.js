/**
 * Debug shorts upload specifically
 */
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api/v1';

async function debugShortsUpload() {
  console.log('🩳 Debugging Shorts Upload...');
  
  try {
    // Setup test user first
    const testUser = {
      email: `shortsdebug${Date.now().toString().slice(-6)}@example.com`,
      username: `short${Date.now().toString().slice(-6)}`,
      password: 'TestPass123!',
      firstName: 'Shorts',
      lastName: 'Debug'
    };
    
    const authResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
    const authToken = authResponse.data.data.tokens.access;
    console.log('✅ Auth token obtained');
    
    // Create test file
    const testDir = path.join(__dirname, 'debug-uploads');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    
    const testVideoPath = path.join(testDir, 'debug-short.mp4');
    const testContent = Buffer.alloc(1024 * 50, 'debug short video');
    fs.writeFileSync(testVideoPath, testContent);
    
    const formData = new FormData();
    formData.append('video', fs.createReadStream(testVideoPath));
    formData.append('title', 'Debug Short Video');
    formData.append('description', 'Testing shorts upload debug');
    formData.append('category', 'educational');
    formData.append('tags[]', 'debug');
    formData.append('tags[]', 'shorts');
    formData.append('type', 'short');
    formData.append('visibility', 'public');
    formData.append('language', 'english');
    
    console.log('📤 Sending shorts upload request...');
    
    const response = await axios.post(`${BASE_URL}/videos/upload`, formData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        ...formData.getHeaders()
      },
      timeout: 30000
    });
    
    console.log('✅ Success Response:', JSON.stringify(response.data, null, 2));
    
    // Cleanup
    fs.unlinkSync(testVideoPath);
    fs.rmdirSync(testDir);
    
  } catch (error) {
    console.log('❌ Full Error:', error.message);
    if (error.response) {
      console.log('❌ Status:', error.response.status);
      console.log('❌ Error Response:', JSON.stringify(error.response?.data, null, 2));
    } else {
      console.log('❌ Network/Other Error:', error.code);
    }
    
    // Cleanup on error
    const testDir = path.join(__dirname, 'debug-uploads');
    if (fs.existsSync(testDir)) {
      try {
        const files = fs.readdirSync(testDir);
        files.forEach(file => fs.unlinkSync(path.join(testDir, file)));
        fs.rmdirSync(testDir);
      } catch (cleanupError) {
        console.log('⚠️ Cleanup error:', cleanupError.message);
      }
    }
  }
}

debugShortsUpload();