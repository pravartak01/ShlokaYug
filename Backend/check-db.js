const mongoose = require('mongoose');
require('dotenv').config();

async function checkDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('\n📊 Database Collections Created:');
    console.log('================================');
    
    collections.forEach((collection, index) => {
      console.log(`${index + 1}. ${collection.name}`);
    });
    
    console.log(`\nTotal Collections: ${collections.length}`);
    
    // Check specific challenge collections
    const challengeCollections = collections.filter(c => 
      c.name.includes('challenge') || c.name.includes('certificate')
    );
    
    if (challengeCollections.length > 0) {
      console.log('\n🏆 Challenge System Collections:');
      challengeCollections.forEach(collection => {
        console.log(`✅ ${collection.name}`);
      });
    } else {
      console.log('\n⚠️  No challenge collections found yet');
    }

    // Check for user and guru collections
    const authCollections = collections.filter(c => 
      c.name.includes('user') || c.name.includes('guru')
    );
    
    if (authCollections.length > 0) {
      console.log('\n👤 Authentication Collections:');
      authCollections.forEach(collection => {
        console.log(`✅ ${collection.name}`);
      });
    }

    // Check for course and content collections
    const courseCollections = collections.filter(c => 
      c.name.includes('course') || c.name.includes('enrollment') || c.name.includes('progress')
    );
    
    if (courseCollections.length > 0) {
      console.log('\n📚 Learning Management Collections:');
      courseCollections.forEach(collection => {
        console.log(`✅ ${collection.name}`);
      });
    }

    // Check for community collections
    const communityCollections = collections.filter(c => 
      c.name.includes('community') || c.name.includes('post') || c.name.includes('comment') || c.name.includes('follow')
    );
    
    if (communityCollections.length > 0) {
      console.log('\n🌐 Community Collections:');
      communityCollections.forEach(collection => {
        console.log(`✅ ${collection.name}`);
      });
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Database check complete');
    
  } catch (error) {
    console.error('❌ Database connection error:', error.message);
  }
}

checkDB();