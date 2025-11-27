import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  XCircle,
  Activity,
  Target,
  Brain
} from 'lucide-react';
import type { SpeechAnalysis, Shloka } from '../../types/chandas';
import { SAMPLE_SHLOKAS } from '../../data/dummyData';

interface SpeechToChandasProps {
  selectedShloka?: Shloka;
  onAnalysisComplete?: (analysis: SpeechAnalysis) => void;
}

export const SpeechToChandas: React.FC<SpeechToChandasProps> = ({ 
  selectedShloka, 
  onAnalysisComplete 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentShloka, setCurrentShloka] = useState(selectedShloka || SAMPLE_SHLOKAS[0]);
  const [recordedText, setRecordedText] = useState('');
  const [analysis, setAnalysis] = useState<SpeechAnalysis | null>(null);
  const [analysisPhase, setAnalysisPhase] = useState<'ready' | 'listening' | 'processing' | 'complete'>('ready');
  const [audioLevel, setAudioLevel] = useState(0);
  const [sessionStats, setSessionStats] = useState({
    attempts: 0,
    averageAccuracy: 0,
    bestAccuracy: 0,
    totalPracticeTime: 0
  });

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>();

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      if (recognitionRef.current) {
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'sa-IN'; // Sanskrit India

        recognitionRef.current.onresult = (event) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setRecordedText(transcript);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
          if (recordedText) {
            processRecording();
          }
        };

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
          setAnalysisPhase('ready');
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [recordedText]);

  // Audio level monitoring
  const startAudioMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      analyserRef.current.fftSize = 256;
      const bufferLength = analyserRef.current.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateAudioLevel = () => {
        if (analyserRef.current && isListening) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / bufferLength;
          setAudioLevel(average / 255);
          animationRef.current = requestAnimationFrame(updateAudioLevel);
        }
      };

      updateAudioLevel();
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const startListening = async () => {
    if (!recognitionRef.current) return;

    setIsListening(true);
    setAnalysisPhase('listening');
    setRecordedText('');
    setAnalysis(null);

    await startAudioMonitoring();
    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const processRecording = async () => {
    setAnalysisPhase('processing');
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock analysis result
    const mockAnalysis: SpeechAnalysis = {
      text: recordedText,
      accuracy: Math.random() * 40 + 60, // 60-100%
      timing: Math.random() * 30 + 70, // 70-100%
      pronunciation: {
        correct: ['कर्', 'मण्ये', 'वा'],
        incorrect: ['धि', 'का'],
        suggestions: [
          'Focus on the "धि" sound - it should be shorter (laghu)',
          'The "का" syllable needs more emphasis (guru)'
        ]
      },
      rhythm: {
        detected: 'GGLL-GGLL',
        expected: 'GGLL-GGLL',
        accuracy: Math.random() * 30 + 70
      }
    };

    setAnalysis(mockAnalysis);
    setAnalysisPhase('complete');

    // Update session stats
    setSessionStats(prev => ({
      attempts: prev.attempts + 1,
      averageAccuracy: (prev.averageAccuracy + mockAnalysis.accuracy) / 2,
      bestAccuracy: Math.max(prev.bestAccuracy, mockAnalysis.accuracy),
      totalPracticeTime: prev.totalPracticeTime + 30 // seconds
    }));

    onAnalysisComplete?.(mockAnalysis);
  };

  const playReference = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(currentShloka.text);
      utterance.lang = 'sa-IN';
      utterance.rate = 0.7;
      utterance.pitch = 1.2;
      
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      
      speechSynthesis.speak(utterance);
    }
  };

  const stopReference = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
  };

  const reset = () => {
    setRecordedText('');
    setAnalysis(null);
    setAnalysisPhase('ready');
    setAudioLevel(0);
  };

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 90) return 'text-green-600';
    if (accuracy >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAccuracyMessage = (accuracy: number) => {
    if (accuracy >= 95) return 'Excellent! Perfect pronunciation!';
    if (accuracy >= 85) return 'Very good! Minor improvements possible.';
    if (accuracy >= 70) return 'Good effort! Practice the suggestions below.';
    return 'Keep practicing! Focus on the highlighted areas.';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-ancient-900 via-saffron-900 to-ancient-900 text-white">
        <div className="p-6">
          <h2 className="text-2xl font-ancient font-bold mb-2 flex items-center gap-2">
            <Mic className="w-6 h-6" />
            Speech-to-Chandas AI 🎤
          </h2>
          <p className="text-ancient-200">
            Practice pronunciation and rhythm with AI-powered feedback
          </p>
        </div>
      </Card>

      {/* Shloka Selection */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-ancient-800 mb-4">Practice Shloka</h3>
          <div className="bg-ancient-50 rounded-lg p-4 mb-4">
            <div className="text-center">
              <p className="text-2xl font-sanskrit text-ancient-800 mb-2">
                {currentShloka.text}
              </p>
              <p className="text-sm text-ancient-600 italic mb-2">
                {currentShloka.romanization}
              </p>
              <p className="text-sm text-ancient-700">
                "{currentShloka.translation}"
              </p>
              <p className="text-xs text-ancient-500 mt-2">
                {currentShloka.source} • {currentShloka.chandas.name}
              </p>
            </div>
          </div>

          {/* Reference Audio Controls */}
          <div className="flex justify-center gap-4 mb-4">
            <Button
              onClick={isPlaying ? stopReference : playReference}
              className="bg-gradient-to-r from-lotus-600 to-saffron-600"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-4 h-4 mr-2" />
                  Stop Reference
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 mr-2" />
                  Play Reference
                </>
              )}
            </Button>
          </div>

          {/* Shloka Selector */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {SAMPLE_SHLOKAS.slice(0, 3).map((shloka) => (
              <button
                key={shloka.id}
                onClick={() => setCurrentShloka(shloka)}
                className={`p-3 rounded-lg border-2 text-left transition-all ${
                  currentShloka.id === shloka.id
                    ? 'border-saffron-500 bg-saffron-50'
                    : 'border-ancient-200 hover:border-ancient-300'
                }`}
              >
                <div className="text-sm font-medium text-ancient-800">
                  {shloka.text.slice(0, 20)}...
                </div>
                <div className="text-xs text-ancient-600 mt-1">
                  {shloka.chandas.name} • {shloka.difficulty}
                </div>
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Recording Interface */}
      <Card>
        <div className="p-6">
          <div className="text-center space-y-6">
            {/* Microphone Visualization */}
            <div className="relative">
              <div className={`w-32 h-32 rounded-full mx-auto flex items-center justify-center transition-all duration-300 ${
                isListening 
                  ? 'bg-red-500 animate-pulse shadow-lg shadow-red-500/50' 
                  : analysisPhase === 'processing' 
                    ? 'bg-yellow-500 animate-spin' 
                    : 'bg-ancient-200 hover:bg-ancient-300'
              }`}>
                {analysisPhase === 'processing' ? (
                  <Brain className="w-12 h-12 text-white" />
                ) : isListening ? (
                  <Mic className="w-12 h-12 text-white" />
                ) : (
                  <MicOff className="w-12 h-12 text-ancient-600" />
                )}
              </div>

              {/* Audio Level Indicator */}
              {isListening && (
                <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping" 
                     style={{ transform: `scale(${1 + audioLevel})` }} />
              )}
            </div>

            {/* Status Message */}
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-ancient-800">
                {analysisPhase === 'ready' && 'Ready to Listen'}
                {analysisPhase === 'listening' && 'Listening... Speak the shloka'}
                {analysisPhase === 'processing' && 'Analyzing your pronunciation...'}
                {analysisPhase === 'complete' && 'Analysis Complete!'}
              </h3>
              
              {recordedText && (
                <div className="bg-ancient-100 rounded-lg p-3 max-w-md mx-auto">
                  <p className="text-sm text-ancient-700">
                    <strong>Detected:</strong> {recordedText}
                  </p>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-4">
              {!isListening && analysisPhase !== 'processing' ? (
                <Button
                  onClick={startListening}
                  className="bg-gradient-to-r from-red-600 to-rose-600 px-8 py-3"
                  disabled={analysisPhase === 'processing'}
                >
                  <Mic className="w-5 h-5 mr-2" />
                  Start Recording
                </Button>
              ) : isListening ? (
                <Button
                  onClick={stopListening}
                  className="bg-gradient-to-r from-gray-600 to-gray-700 px-8 py-3"
                >
                  <MicOff className="w-5 h-5 mr-2" />
                  Stop Recording
                </Button>
              ) : null}

              <Button onClick={reset} variant="outline" className="px-8 py-3">
                <RotateCcw className="w-5 h-5 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <Card>
          <div className="p-6">
            <h3 className="text-xl font-semibold text-ancient-800 mb-6 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Pronunciation Analysis
            </h3>

            {/* Overall Score */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className={`text-4xl font-bold ${getAccuracyColor(analysis.accuracy)}`}>
                  {Math.round(analysis.accuracy)}%
                </div>
                <div className="text-sm text-ancient-600">Overall Accuracy</div>
              </div>
              <div className="text-center">
                <div className={`text-4xl font-bold ${getAccuracyColor(analysis.timing)}`}>
                  {Math.round(analysis.timing)}%
                </div>
                <div className="text-sm text-ancient-600">Timing Accuracy</div>
              </div>
              <div className="text-center">
                <div className={`text-4xl font-bold ${getAccuracyColor(analysis.rhythm.accuracy)}`}>
                  {Math.round(analysis.rhythm.accuracy)}%
                </div>
                <div className="text-sm text-ancient-600">Rhythm Accuracy</div>
              </div>
            </div>

            {/* Feedback Message */}
            <Alert className="mb-6">
              <Activity className="w-4 h-4" />
              <div>
                <h4 className="font-semibold mb-1">{getAccuracyMessage(analysis.accuracy)}</h4>
                <p className="text-sm">Keep practicing to improve your Sanskrit pronunciation and rhythm.</p>
              </div>
            </Alert>

            {/* Detailed Feedback */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pronunciation Details */}
              <div>
                <h4 className="font-semibold text-ancient-800 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Pronunciation Feedback
                </h4>
                <div className="space-y-3">
                  {analysis.pronunciation.correct.length > 0 && (
                    <div>
                      <p className="text-sm text-green-700 mb-1">✓ Correct pronunciations:</p>
                      <div className="flex flex-wrap gap-1">
                        {analysis.pronunciation.correct.map((syllable, index) => (
                          <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm">
                            {syllable}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {analysis.pronunciation.incorrect.length > 0 && (
                    <div>
                      <p className="text-sm text-red-700 mb-1">⚠ Needs improvement:</p>
                      <div className="flex flex-wrap gap-1">
                        {analysis.pronunciation.incorrect.map((syllable, index) => (
                          <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm">
                            {syllable}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Rhythm Analysis */}
              <div>
                <h4 className="font-semibold text-ancient-800 mb-3 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-blue-500" />
                  Rhythm Analysis
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-ancient-600">Expected pattern:</p>
                    <code className="text-sm bg-ancient-100 px-2 py-1 rounded font-mono">
                      {analysis.rhythm.expected}
                    </code>
                  </div>
                  <div>
                    <p className="text-sm text-ancient-600">Detected pattern:</p>
                    <code className={`text-sm px-2 py-1 rounded font-mono ${
                      analysis.rhythm.detected === analysis.rhythm.expected 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {analysis.rhythm.detected}
                    </code>
                  </div>
                </div>
              </div>
            </div>

            {/* Suggestions */}
            {analysis.pronunciation.suggestions.length > 0 && (
              <div className="mt-6">
                <h4 className="font-semibold text-ancient-800 mb-3">💡 Improvement Suggestions</h4>
                <ul className="space-y-2">
                  {analysis.pronunciation.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-ancient-700">
                      <span className="text-saffron-500 mt-1">•</span>
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Session Statistics */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-ancient-800 mb-4">Session Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-ancient-800">{sessionStats.attempts}</div>
              <div className="text-sm text-ancient-600">Attempts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-saffron-600">
                {Math.round(sessionStats.averageAccuracy)}%
              </div>
              <div className="text-sm text-ancient-600">Average</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(sessionStats.bestAccuracy)}%
              </div>
              <div className="text-sm text-ancient-600">Best</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(sessionStats.totalPracticeTime / 60)}m
              </div>
              <div className="text-sm text-ancient-600">Practice Time</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};