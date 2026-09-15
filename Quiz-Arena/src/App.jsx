import React, {
  useEffect,
  useState
} from 'react';

import {
  useSelector,
  useDispatch
} from 'react-redux';


// ======================================================
// COMPONENTS
// ======================================================

import Navbar from './components/Navbar';

import LandingPage from './components/LandingPage';

import QuizCreator from './components/QuizCreator';

import QuizLibrary from './components/QuizLibrary';

import DualViewSimulator from './components/DualViewSimulator';


// ======================================================
// HOST COMPONENTS
// ======================================================

import HostLobby from './components/HostView/HostLobby';

import HostQuestion from './components/HostView/HostQuestion';

import HostAnswerReveal from './components/HostView/HostAnswerReveal';

import HostLeaderboard from './components/HostView/HostLeaderboard';

import HostPodium from './components/HostView/HostPodium';


// ======================================================
// PLAYER COMPONENTS
// ======================================================

import PlayerJoin from './components/PlayerView/PlayerJoin';

import PlayerWaiting from './components/PlayerView/PlayerWaiting';

import PlayerQuestion from './components/PlayerView/PlayerQuestion';

import PlayerFeedback from './components/PlayerView/PlayerFeedback';


// ======================================================
// FIREBASE
// ======================================================

import {
  subscribeToGameSession,
  subscribeToPlayers
} from './services/firebase';


// ======================================================
// REDUX
// ======================================================

import {
  setGameSession
} from './store/slices/gameSlice';

import {
  setPlayers,
  resetAnswerState,
  restorePlayerSession
} from './store/slices/playersSlice';


// ======================================================
// APP
// ======================================================

