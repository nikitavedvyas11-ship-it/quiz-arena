import {
  createSlice,
  createAsyncThunk
} from '@reduxjs/toolkit';

import {
  savePlayerToFirebase,
  savePlayerResponseToFirebase,
  getGameSessionFromFirebase
} from '../../services/firebase';


const AVATARS = [
  '🚀',
  '🦊',
  '⚡',
  '🐉',
  '👾',
  '🦁',
  '🦉',
  '💎',
  '🔥',
  '🦄'
];


// ======================================================
// SPEED SCORE
// ======================================================

export const calculateSpeedScore = (
  timeRemaining,
  totalTimeLimit,
  basePoints = 1000,
  difficulty = 'Medium'
) => {
  if (totalTimeLimit <= 0) {
    return 500;
  }

  const ratio = Math.min(
    1,
    Math.max(
      0.1,
      timeRemaining / totalTimeLimit
    )
  );

  const diffMultiplier =
    difficulty === 'Hard'
      ? 1.5
      : difficulty === 'Easy'
        ? 1.0
        : 1.2;

  const rawPoints = Math.round(
    basePoints *
      (0.5 + 0.5 * ratio) *
      diffMultiplier
  );

  return Math.min(
    Math.round(
      basePoints * diffMultiplier
    ),
    Math.max(
      500,
      rawPoints
    )
  );
};


// ======================================================
// JOIN GAME
// ======================================================

export const joinGameAsync =
  createAsyncThunk(
    'players/joinGame',

    async (
      {
        gamePin,
        nickname,
        avatar
      },
      {
        getState,
        rejectWithValue
      }
    ) => {

      try {

        const normalizedPin =
          String(
            gamePin || ''
          ).trim();

        const normalizedNickname =
          String(
            nickname || ''
          ).trim();


        // Validate PIN
        if (!normalizedPin) {
          throw new Error(
            'Please enter a Game PIN.'
          );
        }

        // Do not force 6 digits if your
        // existing host generates another format.
        if (!/^\d{4,8}$/.test(
          normalizedPin
        )) {
          throw new Error(
            'Please enter a valid Game PIN.'
          );
        }


        // Validate nickname
        if (!normalizedNickname) {
          throw new Error(
            'Please enter a nickname.'
          );
        }


        // =================================================
        // FIRST GET GAME FROM FIREBASE
        // =================================================

        const gameSession =
          await getGameSessionFromFirebase(
            normalizedPin
          );


        if (!gameSession) {
          throw new Error(
            'Game PIN not found.'
          );
        }


        // Game already started?
        if (
          gameSession.status &&
          gameSession.status !== 'LOBBY'
        ) {
          throw new Error(
            'This game has already started.'
          );
        }


        // =================================================
        // CHECK LOCAL DUPLICATE NICKNAME
        // =================================================

        const { players } =
          getState();

        const existingPlayers =
          Object.values(
            players.players || {}
          );


        const nicknameExists =
          existingPlayers.some(
            (player) =>
              player?.nickname
                ?.toLowerCase() ===
              normalizedNickname.toLowerCase()
          );


        if (nicknameExists) {
          throw new Error(
            `Nickname "${normalizedNickname}" is already taken in this game room! Please choose another.`
          );
        }


        // =================================================
        // CREATE PLAYER
        // =================================================

        const playerId =
          `player-${Date.now()}-${Math.random()
            .toString(36)
            .substring(2, 8)}`;


        const chosenAvatar =
          avatar ||
          AVATARS[
            Math.floor(
              Math.random() *
              AVATARS.length
            )
          ];


        const playerRecord = {
          id: playerId,

          nickname:
            normalizedNickname,

          avatar:
            chosenAvatar,

          score: 0,

          streak: 0,

          previousRank: null,

          lastAnswerIndex: null,

          lastAnswerTime: null,

          lastScoreGain: 0,

          isCorrect: null,

          joinedAt: Date.now()
        };


        // =================================================
        // SAVE PLAYER SESSION
        // =================================================

        sessionStorage.setItem(
          'qb_player_session',

          JSON.stringify({
            gamePin:
              normalizedPin,

            playerRecord
          })
        );


        // =================================================
        // SAVE PLAYER TO FIREBASE
        // =================================================

        await savePlayerToFirebase(
          normalizedPin,
          playerRecord
        );


        console.log(
          'Player joined successfully:',
          playerRecord
        );


        // IMPORTANT:
        // Return gamePin + session + player
        return {
          gamePin:
            normalizedPin,

          gameSession,

          playerRecord
        };

      } catch (error) {

        console.error(
          'Join game error:',
          error
        );

        return rejectWithValue(
          error?.message ||
          'Unable to join game.'
        );
      }
    }
  );


