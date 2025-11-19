import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContextBypass';
import { 
  Mic, 
  Play, 
  Pause, 
  Volume2, 
  RotateCcw, 
  Trophy, 
  BookOpen, 
  Gamepad2,
  Zap,
  Globe,
  Users,
  Search,
  Music,
  Target,
  Brain,
  Heart,
  Sparkles,
  Crown,
  Star,
  Award,
  TrendingUp,
  Clock,
  Calendar,
  Sun,
  Moon,
  Waves,
  Activity,
  Headphones
} from 'lucide-react';

// Enhanced dummy data
import { 
  ENHANCED_SHLOKAS, 
  ENHANCED_CHANDAS_DATABASE,
  ENHANCED_DAILY_QUOTES,
  ENHANCED_ACHIEVEMENTS,
  RAGA_MAPPINGS
} from '../data/enhancedDummyData';

// Original data for backward compatibility
import { 
  CHANDAS_DATABASE, 
  SAMPLE_SHLOKAS, 
  DAILY_QUOTES, 
  SANSKRIT_GREETINGS,
  ACHIEVEMENTS 
} from '../data/dummyData';

// Import feature components
import { EnhancedKaraokePlayer } from '../components/chandas/EnhancedKaraokePlayer';
import { ChandasGames } from '../components/chandas/ChandasGames';
import { SpeechToChandas } from '../components/chandas/SpeechToChandas';
import { ChandasCommunity } from '../components/chandas/ChandasCommunity';
import { ChandasLearning } from '../components/chandas/ChandasLearning';

