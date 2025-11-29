/**
 * Admin Guru Management Routes
 * Handles guru application review, approval, and management
 * Separated for better organization and admin efficiency
 */

const express = require('express');
const adminGuruController = require('../controllers/adminGuruController');
const { adminAuth } = require('../middleware/adminAuth');
const { validate } = require('../middleware/validation');
const { body, param } = require('express-validator');

const router = express.Router();

// Protect all routes - Only admins can access
router.use(adminAuth);

// Validation rules
const guruIdValidation = [
  param('id')
    .isMongoId()
    .withMessage('Invalid guru ID'),
  validate
];

const approvalValidation = [
  body('approvalNotes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Approval notes cannot exceed 500 characters'),
  
  body('permissions')
    .optional()
    .isArray()
    .withMessage('Permissions must be an array'),
  validate
];

const rejectionValidation = [
  body('rejectionReason')
    .notEmpty()
    .withMessage('Rejection reason is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Rejection reason must be between 10 and 500 characters'),
  validate
];

const statusUpdateValidation = [
  body('action')
    .isIn(['suspend', 'activate'])
    .withMessage('Action must be either "suspend" or "activate"'),
  
  body('reason')
    .if(body('action').equals('suspend'))
    .notEmpty()
    .withMessage('Reason is required for suspension')
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be between 10 and 500 characters'),
  validate
];

const noteValidation = [
  body('note')
    .notEmpty()
    .withMessage('Note content is required')
    .isLength({ min: 5, max: 1000 })
    .withMessage('Note must be between 5 and 1000 characters'),
  validate
];

/**
 * @swagger
 * components:
 *   schemas:
 *     GuruApplication:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         fullName:
 *           type: string
 *         credentials:
 *           type: object
 *         expertise:
 *           type: object
 *         applicationStatus:
 *           type: object
 */

/**
 * @swagger
 * /api/v1/admin/gurus/stats:
 *   get:
 *     summary: Get guru statistics for admin dashboard
 *     tags: [Admin - Guru Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Guru statistics retrieved successfully
 *       403:
 *         description: Access denied - Admin only
 */
router.get('/stats', adminGuruController.getGuruStats);

/**
 * @swagger
 * /api/v1/admin/gurus/pending:
 *   get:
 *     summary: Get all pending guru applications
 *     tags: [Admin - Guru Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [submittedAt, createdAt]
 *         description: Sort field
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Pending applications retrieved successfully
 *       403:
 *         description: Access denied - Admin only
 */
router.get('/pending', adminGuruController.getPendingApplications);

/**
 * @swagger
 * /api/v1/admin/gurus/approved:
 *   get:
 *     summary: Get all approved gurus
 *     tags: [Admin - Guru Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by username, email, or name
 *     responses:
 *       200:
 *         description: Approved gurus retrieved successfully
 *       403:
 *         description: Access denied - Admin only
 */
router.get('/approved', adminGuruController.getApprovedGurus);

/**
 * @swagger
 * /api/v1/admin/gurus/application/{id}:
 *   get:
 *     summary: Get detailed guru application for review
 *     tags: [Admin - Guru Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Guru ID
 *     responses:
 *       200:
 *         description: Application details retrieved successfully
 *       404:
 *         description: Guru application not found
 *       403:
 *         description: Access denied - Admin only
 */
router.get('/application/:id',
  guruIdValidation,
  adminGuruController.getApplicationDetails
);

/**
 * @swagger
 * /api/v1/admin/gurus/{id}/approve:
 *   post:
 *     summary: Approve guru application
 *     tags: [Admin - Guru Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Guru ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               approvalNotes:
 *                 type: string
 *                 maxLength: 500
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Guru approved successfully
 *       400:
 *         description: Invalid request or guru already processed
 *       404:
 *         description: Guru not found
 *       403:
 *         description: Access denied - Admin only
 */
router.post('/:id/approve',
  guruIdValidation,
  approvalValidation,
  adminGuruController.approveGuru
);

/**
 * @swagger
 * /api/v1/admin/gurus/{id}/reject:
 *   post:
 *     summary: Reject guru application
 *     tags: [Admin - Guru Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Guru ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rejectionReason
 *             properties:
 *               rejectionReason:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Guru rejected successfully
 *       400:
 *         description: Invalid request or missing rejection reason
 *       404:
 *         description: Guru not found
 *       403:
 *         description: Access denied - Admin only
 */
router.post('/:id/reject',
  guruIdValidation,
  rejectionValidation,
  adminGuruController.rejectGuru
);

/**
 * @swagger
 * /api/v1/admin/gurus/{id}/status:
 *   patch:
 *     summary: Update guru status (suspend/activate)
 *     tags: [Admin - Guru Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Guru ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [suspend, activate]
 *               reason:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 500
 *                 description: Required when action is 'suspend'
 *     responses:
 *       200:
 *         description: Guru status updated successfully
 *       400:
 *         description: Invalid action or missing reason for suspension
 *       404:
 *         description: Guru not found
 *       403:
 *         description: Access denied - Admin only
 */
router.patch('/:id/status',
  guruIdValidation,
  statusUpdateValidation,
  adminGuruController.updateGuruStatus
);

/**
 * @swagger
 * /api/v1/admin/gurus/{id}/notes:
 *   post:
 *     summary: Add admin note to guru profile
 *     tags: [Admin - Guru Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Guru ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - note
 *             properties:
 *               note:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 1000
 *     responses:
 *       200:
 *         description: Admin note added successfully
 *       400:
 *         description: Invalid note content
 *       404:
 *         description: Guru not found
 *       403:
 *         description: Access denied - Admin only
 */
router.post('/:id/notes',
  guruIdValidation,
  noteValidation,
  adminGuruController.addAdminNote
);

module.exports = router;