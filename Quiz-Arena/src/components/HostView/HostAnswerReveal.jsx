import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { showLeaderboardAsync } from '../../store/slices/gameSlice';
import { selectCurrentQuestion, selectAnswerDistribution } from '../../store/selectors';
import { audioService } from '../../services/audio';

export default function HostAnswerReveal() {
  const dispatch = useDispatch();
  const { question } = useSelector(selectCurrentQuestion);
  const { counts, totalAnswers } = useSelector(selectAnswerDistribution);

  useEffect(() => {
    audioService.playCorrect();
  }, []);

  const handleNextToLeaderboard = () => {
    audioService.playSelect();
    dispatch(showLeaderboardAsync());
  };

  if (!question) return null;

  const colors = ['bg-kahoot-red', 'bg-kahoot-blue', 'bg-kahoot-yellow', 'bg-kahoot-green'];
  const shapes = ['▲', '◆', '●', '■'];
  const maxCount = Math.max(1, ...counts);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 text-center">
      
      {/* Title & Correct Answer Banner */}
      <div className="space-y-3">
        <span className="text-xs font-black tracking-widest text-emerald-400 uppercase bg-emerald-500/20 px-4 py-1.5 rounded-full border border-emerald-400/40">
          Time's Up! Answer Distribution Revealed
        </span>
        <h2 className="text-2xl sm:text-4xl font-black text-white">{question.text}</h2>
      </div>

      {/* Answer Distribution Bar Chart */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-white/20 shadow-2xl space-y-6">
        <h3 className="text-sm font-extrabold text-gray-300 uppercase tracking-wider">
          Player Answer Distribution ({totalAnswers} Answers Recorded)
        </h3>

        <div className="grid grid-cols-4 gap-4 h-56 items-end pt-4 pb-2 px-4 border-b border-white/10">
          {question.options.map((opt, idx) => {
            const count = counts[idx] || 0;
            const heightPercent = Math.round((count / maxCount) * 100);
            const isCorrect = idx === question.correctIndex;

            return (
              <div key={idx} className="flex flex-col items-center h-full justify-end space-y-2 group">
                <span className="text-sm font-black text-white">{count}</span>
                <div 
                  className={`w-full max-w-[60px] rounded-t-2xl transition-all duration-700 flex items-center justify-center ${
                    isCorrect ? 'bg-emerald-500 ring-4 ring-emerald-300 shadow-xl' : `${colors[idx % 4]} opacity-70`
                  }`}
                  style={{ height: `${Math.max(15, heightPercent)}%` }}
                >
                  {isCorrect && <CheckCircle2 className="w-5 h-5 text-white" />}
                </div>
                <span className="text-xs font-black text-gray-300">{shapes[idx % 4]}</span>
              </div>
            );
          })}
        </div>

        {/* Options List with Highlighted Correct Answer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
          {question.options.map((opt, idx) => {
            const isCorrect = idx === question.correctIndex;
            return (
              <div
                key={idx}
                className={`p-4 rounded-2xl border flex items-center justify-between ${
                  isCorrect 
                    ? 'bg-emerald-600/30 border-emerald-400 ring-2 ring-emerald-400/50 shadow-lg' 
                    : 'bg-black/40 border-white/10 opacity-60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <span className={`w-8 h-8 rounded-xl ${colors[idx % 4]} flex items-center justify-center text-xs font-black text-white`}>
                    {shapes[idx % 4]}
                  </span>
                  <span className={`text-sm font-black ${isCorrect ? 'text-emerald-300' : 'text-white'}`}>
                    {opt}
                  </span>
                </div>
                {isCorrect && (
                  <span className="text-xs font-extrabold text-emerald-400 flex items-center space-x-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Correct</span>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Continue Action Button */}
      <div className="pt-2">
        <button
          onClick={handleNextToLeaderboard}
          className="w-full sm:w-80 py-4 rounded-2xl bg-kahoot-purple hover:bg-kahoot-pink transition-all font-black text-white text-base shadow-xl flex items-center justify-center space-x-2"
        >
          <span>Next to Leaderboard</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

    </div>
  );
}

