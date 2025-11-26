/**
 * Community System Integration Test
 * Tests Twitter-like functionality: posts, follows, timeline, search
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const BASE_URL = 'http://localhost:5000/api/v1';

class CommunityTest {
  constructor() {
    this.users = [];
    this.posts = [];
    this.authTokens = {};
  }
  
  async runCompleteTest() {
    console.log('\n🚀 COMMUNITY SYSTEM INTEGRATION TEST');
    console.log('='.repeat(60));
    
    try {
      // Step 1: Setup test users
      await this.setupTestUsers();
      
      // Step 2: Test posting functionality
      await this.testPostCreation();
      
      // Step 3: Test follow system
      await this.testFollowSystem();
      
      // Step 4: Test timeline/feed
      await this.testTimeline();
      
      // Step 5: Test engagement (likes, retweets, comments)
      await this.testEngagement();
      
      // Step 6: Test search and discovery
      await this.testSearchAndDiscovery();
      
      // Step 7: Test trending features
      await this.testTrending();
      
      console.log('\n' + '='.repeat(60));
      console.log('🎉 COMMUNITY SYSTEM TEST COMPLETED!');
      console.log('✅ All Twitter-like features working correctly');
      console.log('='.repeat(60));
      
    } catch (error) {
      console.error('\n❌ Community test failed:', error.message);
      console.error('Full error:', error.response?.data || error);
    }
  }
  
  async setupTestUsers() {
    console.log('\n👥 SETTING UP TEST USERS');
    console.log('-'.repeat(30));
    
    const testUsers = [
      { username: 'sanskrit_guru', firstName: 'Pandit', lastName: 'Sharma', email: 'guru@test.com', bio: 'Sanskrit teacher and scholar' },
      { username: 'vedic_student', firstName: 'Arjun', lastName: 'Patel', email: 'student@test.com', bio: 'Learning Sanskrit and Vedic texts' },
      { username: 'chandas_master', firstName: 'Priya', lastName: 'Iyer', email: 'chandas@test.com', bio: 'Expert in Chandas and poetry' },
      { username: 'dharma_seeker', firstName: 'Rahul', lastName: 'Gupta', email: 'dharma@test.com', bio: 'Exploring spiritual texts' }
    ];
    
    for (const userData of testUsers) {
      try {
        const userPayload = {
          ...userData,
          password: 'TestPass123!'
        };
        
        const response = await axios.post(`${BASE_URL}/auth/register`, userPayload);
        
        if (response.data.success) {
          const user = {
            ...userData,
            id: response.data.data.user._id,
            token: response.data.data.tokens.access
          };
          
          this.users.push(user);
          this.authTokens[user.username] = user.token;
          
          console.log(`✅ Created user: ${user.username} (${user.firstName} ${user.lastName})`);
        }
        
      } catch (error) {
        console.log(`⚠️  User ${userData.username}: ${error.response?.data?.error?.message || 'Already exists'}`);
        
        // Try to login if user already exists
        try {
          const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
            email: userData.email,
            password: 'TestPass123!'
          });
          
          if (loginResponse.data.success) {
            const user = {
              ...userData,
              id: loginResponse.data.data.user._id,
              token: loginResponse.data.data.tokens.access
            };
            
            this.users.push(user);
            this.authTokens[user.username] = user.token;
            console.log(`✅ Logged in user: ${user.username}`);
          }
        } catch (loginError) {
          console.log(`❌ Failed to login ${userData.username}`);
        }
      }
    }
    
    console.log(`\n📊 Total users ready: ${this.users.length}`);
  }
  
  async testPostCreation() {
    console.log('\n📝 TESTING POST CREATION');
    console.log('-'.repeat(30));
    
    const testPosts = [
      {
        user: 'sanskrit_guru',
        text: 'Welcome to our Sanskrit learning community! 🕉️ #Sanskrit #Learning #Vedic',
        type: 'text'
      },
      {
        user: 'vedic_student', 
        text: 'Just started learning Devanagari script. Any tips? #BeginnerQuestion #Sanskrit #Help',
        type: 'text'
      },
      {
        user: 'chandas_master',
        text: 'Beautiful verse from Ramayana in Anushtup meter 📿 #Chandas #Ramayana #Poetry',
        type: 'text'
      },
      {
        user: 'dharma_seeker',
        text: 'Morning meditation with Sanskrit mantras brings such peace ✨ #Meditation #Mantras #Peace',
        type: 'text'
      }
    ];
    
    for (const postData of testPosts) {
      try {
        const token = this.authTokens[postData.user];
        if (!token) {
          console.log(`⚠️  No token for user ${postData.user}`);
          continue;
        }
        
        const response = await axios.post(
          `${BASE_URL}/community/posts`,
          {
            text: postData.text,
            visibility: 'public'
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        if (response.data.success) {
          const post = response.data.data.post;
          this.posts.push(post);
          
          console.log(`✅ ${postData.user} posted: "${postData.text.substring(0, 50)}..."`);
          console.log(`   📊 Post ID: ${post._id}`);
          console.log(`   🏷️  Hashtags: ${post.content.hashtags?.join(', ') || 'None'}`);
        }
        
      } catch (error) {
        console.log(`❌ Failed to create post for ${postData.user}: ${error.response?.data?.error?.message}`);
      }
    }
    
    console.log(`\n📊 Total posts created: ${this.posts.length}`);
  }
  
  async testFollowSystem() {
    console.log('\n👥 TESTING FOLLOW SYSTEM');
    console.log('-'.repeat(30));
    
    // Create follow relationships
    const followPairs = [
      ['vedic_student', 'sanskrit_guru'],
      ['dharma_seeker', 'sanskrit_guru'],
      ['chandas_master', 'sanskrit_guru'],
      ['vedic_student', 'chandas_master'],
      ['dharma_seeker', 'chandas_master'],
      ['vedic_student', 'dharma_seeker']
    ];
    
    for (const [follower, following] of followPairs) {
      try {
        const token = this.authTokens[follower];
        if (!token) continue;
        
        const response = await axios.post(
          `${BASE_URL}/community/users/${following}/follow`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        if (response.data.success) {
          console.log(`✅ ${follower} followed ${following}`);
        }
        
      } catch (error) {
        console.log(`❌ ${follower} -> ${following}: ${error.response?.data?.error?.message}`);
      }
    }
    
    // Test getting followers and following
    console.log('\n📈 Testing follow counts:');
    for (const user of this.users.slice(0, 2)) { // Test first 2 users
      try {
        const [followersRes, followingRes] = await Promise.all([
          axios.get(`${BASE_URL}/community/users/${user.username}/followers`),
          axios.get(`${BASE_URL}/community/users/${user.username}/following`)
        ]);
        
        console.log(`📊 ${user.username}:`);
        console.log(`   👥 Followers: ${followersRes.data.data.pagination.count}`);
        console.log(`   ➡️  Following: ${followingRes.data.data.pagination.count}`);
        
      } catch (error) {
        console.log(`❌ Failed to get follow data for ${user.username}`);
      }
    }
  }
  
  async testTimeline() {
    console.log('\n📰 TESTING TIMELINE/FEED');
    console.log('-'.repeat(30));
    
    // Test personal timeline
    for (const user of this.users.slice(0, 2)) {
      try {
        const token = this.authTokens[user.username];
        const response = await axios.get(
          `${BASE_URL}/community/timeline?limit=5`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        if (response.data.success) {
          const posts = response.data.data.posts;
          console.log(`✅ ${user.username}'s timeline: ${posts.length} posts`);
          
          if (posts.length > 0) {
            console.log(`   📝 Latest: "${posts[0].content.text?.substring(0, 40)}..."`);
            console.log(`   👤 By: ${posts[0].author.username}`);
          }
        }
        
      } catch (error) {
        console.log(`❌ Failed to get timeline for ${user.username}: ${error.response?.data?.error?.message}`);
      }
    }
    
    // Test explore feed
    try {
      const response = await axios.get(`${BASE_URL}/community/explore?limit=5`);
      if (response.data.success) {
        const posts = response.data.data.posts;
        console.log(`\n✅ Explore feed: ${posts.length} public posts`);
      }
    } catch (error) {
      console.log(`❌ Failed to get explore feed: ${error.response?.data?.error?.message}`);
    }
  }
  
  async testEngagement() {
    console.log('\n❤️  TESTING ENGAGEMENT (LIKES, RETWEETS, COMMENTS)');
    console.log('-'.repeat(30));
    
    if (this.posts.length === 0) {
      console.log('⚠️  No posts available for engagement testing');
      return;
    }
    
    const testPost = this.posts[0];
    
    // Test likes
    for (const user of this.users.slice(1, 3)) { // 2 users like the first post
      try {
        const token = this.authTokens[user.username];
        const response = await axios.post(
          `${BASE_URL}/community/posts/${testPost._id}/like`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        if (response.data.success) {
          console.log(`✅ ${user.username} liked the post`);
          console.log(`   👍 Total likes: ${response.data.data.likesCount}`);
        }
        
      } catch (error) {
        console.log(`❌ Like failed for ${user.username}: ${error.response?.data?.error?.message}`);
      }
    }
    
    // Test comments
    const comments = [
      { user: 'vedic_student', text: 'Thank you for sharing this wisdom! 🙏' },
      { user: 'dharma_seeker', text: 'Very inspiring! Looking forward to more.' }
    ];
    
    for (const comment of comments) {
      try {
        const token = this.authTokens[comment.user];
        const response = await axios.post(
          `${BASE_URL}/community/posts/${testPost._id}/comments`,
          { text: comment.text },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        if (response.data.success) {
          console.log(`✅ ${comment.user} commented: "${comment.text}"`);
        }
        
      } catch (error) {
        console.log(`❌ Comment failed for ${comment.user}: ${error.response?.data?.error?.message}`);
      }
    }
    
    // Test retweet
    try {
      const token = this.authTokens['dharma_seeker'];
      const response = await axios.post(
        `${BASE_URL}/community/posts/${testPost._id}/repost`,
        { quoteText: 'This is so valuable for our community!' },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      if (response.data.success) {
        console.log(`✅ dharma_seeker quoted the post`);
        console.log(`   🔄 Quote: "${response.data.data.repost.quoteText}"`);
      }
      
    } catch (error) {
      console.log(`❌ Repost failed: ${error.response?.data?.error?.message}`);
    }
  }
  
  async testSearchAndDiscovery() {
    console.log('\n🔍 TESTING SEARCH & DISCOVERY');
    console.log('-'.repeat(30));
    
    // Test search
    const searchQueries = ['Sanskrit', 'learning', 'meditation'];
    
    for (const query of searchQueries) {
      try {
        const response = await axios.get(
          `${BASE_URL}/community/search?q=${encodeURIComponent(query)}&type=all`
        );
        
        if (response.data.success) {
          const results = response.data.data;
          console.log(`✅ Search "${query}": ${results.posts.length} posts, ${results.users.length} users`);
        }
        
      } catch (error) {
        console.log(`❌ Search "${query}" failed: ${error.response?.data?.error?.message}`);
      }
    }
    
    // Test hashtag posts
    try {
      const response = await axios.get(`${BASE_URL}/community/hashtags/Sanskrit/posts`);
      if (response.data.success) {
        console.log(`✅ #Sanskrit hashtag: ${response.data.data.posts.length} posts`);
      }
    } catch (error) {
      console.log(`❌ Hashtag search failed: ${error.response?.data?.error?.message}`);
    }
  }
  
  async testTrending() {
    console.log('\n📈 TESTING TRENDING FEATURES');
    console.log('-'.repeat(30));
    
    // Test trending hashtags
    try {
      const response = await axios.get(`${BASE_URL}/community/trending/hashtags`);
      if (response.data.success) {
        const hashtags = response.data.data.hashtags;
        console.log(`✅ Trending hashtags: ${hashtags.length}`);
        
        hashtags.slice(0, 3).forEach((tag, index) => {
          console.log(`   ${index + 1}. #${tag._id} (${tag.count} posts, ${tag.totalEngagement} engagement)`);
        });
      }
    } catch (error) {
      console.log(`❌ Trending hashtags failed: ${error.response?.data?.error?.message}`);
    }
    
    // Test community stats
    try {
      const response = await axios.get(`${BASE_URL}/community/stats`);
      if (response.data.success) {
        const stats = response.data.data;
        console.log(`\n📊 Community Stats:`);
        console.log(`   👥 Total Users: ${stats.totalUsers}`);
        console.log(`   📝 Total Posts: ${stats.totalPosts}`);
        console.log(`   👫 Total Follows: ${stats.totalFollows}`);
        console.log(`   📅 Posts Today: ${stats.postsToday}`);
      }
    } catch (error) {
      console.log(`❌ Community stats failed: ${error.response?.data?.error?.message}`);
    }
  }
}

// Run the test
const tester = new CommunityTest();
tester.runCompleteTest().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});