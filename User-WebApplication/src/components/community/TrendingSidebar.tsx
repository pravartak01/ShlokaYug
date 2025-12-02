/**
 * Trending Sidebar Component - Shows trending topics and suggestions
 */

import React from 'react';

interface TrendingTopic {
  tag: string;
  count: number;
}

interface UserSuggestion {
  _id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  isVerified?: boolean;
}

interface TrendingSidebarProps {
  trendingTopics?: TrendingTopic[];
  suggestedUsers?: UserSuggestion[];
  onFollowUser?: (username: string) => void;
}

const TrendingSidebar: React.FC<TrendingSidebarProps> = ({
  trendingTopics = [],
  suggestedUsers = [],
  onFollowUser
}) => {
  return (
    <div className="space-y-6">
      {/* Trending Topics */}
      {trendingTopics.length > 0 && (
        <div className="bg-[#FFFEF7] rounded-xl shadow-md border border-[#D4C5A9] p-6">
          <h3 className="text-lg font-bold text-[#2C2416] mb-4 flex items-center">
            <svg className="w-5 h-5 text-[#644A07] mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            Trending Topics
          </h3>
          <div className="space-y-3">
            {trendingTopics.map((topic, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-[#F5F1E8] hover:bg-[#E8DCC4] cursor-pointer transition-all"
              >
                <p className="font-semibold text-[#2C2416]">#{topic.tag}</p>
                <p className="text-sm text-[#6B5D4F]">{topic.count} posts</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Who to Follow */}
      {suggestedUsers.length > 0 && (
        <div className="bg-[#FFFEF7] rounded-xl shadow-md border border-[#D4C5A9] p-6">
          <h3 className="text-lg font-bold text-[#2C2416] mb-4 flex items-center">
            <svg className="w-5 h-5 text-[#644A07] mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Who to Follow
          </h3>
          <div className="space-y-4">
            {suggestedUsers.map((user) => (
              <div key={user._id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-[#644A07] flex items-center justify-center text-white font-bold overflow-hidden flex-shrink-0">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      <span>{user.firstName[0]}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-1">
                      <p className="font-semibold text-[#2C2416] text-sm truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      {user.isVerified && (
                        <svg className="w-4 h-4 text-[#644A07] flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <p className="text-xs text-[#6B5D4F] truncate">@{user.username}</p>
                  </div>
                </div>
                <button
                  onClick={() => onFollowUser?.(user.username)}
                  className="px-4 py-1.5 bg-[#644A07] text-white rounded-lg text-sm font-semibold hover:bg-[#2C2416] transition-all shadow-sm hover:shadow-md flex-shrink-0 ml-2"
                >
                  Follow
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sanskrit Quote of the Day */}
      <div className="bg-[#FFFEF7] rounded-xl shadow-md border border-[#D4C5A9] p-6">
        <h3 className="text-lg font-bold text-[#2C2416] mb-3">Quote of the Day</h3>
        <p className="text-[#644A07] font-sanskrit text-lg mb-2">
          योगः कर्मसु कौशलम्
        </p>
        <p className="text-sm text-[#6B5D4F] italic">
          "Yoga is skill in action" - Bhagavad Gita
        </p>
      </div>
    </div>
  );
};

export default TrendingSidebar;
