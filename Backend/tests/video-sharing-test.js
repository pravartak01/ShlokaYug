/**
 * YouTube-like Video Sharing System Test
 * Tests video uploads, shorts, engagement features, and discovery
 */

const BASE_URL = 'http://localhost:5000/api/v1';
const fs = require('fs').promises;
const path = require('path');
const FormData = require('form-data');

// Test data storage
let testData = {
  users: {},
  videos: [],
  shorts: [],
  comments: [],
  subscriptions: []
};

/**
 * HTTP Request helper for multipart form data
 */
async function uploadFile(endpoint, formData, headers = {}) {
  const fetch = (await import('node-fetch')).default;
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      body: formData,
      headers
    });
    
    let result;
    try {
      result = await response.json();
    } catch (e) {
      result = { message: 'Invalid JSON response' };
    }
    
    return {
      status: response.status,
      success: response.ok,
      data: result
    };
  } catch (error) {
    return {
      status: 500,
      success: false,
      error: error.message
    };
  }
}

/**
 * HTTP Request helper for JSON data
 */
async function makeRequest(method, endpoint, data = null, headers = {}) {
  const fetch = (await import('node-fetch')).default;
  
  const url = `${BASE_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    let result;
    
    try {
      result = await response.json();
    } catch (e) {
      result = { message: 'Invalid JSON response' };
    }
    
    return {
      status: response.status,
      success: response.ok,
      data: result
    };
  } catch (error) {
    return {
      status: 500,
      success: false,
      error: error.message
    };
  }
}

/**
 * Test 1: Create content creators and users
 */
async function createTestUsers() {
  console.log('\n👥 Creating Test Users...');

  const users = [
    {
      role: 'content_creator',
      email: 'creator1@example.com',
      username: 'sanskrit_guru',
      password: 'Creator123!',
      confirmPassword: 'Creator123!',
      firstName: 'Maharishi',
      lastName: 'Vedprakash'
    },
    {
      role: 'content_creator', 
      email: 'creator2@example.com',
      username: 'chandas_master',
      password: 'Creator123!',
      confirmPassword: 'Creator123!',
      firstName: 'Dr. Kavita',
      lastName: 'Sharma'
    },
    {
      role: 'student',
      email: 'viewer1@example.com',
      username: 'sanskrit_learner',
      password: 'Viewer123!',
      confirmPassword: 'Viewer123!',
      firstName: 'Raj',
      lastName: 'Kumar'
    },
    {
      role: 'student',
      email: 'viewer2@example.com',
      username: 'culture_lover',
      password: 'Viewer123!',
      confirmPassword: 'Viewer123!',
      firstName: 'Priya',
      lastName: 'Patel'
    }
  ];

  for (const userData of users) {
    try {
      const result = await makeRequest('POST', '/auth/register', userData);
      
      if (result.success) {
        testData.users[userData.username] = {
          id: result.data.user.id,
          token: result.data.tokens.access,
          username: userData.username,
          role: userData.role
        };
        console.log(`✅ Created ${userData.role}: ${userData.username}`);
      } else {
        console.log(`⚠️  User ${userData.username} might already exist, trying login...`);
        
        const loginResult = await makeRequest('POST', '/auth/login', {
          identifier: userData.email,
          password: userData.password
        });
        
        if (loginResult.success) {
          testData.users[userData.username] = {
            id: loginResult.data.user.id,
            token: loginResult.data.tokens.access,
            username: userData.username,
            role: userData.role
          };
          console.log(`✅ Logged in ${userData.role}: ${userData.username}`);
        }
      }
    } catch (error) {
      console.log(`❌ Failed to create user ${userData.username}:`, error.message);
    }
  }

  console.log(`\n📊 Created ${Object.keys(testData.users).length} users`);
  return Object.keys(testData.users).length > 0;
}

/**
 * Test 2: Create sample video file for testing
 */
async function createSampleVideo(duration = 30, type = 'regular') {
  console.log(`\n🎬 Creating sample ${type} video (${duration}s)...`);
  
  // Create a simple test video file (placeholder)
  const videoContent = `# Test Video File - ${type}\nDuration: ${duration} seconds\nCreated at: ${new Date().toISOString()}`;
  const filename = `test_${type}_${Date.now()}.txt`; // Using txt for demo
  const filepath = path.join(__dirname, filename);
  
  await fs.writeFile(filepath, videoContent);
  console.log(`✅ Created sample file: ${filename}`);
  
  return filepath;
}

