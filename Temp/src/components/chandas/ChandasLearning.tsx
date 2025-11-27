import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  BookOpen, 
  Play, 
  CheckCircle, 
  Clock, 
  Star,
  Award,
  Target,
  Volume2,
  Eye,
  Brain,
  ArrowRight,
  Lock,
  Trophy,
  TrendingUp
} from 'lucide-react';
import type { Chandas, UserProgress } from '../../types/chandas';
import { CHANDAS_DATABASE } from '../../data/dummyData';

export const ChandasLearning: React.FC = () => {
  const [selectedChandas, setSelectedChandas] = useState<Chandas | null>(null);

  // Mock user progress
  const userProgress: UserProgress = {
    userId: 'user-1',
    chandasMastered: ['anushtubh', 'gayatri'],
    shlokasPracticed: ['gita-2-47', 'gayatri-mantra'],
    totalScore: 1247,
    currentStreak: 12,
    longestStreak: 25,
    gamesPlayed: 89,
    averageAccuracy: 87,
    timeSpent: 456, // minutes
    achievements: [],
    lastActivity: new Date(),
    skillLevel: 'intermediate'
  };

  // Learning paths
  const learningPaths = [
    {
      id: 'beginner',
      title: 'Beginner Path',
      description: 'Start your journey with basic concepts',
      estimatedTime: '2-4 weeks',
      lessons: [
        { id: 'basics', title: 'Introduction to Prosody', duration: '15 min', completed: true },
        { id: 'syllables', title: 'Laghu and Guru Syllables', duration: '20 min', completed: true },
        { id: 'patterns', title: 'Basic Patterns', duration: '25 min', completed: false },
        { id: 'anushtubh', title: 'Anushtubh Meter', duration: '30 min', completed: false },
        { id: 'gayatri', title: 'Gayatri Meter', duration: '25 min', completed: false }
      ],
      difficulty: 'Beginner',
      prerequisite: null
    },
    {
      id: 'intermediate',
      title: 'Intermediate Path',
      description: 'Explore more complex meters and variations',
      estimatedTime: '4-6 weeks',
      lessons: [
        { id: 'trishtubh', title: 'Trishtubh Meter', duration: '35 min', completed: false },
        { id: 'jagati', title: 'Jagati Meter', duration: '40 min', completed: false },
        { id: 'variations', title: 'Meter Variations', duration: '45 min', completed: false },
        { id: 'recognition', title: 'Advanced Recognition', duration: '50 min', completed: false }
      ],
      difficulty: 'Intermediate',
      prerequisite: 'beginner'
    },
    {
      id: 'advanced',
      title: 'Advanced Path',
      description: 'Master complex meters and become an expert',
      estimatedTime: '6-8 weeks',
      lessons: [
        { id: 'brihati', title: 'Brihati & Complex Meters', duration: '60 min', completed: false },
        { id: 'composition', title: 'Composition Techniques', duration: '75 min', completed: false },
        { id: 'analysis', title: 'Advanced Analysis', duration: '90 min', completed: false },
        { id: 'mastery', title: 'Mastery Assessment', duration: '120 min', completed: false }
      ],
      difficulty: 'Advanced',
      prerequisite: 'intermediate'
    }
  ];



  const getProgressPercentage = (path: any) => {
    const completed = path.lessons.filter((l: any) => l.completed).length;
    return Math.round((completed / path.lessons.length) * 100);
  };

  const isPathUnlocked = (pathId: string) => {
    const path = learningPaths.find(p => p.id === pathId);
    if (!path?.prerequisite) return true;
    
    const prerequisitePath = learningPaths.find(p => p.id === path.prerequisite);
    return prerequisitePath ? getProgressPercentage(prerequisitePath) === 100 : false;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-ancient-900 via-saffron-900 to-ancient-900 text-white">
        <div className="p-6">
          <h2 className="text-3xl font-ancient font-bold mb-2 flex items-center gap-2">
            <BookOpen className="w-8 h-8" />
            Chandas Learning Center 📚
          </h2>
          <p className="text-ancient-200">
            Master Sanskrit prosody through structured lessons and interactive practice
          </p>
        </div>
</Card>
      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="p-4 text-center">
            <Trophy className="w-6 h-6 mx-auto text-saffron-500 mb-2" />
            <div className="text-2xl font-bold text-ancient-800">{userProgress.chandasMastered.length}</div>
            <div className="text-xs text-ancient-600">Chandas Mastered</div>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <Target className="w-6 h-6 mx-auto text-blue-500 mb-2" />
            <div className="text-2xl font-bold text-ancient-800">{userProgress.averageAccuracy}%</div>
            <div className="text-xs text-ancient-600">Average Accuracy</div>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <Clock className="w-6 h-6 mx-auto text-green-500 mb-2" />
            <div className="text-2xl font-bold text-ancient-800">{Math.round(userProgress.timeSpent / 60)}h</div>
            <div className="text-xs text-ancient-600">Study Time</div>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <Star className="w-6 h-6 mx-auto text-yellow-500 mb-2" />
            <div className="text-2xl font-bold text-ancient-800">{userProgress.currentStreak}</div>
            <div className="text-xs text-ancient-600">Day Streak</div>
          </div>
        </Card>
      </div>

      {selectedChandas ? (
        /* Individual Chandas Study */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-ancient font-bold text-ancient-800">
                    {selectedChandas.name} ({selectedChandas.nameDevanagari})
                  </h2>
                  <Button
                    onClick={() => setSelectedChandas(null)}
                    variant="outline"
                  >
                    ← Back to Learning Paths
                  </Button>
                </div>

                <div className="space-y-6">
                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-semibold text-ancient-800 mb-2">Description</h3>
                    <p className="text-ancient-700">{selectedChandas.description}</p>
                  </div>

                  {/* Meter Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-ancient-800 mb-3">Meter Properties</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-ancient-600">Pattern:</span>
                          <code className="font-mono bg-ancient-100 px-2 py-1 rounded">
                            {selectedChandas.pattern}
                          </code>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-ancient-600">Syllables:</span>
                          <span className="font-medium">{selectedChandas.syllableCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-ancient-600">Difficulty:</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            selectedChandas.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                            selectedChandas.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {selectedChandas.difficulty}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-ancient-600">Popularity:</span>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < selectedChandas.popularity / 2 ? 'text-yellow-500 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-ancient-800 mb-3">Usage Context</h3>
                      <div className="space-y-2">
                        <div>
                          <span className="text-sm text-ancient-600">Commonly found in:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedChandas.usedIn.map(source => (
                              <span key={source} className="px-2 py-1 bg-lotus-100 text-lotus-800 rounded text-xs">
                                {source}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Rules */}
                  <div>
                    <h3 className="text-lg font-semibold text-ancient-800 mb-3">Prosodic Rules</h3>
                    <ul className="space-y-2">
                      {selectedChandas.rules.map((rule, index) => (
                        <li key={index} className="flex items-start gap-2 text-ancient-700">
                          <span className="text-saffron-500 mt-1">•</span>
                          {rule}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Examples */}
                  <div>
                    <h3 className="text-lg font-semibold text-ancient-800 mb-3">Examples</h3>
                    <div className="space-y-4">
                      {selectedChandas.examples.slice(0, 2).map((example, index) => (
                        <div key={index} className="bg-ancient-50 rounded-lg p-4">
                          <p className="font-sanskrit text-lg text-ancient-800 mb-2">{example}</p>
                          <div className="flex items-center gap-4 text-sm">
                            <Button size="sm" variant="outline" className="flex items-center gap-1">
                              <Volume2 className="w-3 h-3" />
                              Listen
                            </Button>
                            <Button size="sm" variant="outline" className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              Analyze
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            {/* Practice Section */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-ancient-800 mb-4">Practice</h3>
                <div className="space-y-3">
                  <Button className="w-full bg-gradient-to-r from-saffron-600 to-ancient-600">
                    <Play className="w-4 h-4 mr-2" />
                    Start Practice
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Brain className="w-4 h-4 mr-2" />
                    Take Quiz
                  </Button>
                  <Button className="w-full" variant="outline">
                    <Volume2 className="w-4 h-4 mr-2" />
                    Pronunciation Practice
                  </Button>
                </div>
              </div>
            </Card>

            {/* Related Chandas */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-ancient-800 mb-4">Related Meters</h3>
                <div className="space-y-2">
                  {CHANDAS_DATABASE
                    .filter(c => c.id !== selectedChandas.id && c.difficulty === selectedChandas.difficulty)
                    .slice(0, 3)
                    .map(chandas => (
                      <button
                        key={chandas.id}
                        onClick={() => setSelectedChandas(chandas)}
                        className="w-full text-left p-3 rounded-lg border border-ancient-200 hover:bg-ancient-50 transition-colors"
                      >
                        <div className="font-medium text-ancient-800">{chandas.name}</div>
                        <div className="text-sm text-ancient-600">{chandas.syllableCount} syllables</div>
                      </button>
                    ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        /* Learning Paths Overview */
        <div className="space-y-6">
          {/* Learning Paths */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {learningPaths.map((path) => {
              const progress = getProgressPercentage(path);
              const unlocked = isPathUnlocked(path.id);
              
              return (
                <Card key={path.id} className={`relative overflow-hidden ${!unlocked ? 'opacity-60' : ''}`}>
                  {!unlocked && (
                    <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center z-10">
                      <Lock className="w-8 h-8 text-ancient-400" />
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-semibold text-ancient-800">{path.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        path.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                        path.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {path.difficulty}
                      </span>
                    </div>

                    <p className="text-ancient-600 mb-4">{path.description}</p>

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between text-sm">
                        <span className="text-ancient-600">Progress</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <div className="w-full bg-ancient-100 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-saffron-500 to-ancient-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-ancient-500">
                        <span>{path.lessons.filter(l => l.completed).length}/{path.lessons.length} lessons</span>
                        <span>{path.estimatedTime}</span>
                      </div>
                    </div>

                    <div className="space-y-2 mb-6">
                      {path.lessons.slice(0, 3).map((lesson) => (
                        <div key={lesson.id} className="flex items-center gap-2 text-sm">
                          {lesson.completed ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-ancient-300" />
                          )}
                          <span className={lesson.completed ? 'text-ancient-600' : 'text-ancient-800'}>
                            {lesson.title}
                          </span>
                          <span className="text-ancient-400 text-xs ml-auto">{lesson.duration}</span>
                        </div>
                      ))}
                      {path.lessons.length > 3 && (
                        <div className="text-xs text-ancient-500 pl-6">
                          +{path.lessons.length - 3} more lessons
                        </div>
                      )}
                    </div>

                    <Button
                      className="w-full bg-gradient-to-r from-saffron-600 to-ancient-600"
                      disabled={!unlocked}
                    >
                      {progress === 0 ? 'Start Path' : progress === 100 ? 'Review' : 'Continue'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Chandas Library */}
          <Card>
            <div className="p-6">
              <h3 className="text-xl font-semibold text-ancient-800 mb-6">Chandas Library</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {CHANDAS_DATABASE.map((chandas) => {
                  const isMastered = userProgress.chandasMastered.includes(chandas.id);
                  
                  return (
                    <button
                      key={chandas.id}
                      onClick={() => setSelectedChandas(chandas)}
                      className="text-left p-4 rounded-lg border-2 border-ancient-200 hover:border-saffron-300 hover:bg-saffron-50 transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-ancient-800">{chandas.name}</h4>
                        {isMastered && <Award className="w-4 h-4 text-saffron-500" />}
                      </div>
                      <p className="text-sm font-sanskrit text-ancient-600 mb-2">
                        {chandas.nameDevanagari}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-ancient-500">
                        <span>{chandas.syllableCount} syllables</span>
                        <span>⭐ {chandas.popularity}/10</span>
                        <span className={`px-1 py-0.5 rounded ${
                          chandas.difficulty === 'beginner' ? 'bg-green-100 text-green-600' :
                          chandas.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {chandas.difficulty}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <div className="p-6 text-center">
                <Brain className="w-12 h-12 mx-auto text-saffron-500 mb-4" />
                <h3 className="text-lg font-semibold text-ancient-800 mb-2">Daily Challenge</h3>
                <p className="text-ancient-600 mb-4">Test your knowledge with today's challenge</p>
                <Button className="bg-gradient-to-r from-saffron-600 to-ancient-600">
                  Start Challenge
                </Button>
              </div>
            </Card>

            <Card>
              <div className="p-6 text-center">
                <Target className="w-12 h-12 mx-auto text-blue-500 mb-4" />
                <h3 className="text-lg font-semibold text-ancient-800 mb-2">Practice Mode</h3>
                <p className="text-ancient-600 mb-4">Free practice with any chandas</p>
                <Button variant="outline">
                  Start Practicing
                </Button>
              </div>
            </Card>

            <Card>
              <div className="p-6 text-center">
                <TrendingUp className="w-12 h-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-semibold text-ancient-800 mb-2">Progress Report</h3>
                <p className="text-ancient-600 mb-4">View detailed learning analytics</p>
                <Button variant="outline">
                  View Report
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};