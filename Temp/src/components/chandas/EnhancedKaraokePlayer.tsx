import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Activity,
  Mic,
  Star,
  Award,
  Crown,
  Sparkles,
  TrendingUp,
  Music,
  Radio,
  Waves,
  Heart
} from 'lucide-react';
import { ENHANCED_SHLOKAS } from '../../data/enhancedDummyData';
import '../../styles/karaoke.css';

interface EnhancedKaraokePlayerProps {
  shloka?: {
    title?: string;
    sanskrit: string;
    translation: string;
    meaning: string;
    source: string;
    meter?: string;
    transliteration?: string;
    chandas?: {
      name: string;
      nameDevanagari: string;
    };
  };
  onComplete?: () => void;
}

interface KaraokeSettings {
  tempo: number;
  volume: number;
  pitch: number;
  reverb: number;
  echo: number;
  showTranslation: boolean;
  showRomanization: boolean;
  visualEffects: boolean;
  microphoneEnabled: boolean;
  autoScroll: boolean;
}

interface VocalAnalysis {
  pitch: number;
  accuracy: number;
  timing: number;
  pronunciation: number;
  overall: number;
}

interface SyllableData {
  word: string;
  syllables: {
    text: string;
    wordIndex: number;
    syllableIndex: number;
    type: 'guru' | 'laghu';
    duration: number;
    pitch: number;
    isActive: boolean;
    isPast: boolean;
    startTime: number;
    endTime: number;
  }[];
}

