require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Guru = require('./src/models/Guru');
const Challenge = require('./src/models/Challenge');

async function checkAndSeedData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔍 Checking current database data...');
    
    // Check current counts
    const userCount = await User.countDocuments();
    const guruCount = await Guru.countDocuments();
    const challengeCount = await Challenge.countDocuments();
    
    console.log(`📊 Current Data:
  Users: ${userCount}
  Gurus: ${guruCount}
  Challenges: ${challengeCount}`);
    
    // If no test data, create some
    if (userCount === 1) { // Only admin exists
      console.log('🌱 Creating test users...');
      
      const testUsers = [
        {
          username: 'priya_sharma',
          email: 'priya@example.com',
          password: 'password123',
          profile: {
            firstName: 'Priya',
            lastName: 'Sharma',
            phoneNumber: '+919876543210'
          },
          role: 'user'
        },
        {
          username: 'amit_kumar',
          email: 'amit@example.com', 
          password: 'password123',
          profile: {
            firstName: 'Amit',
            lastName: 'Kumar',
            phoneNumber: '+919876543211'
          },
          role: 'user'
        },
        {
          username: 'meera_patel',
          email: 'meera@example.com',
          password: 'password123', 
          profile: {
            firstName: 'Meera',
            lastName: 'Patel',
            phoneNumber: '+919876543212'
          },
          role: 'user'
        }
      ];
      
      for (const userData of testUsers) {
        const user = new User(userData);
        await user.save();
        console.log(`✅ Created user: ${userData.username}`);
      }
    }
    
    if (guruCount === 0) {
      console.log('🧙‍♂️ Creating test guru applications...');
      
      const testGurus = [
        {
          username: 'dr_rajesh',
          email: 'rajesh@example.com',
          password: 'password123',
          profile: {
            firstName: 'Dr. Rajesh',
            lastName: 'Kumar',
            phoneNumber: '+919876543213'
          },
          qualification: {
            degrees: ['PhD in Sanskrit Literature', 'MA in Ancient Indian History'],
            experience: 15,
            specializations: ['Vedic Studies', 'Chandas Analysis'],
            teachingExperience: 'Taught at Delhi University for 10 years'
          },
          applicationStatus: {
            status: 'submitted',
            submittedAt: new Date()
          }
        },
        {
          username: 'prof_anita',
          email: 'anita@example.com',
          password: 'password123', 
          profile: {
            firstName: 'Prof. Anita',
            lastName: 'Gupta',
            phoneNumber: '+919876543214'
          },
          qualification: {
            degrees: ['MA in Sanskrit', 'B.Ed'],
            experience: 8,
            specializations: ['Shloka Recitation', 'Pronunciation'],
            teachingExperience: 'Private tutor for 8 years'
          },
          applicationStatus: {
            status: 'submitted',
            submittedAt: new Date()
          }
        }
      ];
      
      for (const guruData of testGurus) {
        const guru = new Guru(guruData);
        await guru.save();
        console.log(`✅ Created guru application: ${guruData.username}`);
      }
    }
    
    if (challengeCount === 0) {
      console.log('🏆 Creating test challenges...');
      
      // Get admin user ObjectId for createdBy field
      const adminUserDoc = await User.findOne({ email: 'michtohadmin@svaram.com' });
      if (!adminUserDoc) {
        console.error('❌ Admin user not found for challenge creation');
        return;
      }
      
      const now = new Date();
      const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
      
      const testChallenges = [
        {
          title: 'Beginner Shloka Recitation',
          description: 'Learn and recite 5 basic Sanskrit shlokas with proper pronunciation',
          instructions: 'Practice daily for best results. Focus on correct pronunciation and rhythm.',
          type: 'shloka_recitation',
          createdBy: adminUserDoc._id,
          startDate: now,
          endDate: oneWeekFromNow,
          status: 'active',
          requirements: {
            targetCount: 5,
            timeLimit: 30,
            difficulty: 'beginner',
            category: 'bhagavad_gita'
          },
          rewards: {
            points: 100,
            badge: {
              name: 'Shloka Beginner',
              description: 'First steps in shloka recitation'
            }
          },
          settings: {
            isPublic: true,
            maxParticipants: 100
          }
        },
        {
          title: 'Advanced Chandas Analysis',
          description: 'Analyze and identify complex chandas patterns in Vedic verses',
          instructions: 'Study the meter patterns carefully before attempting the analysis.',
          type: 'chandas_analysis',
          createdBy: adminUserDoc._id,
          startDate: now,
          endDate: oneWeekFromNow,
          status: 'active',
          requirements: {
            targetCount: 10,
            timeLimit: 45,
            difficulty: 'advanced',
            category: 'vedas'
          },
          rewards: {
            points: 250,
            badge: {
              name: 'Chandas Expert',
              description: 'Master of chandas patterns'
            }
          },
          settings: {
            isPublic: true,
            maxParticipants: 50
          }
        },
        {
          title: 'Sanskrit Translation Challenge',
          description: 'Translate 10 Sanskrit verses into English with proper meaning',
          type: 'translation',
          createdBy: adminUserDoc._id,
          startDate: now,
          endDate: twoWeeksFromNow,
          status: 'active',
          requirements: {
            targetCount: 10,
            timeLimit: 60,
            difficulty: 'intermediate',
            category: 'general'
          },
          rewards: {
            points: 150,
            badge: {
              name: 'Translator',
              description: 'Skilled in Sanskrit translation'
            }
          },
          settings: {
            isPublic: true,
            maxParticipants: 75
          }
        }
      ];
      
      for (const challengeData of testChallenges) {
        const challenge = new Challenge(challengeData);
        await challenge.save();
        console.log(`✅ Created challenge: ${challengeData.title}`);
      }
    }
    
    // Final count check
    const finalUserCount = await User.countDocuments();
    const finalGuruCount = await Guru.countDocuments(); 
    const finalChallengeCount = await Challenge.countDocuments();
    
    console.log(`🎉 Final Database Counts:
  Users: ${finalUserCount} (including 1 admin)
  Gurus: ${finalGuruCount} 
  Challenges: ${finalChallengeCount}
  
📱 Admin Dashboard should now show these real numbers!`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAndSeedData();