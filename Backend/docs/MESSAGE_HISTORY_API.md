# Message History API Documentation

## Overview
The Message History API provides comprehensive functionality for storing and managing chatbot conversation history, specifically for chandas analysis interactions. This system stores all user interactions with the AI chatbot and provides analytics capabilities.

## Schema Structure

### MessageHistory Model
```javascript
{
  user_id: ObjectId,           // Reference to User
  message_history: String,     // The actual message content
  conversation_metadata: {
    session_id: String,        // Unique session identifier
    message_type: String,      // 'user_input' | 'bot_response' | 'analysis_result'
    timestamp: Date,           // Message timestamp
    analysis_data: {
      input_text: String,
      chandas_name: String,
      syllable_count: Number,
      laghu_guru_pattern: String,
      confidence_score: Number,
      identification_steps: Array
    },
    context: {
      previous_message_id: ObjectId,
      conversation_topic: String,
      user_intent: String
    }
  },
  processing_info: {
    response_time_ms: Number,
    model_version: String,
    api_version: String,
    error_occurred: Boolean,
    error_details: String
  },
  user_interaction: {
    user_rating: Number,       // 1-5 star rating
    user_feedback: String,
    was_helpful: Boolean,
    follow_up_questions: Array
  }
}
```

## API Endpoints

### 1. Save Message to History
**POST** `/api/v1/messages/history`

Saves a new message to the user's conversation history.

#### Request Body Example:
```json
{
  "message_history": "तत्सवितुर्वरेण्यंभर्गोदेवस्यधीमहि",
  "session_id": "session_12345_1733123456789",
  "message_type": "analysis_result",
  "analysis_data": {
    "chandas_name": "Anushtup",
    "syllable_breakdown": [
      {
        "syllable": "तत्",
        "type": "laghu",
        "position": 1
      }
    ],
    "laghu_guru_pattern": "LLLLGGLGLLG",
    "explanation": "The shloka has 32 syllables divided into 8 groups of 4, following the Anushtup meter.",
    "confidence": 0.95,
    "identification_process": [
      {
        "step_number": 1,
        "step_name": "Text Preprocessing",
        "description": "Remove punctuation marks",
        "result": "Cleaned text"
      }
    ]
  },
  "context": {
    "conversation_topic": "chandas_analysis",
    "user_intent": "analyze_meter"
  }
}
```

#### Response:
```json
{
  "success": true,
  "message": "Message saved to history successfully",
  "data": {
    "message_id": "673abc123def456789",
    "session_id": "session_12345_1733123456789",
    "timestamp": "2024-12-04T10:30:00Z"
  }
}
```

### 2. Get User's Message History
**GET** `/api/v1/messages/history`

Retrieves user's conversation history with filtering options.

#### Query Parameters:
- `session_id` (optional): Filter by specific session
- `limit` (optional): Number of messages (1-500, default: 50)
- `page` (optional): Page number (default: 1)
- `message_type` (optional): Filter by message type
- `start_date` (optional): ISO8601 date
- `end_date` (optional): ISO8601 date

#### Example Request:
```
GET /api/v1/messages/history?limit=20&message_type=analysis_result&page=1
```

#### Response:
```json
{
  "success": true,
  "message": "Message history retrieved successfully",
  "data": {
    "messages": [
      {
        "_id": "673abc123def456789",
        "message_history": "तत्सवितुर्वरेण्यंभर्गोदेवस्यधीमहि",
        "conversation_metadata": {
          "session_id": "session_12345_1733123456789",
          "message_type": "analysis_result",
          "timestamp": "2024-12-04T10:30:00Z",
          "analysis_data": {
            "chandas_name": "Anushtup",
            "confidence_score": 0.95
          }
        }
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_messages": 98,
      "messages_per_page": 20,
      "has_next_page": true,
      "has_prev_page": false
    }
  }
}
```

### 3. Get Recent Sessions
**GET** `/api/v1/messages/sessions`

Retrieves user's recent conversation sessions.

#### Query Parameters:
- `limit` (optional): Number of sessions (1-50, default: 10)

#### Response:
```json
{
  "success": true,
  "message": "Recent sessions retrieved successfully",
  "data": {
    "sessions": [
      {
        "_id": "session_12345_1733123456789",
        "lastMessage": "Analysis completed for Anushtup meter",
        "lastTimestamp": "2024-12-04T10:30:00Z",
        "messageCount": 8,
        "topics": ["chandas_analysis", "meter_identification"]
      }
    ],
    "total_sessions": 3
  }
}
```

### 4. Get Session Conversation
**GET** `/api/v1/messages/sessions/:sessionId`

Retrieves all messages from a specific conversation session.

#### Path Parameters:
- `sessionId`: The session ID to retrieve

#### Query Parameters:
- `limit` (optional): Number of messages (1-1000, default: 100)