// ======================================================
// SUBMIT ANSWER
// ======================================================

export const submitAnswerAsync =
  createAsyncThunk(

    'players/submitAnswer',

    async (
      {
        gamePin,
        answerIndex,
        timeRemaining,
        totalTimeLimit,
        correctIndex,
        points = 1000,
        difficulty = 'Medium',
        questionIndex = 0
      },
      {
        getState,
        rejectWithValue
      }
    ) => {

      try {

        const { players } =
          getState();


        const myId =
          players.myPlayerId;


        if (!myId) {
          throw new Error(
            'Player session not initialized.'
          );
        }


        const existingPlayer =
          players.players[myId] || {};


        const isCorrect =
          answerIndex ===
          correctIndex;


        let scoreGain = 0;

        let newStreak = 0;


        // Correct answer
        if (isCorrect) {

          const speedScore =
            calculateSpeedScore(
              timeRemaining,
              totalTimeLimit,
              points,
              difficulty
            );


          newStreak =
            (existingPlayer.streak || 0) +
            1;


          const streakBonus =
            newStreak >= 3
              ? 200
              : newStreak === 2
                ? 100
                : 0;


          scoreGain =
            speedScore +
            streakBonus;

        } else {

          newStreak = 0;

          scoreGain = 0;
        }


        const updatedPlayer = {

          ...existingPlayer,

          id: myId,

          score:
            (existingPlayer.score || 0) +
            scoreGain,

          streak:
            newStreak,

          lastAnswerIndex:
            answerIndex,

          lastAnswerTime:
            timeRemaining,

          lastScoreGain:
            scoreGain,

          isCorrect
        };


        // Save player score
        await savePlayerToFirebase(
          gamePin,
          updatedPlayer
        );


        // Response log
        const responseLog = {

          playerId:
            myId,

          nickname:
            existingPlayer.nickname,

          questionIndex,

          selectedOption:
            answerIndex,

          isCorrect,

          timeTaken:
            totalTimeLimit -
            timeRemaining,

          pointsEarned:
            scoreGain,

          timestamp:
            Date.now()
        };


        await savePlayerResponseToFirebase(
          gamePin,
          responseLog
        );


        return updatedPlayer;

      } catch (error) {

        console.error(
          'Submit answer error:',
          error
        );

        return rejectWithValue(
          error?.message ||
          'Unable to submit answer.'
        );
      }
    }
  );


// ======================================================
// SLICE
// ======================================================

