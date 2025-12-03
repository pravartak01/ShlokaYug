import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Mic,
  Square,
  Play,
  Pause,
  RefreshCw,
  Upload,
  ChevronRight,
  Music,
  Volume2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Sparkles,
  Target,
  Timer,
  Waves,
} from 'lucide-react';
import type { ShlokaData } from '../../data/shlokas';
import { ALL_SHLOKAS, getAudioUrl, hasAudio } from '../../data/shlokas';

interface VoiceAnalysisScreenProps {
  initialShloka?: ShlokaData | null;
  onBack: () => void;
}

interface AnalysisResult {
  overallScore: number;
  pronunciation: number;
  timing: number;
  fluency: number;
  feedback: string[];
  wordScores: { word: string; score: number; feedback: string }[];
}

type Step = 'select' | 'record' | 'review' | 'results';

const STEPS = [
  { id: 'select', label: 'Select', icon: Music },
  { id: 'record', label: 'Record', icon: Mic },
  { id: 'review', label: 'Review', icon: Play },
  { id: 'results', label: 'Results', icon: Target },
];

const VoiceAnalysisScreen: React.FC<VoiceAnalysisScreenProps> = ({
  initialShloka,
  onBack,
}) => {
  const [step, setStep] = useState<Step>(initialShloka ? 'record' : 'select');
  const [selectedShloka, setSelectedShloka] = useState<ShlokaData | null>(initialShloka || null);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Playback state
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);
  const [isPlayingOriginal, setIsPlayingOriginal] = useState(false);

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recordingAudioRef = useRef<HTMLAudioElement | null>(null);
  const originalAudioRef = useRef<HTMLAudioElement | null>(null);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (recordingAudioRef.current) recordingAudioRef.current.pause();
      if (originalAudioRef.current) originalAudioRef.current.pause();
    };
  }, [audioUrl]);

  // Start recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setStep('review');
    }
  };

  // Delete recording
  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setStep('record');
  };

  // Play recording
  const togglePlayRecording = () => {
    if (!audioUrl) return;

    if (isPlayingRecording) {
      recordingAudioRef.current?.pause();
      setIsPlayingRecording(false);
    } else {
      if (!recordingAudioRef.current) {
        recordingAudioRef.current = new Audio(audioUrl);
        recordingAudioRef.current.onended = () => setIsPlayingRecording(false);
      }
      recordingAudioRef.current.play();
      setIsPlayingRecording(true);
    }
  };

  // Play original
  const togglePlayOriginal = () => {
    if (!selectedShloka) return;
    const url = getAudioUrl(selectedShloka.id);
    if (!url) return;

    if (isPlayingOriginal) {
      originalAudioRef.current?.pause();
      setIsPlayingOriginal(false);
    } else {
      if (!originalAudioRef.current) {
        originalAudioRef.current = new Audio(url);
        originalAudioRef.current.onended = () => setIsPlayingOriginal(false);
      }
      originalAudioRef.current.play();
      setIsPlayingOriginal(true);
    }
  };

  // Analyze recording (simulated)
  const analyzeRecording = useCallback(async () => {
    setIsAnalyzing(true);
    setStep('results');

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // Generate mock analysis results
    const mockResult: AnalysisResult = {
      overallScore: Math.floor(Math.random() * 20) + 75,
      pronunciation: Math.floor(Math.random() * 25) + 70,
      timing: Math.floor(Math.random() * 20) + 75,
      fluency: Math.floor(Math.random() * 25) + 70,
      feedback: [
        'Good pronunciation of Sanskrit syllables',
        'Work on maintaining consistent rhythm',
        'Try to hold vowel sounds slightly longer',
        'Excellent breath control throughout',
      ],
      wordScores:
        selectedShloka?.lines[0]?.words.map((word) => ({
          word: word.text,
          score: Math.floor(Math.random() * 30) + 70,
          feedback:
            Math.random() > 0.5
              ? 'Well pronounced'
              : 'Needs slight improvement in emphasis',
        })) || [],
    };

    setAnalysisResult(mockResult);
    setIsAnalyzing(false);
  }, [selectedShloka]);

  // Reset and start over
  const startOver = () => {
    deleteRecording();
    setAnalysisResult(null);
    setStep(initialShloka ? 'record' : 'select');
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Score color
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-400';
    if (score >= 70) return 'text-amber-400';
    return 'text-orange-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 85) return 'from-green-500 to-emerald-500';
    if (score >= 70) return 'from-amber-500 to-yellow-500';
    return 'from-orange-500 to-red-500';
  };

  // Get step index
  const getStepIndex = () => STEPS.findIndex(s => s.id === step);

  // Shloka Selection Step
  const renderSelectStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="px-4 md:px-8 py-6 max-w-3xl mx-auto"
    >
      <div className="text-center mb-6">
        <h2 className="text-white font-bold text-2xl mb-2">Select a Shloka</h2>
        <p className="text-gray-400">Choose a shloka to practice with voice analysis</p>
      </div>

      <div className="space-y-3">
        {ALL_SHLOKAS.filter((s) => hasAudio(s.id)).map((shloka, index) => (
          <motion.button
            key={shloka.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => {
              setSelectedShloka(shloka);
              setStep('record');
            }}
            className="w-full flex items-center bg-[#1a1a2e] rounded-2xl p-4 hover:bg-[#252545] transition-all text-left group border border-transparent hover:border-orange-500/30"
          >
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
              style={{ 
                background: `linear-gradient(135deg, ${shloka.thumbnailColor}30, ${shloka.thumbnailColor}10)`,
                border: `1px solid ${shloka.thumbnailColor}30`
              }}
            >
              <Music className="w-6 h-6" style={{ color: shloka.thumbnailColor }} />
            </div>
            <div className="flex-1 ml-4 min-w-0">
              <h3 className="text-white font-semibold truncate group-hover:text-orange-300 transition-colors">{shloka.title}</h3>
              <p className="text-gray-500 text-sm truncate">{shloka.subtitle}</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
          </motion.button>
        ))}
      </div>
    </motion.div>
  );

  // Recording Step
  const renderRecordStep = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-[65vh] px-4"
    >
      {/* Selected Shloka Info */}
      {selectedShloka && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h2 className="text-white font-bold text-2xl">{selectedShloka.title}</h2>
          <p className="text-gray-400 text-sm mt-1">{selectedShloka.subtitle}</p>

          {/* Listen to original button */}
          {hasAudio(selectedShloka.id) && (
            <button
              onClick={togglePlayOriginal}
              className={`mt-4 flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl transition-all ${
                isPlayingOriginal 
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30' 
                  : 'bg-[#1a1a2e] text-gray-300 hover:bg-[#252545] border border-white/10'
              }`}
            >
              {isPlayingOriginal ? (
                <Pause className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {isPlayingOriginal ? 'Pause' : 'Listen First'}
              </span>
            </button>
          )}
        </motion.div>
      )}

      {/* Recording Visualizer */}
      <div className="relative mb-10">
        <motion.div
          animate={isRecording ? { scale: [1, 1.05, 1] } : {}}
          transition={{ repeat: Infinity, duration: 1 }}
          className={`w-44 h-44 rounded-full flex items-center justify-center relative ${
            isRecording
              ? 'bg-gradient-to-br from-red-500/30 to-rose-600/30 border-4 border-red-500'
              : 'bg-[#1a1a2e] border-4 border-[#252545]'
          }`}
        >
          <div className="text-center">
            <Mic className={`w-14 h-14 mx-auto transition-colors ${isRecording ? 'text-red-500' : 'text-gray-400'}`} />
            <p className="text-white font-mono text-3xl mt-3">{formatTime(recordingTime)}</p>
          </div>
        </motion.div>

        {/* Recording pulse rings */}
        {isRecording && (
          <>
            <motion.div
              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="absolute inset-0 rounded-full border-4 border-red-500/50"
            />
            <motion.div
              animate={{ scale: [1, 1.8], opacity: [0.3, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.3 }}
              className="absolute inset-0 rounded-full border-4 border-red-500/30"
            />
          </>
        )}
      </div>

      {/* Instructions */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-gray-400 text-center mb-10 max-w-sm"
      >
        {isRecording
          ? 'Recording... Recite the shloka clearly and tap stop when done.'
          : 'Tap the microphone button to start recording your recitation.'}
      </motion.p>

      {/* Record/Stop Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={isRecording ? stopRecording : startRecording}
        className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all ${
          isRecording
            ? 'bg-red-500 shadow-red-500/40'
            : 'bg-gradient-to-r from-orange-500 to-amber-500 shadow-orange-500/40'
        }`}
        title={isRecording ? 'Stop recording' : 'Start recording'}
      >
        {isRecording ? (
          <Square className="w-8 h-8 text-white fill-white" />
        ) : (
          <Mic className="w-8 h-8 text-white" />
        )}
      </motion.button>
    </motion.div>
  );

  // Review Step
  const renderReviewStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[65vh] px-4"
    >
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mb-6 border border-green-500/30">
        <CheckCircle2 className="w-10 h-10 text-green-400" />
      </div>
      
      <h2 className="text-white font-bold text-2xl mb-2">Review Your Recording</h2>
      <p className="text-gray-400 text-sm mb-8 text-center max-w-sm">
        Listen to your recording and compare with the original before submitting
      </p>

      {/* Recording Card */}
      <div className="bg-[#1a1a2e] rounded-3xl p-6 w-full max-w-sm mb-8 border border-white/5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <Timer className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <span className="text-gray-400 text-sm">Duration</span>
              <p className="text-white font-mono text-lg">{formatTime(recordingTime)}</p>
            </div>
          </div>
          <Waves className="w-8 h-8 text-gray-600" />
        </div>

        <div className="flex justify-center gap-3">
          {/* Play Recording */}
          <button
            onClick={togglePlayRecording}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all ${
              isPlayingRecording 
                ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white' 
                : 'bg-[#252545] text-white hover:bg-[#303060]'
            }`}
          >
            {isPlayingRecording ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span className="text-sm font-medium">{isPlayingRecording ? 'Pause' : 'Play'}</span>
          </button>

          {/* Play Original */}
          {selectedShloka && hasAudio(selectedShloka.id) && (
            <button
              onClick={togglePlayOriginal}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all ${
                isPlayingOriginal 
                  ? 'bg-gradient-to-r from-purple-500 to-violet-500 text-white' 
                  : 'bg-[#252545] text-gray-300 hover:bg-[#303060]'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span className="text-sm font-medium">Original</span>
            </button>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={deleteRecording}
          className="flex items-center gap-2 px-6 py-3 bg-[#1a1a2e] rounded-xl text-gray-400 hover:text-white hover:bg-[#252545] transition-all border border-white/5"
        >
          <Trash2 className="w-4 h-4" />
          <span className="font-medium">Re-record</span>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={analyzeRecording}
          className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white shadow-lg shadow-orange-500/30"
        >
          <Upload className="w-4 h-4" />
          <span className="font-medium">Analyze</span>
        </motion.button>
      </div>
    </motion.div>
  );

  // Results Step
  const renderResultsStep = () => (
    <div className="px-4 md:px-8 py-6 max-w-3xl mx-auto">
      {isAnalyzing ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center min-h-[55vh]"
        >
          <div className="relative">
            <Loader2 className="w-20 h-20 text-orange-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
            </div>
          </div>
          <h2 className="text-white font-bold text-2xl mt-6 mb-2">Analyzing Your Recording</h2>
          <p className="text-gray-400 text-sm text-center max-w-sm">
            Our AI is evaluating your pronunciation, timing, and fluency...
          </p>
        </motion.div>
      ) : analysisResult ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Overall Score Card */}
          <div className="bg-gradient-to-br from-[#252545] to-[#1a1a2e] rounded-3xl p-8 mb-6 border border-white/10">
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-3">Overall Score</p>
              <div className="relative inline-block">
                <svg className="w-36 h-36 -rotate-90">
                  <circle
                    cx="72"
                    cy="72"
                    r="64"
                    fill="none"
                    stroke="#252545"
                    strokeWidth="12"
                  />
                  <circle
                    cx="72"
                    cy="72"
                    r="64"
                    fill="none"
                    stroke="url(#scoreGradient)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${(analysisResult.overallScore / 100) * 402} 402`}
                  />
                  <defs>
                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f97316" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-5xl font-bold ${getScoreColor(analysisResult.overallScore)}`}>
                    {analysisResult.overallScore}
                  </span>
                </div>
              </div>
              <p className="text-gray-500 text-sm mt-2">out of 100</p>
            </div>

            {/* Score Breakdown */}
            <div className="grid grid-cols-3 gap-4 mt-8">
              {[
                { label: 'Pronunciation', value: analysisResult.pronunciation, icon: Mic },
                { label: 'Timing', value: analysisResult.timing, icon: Timer },
                { label: 'Fluency', value: analysisResult.fluency, icon: Waves },
              ].map((item) => (
                <div key={item.label} className="text-center bg-[#1a1a2e] rounded-2xl p-4">
                  <item.icon className="w-5 h-5 mx-auto text-gray-500 mb-2" />
                  <p className={`text-2xl font-bold ${getScoreColor(item.value)}`}>{item.value}</p>
                  <p className="text-gray-500 text-xs mt-1">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Feedback */}
          <div className="bg-[#1a1a2e] rounded-3xl p-5 mb-6 border border-white/5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Feedback
            </h3>
            <div className="space-y-3">
              {analysisResult.feedback.map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-3 bg-[#252545]/50 rounded-xl p-3"
                >
                  {idx < 2 ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                  )}
                  <p className="text-gray-300 text-sm">{item}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Word Scores */}
          {analysisResult.wordScores.length > 0 && (
            <div className="bg-[#1a1a2e] rounded-3xl p-5 mb-8 border border-white/5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-orange-400" />
                Word Analysis
              </h3>
              <div className="space-y-3">
                {analysisResult.wordScores.slice(0, 5).map((wordScore, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-[#252545]/50 rounded-xl p-3">
                    <span className="text-white font-medium">{wordScore.word}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-2 bg-[#1a1a2e] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${wordScore.score}%` }}
                          transition={{ duration: 0.5, delay: idx * 0.1 }}
                          className={`h-full rounded-full bg-gradient-to-r ${getScoreBg(wordScore.score)}`}
                        />
                      </div>
                      <span className={`text-sm font-bold w-10 text-right ${getScoreColor(wordScore.score)}`}>
                        {wordScore.score}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={startOver}
              className="flex items-center gap-2 px-6 py-3 bg-[#1a1a2e] rounded-xl text-white hover:bg-[#252545] transition-all border border-white/5"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="font-medium">Try Again</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onBack}
              className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl text-white shadow-lg shadow-orange-500/30"
            >
              <span className="font-medium">Done</span>
            </motion.button>
          </div>
        </motion.div>
      ) : null}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f1a] via-[#1a1a2e] to-[#0f0f1a]">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-gradient-to-b from-[#0f0f1a] to-transparent backdrop-blur-xl">
        <div className="flex items-center p-4 md:px-8 max-w-4xl mx-auto">
          <button
            onClick={step === 'select' ? onBack : startOver}
            className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all border border-white/5"
            title="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          <div className="flex-1 text-center mx-4">
            <h1 className="text-white font-bold text-lg">Voice Analysis</h1>
          </div>

          {/* Progress Steps */}
          <div className="flex gap-1.5">
            {STEPS.map((s, idx) => (
              <div
                key={s.id}
                className={`w-8 h-1.5 rounded-full transition-all ${
                  getStepIndex() >= idx
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500'
                    : 'bg-[#252545]'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Labels */}
        <div className="flex justify-center gap-6 pb-4 px-4">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isActive = getStepIndex() >= idx;
            const isCurrent = step === s.id;
            return (
              <div
                key={s.id}
                className={`flex items-center gap-2 transition-all ${
                  isCurrent ? 'text-orange-400' : isActive ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  isCurrent 
                    ? 'bg-orange-500/20 border border-orange-500/50' 
                    : isActive 
                    ? 'bg-[#252545]' 
                    : 'bg-[#1a1a2e]'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-xs font-medium hidden md:block">{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {step === 'select' && renderSelectStep()}
        {step === 'record' && renderRecordStep()}
        {step === 'review' && renderReviewStep()}
        {step === 'results' && renderResultsStep()}
      </AnimatePresence>
    </div>
  );
};

export default VoiceAnalysisScreen;
