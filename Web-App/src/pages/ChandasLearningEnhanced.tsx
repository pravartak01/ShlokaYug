import { useState, useEffect } from 'react';
import { ENHANCED_SHLOKAS } from '../data/enhancedDummyData';
import { EnhancedKaraokePlayer } from '../components/EnhancedKaraokePlayer';

interface ChandasPattern {
  name: string;
  pattern: string;
  description: string;
  example: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: 'Sama' | 'Ardhasama' | 'Vishama';
  ganas: string[];
  musicalProperties: {
    tempo: string;
    mood: string;
    raga: string;
  };
}

const ENHANCED_CHANDAS_PATTERNS: ChandasPattern[] = [
  {
    name: 'अनुष्टुप् (Anustup)',
    pattern: '8-8-8-8',
    description: 'Most common Vedic meter with 32 syllables in 4 quarters of 8 syllables each. Used extensively in epics like Ramayana and Mahabharata.',
    example: 'धर्मक्षेत्रे कुरुक्षेत्रे समवेता युयुत्सवः।',
    difficulty: 'Easy',
    category: 'Sama',
    ganas: ['यगण', 'मगण', 'तगण', 'रगण'],
    musicalProperties: {
      tempo: 'Madhyama (Medium)',
      mood: 'Devotional & Narrative',
      raga: 'Bhairav, Yaman'
    }
  },
  {
    name: 'त्रिष्टुप् (Tristup)',
    pattern: '11-11-11-11',
    description: 'Majestic meter with 44 syllables. Used for grand hymns and royal descriptions. Creates a sense of grandeur and divinity.',
    example: 'इन्द्रं मित्रं वरुणमग्निमाहुरथो दिव्यः स सुपर्णो गरुत्मान्।',
    difficulty: 'Medium',
    category: 'Sama',
    ganas: ['भगण', 'नगण', 'जगण', 'सगण'],
    musicalProperties: {
      tempo: 'Druta (Fast)',
      mood: 'Heroic & Majestic',
      raga: 'Durga, Malkauns'
    }
  },
  {
    name: 'जगती (Jagati)',
    pattern: '12-12-12-12',
    description: 'The worldly meter with 48 syllables. Represents the movement of the universe and cosmic rhythm.',
    example: 'तच्छ्रीमद्भागवते महामुनिकृते किं वा परैः शास्त्रैः।',
    difficulty: 'Hard',
    category: 'Sama',
    ganas: ['सगण', 'रगण', 'लगण', 'भगण'],
    musicalProperties: {
      tempo: 'Vilambita (Slow)',
      mood: 'Cosmic & Mystical',
      raga: 'Bhairav, Marwa'
    }
  },
  {
    name: 'गायत्री (Gayatri)',
    pattern: '8-8-8',
    description: 'Sacred meter of 24 syllables. The most revered meter in Vedic literature, used for the famous Gayatri Mantra.',
    example: 'ॐ भूर्भुवः स्वः तत्सवितुर्वरेण्यम्।',
    difficulty: 'Easy',
    category: 'Sama',
    ganas: ['यगण', 'मगण', 'तगण'],
    musicalProperties: {
      tempo: 'Madhyama (Medium)',
      mood: 'Sacred & Divine',
      raga: 'Saraswati, Bhairav'
    }
  },
  {
    name: 'उष्णिक् (Ushnik)',
    pattern: '8-8-12',
    description: 'Mixed meter with 28 syllables. Represents the heat and energy of creation. Often used for cosmic descriptions.',
    example: 'अग्निमीळे पुरोहितं यज्ञस्य देवमृत्विजम्।',
    difficulty: 'Medium',
    category: 'Vishama',
    ganas: ['रगण', 'भगण', 'जगण', 'सगण'],
    musicalProperties: {
      tempo: 'Madhyama (Medium)',
      mood: 'Energetic & Creative',
      raga: 'Bhairav, Hindol'
    }
  },
  {
    name: 'इन्द्रवज्रा (Indravajra)',
    pattern: '11 syllables per line',
    description: 'Heroic meter named after Indra\'s thunderbolt. Creates powerful, rhythmic verses perfect for describing valor and strength.',
    example: 'वीरस्य वज्रमिव तेजसा युतं।',
    difficulty: 'Medium',
    category: 'Sama',
    ganas: ['तगण', 'तगण', 'जगण', 'गुरु'],
    musicalProperties: {
      tempo: 'Druta (Fast)',
      mood: 'Heroic & Powerful',
      raga: 'Durga, Bilaval'
    }
  }
];