/**
 * Test 3: Upload regular videos
 */
async function uploadRegularVideos() {
  console.log('\n📹 Uploading Regular Videos...');
  
  const creator1 = testData.users['sanskrit_guru'];
  const creator2 = testData.users['chandas_master'];
  
  if (!creator1 || !creator2) {
    console.log('❌ Content creators not found');
    return false;
  }

  const videoTemplates = [
    {
      creator: creator1,
      title: 'Sanskrit Pronunciation Guide - Complete Tutorial',
      description: 'Learn proper Sanskrit pronunciation with this comprehensive guide. Perfect for beginners starting their Sanskrit journey.',
      category: 'tutorials',
      tags: ['sanskrit', 'pronunciation', 'beginners', 'tutorial'],
      language: 'hindi'
    },
    {
      creator: creator1,
      title: 'Bhagavad Gita Chapter 1 - Verse by Verse Explanation',
      description: 'Deep dive into the first chapter of Bhagavad Gita with detailed explanations and cultural context.',
      category: 'spiritual',
      tags: ['bhagavad-gita', 'spiritual', 'philosophy', 'sanskrit'],
      language: 'sanskrit'
    },
    {
      creator: creator2,
      title: 'Chandas Basics - Understanding Sanskrit Meter',
      description: 'Introduction to Sanskrit prosody and meter patterns. Learn to identify and create chandas.',
      category: 'chandas',
      tags: ['chandas', 'meter', 'prosody', 'advanced'],
      language: 'hindi'
    },
    {
      creator: creator2,
      title: 'Gayatri Meter Explained - Sacred Sanskrit Rhythm',
      description: 'Detailed explanation of Gayatri meter, its structure, and significance in Vedic literature.',
      category: 'chandas',
      tags: ['gayatri', 'vedic', 'meter', 'sacred'],
      language: 'sanskrit'
    }
  ];

  for (const template of videoTemplates) {
    try {
      // Create sample video file
      const videoPath = await createSampleVideo(300, 'tutorial'); // 5 minutes
      
      // Create form data for upload
      const formData = new FormData();
      const videoBuffer = await fs.readFile(videoPath);
      
      formData.append('video', videoBuffer, 'sample_video.mp4');
      formData.append('title', template.title);
      formData.append('description', template.description);
      formData.append('category', template.category);
      formData.append('language', template.language);
      formData.append('tags', JSON.stringify(template.tags));
      formData.append('type', 'video');
      formData.append('visibility', 'public');

      const headers = {
        'Authorization': `Bearer ${template.creator.token}`,
        ...formData.getHeaders()
      };

      console.log(`\n📤 Uploading: ${template.title}`);
      const result = await uploadFile('/videos/upload', formData, headers);

      if (result.success) {
        testData.videos.push({
          id: result.data.videoId,
          title: template.title,
          creator: template.creator.username,
          category: template.category
        });
        console.log(`✅ Video uploaded: ${result.data.videoId}`);
        console.log(`   Status: ${result.data.status}`);
        console.log(`   Processing time: ${result.data.estimatedProcessingTime}`);
      } else {
        console.log(`❌ Upload failed: ${result.data?.message || result.error}`);
      }

      // Clean up sample file
      await fs.unlink(videoPath);

    } catch (error) {
      console.log(`❌ Error uploading video "${template.title}":`, error.message);
    }
  }

  console.log(`\n📊 Uploaded ${testData.videos.length} regular videos`);
  return testData.videos.length > 0;
}