export const EnhancedKaraokePlayer: React.FC<EnhancedKaraokePlayerProps> = ({ 
  shloka = ENHANCED_SHLOKAS[0], 
  onComplete 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [userScore, setUserScore] = useState(0);
  const [perfectNotes, setPerfectNotes] = useState(0);
  const [streak, setStreak] = useState(0);
  const [vocalAnalysis, setVocalAnalysis] = useState<VocalAnalysis>({
    pitch: 85,
    accuracy: 92,
    timing: 88,
    pronunciation: 90,
    overall: 89
  });

  const [settings, setSettings] = useState<KaraokeSettings>({
    tempo: 72, // BPM for devotional pace
    volume: 0.8,
    pitch: 0, // Pitch adjustment in semitones
    reverb: 0.3, // Sacred hall reverb
    echo: 0.2, // Gentle echo
    showTranslation: true,
    showRomanization: true,
    visualEffects: true,
    microphoneEnabled: true,
    autoScroll: true
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const reverbNodeRef = useRef<ConvolverNode | null>(null);
  const intervalRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Prepare audio context with effects
  useEffect(() => {
    const initAudio = async () => {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        gainNodeRef.current = audioContextRef.current.createGain();
        
        // Create reverb effect for sacred atmosphere
        reverbNodeRef.current = audioContextRef.current.createConvolver();
        
        // Generate impulse response for reverb (simulating temple acoustics)
        const sampleRate = audioContextRef.current.sampleRate;
        const length = sampleRate * 2; // 2 seconds reverb
        const impulse = audioContextRef.current.createBuffer(2, length, sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
          const channelData = impulse.getChannelData(channel);
          for (let i = 0; i < length; i++) {
            channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
          }
        }
        
        reverbNodeRef.current.buffer = impulse;
        
        // Connect audio nodes
        gainNodeRef.current.connect(reverbNodeRef.current);
        reverbNodeRef.current.connect(audioContextRef.current.destination);
        
      } catch (error) {
        console.warn('Audio context initialization failed:', error);
      }
    };

    initAudio();

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Visual audio analyzer
  useEffect(() => {
    if (!canvasRef.current || !settings.visualEffects) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawVisualizer = () => {
      const width = canvas.width;
      const height = canvas.height;
      
      ctx.clearRect(0, 0, width, height);
      
      // Draw frequency bars
      const barCount = 64;
      const barWidth = width / barCount;
      
      for (let i = 0; i < barCount; i++) {
        const barHeight = Math.random() * height * 0.8;
        const hue = (i / barCount * 360 + timeElapsed * 0.5) % 360;
        
        ctx.fillStyle = `hsla(${hue}, 70%, 60%, 0.8)`;
        ctx.fillRect(i * barWidth, height - barHeight, barWidth - 2, barHeight);
      }
      
      // Draw waveform
      ctx.strokeStyle = '#ff8c00';
      ctx.lineWidth = 3;
      ctx.beginPath();
      
      for (let i = 0; i < width; i++) {
        const y = height / 2 + Math.sin(i * 0.02 + timeElapsed * 0.1) * 30 * Math.sin(timeElapsed * 0.05);
        if (i === 0) ctx.moveTo(i, y);
        else ctx.lineTo(i, y);
      }
      
      ctx.stroke();
      
      if (isPlaying) {
        animationRef.current = requestAnimationFrame(drawVisualizer);
      }
    };

    if (isPlaying) {
      drawVisualizer();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, timeElapsed, settings.visualEffects]);

  // Generate enhanced syllable breakdown with timing
  const generateEnhancedSyllables = useCallback(() => {
    const words = shloka.sanskrit.split(' ');
    let currentTime = 0;
    
    return words.map((word: string, wordIndex: number) => {
      // Better syllable detection for Sanskrit
      const syllables = word.match(/[अ-ह][्]?[ा-्]?/g) || word.split('');
      
      const syllableData = syllables.map((syllable: string, syllableIndex: number) => {
        const isGuru = syllable.includes('ा') || syllable.includes('ी') || syllable.includes('ू') || 
                      syllable.includes('े') || syllable.includes('ै') || syllable.includes('ो') || 
                      syllable.includes('ौ') || syllable.includes('ं') || syllable.includes('ः');
        
        const duration = isGuru ? (60 / settings.tempo) * 1000 * 2 : (60 / settings.tempo) * 1000; // Guru = 2 beats, Laghu = 1 beat
        const startTime = currentTime;
        const endTime = currentTime + duration;
        
        currentTime = endTime;
        
        return {
          text: syllable,
          wordIndex,
          syllableIndex,
          type: isGuru ? 'guru' as const : 'laghu' as const,
          duration,
          pitch: 200 + Math.random() * 100,
          isActive: false,
          isPast: false,
          startTime,
          endTime
        };
      });
      
      return {
        word,
        syllables: syllableData
      };
    });
  }, [shloka.sanskrit, settings.tempo]);

  const syllableData = generateEnhancedSyllables();

  // Play audio tone for syllable (simulated)
  const playTone = useCallback((frequency: number, duration: number) => {
    if (!audioContextRef.current || !gainNodeRef.current) return;

    try {
      const oscillator = audioContextRef.current.createOscillator();
      const envelope = audioContextRef.current.createGain();
      
      oscillator.connect(envelope);
      envelope.connect(gainNodeRef.current);
      
      oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
      oscillator.type = 'sine';
      
      envelope.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      envelope.gain.linearRampToValueAtTime(settings.volume * 0.3, audioContextRef.current.currentTime + 0.05);
      envelope.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + duration / 1000);
      
      oscillator.start(audioContextRef.current.currentTime);
      oscillator.stop(audioContextRef.current.currentTime + duration / 1000);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }, [settings.volume]);

  // Enhanced karaoke timer with syllable precision and real-time updates
  useEffect(() => {
    if (isPlaying && !isPaused) {
      const startTime = Date.now() - timeElapsed;
      
      const updateKaraoke = () => {
        const currentTime = Date.now() - startTime;
        setTimeElapsed(currentTime);
        
        // Find current active syllable and update all syllable states
        const allSyllables = syllableData.flatMap((word: any) => word.syllables);
        let foundActiveSyllable = false;
        
        // Update syllable states in real-time
        syllableData.forEach((wordData: any, wordIndex: number) => {
          wordData.syllables.forEach((syllable: any, syllableIndex: number) => {
            const wasActive = syllable.isActive;
            syllable.isActive = currentTime >= syllable.startTime && currentTime < syllable.endTime;
            syllable.isPast = currentTime >= syllable.endTime;
            
            // Play tone when syllable becomes active
            if (syllable.isActive && !wasActive) {
              setCurrentWordIndex(wordIndex);
              playTone(syllable.pitch, Math.min(syllable.duration, 300));
              foundActiveSyllable = true;
            }
          });
        });
        
        // Check if karaoke is complete
        const totalDuration = allSyllables[allSyllables.length - 1]?.endTime || 0;
        if (currentTime >= totalDuration) {
          setIsPlaying(false);
          setIsPaused(false);
          setTimeElapsed(0);
          
          // Reset all syllable states
          syllableData.forEach((wordData: any) => {
            wordData.syllables.forEach((syllable: any) => {
              syllable.isActive = false;
              syllable.isPast = false;
            });
          });
          
          if (onComplete) onComplete();
          return;
        }
        
        // Continue animation
        if (isPlaying && !isPaused) {
          animationRef.current = requestAnimationFrame(updateKaraoke);
        }
      };
      
      animationRef.current = requestAnimationFrame(updateKaraoke);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, isPaused, syllableData, playTone, onComplete]);

  const handlePlay = () => {
    setIsPlaying(true);
    setIsPaused(false);
    
    // Reset all syllables if starting from beginning
    if (timeElapsed === 0) {
      syllableData.forEach((wordData: any) => {
        wordData.syllables.forEach((syllable: any) => {
          syllable.isActive = false;
          syllable.isPast = false;
        });
      });
    }
    
    // Play first syllable tone to start
    const firstSyllable = syllableData[0]?.syllables[0];
    if (firstSyllable) {
      playTone(firstSyllable.pitch, Math.min(firstSyllable.duration, 300));
    }
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setTimeElapsed(0);
    setCurrentWordIndex(0);
  };

  const handleMicToggle = () => {
    setIsRecording(!isRecording);
    if (!isRecording && settings.microphoneEnabled) {
      // Simulate voice analysis
      setTimeout(() => {
        setUserScore(prev => prev + Math.floor(Math.random() * 50) + 25);
        setPerfectNotes(prev => prev + 1);
        setStreak(prev => prev + 1);
        setVocalAnalysis(prev => ({
          ...prev,
          accuracy: Math.min(95, prev.accuracy + Math.random() * 5),
          timing: Math.min(95, prev.timing + Math.random() * 3),
          pronunciation: Math.min(95, prev.pronunciation + Math.random() * 4),
          overall: Math.min(95, prev.overall + Math.random() * 3)
        }));
      }, 2000);
    }
  };

  const formatTime = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <Card className="bg-saffron-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/patterns/music-notes.svg')] opacity-10"></div>
        <div className="relative p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-ancient font-bold mb-2 flex items-center gap-3">
                <Headphones className="w-8 h-8 text-pink-300" />
                <Sparkles className="w-6 h-6 text-purple-300" />
                Divine Karaoke Experience
                <Sparkles className="w-6 h-6 text-purple-300" />
              </h2>
              <p className="text-purple-200 text-lg">
                Sing along with sacred Sanskrit verses and perfect your pronunciation
              </p>
            </div>
            
            <div className="text-right">
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold text-pink-300">{userScore}</div>
                <div className="text-sm text-purple-200">Score</div>
              </div>
            </div>
          </div>

          {/* Current Shloka Info */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-6">
            <div className="flex items-center gap-4 mb-4">
              <Crown className="w-6 h-6 text-yellow-300" />
              <div>
                <h3 className="text-xl font-semibold text-white">{shloka.source}</h3>
                <p className="text-purple-200">
                  {shloka.meter || (shloka.chandas && `${shloka.chandas.name} • ${shloka.chandas.nameDevanagari}`) || 'Classical Sanskrit'}
                </p>
              </div>
            </div>
            <p className="text-purple-100 text-sm italic">"{shloka.translation}"</p>
          </div>

          {/* Performance Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
              <Star className="w-5 h-5 mx-auto text-yellow-300 mb-1" />
              <div className="text-lg font-bold text-white">{perfectNotes}</div>
              <div className="text-xs text-purple-200">Perfect Notes</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
              <Award className="w-5 h-5 mx-auto text-orange-300 mb-1" />
              <div className="text-lg font-bold text-white">{streak}</div>
              <div className="text-xs text-purple-200">Streak</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
              <TrendingUp className="w-5 h-5 mx-auto text-green-300 mb-1" />
              <div className="text-lg font-bold text-white">{vocalAnalysis.overall}%</div>
              <div className="text-xs text-purple-200">Accuracy</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 text-center">
              <Timer className="w-5 h-5 mx-auto text-blue-300 mb-1" />
              <div className="text-lg font-bold text-white">{formatTime(timeElapsed)}</div>
              <div className="text-xs text-purple-200">Time</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Karaoke Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lyrics Display */}
        <Card className="lg:col-span-2 relative overflow-hidden">
          <div className="p-8">
            <h3 className="text-xl font-semibold text-ancient-800 mb-6 flex items-center gap-2">
              <Music className="w-5 h-5 text-saffron-600" />
              Sacred Lyrics
            </h3>
            
            {/* Main Sanskrit Text with Enhanced Karaoke */}
            <div className="space-y-6 mb-8">
              {syllableData.map((wordData, wordIndex) => {
                const isCurrentWord = currentWordIndex === wordIndex;
                const hasActiveSyllable = wordData.syllables.some(s => s.isActive);
                
                return (
                  <div key={wordIndex} className={`text-center mb-4 transition-all duration-500 ${
                    hasActiveSyllable ? 'scale-105 transform' : ''
                  }`}>
                    <div className="text-4xl font-sanskrit leading-relaxed text-ancient-800 mb-3 flex flex-wrap justify-center gap-2">
                      {wordData.syllables.map((syllable, syllableIndex) => {
                        const isUpcoming = syllable.startTime > timeElapsed && 
                          syllable.startTime - timeElapsed < 2000; // Show upcoming syllables
                        
                        return (
                          <span
                            key={`${wordIndex}-${syllableIndex}`}
                            className={`
                              syllable cursor-pointer transition-all duration-300 transform
                              ${syllable.isActive
                                ? 'syllable-active scale-125 text-orange-500 font-bold animate-pulse shadow-lg'
                                : syllable.isPast
                                ? 'syllable-past text-gray-400 scale-90'
                                : isUpcoming
                                ? 'syllable-upcoming text-yellow-600 scale-110 animate-bounce'
                                : 'syllable-default text-ancient-700 hover:text-orange-400'
                              }
                              ${syllable.type === 'guru' ? 'syllable-guru border-b-2 border-orange-500' : 'syllable-laghu border-b border-orange-300'}
                            `}
                            onClick={() => {
                              setTimeElapsed(syllable.startTime);
                              playTone(syllable.pitch, syllable.duration);
                            }}
                          >
                            {syllable.text}
                            {syllable.type === 'guru' && (
                              <span className="text-xs block text-orange-600 font-normal">ऽ</span>
                            )}
                          </span>
                        );
                      })}
                    </div>
                    
                    {/* Real-time progress indicator for current word */}
                    {isCurrentWord && (
                      <div className="mt-2 animate-fadeIn">
                        <div className="word-progress">
                          <div 
                            className="word-progress-fill"
                            style={{
                              '--progress-width': `${Math.min(100, Math.max(0, 
                                (timeElapsed - wordData.syllables[0].startTime) / 
                                (wordData.syllables[wordData.syllables.length - 1].endTime - wordData.syllables[0].startTime) * 100
                              ))}%`
                            } as React.CSSProperties}
                          >
                          </div>
                        </div>
                        <div className="text-xs text-orange-600 mt-1 font-medium">
                          Word {wordIndex + 1} of {syllableData.length}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              
              {settings.showRomanization && shloka.transliteration && (
                <div className="text-xl text-ancient-600 italic mb-3 text-center">
                  {shloka.transliteration}
                </div>
              )}
              
              {settings.showTranslation && (
                <div className="text-ancient-500 text-center text-lg">
                  "{shloka.translation}"
                </div>
              )}
            </div>

            {/* Overall Progress Bar */}
            <div className="bg-ancient-200 rounded-full h-4 mb-4 overflow-hidden relative">
              <div 
                className="overall-progress-bar"
                style={{
                  '--overall-progress': `${Math.min(100, (timeElapsed / (syllableData.flatMap(w => w.syllables).pop()?.endTime || 1)) * 100)}%`
                } as React.CSSProperties}
              >
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white text-xs font-bold">
                  {Math.round((timeElapsed / (syllableData.flatMap(w => w.syllables).pop()?.endTime || 1)) * 100)}%
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Controls and Visualizer */}
        <div className="space-y-6">
          {/* Audio Visualizer */}
          {settings.visualEffects && (
            <Card>
              <div className="p-4">
                <h4 className="font-semibold text-ancient-800 mb-4 flex items-center gap-2">
                  <Waves className="w-4 h-4 text-saffron-600" />
                  Audio Visualization
                </h4>
                <canvas
                  ref={canvasRef}
                  width={280}
                  height={120}
                  className="w-full rounded-lg bg-gradient-to-br from-ancient-900 to-saffron-900"
                />
              </div>
            </Card>
          )}

          {/* Playback Controls */}
          <Card>
            <div className="p-6">
              <h4 className="font-semibold text-ancient-800 mb-4 flex items-center gap-2">
                <Radio className="w-4 h-4 text-saffron-600" />
                Playback Controls
              </h4>
              
              <div className="flex justify-center gap-3 mb-6">
                <Button
                  onClick={handleStop}
                  variant="outline"
                  size="sm"
                  disabled={!isPlaying && timeElapsed === 0}
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                
                <Button
                  onClick={isPlaying ? handlePause : handlePlay}
                  className="px-8 py-2 bg-gradient-to-r from-saffron-600 to-ancient-600 hover:from-saffron-700 hover:to-ancient-700"
                >
                  {isPlaying && !isPaused ? (
                    <Pause className="w-5 h-5 mr-2" />
                  ) : (
                    <Play className="w-5 h-5 mr-2" />
                  )}
                  {isPlaying && !isPaused ? 'Pause' : 'Play'}
                </Button>
                
                <Button
                  onClick={handleMicToggle}
                  variant={isRecording ? "secondary" : "outline"}
                  size="sm"
                  className={isRecording ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' : ''}
                >
                  <Mic className="w-4 h-4" />
                </Button>
              </div>

              {/* Volume Control */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-ancient-600" />
                  <label htmlFor="volume-control" className="text-sm text-ancient-600">Volume</label>
                </div>
                <input
                  id="volume-control"
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.volume}
                  onChange={(e) => setSettings(prev => ({ ...prev, volume: parseFloat(e.target.value) }))}
                  className="w-full"
                  aria-label="Volume control"
                />
              </div>

              {/* Tempo Control */}
              <div className="space-y-3 mt-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-ancient-600" />
                  <label htmlFor="tempo-control" className="text-sm text-ancient-600">Tempo ({settings.tempo} BPM)</label>
                </div>
                <input
                  id="tempo-control"
                  type="range"
                  min="40"
                  max="120"
                  step="4"
                  value={settings.tempo}
                  onChange={(e) => setSettings(prev => ({ ...prev, tempo: parseInt(e.target.value) }))}
                  className="w-full"
                  aria-label="Tempo control"
                />
              </div>
            </div>
          </Card>

          {/* Voice Analysis */}
          <Card>
            <div className="p-6">
              <h4 className="font-semibold text-ancient-800 mb-4 flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-600" />
                Voice Analysis
              </h4>
              
              <div className="space-y-3">
                {Object.entries(vocalAnalysis).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="capitalize text-ancient-600">{key}</span>
                      <span className="font-semibold text-ancient-800">{value}%</span>
                    </div>
                    <div className="bg-ancient-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          value >= 90 ? 'bg-green-500' :
                          value >= 80 ? 'bg-yellow-500' :
                          value >= 70 ? 'bg-orange-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              {isRecording && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-600">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Recording your voice...</span>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Settings Toggle */}
          <Button
            onClick={() => setShowSettings(!showSettings)}
            variant="outline"
            className="w-full"
          >
            <Settings className="w-4 h-4 mr-2" />
            {showSettings ? 'Hide Settings' : 'Show Settings'}
          </Button>
        </div>
      </div>

      {/* Advanced Settings Panel */}
      {showSettings && (
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-ancient-800 mb-6">Advanced Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Audio Effects */}
              <div className="space-y-4">
                <h4 className="font-medium text-ancient-700">Audio Effects</h4>
                
                <div>
                  <label htmlFor="reverb-control" className="text-sm text-ancient-600">Reverb</label>
                  <input
                    id="reverb-control"
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.reverb}
                    onChange={(e) => setSettings(prev => ({ ...prev, reverb: parseFloat(e.target.value) }))}
                    className="w-full mt-1"
                    aria-label="Reverb level"
                  />
                </div>
                
                <div>
                  <label htmlFor="echo-control" className="text-sm text-ancient-600">Echo</label>
                  <input
                    id="echo-control"
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.echo}
                    onChange={(e) => setSettings(prev => ({ ...prev, echo: parseFloat(e.target.value) }))}
                    className="w-full mt-1"
                    aria-label="Echo level"
                  />
                </div>
                
                <div>
                  <label htmlFor="pitch-control" className="text-sm text-ancient-600">Pitch Adjustment</label>
                  <input
                    id="pitch-control"
                    type="range"
                    min="-12"
                    max="12"
                    step="1"
                    value={settings.pitch}
                    onChange={(e) => setSettings(prev => ({ ...prev, pitch: parseInt(e.target.value) }))}
                    className="w-full mt-1"
                    aria-label="Pitch adjustment in semitones"
                  />
                  <div className="text-xs text-ancient-500 mt-1">
                    {settings.pitch > 0 ? '+' : ''}{settings.pitch} semitones
                  </div>
                </div>
              </div>

              {/* Display Options */}
              <div className="space-y-4">
                <h4 className="font-medium text-ancient-700">Display Options</h4>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.showTranslation}
                    onChange={(e) => setSettings(prev => ({ ...prev, showTranslation: e.target.checked }))}
                  />
                  <span className="text-sm text-ancient-600">Show Translation</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.showRomanization}
                    onChange={(e) => setSettings(prev => ({ ...prev, showRomanization: e.target.checked }))}
                  />
                  <span className="text-sm text-ancient-600">Show Romanization</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.visualEffects}
                    onChange={(e) => setSettings(prev => ({ ...prev, visualEffects: e.target.checked }))}
                  />
                  <span className="text-sm text-ancient-600">Visual Effects</span>
                </label>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.autoScroll}
                    onChange={(e) => setSettings(prev => ({ ...prev, autoScroll: e.target.checked }))}
                  />
                  <span className="text-sm text-ancient-600">Auto Scroll</span>
                </label>
              </div>

              {/* Performance */}
              <div className="space-y-4">
                <h4 className="font-medium text-ancient-700">Performance</h4>
                
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={settings.microphoneEnabled}
                    onChange={(e) => setSettings(prev => ({ ...prev, microphoneEnabled: e.target.checked }))}
                  />
                  <span className="text-sm text-ancient-600">Enable Microphone</span>
                </label>
                
                <div className="bg-ancient-50 p-4 rounded-lg">
                  <h5 className="font-medium text-ancient-700 mb-2">Quick Presets</h5>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSettings(prev => ({ ...prev, tempo: 60, reverb: 0.7, echo: 0.4 }))}
                    >
                      Meditative
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSettings(prev => ({ ...prev, tempo: 90, reverb: 0.3, echo: 0.2 }))}
                    >
                      Traditional
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSettings(prev => ({ ...prev, tempo: 72, reverb: 0.5, echo: 0.3 }))}
                    >
                      Devotional
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSettings(prev => ({ ...prev, tempo: 108, reverb: 0.1, echo: 0.1 }))}
                    >
                      Practice
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};