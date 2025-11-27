/**
 * Development Script: Update User Role to Guru
 * 
 * This script updates a user's role to 'guru' for development purposes.
 * Run with: node update-user-role.js <email>
 * 
 * Example: node update-user-role.js guru@example.com
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const updateUserToGuru = async (email) => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shlokayug');
    console.log('✓ Connected to MongoDB');

    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      console.error(`✗ User not found with email: ${email}`);
      process.exit(1);
    }

    console.log(`\nFound user: ${user.username} (${user.email})`);
    console.log(`Current role: ${user.role}`);

    if (user.role === 'guru') {
      console.log('✓ User already has guru role');
      process.exit(0);
    }

    // Update role to guru
    user.role = 'guru';
    
    // Initialize guru profile if it doesn't exist
    if (!user.guruProfile) {
      user.guruProfile = {
        credentials: [],
        experience: {
          yearsOfExperience: 0,
          description: 'Guru account created for development',
          specializations: [],
          teachingLanguages: [],
        },
        verification: {
          isVerified: true,
          verifiedAt: new Date(),
          verifiedBy: null,
        },
        applicationStatus: 'approved',
        appliedAt: new Date(),
        teachingStats: {
          totalCourses: 0,
          publishedCourses: 0,
          totalStudents: 0,
          totalEarnings: 0,
          thisMonthEarnings: 0,
          averageRating: 0,
          totalRatings: 0,
        },
      };
    } else {
      // Just update verification
      user.guruProfile.verification.isVerified = true;
      user.guruProfile.verification.verifiedAt = new Date();
      user.guruProfile.applicationStatus = 'approved';
    }

    await user.save();

    console.log('\n✓ User role updated successfully!');
    console.log(`New role: ${user.role}`);
    console.log(`Guru verified: ${user.guruProfile.verification.isVerified}`);
    console.log(`Application status: ${user.guruProfile.applicationStatus}`);
    
    console.log('\n✓ You can now create courses with this account!');
    
  } catch (error) {
    console.error('✗ Error updating user:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n✓ Disconnected from MongoDB');
    process.exit(0);
  }
};

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('Usage: node update-user-role.js <email>');
  console.error('Example: node update-user-role.js guru@example.com');
  process.exit(1);
}

updateUserToGuru(email);
