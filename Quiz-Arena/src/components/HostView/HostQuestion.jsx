import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Clock, Users, SkipForward } from 'lucide-react';
import { decrementTimer, revealAnswerAsync } from '../../store/slices/gameSlice';
import { selectCurrentQuestion, selectAnswerDistribution } from '../../store/selectors';
import { audioService } from '../../services/audio';

export default function HostQuestion() {
  const dispatch = useDispatch();
  const game = useSelector((state) => state.game);
  const { question, currentIndex, totalQuestions } = useSelector(selectCurrentQuestion);
  const { totalAnswers, totalPlayers } = useSelector(selectAnswerDistribution);

  const timer = game.timer;
  const isTimerRunning = game.isTimerRunning;
  const hasTriggeredRevealRef = useRef(false);

  useEffect(() => {
    hasTriggeredRevealRef.current = false;
  }, [currentIndex]);

  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timer > 0) {
      interval = setInterval(() => {
        dispatch(decrementTimer());
        audioService.playTick();
      }, 1000);
    } else if (timer <= 0 && isTimerRunning && !hasTriggeredRevealRef.current) {
      hasTriggeredRevealRef.current = true;
      dispatch(revealAnswerAsync());
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timer, dispatch]);

  const handleSkipTimer = () => {
    if (hasTriggeredRevealRef.current) return;
    hasTriggeredRevealRef.current = true;
    audioService.playSelect();
    dispatch(revealAnswerAsync());
  };

  if (!question) {
    return <div className="text-center p-12 font-bold text-gray-400">Loading Question...</div>;
  }

  const colors = ['kahoot-btn-red', 'kahoot-btn-blue', 'kahoot-btn-yellow', 'kahoot-btn-green'];
  const shapes = ['▲', '◆', '●', '■'];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-8 text-center">
      
      {/* Top Progress & Controls Bar */}
      <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10">
        <span className="text-xs font-black tracking-wider text-kahoot-yellow uppercase">
          Question {currentIndex + 1} of {totalQuestions}
        </span>

        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 text-sm font-bold text-gray-300">
            <Users className="w-4 h-4 text-kahoot-pink" />
            <span>Answers: <strong className="text-white">{totalAnswers} / {totalPlayers}</strong></span>
          </div>

          <button
            onClick={handleSkipTimer}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-gray-200 transition-colors flex items-center space-x-1"
          >
            <span>Skip Timer</span>
            <SkipForward className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Question Display Box */}
      <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-white/20 shadow-2xl relative space-y-6">
        <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
          {question.text}
        </h2>
      </div>

      {/* Timer & Non-Interactive Host Option Display Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
        
        {/* Countdown Ring */}
        <div className="md:col-span-1 flex flex-col items-center justify-center">
          <div className="w-32 h-32 rounded-full border-8 border-kahoot-purple bg-kahoot-dark shadow-2xl flex flex-col items-center justify-center animate-pulse-glow relative">
            <Clock className="w-5 h-5 text-kahoot-pink mb-1" />
            <span className={`text-4xl font-black ${timer <= 5 ? 'text-red-500 animate-timer-pulse' : 'text-white'}`}>
              {timer}
            </span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Seconds</span>
          </div>
        </div>

        {/* 4 Color Shape Non-Interactive Display Cards */}
        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4 pointer-events-none select-none">
          {question.options.map((opt, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-2xl ${colors[idx % 4]} flex items-center space-x-4 text-left shadow-lg`}
            >
              <span className="text-2xl font-black drop-shadow">{shapes[idx % 4]}</span>
              <span className="text-base sm:text-lg font-black text-white">{opt}</span>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
}
