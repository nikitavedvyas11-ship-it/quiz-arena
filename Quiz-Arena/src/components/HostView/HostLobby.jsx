import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Users, Play, Sparkles, QrCode, Smartphone } from 'lucide-react';
import { nextQuestionAsync } from '../../store/slices/gameSlice';
import { audioService } from '../../services/audio';

export default function HostLobby() {
  const dispatch = useDispatch();
  const gamePin = useSelector((state) => state.game.gamePin);
  const quizTitle = useSelector((state) => state.game.quizTitle);
  const playersObj = useSelector((state) => state.players.players);

  const playersList = Object.values(playersObj || {});

  useEffect(() => {
    audioService.startLobbyMusic();
    return () => {
      audioService.stopLobbyMusic();
    };
  }, []);

  const handleStartGame = () => {
    if (playersList.length === 0) return;
    audioService.stopLobbyMusic();
    audioService.playSelect();
    dispatch(nextQuestionAsync());
  };

  // Generate dynamic QR Code SVG URL for mobile auto-join
  const joinUrl = `${window.location.origin}/?pin=${gamePin || ''}`;
  const qrSvgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(joinUrl)}&color=ffffff&bgcolor=1e192c`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-10 text-center">
      
      {/* Lobby Title */}
      <div className="space-y-2">
        <span className="text-xs font-black tracking-widest text-kahoot-yellow uppercase bg-white/10 px-4 py-1.5 rounded-full border border-white/10">
          Live Game Session Lobby
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white">{quizTitle}</h1>
        <p className="text-sm text-gray-300">Scan QR Code or enter Game PIN to join on your phone!</p>
      </div>

      {/* Game PIN & QR Code Split Banner */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-kahoot-pink/40 shadow-2xl relative overflow-hidden grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        
        {/* Left: PIN Banner */}
        <div className="md:col-span-2 space-y-4 text-center md:text-left">
          <div className="text-xs font-extrabold text-gray-300 uppercase tracking-wider">
            Join on your device with Game PIN:
          </div>

          <div className="flex items-center justify-center md:justify-start space-x-2 sm:space-x-3">
            {gamePin ? (
              gamePin.split('').map((digit, idx) => (
                <div 
                  key={idx}
                  className="w-12 h-16 sm:w-14 sm:h-20 rounded-2xl bg-gradient-to-b from-purple-700 to-kahoot-purple border border-kahoot-pink/60 flex items-center justify-center text-3xl sm:text-5xl font-black text-kahoot-yellow shadow-xl animate-bounce-short"
                  style={{ animationDelay: `${idx * 0.08}s` }}
                >
                  {digit}
                </div>
              ))
            ) : (
              <div className="text-2xl font-bold text-gray-400">Generating PIN...</div>
            )}
          </div>

          <div className="inline-flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-2xl border border-white/10 text-xs font-semibold text-gray-300">
            <Smartphone className="w-4 h-4 text-kahoot-pink" />
            <span>Direct Join Link: <strong>{joinUrl}</strong></span>
          </div>
        </div>

        {/* Right: Dynamic Scan QR Code */}
        <div className="flex flex-col items-center justify-center bg-black/40 p-4 rounded-2xl border border-white/10 space-y-2">
          <span className="text-[10px] font-black uppercase text-kahoot-pink tracking-widest flex items-center space-x-1">
            <QrCode className="w-3.5 h-3.5" />
            <span>Scan QR to Join</span>
          </span>
          <div className="p-2 bg-kahoot-card rounded-xl border border-white/20 shadow-lg">
            <img 
              src={qrSvgUrl} 
              alt="Scan to Join QR Code" 
              className="w-32 h-32 rounded-lg" 
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
          <span className="text-[10px] text-gray-400">Auto-fills PIN: {gamePin}</span>
        </div>

      </div>

      {/* Joined Players Grid & Badge */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-kahoot-pink" />
            <h3 className="text-xl font-black text-white">
              👥 {playersList.length} Players Joined
            </h3>
          </div>
          {playersList.length === 0 && (
            <span className="text-xs text-kahoot-yellow animate-pulse font-bold bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/30">
              Waiting for at least 1 player to enter PIN...
            </span>
          )}
        </div>

        {playersList.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {playersList.map((player) => (
              <div 
                key={player.id}
                className="glass-card p-4 rounded-2xl border border-white/20 flex flex-col items-center space-y-1 transform hover:scale-105 transition-all shadow-lg animate-pulse-glow"
              >
                <span className="text-3xl">{player.avatar || '🚀'}</span>
                <span className="font-extrabold text-sm text-white truncate max-w-full">
                  {player.nickname}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 rounded-3xl border border-dashed border-white/20 text-gray-400 text-sm font-semibold">
            No players joined yet. Use Player View or Dual View to join as a player!
          </div>
        )}
      </div>

      {/* Start Game Button */}
      <div className="pt-2">
        <button
          onClick={handleStartGame}
          disabled={playersList.length === 0}
          className={`w-full sm:w-80 py-4 rounded-2xl font-black text-lg transition-all shadow-2xl flex items-center justify-center space-x-3 ${
            playersList.length > 0 
              ? 'bg-gradient-to-r from-kahoot-green to-emerald-500 text-white hover:scale-105 cursor-pointer' 
              : 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-60'
          }`}
        >
          <Play className="w-6 h-6 fill-current" />
          <span>Start Game 🚀 ({playersList.length} Players)</span>
        </button>
      </div>

    </div>
  );
}
