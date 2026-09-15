import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { saveQuizToFirestore, fetchQuizzesFromFirestore, deleteQuizFromFirestore } from '../../services/firebase';

export const CATEGORIES = [
  'HTML',
  'CSS',
  'JavaScript',
  'React',
  'Web Development',
  'Programming',
  'General Tech',
  'Custom'
];

export const DEFAULT_QUIZZES = [
  {
    id: 'quiz-react-redux',
    title: 'React & Redux Master Battle ⚛️',
    description: 'Test your knowledge of Redux Toolkit, hooks, state immutability, and real-time React patterns!',
    category: 'React',
    coverColor: '#46178f',
    questions: [
      {
        id: 'q1',
        text: 'Which Redux Toolkit function is used to create slice reducers and actions automatically?',
        type: 'multiple',
        timeLimit: 20,
        options: ['createReducer()', 'createSlice()', 'createStore()', 'createAction()'],
        correctIndex: 1,
        points: 1000,
        difficulty: 'Easy'
      },
      {
        id: 'q2',
        text: 'Does Redux Toolkit use Immer under the hood to allow safe mutable-style updates?',
        type: 'boolean',
        timeLimit: 15,
        options: ['True (Immer enables mutable syntax)', 'False (You must return new state manually)'],
        correctIndex: 0,
        points: 1000,
        difficulty: 'Easy'
      },
      {
        id: 'q3',
        text: 'What tool handles asynchronous actions in Redux Toolkit standard workflow?',
        type: 'multiple',
        timeLimit: 20,
        options: ['Redux Saga', 'createAsyncThunk', 'useContext', 'Redux Thunk manual promise'],
        correctIndex: 1,
        points: 1000,
        difficulty: 'Medium'
      },
      {
        id: 'q4',
        text: 'Which hook is used in React Redux components to select data from the Redux store?',
        type: 'multiple',
        timeLimit: 15,
        options: ['useDispatch', 'useStore', 'useSelector', 'useContext'],
        correctIndex: 2,
        points: 1000,
        difficulty: 'Easy'
      },
      {
        id: 'q5',
        text: 'What function from reselect is used to create memoized derived selectors?',
        type: 'multiple',
        timeLimit: 20,
        options: ['createSelector', 'useMemo', 'createDerivedStore', 'makeSelector'],
        correctIndex: 0,
        points: 1000,
        difficulty: 'Medium'
      }
    ]
  },
  {
    id: 'quiz-web-dev-50',
    title: 'Web Development & JS 50-Question Challenge 🌐',
    description: 'Comprehensive 50-question quiz covering HTML5, CSS Grid/Flexbox, ES6+ JS, and React fundamentals!',
    category: 'Web Development',
    coverColor: '#1368ce',
    questions: [
      { id: 'wd1', text: 'What does HTML stand for?', options: ['HyperText Markup Language', 'HighText Machine Language', 'HyperTransfer Mark Language', 'Hyperlink Text Management'], correctIndex: 0, timeLimit: 15, points: 1000, difficulty: 'Easy' },
      { id: 'wd2', text: 'Which CSS property changes text color?', options: ['color', 'font-color', 'text-color', 'fill-color'], correctIndex: 0, timeLimit: 15, points: 1000, difficulty: 'Easy' },
      { id: 'wd3', text: 'Which keyword defines a constant in JavaScript?', options: ['const', 'let', 'var', 'static'], correctIndex: 0, timeLimit: 15, points: 1000, difficulty: 'Easy' },
      { id: 'wd4', text: 'What hook handles side effects in React?', options: ['useEffect', 'useState', 'useContext', 'useReducer'], correctIndex: 0, timeLimit: 20, points: 1000, difficulty: 'Easy' },
      { id: 'wd5', text: 'Which Redux function creates slice reducers automatically?', options: ['createSlice', 'createStore', 'createReducer', 'createAction'], correctIndex: 0, timeLimit: 20, points: 1000, difficulty: 'Easy' }
    ]
  }
];

