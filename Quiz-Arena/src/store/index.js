import { configureStore } from '@reduxjs/toolkit';
import quizReducer from './slices/quizSlice';
import gameReducer from './slices/gameSlice';
import playersReducer from './slices/playersSlice';

export const store = configureStore({
  reducer: {
    quiz: quizReducer,
    game: gameReducer,
    players: playersReducer
  },
  devTools: process.env.NODE_ENV !== 'production'
});

export default store;