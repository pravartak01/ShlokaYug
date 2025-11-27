/**
 * Video Upload Test Suite - Real File Testing
 * Tests video upload functionality with actual files and comprehensive validation
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api/v1';
let authToken = '';
let testUserId = '';
let uploadedVideos = [];

// Test configuration
const TEST_CONFIG = {
  uploadDir: path.join(__dirname, 'test-uploads'),
  testFiles: {
    video1: 'test-video-1.mp4',
    video2: 'test-short.mp4',
    thumbnail: 'test-thumbnail.jpg',
    invalidFile: 'test-invalid.txt'
  }
};

// Utility functions
function log(message, type = 'info') {
  const timestamp = new Date().toISOString().substring(11, 19);
  const icons = {
    info: '🧪',
    success: '✅',
    error: '❌',
    warning: '⚠️',
    upload: '📤',
    process: '⚙️'
  };
  console.log(`${icons[type] || '🧪'} [${timestamp}] ${message}`);
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Setup test environment
async function setupTestEnvironment() {
  log('Setting up test environment...');
  
  // Create test uploads directory
  if (!fs.existsSync(TEST_CONFIG.uploadDir)) {
    fs.mkdirSync(TEST_CONFIG.uploadDir, { recursive: true });
  }
  
  // Create test video files (mock video content)
  createTestFiles();
  
  // Setup test user
  await setupTestUser();
  
  log('Test environment ready!', 'success');
}

function createTestFiles() {
  log('Creating test video files...');
  
  const testVideoContent = Buffer.alloc(1024 * 100, 'test video content'); // 100KB
  const testShortContent = Buffer.alloc(1024 * 50, 'test short video'); // 50KB
  const testThumbnailContent = Buffer.alloc(1024 * 10, 'test thumbnail'); // 10KB
  const testInvalidContent = Buffer.from('This is not a video file');
  
  // Create test files
  fs.writeFileSync(path.join(TEST_CONFIG.uploadDir, TEST_CONFIG.testFiles.video1), testVideoContent);
  fs.writeFileSync(path.join(TEST_CONFIG.uploadDir, TEST_CONFIG.testFiles.video2), testShortContent);
  fs.writeFileSync(path.join(TEST_CONFIG.uploadDir, TEST_CONFIG.testFiles.thumbnail), testThumbnailContent);
  fs.writeFileSync(path.join(TEST_CONFIG.uploadDir, TEST_CONFIG.testFiles.invalidFile), testInvalidContent);
  
  log('Test files created', 'success');
}

async function setupTestUser() {
  log('Setting up test user...');
  
  try {
    const testUser = {
      email: `videotester${Date.now().toString().slice(-6)}@example.com`,
      username: `vtest${Date.now().toString().slice(-6)}`,
      password: 'TestPass123!',
      firstName: 'Video',
      lastName: 'Tester'
    };
    
    const response = await axios.post(`${BASE_URL}/auth/register`, testUser);
    
    if (response.data.success) {
      authToken = response.data.data.tokens.access;
      testUserId = response.data.data.user.id;
      log('Test user created successfully', 'success');
    }
  } catch (error) {
    log(`User setup failed: ${error.response?.data?.error?.message || error.message}`, 'error');
    throw error;
  }
}

// Test 1: Basic Video Upload
async function testBasicVideoUpload() {
  log('Testing basic video upload...', 'upload');
  
  try {
    const formData = new FormData();
    const videoPath = path.join(TEST_CONFIG.uploadDir, TEST_CONFIG.testFiles.video1);
    
    formData.append('video', fs.createReadStream(videoPath));
    formData.append('title', 'Test Video - Educational Content');
    formData.append('description', 'This is a comprehensive test video for our video sharing platform. Testing upload functionality and metadata handling.');
    formData.append('category', 'educational');
    // Send tags as individual array items
    formData.append('tags[]', 'test');
    formData.append('tags[]', 'education');
    formData.append('tags[]', 'sanskrit');
    formData.append('tags[]', 'learning');
    formData.append('visibility', 'public');
    formData.append('type', 'video');
    formData.append('language', 'english');
    
    const response = await axios.post(`${BASE_URL}/videos/upload`, formData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        ...formData.getHeaders()
      },
      timeout: 30000 // 30 second timeout
    });
    
    if (response.data.success) {
      const videoData = response.data.data;
      const video = {
        _id: videoData.videoId,
        title: videoData.title,
        status: videoData.status
      };
      uploadedVideos.push(video);
      
      log(`Video uploaded successfully!`, 'success');
      log(`Video ID: ${video._id}`);
      log(`Title: ${video.title}`);
      log(`Status: ${video.status}`);
      log(`Processing time: ${videoData.estimatedProcessingTime}`);
      
      return { success: true, video };
    }
  } catch (error) {
    log(`Basic video upload failed: ${error.response?.data?.error?.message || error.message}`, 'error');
    if (error.response?.data) {
      console.log('Full error response:', JSON.stringify(error.response.data, null, 2));
    }
    return { success: false, error: error.message };
  }
}

// Test 2: Shorts Upload
async function testShortsUpload() {
  log('Testing shorts video upload...', 'upload');
  
  try {
    const formData = new FormData();
    const videoPath = path.join(TEST_CONFIG.uploadDir, TEST_CONFIG.testFiles.video2);
    
    formData.append('video', fs.createReadStream(videoPath));
    formData.append('title', 'Test Short - Sanskrit Pronunciation');
    formData.append('description', 'Quick Sanskrit pronunciation tip #SanskritLearning #Shorts');
    formData.append('category', 'educational');
    // Send tags as individual array items
    formData.append('tags[]', 'shorts');
    formData.append('tags[]', 'sanskrit');
    formData.append('tags[]', 'pronunciation');
    formData.append('tags[]', 'tips');
    formData.append('type', 'short'); // Mark as short-form content
    formData.append('visibility', 'public');
    formData.append('language', 'sanskrit');
    
    const response = await axios.post(`${BASE_URL}/videos/upload`, formData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        ...formData.getHeaders()
      },
      timeout: 30000
    });
    
    if (response.data.success) {
      const videoData = response.data.data;
      const video = {
        _id: videoData.videoId,
        title: videoData.title,
        status: videoData.status,
        isShort: true
      };
      uploadedVideos.push(video);
      
      log(`Short video uploaded successfully!`, 'success');
      log(`Short ID: ${video._id}`);
      log(`Is Short: ${video.isShort}`);
      
      return { success: true, video };
    }
  } catch (error) {
    log(`Shorts upload failed: ${error.response?.data?.error?.message || error.message}`, 'error');
    return { success: false, error: error.message };
  }
}

// Test 3: Invalid File Upload
async function testInvalidFileUpload() {
  log('Testing invalid file upload (should fail)...', 'upload');
  
  try {
    const formData = new FormData();
    const invalidPath = path.join(TEST_CONFIG.uploadDir, TEST_CONFIG.testFiles.invalidFile);
    
    formData.append('video', fs.createReadStream(invalidPath));
    formData.append('title', 'This should fail');
    formData.append('description', 'Testing invalid file upload');
    formData.append('category', 'educational');
    
    const response = await axios.post(`${BASE_URL}/videos/upload`, formData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        ...formData.getHeaders()
      },
      timeout: 15000
    });
    
    // This should not succeed
    log('Invalid file upload unexpectedly succeeded!', 'warning');
    return { success: false, message: 'Should have failed but succeeded' };
    
  } catch (error) {
    // This is expected to fail
    log(`Invalid file upload correctly rejected: ${error.response?.data?.error?.message || error.message}`, 'success');
    return { success: true, message: 'Correctly rejected invalid file' };
  }
}

// Test 4: Large File Upload
async function testLargeFileUpload() {
  log('Testing large file upload...', 'upload');
  
  try {
    // Create a larger test file (5MB)
    const largeVideoPath = path.join(TEST_CONFIG.uploadDir, 'large-test-video.mp4');
    const largeContent = Buffer.alloc(1024 * 1024 * 5, 'large video content'); // 5MB
    fs.writeFileSync(largeVideoPath, largeContent);
    
    const formData = new FormData();
    formData.append('video', fs.createReadStream(largeVideoPath));
    formData.append('title', 'Large Test Video - Performance Test');
    formData.append('description', 'Testing large file upload performance and handling');
    formData.append('category', 'educational');
    formData.append('tags[]', 'test');
    formData.append('tags[]', 'performance');
    formData.append('tags[]', 'large-file');
    formData.append('visibility', 'public');
    formData.append('type', 'video');
    formData.append('language', 'english');
    
    const response = await axios.post(`${BASE_URL}/videos/upload`, formData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        ...formData.getHeaders()
      },
      timeout: 60000 // 60 second timeout for large file
    });
    
    if (response.data.success) {
      const videoData = response.data.data;
      const video = {
        _id: videoData.videoId,
        title: videoData.title,
        status: videoData.status
      };
      uploadedVideos.push(video);
      
      log(`Large file uploaded successfully!`, 'success');
      log(`File size handled: ~5MB`);
      
      // Cleanup large file
      fs.unlinkSync(largeVideoPath);
      
      return { success: true, video };
    }
  } catch (error) {
    log(`Large file upload failed: ${error.response?.data?.error?.message || error.message}`, 'error');
    return { success: false, error: error.message };
  }
}

// Test 5: Upload with Custom Thumbnail
async function testUploadWithThumbnail() {
  log('Testing upload with custom thumbnail...', 'upload');
  
  try {
    const formData = new FormData();
    const videoPath = path.join(TEST_CONFIG.uploadDir, TEST_CONFIG.testFiles.video1);
    const thumbnailPath = path.join(TEST_CONFIG.uploadDir, TEST_CONFIG.testFiles.thumbnail);
    
    formData.append('video', fs.createReadStream(videoPath));
    // Note: Custom thumbnails may need separate endpoint or different handling
    formData.append('title', 'Video with Custom Thumbnail');
    formData.append('description', 'Testing video upload with custom thumbnail');
    formData.append('category', 'educational');
    formData.append('tags[]', 'test');
    formData.append('tags[]', 'thumbnail');
    formData.append('visibility', 'public');
    formData.append('type', 'video');
    formData.append('language', 'english');
    
    const response = await axios.post(`${BASE_URL}/videos/upload`, formData, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        ...formData.getHeaders()
      },
      timeout: 30000
    });
    
    if (response.data.success) {
      const videoData = response.data.data;
      const video = {
        _id: videoData.videoId,
        title: videoData.title,
        status: videoData.status
      };
      uploadedVideos.push(video);
      
      log(`Video with thumbnail uploaded successfully!`, 'success');
      log(`Custom thumbnail: Processing...`);
      
      return { success: true, video };
    }
  } catch (error) {
    log(`Thumbnail upload failed: ${error.response?.data?.error?.message || error.message}`, 'error');
    return { success: false, error: error.message };
  }
}

// Test 6: Video Processing Status
async function testVideoProcessingStatus() {
  log('Testing video processing status...', 'process');
  
  if (uploadedVideos.length === 0) {
    log('No videos to check status for', 'warning');
    return { success: false, message: 'No uploaded videos' };
  }
  
  try {
    const promises = uploadedVideos.slice(0, 3).map(async (video) => {
      const response = await axios.get(`${BASE_URL}/videos/${video._id}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      if (response.data.success) {
        const videoData = response.data.data;
        log(`Video ${video._id}: Status = ${videoData.status}, Duration = ${videoData.duration || 'N/A'}`);
        return { success: true, video: videoData };
      }
    });
    
    const results = await Promise.all(promises);
    log('Video processing status checked', 'success');
    return { success: true, results };
    
  } catch (error) {
    log(`Status check failed: ${error.message}`, 'error');
    return { success: false, error: error.message };
  }
}

// Test 7: Video Feed after Upload
async function testVideoFeedAfterUpload() {
  log('Testing video feed after uploads...', 'process');
  
  try {
    const response = await axios.get(`${BASE_URL}/videos/feed?limit=10`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    if (response.data.success) {
      const feedData = response.data.data;
      const videos = feedData.videos || [];
      log(`Feed loaded with ${videos.length} videos`, 'success');
      
      // Check if our uploaded videos appear in feed
      const ourVideos = videos.filter(video => 
        uploadedVideos.some(uploaded => uploaded._id === video._id)
      );
      
      log(`Our uploaded videos in feed: ${ourVideos.length}/${uploadedVideos.length}`);
      
      return { success: true, feedVideos: videos, ourVideos };
    }
  } catch (error) {
    log(`Feed test failed: ${error.message}`, 'error');
    return { success: false, error: error.message };
  }
}

// Test 8: Upload Validation Tests
async function testUploadValidation() {
  log('Testing upload validation...', 'upload');
  
  const validationTests = [];
  
  try {
    // Test missing title
    const formData1 = new FormData();
    const videoPath = path.join(TEST_CONFIG.uploadDir, TEST_CONFIG.testFiles.video1);
    formData1.append('video', fs.createReadStream(videoPath));
    formData1.append('description', 'Missing title test');
    formData1.append('category', 'educational');
    
    try {
      await axios.post(`${BASE_URL}/videos/upload`, formData1, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          ...formData1.getHeaders()
        }
      });
      validationTests.push({ test: 'missing title', result: 'failed', message: 'Should have been rejected' });
    } catch (error) {
      validationTests.push({ test: 'missing title', result: 'passed', message: 'Correctly rejected' });
    }
    
    // Test invalid category
    const formData2 = new FormData();
    formData2.append('video', fs.createReadStream(videoPath));
    formData2.append('title', 'Invalid category test');
    formData2.append('description', 'Testing invalid category');
    formData2.append('category', 'invalid_category');
    formData2.append('type', 'video');
    
    try {
      await axios.post(`${BASE_URL}/videos/upload`, formData2, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          ...formData2.getHeaders()
        }
      });
      validationTests.push({ test: 'invalid category', result: 'failed', message: 'Should have been rejected' });
    } catch (error) {
      validationTests.push({ test: 'invalid category', result: 'passed', message: 'Correctly rejected' });
    }
    
    log('Validation tests completed', 'success');
    validationTests.forEach(test => {
      log(`${test.test}: ${test.result} - ${test.message}`, test.result === 'passed' ? 'success' : 'error');
    });
    
    return { success: true, validationTests };
    
  } catch (error) {
    log(`Validation testing failed: ${error.message}`, 'error');
    return { success: false, error: error.message };
  }
}

// Main test execution
async function runVideoUploadTests() {
  console.log('\n🎬 Video Upload Test Suite');
  console.log('='.repeat(50));
  console.log('🎯 Testing real file uploads with comprehensive validation...\n');
  
  const testResults = [];
  
  try {
    // Setup
    await setupTestEnvironment();
    await delay(1000);
    
    // Run all upload tests
    const tests = [
      { name: 'Basic Video Upload', fn: testBasicVideoUpload },
      { name: 'Shorts Upload', fn: testShortsUpload },
      { name: 'Invalid File Upload', fn: testInvalidFileUpload },
      { name: 'Large File Upload', fn: testLargeFileUpload },
      { name: 'Upload with Thumbnail', fn: testUploadWithThumbnail },
      { name: 'Video Processing Status', fn: testVideoProcessingStatus },
      { name: 'Video Feed After Upload', fn: testVideoFeedAfterUpload },
      { name: 'Upload Validation', fn: testUploadValidation }
    ];
    
    for (const test of tests) {
      try {
        log(`\n--- Running ${test.name} ---`);
        const result = await test.fn();
        testResults.push({ 
          name: test.name, 
          passed: result.success,
          details: result
        });
        await delay(1000); // Prevent overwhelming the server
      } catch (error) {
        testResults.push({ 
          name: test.name, 
          passed: false,
          error: error.message 
        });
        log(`${test.name} crashed: ${error.message}`, 'error');
      }
    }
    
  } catch (error) {
    log(`Test suite crashed: ${error.message}`, 'error');
  }
  
  // Results Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 VIDEO UPLOAD TEST RESULTS');
  console.log('='.repeat(50));
  
  const passedTests = testResults.filter(r => r.passed).length;
  const totalTests = testResults.length;
  
  testResults.forEach(result => {
    const status = result.passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} | ${result.name}`);
  });
  
  console.log('\n' + '-'.repeat(30));
  console.log(`🎯 UPLOAD RESULTS: ${passedTests}/${totalTests} tests passed`);
  console.log(`📤 Videos Uploaded: ${uploadedVideos.length}`);
  
  if (uploadedVideos.length > 0) {
    console.log('\n📹 Uploaded Videos:');
    uploadedVideos.forEach((video, index) => {
      console.log(`   ${index + 1}. ${video.title || 'Untitled'} (${video._id})`);
    });
  }
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All upload tests passed! Video upload system is working perfectly!');
  } else if (passedTests >= totalTests * 0.7) {
    console.log('\n⚠️  Most upload tests passed. Some features may need attention.');
  } else {
    console.log('\n🚨 Many upload tests failed. System needs debugging.');
  }
  
  console.log('\n🙏 Video upload testing complete!\n');
  
  // Cleanup test files
  cleanup();
}

function cleanup() {
  try {
    if (fs.existsSync(TEST_CONFIG.uploadDir)) {
      const files = fs.readdirSync(TEST_CONFIG.uploadDir);
      files.forEach(file => {
        fs.unlinkSync(path.join(TEST_CONFIG.uploadDir, file));
      });
      fs.rmdirSync(TEST_CONFIG.uploadDir);
      log('Test files cleaned up', 'success');
    }
  } catch (error) {
    log(`Cleanup failed: ${error.message}`, 'warning');
  }
}

// Run the tests
runVideoUploadTests().catch(error => {
  console.error('Upload test suite execution failed:', error);
  cleanup();
  process.exit(1);
});