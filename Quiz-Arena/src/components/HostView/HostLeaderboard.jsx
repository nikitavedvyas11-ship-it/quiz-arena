import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Award, Flame, ArrowRight, Trophy, TrendingUp } from 'lucide-react';
import { nextQuestionAsync, endGameAsync } from '../../store/slices/gameSlice';
import { selectSortedLeaderboard, selectCurrentQuestion } from '../../store/selectors';
import { audioService } from '../../services/audio';

export default function HostLeaderboard() {
  const dispatch = useDispatch();
  const sortedPlayers = useSelector(selectSortedLeaderboard);
  const { isLastQuestion } = useSelector(selectCurrentQuestion);

  useEffect(() => {
    audioService.playSelect();
  }, []);

  const handleNextStep = () => {
    audioService.playSelect();
    if (isLastQuestion) {
      dispatch(endGameAsync());
    } else {
      dispatch(nextQuestionAsync());
    }
  };

  const topPlayers = sortedPlayers.slice(0, 5);
  const highestScore = Math.max(1, topPlayers[0]?.score || 1);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 text-center">
      
      {/* Leaderboard Header */}
      <div className="space-y-2">
        <div className="inline-flex items-center space-x-2 bg-kahoot-purple/30 border border-kahoot-pink/40 px-4 py-1.5 rounded-full text-xs font-black text-kahoot-pink uppercase">
          <Award className="w-4 h-4" />
          <span>Live Scores & Rank Movement</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white">🏆 Leaderboard</h2>
      </div>

      {/* Players Scores List with Rank Movements */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/20 shadow-2xl space-y-4 text-left">
        {topPlayers.length > 0 ? (
          topPlayers.map((player, idx) => {
            const barPercent = Math.round(((player.score || 0) / highestScore) * 100);
            const rankColors = ['bg-amber-400 text-black', 'bg-slate-300 text-black', 'bg-amber-700 text-white', 'bg-white/20 text-white', 'bg-white/20 text-white'];

            return (
              <div 
                key={player.id}
                className="p-4 rounded-2xl bg-black/40 border border-white/10 relative overflow-hidden space-y-2 group"
              >
                {/* Score Bar Fill */}
                <div 
                  className="absolute top-0 left-0 bottom-0 bg-kahoot-purple/40 transition-all duration-1000 -z-0 rounded-2xl"
                  style={{ width: `${Math.max(8, barPercent)}%` }}
                ></div>

                <div className="relative z-10 flex items-center justify-between">
                  
                  {/* Left: Rank Badge + Movement + Avatar + Nickname */}
                  <div className="flex items-center space-x-3">
                    <span className={`w-8 h-8 rounded-xl ${rankColors[idx]} font-black text-sm flex items-center justify-center shadow-md`}>
                      {player.rank}
                    </span>

                    {/* Rank Movement Indicator */}
                    {player.rankChange !== '=' && (
                      <span className={`text-xs font-black px-2 py-0.5 rounded-full flex items-center space-x-0.5 ${
                        player.rankChange.includes('↑') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-400/40' : 'bg-red-500/20 text-red-400 border border-red-400/40'
                      }`}>
                        <TrendingUp className="w-3 h-3" />
                        <span>{player.rankChange}</span>
                      </span>
                    )}

                    <span className="text-2xl">{player.avatar || '🚀'}</span>
                    <div>
                      <h4 className="font-extrabold text-base text-white">{player.nickname}</h4>
                      {player.streak >= 2 && (
                        <div className="flex items-center space-x-1 text-xs text-amber-400 font-bold">
                          <Flame className="w-3.5 h-3.5 fill-amber-400" />
                          <span>🔥 {player.streak} STREAK</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Score & Score Gain */}
                  <div className="text-right">
                    <div className="text-xl font-black text-kahoot-yellow">
                      {player.score.toLocaleString()} <span className="text-xs font-bold text-gray-400">pts</span>
                    </div>
                    {player.lastScoreGain > 0 && (
                      <span className="text-xs font-extrabold text-emerald-400 animate-pulse">
                        +{player.lastScoreGain} pts
                      </span>
                    )}
                  </div>

                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10 font-bold text-gray-400">No score records yet!</div>
        )}
      </div>

      {/* Next Step Action Button */}
      <div className="pt-2">
        <button
          onClick={handleNextStep}
          className="w-full sm:w-80 py-4 rounded-2xl bg-gradient-to-r from-kahoot-pink to-kahoot-purple hover:scale-105 transition-all font-black text-white text-base shadow-2xl flex items-center justify-center space-x-2"
        >
          {isLastQuestion ? (
            <>
              <Trophy className="w-5 h-5" />
              <span>Go to Final Podium 🏆</span>
            </>
          ) : (
            <>
              <span>Next Question 🚀</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>

    </div>
  );
}
