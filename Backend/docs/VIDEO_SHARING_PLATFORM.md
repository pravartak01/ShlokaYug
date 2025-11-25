# YouTube-like Video Sharing Platform Documentation

## 🎬 Overview

ShlokaYug now includes a comprehensive video sharing platform similar to YouTube, allowing anyone to upload, share, and discover videos and shorts related to Sanskrit learning and Indian culture.

## 🌟 Key Features

### 📹 Video Upload & Management
- **Regular Videos**: Full-length educational content (tutorials, lectures, etc.)
- **Shorts**: Vertical videos up to 60 seconds for quick consumption
- **Multi-quality Processing**: Automatic generation of 240p, 480p, 720p, 1080p versions
- **Thumbnail Generation**: Automatic thumbnail creation with multiple timestamps
- **Cloud Storage**: Integration with Cloudinary for scalable file storage

### 🔍 Content Discovery
- **Trending Feed**: Algorithm-based trending content
- **Popular Videos**: Most-viewed content
- **Category Filtering**: Sanskrit, Chandas, Spiritual, Educational, etc.
- **Advanced Search**: Text search with filters for duration, language, category
- **Hashtag Discovery**: Trending hashtags for shorts
- **Recommendations**: Related videos based on category and engagement

### 💬 Social Engagement
- **Likes & Dislikes**: Video reaction system
- **Comments**: Threaded comment system with replies
- **Subscriptions**: Follow favorite content creators
- **View Tracking**: Comprehensive analytics for watch time and engagement
- **Bookmarks**: Save videos for later viewing

### 📱 Shorts Platform
- **Swipeable Feed**: Mobile-optimized infinite scroll
- **Hashtag Challenges**: Viral hashtag-based content
- **Music Integration**: Background music attribution
- **Quick Engagement**: Optimized for rapid consumption and interaction

## 🏗️ Architecture

### Database Models

#### Video Schema
```javascript
{
  title: String,
  description: String,
  creator: {
    userId: ObjectId,
    username: String,
    displayName: String,
    avatar: String
  },
  type: 'video' | 'short',
  category: String,
  tags: [String],
  language: String,
  visibility: 'public' | 'unlisted' | 'private',
  video: {
    originalFile: { url, cloudinaryId, size },
    processedVersions: {
      '240p': { url, cloudinaryId, size },
      '480p': { url, cloudinaryId, size },
      '720p': { url, cloudinaryId, size },
      '1080p': { url, cloudinaryId, size }
    },
    thumbnail: { url, cloudinaryId, timestamps },
    duration: Number,
    resolution: { width, height },
    aspectRatio: String
  },
  metrics: {
    views: Number,
    likes: Number,
    dislikes: Number,
    comments: Number,
    shares: Number,
    watchTime: { total, average },
    engagement: { rate, lastCalculated }
  },
  shorts: {
    isLoop: Boolean,
    music: { title, artist, isOriginal },
    effects: [String],
    hashtags: [String]
  }
}
```

#### Comment Schema
```javascript
{
  videoId: ObjectId,
  author: {
    userId: ObjectId,
    username: String,
    displayName: String,
    avatar: String,
    isVerified: Boolean
  },
  content: {
    text: String,
    mentions: [{ userId, username, startIndex, endIndex }],
    hashtags: [String]
  },
  parentComment: ObjectId,
  likes: {
    count: Number,
    users: [ObjectId]
  },
  replies: {
    count: Number,
    latest: [ObjectId]
  }
}
```

#### Subscription Schema
```javascript
{
  subscriber: {
    userId: ObjectId,
    username: String,
    avatar: String
  },
  channel: {
    userId: ObjectId,
    username: String,
    displayName: String,
    avatar: String
  },
  notifications: {
    enabled: Boolean,
    level: 'all' | 'custom' | 'none',
    types: {
      newVideo: Boolean,
      liveStream: Boolean,
      communityPost: Boolean
    }
  }
}
```

## 🔧 API Endpoints

### Video Management

#### Upload Video
```http
POST /api/v1/videos/upload
Content-Type: multipart/form-data
Authorization: Bearer <token>

{
  "video": <file>,
  "title": "Video Title",
  "description": "Video Description",
  "type": "video|short",
  "category": "tutorials",
  "tags": ["sanskrit", "tutorial"],
  "language": "hindi",
  "visibility": "public"
}
```

#### Get Video Feed
```http
GET /api/v1/videos/feed?type=trending&category=sanskrit&limit=20&page=1
```

#### Search Videos
```http
GET /api/v1/videos/search?q=sanskrit&category=tutorials&language=hindi&duration=medium&sortBy=relevance&limit=20
```

#### Get Video Details
```http
GET /api/v1/videos/:videoId
```

### Shorts Platform

#### Get Shorts Feed
```http
GET /api/v1/shorts/feed?lastVideoId=<id>&limit=20&category=educational
```

#### Get Trending Hashtags
```http
GET /api/v1/shorts/hashtags/trending?limit=20
```

#### Get Shorts by Hashtag
```http
GET /api/v1/shorts/hashtag/:hashtag?page=1&limit=20
```

