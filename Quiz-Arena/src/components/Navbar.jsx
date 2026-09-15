import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Volume2, VolumeX, Sparkles, HelpCircle, Monitor, Smartphone, PlusCircle, Home, Layers } from 'lucide-react';
import { audioService } from '../services/audio';

export default function Navbar({ activeMode, setActiveMode }) {
  const [isMuted, setIsMuted] = useState(audioService.isMuted);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const gamePin = useSelector((state) => state.game.gamePin);
  const gameStatus = useSelector((state) => state.game.status);

  const toggleSound = () => {
    const muted = audioService.toggleMute();
    setIsMuted(muted);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-kahoot-dark/90 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => setActiveMode('LANDING')} 
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-kahoot-pink to-kahoot-purple flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <span className="text-2xl font-black">⚡</span>
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-purple-200 to-kahoot-pink bg-clip-text text-transparent">
                Quiz Battle
              </h1>
              <span className="text-[10px] font-semibold tracking-wider text-purple-300 uppercase block -mt-1">
                Kahoot Clone Real-Time
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-2 bg-white/5 p-1 rounded-2xl border border-white/10">
            <button
              onClick={() => setActiveMode('LANDING')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeMode === 'LANDING' ? 'bg-kahoot-purple text-white shadow-md' : 'text-gray-300 hover:text-white'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Hub</span>
            </button>

            <button
              onClick={() => setActiveMode('LIBRARY')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeMode === 'LIBRARY' ? 'bg-kahoot-pink text-white shadow-md' : 'text-gray-300 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Quiz Library</span>
            </button>

            <button
              onClick={() => setActiveMode('HOST')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeMode === 'HOST' ? 'bg-kahoot-blue text-white shadow-md' : 'text-gray-300 hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Host Screen</span>
            </button>

            <button
              onClick={() => setActiveMode('PLAYER')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeMode === 'PLAYER' ? 'bg-kahoot-pink text-white shadow-md' : 'text-gray-300 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Player Screen</span>
            </button>

            <button
              onClick={() => setActiveMode('CREATOR')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeMode === 'CREATOR' ? 'bg-kahoot-green text-white shadow-md' : 'text-gray-300 hover:text-white'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Quiz Creator</span>
            </button>

            <button
              onClick={() => setActiveMode('DUAL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                activeMode === 'DUAL' ? 'bg-kahoot-yellow text-white shadow-md' : 'text-gray-300 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dual Mode</span>
            </button>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center space-x-3">
            {gamePin && gameStatus !== 'IDLE' && (
              <div className="hidden sm:flex items-center space-x-2 bg-kahoot-purple/30 border border-kahoot-pink/50 px-3 py-1 rounded-xl">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="text-xs font-bold text-gray-300">PIN:</span>
                <span className="text-sm font-black tracking-widest text-kahoot-yellow">{gamePin}</span>
              </div>
            )}

            <button
              onClick={toggleSound}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
              title={isMuted ? "Unmute Audio" : "Mute Audio"}
            >
              {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
            </button>

            <button
              onClick={() => setShowHelpModal(true)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
              title="Architecture Info"
            >
              <HelpCircle className="w-5 h-5 text-purple-300" />
            </button>
          </div>

        </div>
      </header>

      {/* Architecture Info Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-kahoot-card border border-white/20 rounded-3xl max-w-2xl w-full p-6 text-left shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-extrabold mb-3 text-kahoot-yellow flex items-center space-x-2">
              <span>🏆</span>
              <span>Quiz Battle Architecture & Criteria</span>
            </h2>

            <div className="space-y-4 text-sm text-gray-200">
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <h3 className="font-bold text-white text-base mb-1">1. Redux Toolkit Slices (3 Slices)</h3>
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                  <li><strong className="text-purple-300">quizSlice:</strong> Quizzes, categories, CSV parser imports, Firestore sync.</li>
                  <li><strong className="text-blue-300">gameSlice:</strong> Game PIN, phase transitions, timer, timestamps.</li>
                  <li><strong className="text-pink-300">playersSlice:</strong> Players, duplicate nickname checks, speed scoring, streaks.</li>
                </ul>
              </div>

              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <h3 className="font-bold text-white text-base mb-1">2. Firebase Single Source of Truth</h3>
                <p className="text-gray-300">
                  Quizzes (<code className="text-pink-400">quizzes/</code>), Game rooms (<code className="text-blue-400">games/pin</code>), and Responses (<code className="text-yellow-400">games/pin/responses</code>) are saved directly to Firestore.
                </p>
              </div>

              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <h3 className="font-bold text-white text-base mb-1">3. CSV Question Import</h3>
                <p className="text-gray-300">
                  Supports 50+ question CSV file uploads with automatic validation and direct editing in Quiz Builder.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="mt-6 w-full py-3 bg-kahoot-purple hover:bg-kahoot-pink transition-colors font-extrabold rounded-2xl text-white shadow-lg"
            >
              Close Info View
            </button>
          </div>
        </div>
      )}
    </>
  );
}
