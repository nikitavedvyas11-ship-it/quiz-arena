import { createSelector } from '@reduxjs/toolkit';

const selectPlayersState = (state) => state.players.players;
const selectMyPlayerId = (state) => state.players.myPlayerId;
const selectGameState = (state) => state.game;

// Derived Selector: Sorted Leaderboard Array with Rank Movement
export const selectSortedLeaderboard = createSelector(
  [selectPlayersState],
  (playersObj) => {
    if (!playersObj) return [];
    const playerList = Object.values(playersObj);
    
    return playerList
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .map((player, index) => {
        const currentRank = index + 1;
        const previousRank = player.previousRank || currentRank;
        const rankChange = previousRank - currentRank; // Positive means moved up!

        return {
          ...player,
          rank: currentRank,
          rankChange: rankChange > 0 ? `↑${rankChange}` : rankChange < 0 ? `↓${Math.abs(rankChange)}` : '='
        };
      });
  }
);

// Derived Selector: Podium Top 3 Players
export const selectPodium = createSelector(
  [selectSortedLeaderboard],
  (sortedPlayers) => {
    return {
      first: sortedPlayers[0] || null,
      second: sortedPlayers[1] || null,
      third: sortedPlayers[2] || null,
      runnersUp: sortedPlayers.slice(3)
    };
  }
);

// Derived Selector: Current Player Detailed Rank & Feedback
export const selectPlayerRank = createSelector(
  [selectSortedLeaderboard, selectMyPlayerId],
  (sortedPlayers, myId) => {
    if (!myId || sortedPlayers.length === 0) {
      return { rank: 0, totalPlayers: 0, player: null, pointsBehind: 0 };
    }

    const playerIndex = sortedPlayers.findIndex(p => p.id === myId);
    if (playerIndex === -1) {
      return { rank: 0, totalPlayers: sortedPlayers.length, player: null, pointsBehind: 0 };
    }

    const player = sortedPlayers[playerIndex];
    const prevPlayer = playerIndex > 0 ? sortedPlayers[playerIndex - 1] : null;
    const pointsBehind = prevPlayer ? (prevPlayer.score - player.score) : 0;

    return {
      rank: playerIndex + 1,
      totalPlayers: sortedPlayers.length,
      player,
      pointsBehind
    };
  }
);

// Derived Selector: Active Question & Progress
export const selectCurrentQuestion = createSelector(
  [selectGameState],
  (game) => {
    const { questions, currentQuestionIndex, totalQuestions } = game;
    const currentQuestion = questions[currentQuestionIndex] || null;
    return {
      question: currentQuestion,
      currentIndex: currentQuestionIndex,
      totalQuestions: totalQuestions || questions.length,
      isLastQuestion: currentQuestionIndex === (questions.length - 1)
    };
  }
);

// Derived Selector: Host Answer Choice Distribution Counts
export const selectAnswerDistribution = createSelector(
  [selectPlayersState, selectCurrentQuestion],
  (playersObj, { question }) => {
    const counts = [0, 0, 0, 0];
    if (!playersObj || !question) return { counts, totalAnswers: 0, totalPlayers: 0 };

    const playerList = Object.values(playersObj);
    let totalAnswers = 0;

    playerList.forEach(player => {
      if (player.lastAnswerIndex !== null && player.lastAnswerIndex !== undefined) {
        if (counts[player.lastAnswerIndex] !== undefined) {
          counts[player.lastAnswerIndex] += 1;
        }
        totalAnswers += 1;
      }
    });

    return {
      counts,
      totalAnswers,
      totalPlayers: playerList.length
    };
  }
);

// Derived Selector: Overall Game Analytics Summary for Podium & Host Report
export const selectGameSummaryAnalytics = createSelector(
  [selectPlayersState, selectGameState],
  (playersObj, game) => {
    const players = Object.values(playersObj || {});
    if (players.length === 0) {
      return { accuracyPercent: 0, averageScore: 0, topStreak: 0, totalPlayers: 0 };
    }

    const totalScoreSum = players.reduce((sum, p) => sum + (p.score || 0), 0);
    const averageScore = Math.round(totalScoreSum / players.length);
    const topStreak = Math.max(0, ...players.map(p => p.streak || 0));

    // Approximate correct answer percentage
    const correctAnswers = players.filter(p => p.isCorrect).length;
    const accuracyPercent = Math.round((correctAnswers / Math.max(1, players.length)) * 100);

    return {
      accuracyPercent,
      averageScore,
      topStreak,
      totalPlayers: players.length,
      totalQuestions: game.questions.length
    };
  }
);