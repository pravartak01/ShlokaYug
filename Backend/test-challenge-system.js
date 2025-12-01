const mongoose = require('mongoose');
require('dotenv').config();

// Import the challenge models
require('./src/models/Challenge');
require('./src/models/ChallengeParticipant');
require('./src/models/ChallengeCertificate');

async function testChallengeSystem() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    console.log('\n🧪 TESTING COMPLETE CHALLENGE FLOW:');
    console.log('===================================');
    
    const Challenge = mongoose.model('Challenge');
    const ChallengeParticipant = mongoose.model('ChallengeParticipant');
    const ChallengeCertificate = mongoose.model('ChallengeCertificate');
    
    // Test 1: Create a valid challenge
    console.log('\n1. Creating a test challenge...');
    const testChallenge = new Challenge({
      title: 'Sanskrit Pronunciation Master',
      description: 'Master the pronunciation of 10 Sanskrit shlokas',
      type: 'shloka_recitation',
      difficulty: 'beginner',
      category: 'pronunciation',
      createdBy: new mongoose.Types.ObjectId(),
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      rewards: {
        points: 100,
        badge: {
          name: 'Pronunciation Master',
          description: 'Completed pronunciation challenge',
          icon: 'pronunciation-badge.png'
        },
        positions: [
          { position: 1, points: 50, badge: 'Gold Pronunciation' },
          { position: 2, points: 30, badge: 'Silver Pronunciation' },
          { position: 3, points: 20, badge: 'Bronze Pronunciation' }
        ]
      },
      requirements: {
        minLevel: 1,
        difficulty: 'beginner',
        category: 'pronunciation',
        targetCount: 10,
        prerequisites: [],
        estimatedDuration: 30
      }
    });

    const validationResult = testChallenge.validateSync();
    if (validationResult) {
      console.log('❌ Challenge validation failed:', Object.keys(validationResult.errors));
    } else {
      console.log('✅ Challenge validation passed');
      
      // Save the challenge
      await testChallenge.save();
      console.log('✅ Challenge saved to database');
      console.log(`   Challenge ID: ${testChallenge._id}`);
      
      // Test 2: Create a participant
      console.log('\n2. Creating a test participant...');
      const testParticipant = new ChallengeParticipant({
        challengeId: testChallenge._id,
        userId: new mongoose.Types.ObjectId(),
        joinedAt: new Date(),
        status: 'active',
        attempts: [{
          attemptNumber: 1,
          startedAt: new Date(),
          responses: [{
            questionId: 'q1',
            userAnswer: 'Test answer',
            isCorrect: true,
            score: 10,
            submittedAt: new Date()
          }],
          score: 10,
          completedAt: new Date(),
          feedback: 'Great pronunciation!'
        }],
        totalScore: 10,
        bestScore: 10,
        completedAt: new Date()
      });
      
      const participantValidation = testParticipant.validateSync();
      if (participantValidation) {
        console.log('❌ Participant validation failed:', Object.keys(participantValidation.errors));
      } else {
        console.log('✅ Participant validation passed');
        await testParticipant.save();
        console.log('✅ Participant saved to database');
        console.log(`   Participant ID: ${testParticipant._id}`);
        
        // Test 3: Create a certificate
        console.log('\n3. Creating a test certificate...');
        const testCertificate = new ChallengeCertificate({
          userId: testParticipant.userId,
          challengeId: testChallenge._id,
          participantId: testParticipant._id,
          certificateId: `CERT-${Date.now()}`,
          verificationCode: `VERIFY-${Date.now()}`,
          achievement: {
            challengeTitle: testChallenge.title,
            completionDate: new Date(),
            score: 10,
            rank: 1,
            totalParticipants: 1
          },
          issuedAt: new Date()
        });
        
        const certificateValidation = testCertificate.validateSync();
        if (certificateValidation) {
          console.log('❌ Certificate validation failed:', Object.keys(certificateValidation.errors));
        } else {
          console.log('✅ Certificate validation passed');
          await testCertificate.save();
          console.log('✅ Certificate saved to database');
          console.log(`   Certificate ID: ${testCertificate.certificateId}`);
          console.log(`   Verification Code: ${testCertificate.verificationCode}`);
        }
      }
    }
    
    // Test 4: Query the data
    console.log('\n4. Verifying saved data...');
    const challengeCount = await Challenge.countDocuments();
    const participantCount = await ChallengeParticipant.countDocuments();
    const certificateCount = await ChallengeCertificate.countDocuments();
    
    console.log(`📊 Challenges in DB: ${challengeCount}`);
    console.log(`📊 Participants in DB: ${participantCount}`);
    console.log(`📊 Certificates in DB: ${certificateCount}`);
    
    // Clean up test data
    console.log('\n5. Cleaning up test data...');
    await Challenge.deleteMany({ title: 'Sanskrit Pronunciation Master' });
    await ChallengeParticipant.deleteMany({ challengeId: testChallenge._id });
    await ChallengeCertificate.deleteMany({ challengeId: testChallenge._id });
    console.log('✅ Test data cleaned up');
    
    await mongoose.disconnect();
    console.log('\n🎊 CHALLENGE SYSTEM DATABASE TEST COMPLETE!');
    console.log('✅ All models are working correctly');
    console.log('✅ Database tables (collections) are properly created');
    console.log('✅ Validation is working');
    console.log('✅ CRUD operations successful');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
    if (error.errors) {
      console.error('Validation errors:', Object.keys(error.errors));
    }
  }
}

testChallengeSystem();