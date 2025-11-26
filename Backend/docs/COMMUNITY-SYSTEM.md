# 🐦 ShlokaYug Community System - Twitter-like Features

## 📋 Overview

The ShlokaYug Community System provides a complete Twitter-like social media experience for Sanskrit learning enthusiasts. Users can post tweets, share videos, follow each other, and build a vibrant learning community.

## 🎯 Features

### ✨ **Core Social Features**
- **📝 Posts/Tweets**: Text, images, videos, and audio posts
- **👥 Follow System**: Follow/unfollow users, mutual follows
- **📰 Timeline**: Personalized feed based on follows
- **🔍 Discovery**: Explore feed, trending content
- **❤️ Engagement**: Likes, retweets, comments, quotes
- **🏷️ Hashtags**: Tag content for discoverability
- **🔍 Search**: Find posts, users, and hashtags
- **📈 Trending**: Popular hashtags and content

### 📊 **Advanced Features**
- **🎬 Video Integration**: Share videos from the platform
- **🖼️ Image Uploads**: Multiple images per post
- **🎵 Audio Posts**: Sanskrit chants and pronunciations
- **📍 Location Tags**: Optional location sharing
- **🔒 Privacy Controls**: Public, followers-only, private posts
- **🚨 Moderation**: Report system for inappropriate content
- **📅 Scheduling**: Schedule posts for later
- **📈 Analytics**: Engagement metrics and insights

## 🏗️ Architecture

### 📁 **File Structure**
```
src/
├── models/
│   ├── CommunityPost.js      # Twitter-like posts model
│   └── Follow.js             # Follow relationships model
├── controllers/
│   └── communityController.js # All community logic
├── routes/
│   └── community.js          # API endpoints
└── middleware/
    ├── auth.js               # Authentication
    └── validateRequest.js    # Validation
```

### 🗃️ **Database Models**

#### **CommunityPost Model**
```javascript
{
  author: ObjectId,           // User who created the post
  content: {
    text: String,             // Post text (max 500 chars)
    media: {
      video: ObjectId,        // Reference to Video model
      images: [Object],       // Array of image objects
      audio: Object           // Audio file details
    },
    hashtags: [String],       // Extracted hashtags
    mentions: [ObjectId]      // Mentioned users
  },
  postType: String,           // text, video, image, retweet, quote
  originalPost: ObjectId,     // For retweets/quotes
  metrics: {
    likes: Number,            // Like count
    retweets: Number,         // Retweet count
    comments: Number,         // Comment count
    views: Number             // View count
  },
  visibility: String,         // public, followers, private
  createdAt: Date
}
```

#### **Follow Model**
```javascript
{
  follower: ObjectId,         // User who follows
  following: ObjectId,        // User being followed
  status: String,             // active, pending, blocked
  isMutual: Boolean,          // Mutual follow indicator
  notifications: Object,      // Notification preferences
  followedAt: Date
}
```

## 🚀 API Endpoints

### 📝 **Post Management**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/v1/community/posts` | Create new post | ✅ |
| `GET` | `/api/v1/community/timeline` | Get personalized feed | ✅ |
| `GET` | `/api/v1/community/explore` | Get public feed | ❌ |
| `GET` | `/api/v1/community/users/:username/posts` | Get user posts | ❌ |
| `POST` | `/api/v1/community/posts/:postId/like` | Like/unlike post | ✅ |
| `POST` | `/api/v1/community/posts/:postId/repost` | Retweet/quote post | ✅ |
| `POST` | `/api/v1/community/posts/:postId/comments` | Add comment | ✅ |

### 👥 **Follow System**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/v1/community/users/:username/follow` | Follow user | ✅ |
| `DELETE` | `/api/v1/community/users/:username/follow` | Unfollow user | ✅ |
| `GET` | `/api/v1/community/users/:username/followers` | Get followers | ❌ |
| `GET` | `/api/v1/community/users/:username/following` | Get following | ❌ |
| `GET` | `/api/v1/community/suggestions/follow` | Get follow suggestions | ✅ |

### 🔍 **Discovery & Trending**

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/v1/community/trending/hashtags` | Get trending hashtags | ❌ |
| `GET` | `/api/v1/community/hashtags/:hashtag/posts` | Posts by hashtag | ❌ |
| `GET` | `/api/v1/community/search` | Search posts/users | ❌ |
| `GET` | `/api/v1/community/stats` | Community statistics | ❌ |

## 💻 Usage Examples

### 📝 **Create a Text Post**
```javascript
POST /api/v1/community/posts
Authorization: Bearer <token>

