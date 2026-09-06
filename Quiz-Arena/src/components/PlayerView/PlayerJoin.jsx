import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Smartphone, Sparkles, User, Play, AlertCircle } from 'lucide-react';
import { joinGameAsync, clearJoinError } from '../../store/slices/playersSlice';
import { audioService } from '../../services/audio';

const AVATARS = ['🚀', '🦊', '⚡', '🐉', '👾', '🦁', '🦉', '💎', '🔥', '🦄'];

export default function PlayerJoin() {
  const dispatch = useDispatch();
  const currentPin = useSelector((state) => state.game.gamePin);
  const joinError = useSelector((state) => state.players.joinError);
  const loading = useSelector((state) => state.players.loading);

  const [pin, setPin] = useState(currentPin || '');
  const [nickname, setNickname] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🚀');

  // Check URL query parameters for auto-fill PIN from QR code scan
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pinParam = params.get('pin');
    if (pinParam) {
      setPin(pinParam);
    }
  }, []);

  const handleJoin = (e) => {
    e.preventDefault();
    if (!pin.trim() || !nickname.trim()) {
      alert("Please enter both Game PIN and Nickname!");
      return;
    }
    dispatch(clearJoinError());
    audioService.playSelect();

    dispatch(joinGameAsync({
      gamePin: pin.trim(),
      nickname: nickname.trim(),
      avatar: selectedAvatar
    }));
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 space-y-6 text-center">
      
      {/* Header */}
      <div className="space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-kahoot-pink mx-auto flex items-center justify-center shadow-lg">
          <Smartphone className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-3xl font-black text-white">Quiz Battle</h1>
        <p className="text-xs text-gray-300">Enter Game PIN & Nickname to join the battle!</p>
      </div>

      {/* Duplicate Nickname or Join Error Alert */}
      {joinError && (
        <div className="p-4 rounded-2xl bg-red-500/20 border border-red-500/50 text-red-300 text-xs font-bold flex items-center space-x-2 animate-bounce">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span className="text-left">{joinError}</span>
        </div>
      )}

      {/* Join Form Card */}
      <form onSubmit={handleJoin} className="glass-panel p-6 rounded-3xl border border-kahoot-pink/40 space-y-5 shadow-2xl">
        
        {/* Game PIN Input */}
        <div>
          <label className="block text-xs font-bold text-gray-300 mb-1 text-left">Game PIN</label>
          <input
            type="text"
            required
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="123456"
            className="w-full text-center text-2xl font-black tracking-widest bg-black/40 border border-white/20 rounded-2xl py-3 px-4 focus:outline-none focus:border-kahoot-pink text-kahoot-yellow uppercase"
          />
        </div>

        {/* Nickname Input */}
        <div>
          <label className="block text-xs font-bold text-gray-300 mb-1 text-left">Nickname</label>
          <input
            type="text"
            required
            maxLength={15}
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="e.g. Nikita"
            className="w-full text-center text-base font-bold bg-black/40 border border-white/20 rounded-2xl py-3 px-4 focus:outline-none focus:border-kahoot-pink text-white"
          />
        </div>

        {/* Avatar Picker */}
        <div>
          <label className="block text-xs font-bold text-gray-300 mb-2 text-left">Choose Avatar</label>
          <div className="grid grid-cols-5 gap-2">
            {AVATARS.map((av) => (
              <button
                key={av}
                type="button"
                onClick={() => setSelectedAvatar(av)}
                className={`text-2xl p-2 rounded-xl border transition-all ${
                  selectedAvatar === av 
                    ? 'bg-kahoot-pink border-white scale-110 shadow-lg' 
                    : 'bg-white/5 border-white/10 hover:border-white/30'
                }`}
              >
                {av}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Join Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl bg-kahoot-pink hover:bg-pink-600 transition-all font-black text-white text-base shadow-xl flex items-center justify-center space-x-2"
        >
          <span>Join Game 🚀</span>
          <Play className="w-5 h-5 fill-white" />
        </button>

      </form>

    </div>
  );
}
