/**
 * MessageHistory Model - For storing chatbot conversation history
 * Stores user interactions with the chatbot for chandas analysis
 */

const mongoose = require('mongoose');

const messageHistorySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  },
  message_history: {
    type: String,
    required: [true, 'Message history is required'],
    trim: true
  },
  
  // Additional metadata for better chatbot functionality
  conversation_metadata: {
    session_id: {
      type: String,
      required: true,
      index: true
    },
    message_type: {
      type: String,
      enum: ['user_input', 'bot_response', 'analysis_result'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    },
    
    // For chandas analysis specific data
    analysis_data: {
      input_text: String,
      chandas_name: String,
      syllable_count: Number,
      laghu_guru_pattern: String,
      confidence_score: Number,
      identification_steps: [{
        step_number: Number,
        step_name: String,
        description: String,
        result: String
      }]
    },
    
    // Context information
    context: {
      previous_message_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MessageHistory'
      },
      conversation_topic: String,
      user_intent: String
    }
  },
  
  // Performance and debugging
  processing_info: {
    response_time_ms: Number,
    model_version: String,
    api_version: String,
    error_occurred: {
      type: Boolean,
      default: false
    },
    error_details: String
  },
  
  // User engagement metrics
  user_interaction: {
    user_rating: {
      type: Number,
      min: 1,
      max: 5
    },
    user_feedback: String,
    was_helpful: Boolean,
    follow_up_questions: [String]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
messageHistorySchema.index({ user_id: 1, 'conversation_metadata.timestamp': -1 });
messageHistorySchema.index({ 'conversation_metadata.session_id': 1 });
messageHistorySchema.index({ 'conversation_metadata.message_type': 1 });
messageHistorySchema.index({ createdAt: -1 }); // For recent messages
messageHistorySchema.index({ 'conversation_metadata.analysis_data.chandas_name': 1 }); // For analytics

// Virtual for formatted timestamp
messageHistorySchema.virtual('formattedTimestamp').get(function() {
  return this.conversation_metadata.timestamp.toISOString();
});

// Virtual for conversation duration (if it's the last message in a session)
messageHistorySchema.virtual('conversationDuration').get(function() {
  if (this.conversation_metadata.session_id) {
    // This would need to be calculated by comparing with first message of session
    return null; // Implement if needed
  }
  return null;
});

// Static method to get user's conversation history
messageHistorySchema.statics.getUserHistory = function(userId, limit = 50, sessionId = null) {
  const query = { user_id: userId };
  if (sessionId) {
    query['conversation_metadata.session_id'] = sessionId;
  }
  
  return this.find(query)
    .sort({ 'conversation_metadata.timestamp': -1 })
    .limit(limit)
    .populate('user_id', 'username profile.firstName profile.lastName');
};

// Static method to get recent conversations by session
messageHistorySchema.statics.getRecentSessions = function(userId, limit = 10) {
  return this.aggregate([
    { $match: { user_id: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$conversation_metadata.session_id',
        lastMessage: { $last: '$message_history' },
        lastTimestamp: { $max: '$conversation_metadata.timestamp' },
        messageCount: { $sum: 1 },
        topics: { $addToSet: '$conversation_metadata.context.conversation_topic' }
      }
    },
    { $sort: { lastTimestamp: -1 } },
    { $limit: limit }
  ]);
};

// Static method to get chandas analysis statistics
messageHistorySchema.statics.getChandasAnalyticsForUser = function(userId) {
  return this.aggregate([
    {
      $match: {
        user_id: mongoose.Types.ObjectId(userId),
        'conversation_metadata.message_type': 'analysis_result'
      }
    },
    {
      $group: {
        _id: '$conversation_metadata.analysis_data.chandas_name',
        count: { $sum: 1 },
        avgConfidence: { $avg: '$conversation_metadata.analysis_data.confidence_score' },
        lastAnalyzed: { $max: '$conversation_metadata.timestamp' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// Instance method to add follow-up question
messageHistorySchema.methods.addFollowUpQuestion = function(question) {
  this.user_interaction.follow_up_questions.push(question);
  return this.save();
};

// Instance method to rate the interaction
messageHistorySchema.methods.rateInteraction = function(rating, feedback = '') {
  this.user_interaction.user_rating = rating;
  this.user_interaction.user_feedback = feedback;
  this.user_interaction.was_helpful = rating >= 3;
  return this.save();
};

// Pre-save middleware to generate session_id if not provided
messageHistorySchema.pre('save', function(next) {
  if (!this.conversation_metadata.session_id) {
    this.conversation_metadata.session_id = `session_${this.user_id}_${Date.now()}`;
  }
  next();
});

module.exports = mongoose.model('MessageHistory', messageHistorySchema);