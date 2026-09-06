import React from 'react';
import { useSelector } from 'react-redux';
import HostLobby from './HostView/HostLobby';
import HostQuestion from './HostView/HostQuestion';
import HostAnswerReveal from './HostView/HostAnswerReveal';
import HostLeaderboard from './HostView/HostLeaderboard';
import HostPodium from './HostView/HostPodium';

import PlayerJoin from './PlayerView/PlayerJoin';
import PlayerWaiting from './PlayerView/PlayerWaiting';
import PlayerQuestion from './PlayerView/PlayerQuestion';
import PlayerFeedback from './PlayerView/PlayerFeedback';

export default function DualViewSimulator({ setActiveMode }) {
  const gameStatus = useSelector((state) => state.game.status);
  const myPlayerId = useSelector((state) => state.players.myPlayerId);

  const renderHostComponent = () => {
    switch (gameStatus) {
      case 'LOBBY':
        return <HostLobby />;
      case 'QUESTION':
        return <HostQuestion />;
      case 'SHOW_ANSWER':
        return <HostAnswerReveal />;
      case 'LEADERBOARD':
        return <HostLeaderboard />;
      case 'PODIUM':
        return <HostPodium setActiveMode={setActiveMode} />;
      default:
        return <HostLobby />;
    }
  };

  const renderPlayerComponent = () => {
    if (!myPlayerId) {
      return <PlayerJoin />;
    }
    switch (gameStatus) {
      case 'LOBBY':
        return <PlayerWaiting />;
      case 'QUESTION':
        return <PlayerQuestion />;
      case 'SHOW_ANSWER':
      case 'LEADERBOARD':
        return <PlayerFeedback />;
      case 'PODIUM':
        return <PlayerFeedback />;
      default:
        return <PlayerWaiting />;
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-2 py-4 space-y-4">
      
      {/* Banner Notice */}
      <div className="bg-kahoot-purple/30 border border-kahoot-pink/40 p-3 rounded-2xl text-center text-xs font-bold text-gray-200">
        ⚡ <strong>Dual Screen Simulator Mode:</strong> Left side represents the Host Display (Laptop); Right side represents the Player Phone. Both sync in real time!
      </div>

      {/* Side-by-side Dual Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Host Display (7 Columns) */}
        <div className="lg:col-span-7 bg-kahoot-darker border border-white/10 rounded-3xl p-4 min-h-[700px] shadow-2xl overflow-y-auto">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10 text-xs font-bold text-kahoot-blue">
            <span>💻 Host View (Presenter Screen)</span>
            <span className="uppercase bg-kahoot-blue/20 px-2.5 py-1 rounded-full border border-kahoot-blue/40">Status: {gameStatus}</span>
          </div>
          {renderHostComponent()}
        </div>

        {/* Right Side: Player Mobile Display (5 Columns) */}
        <div className="lg:col-span-5 bg-black border-4 border-slate-700 rounded-[40px] p-4 min-h-[700px] shadow-2xl flex flex-col justify-between overflow-y-auto relative">
          
          {/* Phone Notch Mockup */}
          <div className="w-32 h-5 bg-slate-800 rounded-b-2xl mx-auto mb-2"></div>
          
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-xs font-bold text-kahoot-pink">
            <span>📱 Player View (Mobile Screen)</span>
            <span className="uppercase bg-kahoot-pink/20 px-2.5 py-1 rounded-full border border-kahoot-pink/40">Live Sync</span>
          </div>

          <div className="flex-1 flex flex-col justify-center">
            {renderPlayerComponent()}
          </div>

          {/* Home Indicator bar */}
          <div className="w-28 h-1 bg-white/20 rounded-full mx-auto mt-4"></div>

        </div>

      </div>

    </div>
  );
}