export default function App() {

  const dispatch =
    useDispatch();


  // ====================================================
  // ACTIVE MODE
  // ====================================================

  const [
    activeMode,
    setActiveMode
  ] =
    useState('LANDING');


  // ====================================================
  // GAME STATE
  // ====================================================

  const gamePin =
    useSelector(
      (state) =>
        state.game.gamePin
    );


  const gameStatus =
    useSelector(
      (state) =>
        state.game.status
    );


  const currentQuestionIndex =
    useSelector(
      (state) =>
        state.game.currentQuestionIndex
    );


  // ====================================================
  // PLAYER STATE
  // ====================================================

  const myPlayerId =
    useSelector(
      (state) =>
        state.players.myPlayerId
    );


  const joinedGamePin =
    useSelector(
      (state) =>
        state.players.joinedGamePin
    );


  // ====================================================
  // EFFECTIVE PIN
  // ====================================================
  //
  // Host:
  // state.game.gamePin
  //
  // Player:
  // state.players.joinedGamePin
  //
  // ====================================================

  const effectiveGamePin =
    gamePin ||
    joinedGamePin ||
    null;


  // ====================================================
  // RESTORE PLAYER SESSION
  // ====================================================

  useEffect(() => {

    const saved =
      sessionStorage.getItem(
        'qb_player_session'
      );


    if (
      saved &&
      !myPlayerId
    ) {

      try {

        const parsed =
          JSON.parse(saved);


        if (
          parsed?.gamePin &&
          parsed?.playerRecord
        ) {

          console.log(
            'Restoring player session:',
            parsed
          );


          dispatch(
            restorePlayerSession(
              parsed
            )
          );
        }

      } catch (error) {

        console.error(
          'Player session restore error:',
          error
        );

        sessionStorage.removeItem(
          'qb_player_session'
        );
      }
    }

  }, [
    myPlayerId,
    dispatch
  ]);


  // ====================================================
  // FIREBASE REAL-TIME LISTENERS
  // ====================================================

  useEffect(() => {

    if (!effectiveGamePin) {

      console.log(
        'Waiting for Game PIN...'
      );

      return;
    }


    const normalizedPin =
      String(
        effectiveGamePin
      ).trim();


    console.log(
      'Starting Firebase listeners for:',
      normalizedPin
    );


    // --------------------------------------------------
    // GAME SESSION
    // --------------------------------------------------

    const unsubscribeSession =
      subscribeToGameSession(
        normalizedPin,
        (sessionData) => {

          if (!sessionData) {
            return;
          }


          console.log(
            'Game session received:',
            sessionData
          );


          dispatch(
            setGameSession(
              sessionData
            )
          );
        }
      );


    // --------------------------------------------------
    // PLAYERS
    // --------------------------------------------------

    const unsubscribePlayers =
      subscribeToPlayers(
        normalizedPin,
        (playersObj) => {

          console.log(
            'Players received:',
            playersObj
          );


          dispatch(
            setPlayers(
              playersObj || {}
            )
          );
        }
      );


    // --------------------------------------------------
    // CLEANUP
    // --------------------------------------------------

    return () => {

      console.log(
        'Removing Firebase listeners for:',
        normalizedPin
      );


      unsubscribeSession();

      unsubscribePlayers();
    };

  }, [
    effectiveGamePin,
    dispatch
  ]);


  // ====================================================
  // RESET ANSWER STATE WHEN QUESTION CHANGES
  // ====================================================

  useEffect(() => {

    dispatch(
      resetAnswerState()
    );

  }, [
    currentQuestionIndex,
    dispatch
  ]);


  // ====================================================
  // HOST SCREEN
  // ====================================================

  const renderHostScreen =
    () => {

      switch (
        gameStatus
      ) {

        case 'LOBBY':

          return (
            <HostLobby />
          );


        case 'QUESTION':

          return (
            <HostQuestion />
          );


        case 'SHOW_ANSWER':

          return (
            <HostAnswerReveal />
          );


        case 'LEADERBOARD':

          return (
            <HostLeaderboard />
          );


        case 'PODIUM':

          return (
            <HostPodium
              setActiveMode={
                setActiveMode
              }
            />
          );


        default:

          return (
            <HostLobby />
          );
      }
    };


  // ====================================================
  // PLAYER SCREEN
  // ====================================================

  const renderPlayerScreen =
    () => {

      // Player has not joined
      if (!myPlayerId) {

        return (
          <PlayerJoin />
        );
      }


      switch (
        gameStatus
      ) {

        case 'LOBBY':

          return (
            <PlayerWaiting />
          );


        case 'QUESTION':

          return (
            <PlayerQuestion />
          );


        case 'SHOW_ANSWER':

          return (
            <PlayerFeedback />
          );


        case 'LEADERBOARD':

          return (
            <PlayerFeedback />
          );


        case 'PODIUM':

          return (
            <PlayerFeedback />
          );


        default:

          return (
            <PlayerWaiting />
          );
      }
    };


  // ====================================================
  // MAIN CONTENT
  // ====================================================

  const renderContent =
    () => {

      switch (
        activeMode
      ) {

        case 'HOST':

          return (
            renderHostScreen()
          );


        case 'PLAYER':

          return (
            renderPlayerScreen()
          );


        case 'CREATOR':

          return (
            <QuizCreator
              setActiveMode={
                setActiveMode
              }
            />
          );


        case 'LIBRARY':

          return (
            <QuizLibrary
              setActiveMode={
                setActiveMode
              }
            />
          );


        case 'DUAL':

          return (
            <DualViewSimulator
              setActiveMode={
                setActiveMode
              }
            />
          );


        case 'LANDING':

        default:

          return (
            <LandingPage
              setActiveMode={
                setActiveMode
              }
            />
          );
      }
    };


  // ====================================================
  // UI
  // ====================================================

  return (

    <div className="min-h-screen flex flex-col justify-between bg-kahoot-darker text-white">

      <Navbar
        activeMode={
          activeMode
        }

        setActiveMode={
          setActiveMode
        }
      />


      <main className="flex-1 py-6">

        {renderContent()}

      </main>


      <footer className="py-4 border-t border-white/10 text-center text-xs text-gray-300">

        <p>

          Quiz Battle — Kahoot Clone •
          Powered by{' '}

          <strong>
            React + Redux Toolkit + Firebase
          </strong>

        </p>

      </footer>

    </div>
  );
}