export const MainDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('analyze');
  const [isListening, setIsListening] = useState(false);
  const [selectedShloka, setSelectedShloka] = useState(ENHANCED_SHLOKAS[0]);
  const [currentQuote, setCurrentQuote] = useState(ENHANCED_DAILY_QUOTES[0]);
  const [showResults, setShowResults] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  // Refs for GSAP animations (Note: GSAP would need to be properly installed)
  const heroRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Initialize particles for background animation
  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2
    }));
    setParticles(newParticles);
  }, []);

  // Enhanced time-based greeting
  const getEnhancedGreeting = () => {
    const hour = new Date().getHours();
    
    if (hour < 6) return {
      sanskrit: 'प्रभाते नमस्ते',
      transliteration: 'prabhāte namaste',
      translation: 'Good early dawn',
      mood: 'mystical',
      icon: Moon,
      color: 'from-indigo-600 to-purple-600'
    };
    if (hour < 12) return {
      sanskrit: 'शुभ प्रभात',
      transliteration: 'śubha prabhāt',
      translation: 'Auspicious morning',
      mood: 'energetic',
      icon: Sun,
      color: 'from-orange-500 to-yellow-500'
    };
    if (hour < 17) return {
      sanskrit: 'मध्याह्न नमस्कार',
      transliteration: 'madhyāhna namaskār',
      translation: 'Midday greetings',
      mood: 'focused',
      icon: Target,
      color: 'from-blue-500 to-cyan-500'
    };
    if (hour < 20) return {
      sanskrit: 'सायं नमस्ते',
      transliteration: 'sāyaṃ namaste',
      translation: 'Evening greetings',
      mood: 'peaceful',
      icon: Heart,
      color: 'from-pink-500 to-rose-500'
    };
    return {
      sanskrit: 'रात्रि नमस्कार',
      transliteration: 'rātri namaskār',
      translation: 'Night salutations',
      mood: 'contemplative',
      icon: Star,
      color: 'from-violet-600 to-purple-700'
    };
  };

  // Enhanced daily quote with rotation
  const getDailyQuote = () => {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return ENHANCED_DAILY_QUOTES[dayOfYear % ENHANCED_DAILY_QUOTES.length];
  };

  // Enhanced analysis function
  const analyzeChandas = async () => {
    setIsAnalyzing(true);
    setShowResults(false);
    
    // Simulate advanced AI analysis with enhanced loading
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Enhanced mock analysis with complete prosodic details
    const selectedChandas = ENHANCED_CHANDAS_DATABASE[Math.floor(Math.random() * ENHANCED_CHANDAS_DATABASE.length)];
    const mockResult = {
      inputText,
      detectedChandas: selectedChandas,
      confidence: 0.94 + Math.random() * 0.05,
      prosodica: {
        totalSyllables: selectedChandas.syllableCount,
        meterStructure: selectedChandas.structure,
        ganaPattern: selectedChandas.ganaPattern,
        rhythmAnalysis: {
          tempo: selectedChandas.musicalProperties.tempo,
          mood: selectedChandas.musicalProperties.mood,
          emotionalTone: selectedChandas.musicalProperties.suitableFor[0]
        }
      },
      syllableBreakdown: [
        { text: 'कर्', type: 'guru', duration: 600, pitch: 'medium', stress: 'primary' },
        { text: 'मण्ये', type: 'guru', duration: 580, pitch: 'high', stress: 'secondary' },
        { text: 'वा', type: 'laghu', duration: 300, pitch: 'medium', stress: 'weak' },
        { text: 'धि', type: 'laghu', duration: 320, pitch: 'low', stress: 'weak' },
        { text: 'का', type: 'laghu', duration: 280, pitch: 'medium', stress: 'weak' },
        { text: 'रस्', type: 'guru', duration: 620, pitch: 'high', stress: 'primary' }
      ],
      suggestions: [
        'Perfect meter alignment detected',
        'Consider the spiritual significance of this chandas',
        'This meter is excellent for ' + selectedChandas.musicalProperties.suitableFor[0],
        'Historical usage: ' + selectedChandas.historicalUsage.majorWorks[0]
      ],
      musicality: {
        recommendedRaga: Object.keys(RAGA_MAPPINGS)[Math.floor(Math.random() * Object.keys(RAGA_MAPPINGS).length)],
        emotionalRasas: ['shanta', 'bhakti', 'vira'],
        performance: {
          idealTempo: '72 BPM',
          voiceRegister: 'Middle',
          accompaniment: ['Tanpura', 'Tabla', 'Flute']
        }
      }
    };
    
    setAnalysisResult(mockResult);
    setIsAnalyzing(false);
    setShowResults(true);
  };

  const greeting = getEnhancedGreeting();
  const currentDailyQuote = getDailyQuote();

  return (
    <div className="min-h-screen bg-gradient-to-br from-ancient-50 via-sandalwood-50 to-saffron-50 relative overflow-hidden">
      {/* Animated Particles Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" ref={particlesRef}>
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 bg-gradient-to-r from-saffron-300 to-ancient-300 rounded-full opacity-20 animate-pulse"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: '3s'
            }}
          />
        ))}
      </div>

      {/* Enhanced Hero Section */}
      <div 
        ref={heroRef}
        className="relative z-10 bg-gradient-to-r from-ancient-900 via-saffron-800 to-ancient-900 text-white overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('/patterns/om-pattern.svg')] opacity-10"></div>
        <div className="relative w-full px-6 py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between mb-8 gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-4">
                <greeting.icon className="w-8 h-8 text-saffron-300" />
                <div>
                  <h1 className="text-4xl font-ancient font-bold bg-gradient-to-r from-saffron-300 to-white bg-clip-text text-transparent">
                    {greeting.sanskrit}
                  </h1>
                  <p className="text-saffron-200 font-sanskrit text-lg">
                    {greeting.transliteration}
                  </p>
                  <p className="text-ancient-200 text-sm">
                    {greeting.translation} • {greeting.mood}
                  </p>
                </div>
              </div>
              <p className="text-ancient-200 text-lg">
                Welcome back, <span className="font-semibold text-saffron-300">{user?.name}</span>! 
                Ready to explore the divine rhythms of Sanskrit poetry?
              </p>
            </div>
            
            {/* Daily Quote Card */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 max-w-md">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-5 h-5 text-saffron-300" />
                  <span className="text-saffron-300 font-semibold">Daily Wisdom</span>
                </div>
                <blockquote className="text-white font-sanskrit text-lg mb-2">
                  "{currentDailyQuote.sanskrit}"
                </blockquote>
                <p className="text-ancient-200 text-sm mb-1">
                  {currentDailyQuote.transliteration}
                </p>
                <p className="text-ancient-300 text-sm">
                  "{currentDailyQuote.translation}"
                </p>
                <p className="text-saffron-300 text-xs mt-2">
                  — {currentDailyQuote.source}
                </p>
              </div>
            </Card>
          </div>

          {/* Enhanced Navigation Tabs */}
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { id: 'analyze', label: 'AI Analyzer', icon: Brain, gradient: 'from-purple-500 to-indigo-600' },
              { id: 'karaoke', label: 'Divine Karaoke', icon: Headphones, gradient: 'from-pink-500 to-rose-600' },
              { id: 'speech', label: 'Voice Oracle', icon: Mic, gradient: 'from-emerald-500 to-teal-600' },
              { id: 'games', label: 'Sanskrit Games', icon: Gamepad2, gradient: 'from-orange-500 to-red-600' },
              { id: 'learn', label: 'Sacred Learning', icon: BookOpen, gradient: 'from-blue-500 to-cyan-600' },
              { id: 'community', label: 'Sangha', icon: Users, gradient: 'from-violet-500 to-purple-600' },
              { id: 'compose', label: 'Verse Composer', icon: Zap, gradient: 'from-yellow-500 to-orange-600' }
            ].map((tab) => (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative px-6 py-3 font-semibold transition-all duration-300 transform hover:scale-105
                  ${activeTab === tab.id 
                    ? `bg-gradient-to-r ${tab.gradient} text-white shadow-2xl shadow-white/25` 
                    : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'
                  }
                `}
              >
                <tab.icon className="w-5 h-5 mr-2" />
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-lg animate-pulse" />
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full px-6 py-8">
        {activeTab === 'analyze' && (
          <div ref={cardsRef} className="space-y-8">
            {/* Enhanced Analysis Interface */}
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-saffron-50 to-ancient-50 opacity-50"></div>
              <div className="relative p-8">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-ancient font-bold text-ancient-800 mb-4 flex items-center justify-center gap-3">
                    <Brain className="w-8 h-8 text-saffron-600" />
                    <Sparkles className="w-6 h-6 text-saffron-500" />
                    AI-Powered Chandas Analyzer
                    <Sparkles className="w-6 h-6 text-saffron-500" />
                  </h2>
                  <p className="text-ancient-600 text-lg w-full text-center">
                    Enter your Sanskrit verse and discover its intricate prosodic patterns, 
                    musical properties, and spiritual significance with our advanced AI
                  </p>
                </div>

                <div className="w-full">
                  <div className="relative mb-6">
                    <Input
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Enter your Sanskrit verse here... (e.g., कर्मण्येवाधिकारस्ते मा फलेषु कदाचन)"
                      className="w-full p-6 text-lg font-sanskrit bg-white/80 backdrop-blur-sm border-2 border-ancient-200 focus:border-saffron-400 rounded-xl shadow-lg"
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2 flex gap-2">
                      <Button
                        onClick={() => setIsListening(!isListening)}
                        variant="outline"
                        size="sm"
                        className={`${isListening ? 'bg-red-100 text-red-600 border-red-300' : ''}`}
                      >
                        <Mic className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => setInputText('')}
                        variant="outline"
                        size="sm"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="text-center mb-8">
                    <Button
                      onClick={analyzeChandas}
                      disabled={!inputText.trim() || isAnalyzing}
                      className="px-12 py-4 text-lg font-semibold bg-gradient-to-r from-saffron-600 via-ancient-600 to-saffron-600 hover:from-saffron-700 hover:via-ancient-700 hover:to-saffron-700 transform hover:scale-105 transition-all duration-300 shadow-xl"
                    >
                      {isAnalyzing ? (
                        <>
                          <Activity className="w-5 h-5 mr-2 animate-spin" />
                          Analyzing Sacred Patterns...
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5 mr-2" />
                          Analyze Chandas
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Enhanced Results Display */}
                  {showResults && analysisResult && (
                    <div ref={resultsRef} className="mt-8 space-y-6">
                      {/* Main Results Card */}
                      <Card className="bg-gradient-to-br from-white to-ancient-50 border-2 border-saffron-200 shadow-2xl">
                        <div className="p-8">
                          <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold text-ancient-800 mb-2 flex items-center justify-center gap-2">
                              <Crown className="w-6 h-6 text-saffron-600" />
                              Analysis Complete
                            </h3>
                            <div className="flex items-center justify-center gap-4 text-sm text-ancient-600">
                              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">
                                {Math.round(analysisResult.confidence * 100)}% Confidence
                              </span>
                              <span className="bg-saffron-100 text-saffron-800 px-3 py-1 rounded-full font-semibold">
                                {analysisResult.detectedChandas.name}
                              </span>
                              <span className="bg-ancient-100 text-ancient-800 px-3 py-1 rounded-full font-semibold">
                                {analysisResult.prosodica.totalSyllables} Syllables
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Meter Information */}
                            <div className="space-y-4">
                              <h4 className="text-lg font-semibold text-ancient-800 flex items-center gap-2">
                                <Target className="w-5 h-5 text-saffron-600" />
                                Prosodic Analysis
                              </h4>
                              <div className="bg-ancient-50 p-6 rounded-lg space-y-3">
                                <div className="flex justify-between">
                                  <span className="text-ancient-600">Chandas:</span>
                                  <span className="font-semibold text-ancient-800">
                                    {analysisResult.detectedChandas.name} ({analysisResult.detectedChandas.nameDevanagari})
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-ancient-600">Category:</span>
                                  <span className="font-semibold text-ancient-800">{analysisResult.detectedChandas.category}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-ancient-600">Structure:</span>
                                  <span className="font-semibold text-ancient-800">{analysisResult.prosodica.meterStructure}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-ancient-600">Pattern:</span>
                                  <span className="font-sanskrit text-ancient-800">{analysisResult.detectedChandas.pattern}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-ancient-600">Gana:</span>
                                  <span className="font-semibold text-ancient-800">{analysisResult.prosodica.ganaPattern.join(', ')}</span>
                                </div>
                              </div>
                            </div>

                            {/* Musical Properties */}
                            <div className="space-y-4">
                              <h4 className="text-lg font-semibold text-ancient-800 flex items-center gap-2">
                                <Music className="w-5 h-5 text-saffron-600" />
                                Musical Analysis
                              </h4>
                              <div className="bg-ancient-50 p-6 rounded-lg space-y-3">
                                <div className="flex justify-between">
                                  <span className="text-ancient-600">Recommended Raga:</span>
                                  <span className="font-semibold text-ancient-800">{analysisResult.musicality.recommendedRaga}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-ancient-600">Ideal Tempo:</span>
                                  <span className="font-semibold text-ancient-800">{analysisResult.musicality.performance.idealTempo}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-ancient-600">Voice Register:</span>
                                  <span className="font-semibold text-ancient-800">{analysisResult.musicality.performance.voiceRegister}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-ancient-600">Mood:</span>
                                  <span className="font-semibold text-ancient-800 capitalize">{analysisResult.prosodica.rhythmAnalysis.mood}</span>
                                </div>
                                <div>
                                  <span className="text-ancient-600">Accompaniment:</span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {analysisResult.musicality.performance.accompaniment.map((instrument: string, index: number) => (
                                      <span key={index} className="bg-saffron-100 text-saffron-800 px-2 py-1 rounded text-xs">
                                        {instrument}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Syllable Breakdown */}
                          <div className="mt-8">
                            <h4 className="text-lg font-semibold text-ancient-800 mb-4 flex items-center gap-2">
                              <Waves className="w-5 h-5 text-saffron-600" />
                              Syllable Analysis
                            </h4>
                            <div className="bg-ancient-50 p-6 rounded-lg">
                              <div className="flex flex-wrap gap-2 mb-4">
                                {analysisResult.syllableBreakdown.map((syllable: any, index: number) => (
                                  <div 
                                    key={index}
                                    className={`
                                      px-3 py-2 rounded-lg font-sanskrit text-lg font-semibold border-2 transition-all duration-300 hover:scale-110
                                      ${syllable.type === 'guru' 
                                        ? 'bg-saffron-100 border-saffron-300 text-saffron-800' 
                                        : 'bg-ancient-100 border-ancient-300 text-ancient-800'
                                      }
                                    `}
                                  >
                                    {syllable.text}
                                    <div className="text-xs mt-1 text-center">
                                      {syllable.type} • {syllable.duration}ms
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="text-sm text-ancient-600">
                                <span className="font-semibold">Legend:</span> 
                                <span className="ml-2 text-saffron-700">Guru (Long syllables)</span> | 
                                <span className="ml-2 text-ancient-700">Laghu (Short syllables)</span>
                              </div>
                            </div>
                          </div>

                          {/* Suggestions */}
                          <div className="mt-8">
                            <h4 className="text-lg font-semibold text-ancient-800 mb-4 flex items-center gap-2">
                              <TrendingUp className="w-5 h-5 text-saffron-600" />
                              AI Insights & Suggestions
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {analysisResult.suggestions.map((suggestion: string, index: number) => (
                                <div key={index} className="bg-gradient-to-r from-saffron-50 to-ancient-50 p-4 rounded-lg border border-saffron-200">
                                  <p className="text-ancient-700 flex items-start gap-2">
                                    <Star className="w-4 h-4 text-saffron-500 mt-0.5 flex-shrink-0" />
                                    {suggestion}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Quick Examples and User Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-ancient-800 mb-4 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-saffron-600" />
                    Sacred Examples
                  </h3>
                  <div className="space-y-4">
                    {ENHANCED_SHLOKAS.slice(0, 3).map((shloka) => (
                      <div
                        key={shloka.id}
                        className="p-4 bg-gradient-to-r from-ancient-50 to-saffron-50 rounded-lg cursor-pointer hover:from-saffron-100 hover:to-ancient-100 transition-all duration-300 transform hover:scale-[1.02] border border-ancient-200 hover:border-saffron-300"
                        onClick={() => setInputText(shloka.sanskrit)}
                      >
                        <p className="font-sanskrit text-ancient-800 text-lg mb-2">
                          {shloka.sanskrit.length > 80 ? shloka.sanskrit.slice(0, 80) + '...' : shloka.sanskrit}
                        </p>
                        <p className="text-ancient-600 text-sm mb-2 italic">
                          {shloka.transliteration.length > 100 ? shloka.transliteration.slice(0, 100) + '...' : shloka.transliteration}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-ancient-500">
                          <span className="bg-saffron-100 text-saffron-700 px-2 py-1 rounded">
                            {shloka.chandas.name}
                          </span>
                          <span>{shloka.source}</span>
                          <span>{shloka.chandas.syllablePattern.split('|').length} lines</span>
                          <span className={`px-2 py-1 rounded ${
                            shloka.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                            shloka.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                            shloka.difficulty === 'advanced' ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {shloka.difficulty}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* User Progress */}
              <Card>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-ancient-800 mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-saffron-600" />
                    Your Journey
                  </h3>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-gradient-to-br from-saffron-100 to-ancient-100 rounded-lg">
                      <div className="text-3xl font-bold text-ancient-800">47</div>
                      <div className="text-sm text-ancient-600">Verses Analyzed</div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-ancient-600">Accuracy Rate</span>
                        <span className="font-semibold text-saffron-600">94%</span>
                      </div>
                      <div className="w-full bg-ancient-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-saffron-500 to-ancient-500 h-2 rounded-full" style={{width: '94%'}}></div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-ancient-600">Current Streak</span>
                        <span className="font-semibold text-ancient-800 flex items-center gap-1">
                          <Star className="w-4 h-4 text-saffron-500" />
                          12 days
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-ancient-600">Chandas Mastered</span>
                        <span className="font-semibold text-ancient-800">3/15</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-ancient-200">
                      <h4 className="font-semibold text-ancient-700 mb-2">Recent Achievement</h4>
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-saffron-50 to-ancient-50 rounded-lg">
                        <span className="text-2xl">🏆</span>
                        <div>
                          <p className="text-sm font-medium text-ancient-800">Vedic Scholar</p>
                          <p className="text-xs text-ancient-600">Mastered Gayatri meter</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Other tabs with enhanced styling */}
        {activeTab === 'karaoke' && (
          <div className="animate-fadeIn">
            <EnhancedKaraokePlayer 
              shloka={selectedShloka} 
              onComplete={() => console.log('Karaoke completed!')} 
            />
          </div>
        )}

        {activeTab === 'speech' && (
          <div className="animate-fadeIn">
            <SpeechToChandas 
              selectedShloka={selectedShloka}
              onAnalysisComplete={(analysis) => console.log('Speech analysis:', analysis)}
            />
          </div>
        )}

        {activeTab === 'games' && (
          <div className="animate-fadeIn">
            <ChandasGames />
          </div>
        )}

        {activeTab === 'learn' && (
          <div className="animate-fadeIn">
            <ChandasLearning />
          </div>
        )}

        {activeTab === 'community' && (
          <div className="animate-fadeIn">
            <ChandasCommunity />
          </div>
        )}

        {activeTab === 'compose' && (
          <div className="animate-fadeIn">
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white p-8">
                <h2 className="text-3xl font-ancient font-bold mb-4 flex items-center gap-3">
                  <Zap className="w-8 h-8" />
                  Divine Verse Composer
                </h2>
                <p className="text-purple-100 text-lg">
                  Channel the cosmic rhythm and compose your own Sanskrit verses with AI guidance
                </p>
              </div>
              
              <div className="p-8">
                <div className="text-center py-12">
                  <div className="relative mb-8">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Brain className="w-12 h-12 text-white" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full blur-xl opacity-20 animate-pulse"></div>
                  </div>
                  
                  <h3 className="text-2xl font-semibold text-ancient-700 mb-4">
                    Create Sacred Verses
                  </h3>
                  <p className="text-ancient-600 mb-8 max-w-2xl mx-auto">
                    Choose a chandas meter and let our AI help you compose verses that honor 
                    the ancient traditions while expressing your unique spiritual insights
                  </p>
                  
                  <div className="flex flex-wrap justify-center gap-4">
                    <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-8 py-4 text-lg">
                      <Brain className="w-5 h-5 mr-2" />
                      Start Composing
                    </Button>
                    <Button variant="outline" className="px-8 py-4 text-lg border-purple-300 text-purple-700 hover:bg-purple-50">
                      <BookOpen className="w-5 h-5 mr-2" />
                      Composition Guide
                    </Button>
                    <Button variant="outline" className="px-8 py-4 text-lg border-indigo-300 text-indigo-700 hover:bg-indigo-50">
                      <Crown className="w-5 h-5 mr-2" />
                      Master Templates
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};