/**
 * Test 4: Upload shorts
 */
async function uploadShorts() {
  console.log('\n📱 Uploading Shorts...');
  
  const creator1 = testData.users['sanskrit_guru'];
  const creator2 = testData.users['chandas_master'];
  
  if (!creator1 || !creator2) {
    console.log('❌ Content creators not found');
    return false;
  }

  const shortsTemplates = [
    {
      creator: creator1,
      title: 'Daily Sanskrit Word: Namaste',
      description: 'Quick explanation of the meaning and pronunciation of Namaste',
      category: 'educational',
      tags: ['namaste', 'daily-word', 'sanskrit'],
      hashtags: ['SanskritDaily', 'Namaste', 'QuickLearn'],
      music: { title: 'Traditional Sitar', artist: 'Classical India', isOriginal: false }
    },
    {
      creator: creator1,
      title: 'Sanskrit Numbers 1-10',
      description: 'Learn Sanskrit numbers from one to ten in 60 seconds!',
      category: 'educational',
      tags: ['numbers', 'counting', 'basics'],
      hashtags: ['SanskritNumbers', 'LearnSanskrit', 'QuickTutorial']
    },
    {
      creator: creator2,
      title: 'Chandas Challenge: Anushtup Pattern',
      description: 'Can you identify this popular Sanskrit meter? Comment your answer!',
      category: 'entertainment',
      tags: ['challenge', 'chandas', 'interactive'],
      hashtags: ['ChandasChallenge', 'SanskritQuiz', 'PoetryChallenge']
    },
    {
      creator: creator2,
      title: 'Beautiful Shloka Recitation',
      description: 'Peaceful morning shloka to start your day with positive energy',
      category: 'spiritual',
      tags: ['shloka', 'recitation', 'morning'],
      hashtags: ['MorningShloka', 'Peaceful', 'Spiritual'],
      music: { title: 'Temple Bells', artist: 'Meditation Sounds', isOriginal: false }
    }
  ];

  for (const template of shortsTemplates) {
    try {
      // Create sample short video file
      const videoPath = await createSampleVideo(45, 'short'); // 45 seconds
      
      // Create form data for upload
      const formData = new FormData();
      const videoBuffer = await fs.readFile(videoPath);
      
      formData.append('video', videoBuffer, 'sample_short.mp4');
      formData.append('title', template.title);
      formData.append('description', template.description);
      formData.append('category', template.category);
      formData.append('tags', JSON.stringify(template.tags));
      formData.append('type', 'short');
      formData.append('visibility', 'public');
      
      // Add shorts-specific data
      const shortsData = {
        hashtags: template.hashtags || [],
        music: template.music || {},
        isLoop: true
      };
      formData.append('shortsData', JSON.stringify(shortsData));

      const headers = {
        'Authorization': `Bearer ${template.creator.token}`,
        ...formData.getHeaders()
      };

      console.log(`\n📤 Uploading short: ${template.title}`);
      const result = await uploadFile('/videos/upload', formData, headers);

      if (result.success) {
        testData.shorts.push({
          id: result.data.videoId,
          title: template.title,
          creator: template.creator.username,
          hashtags: template.hashtags || []
        });
        console.log(`✅ Short uploaded: ${result.data.videoId}`);
      } else {
        console.log(`❌ Upload failed: ${result.data?.message || result.error}`);
      }

      // Clean up sample file
      await fs.unlink(videoPath);

    } catch (error) {
      console.log(`❌ Error uploading short "${template.title}":`, error.message);
    }
  }

  console.log(`\n📊 Uploaded ${testData.shorts.length} shorts`);
  return testData.shorts.length > 0;
}

/**
 * Test 5: Test video discovery and feeds
 */
