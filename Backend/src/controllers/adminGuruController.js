/**
 * Admin Guru Management Controller
 * Handles guru application review, approval, rejection, and management
 * Separated from regular user management for efficiency
 */

const Guru = require('../models/Guru');
const User = require('../models/User');
const Course = require('../models/Course');
const mongoose = require('mongoose');

class AdminGuruController {
  /**
   * Get all pending guru applications
   * GET /api/v1/admin/gurus/pending
   */
  async getPendingApplications(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
      const sortBy = req.query.sortBy || 'submittedAt';
      const order = req.query.order === 'desc' ? -1 : 1;

      // Build sort object
      const sortObj = {};
      sortObj[`applicationStatus.${sortBy}`] = order;

      const pendingApplications = await Guru.find({
        'applicationStatus.status': 'submitted'
      })
      .select('username email profile credentials expertise applicationStatus createdAt')
      .sort(sortObj)
      .skip(skip)
      .limit(limit);

      const totalApplications = await Guru.countDocuments({ 'applicationStatus.status': 'submitted' });

      const formattedApplications = pendingApplications.map(guru => ({
        id: guru._id,
        username: guru.username,
        email: guru.email,
        fullName: guru.fullName,
        profilePicture: guru.profile.profilePicture,
        bio: guru.profile.bio,
        location: guru.profile.location,
        credentials: {
          education: guru.credentials.education,
          certifications: guru.credentials.certifications,
          teachingExperience: guru.credentials.teachingExperience
        },
        expertise: {
          subjects: guru.expertise.subjects,
          specializations: guru.expertise.specializations,
          languagesKnown: guru.expertise.languagesKnown,
          teachingStyle: guru.expertise.teachingStyle
        },
        applicationStatus: guru.applicationStatus,
        applicationAge: guru.applicationAge,
        submittedAt: guru.applicationStatus.submittedAt,
        createdAt: guru.createdAt
      }));

      res.status(200).json({
        success: true,
        data: {
          applications: formattedApplications,
          pagination: {
            totalApplications,
            totalPages: Math.ceil(totalApplications / limit),
            currentPage: page,
            hasNextPage: page < Math.ceil(totalApplications / limit),
            hasPrevPage: page > 1
          }
        }
      });

    } catch (error) {
      console.error('Get pending applications error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch pending guru applications' }
      });
    }
  }

  /**
   * Get detailed guru application for review
   * GET /api/v1/admin/gurus/application/:id
   */
  async getApplicationDetails(req, res) {
    try {
      const { id } = req.params;

      const guru = await Guru.findById(id);
      
      if (!guru) {
        return res.status(404).json({
          success: false,
          error: { message: 'Guru application not found' }
        });
      }

      // Get additional analytics about this guru application
      const applicationAnalytics = {
        profileCompleteness: this.calculateProfileCompleteness(guru),
        credentialQuality: this.assessCredentialQuality(guru),
        riskScore: this.calculateRiskScore(guru)
      };

      res.status(200).json({
        success: true,
        data: {
          guru,
          analytics: applicationAnalytics
        }
      });

    } catch (error) {
      console.error('Get application details error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch application details' }
      });
    }
  }

  /**
   * Approve guru application
   * POST /api/v1/admin/gurus/:id/approve
   */
  async approveGuru(req, res) {
    try {
      const { id } = req.params;
      const { approvalNotes = '', permissions = [] } = req.body;
      const adminId = req.user.id;

      const guru = await Guru.findById(id);
      
      if (!guru) {
        return res.status(404).json({
          success: false,
          error: { message: 'Guru not found' }
        });
      }

      if (guru.applicationStatus.status !== 'submitted') {
        return res.status(400).json({
          success: false,
          error: { message: 'Only submitted applications can be approved' }
        });
      }

      // Approve the guru
      guru.approve(adminId, approvalNotes);

      // Set specific permissions if provided
      if (permissions.length > 0) {
        guru.accountStatus.permissions = permissions;
      }

      await guru.save();

      // Log the approval action
      console.log(`✅ Guru approved: ${guru.username} by admin: ${adminId}`);

      // TODO: Send approval notification email to guru

      res.status(200).json({
        success: true,
        message: 'Guru application approved successfully',
        data: {
          guru: {
            id: guru._id,
            username: guru.username,
            email: guru.email,
            fullName: guru.fullName,
            applicationStatus: guru.applicationStatus,
            accountStatus: guru.accountStatus
          }
        }
      });

    } catch (error) {
      console.error('Approve guru error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to approve guru application' }
      });
    }
  }

  /**
   * Reject guru application
   * POST /api/v1/admin/gurus/:id/reject
   */
  async rejectGuru(req, res) {
    try {
      const { id } = req.params;
      const { rejectionReason } = req.body;
      const adminId = req.user.id;

      if (!rejectionReason || rejectionReason.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: { message: 'Rejection reason is required' }
        });
      }

      const guru = await Guru.findById(id);
      
      if (!guru) {
        return res.status(404).json({
          success: false,
          error: { message: 'Guru not found' }
        });
      }

      if (guru.applicationStatus.status !== 'submitted') {
        return res.status(400).json({
          success: false,
          error: { message: 'Only submitted applications can be rejected' }
        });
      }

      // Reject the guru
      guru.reject(adminId, rejectionReason);
      await guru.save();

      // Log the rejection action
      console.log(`❌ Guru rejected: ${guru.username} by admin: ${adminId}. Reason: ${rejectionReason}`);

      // TODO: Send rejection notification email to guru

      res.status(200).json({
        success: true,
        message: 'Guru application rejected',
        data: {
          guru: {
            id: guru._id,
            username: guru.username,
            email: guru.email,
            applicationStatus: guru.applicationStatus
          }
        }
      });

    } catch (error) {
      console.error('Reject guru error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to reject guru application' }
      });
    }
  }

  /**
   * Get all approved gurus
   * GET /api/v1/admin/gurus/approved
   */
  async getApprovedGurus(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const skip = (page - 1) * limit;
      const search = req.query.search || '';

      let query = { 'accountStatus.isApproved': true };

      // Add search functionality
      if (search) {
        query.$or = [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { 'profile.firstName': { $regex: search, $options: 'i' } },
          { 'profile.lastName': { $regex: search, $options: 'i' } }
        ];
      }

      const approvedGurus = await Guru.find(query)
        .select('username email profile expertise performance accountStatus createdAt')
        .sort({ 'applicationStatus.reviewedAt': -1 })
        .skip(skip)
        .limit(limit);

      const total = await Guru.countDocuments(query);

      const formattedGurus = approvedGurus.map(guru => ({
        id: guru._id,
        username: guru.username,
        email: guru.email,
        fullName: guru.fullName,
        profilePicture: guru.profile.profilePicture,
        subjects: guru.expertise.subjects,
        specializations: guru.expertise.specializations,
        performance: guru.performance,
        approvedAt: guru.applicationStatus.reviewedAt,
        isActive: guru.accountStatus.isActive,
        canTeach: guru.accountStatus.canTeach
      }));

      res.status(200).json({
        success: true,
        data: {
          gurus: formattedGurus,
          pagination: {
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            hasNextPage: page < Math.ceil(total / limit),
            hasPrevPage: page > 1
          }
        }
      });

    } catch (error) {
      console.error('Get approved gurus error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch approved gurus' }
      });
    }
  }

  /**
   * Suspend/Activate guru
   * PATCH /api/v1/admin/gurus/:id/status
   */
  async updateGuruStatus(req, res) {
    try {
      const { id } = req.params;
      const { action, reason = '' } = req.body; // action: 'suspend' | 'activate'
      const adminId = req.user.id;

      const guru = await Guru.findById(id);
      
      if (!guru) {
        return res.status(404).json({
          success: false,
          error: { message: 'Guru not found' }
        });
      }

      if (!guru.accountStatus.isApproved) {
        return res.status(400).json({
          success: false,
          error: { message: 'Cannot modify status of unapproved guru' }
        });
      }

      if (action === 'suspend') {
        if (!reason.trim()) {
          return res.status(400).json({
            success: false,
            error: { message: 'Suspension reason is required' }
          });
        }

        guru.accountStatus.isActive = false;
        guru.accountStatus.canCreateContent = false;
        guru.accountStatus.canTeach = false;
        guru.accountStatus.suspensionReason = reason;
        guru.accountStatus.suspendedAt = new Date();
        guru.accountStatus.suspendedBy = adminId;

        console.log(`🚫 Guru suspended: ${guru.username} by admin: ${adminId}. Reason: ${reason}`);

      } else if (action === 'activate') {
        guru.accountStatus.isActive = true;
        guru.accountStatus.canCreateContent = true;
        guru.accountStatus.canTeach = true;
        guru.accountStatus.suspensionReason = undefined;
        guru.accountStatus.suspendedAt = undefined;
        guru.accountStatus.suspendedBy = undefined;

        console.log(`✅ Guru activated: ${guru.username} by admin: ${adminId}`);
      } else {
        return res.status(400).json({
          success: false,
          error: { message: 'Invalid action. Use "suspend" or "activate"' }
        });
      }

      await guru.save();

      res.status(200).json({
        success: true,
        message: `Guru ${action}d successfully`,
        data: {
          guru: {
            id: guru._id,
            username: guru.username,
            accountStatus: guru.accountStatus
          }
        }
      });

    } catch (error) {
      console.error('Update guru status error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to update guru status' }
      });
    }
  }

  /**
   * Add admin notes to guru
   * POST /api/v1/admin/gurus/:id/notes
   */
  async addAdminNote(req, res) {
    try {
      const { id } = req.params;
      const { note } = req.body;
      const adminId = req.user.id;

      if (!note || note.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: { message: 'Note content is required' }
        });
      }

      const guru = await Guru.findById(id);
      
      if (!guru) {
        return res.status(404).json({
          success: false,
          error: { message: 'Guru not found' }
        });
      }

      guru.applicationStatus.adminNotes.push({
        note: note.trim(),
        addedBy: adminId,
        addedAt: new Date()
      });

      await guru.save();

      res.status(200).json({
        success: true,
        message: 'Admin note added successfully',
        data: {
          note: guru.applicationStatus.adminNotes[guru.applicationStatus.adminNotes.length - 1]
        }
      });

    } catch (error) {
      console.error('Add admin note error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to add admin note' }
      });
    }
  }

  /**
   * Get guru statistics for admin dashboard
   * GET /api/v1/admin/gurus/stats
   */
  async getGuruStats(req, res) {
    try {
      const [
        totalGurus,
        pendingApplications,
        approvedGurus,
        rejectedGurus,
        suspendedGurus,
        activeGurus,
        totalCourses,
        totalStudents
      ] = await Promise.all([
        Guru.countDocuments(),
        Guru.countDocuments({ 'applicationStatus.status': 'submitted' }),
        Guru.countDocuments({ 'accountStatus.isApproved': true }),
        Guru.countDocuments({ 'applicationStatus.status': 'rejected' }),
        Guru.countDocuments({ 'accountStatus.isActive': false, 'accountStatus.isApproved': true }),
        Guru.countDocuments({ 'accountStatus.isActive': true, 'accountStatus.isApproved': true }),
        Course.countDocuments(),
        // Assuming we have a student enrollment count somewhere
        0 // TODO: Calculate from course enrollments
      ]);

      // Get recent activity
      const recentApplications = await Guru.find({
        'applicationStatus.status': 'submitted'
      })
      .select('username profile applicationStatus')
      .sort({ 'applicationStatus.submittedAt': -1 })
      .limit(5);

      // Calculate approval rates
      const approvalRate = totalGurus > 0 ? ((approvedGurus / totalGurus) * 100).toFixed(1) : 0;
      const rejectionRate = totalGurus > 0 ? ((rejectedGurus / totalGurus) * 100).toFixed(1) : 0;

      res.status(200).json({
        success: true,
        data: {
          overview: {
            totalGurus,
            pendingApplications,
            approvedGurus,
            rejectedGurus,
            suspendedGurus,
            activeGurus,
            totalCourses,
            totalStudents
          },
          rates: {
            approvalRate: parseFloat(approvalRate),
            rejectionRate: parseFloat(rejectionRate),
            activeRate: approvedGurus > 0 ? ((activeGurus / approvedGurus) * 100).toFixed(1) : 0
          },
          recentActivity: {
            applications: recentApplications.map(guru => ({
              id: guru._id,
              username: guru.username,
              fullName: guru.fullName,
              submittedAt: guru.applicationStatus.submittedAt
            }))
          }
        }
      });

    } catch (error) {
      console.error('Get guru stats error:', error);
      res.status(500).json({
        success: false,
        error: { message: 'Failed to fetch guru statistics' }
      });
    }
  }

  // Helper methods
  calculateProfileCompleteness(guru) {
    let score = 0;
    const maxScore = 100;

    // Basic info (20 points)
    if (guru.profile.firstName) score += 5;
    if (guru.profile.lastName) score += 5;
    if (guru.profile.phoneNumber) score += 5;
    if (guru.profile.bio) score += 5;

    // Education (30 points)
    if (guru.credentials.education.length > 0) score += 20;
    if (guru.credentials.education.some(edu => edu.documents && edu.documents.length > 0)) score += 10;

    // Experience (20 points)
    if (guru.credentials.teachingExperience.totalYears > 0) score += 10;
    if (guru.credentials.teachingExperience.previousInstitutions.length > 0) score += 10;

    // Expertise (20 points)
    if (guru.expertise.subjects.length > 0) score += 10;
    if (guru.expertise.specializations.length > 0) score += 5;
    if (guru.expertise.languagesKnown.length > 0) score += 5;

    // Additional info (10 points)
    if (guru.credentials.certifications.length > 0) score += 5;
    if (guru.profile.profilePicture) score += 5;

    return Math.min(score, maxScore);
  }

  assessCredentialQuality(guru) {
    let quality = 'medium';
    let score = 0;

    // Education quality
    if (guru.credentials.education.length >= 2) score += 2;
    if (guru.credentials.education.some(edu => edu.documents && edu.documents.length > 0)) score += 3;

    // Experience quality
    if (guru.credentials.teachingExperience.totalYears >= 5) score += 3;
    if (guru.credentials.teachingExperience.totalYears >= 10) score += 2;

    // Certifications
    if (guru.credentials.certifications.length > 0) score += 2;

    if (score >= 8) quality = 'high';
    else if (score <= 4) quality = 'low';

    return { quality, score };
  }

  calculateRiskScore(guru) {
    let riskScore = 0;

    // No phone number verification
    if (!guru.verification.isPhoneVerified) riskScore += 1;

    // No education documents
    if (!guru.credentials.education.some(edu => edu.documents && edu.documents.length > 0)) riskScore += 2;

    // Very low experience
    if (guru.credentials.teachingExperience.totalYears === 0) riskScore += 2;

    // No bio
    if (!guru.profile.bio || guru.profile.bio.length < 50) riskScore += 1;

    // Recent application (might be rushing)
    const daysSinceCreation = Math.floor((Date.now() - guru.createdAt) / (1000 * 60 * 60 * 24));
    if (daysSinceCreation < 1) riskScore += 1;

    return Math.min(riskScore, 10); // Max risk score of 10
  }
}

module.exports = new AdminGuruController();