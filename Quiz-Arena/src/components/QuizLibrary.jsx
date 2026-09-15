import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Play, Edit3, Trash2, Plus, Layers, Sparkles } from 'lucide-react';
import { fetchQuizzesAsync, selectQuiz, deleteQuizAsync, setFilterCategory, CATEGORIES } from '../store/slices/quizSlice';
import { createGameSessionAsync } from '../store/slices/gameSlice';

export default function QuizLibrary({ setActiveMode }) {
  const dispatch = useDispatch();
  const quizzes = useSelector((state) => state.quiz.quizzes);
  const activeQuiz = useSelector((state) => state.quiz.activeQuiz);
  const filterCategory = useSelector((state) => state.quiz.filterCategory);

  useEffect(() => {
    dispatch(fetchQuizzesAsync());
  }, [dispatch]);

  const handleStartHostGame = (quiz) => {
    dispatch(selectQuiz(quiz.id));
    dispatch(createGameSessionAsync(quiz));
    setActiveMode('HOST');
  };

  const handleEditQuiz = (quiz) => {
    dispatch(selectQuiz(quiz.id));
    setActiveMode('CREATOR');
  };

  const handleDeleteQuiz = (quizId) => {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      dispatch(deleteQuizAsync(quizId));
    }
  };

  const filteredQuizzes = filterCategory === 'ALL' 
    ? quizzes 
    : quizzes.filter(q => (q.category || 'General').toLowerCase() === filterCategory.toLowerCase());

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/5 p-6 rounded-3xl border border-white/10">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center space-x-2">
            <Layers className="w-7 h-7 text-kahoot-pink" />
            <span>Saved Quiz Library</span>
          </h1>
          <p className="text-xs text-gray-400 mt-1">Browse, edit, and host saved cloud quizzes</p>
        </div>

        <button
          onClick={() => setActiveMode('CREATOR')}
          className="px-5 py-3 rounded-2xl bg-kahoot-green hover:bg-emerald-600 font-extrabold text-xs text-white flex items-center space-x-2 transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Quiz</span>
        </button>
      </div>

      {/* Category Filters */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => dispatch(setFilterCategory('ALL'))}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            filterCategory === 'ALL' ? 'bg-kahoot-purple text-white shadow-md' : 'bg-white/5 text-gray-300 hover:text-white'
          }`}
        >
          All Categories ({quizzes.length})
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => dispatch(setFilterCategory(cat))}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              filterCategory === cat ? 'bg-kahoot-pink text-white shadow-md' : 'bg-white/5 text-gray-300 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Quizzes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuizzes.map((q) => (
          <div 
            key={q.id}
            className={`p-6 rounded-3xl border transition-all flex flex-col justify-between space-y-4 relative overflow-hidden ${
              activeQuiz?.id === q.id 
                ? 'bg-kahoot-purple/30 border-kahoot-pink shadow-2xl scale-[1.02]' 
                : 'bg-white/5 border-white/10 hover:border-white/20'
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

            <div className="flex items-center space-x-2 pt-2 border-t border-white/10">
              <button
                onClick={() => handleStartHostGame(q)}
                className="flex-1 py-2.5 rounded-xl bg-kahoot-purple hover:bg-kahoot-pink transition-colors font-bold text-xs text-white flex items-center justify-center space-x-1.5 shadow-md"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Host Game</span>
              </button>
              <button
                onClick={() => handleEditQuiz(q)}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-blue-300 transition-colors"
                title="Edit Quiz"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteQuiz(q.id)}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-red-400 transition-colors"
                title="Delete Quiz"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