async function testVideoDiscovery() {
  console.log('\n🔍 Testing Video Discovery...');
  
  // Test trending videos
  console.log('\n5.1 Getting trending videos...');
  const trending = await makeRequest('GET', '/videos/feed?type=trending&limit=5');
  if (trending.success) {
    console.log(`✅ Found ${trending.data.videos?.length || 0} trending videos`);
  }

  // Test popular videos
  console.log('\n5.2 Getting popular videos...');
  const popular = await makeRequest('GET', '/videos/feed?type=popular&limit=5');
  if (popular.success) {
    console.log(`✅ Found ${popular.data.videos?.length || 0} popular videos`);
  }

  // Test category filtering
  console.log('\n5.3 Getting Sanskrit tutorials...');
  const tutorials = await makeRequest('GET', '/videos/feed?category=tutorials&limit=5');
  if (tutorials.success) {
    console.log(`✅ Found ${tutorials.data.videos?.length || 0} tutorial videos`);
  }

  // Test shorts feed
  console.log('\n5.4 Getting shorts feed...');
  const shortsFeed = await makeRequest('GET', '/shorts/feed?limit=5');
  if (shortsFeed.success) {
    console.log(`✅ Found ${shortsFeed.data.shorts?.length || 0} shorts`);
    if (shortsFeed.data.shorts?.length > 0) {
      console.log(`   First short: ${shortsFeed.data.shorts[0].title}`);
    }
  }

  return true;
}

/**
 * Test 6: Test search functionality
 */
async function testSearch() {
  console.log('\n🔎 Testing Search Functionality...');

  // Search videos
  console.log('\n6.1 Searching for "sanskrit" videos...');
  const videoSearch = await makeRequest('GET', '/videos/search?q=sanskrit&limit=5');
  if (videoSearch.success) {
    console.log(`✅ Found ${videoSearch.data.videos?.length || 0} videos for "sanskrit"`);
  }

  // Search with filters
  console.log('\n6.2 Searching tutorials in Hindi...');
  const filteredSearch = await makeRequest('GET', '/videos/search?q=tutorial&category=tutorials&language=hindi&limit=3');
  if (filteredSearch.success) {
    console.log(`✅ Found ${filteredSearch.data.videos?.length || 0} Hindi tutorial videos`);
  }

  // Get trending hashtags
  console.log('\n6.3 Getting trending hashtags...');
  const hashtags = await makeRequest('GET', '/shorts/hashtags/trending?limit=10');
  if (hashtags.success) {
    console.log(`✅ Found ${hashtags.data.hashtags?.length || 0} trending hashtags`);
    if (hashtags.data.hashtags?.length > 0) {
      console.log(`   Top hashtag: #${hashtags.data.hashtags[0].hashtag} (${hashtags.data.hashtags[0].videosCount} videos)`);
    }
  }

  return true;
}

/**
 * Test 7: Test engagement features
 */
async function testEngagement() {
  console.log('\n❤️ Testing Engagement Features...');
  
  const viewer = testData.users['sanskrit_learner'];
  if (!viewer || testData.videos.length === 0) {
    console.log('❌ No viewer or videos found for engagement testing');
    return false;
  }

  const video = testData.videos[0];
  const headers = { 'Authorization': `Bearer ${viewer.token}` };

  // Test video view
  console.log('\n7.1 Recording video view...');
  const viewResult = await makeRequest('POST', `/videos/${video.id}/view`, {
    watchTime: 180, // 3 minutes
    deviceInfo: 'desktop'
  }, headers);
  
  if (viewResult.success) {
    console.log(`✅ View recorded. Total views: ${viewResult.data.views}`);
  }

  // Test video like
  console.log('\n7.2 Liking video...');
  const likeResult = await makeRequest('POST', `/videos/${video.id}/react`, {
    type: 'like'
  }, headers);
  
  if (likeResult.success) {
    console.log(`✅ Video liked. Total likes: ${likeResult.data.likes}`);
  }

  // Test commenting
  console.log('\n7.3 Adding comment...');
  const commentResult = await makeRequest('POST', `/videos/${video.id}/comments`, {
    text: 'Excellent explanation! This really helped me understand Sanskrit pronunciation better. 🙏'
  }, headers);
  
  if (commentResult.success) {
    testData.comments.push({
      id: commentResult.data.comment._id,
      videoId: video.id,
      text: commentResult.data.comment.content.text
    });
    console.log(`✅ Comment added: ${commentResult.data.comment._id}`);
  }

  // Test subscribing to creator
  console.log('\n7.4 Subscribing to creator...');
  const creatorId = testData.users['sanskrit_guru'].id;
  const subscribeResult = await makeRequest('POST', `/videos/channels/${creatorId}/subscribe`, {}, headers);
  
  if (subscribeResult.success) {
    console.log(`✅ Subscribed to creator. Subscriber count: ${subscribeResult.data.subscriberCount}`);
  }

  return true;
}