const playersSlice =
  createSlice({

    name: 'players',

    initialState: {

      players: {},

      myPlayerId:
        null,

      myNickname:
        '',

      myAvatar:
        '🚀',

      // IMPORTANT
      // Player's game PIN
      joinedGamePin:
        null,

      hasAnsweredCurrentQuestion:
        false,

      joinError:
        null,

      loading:
        false
    },


    reducers: {

      // --------------------------------------------------
      // SET PLAYERS
      // --------------------------------------------------

      setPlayers: (
        state,
        action
      ) => {

        state.players =
          action.payload || {};
      },


      // --------------------------------------------------
      // SET MY PLAYER
      // --------------------------------------------------

      setMyPlayer: (
        state,
        action
      ) => {

        const player =
          action.payload;

        if (!player) {
          return;
        }

        state.myPlayerId =
          player.id;

        state.myNickname =
          player.nickname;

        state.myAvatar =
          player.avatar;

        state.players[
          player.id
        ] = player;
      },


      // --------------------------------------------------
      // RESET ANSWER
      // --------------------------------------------------

      resetAnswerState: (
        state
      ) => {

        state.hasAnsweredCurrentQuestion =
          false;
      },


      // --------------------------------------------------
      // ANSWERED
      // --------------------------------------------------

      setHasAnswered: (
        state,
        action
      ) => {

        state.hasAnsweredCurrentQuestion =
          action.payload;
      },


      // --------------------------------------------------
      // CLEAR JOIN ERROR
      // --------------------------------------------------

      clearJoinError: (
        state
      ) => {

        state.joinError =
          null;
      },


      // --------------------------------------------------
      // RESTORE SESSION
      // --------------------------------------------------

      restorePlayerSession: (
        state,
        action
      ) => {

        const {
          gamePin,
          playerRecord
        } =
          action.payload || {};


        if (!playerRecord) {
          return;
        }


        state.myPlayerId =
          playerRecord.id;

        state.myNickname =
          playerRecord.nickname;

        state.myAvatar =
          playerRecord.avatar;

        state.joinedGamePin =
          gamePin || null;


        state.players[
          playerRecord.id
        ] = playerRecord;
      },


      // --------------------------------------------------
      // RESET PLAYERS
      // --------------------------------------------------

      resetPlayers: (
        state
      ) => {

        state.players = {};

        state.myPlayerId =
          null;

        state.myNickname =
          '';

        state.myAvatar =
          '🚀';

        state.joinedGamePin =
          null;

        state.hasAnsweredCurrentQuestion =
          false;

        state.joinError =
          null;

        state.loading =
          false;

        sessionStorage.removeItem(
          'qb_player_session'
        );
      }
    },


    // ==================================================
    // EXTRA REDUCERS
    // ==================================================

    extraReducers:
      (builder) => {

        // JOIN PENDING
        builder.addCase(
          joinGameAsync.pending,
          (state) => {

            state.loading =
              true;

            state.joinError =
              null;
          }
        );


        // JOIN SUCCESS
        builder.addCase(
          joinGameAsync.fulfilled,
          (
            state,
            action
          ) => {

            state.loading =
              false;


            const {
              gamePin,
              playerRecord
            } =
              action.payload;


            state.myPlayerId =
              playerRecord.id;

            state.myNickname =
              playerRecord.nickname;

            state.myAvatar =
              playerRecord.avatar;


            // IMPORTANT FIX
            state.joinedGamePin =
              gamePin;


            state.players[
              playerRecord.id
            ] = playerRecord;


            state.joinError =
              null;
          }
        );


        // JOIN FAILED
        builder.addCase(
          joinGameAsync.rejected,
          (
            state,
            action
          ) => {

            state.loading =
              false;

            state.joinError =
              action.payload ||
              'Unable to join game.';
          }
        );


        // ANSWER SUCCESS
        builder.addCase(
          submitAnswerAsync.fulfilled,
          (
            state,
            action
          ) => {

            state.hasAnsweredCurrentQuestion =
              true;

            state.players[
              action.payload.id
            ] =
              action.payload;
          }
        );


        // ANSWER FAILED
        builder.addCase(
          submitAnswerAsync.rejected,
          (
            state,
            action
          ) => {

            state.joinError =
              action.payload ||
              'Unable to submit answer.';
          }
        );
      }
  });


// ======================================================
// EXPORT ACTIONS
// ======================================================

export const {
  setPlayers,
  setMyPlayer,
  resetAnswerState,
  setHasAnswered,
  clearJoinError,
  restorePlayerSession,
  resetPlayers
} = playersSlice.actions;


// ======================================================
// EXPORT REDUCER
// ======================================================

export default playersSlice.reducer;