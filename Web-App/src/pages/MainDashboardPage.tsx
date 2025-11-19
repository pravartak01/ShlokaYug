import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContextBypass';
import { 
  Mic, 
  RotateCcw, 
  Trophy, 
  BookOpen, 
  Gamepad2,
  Zap,
  Users,
  Search,
  Music,
  Target,
  Heart,
  Star,
  Sun,
  Moon
} from 'lucide-react';

// Import enhanced dummy data
import { 
  ENHANCED_SHLOKAS, 
  ENHANCED_CHANDAS_DATABASE,
  ENHANCED_DAILY_QUOTES,
  RAGA_MAPPINGS
} from '../data/enhancedDummyData';

// Import original data for backward compatibility

// Import feature components

export const MainDashboardPage: React.FC = () => {
 
    heroGlow: true,
    particleFlow: true,
    breathingCards: true
  });

  // Refs for GSAP animations

  // Enhanced time-based greeting with mood

  // Enhanced daily quote with rotation

  // Enhanced analysis with detailed prosodic information
      suggestions: [
        'This appears to be Anushtubh meter',
        'Consider natural pauses for better recitation'
      ]
    };
    
    setAnalysisResult(mockResult);
    setIsAnalyzing(false);
  };

  // Voice input simulation
  const startListening = () => {
    setIsListening(true);
    setTimeout(() => {
      setInputText('कर्मण्येवाधिकारस्ते मा फलेषु कदाचन');
      setIsListening(false);
    }, 3000);
  };

   greeting = getEnhancedGreeting();
   dailyQuote = getDailyQuote();

  return (
    <div className="min-h-screen bg-gradient-to-br from-ancient-50 via-saffron-50 to-sandalwood-50">
      {/* Header with Greeting */}
      <div className="bg-gradient-to-r from-ancient-900 via-saffron-800 to-ancient-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-ancient font-bold">
                🕉️ ShlokaYug
              </h1>
              <p className="text-ancient-200 mt-1">
                {greeting.sanskrit} • {greeting.transliteration}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-ancient-200">Welcome back,</p>
              <p className="text-xl font-semibold">{user?.name || 'Sanskrit Learner'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Quote */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <Card className="bg-gradient-to-r from-lotus-100 to-saffron-100 border-ancient-200">
          <div className="p-4 text-center">
            <p className="text-lg font-sanskrit text-ancient-800">
              "{dailyQuote.sanskrit}"
            </p>
            <p className="text-sm text-ancient-600 mt-1 italic">
              {dailyQuote.transliteration}
            </p>
            <p className="text-sm text-ancient-700 mt-2">
              "{dailyQuote.meaning}" - <span className="font-semibold">{dailyQuote.source}</span>
            </p>
          </div>
        </Card>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex flex-wrap gap-2 bg-white rounded-lg p-2 shadow-sm border border-ancient-200">
          {[
            { id: 'analyze', label: 'Analyze', icon: Target },
            { id: 'karaoke', label: 'Karaoke', icon: Music },
            { id: 'speech', label: 'Speech AI', icon: Mic },
            { id: 'games', label: 'Games', icon: Gamepad2 },
            { id: 'learn', label: 'Learn', icon: BookOpen },
            { id: 'community', label: 'Community', icon: Users },
            { id: 'compose', label: 'Compose', icon: Brain }
          ].map(tab => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2"
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'analyze' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Input Section */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <div className="p-6">
                  <h2 className="text-2xl font-ancient font-bold text-ancient-800 mb-4 flex items-center gap-2">
                    <Target className="w-6 h-6" />
                    Chandas Analysis
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-ancient-700 mb-2">
                        Enter Sanskrit Text (Devanagari/IAST)
                      </label>
                      <div className="relative">
                        <textarea
                          value={inputText}
                          onChange={(e) => setInputText(e.target.value)}
                          placeholder="कर्मण्येवाधिकारस्ते मा फलेषु कदाचन..."
                          className="w-full h-32 p-4 border border-ancient-300 rounded-lg focus:ring-2 focus:ring-saffron-500 focus:border-saffron-500 font-sanskrit text-lg resize-none"
                        />
                        <Button
                          onClick={startListening}
                          disabled={isListening}
                          className={`absolute top-2 right-2 ${isListening ? 'animate-pulse bg-red-500' : ''}`}
                          size="sm"
                        >
                          <Mic className="w-4 h-4" />
                          {isListening ? 'Listening...' : 'Voice Input'}
                        </Button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={analyzeChandas}
                        disabled={!inputText.trim() || isAnalyzing}
                        className="flex-1 bg-gradient-to-r from-saffron-600 to-ancient-600 hover:from-saffron-700 hover:to-ancient-700"
                      >
                        {isAnalyzing ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 mr-2" />
                            Analyze Chandas
                          </>
                        )}
                      </Button>
                      <Button variant="outline" onClick={() => setInputText('')}>
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Multi-script support */}
                    <div className="text-center">
                      <p className="text-sm text-ancient-600 mb-2">Supported Scripts:</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {['देवनागरी', 'தமிழ்', 'తెలుగు', 'ಕನ್ನಡ', 'বাংলা', 'IAST'].map(script => (
                          <span key={script} className="px-2 py-1 bg-ancient-100 text-ancient-700 rounded text-xs">
                            {script}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Analysis Results */}
                    {analysisResult && (
                      <div className="mt-6 p-4 bg-ancient-50 rounded-lg">
                        <h3 className="font-semibold text-ancient-800 mb-2">Analysis Result</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Detected Meter:</span>
                            <span className="font-medium">{analysisResult.detectedChandas.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Confidence:</span>
                            <span className="font-medium text-green-600">{Math.round(analysisResult.confidence * 100)}%</span>
                          </div>
                          <div className="mt-3">
                            <span className="text-ancient-600">Suggestions:</span>
                            <ul className="mt-1 space-y-1">
                              {analysisResult.suggestions.map((suggestion, index) => (
                                <li key={index} className="text-ancient-700 text-xs">• {suggestion}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* Results/Quick Actions */}
            <div className="space-y-6">
              {/* Quick Analysis */}
              <Card>
                <div className="p-4">
                  <h3 className="font-semibold text-ancient-800 mb-3 flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Quick Examples
                  </h3>
                  <div className="space-y-2">
                    {SAMPLE_SHLOKAS.slice(0, 2).map(shloka => (
                      <div
                        key={shloka.id}
                        className="p-3 bg-ancient-50 rounded cursor-pointer hover:bg-ancient-100 transition-colors"
                        onClick={() => setInputText(shloka.text)}
                      >
                        <p className="text-sm font-sanskrit text-ancient-800">
                          {shloka.text.slice(0, 30)}...
                        </p>
                        <p className="text-xs text-ancient-600 mt-1">
                          {shloka.chandas.name} • {shloka.source}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* User Stats */}
              <Card>
                <div className="p-4">
                  <h3 className="font-semibold text-ancient-800 mb-3 flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    Your Progress
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-ancient-600">Shlokas Analyzed</span>
                      <span className="font-semibold text-ancient-800">47</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-ancient-600">Accuracy Rate</span>
                      <span className="font-semibold text-saffron-600">94%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-ancient-600">Current Streak</span>
                      <span className="font-semibold text-lotus-600">12 days</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-ancient-600">Chandas Mastered</span>
                      <span className="font-semibold text-ancient-800">3/7</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Recent Achievements */}
              <Card>
                <div className="p-4">
                  <h3 className="font-semibold text-ancient-800 mb-3 flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    Recent Achievements
                  </h3>
                  <div className="space-y-2">
                    {ACHIEVEMENTS.slice(0, 3).map(achievement => (
                      <div key={achievement.id} className="flex items-center gap-3 p-2 bg-gradient-to-r from-lotus-50 to-saffron-50 rounded">
                        <span className="text-lg">{achievement.icon}</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-ancient-800">{achievement.name}</p>
                          <p className="text-xs text-ancient-600">{achievement.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'karaoke' && (
          <KaraokePlayer 
            shloka={selectedShloka} 
            onComplete={() => console.log('Karaoke completed!')} 
          />
        )}

        {activeTab === 'speech' && (
          <SpeechToChandas 
            selectedShloka={selectedShloka}
            onAnalysisComplete={(analysis) => console.log('Speech analysis:', analysis)}
          />
        )}

        {activeTab === 'games' && <ChandasGames />}

        {activeTab === 'learn' && <ChandasLearning />}

        {activeTab === 'community' && <ChandasCommunity />}

        {activeTab === 'compose' && (
          <Card>
            <div className="p-6">
              <h2 className="text-2xl font-ancient font-bold text-ancient-800 mb-4 flex items-center gap-2">
                <Brain className="w-6 h-6" />
                Reverse Composer ✍️
              </h2>
              <div className="text-center py-12">
                <Brain className="w-16 h-16 mx-auto text-ancient-400 mb-4" />
                <h3 className="text-xl font-semibold text-ancient-700 mb-2">
                  Create Your Own Sanskrit Verses
                </h3>
                <p className="text-ancient-600 mb-6 max-w-md mx-auto">
                  Choose a chandas meter and compose your own verses with AI-powered assistance
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button className="bg-gradient-to-r from-saffron-600 to-ancient-600">
                    <Brain className="w-4 h-4 mr-2" />
                    Start Composing
                  </Button>
                  <Button variant="outline">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Composition Guide
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};