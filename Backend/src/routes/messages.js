/**
 * Message History Routes
 * Handles all endpoints related to chatbot conversation history
 */

const express = require('express');
const router = express.Router();
const {
  saveMessage,
  getUserHistory,
  getRecentSessions,
  getSessionConversation,
  getChandasAnalytics,
  rateMessage,
  deleteMessage,
  clearUserHistory
} = require('../controllers/messageController');

const {
  validateSaveMessage,
  validateGetHistory,
  validateGetSessions,
  validateGetSessionConversation,
  validateRateMessage,
  validateDeleteMessage,
  validateClearHistory,
  validateChandasAnalysis
} = require('../middleware/messageValidation');

const { auth } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(auth);

/**
 * @route   POST /api/messages/history
 * @desc    Save a new message to user's conversation history
 * @access  Private
 * @body    {
 *   message_history: string (required),
 *   session_id?: string,
 *   message_type?: 'user_input' | 'bot_response' | 'analysis_result',
 *   analysis_data?: {
 *     input_text?: string,
 *     chandas_name?: string,
 *     syllable_count?: number,
 *     laghu_guru_pattern?: string,
 *     confidence_score?: number,
 *     syllable_breakdown?: Array,
 *     identification_process?: Array
 *   },
 *   context?: {
 *     conversation_topic?: string,
 *     user_intent?: string
 *   }
 * }
 */
router.post('/history', [...validateSaveMessage, ...validateChandasAnalysis], saveMessage);

/**
 * @route   GET /api/messages/history
 * @desc    Get user's message history with optional filters
 * @access  Private
 * @query   {
 *   session_id?: string,
 *   limit?: number (1-500, default: 50),
 *   page?: number (default: 1),
 *   message_type?: 'user_input' | 'bot_response' | 'analysis_result',
 *   start_date?: ISO8601 date,
 *   end_date?: ISO8601 date
 * }
 */
router.get('/history', validateGetHistory, getUserHistory);

/**
 * @route   GET /api/messages/sessions
 * @desc    Get user's recent conversation sessions
 * @access  Private
 * @query   {
 *   limit?: number (1-50, default: 10)
 * }
 */
router.get('/sessions', validateGetSessions, getRecentSessions);

/**
 * @route   GET /api/messages/sessions/:sessionId
 * @desc    Get specific session conversation
 * @access  Private
 * @param   sessionId - The session ID to retrieve
 * @query   {
 *   limit?: number (1-1000, default: 100)
 * }
 */
router.get('/sessions/:sessionId', validateGetSessionConversation, getSessionConversation);

/**
 * @route   GET /api/messages/analytics/chandas
 * @desc    Get chandas analysis statistics for the user
 * @access  Private
 */
router.get('/analytics/chandas', getChandasAnalytics);

/**
 * @route   PUT /api/messages/history/:messageId/rate
 * @desc    Rate a specific message interaction
 * @access  Private
 * @param   messageId - The message ID to rate
 * @body    {
 *   rating: number (1-5, required),
 *   feedback?: string (max 1000 chars)
 * }
 */
router.put('/history/:messageId/rate', validateRateMessage, rateMessage);

/**
 * @route   DELETE /api/messages/history/:messageId
 * @desc    Delete a specific message from history
 * @access  Private
 * @param   messageId - The message ID to delete
 */
router.delete('/history/:messageId', validateDeleteMessage, deleteMessage);

/**
 * @route   DELETE /api/messages/history
 * @desc    Clear user's message history (optionally by session)
 * @access  Private
 * @query   {
 *   session_id?: string - If provided, only clears that session
 * }
 */
router.delete('/history', validateClearHistory, clearUserHistory);

// Health check endpoint for message history service
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Message history service is healthy',
    timestamp: new Date().toISOString(),
    service: 'message-history-api'
  });
});

module.exports = router;