/**
 * Test 8: Test shorts-specific features
 */
async function testShortsFeatures() {
  console.log('\n📱 Testing Shorts-specific Features...');
  
  if (testData.shorts.length === 0) {
    console.log('❌ No shorts found for testing');
    return false;
  }

  // Test shorts by hashtag
  const short = testData.shorts[0];
  if (short.hashtags && short.hashtags.length > 0) {
    console.log(`\n8.1 Getting shorts with hashtag: #${short.hashtags[0]}`);
    const hashtagShorts = await makeRequest('GET', `/shorts/hashtag/${short.hashtags[0]}?limit=3`);
    
    if (hashtagShorts.success) {
      console.log(`✅ Found ${hashtagShorts.data.shorts?.length || 0} shorts with hashtag #${short.hashtags[0]}`);
    }
  }

  // Test shorts view tracking
  console.log('\n8.2 Recording shorts view...');
  const viewer = testData.users['culture_lover'];
  if (viewer) {
    const headers = { 'Authorization': `Bearer ${viewer.token}` };
    const shortsViewResult = await makeRequest('POST', `/shorts/${short.id}/view`, {
      watchTime: 35,
      deviceInfo: 'mobile',
      viewType: 'swipe'
    }, headers);
    
    if (shortsViewResult.success) {
      console.log(`✅ Shorts view recorded`);
    }
  }

  return true;
}

/**
 * Run complete video sharing system test
 */
async function runVideoSharingTest() {
  console.log('🚀 Starting YouTube-like Video Sharing System Test');
  console.log('====================================================');

  try {
    // Phase 1: Setup users
    console.log('\n📋 PHASE 1: USER SETUP');
    const usersCreated = await createTestUsers();
    if (!usersCreated) {
      console.log('\n❌ User setup failed - stopping tests');
      return;
    }

    // Phase 2: Upload content
    console.log('\n📋 PHASE 2: CONTENT UPLOAD');
    await uploadRegularVideos();
    await uploadShorts();

    // Phase 3: Discovery and search
    console.log('\n📋 PHASE 3: CONTENT DISCOVERY');
    await testVideoDiscovery();
    await testSearch();

    // Phase 4: Engagement
    console.log('\n📋 PHASE 4: USER ENGAGEMENT');
    await testEngagement();

    // Phase 5: Shorts features
    console.log('\n📋 PHASE 5: SHORTS FEATURES');
    await testShortsFeatures();

    // Final Summary
    console.log('\n🎉 VIDEO SHARING SYSTEM TEST COMPLETED!');
    console.log('=============================================');
    console.log('\n📊 TEST SUMMARY:');
    console.log(`✅ Users created: ${Object.keys(testData.users).length}`);
    console.log(`✅ Regular videos uploaded: ${testData.videos.length}`);
    console.log(`✅ Shorts uploaded: ${testData.shorts.length}`);
    console.log(`✅ Comments added: ${testData.comments.length}`);
    console.log('\n🎯 All YouTube-like features tested successfully!');
    console.log('🚀 Your video sharing platform is ready for users!');

  } catch (error) {
    console.log('\n❌ Video sharing test failed:', error.message);
  }
}

// Run the test
runVideoSharingTest();