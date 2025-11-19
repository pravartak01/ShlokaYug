import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  Trophy, 
  Clock, 
  Zap, 
  Target, 
  Brain,
  Music,
  Star,
  Award,
  CheckCircle,
  XCircle,
  Timer,
  RotateCcw
} from 'lucide-react';
import type { GameQuestion, GameState } from '../../types/chandas';
import { GAME_QUESTIONS, CHANDAS_DATABASE } from '../../data/dummyData';

export const ChandasGames: React.FC = () => {
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    level: 1,
    score: 0,
    streak: 0,
    lives: 3,
    currentQuestion: GAME_QUESTIONS[0],
    timeRemaining: 30,
    gameMode: 'identify'
  });
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [gameStats, setGameStats] = useState({
    totalGames: 42,
    averageScore: 85,
    bestStreak: 15,
    timeSpent: 127 // minutes
  });

  const gameTypes = [
    {
      id: 'chandas-quiz',
      title: 'Chandas Quiz',
      description: 'Identify the meter of Sanskrit verses',
      icon: Brain,
      color: 'from-blue-500 to-indigo-600',
      difficulty: 'Easy → Hard',
      players: '1.2k active',
      estimatedTime: '5-10 min'
    },
    {
      id: 'rhythm-master',
      title: 'Rhythm Master',
      description: 'Match laghu-guru patterns with audio beats',
      icon: Music,
      color: 'from-purple-500 to-pink-600',
      difficulty: 'Medium',
      players: '890 active',
      estimatedTime: '3-7 min'
    },
    {
      id: 'speed-analysis',
      title: 'Speed Analysis',
      description: 'Identify chandas as fast as possible',
      icon: Zap,
      color: 'from-yellow-500 to-orange-600',
      difficulty: 'Expert',
      players: '432 active',
      estimatedTime: '2-5 min'
    },
    {
      id: 'shloka-complete',
      title: 'Shloka Complete',
      description: 'Complete famous Sanskrit verses',
      icon: Target,
      color: 'from-green-500 to-emerald-600',
      difficulty: 'Medium → Hard',
      players: '654 active',
      estimatedTime: '8-12 min'
    },
    {
      id: 'memory-palace',
      title: 'Memory Palace',
      description: 'Memorize complex meter patterns',
      icon: Award,
      color: 'from-red-500 to-rose-600',
      difficulty: 'Hard',
      players: '321 active',
      estimatedTime: '10-15 min'
    },
    {
      id: 'pronunciation-pro',
      title: 'Pronunciation Pro',
      description: 'Perfect your Sanskrit pronunciation',
      icon: Trophy,
      color: 'from-teal-500 to-cyan-600',
      difficulty: 'Easy → Expert',
      players: '1.5k active',
      estimatedTime: '6-10 min'
    }
  ];

  // Timer effect
  useEffect(() => {
    if (activeGame && gameState.timeRemaining > 0 && !showResult) {
      const timer = setTimeout(() => {
        setGameState(prev => ({ ...prev, timeRemaining: prev.timeRemaining - 1 }));
      }, 1000);
      return () => clearTimeout(timer);
    } else if (gameState.timeRemaining === 0 && !showResult) {
      handleTimeUp();
    }
  }, [activeGame, gameState.timeRemaining, showResult]);

  const startGame = (gameId: string) => {
    setActiveGame(gameId);
    setGameState({
      level: 1,
      score: 0,
      streak: 0,
      lives: 3,
      currentQuestion: GAME_QUESTIONS[Math.floor(Math.random() * GAME_QUESTIONS.length)],
      timeRemaining: 30,
      gameMode: 'identify'
    });
    setSelectedAnswer('');
    setShowResult(false);
  };

  const submitAnswer = () => {
    const correct = selectedAnswer === gameState.currentQuestion.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);

    if (correct) {
      setGameState(prev => ({
        ...prev,
        score: prev.score + gameState.currentQuestion.points,
        streak: prev.streak + 1
      }));
    } else {
      setGameState(prev => ({
        ...prev,
        lives: prev.lives - 1,
        streak: 0
      }));
    }
  };

  const nextQuestion = () => {
    if (gameState.lives === 0) {
      endGame();
      return;
    }

    const nextQ = GAME_QUESTIONS[Math.floor(Math.random() * GAME_QUESTIONS.length)];
    setGameState(prev => ({
      ...prev,
      currentQuestion: nextQ,
      timeRemaining: 30,
      level: Math.floor(prev.score / 100) + 1
    }));
    setSelectedAnswer('');
    setShowResult(false);
  };

  const handleTimeUp = () => {
    setIsCorrect(false);
    setShowResult(true);
    setGameState(prev => ({
      ...prev,
      lives: prev.lives - 1,
      streak: 0
    }));
  };

  const endGame = () => {
    setActiveGame(null);
    // Update stats (in real app, this would be sent to backend)
    setGameStats(prev => ({
      ...prev,
      totalGames: prev.totalGames + 1,
      averageScore: Math.round((prev.averageScore + gameState.score) / 2),
      bestStreak: Math.max(prev.bestStreak, gameState.streak)
    }));
  };

  const resetGame = () => {
    setActiveGame(null);
    setSelectedAnswer('');
    setShowResult(false);
  };

  if (activeGame) {
    return (
      <div className="space-y-6">
        {/* Game Header */}
        <Card className="bg-gradient-to-r from-ancient-900 via-saffron-900 to-ancient-900 text-white">
          <div className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-ancient font-bold">
                  {gameTypes.find(g => g.id === activeGame)?.title}
                </h2>
                <p className="text-ancient-200">Level {gameState.level}</p>
              </div>
              <div className="flex gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-saffron-400">{gameState.score}</div>
                  <div className="text-xs text-ancient-300">Score</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-lotus-400">{gameState.streak}</div>
                  <div className="text-xs text-ancient-300">Streak</div>
                </div>
                <div>
                  <div className="flex gap-1">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-6 h-6 rounded-full ${
                          i < gameState.lives ? 'bg-red-500' : 'bg-ancient-700'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-ancient-300">Lives</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-yellow-400">{gameState.timeRemaining}</div>
                  <div className="text-xs text-ancient-300">Time</div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Question Card */}
        <Card>
          <div className="p-8">
            {!showResult ? (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-ancient-100 rounded-full text-ancient-700 text-sm font-medium mb-4">
                    <Clock className="w-4 h-4" />
                    Question {gameState.level}
                  </div>
                  <h3 className="text-2xl font-semibold text-ancient-800 mb-4">
                    {gameState.currentQuestion.question}
                  </h3>
                  <div className="text-sm text-ancient-600">
                    Difficulty: <span className="font-medium">{gameState.currentQuestion.difficulty}</span> • 
                    Points: <span className="font-medium text-saffron-600">{gameState.currentQuestion.points}</span>
                  </div>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  {gameState.currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedAnswer(option)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                        selectedAnswer === option
                          ? 'border-saffron-500 bg-saffron-50 shadow-md'
                          : 'border-ancient-200 hover:border-ancient-300 hover:bg-ancient-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedAnswer === option
                            ? 'border-saffron-500 bg-saffron-500 text-white'
                            : 'border-ancient-300'
                        }`}>
                          {selectedAnswer === option && <CheckCircle className="w-4 h-4" />}
                        </div>
                        <span className="font-medium text-ancient-800">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Submit Button */}
                <div className="text-center">
                  <Button
                    onClick={submitAnswer}
                    disabled={!selectedAnswer}
                    className="bg-gradient-to-r from-saffron-600 to-ancient-600 px-8 py-3 text-lg"
                  >
                    Submit Answer
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-6">
                {/* Result Display */}
                <div className={`inline-flex items-center gap-3 px-6 py-4 rounded-full text-white text-lg font-semibold ${
                  isCorrect ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {isCorrect ? (
                    <>
                      <CheckCircle className="w-6 h-6" />
                      Correct! +{gameState.currentQuestion.points} points
                    </>
                  ) : (
                    <>
                      <XCircle className="w-6 h-6" />
                      Incorrect! -1 life
                    </>
                  )}
                </div>

                {/* Explanation */}
                <div className="max-w-2xl mx-auto">
                  <h3 className="text-xl font-semibold text-ancient-800 mb-2">Explanation</h3>
                  <p className="text-ancient-600">{gameState.currentQuestion.explanation}</p>
                  {!isCorrect && (
                    <p className="text-ancient-700 mt-2">
                      Correct answer: <span className="font-semibold text-saffron-600">
                        {gameState.currentQuestion.correctAnswer}
                      </span>
                    </p>
                  )}
                </div>

                {/* Next Button */}
                <div className="flex justify-center gap-4">
                  {gameState.lives > 0 ? (
                    <Button
                      onClick={nextQuestion}
                      className="bg-gradient-to-r from-saffron-600 to-ancient-600 px-8 py-3"
                    >
                      Next Question
                    </Button>
                  ) : (
                    <Button
                      onClick={endGame}
                      className="bg-gradient-to-r from-red-600 to-rose-600 px-8 py-3"
                    >
                      Game Over - View Results
                    </Button>
                  )}
                  <Button onClick={resetGame} variant="outline" className="px-8 py-3">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Quit Game
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Progress Bar */}
        <Card>
          <div className="p-4">
            <div className="flex justify-between text-sm text-ancient-600 mb-2">
              <span>Level Progress</span>
              <span>{gameState.score % 100}/100 XP</span>
            </div>
            <div className="w-full bg-ancient-100 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-saffron-500 to-ancient-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${(gameState.score % 100)}%` }}
              />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-ancient-900 via-saffron-900 to-ancient-900 text-white">
        <div className="p-6">
          <h2 className="text-3xl font-ancient font-bold mb-2">
            🎮 Chandas Games
          </h2>
          <p className="text-ancient-200">
            Master Sanskrit prosody through interactive games and challenges
          </p>
        </div>
      </Card>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <div className="p-4 text-center">
            <Trophy className="w-8 h-8 mx-auto text-saffron-500 mb-2" />
            <div className="text-2xl font-bold text-ancient-800">{gameStats.totalGames}</div>
            <div className="text-sm text-ancient-600">Games Played</div>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <Star className="w-8 h-8 mx-auto text-lotus-500 mb-2" />
            <div className="text-2xl font-bold text-ancient-800">{gameStats.averageScore}%</div>
            <div className="text-sm text-ancient-600">Average Score</div>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <Zap className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
            <div className="text-2xl font-bold text-ancient-800">{gameStats.bestStreak}</div>
            <div className="text-sm text-ancient-600">Best Streak</div>
          </div>
        </Card>
        <Card>
          <div className="p-4 text-center">
            <Timer className="w-8 h-8 mx-auto text-blue-500 mb-2" />
            <div className="text-2xl font-bold text-ancient-800">{gameStats.timeSpent}m</div>
            <div className="text-sm text-ancient-600">Time Played</div>
          </div>
        </Card>
      </div>

      {/* Game Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gameTypes.map((game) => (
          <Card key={game.id} className="hover:shadow-lg transition-all duration-300 overflow-hidden">
            <div className={`h-2 bg-gradient-to-r ${game.color}`} />
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-lg bg-gradient-to-r ${game.color} text-white`}>
                  <game.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-ancient-800">{game.title}</h3>
                  <p className="text-sm text-ancient-600">{game.description}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-ancient-600">Difficulty:</span>
                  <span className="font-medium text-ancient-800">{game.difficulty}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ancient-600">Players:</span>
                  <span className="font-medium text-saffron-600">{game.players}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-ancient-600">Time:</span>
                  <span className="font-medium text-ancient-800">{game.estimatedTime}</span>
                </div>
              </div>

              <Button
                onClick={() => startGame(game.id)}
                className={`w-full bg-gradient-to-r ${game.color} hover:shadow-lg transition-all duration-200`}
              >
                Play Now
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Leaderboard Preview */}
      <Card>
        <div className="p-6">
          <h3 className="text-xl font-semibold text-ancient-800 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Global Leaderboard
          </h3>
          <div className="space-y-3">
            {[
              { rank: 1, name: 'Sanskrit Master', score: 2847, avatar: '👑' },
              { rank: 2, name: 'Prosody Expert', score: 2156, avatar: '🏆' },
              { rank: 3, name: 'Meter Guru', score: 1923, avatar: '🥉' },
              { rank: 4, name: 'Chandas Scholar', score: 1756, avatar: '📚' },
              { rank: 5, name: 'You', score: gameStats.averageScore * 20, avatar: '⭐' }
            ].map((player) => (
              <div key={player.rank} className={`flex items-center justify-between p-3 rounded-lg ${
                player.name === 'You' ? 'bg-saffron-50 border border-saffron-200' : 'bg-ancient-50'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{player.avatar}</span>
                  <div>
                    <div className="font-medium text-ancient-800">#{player.rank} {player.name}</div>
                    <div className="text-sm text-ancient-600">{player.score} total points</div>
                  </div>
                </div>
                {player.name === 'You' && (
                  <span className="text-xs bg-saffron-200 text-saffron-800 px-2 py-1 rounded">
                    Your Rank
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};