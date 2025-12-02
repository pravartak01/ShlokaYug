/**
 * Post Card Component - Reusable post display
 */

import React from 'react';

interface PostAuthor {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  isVerified?: boolean;
}

interface PostContent {
  text: string;
  hashtags?: string[];
  media?: {
    images?: Array<{ url: string; alt?: string }>;
    video?: {
      _id: string;
      title: string;
      thumbnail?: { url: string };
    };
  };
}

interface PostMetrics {
  likes: number;
  retweets: number;
  comments: number;
  views: number;
}

interface Post {
  _id: string;
  author: PostAuthor;
  content: PostContent;
  metrics: PostMetrics;
  likedBy?: Array<{ user: string }>;
  createdAt: string;
  postType: string;
}

interface PostCardProps {
  post: Post;
  currentUserId: string;
  onLike: (postId: string) => void;
  onComment?: (postId: string) => void;
  onRepost?: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, currentUserId, onLike, onComment, onRepost }) => {
  // Handle missing author data
  if (!post.author) {
    return (
      <div className="bg-[#FFFEF7] rounded-xl shadow-md border border-[#D4C5A9] p-6">
        <p className="text-[#6B5D4F]">Post data incomplete</p>
      </div>
    );
  }

  const isLiked = post.likedBy?.some(like => like.user === currentUserId);

  const formatTimeAgo = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  };

  const formatCount = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div className="bg-[#FFFEF7] rounded-xl shadow-md border border-[#D4C5A9] hover:shadow-lg transition-all duration-300">
      {/* Post Header */}
      <div className="p-6 border-b border-[#E8DCC4]">
        <div className="flex items-start justify-between">
          <div className="flex space-x-3">
            {/* Avatar */}
            <div className="w-12 h-12 rounded-full bg-[#644A07] flex items-center justify-center text-white font-bold overflow-hidden">
              {post.author.avatar ? (
                <img src={post.author.avatar} alt={post.author.username} className="w-full h-full object-cover" />
              ) : (
                <span className="text-lg">{post.author.firstName?.[0]?.toUpperCase() || 'U'}</span>
              )}
            </div>
            
            {/* Author Info */}
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-bold text-[#2C2416] text-base">
                  {post.author.firstName} {post.author.lastName}
                </h4>
                {post.author.isVerified && (
                  <svg className="w-5 h-5 text-[#644A07]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              <p className="text-sm text-[#6B5D4F]">@{post.author.username} · {formatTimeAgo(post.createdAt)}</p>
            </div>
          </div>
          
          {/* More Options */}
          <button className="text-[#6B5D4F] hover:text-[#2C2416] p-2 rounded-lg hover:bg-[#F5F1E8] transition-colors">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Post Content */}
      <div className="p-6">
        <p className="text-[#2C2416] text-base leading-relaxed mb-4 whitespace-pre-wrap">
          {post.content.text}
        </p>

        {/* Hashtags */}
        {post.content.hashtags && post.content.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.content.hashtags.map((tag, idx) => (
              <span
                key={idx}
                className="text-sm text-[#644A07] hover:text-[#2C2416] cursor-pointer font-semibold px-2 py-1 bg-[#F5F1E8] rounded-md hover:bg-[#E8DCC4] transition-colors"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Media - Images */}
        {post.content.media?.images && post.content.media.images.length > 0 && (
          <div className={`grid gap-2 mb-4 ${
            post.content.media.images.length === 1 ? 'grid-cols-1' :
            post.content.media.images.length === 2 ? 'grid-cols-2' :
            'grid-cols-2'
          }`}>
            {post.content.media.images.slice(0, 4).map((image, idx) => (
              <div key={idx} className="rounded-lg overflow-hidden border border-[#D4C5A9]">
                <img
                  src={image.url}
                  alt={image.alt || `Post image ${idx + 1}`}
                  className="w-full h-auto object-cover"
                />
              </div>
            ))}
          </div>
        )}

        {/* Media - Video */}
        {post.content.media?.video && (
          <div className="mb-4 rounded-lg overflow-hidden border border-[#D4C5A9] bg-[#2C2416]">
            <div className="aspect-video flex items-center justify-center p-6">
              <div className="text-center text-white">
                <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="font-semibold">{post.content.media.video.title}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Engagement Stats */}
      <div className="px-6 py-3 border-t border-b border-[#E8DCC4] flex items-center space-x-6 text-sm text-[#6B5D4F]">
        <span>{formatCount(post.metrics.views)} views</span>
        <span>·</span>
        <span>{formatCount(post.metrics.likes)} likes</span>
        <span>·</span>
        <span>{formatCount(post.metrics.comments)} comments</span>
      </div>

      {/* Action Buttons */}
      <div className="p-4 flex items-center justify-around">
        {/* Like Button */}
        <button
          onClick={() => onLike(post._id)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
            isLiked
              ? 'text-[#644A07] bg-[#F5F1E8]'
              : 'text-[#6B5D4F] hover:bg-[#F5F1E8] hover:text-[#2C2416]'
          }`}
        >
          <svg 
            className="w-5 h-5" 
            fill={isLiked ? 'currentColor' : 'none'} 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span className="font-semibold text-sm">Like</span>
        </button>

        {/* Comment Button */}
        <button
          onClick={() => onComment?.(post._id)}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg text-[#6B5D4F] hover:bg-[#F5F1E8] hover:text-[#2C2416] transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="font-semibold text-sm">Comment</span>
        </button>

        {/* Repost Button */}
        <button
          onClick={() => onRepost?.(post._id)}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg text-[#6B5D4F] hover:bg-[#F5F1E8] hover:text-[#2C2416] transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span className="font-semibold text-sm">Share</span>
        </button>

        {/* Save Button */}
        <button className="flex items-center space-x-2 px-4 py-2 rounded-lg text-[#6B5D4F] hover:bg-[#F5F1E8] hover:text-[#2C2416] transition-all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default PostCard;
