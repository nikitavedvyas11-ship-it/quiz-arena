import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Lock, Clock, CheckCircle2, Loader2 } from 'lucide-react';
import { submitAnswerAsync } from '../../store/slices/playersSlice';
import { selectCurrentQuestion } from '../../store/selectors';
import { audioService } from '../../services/audio';

export default function PlayerQuestion() {
  const dispatch = useDispatch();
  const gamePin = useSelector((state) => state.game.gamePin);
  const timer = useSelector((state) => state.game.timer);
  const hasAnsweredInRedux = useSelector((state) => state.players.hasAnsweredCurrentQuestion);
  const { question, currentIndex, totalQuestions } = useSelector(selectCurrentQuestion);

  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset local selection when question changes
  useEffect(() => {
    setSelectedOptionIndex(null);
    setIsSubmitting(false);
  }, [currentIndex]);

  if (!question) return null;

  const isLocked = hasAnsweredInRedux || selectedOptionIndex !== null || isSubmitting;

  const handleSelectOption = (index) => {
    if (isLocked) return;

    // 1. Immediate local UI lock & visual feedback
    setSelectedOptionIndex(index);
    setIsSubmitting(true);

    audioService.playSelect();

    // 2. Calculate precise time taken in milliseconds
    const timeLimitSec = question.timeLimit || 20;
    const timeTakenMs = Math.max(0, (timeLimitSec - timer) * 1000);

    // 3. Dispatch submit thunk with optionId & metrics
    dispatch(submitAnswerAsync({
      gamePin,
      answerIndex: index,
      optionId: index,
      timeRemaining: timer,
      totalTimeLimit: timeLimitSec,
      timeTakenMs,
      correctIndex: question.correctIndex,
      points: question.points || 1000,
      difficulty: question.difficulty || 'Medium',
      questionIndex: currentIndex
    })).finally(() => {
      setIsSubmitting(false);
    });
  };

  const colors = ['kahoot-btn-red', 'kahoot-btn-blue', 'kahoot-btn-yellow', 'kahoot-btn-green'];
  const shapes = ['▲', '◆', '●', '■'];

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6 text-center">
      
      {/* Question Progress Header */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-kahoot-pink uppercase tracking-widest">
            Question {currentIndex + 1} / {totalQuestions}
          </span>
          <div className="flex items-center space-x-1 text-kahoot-yellow">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-base font-black">{timer}s</span>
          </div>
        </div>

        <h3 className="text-lg font-black text-white leading-snug">
          {question.text}
        </h3>
      </div>

      {/* 4 Fixed Shape Touch Buttons with Immediate Visual Feedback */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {question.options.map((opt, idx) => {
          const isSelected = selectedOptionIndex === idx;

          return (
            <button
              key={idx}
              disabled={isLocked}
              onClick={() => handleSelectOption(idx)}
              className={`p-6 sm:p-8 rounded-3xl ${colors[idx % 4]} flex flex-col items-center justify-center space-y-2 text-white shadow-xl transition-all relative overflow-hidden ${
                isSelected 
                  ? 'ring-4 ring-white scale-105 shadow-2xl z-10 opacity-100' 
                  : isLocked 
                    ? 'opacity-40 grayscale-[30%] cursor-not-allowed' 
                    : 'hover:scale-[1.02] active:scale-95 cursor-pointer'
              }`}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 bg-white/20 p-1 rounded-full backdrop-blur-md">
                  <CheckCircle2 className="w-5 h-5 text-white" />
                </div>
              )}
              <span className="text-4xl font-black drop-shadow">{shapes[idx % 4]}</span>
              <span className="text-base font-extrabold">{opt}</span>
            </button>
          );
        })}
      </div>

      {/* Answer Locked Status Bar */}
      {isLocked && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-extrabold flex items-center justify-center space-x-2 animate-pulse-glow">
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
              <span>Submitting Response to Firebase...</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Answer Locked ✓ Waiting for host or timer expiration...</span>
            </>
          )}
        </div>
      )}

    </div>
  );
}
