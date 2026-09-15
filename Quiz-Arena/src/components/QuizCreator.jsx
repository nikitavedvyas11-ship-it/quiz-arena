import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Plus, Trash2, Edit3, Save, ArrowLeft, CheckCircle2, FileText, Download, Upload, 
  Eye, Copy, AlertCircle, Play, Loader2
} from 'lucide-react';
import { saveQuizAsync, deleteQuizAsync, selectQuiz, CATEGORIES } from '../store/slices/quizSlice';
import { createGameSessionAsync } from '../store/slices/gameSlice';
import { parseQuizCSV } from '../services/csvParser';

export default function QuizCreator({ setActiveMode }) {
  const dispatch = useDispatch();
  const quizzes = useSelector((state) => state.quiz.quizzes);
  const quizLoading = useSelector((state) => state.quiz.loading);

  const [editingQuizId, setEditingQuizId] = useState(null);
  const [title, setTitle] = useState('React & Web Dev Battle ⚡');
  const [description, setDescription] = useState('Comprehensive quiz testing real-time web development skills.');
  const [category, setCategory] = useState('React');
  const [questions, setQuestions] = useState([
    {
      id: 'q-1',
      text: 'Which Redux Toolkit function creates slice reducers automatically?',
      type: 'multiple',
      timeLimit: 20,
      options: ['createReducer()', 'createSlice()', 'createStore()', 'createAction()'],
      correctIndex: 1,
      points: 1000,
      difficulty: 'Easy'
    }
  ]);

  // CSV Import State
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [csvReport, setCsvReport] = useState(null);

  // Live Preview Modal State
  const [previewQuestion, setPreviewQuestion] = useState(null);

  const [notification, setNotification] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleStartNewQuiz = () => {
    setEditingQuizId(null);
    setTitle('My Custom Quiz Battle ⚡');
    setDescription('A fun interactive quiz created with Quiz Builder.');
    setCategory('General Tech');
    setQuestions([
      {
        id: 'q-' + Date.now(),
        text: 'What is the primary benefit of Redux Toolkit?',
        type: 'multiple',
        timeLimit: 20,
        options: ['Boilerplate reduction', 'No state support', 'Slow updates', 'Only works with jQuery'],
        correctIndex: 0,
        points: 1000,
        difficulty: 'Easy'
      }
    ]);
    setValidationError('');
  };

  const handleEditExisting = (quiz) => {
    setEditingQuizId(quiz.id);
    setTitle(quiz.title);
    setDescription(quiz.description || '');
    setCategory(quiz.category || 'General');
    setQuestions(quiz.questions || []);
    setValidationError('');
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: 'q-' + Date.now() + Math.random(),
        text: 'New Question Prompt',
        type: 'multiple',
        timeLimit: 20,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctIndex: 0,
        points: 1000,
        difficulty: 'Medium'
      }
    ]);
  };

  const handleDuplicateQuestion = (index) => {
    const target = questions[index];
    const duplicated = {
      ...target,
      id: 'q-dup-' + Date.now() + Math.random(),
      text: `${target.text} (Copy)`
    };
    const updated = [...questions];
    updated.splice(index + 1, 0, duplicated);
    setQuestions(updated);
  };

  const handleUpdateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const handleUpdateOption = (qIdx, optIdx, val) => {
    const updated = [...questions];
    updated[qIdx].options[optIdx] = val;
    setQuestions(updated);
  };

  const handleRemoveQuestion = (qIdx) => {
    if (questions.length <= 1) {
      alert("A quiz must have at least 1 question!");
      return;
    }
    setQuestions(questions.filter((_, i) => i !== qIdx));
  };

  // CSV Import Parser Handler
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      setCsvText(content);
      const result = parseQuizCSV(content);
      setCsvReport(result);
    };
    reader.readAsText(file);
  };

  const handleConfirmCSVImport = () => {
    if (!csvReport || csvReport.validQuestions.length === 0) {
      alert("No valid questions found in CSV!");
      return;
    }
    setQuestions([...csvReport.validQuestions, ...questions]);
    setShowCSVModal(false);
    setNotification(`Successfully imported ${csvReport.validQuestions.length} questions from CSV! 🎉`);
    setTimeout(() => setNotification(''), 4000);
  };

  // Pre-Save Validation Helper
  const validateQuiz = () => {
    if (!title.trim()) {
      return "Please enter a Quiz Title!";
    }
    if (questions.length === 0) {
      return "Quiz must contain at least 1 question!";
    }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.text || !q.text.trim()) {
        return `Question #${i + 1} has empty question text!`;
      }
      if (!Array.isArray(q.options) || q.options.length < 2) {
        return `Question #${i + 1} must have at least 2 options!`;
      }
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j] || !q.options[j].trim()) {
          return `Question #${i + 1}, Choice ${j + 1} cannot be blank!`;
        }
      }
      if (q.correctIndex === undefined || q.correctIndex < 0 || q.correctIndex >= q.options.length) {
        return `Question #${i + 1} must have a valid selected correct answer!`;
      }
    }
    return null;
  };

  // Core Quiz Save Handler
  const performSave = async () => {
    setValidationError('');
    const errorMsg = validateQuiz();
    if (errorMsg) {
      setValidationError(errorMsg);
      return null;
    }

    setIsSaving(true);
    try {
      const newQuizObj = {
        id: editingQuizId || 'quiz-' + Date.now(),
        title: title.trim(),
        description: description.trim(),
        category,
        questions: questions.map((q, idx) => ({
          ...q,
          id: q.id || `q-${Date.now()}-${idx}`,
          text: q.text.trim(),
          options: q.options.map(o => o.trim()),
          timeLimit: Number(q.timeLimit) || 20,
          points: Number(q.points) || 1000,
          difficulty: q.difficulty || 'Medium'
        })),
        coverColor: '#46178f',
        createdAt: Date.now()
      };

      const resultAction = await dispatch(saveQuizAsync(newQuizObj)).unwrap();
      dispatch(selectQuiz(newQuizObj.id));
      setIsSaving(false);
      return newQuizObj;
    } catch (err) {
      setIsSaving(false);
      setValidationError(err.toString());
      return null;
    }
  };

  const handleSaveOnly = async (e) => {
    e.preventDefault();
    const savedQuiz = await performSave();
    if (savedQuiz) {
      setNotification('Quiz Saved Successfully to Firebase & Redux! 🎉');
      setTimeout(() => setNotification(''), 4000);
    }
  };

  const handleSaveAndStartGame = async (e) => {
    e.preventDefault();
    const savedQuiz = await performSave();
    if (savedQuiz) {
      dispatch(createGameSessionAsync(savedQuiz));
      setActiveMode('HOST');
    }
  };

  const handleDeleteQuiz = (quizId) => {
    if (window.confirm("Are you sure you want to delete this quiz?")) {
      dispatch(deleteQuizAsync(quizId));
    }
  };

  const colors = ['bg-kahoot-red', 'bg-kahoot-blue', 'bg-kahoot-yellow', 'bg-kahoot-green'];
  const shapes = ['▲', '◆', '●', '■'];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* Top Bar Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white/5 p-4 sm:p-6 rounded-3xl border border-white/10 shadow-xl">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setActiveMode('LANDING')}
            className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black text-white">Create Your Quiz</h1>
              <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-kahoot-purple text-kahoot-yellow border border-kahoot-pink/40">
                {questions.length} Questions
              </span>
            </div>
            <p className="text-xs text-gray-400">Import CSV, add questions, set timers, and review before saving!</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCSVModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-kahoot-pink hover:bg-pink-600 transition-all font-extrabold text-xs text-white flex items-center space-x-2 shadow-lg"
          >
            <Upload className="w-4 h-4" />
            <span>Import CSV</span>
          </button>

          <button
            type="button"
            onClick={handleAddQuestion}
            className="px-4 py-2.5 rounded-2xl bg-kahoot-green hover:bg-emerald-600 transition-all font-extrabold text-xs text-white flex items-center space-x-1.5 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Add Question</span>
          </button>

          <button
            type="button"
            onClick={handleStartNewQuiz}
            className="px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 font-bold text-xs text-gray-200 transition-colors"
          >
            New Quiz
          </button>
        </div>
      </div>

      {validationError && (
        <div className="p-4 rounded-2xl bg-red-500/20 border border-red-500/50 text-red-300 text-sm font-bold flex items-center space-x-2 animate-bounce">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {notification && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-sm font-bold flex items-center space-x-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Split Content: Saved Sidebar + Editor Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sidebar: Saved Quizzes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black text-white flex items-center space-x-2">
              <FileText className="w-5 h-5 text-kahoot-pink" />
              <span>Saved Quizzes ({quizzes.length})</span>
            </h2>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
            {quizzes.map((q) => (
              <div 
                key={q.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                  editingQuizId === q.id 
                    ? 'bg-kahoot-purple/40 border-kahoot-pink ring-2 ring-kahoot-pink/40' 
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div>
                  <h4 className="font-extrabold text-sm text-white">{q.title}</h4>
                  <p className="text-[11px] text-gray-400">{q.questions.length} Questions • {q.category || 'General'}</p>
                </div>

                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => handleEditExisting(q)}
                    className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-blue-300 transition-colors"
                    title="Edit Quiz"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteQuiz(q.id)}
                    className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-red-400 transition-colors"
                    title="Delete Quiz"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Editor & Question Cards */}
        <div className="lg:col-span-2 space-y-6">
          <form className="space-y-6">
            
            {/* Top Meta Form */}
            <div className="glass-panel p-6 rounded-3xl space-y-4">
              <h3 className="text-base font-black text-kahoot-yellow">Quiz Settings</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Quiz Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. React & Web Dev Fundamentals"
                    className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-kahoot-pink"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-kahoot-pink"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat} className="bg-kahoot-dark text-white">
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-300 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide a brief summary of this quiz..."
                    className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-kahoot-pink"
                  />
                </div>
              </div>
            </div>

            {/* Questions Builder Cards */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-white">
                  Questions List ({questions.length})
                </h3>
              </div>

              {questions.map((q, qIdx) => (
                <div key={q.id || qIdx} className="glass-panel p-6 rounded-3xl space-y-4 relative border border-white/10 hover:border-white/20">
                  
                  {/* Card Bar */}
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-black text-kahoot-pink uppercase tracking-widest bg-kahoot-pink/20 px-3 py-1 rounded-full border border-kahoot-pink/40">
                        Question #{qIdx + 1}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        q.difficulty === 'Hard' ? 'bg-red-500/20 text-red-300 border border-red-400/30' :
                        q.difficulty === 'Easy' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' :
                        'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                      }`}>
                        {q.difficulty || 'Medium'}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setPreviewQuestion(q)}
                        className="text-xs font-bold text-purple-300 hover:text-white flex items-center space-x-1 bg-white/10 px-2.5 py-1 rounded-xl"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDuplicateQuestion(qIdx)}
                        className="text-xs font-bold text-blue-300 hover:text-white flex items-center space-x-1 bg-white/10 px-2.5 py-1 rounded-xl"
                        title="Duplicate Question"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Duplicate</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(qIdx)}
                        className="text-xs font-bold text-red-400 hover:text-red-300 flex items-center space-x-1 bg-white/10 px-2.5 py-1 rounded-xl"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Question Text Input */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1">Question Prompt</label>
                    <input
                      type="text"
                      required
                      value={q.text}
                      onChange={(e) => handleUpdateQuestion(qIdx, 'text', e.target.value)}
                      placeholder="e.g. What does HTML stand for?"
                      className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-2.5 text-sm font-bold text-white focus:outline-none focus:border-kahoot-pink"
                    />
                  </div>

                  {/* Settings Grid: Timer, Points, Difficulty */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-300 mb-1">Timer (Seconds)</label>
                      <select
                        value={q.timeLimit}
                        onChange={(e) => handleUpdateQuestion(qIdx, 'timeLimit', Number(e.target.value))}
                        className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
                      >
                        <option value={10}>10 Seconds</option>
                        <option value={15}>15 Seconds</option>
                        <option value={20}>20 Seconds</option>
                        <option value={30}>30 Seconds</option>
                        <option value={60}>60 Seconds</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-300 mb-1">Points Mode</label>
                      <select
                        value={q.points}
                        onChange={(e) => handleUpdateQuestion(qIdx, 'points', Number(e.target.value))}
                        className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
                      >
                        <option value={1000}>Standard (1000 pts)</option>
                        <option value={2000}>Double Points (2000 pts)</option>
                        <option value={0}>No Points (0 pts)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-300 mb-1">Difficulty</label>
                      <select
                        value={q.difficulty || 'Medium'}
                        onChange={(e) => handleUpdateQuestion(qIdx, 'difficulty', e.target.value)}
                        className="w-full bg-black/40 border border-white/20 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                  </div>

                  {/* 4 Choices with Radio Selection */}
                  <div className="space-y-3 pt-2">
                    <label className="block text-xs font-bold text-gray-300">
                      Answer Choices (Select Radio for Correct Answer)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {q.options.map((opt, optIdx) => {
                        const isCorrect = q.correctIndex === optIdx;
                        return (
                          <div 
                            key={optIdx}
                            className={`p-3 rounded-2xl border flex items-center space-x-3 transition-all ${
                              isCorrect 
                                ? 'border-emerald-400 bg-emerald-500/10 ring-2 ring-emerald-400/40 shadow-lg' 
                                : 'border-white/10 bg-black/30'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`correct-${qIdx}`}
                              checked={isCorrect}
                              onChange={() => handleUpdateQuestion(qIdx, 'correctIndex', optIdx)}
                              className="w-4 h-4 accent-emerald-400 cursor-pointer"
                            />
                            <span className={`w-7 h-7 rounded-xl ${colors[optIdx % 4]} flex items-center justify-center text-xs font-black text-white shrink-0`}>
                              {shapes[optIdx % 4]}
                            </span>
                            <input
                              type="text"
                              required
                              value={opt}
                              onChange={(e) => handleUpdateOption(qIdx, optIdx, e.target.value)}
                              className="w-full bg-transparent text-xs font-bold text-white focus:outline-none"
                              placeholder={`Choice ${optIdx + 1}`}
                            />
                            {isCorrect && (
                              <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/20 px-2 py-0.5 rounded-full shrink-0">
                                ✓ Correct
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              ))}
            </div>

            {/* Dual Submit Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <button
                type="button"
                onClick={handleSaveOnly}
                disabled={isSaving || quizLoading}
                className="py-4 rounded-2xl bg-white/10 hover:bg-white/20 transition-all font-black text-white text-sm border border-white/20 flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                <span>Save Quiz Only</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAndStartGame}
                disabled={isSaving || quizLoading}
                className="py-4 rounded-2xl bg-gradient-to-r from-kahoot-purple to-kahoot-pink hover:scale-[1.01] transition-all font-black text-white text-sm shadow-2xl flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5 fill-white" />}
                <span>Save & Start Live Game 🚀</span>
              </button>
            </div>

          </form>
        </div>

      </div>

      {/* CSV Import Modal */}
      {showCSVModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-kahoot-card border border-white/20 rounded-3xl max-w-2xl w-full p-6 text-left space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-xl font-black text-white flex items-center space-x-2">
                <Upload className="w-5 h-5 text-kahoot-pink" />
                <span>Import 50+ Questions via CSV</span>
              </h3>
              <button onClick={() => setShowCSVModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-gray-300 space-y-2">
                <p className="font-bold text-white">Expected CSV Format:</p>
                <code className="block bg-black/50 p-2 rounded-xl text-kahoot-yellow font-mono text-[11px] overflow-x-auto">
                  Question, Option 1, Option 2, Option 3, Option 4, Correct Answer, Timer, Points, Difficulty
                </code>
                <p>Click below to select your <code>.csv</code> file (e.g. <strong>web_quiz_50.csv</strong>):</p>
              </div>

              <input
                type="file"
                accept=".csv"
                onChange={handleCSVUpload}
                className="w-full bg-black/40 border border-white/20 rounded-2xl p-4 text-xs text-gray-200 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-kahoot-pink file:text-white cursor-pointer"
              />

              {csvReport && (
                <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 max-h-48 overflow-y-auto">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-emerald-400">✅ {csvReport.validQuestions.length} Valid Questions Found</span>
                    {csvReport.errors.length > 0 && (
                      <span className="text-red-400">⚠️ {csvReport.errors.length} Format Warnings</span>
                    )}
                  </div>
                  {csvReport.errors.map((err, idx) => (
                    <p key={idx} className="text-[11px] text-red-300 font-mono">{err}</p>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={handleConfirmCSVImport}
                disabled={!csvReport || csvReport.validQuestions.length === 0}
                className={`flex-1 py-3.5 rounded-2xl font-black text-sm transition-all shadow-lg ${
                  csvReport && csvReport.validQuestions.length > 0
                    ? 'bg-kahoot-green hover:bg-emerald-600 text-white cursor-pointer'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                Import {csvReport ? csvReport.validQuestions.length : 0} Questions into Editor
              </button>
              <button
                type="button"
                onClick={() => setShowCSVModal(false)}
                className="px-5 py-3.5 rounded-2xl bg-white/10 hover:bg-white/20 text-xs font-bold text-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Live Question Preview Modal */}
      {previewQuestion && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-kahoot-darker border border-kahoot-pink/40 rounded-3xl max-w-2xl w-full p-8 text-center space-y-6 shadow-2xl relative">
            <span className="text-[10px] font-black tracking-widest text-kahoot-yellow uppercase bg-white/10 px-3 py-1 rounded-full">
              Live Question Game Preview
            </span>

            <h2 className="text-2xl font-black text-white">{previewQuestion.text}</h2>

            <div className="flex items-center justify-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-kahoot-purple border-2 border-kahoot-pink flex items-center justify-center text-xl font-black text-white">
                {previewQuestion.timeLimit}s
              </div>
              <span className="text-xs font-bold text-gray-400">{previewQuestion.points} pts • {previewQuestion.difficulty}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-left">
              {previewQuestion.options.map((opt, idx) => (
                <div key={idx} className={`p-4 rounded-2xl ${colors[idx % 4]} flex items-center space-x-3 text-white font-extrabold text-sm shadow-md`}>
                  <span>{shapes[idx % 4]}</span>
                  <span>{opt}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setPreviewQuestion(null)}
              className="mt-4 px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-xs"
            >
              Close Live Preview
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
