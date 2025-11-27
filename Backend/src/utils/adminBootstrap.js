/**
 * Admin Bootstrap System
 * CRITICAL: Creates the initial admin user from environment variables
 * This solves the "who watches the watchers" problem
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

/**
 * Create the first admin user if none exists
 * This function runs on server startup
 */
async function bootstrapAdmin() {
  try {
    console.log('🔐 Checking for admin users...');
    
    // Check if any admin users exist
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.username);
      return {
        success: true,
        message: 'Admin user already exists',
        admin: {
          username: existingAdmin.username,
          email: existingAdmin.email
        }
      };
    }
    
    // No admin found, create from environment variables
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@shlokayu.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'ShlokaYug@Admin2025!';
    const adminUsername = process.env.ADMIN_USERNAME || 'shlokayu_admin';
    
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      console.log('⚠️  Using default admin credentials. Please set ADMIN_EMAIL and ADMIN_PASSWORD in environment');
    }
    
    // Create admin user
    const adminUser = new User({
      username: adminUsername,
      email: adminEmail,
      password: adminPassword, // Will be hashed by pre-save middleware
      role: 'admin',
      profile: {
        firstName: 'ShlokaYug',
        lastName: 'Administrator',
        phoneNumber: '+91-9999999999'
      },
      verification: {
        isEmailVerified: true,
        emailVerifiedAt: new Date()
      },
      metadata: {
        isActive: true,
        accountCreated: new Date(),
        createdBy: 'system_bootstrap',
        adminNotes: 'Bootstrap admin user created during system initialization'
      },
      // Admin-specific profile
      adminProfile: {
        permissions: [
          'manage_users',
          'verify_gurus', 
          'moderate_content',
          'view_analytics',
          'system_admin',
          'emergency_controls'
        ],
        accessLevel: 'super_admin',
        createdAt: new Date(),
        lastLogin: null
      }
    });
    
    await adminUser.save();
    
    console.log('🎉 Bootstrap admin user created successfully!');
    console.log('📧 Email:', adminEmail);
    console.log('👤 Username:', adminUsername);
    console.log('🔑 Password: [Set via environment - check ADMIN_PASSWORD]');
    console.log('');
    console.log('🚨 SECURITY NOTICE:');
    console.log('   1. Change the admin password immediately after first login');
    console.log('   2. Set strong ADMIN_EMAIL and ADMIN_PASSWORD environment variables');
    console.log('   3. Admin login URL: /api/v1/auth/login');
    console.log('   4. Admin dashboard URL: /api/v1/admin/dashboard/stats');
    
    return {
      success: true,
      message: 'Bootstrap admin user created',
      admin: {
        username: adminUsername,
        email: adminEmail,
        id: adminUser._id
      },
      securityNotes: [
        'Change admin password immediately',
        'Set environment variables for production',
        'Review admin permissions regularly'
      ]
    };
    
  } catch (error) {
    console.error('❌ Admin bootstrap failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Verify admin user exists and is accessible
 */
async function verifyAdminAccess() {
  try {
    const adminCount = await User.countDocuments({ role: 'admin' });
    const activeAdmins = await User.countDocuments({ 
      role: 'admin', 
      'metadata.isActive': true 
    });
    
    return {
      success: true,
      adminCount,
      activeAdmins,
      status: adminCount > 0 ? 'configured' : 'needs_bootstrap'
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Create additional admin users (for development/team)
 */
async function createAdminUser(adminData, creatorAdminId) {
  try {
    const { username, email, password, firstName, lastName, permissions = [] } = adminData;
    
    // Check if user already exists
    const existing = await User.findOne({
      $or: [{ email }, { username }]
    });
    
    if (existing) {
      return {
        success: false,
        error: 'User with this email or username already exists'
      };
    }
    
    // Create new admin
    const newAdmin = new User({
      username,
      email,
      password, // Will be hashed by pre-save middleware
      role: 'admin',
      profile: {
        firstName: firstName || 'Admin',
        lastName: lastName || 'User'
      },
      verification: {
        isEmailVerified: true,
        emailVerifiedAt: new Date()
      },
      metadata: {
        isActive: true,
        accountCreated: new Date(),
        createdBy: creatorAdminId
      },
      adminProfile: {
        permissions: permissions.length > 0 ? permissions : [
          'verify_gurus',
          'moderate_content', 
          'view_analytics'
        ],
        accessLevel: 'admin',
        createdAt: new Date(),
        createdBy: creatorAdminId
      }
    });
    
    await newAdmin.save();
    
    return {
      success: true,
      message: 'Admin user created successfully',
      admin: {
        id: newAdmin._id,
        username: newAdmin.username,
        email: newAdmin.email,
        permissions: newAdmin.adminProfile.permissions
      }
    };
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Emergency admin access (for development only)
 * WARNING: Only use in development environment
 */
async function emergencyAdminAccess() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Emergency admin access not allowed in production');
  }
  
  try {
    // Create temporary admin with emergency credentials
    const emergencyAdmin = {
      username: 'emergency_admin',
      email: 'emergency@shlokayu.dev',
      password: 'Emergency@2025!',
      firstName: 'Emergency',
      lastName: 'Admin'
    };
    
    return await createAdminUser(emergencyAdmin, 'emergency_system');
    
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  bootstrapAdmin,
  verifyAdminAccess,
  createAdminUser,
  emergencyAdminAccess
};