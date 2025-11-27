import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { 
  Users, 
  Heart, 
  MessageCircle, 
  Share2, 
  Trophy, 
  Star,
  Plus,
  Search,
  Filter,
  Bookmark,
  Flag,
  ThumbsUp,
  Eye,
  Clock,
  Award,
  Globe,
  User
} from 'lucide-react';
import type { CommunityContribution, Shloka } from '../../types/chandas';
import { SAMPLE_SHLOKAS, CHANDAS_DATABASE } from '../../data/dummyData';

export const ChandasCommunity: React.FC = () => {
  const [activeTab, setActiveTab] = useState('contributions');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showContributeModal, setShowContributeModal] = useState(false);

  // Mock community data
  const contributions: CommunityContribution[] = [
    {
      id: 'contrib-1',
      userId: 'user-1',
      shloka: SAMPLE_SHLOKAS[0],
      status: 'approved',
      votes: 23,
      contributedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      verifiedBy: 'ShlokaYug Expert'
    },
    {
      id: 'contrib-2',
      userId: 'user-2',
      shloka: SAMPLE_SHLOKAS[1],
      status: 'pending',
      votes: 18,
      contributedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    },
    {
      id: 'contrib-3',
      userId: 'user-3',
      shloka: SAMPLE_SHLOKAS[0],
      status: 'approved',
      votes: 34,
      contributedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      verifiedBy: 'Prosody Expert'
    }
  ];

  const communityStats = {
    totalContributors: 1247,
    totalShlokas: 3456,
    totalVotes: 12890,
    activeModerators: 15,
    verifiedShlokas: 2897,
    pendingReview: 89
  };

  const leaderboard = [
    { rank: 1, name: 'Sanskrit Master', points: 2847, avatar: '👑', contributions: 145 },
    { rank: 2, name: 'Prosody Expert', points: 2156, avatar: '🏆', contributions: 123 },
    { rank: 3, name: 'Meter Guru', points: 1923, avatar: '🥉', contributions: 98 },
    { rank: 4, name: 'Chandas Scholar', points: 1756, avatar: '📚', contributions: 87 },
    { rank: 5, name: 'Verse Validator', points: 1654, avatar: '✓', contributions: 76 },
    { rank: 6, name: 'You', points: 432, avatar: '⭐', contributions: 12 }
  ];

  const discussions = [
    {
      id: 'disc-1',
      title: 'Best practices for identifying Brihati meter variations',
      author: 'Classical Poetry Lover',
      replies: 23,
      views: 156,
      lastActivity: '2 hours ago',
      tags: ['brihati', 'identification', 'variations']
    },
    {
      id: 'disc-2',
      title: 'Request: More Tamil script examples needed',
      author: 'South Indian Scholar',
      replies: 18,
      views: 89,
      lastActivity: '4 hours ago',
      tags: ['tamil', 'scripts', 'request']
    },
    {
      id: 'disc-3',
      title: 'Error in Trishtubh pattern analysis?',
      author: 'Careful Reader',
      replies: 34,
      views: 234,
      lastActivity: '1 day ago',
      tags: ['trishtubh', 'error', 'analysis']
    }
  ];

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    return `${diffInDays} days ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-ancient-900 via-saffron-900 to-ancient-900 text-white">
        <div className="p-6">
          <h2 className="text-3xl font-ancient font-bold mb-2 flex items-center gap-2">
            <Users className="w-8 h-8" />
            Chandas Community 🤝
          </h2>
          <p className="text-ancient-200">
            Collaborate, learn, and preserve Sanskrit prosody knowledge together
          </p>
        </div>
      </Card>

      {/* Community Stats */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <div className="p-4 text-center">
            <Users className="w-6 h-6 mx-auto text-saffron-500 mb-2" />
            <div className="text-2xl font-bold text-ancient-800">{communityStats.totalContributors.toLocaleString()}</div>
            <div className="text-xs text-ancient-600">Contributors</div>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <Heart className="w-6 h-6 mx-auto text-red-500 mb-2" />
            <div className="text-2xl font-bold text-ancient-800">{communityStats.totalShlokas.toLocaleString()}</div>
            <div className="text-xs text-ancient-600">Shlokas</div>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <ThumbsUp className="w-6 h-6 mx-auto text-blue-500 mb-2" />
            <div className="text-2xl font-bold text-ancient-800">{communityStats.totalVotes.toLocaleString()}</div>
            <div className="text-xs text-ancient-600">Votes</div>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <Award className="w-6 h-6 mx-auto text-purple-500 mb-2" />
            <div className="text-2xl font-bold text-ancient-800">{communityStats.activeModerators}</div>
            <div className="text-xs text-ancient-600">Moderators</div>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <Star className="w-6 h-6 mx-auto text-yellow-500 mb-2" />
            <div className="text-2xl font-bold text-ancient-800">{communityStats.verifiedShlokas.toLocaleString()}</div>
            <div className="text-xs text-ancient-600">Verified</div>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <Clock className="w-6 h-6 mx-auto text-orange-500 mb-2" />
            <div className="text-2xl font-bold text-ancient-800">{communityStats.pendingReview}</div>
            <div className="text-xs text-ancient-600">Pending</div>
          </div>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 bg-white rounded-lg p-2 shadow-sm border border-ancient-200">
        {[
          { id: 'contributions', label: 'Contributions', icon: Plus },
          { id: 'discussions', label: 'Discussions', icon: MessageCircle },
          { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
          { id: 'guidelines', label: 'Guidelines', icon: Flag }
        ].map(tab => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-2"
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Content based on active tab */}
      {activeTab === 'contributions' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Search and Filter */}
            <Card className="mb-6">
              <div className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ancient-400 w-4 h-4" />
                    <Input
                      placeholder="Search contributions..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="px-4 py-2 border border-ancient-300 rounded-lg focus:ring-2 focus:ring-saffron-500"
                  >
                    <option value="all">All Status</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <Button className="bg-gradient-to-r from-saffron-600 to-ancient-600">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </div>
            </Card>

            {/* Contributions List */}
            <div className="space-y-4">
              {contributions.map((contribution) => (
                <Card key={contribution.id} className="hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(contribution.status)}`}>
                            {contribution.status.toUpperCase()}
                          </span>
                          {contribution.status === 'approved' && contribution.verifiedBy && (
                            <span className="text-xs text-green-600 flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              Verified by {contribution.verifiedBy}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-ancient-800 mb-2">
                          {contribution.shloka.source}
                        </h3>
                        <div className="bg-ancient-50 rounded-lg p-3 mb-3">
                          <p className="font-sanskrit text-ancient-800 mb-1">
                            {contribution.shloka.text.slice(0, 100)}...
                          </p>
                          <p className="text-sm text-ancient-600 italic">
                            {contribution.shloka.romanization?.slice(0, 100)}...
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-ancient-500">
                          <span>Chandas: {contribution.shloka.chandas.name}</span>
                          <span>•</span>
                          <span>{getTimeAgo(contribution.contributedAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1 text-sm text-ancient-600 hover:text-saffron-600 transition-colors">
                          <Heart className="w-4 h-4" />
                          {contribution.votes}
                        </button>
                        <button className="flex items-center gap-1 text-sm text-ancient-600 hover:text-saffron-600 transition-colors">
                          <MessageCircle className="w-4 h-4" />
                          Discuss
                        </button>
                        <button className="flex items-center gap-1 text-sm text-ancient-600 hover:text-saffron-600 transition-colors">
                          <Share2 className="w-4 h-4" />
                          Share
                        </button>
                        <button className="flex items-center gap-1 text-sm text-ancient-600 hover:text-saffron-600 transition-colors">
                          <Bookmark className="w-4 h-4" />
                          Save
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-ancient-400" />
                        <span className="text-sm text-ancient-600">User {contribution.userId.slice(-3)}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contribute CTA */}
            <Card>
              <div className="p-6 text-center">
                <h3 className="text-xl font-semibold text-ancient-800 mb-3">Share Your Knowledge</h3>
                <p className="text-ancient-600 mb-4">
                  Help grow the world's largest Sanskrit prosody database
                </p>
                <Button 
                  onClick={() => setShowContributeModal(true)}
                  className="w-full bg-gradient-to-r from-saffron-600 to-ancient-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Shloka
                </Button>
              </div>
            </Card>

            {/* Quick Stats */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-ancient-800 mb-4">Your Impact</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-ancient-600">Contributions:</span>
                    <span className="font-semibold text-ancient-800">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-ancient-600">Votes Received:</span>
                    <span className="font-semibold text-saffron-600">89</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-ancient-600">Accuracy Rate:</span>
                    <span className="font-semibold text-green-600">94%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-ancient-600">Community Rank:</span>
                    <span className="font-semibold text-lotus-600">#127</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Recent Activity */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-ancient-800 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {[
                    { action: 'Verified', item: 'Anushtubh shloka', time: '2h ago' },
                    { action: 'Upvoted', item: 'Gayatri translation', time: '4h ago' },
                    { action: 'Commented', item: 'Trishtubh discussion', time: '1d ago' }
                  ].map((activity, index) => (
                    <div key={index} className="flex justify-between items-center text-sm">
                      <span className="text-ancient-700">{activity.action} {activity.item}</span>
                      <span className="text-ancient-500">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'discussions' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {discussions.map((discussion) => (
                <Card key={discussion.id} className="hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-ancient-800 mb-2">
                      {discussion.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-ancient-500 mb-3">
                      <span>By {discussion.author}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {discussion.replies} replies
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {discussion.views} views
                      </span>
                      <span>•</span>
                      <span>{discussion.lastActivity}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {discussion.tags.map(tag => (
                        <span key={tag} className="px-2 py-1 bg-ancient-100 text-ancient-700 rounded text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-ancient-800 mb-4">Start Discussion</h3>
                <Button className="w-full bg-gradient-to-r from-saffron-600 to-ancient-600">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  New Discussion
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <Card>
          <div className="p-6">
            <h3 className="text-xl font-semibold text-ancient-800 mb-6">Community Leaderboard</h3>
            <div className="space-y-4">
              {leaderboard.map((user) => (
                <div 
                  key={user.rank} 
                  className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                    user.name === 'You' 
                      ? 'bg-gradient-to-r from-saffron-50 to-ancient-50 border-2 border-saffron-200' 
                      : 'bg-ancient-50 hover:bg-ancient-100'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      user.rank <= 3 ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' : 'bg-ancient-200 text-ancient-700'
                    }`}>
                      {user.rank <= 3 ? user.avatar : user.rank}
                    </div>
                    <div>
                      <div className="font-semibold text-ancient-800 flex items-center gap-2">
                        {user.name}
                        {user.name === 'You' && (
                          <span className="text-xs bg-saffron-200 text-saffron-800 px-2 py-1 rounded">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-ancient-600">
                        {user.contributions} contributions
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-saffron-600">{user.points.toLocaleString()}</div>
                    <div className="text-xs text-ancient-500">points</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'guidelines' && (
        <Card>
          <div className="p-6">
            <h3 className="text-xl font-semibold text-ancient-800 mb-6">Community Guidelines</h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-ancient-800 mb-2 flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Contributing Content
                </h4>
                <ul className="space-y-2 text-ancient-700">
                  <li>• Ensure accuracy of Sanskrit text and translations</li>
                  <li>• Provide proper source attribution</li>
                  <li>• Include correct chandas identification</li>
                  <li>• Add context and cultural background when possible</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-ancient-800 mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Quality Standards
                </h4>
                <ul className="space-y-2 text-ancient-700">
                  <li>• All submissions undergo peer review</li>
                  <li>• Verified scholars can fast-track approvals</li>
                  <li>• Community voting helps maintain quality</li>
                  <li>• Multiple sources preferred for validation</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-ancient-800 mb-2 flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Community Conduct
                </h4>
                <ul className="space-y-2 text-ancient-700">
                  <li>• Respectful and constructive feedback</li>
                  <li>• Cultural sensitivity in discussions</li>
                  <li>• Collaborative spirit over competition</li>
                  <li>• Support for learners at all levels</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};