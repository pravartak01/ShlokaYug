/**
 * Quick Video Upload Test - Simplified
 * Test only the core upload functionality
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api/v1';

async function quickUploadTest() {
  console.log('🚀 Quick Video Upload Test');
  console.log('='.repeat(30));
  
  let authToken = '';
  let uploadedVideos = [];
  
  try {
    // Setup test user
    const testUser = {
      email: `quicktest${Date.now().toString().slice(-6)}@example.com`,
      username: `qtest${Date.now().toString().slice(-6)}`,
      password: 'TestPass123!',
      firstName: 'Quick',
      lastName: 'Test'
    };
    
    console.log('👤 Creating test user...');
    const authResponse = await axios.post(`${BASE_URL}/auth/register`, testUser);
    authToken = authResponse.data.data.tokens.access;
    console.log('✅ User created and authenticated');
    
    // Create test files
    const testDir = path.join(__dirname, 'quick-test');
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
    
    const videoContent = Buffer.alloc(1024 * 100, 'test video content');
    const videoPath = path.join(testDir, 'test.mp4');
    fs.writeFileSync(videoPath, videoContent);
    
    const shortContent = Buffer.alloc(1024 * 50, 'test short video');
    const shortPath = path.join(testDir, 'short.mp4');
    fs.writeFileSync(shortPath, shortContent);
    
    // Test 1: Regular Video Upload
    console.log('\\n📹 Testing regular video upload...');
    const formData1 = new FormData();
    formData1.append('video', fs.createReadStream(videoPath));
    formData1.append('title', 'Quick Test Video');
    formData1.append('description', 'Testing video upload functionality');
    formData1.append('category', 'educational');
    formData1.append('tags[]', 'test');
    formData1.append('tags[]', 'video');
    formData1.append('type', 'video');
    formData1.append('visibility', 'public');
    formData1.append('language', 'english');
    
    const response1 = await axios.post(`${BASE_URL}/videos/upload`, formData1, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        ...formData1.getHeaders()
      },
      timeout: 30000
    });
    
    if (response1.data.success) {
      console.log('✅ Video uploaded:', response1.data.data.videoId);
      uploadedVideos.push(response1.data.data);
    }
    
    // Test 2: Shorts Upload
    console.log('\\n🩳 Testing shorts upload...');
    const formData2 = new FormData();
    formData2.append('video', fs.createReadStream(shortPath));
    formData2.append('title', 'Quick Test Short');
    formData2.append('description', 'Testing shorts upload functionality');
    formData2.append('category', 'educational');
    formData2.append('tags[]', 'test');
    formData2.append('tags[]', 'shorts');
    formData2.append('type', 'short');
    formData2.append('visibility', 'public');
    formData2.append('language', 'english');
    
    const response2 = await axios.post(`${BASE_URL}/videos/upload`, formData2, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        ...formData2.getHeaders()
      },
      timeout: 30000
    });
    
    if (response2.data.success) {
      console.log('✅ Short uploaded:', response2.data.data.videoId);
      uploadedVideos.push(response2.data.data);
    }
    
    // Test 3: Check videos in feed
    console.log('\\n🔍 Checking videos feed...');
    const feedResponse = await axios.get(`${BASE_URL}/videos/feed?limit=10`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (feedResponse.data.success) {
      const feedVideos = feedResponse.data.data.videos || [];
      console.log(`📺 Feed loaded with ${feedVideos.length} videos`);
      
      const ourVideos = feedVideos.filter(video => 
        uploadedVideos.some(uploaded => uploaded.videoId === video._id)
      );
      console.log(`🎯 Our videos in feed: ${ourVideos.length}/${uploadedVideos.length}`);
    }
    
    // Cleanup
    fs.unlinkSync(videoPath);
    fs.unlinkSync(shortPath);
    fs.rmdirSync(testDir);
    
    console.log('\\n' + '='.repeat(30));
    console.log(`🎉 Test completed: ${uploadedVideos.length} videos uploaded successfully!`);
    uploadedVideos.forEach((video, index) => {
      console.log(`   ${index + 1}. ${video.title} (${video.videoId})`);
    });
    console.log('\\n✅ Quick test passed!');
    
  } catch (error) {
    console.error('❌ Test failed:');
    console.error('Status:', error.response?.status);
    console.error('Data:', JSON.stringify(error.response?.data, null, 2));
    console.error('Message:', error.message);
  }
}

quickUploadTest();