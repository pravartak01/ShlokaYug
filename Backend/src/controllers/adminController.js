/**
 * Admin Controller - Platform Management and Content Moderation
 * CRITICAL: Handles guru verification, content approval, and platform oversight
 */

const User = require('../models/User');
const Course = require('../models/Course');
const CommunityPost = require('../models/CommunityPost');
const mongoose = require('mongoose');

class AdminController {

  /**
   * Get admin dashboard statistics
   * GET /api/v1/admin/dashboard/stats
   */
  async getDashboardStats(req, res) {
    try {
      // Get platform statistics
      const [
        totalUsers,
        pendingGurus,
        verifiedGurus,
        totalCourses,
        pendingPosts,
        activeStudents
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ 'guruProfile.applicationStatus': 'pending' }),
        User.countDocuments({ role: 'guru', 'guruProfile.verification.isVerified': true }),
        Course.countDocuments(),
        CommunityPost.countDocuments({ 'moderation.status': 'pending' }),
        User.countDocuments({ role: 'student', 'metadata.lastLogin': { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } })
      ]);

      // Get recent activity
      const recentGuruApplications = await User.find({
        'guruProfile.applicationStatus': 'pending'
      })
      .select('username email profile guruProfile.verification.applicationDate')
      .sort({ 'guruProfile.verification.applicationDate': -1 })
      .limit(5);

      // Get platform health metrics
      const platformHealth = {
        userGrowthRate: 'Calculate from last month data',
        contentQualityScore: 'Based on user ratings',
        guruVerificationBacklog: pendingGurus,
        activeUserPercentage: ((activeStudents / totalUsers) * 100).toFixed(1)
      };

      res.status(200).json({
        success: true,
        data: {
          overview: {
            totalUsers,
            pendingGurus,
            verifiedGurus,
            totalCourses,
            pendingPosts,
            activeStudents
          },
          recentActivity: {
            guruApplications: recentGuruApplications
          },
          platformHealth,
          alerts: [
            pendingGurus > 5 ? { type: 'warning', message: `${pendingGurus} guru applications pending review` } : null,
            pendingPosts > 10 ? { type: 'info', message: `${pendingPosts} posts awaiting moderation` } : null
          ].filter(Boolean)
        }
      });

    } catch (error) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch dashboard statistics' }
      });
    }
  }

  /**
   * Get pending guru applications for review
   * GET /api/v1/admin/gurus/pending
   */
  async getPendingGuruApplications(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;

      const pendingApplications = await User.find({
        'guruProfile.applicationStatus': 'pending'
      })
      .select('username email profile guruProfile createdAt')
      .sort({ 'guruProfile.verification.applicationDate': -1 })
      .skip(skip)
      .limit(limit);

      const total = await User.countDocuments({ 'guruProfile.applicationStatus': 'pending' });

      const formattedApplications = pendingApplications.map(user => ({
        id: user._id,
        username: user.username,
        email: user.email,
        name: `${user.profile.firstName} ${user.profile.lastName}`,
        credentials: user.guruProfile.credentials || [],
        experience: user.guruProfile.experience || {},
        applicationDate: user.guruProfile.verification?.applicationDate || user.createdAt,
        bio: user.guruProfile.bio,
        specializations: user.guruProfile.specializations || []
      }));

      res.status(200).json({
        success: true,
        data: {
          applications: formattedApplications,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalApplications: total,
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1
          }
        }
      });

    } catch (error) {
      console.error('Get pending applications error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch pending applications' }
      });
    }
  }

  /**
   * Review and approve/reject guru application
   * POST /api/v1/admin/gurus/:userId/review
   */
  async reviewGuruApplication(req, res) {
    try {
      const { userId } = req.params;
      const { action, notes, credentials_verified, experience_verified } = req.body;

      if (!['approve', 'reject'].includes(action)) {
        return res.status(400).json({
          success: false,
          error: { message: 'Action must be either "approve" or "reject"' }
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: { message: 'User not found' }
        });
      }

      if (user.guruProfile.applicationStatus !== 'pending') {
        return res.status(400).json({
          success: false,
          error: { message: 'Application is not in pending status' }
        });
      }

      const adminId = req.user._id;
      const now = new Date();

      if (action === 'approve') {
        // Approve the guru application
        user.role = 'guru';
        user.guruProfile.applicationStatus = 'approved';
        user.guruProfile.verification.isVerified = true;
        user.guruProfile.verification.verifiedBy = adminId;
        user.guruProfile.verification.verifiedAt = now;
        user.guruProfile.verification.verificationNotes = notes;
        
        // Set verification details
        user.guruProfile.verification.credentialsVerified = credentials_verified || false;
        user.guruProfile.verification.experienceVerified = experience_verified || false;

        // Initialize teaching stats
        if (!user.guruProfile.teachingStats) {
          user.guruProfile.teachingStats = {
            totalStudents: 0,
            totalCourses: 0,
            averageRating: 0,
            totalRatings: 0,
            coursesCompleted: 0,
            totalEarnings: 0,
            thisMonthEarnings: 0
          };
        }

        await user.save();

        // TODO: Send approval email
        // await emailService.sendGuruApprovalEmail(user.email, user.profile.firstName);

        res.status(200).json({
          success: true,
          message: 'Guru application approved successfully',
          data: {
            userId: user._id,
            username: user.username,
            status: 'approved',
            verifiedAt: now,
            verifiedBy: adminId
          }
        });

      } else {
        // Reject the guru application
        user.guruProfile.applicationStatus = 'rejected';
        user.guruProfile.verification.rejectionReason = notes;
        user.guruProfile.verification.reviewedBy = adminId;
        user.guruProfile.verification.reviewedAt = now;

        await user.save();

        // TODO: Send rejection email
        // await emailService.sendGuruRejectionEmail(user.email, user.profile.firstName, notes);

        res.status(200).json({
          success: true,
          message: 'Guru application rejected',
          data: {
            userId: user._id,
            username: user.username,
            status: 'rejected',
            rejectionReason: notes,
            reviewedAt: now
          }
        });
      }

    } catch (error) {
      console.error('Review guru application error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to review application' }
      });
    }
  }

  /**
   * Get detailed guru application for review
   * GET /api/v1/admin/gurus/:userId/details
   */
  async getGuruApplicationDetails(req, res) {
    try {
      const { userId } = req.params;

      const user = await User.findById(userId)
        .select('username email profile guruProfile createdAt metadata')
        .populate('guruProfile.verification.verifiedBy', 'username profile.firstName profile.lastName');

      if (!user) {
        return res.status(404).json({
          success: false,
          error: { message: 'User not found' }
        });
      }

      // Get user's existing courses (if any)
      const existingCourses = await Course.find({ 'instructor.userId': userId })
        .select('title status createdAt');

      // Get user's community posts
      const recentPosts = await CommunityPost.find({ author: userId })
        .select('content createdAt analytics')
        .sort({ createdAt: -1 })
        .limit(5);

      const applicationDetails = {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          profile: user.profile,
          accountCreated: user.createdAt,
          lastActive: user.metadata.lastLogin
        },
        application: {
          status: user.guruProfile.applicationStatus,
          applicationDate: user.guruProfile.verification?.applicationDate,
          bio: user.guruProfile.bio,
          credentials: user.guruProfile.credentials || [],
          experience: user.guruProfile.experience || {},
          specializations: user.guruProfile.specializations || [],
          languages: user.guruProfile.languages || []
        },
        verification: user.guruProfile.verification || {},
        activityHistory: {
          existingCourses: existingCourses.length,
          recentPosts: recentPosts.length,
          courses: existingCourses,
          posts: recentPosts
        }
      };

      res.status(200).json({
        success: true,
        data: applicationDetails
      });

    } catch (error) {
      console.error('Get guru details error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch guru details' }
      });
    }
  }

  /**
   * Get all users with management capabilities
   * GET /api/v1/admin/users
   */
  async getAllUsers(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const role = req.query.role; // Filter by role
      const search = req.query.search; // Search by username/email
      const status = req.query.status; // active, suspended, etc.

      const skip = (page - 1) * limit;
      
      // Build query
      const query = {};
      if (role) query.role = role;
      if (status) query['metadata.status'] = status;
      if (search) {
        query.$or = [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { 'profile.firstName': { $regex: search, $options: 'i' } },
          { 'profile.lastName': { $regex: search, $options: 'i' } }
        ];
      }

      const [users, total] = await Promise.all([
        User.find(query)
          .select('username email profile role metadata guruProfile.verification.isVerified createdAt')
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        User.countDocuments(query)
      ]);

      res.status(200).json({
        success: true,
        data: {
          users: users.map(user => ({
            id: user._id,
            username: user.username,
            email: user.email,
            name: `${user.profile.firstName} ${user.profile.lastName}`,
            role: user.role,
            isVerified: user.role === 'guru' ? user.guruProfile?.verification?.isVerified : true,
            status: user.metadata.status || 'active',
            joinDate: user.createdAt,
            lastActive: user.metadata.lastLogin
          })),
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalUsers: total,
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1
          }
        }
      });

    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch users' }
      });
    }
  }

  /**
   * Suspend or activate a user
   * POST /api/v1/admin/users/:userId/moderate
   */
  async moderateUser(req, res) {
    try {
      const { userId } = req.params;
      const { action, reason, duration } = req.body; // suspend, activate, ban

      if (!['suspend', 'activate', 'ban'].includes(action)) {
        return res.status(400).json({
          success: false,
          error: { message: 'Invalid action. Must be suspend, activate, or ban' }
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: { message: 'User not found' }
        });
      }

      // Prevent admin from moderating themselves
      if (userId === req.user._id.toString()) {
        return res.status(400).json({
          success: false,
          error: { message: 'Cannot moderate your own account' }
        });
      }

      const now = new Date();

      switch (action) {
        case 'suspend':
          user.metadata.status = 'suspended';
          user.metadata.suspendedAt = now;
          user.metadata.suspendedBy = req.user._id;
          user.metadata.suspensionReason = reason;
          if (duration) {
            user.metadata.suspensionExpiresAt = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);
          }
          break;

        case 'activate':
          user.metadata.status = 'active';
          user.metadata.suspendedAt = undefined;
          user.metadata.suspendedBy = undefined;
          user.metadata.suspensionReason = undefined;
          user.metadata.suspensionExpiresAt = undefined;
          break;

        case 'ban':
          user.metadata.status = 'banned';
          user.metadata.bannedAt = now;
          user.metadata.bannedBy = req.user._id;
          user.metadata.banReason = reason;
          user.metadata.isActive = false;
          break;
      }

      await user.save();

      res.status(200).json({
        success: true,
        message: `User ${action}d successfully`,
        data: {
          userId: user._id,
          username: user.username,
          action,
          status: user.metadata.status,
          reason
        }
      });

    } catch (error) {
      console.error('Moderate user error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to moderate user' }
      });
    }
  }

  /**
   * Get content moderation queue
   * GET /api/v1/admin/content/moderation
   */
  async getContentModerationQueue(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const contentType = req.query.type; // 'course', 'post'

      const skip = (page - 1) * limit;

      let contentItems = [];
      let totalItems = 0;

      if (!contentType || contentType === 'course') {
        // Get courses pending approval
        const [courses, courseCount] = await Promise.all([
          Course.find({ 'moderation.status': { $in: ['pending', 'flagged'] } })
            .populate('instructor.userId', 'username profile.firstName profile.lastName')
            .select('title description instructor status moderation createdAt')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
          Course.countDocuments({ 'moderation.status': { $in: ['pending', 'flagged'] } })
        ]);

        contentItems = courses.map(course => ({
          id: course._id,
          type: 'course',
          title: course.title,
          description: course.description,
          author: {
            id: course.instructor.userId._id,
            username: course.instructor.userId.username,
            name: `${course.instructor.userId.profile.firstName} ${course.instructor.userId.profile.lastName}`
          },
          status: course.moderation?.status || 'pending',
          createdAt: course.createdAt,
          moderationFlags: course.moderation?.flags || []
        }));
        totalItems = courseCount;
      }

      res.status(200).json({
        success: true,
        data: {
          items: contentItems,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalItems / limit),
            totalItems,
            hasNext: page < Math.ceil(totalItems / limit),
            hasPrev: page > 1
          }
        }
      });

    } catch (error) {
      console.error('Get moderation queue error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch moderation queue' }
      });
    }
  }
}

module.exports = new AdminController();