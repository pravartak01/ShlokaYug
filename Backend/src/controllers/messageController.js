/**
 * Message History Controller
 * Handles chatbot conversation history operations
 */

const MessageHistory = require('../models/MessageHistory');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const crypto = require('crypto');

// @desc    Save a new message to history
// @route   POST /api/messages/history
// @access  Private (User must be authenticated)
const saveMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { 
      message_history, 
      session_id, 
      message_type, 
      analysis_data,
      context 
    } = req.body;

    // Generate session_id if not provided
    const sessionId = session_id || `session_${req.user.id}_${Date.now()}`;

    // Create new message history entry
    const messageEntry = new MessageHistory({
      user_id: req.user.id,
      message_history: message_history,
      conversation_metadata: {
        session_id: sessionId,
        message_type: message_type || 'user_input',
        timestamp: new Date(),
        analysis_data: analysis_data || {},
        context: context || {}
      },
      processing_info: {
        response_time_ms: req.body.response_time_ms,
        model_version: req.body.model_version || 'v1.0',
        api_version: req.body.api_version || '1.0'
      }
    });

    await messageEntry.save();

    res.status(201).json({
      success: true,
      message: 'Message saved to history successfully',
      data: {
        message_id: messageEntry._id,
        session_id: sessionId,
        timestamp: messageEntry.conversation_metadata.timestamp
      }
    });

  } catch (error) {
    console.error('Error saving message to history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save message to history',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get user's message history
// @route   GET /api/messages/history
// @access  Private (User must be authenticated)
const getUserHistory = async (req, res) => {
  try {
    const { 
      session_id, 
      limit = 50, 
      page = 1, 
      message_type,
      start_date,
      end_date 
    } = req.query;

    // Build query
    const query = { user_id: req.user.id };
    
    if (session_id) {
      query['conversation_metadata.session_id'] = session_id;
    }
    
    if (message_type) {
      query['conversation_metadata.message_type'] = message_type;
    }

    // Date range filter
    if (start_date || end_date) {
      query['conversation_metadata.timestamp'] = {};
      if (start_date) {
        query['conversation_metadata.timestamp'].$gte = new Date(start_date);
      }
      if (end_date) {
        query['conversation_metadata.timestamp'].$lte = new Date(end_date);
      }
    }

    const skip = (page - 1) * limit;
    
    // Get messages with pagination
    const messages = await MessageHistory.find(query)
      .sort({ 'conversation_metadata.timestamp': -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    // Get total count for pagination
    const totalMessages = await MessageHistory.countDocuments(query);

    res.status(200).json({
      success: true,
      message: 'Message history retrieved successfully',
      data: {
        messages,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(totalMessages / limit),
          total_messages: totalMessages,
          messages_per_page: parseInt(limit),
          has_next_page: (page * limit) < totalMessages,
          has_prev_page: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error retrieving message history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve message history',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get user's recent conversation sessions
// @route   GET /api/messages/sessions
// @access  Private (User must be authenticated)
const getRecentSessions = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const sessions = await MessageHistory.getRecentSessions(req.user.id, parseInt(limit));

    res.status(200).json({
      success: true,
      message: 'Recent sessions retrieved successfully',
      data: {
        sessions,
        total_sessions: sessions.length
      }
    });

  } catch (error) {
    console.error('Error retrieving recent sessions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve recent sessions',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get specific session conversation
// @route   GET /api/messages/sessions/:sessionId
// @access  Private (User must be authenticated)
const getSessionConversation = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { limit = 100 } = req.query;

    const messages = await MessageHistory.getUserHistory(req.user.id, parseInt(limit), sessionId);

    if (!messages || messages.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No messages found for this session'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Session conversation retrieved successfully',
      data: {
        session_id: sessionId,
        messages,
        message_count: messages.length
      }
    });

  } catch (error) {
    console.error('Error retrieving session conversation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve session conversation',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Get chandas analysis statistics for user
// @route   GET /api/messages/analytics/chandas
// @access  Private (User must be authenticated)
const getChandasAnalytics = async (req, res) => {
  try {
    const analytics = await MessageHistory.getChandasAnalyticsForUser(req.user.id);

    // Calculate additional metrics
    const totalAnalyses = analytics.reduce((sum, item) => sum + item.count, 0);
    const uniqueChandas = analytics.length;
    const mostAnalyzedChandas = analytics[0] || null;

    res.status(200).json({
      success: true,
      message: 'Chandas analytics retrieved successfully',
      data: {
        summary: {
          total_analyses: totalAnalyses,
          unique_chandas_analyzed: uniqueChandas,
          most_analyzed_chandas: mostAnalyzedChandas
        },
        chandas_breakdown: analytics
      }
    });

  } catch (error) {
    console.error('Error retrieving chandas analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve chandas analytics',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Rate a message interaction
// @route   PUT /api/messages/history/:messageId/rate
// @access  Private (User must be authenticated)
const rateMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { rating, feedback } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const message = await MessageHistory.findOne({
      _id: messageId,
      user_id: req.user.id
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    await message.rateInteraction(rating, feedback);

    res.status(200).json({
      success: true,
      message: 'Message rated successfully',
      data: {
        message_id: messageId,
        rating: rating,
        feedback: feedback
      }
    });

  } catch (error) {
    console.error('Error rating message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to rate message',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Delete a specific message from history
// @route   DELETE /api/messages/history/:messageId
// @access  Private (User must be authenticated)
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    const message = await MessageHistory.findOneAndDelete({
      _id: messageId,
      user_id: req.user.id
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
      data: {
        deleted_message_id: messageId
      }
    });

  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// @desc    Clear entire message history for user
// @route   DELETE /api/messages/history
// @access  Private (User must be authenticated)
const clearUserHistory = async (req, res) => {
  try {
    const { session_id } = req.query;

    let query = { user_id: req.user.id };
    
    if (session_id) {
      query['conversation_metadata.session_id'] = session_id;
    }

    const result = await MessageHistory.deleteMany(query);

    res.status(200).json({
      success: true,
      message: session_id 
        ? 'Session history cleared successfully' 
        : 'All message history cleared successfully',
      data: {
        deleted_count: result.deletedCount,
        session_id: session_id || 'all'
      }
    });

  } catch (error) {
    console.error('Error clearing message history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear message history',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

module.exports = {
  saveMessage,
  getUserHistory,
  getRecentSessions,
  getSessionConversation,
  getChandasAnalytics,
  rateMessage,
  deleteMessage,
  clearUserHistory
};