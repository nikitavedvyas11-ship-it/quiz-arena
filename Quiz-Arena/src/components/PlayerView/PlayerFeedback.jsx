import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { CheckCircle2, XCircle, Flame, Award, Trophy } from 'lucide-react';
import { selectPlayerRank } from '../../store/selectors';
import { audioService } from '../../services/audio';

export default function PlayerFeedback() {
  const { rank, totalPlayers, player, pointsBehind } = useSelector(selectPlayerRank);

  const isCorrect = player?.isCorrect;
  const lastGain = player?.lastScoreGain || 0;
  const totalScore = player?.score || 0;
  const streak = player?.streak || 0;

  useEffect(() => {
    if (isCorrect) {
      audioService.playCorrect();
    } else if (isCorrect === false) {
      audioService.playIncorrect();
    }
  }, [isCorrect]);

  return (
    <div className="max-w-md mx-auto px-4 py-8 text-center space-y-6">
      
      {/* Result Status Banner */}
      <div 
        className={`glass-panel p-8 rounded-3xl border shadow-2xl space-y-4 ${
          isCorrect 
            ? 'border-emerald-400/50 bg-emerald-500/10' 
            : 'border-red-500/50 bg-red-500/10'
        }`}
      >
        <div className="flex justify-center">
          {isCorrect ? (
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center text-red-400">
              <XCircle className="w-10 h-10" />
            </div>
          )}
        </div>

        <div>
          <h2 className={`text-3xl font-black ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
            {isCorrect ? 'Correct! 🎉' : 'Incorrect ❌'}
          </h2>
          {isCorrect && (
            <p className="text-xs font-bold text-gray-300 mt-1">
              Speed Bonus Earned!
            </p>
          )}
        </div>

        {/* Score Gain Card */}
        <div className="bg-black/40 p-4 rounded-2xl border border-white/10 space-y-1">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Points Earned</span>
          <span className="text-3xl font-black text-kahoot-yellow">
            +{lastGain.toLocaleString()} <span className="text-xs font-bold text-gray-300">pts</span>
          </span>
        </div>

        {/* Total Score & Streak */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <div className="text-left">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Total Score</span>
            <span className="text-lg font-black text-white">{totalScore.toLocaleString()}</span>
          </div>

          {streak >= 2 && (
            <div className="flex items-center space-x-1 text-xs font-extrabold text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-full border border-amber-400/30">
              <Flame className="w-4 h-4 fill-amber-400" />
              <span>{streak} Streak 🔥</span>
            </div>
          )}
        </div>

      </div>

      {/* Live Position / Rank Indicator Card */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-2">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Current Standings</span>
        <div className="text-2xl font-black text-white flex items-center justify-center space-x-2">
          <Award className="w-6 h-6 text-kahoot-pink" />
          <span>You are in <strong className="text-kahoot-yellow">#{rank}</strong> place</span>
        </div>
        <p className="text-xs text-gray-400">
          Out of {totalPlayers} connected players
        </p>
      </div>

    </div>
  );
}
