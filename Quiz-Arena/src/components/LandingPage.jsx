import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Play, Plus, Monitor, Smartphone, Sparkles, HelpCircle, Layers, Award } from 'lucide-react';
import { selectQuiz } from '../store/slices/quizSlice';
import { createGameSessionAsync } from '../store/slices/gameSlice';

export default function LandingPage({ setActiveMode }) {
  const dispatch = useDispatch();
  const quizzes = useSelector((state) => state.quiz.quizzes);
  const activeQuiz = useSelector((state) => state.quiz.activeQuiz);

  const [inputPin, setInputPin] = useState('');

  const handleJoinClick = (e) => {
    e.preventDefault();
    if (inputPin.trim()) {
      setActiveMode('PLAYER');
    }
  };

  const handleStartHostGame = (quiz) => {
    dispatch(selectQuiz(quiz.id));
    dispatch(createGameSessionAsync(quiz));
    setActiveMode('HOST');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      
      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 bg-kahoot-purple/30 border border-kahoot-pink/40 px-4 py-1.5 rounded-full text-xs font-black text-kahoot-pink uppercase tracking-widest animate-pulse">
          <Sparkles className="w-4 h-4" />
          <span>Real-Time Multiplayer Quiz Battle</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
          Battle Your Friends in <br />
          <span className="bg-gradient-to-r from-kahoot-pink via-purple-300 to-kahoot-yellow bg-clip-text text-transparent">
            Real-Time Quizzes
          </span>
        </h1>
        <p className="text-base sm:text-lg text-gray-300 font-medium">
          Built with React, Redux Toolkit, and Firebase. Host live game lobbies, answer speed questions, and climb the live leaderboards!
        </p>
      </div>

      {/* Main Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Card 1: Player Join Card */}
        <div className="glass-panel p-6 rounded-3xl border border-kahoot-pink/30 hover:border-kahoot-pink transition-all shadow-xl flex flex-col justify-between space-y-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-kahoot-pink/10 rounded-full blur-2xl group-hover:bg-kahoot-pink/20 transition-all"></div>
          <div>
            <div className="w-12 h-12 rounded-2xl bg-kahoot-pink flex items-center justify-center mb-4 shadow-lg">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-black text-white">Join Game</h3>
            <p className="text-xs text-gray-300 mt-1">
              Got a 6-digit Game PIN from the host? Jump right into the battle!
            </p>
          </div>
          <form onSubmit={handleJoinClick} className="space-y-3 pt-2">
            <input
              type="text"
              maxLength={6}
              placeholder="Enter Game PIN"
              value={inputPin}
              onChange={(e) => setInputPin(e.target.value)}
              className="w-full text-center text-lg font-black tracking-widest bg-black/40 border border-white/20 rounded-2xl py-3 px-4 focus:outline-none focus:border-kahoot-pink text-kahoot-yellow uppercase"
            />
            <button
              type="submit"
              onClick={() => setActiveMode('PLAYER')}
              className="w-full py-3 rounded-2xl bg-kahoot-pink hover:bg-pink-600 font-extrabold text-white transition-all shadow-lg text-sm flex items-center justify-center space-x-2"
            >
              <span>Join Battle</span>
              <Play className="w-4 h-4 fill-white" />
            </button>
          </form>
        </div>

        {/* Card 2: Host Game Card */}
        <div className="glass-panel p-6 rounded-3xl border border-kahoot-blue/30 hover:border-kahoot-blue transition-all shadow-xl flex flex-col justify-between space-y-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-kahoot-blue/10 rounded-full blur-2xl group-hover:bg-kahoot-blue/20 transition-all"></div>
          <div>
            <div className="w-12 h-12 rounded-2xl bg-kahoot-blue flex items-center justify-center mb-4 shadow-lg">
              <Monitor className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-black text-white">Host a Game</h3>
            <p className="text-xs text-gray-300 mt-1">
              Start a live quiz game on your screen for players to join with a unique PIN.
            </p>
          </div>
          <button
            onClick={() => handleStartHostGame(activeQuiz || quizzes[0])}
            className="w-full py-3 rounded-2xl bg-kahoot-blue hover:bg-blue-600 font-extrabold text-white transition-all shadow-lg text-sm flex items-center justify-center space-x-2"
          >
            <span>Host Active Quiz</span>
            <Play className="w-4 h-4 fill-white" />
          </button>
        </div>

        {/* Card 3: Quiz Creator Card */}
        <div className="glass-panel p-6 rounded-3xl border border-kahoot-green/30 hover:border-kahoot-green transition-all shadow-xl flex flex-col justify-between space-y-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-kahoot-green/10 rounded-full blur-2xl group-hover:bg-kahoot-green/20 transition-all"></div>
          <div>
            <div className="w-12 h-12 rounded-2xl bg-kahoot-green flex items-center justify-center mb-4 shadow-lg">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-black text-white">Quiz Creator</h3>
            <p className="text-xs text-gray-300 mt-1">
              Create custom questions, set choice options, time limits, and points.
            </p>
          </div>
          <button
            onClick={() => setActiveMode('CREATOR')}
            className="w-full py-3 rounded-2xl bg-kahoot-green hover:bg-emerald-600 font-extrabold text-white transition-all shadow-lg text-sm flex items-center justify-center space-x-2"
          >
            <span>Create Custom Quiz</span>
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Card 4: Dual Screen Simulator Card */}
        <div className="glass-panel p-6 rounded-3xl border border-kahoot-yellow/30 hover:border-kahoot-yellow transition-all shadow-xl flex flex-col justify-between space-y-4 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-kahoot-yellow/10 rounded-full blur-2xl group-hover:bg-kahoot-yellow/20 transition-all"></div>
          <div>
            <div className="w-12 h-12 rounded-2xl bg-kahoot-yellow flex items-center justify-center mb-4 shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-black text-white">Dual Mode</h3>
            <p className="text-xs text-gray-300 mt-1">
              Test Host & Player screens side-by-side on 1 screen for instant evaluation!
            </p>
          </div>
          <button
            onClick={() => setActiveMode('DUAL')}
            className="w-full py-3 rounded-2xl bg-kahoot-yellow hover:bg-amber-600 font-extrabold text-white transition-all shadow-lg text-sm flex items-center justify-center space-x-2"
          >
            <span>Launch Dual View</span>
            <Sparkles className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Pre-loaded Quizzes Section */}
      <div className="space-y-6 pt-6 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center space-x-2">
              <Layers className="w-6 h-6 text-purple-400" />
              <span>Available Quizzes Library</span>
            </h2>
            <p className="text-xs text-gray-400">Select any quiz to inspect questions or launch a live host session immediately</p>
          </div>
          <button
            onClick={() => setActiveMode('CREATOR')}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-gray-200 transition-colors"
          >
            + Create New
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quizzes.map((q) => (
            <div 
              key={q.id}
              className={`p-6 rounded-3xl border transition-all flex flex-col justify-between space-y-4 relative overflow-hidden ${
                activeQuiz?.id === q.id 
                  ? 'bg-kahoot-purple/30 border-kahoot-pink shadow-2xl scale-[1.02]' 
                  : 'bg-white/5 border-white/10 hover:border-white/30'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/10 text-purple-300">
                    {q.category || 'General'}
                  </span>
                  <span className="text-xs font-bold text-gray-400">
                    {q.questions.length} Questions
                  </span>
                </div>
                <h3 className="text-xl font-black text-white leading-snug">{q.title}</h3>
                <p className="text-xs text-gray-300 mt-2 line-clamp-2">{q.description}</p>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <button
                  onClick={() => handleStartHostGame(q)}
                  className="flex-1 py-2.5 rounded-xl bg-kahoot-purple hover:bg-kahoot-pink transition-colors font-bold text-xs text-white flex items-center justify-center space-x-1.5 shadow-md"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Host Now</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