{
  "text": "Learning Sanskrit brings such joy! 🕉️ #Sanskrit #Learning #Peace",
  "visibility": "public"
}
```

### 🎬 **Create a Video Post**
```javascript
POST /api/v1/community/posts
Authorization: Bearer <token>

{
  "text": "Check out this Sanskrit pronunciation guide!",
  "videoId": "video_object_id",
  "visibility": "public"
}
```

### 🖼️ **Create Image Post**
```javascript
POST /api/v1/community/posts
Authorization: Bearer <token>
Content-Type: multipart/form-data

text: "Beautiful Devanagari calligraphy ✨"
images: [file1.jpg, file2.jpg]
visibility: public
```

### 👥 **Follow a User**
```javascript
POST /api/v1/community/users/sanskrit_guru/follow
Authorization: Bearer <token>
```

### ❤️ **Like a Post**
```javascript
POST /api/v1/community/posts/post_id/like
Authorization: Bearer <token>
```

### 🔄 **Quote Tweet**
```javascript
POST /api/v1/community/posts/post_id/repost
Authorization: Bearer <token>

{
  "quoteText": "This is exactly what I needed to learn!"
}
```

## 📱 **Frontend Integration**

### 🔄 **Timeline Component**
```javascript
// Get user's personalized timeline
const getTimeline = async () => {
  const response = await fetch('/api/v1/community/timeline', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await response.json();
  return data.data.posts;
};
```

### 👥 **Follow Button Component**
```javascript
const followUser = async (username) => {
  const response = await fetch(`/api/v1/community/users/${username}/follow`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  return response.json();
};
```

### 🔍 **Search Component**
```javascript
const searchContent = async (query) => {
  const response = await fetch(`/api/v1/community/search?q=${query}&type=all`);
  const data = await response.json();
  return data.data;
};
```

## 🧪 **Testing**

### 🔬 **Run Community Tests**
```bash
# Start server first
npm start

# Run community integration test
node tests/community-integration-test.js
```

### 🎯 **Test Coverage**
- ✅ User registration and authentication
- ✅ Post creation (text, images, videos)
- ✅ Follow/unfollow functionality
- ✅ Timeline and feed generation
- ✅ Engagement (likes, comments, retweets)
- ✅ Search and discovery
- ✅ Trending hashtags
- ✅ Privacy controls

## 🚀 **Deployment Considerations**

### 📊 **Performance Optimization**
- **Database Indexing**: Optimized indexes for queries
- **Pagination**: Efficient pagination for feeds
- **Caching**: Redis caching for trending content
- **CDN**: Cloudinary for media optimization

### 🔒 **Security Features**
- **Input Validation**: Comprehensive validation
- **Rate Limiting**: Prevents spam and abuse
- **Content Moderation**: Report and hide system
- **Privacy Controls**: Granular visibility options

### 📈 **Scalability**
- **Sharding**: Database sharding strategies
- **Load Balancing**: Multiple server instances
- **Queue System**: Background processing for feeds
- **Analytics**: Real-time engagement metrics

## 🎨 **UI/UX Features**

### 📱 **Mobile-First Design**
- Responsive timeline layout
- Touch-optimized interactions
- Infinite scroll feeds
- Pull-to-refresh functionality

### 🎨 **Visual Elements**
- User avatars and verification badges
- Rich media previews
- Hashtag highlighting
- Real-time engagement counters

## 🔮 **Future Enhancements**

### 🆕 **Planned Features**
- **🔴 Live Streaming**: Sanskrit teaching sessions
- **💬 Direct Messaging**: Private conversations
- **🎪 Communities**: Topic-based groups
- **📊 Analytics**: Detailed engagement insights
- **🌍 Internationalization**: Multiple language support
- **🎵 Audio Posts**: Sanskrit pronunciation guides
- **📱 Mobile App**: React Native implementation

### 🤖 **AI Integration**
- **📝 Content Suggestions**: AI-powered post recommendations
- **🌐 Auto Translation**: Sanskrit to English translation
- **🎯 Smart Hashtags**: Automatic hashtag suggestions
- **🔍 Content Discovery**: Personalized content curation

## ✨ **Summary**

The ShlokaYug Community System provides a complete Twitter-like social media experience tailored for Sanskrit learning. With features like posts, follows, timelines, trending content, and rich media support, it creates an engaging platform for building a vibrant learning community.

**Key Benefits:**
- 🌟 **Engaging**: Twitter-like UX that users love
- 📚 **Educational**: Focused on Sanskrit learning
- 🚀 **Scalable**: Built for growth and performance
- 🔒 **Secure**: Comprehensive security measures
- 📱 **Responsive**: Works on all devices
- 🔧 **Extensible**: Easy to add new features

Ready to connect Sanskrit learners worldwide! 🕉️✨