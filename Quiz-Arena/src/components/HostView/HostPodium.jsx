import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import confetti from 'canvas-confetti';
import { Trophy, Award, RefreshCw, PlusCircle, BarChart2, Flame, CheckCircle2 } from 'lucide-react';
import { selectPodium, selectSortedLeaderboard, selectGameSummaryAnalytics } from '../../store/selectors';
import { resetGame, createGameSessionAsync } from '../../store/slices/gameSlice';
import { resetPlayers } from '../../store/slices/playersSlice';
import { audioService } from '../../services/audio';

export default function HostPodium({ setActiveMode }) {
  const dispatch = useDispatch();
  const { first, second, third } = useSelector(selectPodium);
  const sortedPlayers = useSelector(selectSortedLeaderboard);
  const analytics = useSelector(selectGameSummaryAnalytics);
  const activeQuiz = useSelector((state) => state.quiz.activeQuiz);

  useEffect(() => {
    audioService.playFanfare();

    const duration = 4 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 } });
      confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 } });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, []);

  const handlePlayAgain = () => {
    dispatch(resetPlayers());
    if (activeQuiz) {
      dispatch(createGameSessionAsync(activeQuiz));
    }
  };

  const handleNewGame = () => {
    dispatch(resetGame());
    dispatch(resetPlayers());
    setActiveMode('CREATOR');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-10 text-center">
      
      {/* Title */}
      <div className="space-y-2">
        <div className="inline-flex items-center space-x-2 bg-amber-500/20 border border-amber-400/40 px-4 py-1.5 rounded-full text-xs font-black text-amber-300 uppercase">
          <Trophy className="w-4 h-4" />
          <span>Final Battle Results</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black text-white">Victory Podium 🏆</h1>
      </div>

      {/* 3D Podium Layout */}
      <div className="flex items-end justify-center space-x-3 sm:space-x-6 pt-12 pb-4">
        
        {/* 2nd Place Pedestal */}
        <div className="flex flex-col items-center flex-1 max-w-[150px] sm:max-w-[180px] animate-bounce-short" style={{ animationDelay: '0.2s' }}>
          {second ? (
            <div className="space-y-1 mb-2">
              <span className="text-3xl sm:text-4xl block">{second.avatar || '🦊'}</span>
              <h4 className="font-extrabold text-xs sm:text-sm text-white truncate max-w-full">{second.nickname}</h4>
              <span className="text-xs font-black text-slate-300">{second.score.toLocaleString()} pts</span>
            </div>
          ) : (
            <span className="text-xs text-gray-500 mb-2">Empty</span>
          )}
          <div className="w-full h-36 sm:h-44 bg-gradient-to-t from-slate-700 to-slate-500 rounded-t-3xl border-t-4 border-slate-300 flex flex-col items-center justify-center text-white shadow-2xl">
            <span className="text-3xl sm:text-5xl font-black">2</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Silver</span>
          </div>
        </div>

        {/* 1st Place Pedestal */}
        <div className="flex flex-col items-center flex-1 max-w-[170px] sm:max-w-[210px] z-10 animate-bounce-short">
          {first ? (
            <div className="space-y-1 mb-2">
              <div className="relative inline-block">
                <span className="text-4xl sm:text-5xl block">{first.avatar || '👑'}</span>
                <span className="absolute -top-3 -right-2 text-2xl">👑</span>
              </div>
              <h4 className="font-black text-sm sm:text-base text-amber-300 truncate max-w-full">{first.nickname}</h4>
              <span className="text-sm font-black text-kahoot-yellow">{first.score.toLocaleString()} pts</span>
            </div>
          ) : (
            <span className="text-xs text-gray-500 mb-2">Empty</span>
          )}
          <div className="w-full h-48 sm:h-56 bg-gradient-to-t from-amber-600 to-amber-400 rounded-t-3xl border-t-4 border-amber-200 flex flex-col items-center justify-center text-black shadow-2xl">
            <span className="text-4xl sm:text-6xl font-black">1</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-950">Champion</span>
          </div>
        </div>

        {/* 3rd Place Pedestal */}
        <div className="flex flex-col items-center flex-1 max-w-[150px] sm:max-w-[180px] animate-bounce-short" style={{ animationDelay: '0.4s' }}>
          {third ? (
            <div className="space-y-1 mb-2">
              <span className="text-3xl sm:text-4xl block">{third.avatar || '⚡'}</span>
              <h4 className="font-extrabold text-xs sm:text-sm text-white truncate max-w-full">{third.nickname}</h4>
              <span className="text-xs font-black text-amber-600">{third.score.toLocaleString()} pts</span>
            </div>
          ) : (
            <span className="text-xs text-gray-500 mb-2">Empty</span>
          )}
          <div className="w-full h-28 sm:h-36 bg-gradient-to-t from-amber-800 to-amber-700 rounded-t-3xl border-t-4 border-amber-500 flex flex-col items-center justify-center text-white shadow-2xl">
            <span className="text-3xl sm:text-5xl font-black">3</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300">Bronze</span>
          </div>
        </div>

      </div>

      {/* Summary Performance Analytics Box */}
      <div className="glass-panel p-6 rounded-3xl space-y-4 text-left">
        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center space-x-2">
          <BarChart2 className="w-4 h-4 text-kahoot-pink" />
          <span>Game Analytics & Class Performance</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-black/40 p-4 rounded-2xl border border-white/10 text-center">
            <span className="text-xs text-gray-400 font-bold block">Class Accuracy</span>
            <span className="text-2xl font-black text-emerald-400">{analytics.accuracyPercent}%</span>
          </div>
          <div className="bg-black/40 p-4 rounded-2xl border border-white/10 text-center">
            <span className="text-xs text-gray-400 font-bold block">Average Score</span>
            <span className="text-2xl font-black text-kahoot-yellow">{analytics.averageScore.toLocaleString()}</span>
          </div>
          <div className="bg-black/40 p-4 rounded-2xl border border-white/10 text-center">
            <span className="text-xs text-gray-400 font-bold block">Highest Streak</span>
            <span className="text-2xl font-black text-amber-400">🔥 {analytics.topStreak}</span>
          </div>
          <div className="bg-black/40 p-4 rounded-2xl border border-white/10 text-center">
            <span className="text-xs text-gray-400 font-bold block">Total Players</span>
            <span className="text-2xl font-black text-white">{analytics.totalPlayers}</span>
          </div>
        </div>

        {/* Complete Standings Table */}
        <div className="space-y-2 pt-2">
          <h4 className="text-xs font-bold text-gray-300">Full Player Standings</h4>
          {sortedPlayers.map((player) => (
            <div key={player.id} className="p-3 rounded-xl bg-black/40 border border-white/10 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="font-black text-sm text-kahoot-pink w-6">#{player.rank}</span>
                <span className="text-xl">{player.avatar}</span>
                <span className="font-bold text-sm text-white">{player.nickname}</span>
              </div>
              <span className="font-black text-sm text-kahoot-yellow">{player.score.toLocaleString()} pts</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dual Control Actions: Play Again vs New Game */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
        <button
          onClick={handlePlayAgain}
          className="w-full sm:w-64 py-4 rounded-2xl bg-kahoot-purple hover:bg-kahoot-pink transition-all font-black text-white text-base shadow-xl flex items-center justify-center space-x-2"
        >
          <RefreshCw className="w-5 h-5" />
          <span>Play Again (New PIN)</span>
        </button>

        <button
          onClick={handleNewGame}
          className="w-full sm:w-64 py-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all font-black text-white text-base border border-white/20 flex items-center justify-center space-x-2"
        >
          <PlusCircle className="w-5 h-5 text-kahoot-green" />
          <span>Create New Quiz</span>
        </button>
      </div>

    </div>
  );
}