### Engagement Features

#### React to Video
```http
POST /api/v1/videos/:videoId/react
Authorization: Bearer <token>

{
  "type": "like|dislike"
}
```

#### Add Comment
```http
POST /api/v1/videos/:videoId/comments
Authorization: Bearer <token>

{
  "text": "Great video! Thanks for sharing.",
  "parentCommentId": "<optional-for-replies>"
}
```

#### Subscribe to Channel
```http
POST /api/v1/videos/channels/:channelId/subscribe
Authorization: Bearer <token>
```

#### Record Video View
```http
POST /api/v1/videos/:videoId/view

{
  "watchTime": 180,
  "deviceInfo": "mobile"
}
```

## 📊 Analytics & Insights

### Video Analytics
- **View Count**: Total and unique views
- **Watch Time**: Total and average watch duration
- **Engagement Rate**: (Likes + Comments + Shares) / Views
- **Retention Analysis**: Percentage of video watched
- **Demographics**: Age groups, locations, languages
- **Device Analytics**: Mobile vs desktop viewing patterns

### Creator Dashboard Metrics
- **Channel Performance**: Subscriber growth, total views
- **Video Analytics**: Individual video performance
- **Audience Insights**: Viewer demographics and behavior
- **Revenue Tracking**: If monetization is enabled

## 🔒 Content Moderation

### Automated Moderation
- **File Validation**: Video format, size, and duration checks
- **Content Scanning**: Automatic flagging of inappropriate content
- **Spam Detection**: Comment and title spam filtering

### Manual Moderation
- **User Reporting**: Community-driven content flagging
- **Admin Review**: Manual review for flagged content
- **Warning System**: Progressive warnings for policy violations

### Community Guidelines
- **Educational Content**: Priority for learning-focused videos
- **Cultural Sensitivity**: Respect for Sanskrit and Indian traditions
- **Age Appropriateness**: Content suitable for all age groups
- **Copyright Compliance**: Original or properly licensed content

## 🚀 Usage Examples

### For Content Creators
```javascript
// Upload a tutorial video
const formData = new FormData();
formData.append('video', videoFile);
formData.append('title', 'Sanskrit Grammar Basics');
formData.append('description', 'Learn fundamental Sanskrit grammar rules');
formData.append('category', 'tutorials');
formData.append('tags', JSON.stringify(['sanskrit', 'grammar', 'beginners']));

fetch('/api/v1/videos/upload', {
  method: 'POST',
  body: formData,
  headers: {
    'Authorization': `Bearer ${userToken}`
  }
});
```

### For Viewers
```javascript
// Get trending videos
const trendingVideos = await fetch('/api/v1/videos/feed?type=trending&limit=10');

// Search for specific content
const searchResults = await fetch('/api/v1/videos/search?q=chandas&category=educational');

// Like a video
await fetch(`/api/v1/videos/${videoId}/react`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ type: 'like' })
});
```

### For Mobile Apps (Shorts)
```javascript
// Get shorts feed for infinite scroll
const shortsFeed = await fetch('/api/v1/shorts/feed?lastVideoId=${lastId}&limit=10');

// Track shorts viewing
await fetch(`/api/v1/shorts/${shortId}/view`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    watchTime: 35,
    deviceInfo: 'mobile',
    viewType: 'swipe'
  })
});
```

## 🎯 Integration with Existing LMS

### Course Integration
- **Video Lectures**: Course videos can be regular uploads
- **Quick Tutorials**: Shorts for bite-sized learning
- **Assessment Videos**: Visual explanations for complex topics
- **Progress Tracking**: Integration with existing progress system

### User Profiles
- **Creator Profiles**: Enhanced with video statistics
- **Learning History**: Video watch history alongside course progress
- **Achievement Badges**: For video creation and engagement milestones

## 🔮 Future Enhancements

### Planned Features
- **Live Streaming**: Real-time video broadcasts
- **Premiere Scheduling**: Scheduled video releases
- **Community Posts**: Text and image posts for creators
- **Monetization**: Revenue sharing for creators
- **Collaborative Playlists**: User-generated playlists
- **Video Responses**: Reply videos to existing content

### Advanced Analytics
- **A/B Testing**: Thumbnail and title optimization
- **Recommendation Engine**: ML-powered content suggestions
- **Trending Prediction**: Early identification of viral content
- **Creator Tools**: Advanced editing and scheduling features

## 🛠️ Development Notes

### File Processing
- Videos are processed asynchronously using background jobs
- Cloudinary handles transcoding and optimization
- FFmpeg is used for thumbnail generation and metadata extraction

### Performance Optimization
- CDN distribution for global video delivery
- Lazy loading for video feeds
- Compressed video formats for mobile viewing
- Database indexing for fast search queries

### Security Considerations
- JWT authentication for all user actions
- File type validation for uploads
- Rate limiting for API endpoints
- CORS configuration for web client access

---

This comprehensive video sharing platform transforms ShlokaYug into a complete learning ecosystem where users can both consume structured courses and discover community-generated content, fostering a vibrant Sanskrit learning community.