const mongoose = require('mongoose');
require('dotenv').config();

// Import the challenge models
require('./src/models/Challenge');

async function testSimpleChallenge() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const Challenge = mongoose.model('Challenge');
    
    // Create a minimal valid challenge
    const testChallenge = new Challenge({
      title: 'Test Challenge',
      description: 'A simple test challenge',
      type: 'shloka_recitation',
      createdBy: new mongoose.Types.ObjectId(),
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      requirements: {
        targetCount: 5,
        category: 'general' // Use the correct enum value
      },
      rewards: {
        points: 100,
        badge: {
          name: 'Test Badge',
          description: 'Test completion badge'
        }
      }
    });

    const validationResult = testChallenge.validateSync();
    if (validationResult) {
      console.log('❌ Validation failed:', Object.keys(validationResult.errors));
      for (const [field, error] of Object.entries(validationResult.errors)) {
        console.log(`   ${field}: ${error.message}`);
      }
    } else {
      console.log('✅ Challenge validation passed');
      
      // Save to database
      await testChallenge.save();
      console.log('✅ Challenge saved successfully');
      console.log(`   Challenge ID: ${testChallenge._id}`);
      console.log(`   Title: ${testChallenge.title}`);
      console.log(`   Type: ${testChallenge.type}`);
      console.log(`   Status: ${testChallenge.status}`);
      
      // Clean up
      await Challenge.findByIdAndDelete(testChallenge._id);
      console.log('✅ Test challenge deleted');
    }
    
    await mongoose.disconnect();
    console.log('\n🎊 Database Test Complete!');
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testSimpleChallenge();