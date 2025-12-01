const mongoose = require('mongoose');
require('dotenv').config();

// Import the challenge models to trigger schema creation
require('./src/models/Challenge');
require('./src/models/ChallengeParticipant');
require('./src/models/ChallengeCertificate');

async function checkChallengeCollections() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const db = mongoose.connection.db;
    
    // Check Challenge collection
    console.log('\n🏆 CHALLENGE COLLECTION:');
    console.log('========================');
    try {
      const challengeCollection = db.collection('challenges');
      const challengeIndexes = await challengeCollection.indexes();
      console.log('📋 Indexes created:');
      challengeIndexes.forEach(index => {
        console.log(`  - ${JSON.stringify(index.key)}`);
      });
      
      const challengeCount = await challengeCollection.countDocuments();
      console.log(`📊 Documents: ${challengeCount} challenges`);
    } catch (error) {
      console.log('❌ Challenge collection error:', error.message);
    }

    // Check ChallengeParticipant collection  
    console.log('\n👥 CHALLENGE PARTICIPANTS COLLECTION:');
    console.log('====================================');
    try {
      const participantCollection = db.collection('challengeparticipants');
      const participantIndexes = await participantCollection.indexes();
      console.log('📋 Indexes created:');
      participantIndexes.forEach(index => {
        console.log(`  - ${JSON.stringify(index.key)}`);
      });
      
      const participantCount = await participantCollection.countDocuments();
      console.log(`📊 Documents: ${participantCount} participants`);
    } catch (error) {
      console.log('❌ Participant collection error:', error.message);
    }

    // Check ChallengeCertificate collection
    console.log('\n🏅 CHALLENGE CERTIFICATES COLLECTION:');
    console.log('====================================');
    try {
      const certificateCollection = db.collection('challengecertificates');
      const certificateIndexes = await certificateCollection.indexes();
      console.log('📋 Indexes created:');
      certificateIndexes.forEach(index => {
        console.log(`  - ${JSON.stringify(index.key)}`);
      });
      
      const certificateCount = await certificateCollection.countDocuments();
      console.log(`📊 Documents: ${certificateCount} certificates`);
    } catch (error) {
      console.log('❌ Certificate collection error:', error.message);
    }

    // Test creating a sample challenge to verify schema works
    console.log('\n🧪 TESTING CHALLENGE CREATION:');
    console.log('=============================');
    
    const Challenge = mongoose.model('Challenge');
    const testChallenge = new Challenge({
      title: 'Test Sanskrit Challenge',
      description: 'A test challenge to verify the system works',
      type: 'shloka_recitation',
      difficulty: 'beginner',
      category: 'pronunciation',
      createdBy: new mongoose.Types.ObjectId(),
      rewards: {
        points: 100,
        badge: 'Test Badge'
      },
      requirements: {
        minLevel: 1,
        prerequisites: [],
        estimatedDuration: 30
      }
    });

    const validationResult = testChallenge.validateSync();
    if (validationResult) {
      console.log('❌ Validation errors:', validationResult.errors);
    } else {
      console.log('✅ Challenge schema validation passed');
      console.log('✅ All challenge system models are properly configured');
    }
    
    await mongoose.disconnect();
    console.log('\n🎊 Database verification complete!');
    
  } catch (error) {
    console.error('❌ Database verification error:', error.message);
  }
}

checkChallengeCollections();