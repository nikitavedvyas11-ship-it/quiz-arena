import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { saveGameSessionToFirebase, updateGameSessionInFirebase } from '../../services/firebase';

// Helper: Generate Random 6-Digit Game PIN
export const generateGamePin = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Async Thunk: Create New Game Session
export const createGameSessionAsync = createAsyncThunk(
  'game/createSession',
  async (quiz, { rejectWithValue }) => {
    try {
      const pin = generateGamePin();
      const firstQuestion = quiz.questions[0] || null;

      const sessionData = {
        gamePin: pin,
        quizId: quiz.id,
        quizTitle: quiz.title,
        status: 'LOBBY',
        currentQuestionIndex: 0,
        totalQuestions: quiz.questions.length,
        questions: quiz.questions,
        timer: firstQuestion ? firstQuestion.timeLimit : 20,
        isTimerRunning: false,
        questionStartTime: null,
        createdTime: Date.now(),
        hostId: 'host-' + Math.random().toString(36).substring(2, 7)
      };

      await saveGameSessionToFirebase(pin, sessionData);
      return sessionData;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Async Thunk: Host Starts Game or Advances Question
export const nextQuestionAsync = createAsyncThunk(
  'game/nextQuestion',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { game } = getState();
      const nextIdx = game.status === 'LOBBY' ? 0 : game.currentQuestionIndex + 1;

      if (nextIdx >= game.questions.length) {
        // Quiz is finished! Go to PODIUM
        const updates = {
          status: 'PODIUM',
          isTimerRunning: false
        };
        await updateGameSessionInFirebase(game.gamePin, updates);
        return updates;
      }

      const nextQuestion = game.questions[nextIdx];
      const updates = {
        status: 'QUESTION',
        currentQuestionIndex: nextIdx,
        timer: nextQuestion ? nextQuestion.timeLimit : 20,
        isTimerRunning: true,
        questionStartTime: Date.now()
      };

      await updateGameSessionInFirebase(game.gamePin, updates);
      return updates;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Async Thunk: Reveal Answer Distribution
export const revealAnswerAsync = createAsyncThunk(
  'game/revealAnswer',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { game } = getState();
      const updates = {
        status: 'SHOW_ANSWER',
        isTimerRunning: false
      };
      await updateGameSessionInFirebase(game.gamePin, updates);
      return updates;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Async Thunk: Show Leaderboard
export const showLeaderboardAsync = createAsyncThunk(
  'game/showLeaderboard',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { game } = getState();
      const updates = {
        status: 'LEADERBOARD',
        isTimerRunning: false
      };
      await updateGameSessionInFirebase(game.gamePin, updates);
      return updates;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

// Async Thunk: Finish Game & Show Podium
export const endGameAsync = createAsyncThunk(
  'game/endGame',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { game } = getState();
      const updates = {
        status: 'PODIUM',
        isTimerRunning: false
      };
      await updateGameSessionInFirebase(game.gamePin, updates);
      return updates;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const gameSlice = createSlice({
  name: 'game',
  initialState: {
    gamePin: null,
    quizId: null,
    quizTitle: '',
    status: 'IDLE', // 'IDLE' | 'LOBBY' | 'QUESTION' | 'SHOW_ANSWER' | 'LEADERBOARD' | 'PODIUM'
    currentQuestionIndex: 0,
    totalQuestions: 0,
    questions: [],
    timer: 20,
    isTimerRunning: false,
    questionStartTime: null,
    hostId: null,
    loading: false,
    error: null
  },
  reducers: {
    setGameSession: (state, action) => {
      if (action.payload) {
        Object.assign(state, action.payload);
      }
    },
    updateTimer: (state, action) => {
      state.timer = action.payload;
      if (action.payload <= 0) {
        state.isTimerRunning = false;
      }
    },
    decrementTimer: (state) => {
      if (state.timer > 0) {
        state.timer -= 1;
      }
      if (state.timer <= 0) {
        state.isTimerRunning = false;
        state.status = 'SHOW_ANSWER';
      }
    },
    setGameStatus: (state, action) => {
      state.status = action.payload;
    },
    resetGame: (state) => {
      state.gamePin = null;
      state.status = 'IDLE';
      state.currentQuestionIndex = 0;
      state.questions = [];
      state.timer = 20;
      state.isTimerRunning = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createGameSessionAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(createGameSessionAsync.fulfilled, (state, action) => {
        state.loading = false;
        Object.assign(state, action.payload);
      })
      .addCase(createGameSessionAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(nextQuestionAsync.fulfilled, (state, action) => {
        Object.assign(state, action.payload);
      })
      .addCase(revealAnswerAsync.fulfilled, (state, action) => {
        Object.assign(state, action.payload);
      })
      .addCase(showLeaderboardAsync.fulfilled, (state, action) => {
        Object.assign(state, action.payload);
      })
      .addCase(endGameAsync.fulfilled, (state, action) => {
        Object.assign(state, action.payload);
      });
  }
});

export const { setGameSession, updateTimer, decrementTimer, setGameStatus, resetGame } = gameSlice.actions;
export default gameSlice.reducer;