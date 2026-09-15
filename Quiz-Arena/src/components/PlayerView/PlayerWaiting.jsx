import React from 'react';
import { useSelector } from 'react-redux';
import { Sparkles, CheckCircle2 } from 'lucide-react';

export default function PlayerWaiting() {
  const myNickname = useSelector((state) => state.players.myNickname);
  const myAvatar = useSelector((state) => state.players.myAvatar);
  const quizTitle = useSelector((state) => state.game.quizTitle);

  return (
    <div className="max-w-md mx-auto px-4 py-12 text-center space-y-8">
      
      <div className="glass-panel p-8 rounded-3xl border border-kahoot-pink/40 space-y-6 shadow-2xl animate-pulse-glow">
        <div className="text-6xl animate-bounce">{myAvatar || '🚀'}</div>
        
        <div>
          <h2 className="text-2xl font-black text-white">{myNickname}</h2>
          <span className="text-xs font-bold text-emerald-400 flex items-center justify-center space-x-1 mt-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>You're in!</span>
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-gray-300">
          See your nickname on the main host screen? <br />
          Game starting soon: <strong>{quizTitle || 'Live Quiz'}</strong>
        </div>

        <div className="flex items-center justify-center space-x-2 text-xs font-bold text-kahoot-yellow animate-pulse">
          <Sparkles className="w-4 h-4" />
          <span>Waiting for host to start question...</span>
        </div>
      </div>

    </div>
  );
}