export const fetchQuizzesAsync = createAsyncThunk(
  'quiz/fetchQuizzes',
  async (_, { rejectWithValue }) => {
    try {
      const firebaseQuizzes = await fetchQuizzesFromFirestore();
      const savedLocal = localStorage.getItem('qb_quizzes');
      let localQuizzes = savedLocal ? JSON.parse(savedLocal) : DEFAULT_QUIZZES;

      const mergedMap = new Map();
      DEFAULT_QUIZZES.forEach(q => mergedMap.set(q.id, q));
      localQuizzes.forEach(q => mergedMap.set(q.id, q));
      firebaseQuizzes.forEach(q => mergedMap.set(q.id, q));

      return Array.from(mergedMap.values());
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const saveQuizAsync = createAsyncThunk(
  'quiz/saveQuiz',
  async (newQuiz, { getState, rejectWithValue }) => {
    try {
      const { quiz } = getState();
      const existingIdx = quiz.quizzes.findIndex(q => q.id === newQuiz.id);
      let updatedList = [];
      if (existingIdx >= 0) {
        updatedList = quiz.quizzes.map((q, i) => i === existingIdx ? newQuiz : q);
      } else {
        updatedList = [newQuiz, ...quiz.quizzes];
      }
      localStorage.setItem('qb_quizzes', JSON.stringify(updatedList));
      await saveQuizToFirestore(newQuiz);
      return { updatedList, savedQuiz: newQuiz };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

export const deleteQuizAsync = createAsyncThunk(
  'quiz/deleteQuiz',
  async (quizId, { getState, rejectWithValue }) => {
    try {
      const { quiz } = getState();
      const updatedList = quiz.quizzes.filter(q => q.id !== quizId);
      localStorage.setItem('qb_quizzes', JSON.stringify(updatedList));
      await deleteQuizFromFirestore(quizId);
      return updatedList;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const quizSlice = createSlice({
  name: 'quiz',
  initialState: {
    quizzes: DEFAULT_QUIZZES,
    activeQuiz: DEFAULT_QUIZZES[0],
    loading: false,
    error: null,
    filterCategory: 'ALL'
  },
  reducers: {
    selectQuiz: (state, action) => {
      const found = state.quizzes.find(q => q.id === action.payload);
      if (found) {
        state.activeQuiz = found;
      }
    },
    addQuiz: (state, action) => {
      state.quizzes.unshift(action.payload);
      state.activeQuiz = action.payload;
    },
    updateQuiz: (state, action) => {
      const idx = state.quizzes.findIndex(q => q.id === action.payload.id);
      if (idx !== -1) {
        state.quizzes[idx] = action.payload;
        if (state.activeQuiz?.id === action.payload.id) {
          state.activeQuiz = action.payload;
        }
      }
    },
    deleteQuiz: (state, action) => {
      state.quizzes = state.quizzes.filter(q => q.id !== action.payload);
      if (state.activeQuiz?.id === action.payload) {
        state.activeQuiz = state.quizzes[0] || null;
      }
    },
    setFilterCategory: (state, action) => {
      state.filterCategory = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchQuizzesAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchQuizzesAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.quizzes = action.payload;
        if (action.payload.length > 0 && (!state.activeQuiz || !action.payload.find(q => q.id === state.activeQuiz.id))) {
          state.activeQuiz = action.payload[0];
        }
      })
      .addCase(fetchQuizzesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(saveQuizAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveQuizAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.quizzes = action.payload.updatedList;
        state.activeQuiz = action.payload.savedQuiz;
        state.error = null;
      })
      .addCase(saveQuizAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteQuizAsync.fulfilled, (state, action) => {
        state.quizzes = action.payload;
        if (!state.quizzes.find(q => q.id === state.activeQuiz?.id)) {
          state.activeQuiz = state.quizzes[0] || null;
        }
      });
  }
});

export const { selectQuiz, addQuiz, updateQuiz, deleteQuiz, setFilterCategory } = quizSlice.actions;
export default quizSlice.reducer;