import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Settings,
  Headphones,
  Timer,
  Activity
} from 'lucide-react';
import type { Shloka, KaraokeState, Syllable } from '../../types/chandas';
import { SAMPLE_SHLOKAS } from '../../data/dummyData';

interface KaraokePlayerProps {
  shloka: Shloka;
  onComplete?: () => void;
}

export const KaraokePlayer: React.FC<KaraokePlayerProps> = ({ shloka, onComplete }) => {
  const [karaokeState, setKaraokeState] = useState<KaraokeState>({
    isPlaying: false,
    currentSyllableIndex: 0,
    currentPadaIndex: 0,
    tempo: 120, // BPM
    volume: 0.7,
    showTranslation: true,
    showRomanization: true
  });

  const [timeElapsed, setTimeElapsed] = useState(0);
  const [userAccuracy, setUserAccuracy] = useState(100);
  const intervalRef = useRef<NodeJS.Timeout>();
  const audioContextRef = useRef<AudioContext>();

  // Generate syllables for karaoke (mock data)
  const generateSyllables = (text: string): Syllable[] => {
    const syllableTexts = text.split('').filter(char => char.trim());
    return syllableTexts.map((char, index) => ({
      id: `syllable-${index}`,
      text: char,
      type: Math.random() > 0.5 ? 'guru' : 'laghu',
      duration: Math.random() > 0.5 ? 600 : 300,
      position: index,
      isHighlighted: false
    }));
  };

  const allSyllables = shloka.padas.flatMap(pada => 
    generateSyllables(pada.text)
  );

  useEffect(() => {
    if (karaokeState.isPlaying) {
      const beatDuration = (60 / karaokeState.tempo) * 1000; // ms per beat
      
      intervalRef.current = setInterval(() => {
        setKaraokeState(prev => {
          const nextIndex = prev.currentSyllableIndex + 1;
          
          if (nextIndex >= allSyllables.length) {
            // Completed the shloka
            onComplete?.();
            return { ...prev, isPlaying: false, currentSyllableIndex: 0 };
          }
          
          return { ...prev, currentSyllableIndex: nextIndex };
        });
        
        setTimeElapsed(prev => prev + beatDuration);
      }, beatDuration);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [karaokeState.isPlaying, karaokeState.tempo, allSyllables.length, onComplete]);

  // Generate rhythm beats sound
  const playBeat = (type: 'laghu' | 'guru') => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Different frequencies for laghu and guru
    oscillator.frequency.setValueAtTime(type === 'guru' ? 220 : 440, ctx.currentTime);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(karaokeState.volume * 0.3, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + (type === 'guru' ? 0.3 : 0.15));

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + (type === 'guru' ? 0.3 : 0.15));
  };

  useEffect(() => {
    if (karaokeState.isPlaying && allSyllables[karaokeState.currentSyllableIndex]) {
      const currentSyllable = allSyllables[karaokeState.currentSyllableIndex];
      playBeat(currentSyllable.type);
    }
  }, [karaokeState.currentSyllableIndex, karaokeState.isPlaying]);

  const togglePlayPause = () => {
    setKaraokeState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
  };

  const reset = () => {
    setKaraokeState(prev => ({ 
      ...prev, 
      isPlaying: false, 
      currentSyllableIndex: 0,
      currentPadaIndex: 0
    }));
    setTimeElapsed(0);
  };

  const adjustTempo = (change: number) => {
    setKaraokeState(prev => ({ 
      ...prev, 
      tempo: Math.max(60, Math.min(200, prev.tempo + change))
    }));
  };

  const adjustVolume = (change: number) => {
    setKaraokeState(prev => ({ 
      ...prev, 
      volume: Math.max(0, Math.min(1, prev.volume + change))
    }));
  };

  return (
    <div className="space-y-6">
      {/* Main Display */}
      <Card className="bg-gradient-to-br from-ancient-900 via-saffron-900 to-ancient-900 text-white">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-2xl font-ancient font-bold mb-2">
              🎵 Karaoke Chanting Mode
            </h2>
            <p className="text-ancient-200">{shloka.source}</p>
          </div>

          {/* Main Text with Highlighting */}
          <div className="text-center mb-8">
            {shloka.padas.map((pada, padaIndex) => (
              <div key={pada.id} className="mb-4">
                <div className="text-3xl font-sanskrit leading-relaxed">
                  {pada.text.split('').map((char, charIndex) => {
                    const globalIndex = shloka.padas
                      .slice(0, padaIndex)
                      .reduce((acc, p) => acc + p.text.length, 0) + charIndex;
                    
                    const isHighlighted = globalIndex === karaokeState.currentSyllableIndex;
                    const isPast = globalIndex < karaokeState.currentSyllableIndex;
                    
                    return (
                      <span
                        key={charIndex}
                        className={`transition-all duration-200 ${
                          isHighlighted 
                            ? 'bg-saffron-400 text-ancient-900 shadow-lg scale-110 rounded px-1' 
                            : isPast 
                              ? 'text-ancient-300' 
                              : 'text-white'
                        }`}
                      >
                        {char}
                      </span>
                    );
                  })}
                </div>
                
                {karaokeState.showRomanization && (
                  <div className="text-lg text-ancient-200 mt-2 italic">
                    {pada.romanization}
                  </div>
                )}
                
                {karaokeState.showTranslation && (
                  <div className="text-sm text-ancient-300 mt-1">
                    {pada.translation}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-ancient-200 mb-2">
              <span>Progress</span>
              <span>{Math.round((karaokeState.currentSyllableIndex / allSyllables.length) * 100)}%</span>
            </div>
            <div className="w-full bg-ancient-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-saffron-400 to-lotus-400 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(karaokeState.currentSyllableIndex / allSyllables.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Rhythm Visualization */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-center">Rhythm Pattern</h3>
            <div className="flex justify-center items-center space-x-2 overflow-x-auto">
              {allSyllables.slice(0, 20).map((syllable, index) => (
                <div
                  key={syllable.id}
                  className={`flex flex-col items-center transition-all duration-200 ${
                    index === karaokeState.currentSyllableIndex 
                      ? 'scale-125 transform' 
                      : index < karaokeState.currentSyllableIndex 
                        ? 'opacity-50' 
                        : 'opacity-70'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      syllable.type === 'guru' 
                        ? 'bg-saffron-500 text-white' 
                        : 'bg-lotus-500 text-white'
                    } ${index === karaokeState.currentSyllableIndex ? 'ring-4 ring-white' : ''}`}
                  >
                    {syllable.type === 'guru' ? 'G' : 'L'}
                  </div>
                  <div className="text-xs mt-1 text-ancient-200">
                    {syllable.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Playback Controls */}
        <Card>
          <div className="p-4">
            <h3 className="font-semibold text-ancient-800 mb-4 flex items-center gap-2">
              <Play className="w-4 h-4" />
              Playback
            </h3>
            <div className="space-y-4">
              <div className="flex justify-center gap-2">
                <Button
                  onClick={togglePlayPause}
                  className="bg-gradient-to-r from-saffron-600 to-ancient-600"
                  size="lg"
                >
                  {karaokeState.isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </Button>
                <Button onClick={reset} variant="outline" size="lg">
                  <RotateCcw className="w-5 h-5" />
                </Button>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-ancient-800">
                  {Math.floor(timeElapsed / 60000)}:{String(Math.floor((timeElapsed % 60000) / 1000)).padStart(2, '0')}
                </div>
                <div className="text-sm text-ancient-600">Time Elapsed</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Tempo & Volume */}
        <Card>
          <div className="p-4">
            <h3 className="font-semibold text-ancient-800 mb-4 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Controls
            </h3>
            <div className="space-y-4">
              {/* Tempo */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-ancient-700">Tempo</label>
                  <span className="text-sm text-ancient-600">{karaokeState.tempo} BPM</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => adjustTempo(-10)}>-</Button>
                  <div className="flex-1 bg-ancient-100 rounded-full h-2">
                    <div
                      className="bg-saffron-500 h-2 rounded-full"
                      style={{ width: `${((karaokeState.tempo - 60) / 140) * 100}%` }}
                    />
                  </div>
                  <Button size="sm" variant="outline" onClick={() => adjustTempo(10)}>+</Button>
                </div>
              </div>

              {/* Volume */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-ancient-700">Volume</label>
                  <span className="text-sm text-ancient-600">{Math.round(karaokeState.volume * 100)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <VolumeX className="w-4 h-4 text-ancient-400" />
                  <div className="flex-1 bg-ancient-100 rounded-full h-2">
                    <div
                      className="bg-lotus-500 h-2 rounded-full"
                      style={{ width: `${karaokeState.volume * 100}%` }}
                    />
                  </div>
                  <Volume2 className="w-4 h-4 text-ancient-400" />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats & Options */}
        <Card>
          <div className="p-4">
            <h3 className="font-semibold text-ancient-800 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Session Stats
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-saffron-600">{userAccuracy}%</div>
                  <div className="text-xs text-ancient-600">Accuracy</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-lotus-600">{allSyllables.length}</div>
                  <div className="text-xs text-ancient-600">Syllables</div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={karaokeState.showTranslation}
                    onChange={(e) => setKaraokeState(prev => ({ 
                      ...prev, 
                      showTranslation: e.target.checked 
                    }))}
                    className="rounded border-ancient-300"
                  />
                  Show Translation
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={karaokeState.showRomanization}
                    onChange={(e) => setKaraokeState(prev => ({ 
                      ...prev, 
                      showRomanization: e.target.checked 
                    }))}
                    className="rounded border-ancient-300"
                  />
                  Show Romanization
                </label>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Shloka Information */}
      <Card>
        <div className="p-6">
          <h3 className="text-xl font-semibold text-ancient-800 mb-4">About This Shloka</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-ancient-700 mb-2">Chandas Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-ancient-600">Meter:</span>
                  <span className="font-medium">{shloka.chandas.name} ({shloka.chandas.nameDevanagari})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ancient-600">Pattern:</span>
                  <span className="font-mono text-xs">{shloka.chandas.pattern}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ancient-600">Syllables:</span>
                  <span className="font-medium">{shloka.chandas.syllableCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ancient-600">Difficulty:</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    shloka.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                    shloka.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {shloka.difficulty}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-ancient-700 mb-2">Meaning & Context</h4>
              <div className="space-y-2 text-sm">
                <p className="text-ancient-600">{shloka.meaning.contextual}</p>
                {shloka.meaning.spiritual && (
                  <p className="text-ancient-500 italic">"{shloka.meaning.spiritual}"</p>
                )}
                <div className="flex flex-wrap gap-1 mt-3">
                  {shloka.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-ancient-100 text-ancient-700 rounded text-xs">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};