export const ChandasLearningEnhanced = () => {
  const [selectedPattern, setSelectedPattern] = useState<ChandasPattern | null>(null);
  const [showKaraoke, setShowKaraoke] = useState(false);
  const [currentShloka, setCurrentShloka] = useState(0);
  const [learningProgress, setLearningProgress] = useState<Record<string, number>>({});
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    // Load learning progress from localStorage
    const saved = localStorage.getItem('chandasLearningProgress');
    if (saved) {
      setLearningProgress(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    // Save learning progress
    localStorage.setItem('chandasLearningProgress', JSON.stringify(learningProgress));
  }, [learningProgress]);

  const updateProgress = (patternName: string, progress: number) => {
    setLearningProgress(prev => ({
      ...prev,
      [patternName]: Math.max(prev[patternName] || 0, progress)
    }));
  };

  const startKaraokeForPattern = (pattern: ChandasPattern) => {
    setSelectedPattern(pattern);
    setShowKaraoke(true);
    updateProgress(pattern.name, 50); // 50% for starting practice
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Hard': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Sama': return 'text-blue-600 bg-blue-100';
      case 'Ardhasama': return 'text-purple-600 bg-purple-100';
      case 'Vishama': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getProgressPercentage = (patternName: string) => {
    return learningProgress[patternName] || 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-orange-100 relative overflow-hidden">
      {/* Sacred Background Elements */}
      <div className="fixed inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 text-8xl animate-om-sacred">🕉️</div>
        <div className="absolute top-20 right-20 text-6xl animate-lotus-bloom">🪷</div>
        <div className="absolute bottom-20 left-20 text-7xl animate-divine-pulse">📿</div>
        <div className="absolute bottom-10 right-10 text-5xl animate-sacred-glow">🔱</div>
      </div>

      {/* Floating Particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className={`absolute rounded-full bg-gradient-to-r from-orange-300/20 to-yellow-300/20 animate-float particle-learning-${i}`}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-8 shadow-lg">
        <div className="w-full px-6">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold font-sanskrit mb-4 animate-fadeInUp">
              छन्दःशास्त्र अध्ययनम्
            </h1>
            <p className="text-xl md:text-2xl opacity-90 animate-fadeInUp animation-delay-200">
              The Sacred Science of Sanskrit Prosody
            </p>
            <div className="mt-4 flex justify-center items-center space-x-4 animate-fadeInUp animation-delay-400">
              <div className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                <span className="text-sm">🎯 {ENHANCED_CHANDAS_PATTERNS.length} Meters to Master</span>
              </div>
              <div className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                <span className="text-sm">📈 Progress Tracked</span>
              </div>
              <div className="bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
                <span className="text-sm">🎵 Interactive Learning</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Learning Dashboard */}
      <div className="relative z-10 w-full px-6 py-8">
        {/* Progress Overview */}
        <div className="mb-8 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-orange-200 card-divine">
          <h2 className="text-2xl font-bold text-orange-800 mb-4 font-sanskrit">📊 आपकी प्रगति (Your Progress)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {Object.values(learningProgress).filter(p => p >= 100).length}
              </div>
              <div className="text-gray-600">Meters Mastered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {Object.values(learningProgress).filter(p => p >= 50 && p < 100).length}
              </div>
              <div className="text-gray-600">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-600">
                {Math.round(Object.values(learningProgress).reduce((a, b) => a + b, 0) / ENHANCED_CHANDAS_PATTERNS.length) || 0}%
              </div>
              <div className="text-gray-600">Overall Progress</div>
            </div>
          </div>
        </div>

        {/* Chandas Patterns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {ENHANCED_CHANDAS_PATTERNS.map((pattern, index) => {
            const progress = getProgressPercentage(pattern.name);
            return (
              <div
                key={pattern.name}
                className="card-divine bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-orange-200 hover:shadow-xl transition-all duration-300 animate-fadeInUp"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Pattern Header */}
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-orange-800 font-sanskrit">
                    {pattern.name}
                  </h3>
                  <div className="flex flex-col items-end space-y-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(pattern.difficulty)}`}>
                      {pattern.difficulty}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getCategoryColor(pattern.category)}`}>
                      {pattern.category}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Progress</span>
                    <span className="text-sm font-semibold text-orange-600">{progress}%</span>
                  </div>
                  <div className="progress-divine h-3">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Pattern Info */}
                <div className="space-y-3 mb-4">
                  <div>
                    <span className="text-sm font-semibold text-gray-700">Pattern:</span>
                    <span className="ml-2 text-sm text-orange-700 font-mono bg-orange-50 px-2 py-1 rounded">
                      {pattern.pattern}
                    </span>
                  </div>
                  
                  <div>
                    <span className="text-sm font-semibold text-gray-700">Description:</span>
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                      {pattern.description}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm font-semibold text-gray-700">Example:</span>
                    <p className="text-sm text-orange-800 mt-1 font-sanskrit leading-relaxed bg-orange-50 p-2 rounded">
                      {pattern.example}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm font-semibold text-gray-700">Ganas:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {pattern.ganas.map((gana, idx) => (
                        <span key={idx} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-sanskrit">
                          {gana}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-purple-50 p-3 rounded-lg">
                    <span className="text-sm font-semibold text-purple-700">Musical Properties:</span>
                    <div className="mt-1 space-y-1">
                      <div className="text-xs text-purple-600">
                        <span className="font-semibold">Tempo:</span> {pattern.musicalProperties.tempo}
                      </div>
                      <div className="text-xs text-purple-600">
                        <span className="font-semibold">Mood:</span> {pattern.musicalProperties.mood}
                      </div>
                      <div className="text-xs text-purple-600">
                        <span className="font-semibold">Suitable Ragas:</span> {pattern.musicalProperties.raga}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => startKaraokeForPattern(pattern)}
                    className="flex-1 btn-divine text-sm py-2 px-3 rounded-lg transition-all duration-300 hover:scale-105"
                  >
                    🎵 Practice with Karaoke
                  </button>
                  <button
                    onClick={() => {
                      setSelectedPattern(pattern);
                      updateProgress(pattern.name, 25);
                      setAnimationKey(prev => prev + 1);
                    }}
                    className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm"
                  >
                    📖 Study
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Pattern Details */}
        {selectedPattern && !showKaraoke && (
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-orange-200 card-divine animate-fadeInUp" key={animationKey}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold text-orange-800 font-sanskrit">
                {selectedPattern.name} - विस्तृत अध्ययन
              </h2>
              <button
                onClick={() => setSelectedPattern(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Pattern Analysis */}
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-orange-100 to-yellow-100 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-orange-800 mb-3">📐 Pattern Structure</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="font-semibold">Syllable Pattern:</span>
                      <span className="font-mono text-orange-700">{selectedPattern.pattern}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Category:</span>
                      <span className={`px-2 py-1 rounded ${getCategoryColor(selectedPattern.category)}`}>
                        {selectedPattern.category}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Difficulty:</span>
                      <span className={`px-2 py-1 rounded ${getDifficultyColor(selectedPattern.difficulty)}`}>
                        {selectedPattern.difficulty}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-purple-800 mb-3">🎵 Musical Aspects</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="font-semibold text-purple-700">Tempo:</span>
                      <p className="text-purple-600 mt-1">{selectedPattern.musicalProperties.tempo}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-purple-700">Emotional Mood:</span>
                      <p className="text-purple-600 mt-1">{selectedPattern.musicalProperties.mood}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-purple-700">Recommended Ragas:</span>
                      <p className="text-purple-600 mt-1">{selectedPattern.musicalProperties.raga}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-100 to-blue-100 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-green-800 mb-3">🔤 Gana Composition</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedPattern.ganas.map((gana, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-lg shadow-sm border border-green-200">
                        <div className="font-sanskrit text-green-800 font-semibold">{gana}</div>
                        <div className="text-xs text-green-600 mt-1">
                          {gana.includes('गुरु') ? 'Long syllable' : 
                           gana.includes('लघु') ? 'Short syllable' :
                           'Gana pattern'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column - Example and Practice */}
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-orange-800 mb-3">📜 Classical Example</h3>
                  <div className="bg-white p-4 rounded-lg border border-orange-200">
                    <p className="text-lg font-sanskrit text-orange-800 leading-relaxed mb-3">
                      {selectedPattern.example}
                    </p>
                    <div className="text-sm text-gray-600">
                      <p className="mb-2">{selectedPattern.description}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-100 to-indigo-100 p-6 rounded-lg">
                  <h3 className="text-xl font-semibold text-blue-800 mb-3">🎯 Practice Exercises</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => startKaraokeForPattern(selectedPattern)}
                      className="w-full btn-divine py-3 px-4 rounded-lg transition-all duration-300 hover:scale-105"
                    >
                      🎵 Start Karaoke Practice
                    </button>
                    <button
                      onClick={() => {
                        updateProgress(selectedPattern.name, 75);
                        alert('🎉 Pattern analysis completed! Progress updated.');
                      }}
                      className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      📊 Analyze Pattern Structure
                    </button>
                    <button
                      onClick={() => {
                        updateProgress(selectedPattern.name, 100);
                        alert('🏆 Congratulations! You have mastered this meter!');
                      }}
                      className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors"
                    >
                      ✅ Mark as Mastered
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Karaoke Modal */}
        {showKaraoke && selectedPattern && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-auto shadow-2xl">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-orange-800 font-sanskrit">
                  🎵 {selectedPattern.name} - Karaoke Practice
                </h2>
                <button
                  onClick={() => {
                    setShowKaraoke(false);
                    updateProgress(selectedPattern.name, 100);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>
              <div className="p-6">
                <EnhancedKaraokePlayer
                  shloka={ENHANCED_SHLOKAS[currentShloka]}
                  onComplete={() => {
                    updateProgress(selectedPattern.name, 100);
                    alert('🎉 Excellent practice! You have mastered this pattern.');
                  }}
                />
                <div className="mt-4 flex justify-center space-x-4">
                  {ENHANCED_SHLOKAS.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentShloka(idx)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        idx === currentShloka
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Shloka {idx + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sacred Footer */}
      <footer className="relative z-10 bg-gradient-to-r from-orange-600 to-orange-700 text-white py-8 mt-16">
        <div className="w-full px-6 text-center">
          <div className="text-lg font-sanskrit mb-2">
            🕉️ छन्दःशास्त्रे निपुणता प्राप्तुं साधना आवश्यकम् 🕉️
          </div>
          <div className="text-sm opacity-80">
            Mastery in prosody requires dedicated practice and divine grace
          </div>
        </div>
      </footer>

      {/* Additional CSS for particle animations */}
      <style jsx>{`
        .particle-learning-0 { left: 5%; top: 15%; width: 8px; height: 8px; animation-delay: 0s; animation-duration: 20s; }
        .particle-learning-1 { left: 15%; top: 25%; width: 12px; height: 12px; animation-delay: 2s; animation-duration: 25s; }
        .particle-learning-2 { left: 25%; top: 35%; width: 6px; height: 6px; animation-delay: 4s; animation-duration: 18s; }
        .particle-learning-3 { left: 35%; top: 45%; width: 10px; height: 10px; animation-delay: 6s; animation-duration: 22s; }
        .particle-learning-4 { left: 45%; top: 55%; width: 14px; height: 14px; animation-delay: 8s; animation-duration: 28s; }
        .particle-learning-5 { left: 55%; top: 65%; width: 9px; height: 9px; animation-delay: 1s; animation-duration: 24s; }
        .particle-learning-6 { left: 65%; top: 75%; width: 11px; height: 11px; animation-delay: 3s; animation-duration: 21s; }
        .particle-learning-7 { left: 75%; top: 85%; width: 7px; height: 7px; animation-delay: 5s; animation-duration: 19s; }
        .particle-learning-8 { left: 85%; top: 95%; width: 13px; height: 13px; animation-delay: 7s; animation-duration: 26s; }
        .particle-learning-9 { left: 95%; top: 15%; width: 15px; height: 15px; animation-delay: 9s; animation-duration: 23s; }
        .particle-learning-10 { left: 10%; top: 80%; width: 5px; height: 5px; animation-delay: 1.5s; animation-duration: 17s; }
        .particle-learning-11 { left: 30%; top: 10%; width: 16px; height: 16px; animation-delay: 3.5s; animation-duration: 27s; }
        .particle-learning-12 { left: 50%; top: 30%; width: 4px; height: 4px; animation-delay: 5.5s; animation-duration: 15s; }
        .particle-learning-13 { left: 70%; top: 20%; width: 18px; height: 18px; animation-delay: 7.5s; animation-duration: 29s; }
        .particle-learning-14 { left: 90%; top: 60%; width: 20px; height: 20px; animation-delay: 9.5s; animation-duration: 30s; }
      `}</style>
    </div>
  );
};