#### Response:
```json
{
  "success": true,
  "message": "Session conversation retrieved successfully",
  "data": {
    "session_id": "session_12345_1733123456789",
    "messages": [
      {
        "message_history": "Please analyze this shloka for me",
        "conversation_metadata": {
          "message_type": "user_input",
          "timestamp": "2024-12-04T10:28:00Z"
        }
      },
      {
        "message_history": "तत्सवितुर्वरेण्यंभर्गोदेवस्यधीमहि",
        "conversation_metadata": {
          "message_type": "analysis_result",
          "timestamp": "2024-12-04T10:30:00Z",
          "analysis_data": {
            "chandas_name": "Anushtup"
          }
        }
      }
    ],
    "message_count": 8
  }
}
```

### 5. Get Chandas Analytics
**GET** `/api/v1/messages/analytics/chandas`

Retrieves chandas analysis statistics for the user.

#### Response:
```json
{
  "success": true,
  "message": "Chandas analytics retrieved successfully",
  "data": {
    "summary": {
      "total_analyses": 156,
      "unique_chandas_analyzed": 12,
      "most_analyzed_chandas": {
        "_id": "Anushtup",
        "count": 45,
        "avgConfidence": 0.92
      }
    },
    "chandas_breakdown": [
      {
        "_id": "Anushtup",
        "count": 45,
        "avgConfidence": 0.92,
        "lastAnalyzed": "2024-12-04T10:30:00Z"
      },
      {
        "_id": "Indravajra", 
        "count": 23,
        "avgConfidence": 0.88,
        "lastAnalyzed": "2024-12-03T15:20:00Z"
      }
    ]
  }
}
```

### 6. Rate Message Interaction
**PUT** `/api/v1/messages/history/:messageId/rate`

Allows users to rate and provide feedback on message interactions.

#### Path Parameters:
- `messageId`: The message ID to rate

#### Request Body:
```json
{
  "rating": 5,
  "feedback": "Excellent analysis with detailed explanation!"
}
```

#### Response:
```json
{
  "success": true,
  "message": "Message rated successfully",
  "data": {
    "message_id": "673abc123def456789",
    "rating": 5,
    "feedback": "Excellent analysis with detailed explanation!"
  }
}
```

### 7. Delete Specific Message
**DELETE** `/api/v1/messages/history/:messageId`

Deletes a specific message from the user's history.

#### Response:
```json
{
  "success": true,
  "message": "Message deleted successfully",
  "data": {
    "deleted_message_id": "673abc123def456789"
  }
}
```

### 8. Clear Message History
**DELETE** `/api/v1/messages/history`

Clears the user's message history (optionally by session).

#### Query Parameters:
- `session_id` (optional): Clear only specific session

#### Response:
```json
{
  "success": true,
  "message": "All message history cleared successfully",
  "data": {
    "deleted_count": 156,
    "session_id": "all"
  }
}
```

## Admin Endpoints

### 1. Message Overview (Admin)
**GET** `/api/v1/admin/messages/overview`

Platform-wide message history statistics for administrators.

#### Response:
```json
{
  "success": true,
  "message": "Message history overview retrieved successfully",
  "data": {
    "totalMessages": 12456,
    "todayMessages": 234,
    "analysisMessages": 8901,
    "topChandas": [
      {
        "_id": "Anushtup",
        "count": 3456,
        "avgConfidence": 0.91
      }
    ],
    "messageTypes": {
      "user_input": 4567,
      "bot_response": 4567,
      "analysis_result": 3322
    }
  }
}
```

### 2. User History (Admin View)
**GET** `/api/v1/admin/messages/users/:userId/history`

Retrieve message history for a specific user (admin access).

## Authentication & Authorization

All endpoints require user authentication via JWT token:
```
Authorization: Bearer <jwt_token>
```

Admin endpoints additionally require admin role verification.

## Rate Limiting

- Regular users: 100 requests per 15 minutes
- Admin endpoints: Higher limits for operational needs

## Error Responses

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information (development only)"
}
```

## Usage Examples

### Frontend Integration Example:
```javascript
// Save chandas analysis result
const saveAnalysisResult = async (analysisData) => {
  try {
    const response = await fetch('/api/v1/messages/history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`
      },
      body: JSON.stringify({
        message_history: JSON.stringify(analysisData),
        message_type: 'analysis_result',
        analysis_data: analysisData
      })
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to save analysis:', error);
  }
};

// Get user's analysis history
const getUserAnalysisHistory = async () => {
  try {
    const response = await fetch('/api/v1/messages/history?message_type=analysis_result&limit=50', {
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });
    
    const history = await response.json();
    return history.data.messages;
  } catch (error) {
    console.error('Failed to get history:', error);
  }
};
```

## Database Indexes

The following indexes are automatically created for optimal performance:
- `{ user_id: 1, 'conversation_metadata.timestamp': -1 }`
- `{ 'conversation_metadata.session_id': 1 }`
- `{ 'conversation_metadata.message_type': 1 }`
- `{ createdAt: -1 }`
- `{ 'conversation_metadata.analysis_data.chandas_name': 1 }`

## Best Practices

1. **Session Management**: Use consistent session IDs for conversation continuity
2. **Message Types**: Properly categorize messages for filtering and analytics
3. **Analysis Data**: Include complete chandas analysis data for future reference
4. **Rate Interactions**: Encourage users to rate analysis quality for improvement
5. **Privacy**: Users can only access their own message history
6. **Pagination**: Use pagination for large history sets to maintain performance