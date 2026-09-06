import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  onSnapshot, 
  collection, 
  getDocs,
  deleteDoc
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ||"AIzaSyCBLYywuVkrkPGMIWI0UReVxDbKQrnkjV4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "quiz-battle-7538e.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "quiz-battle-7538e",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "quiz-battle-7538e.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ||"980118535845",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:980118535845:web:99338394d100a8f136d74c"
};

export const isFirebaseConfigured = Boolean(
  import.meta.env.VITE_FIREBASE_API_KEY && 
  import.meta.env.VITE_FIREBASE_PROJECT_ID
);

let app = null;
let db = null;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (error) {
  console.warn("Firebase initialization warning (Using multi-tab fallback mode):", error.message);
}

export { db };

// Fallback Real-time Multi-Tab Broadcaster for Instant Local Play
const channel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('quiz_battle_events') : null;
const FALLBACK_KEY_PREFIX = 'qb_session_';

export const broadcastLocalEvent = (eventType, payload) => {
  const eventData = { type: eventType, payload, timestamp: Date.now() };
  if (channel) {
    channel.postMessage(eventData);
  }
  try {
    localStorage.setItem('qb_last_event', JSON.stringify(eventData));
  } catch (e) {}
};

// Firestore CRUD Helpers for Saved Quizzes
export const saveQuizToFirestore = async (quizData) => {
  if (isFirebaseConfigured && db) {
    try {
      const quizRef = doc(db, 'quizzes', quizData.id);
      await setDoc(quizRef, quizData, { merge: true });
    } catch (e) {
      console.error("Firestore saveQuiz error:", e);
      throw e;
    }
  }
};

export const fetchQuizzesFromFirestore = async () => {
  if (isFirebaseConfigured && db) {
    try {
      const querySnapshot = await getDocs(collection(db, 'quizzes'));
      const quizzes = [];
      querySnapshot.forEach((docSnap) => {
        quizzes.push(docSnap.data());
      });
      return quizzes;
    } catch (e) {
      console.error("Firestore fetchQuizzes error:", e);
    }
  }
  return [];
};

export const deleteQuizFromFirestore = async (quizId) => {
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'quizzes', quizId));
    } catch (e) {
      console.error("Firestore deleteQuiz error:", e);
      throw e;
    }
  }
};

// Game Session Sync Helpers
export const saveGameSessionToFirebase = async (gamePin, sessionData) => {
  if (isFirebaseConfigured && db) {
    try {
      const gameRef = doc(db, 'games', gamePin);
      await setDoc(gameRef, sessionData, { merge: true });
    } catch (e) {
      console.error("Firestore saveGameSession error:", e);
      throw e;
    }
  }
  localStorage.setItem(`${FALLBACK_KEY_PREFIX}${gamePin}`, JSON.stringify(sessionData));
  broadcastLocalEvent('GAME_SESSION_UPDATED', { gamePin, sessionData });
};

export const updateGameSessionInFirebase = async (gamePin, updateFields) => {
  if (isFirebaseConfigured && db) {
    try {
      const gameRef = doc(db, 'games', gamePin);
      await updateDoc(gameRef, updateFields);
    } catch (e) {
      console.error("Firestore updateGameSession error:", e);
      throw e;
    }
  }
  const existing = localStorage.getItem(`${FALLBACK_KEY_PREFIX}${gamePin}`);
  if (existing) {
    const updated = { ...JSON.parse(existing), ...updateFields };
    localStorage.setItem(`${FALLBACK_KEY_PREFIX}${gamePin}`, JSON.stringify(updated));
    broadcastLocalEvent('GAME_SESSION_UPDATED', { gamePin, sessionData: updated });
  }
};

export const savePlayerToFirebase = async (gamePin, player) => {
  if (isFirebaseConfigured && db) {
    try {
      const playerRef = doc(db, `games/${gamePin}/players`, player.id);
      await setDoc(playerRef, player, { merge: true });
    } catch (e) {
      console.error("Firestore savePlayer error:", e);
      throw e;
    }
  }
  const key = `qb_players_${gamePin}`;
  const existingRaw = localStorage.getItem(key);
  const players = existingRaw ? JSON.parse(existingRaw) : {};
  players[player.id] = { ...players[player.id], ...player };
  localStorage.setItem(key, JSON.stringify(players));
  broadcastLocalEvent('PLAYER_JOINED', { gamePin, player, players });
};

// Detailed Answer Response Logging in Firebase
// Stores separate response documents: games/{gamePin}/responses/q{questionIndex}_{playerId}
export const savePlayerResponseToFirebase = async (gamePin, responseData) => {
  const responseId = `q${responseData.questionIndex}_${responseData.playerId}`;
  const payload = {
    playerId: responseData.playerId,
    questionIndex: responseData.questionIndex,
    optionId: responseData.optionId, // 0, 1, 2, 3
    isCorrect: Boolean(responseData.isCorrect),
    timeTakenMs: Number(responseData.timeTakenMs || 0),
    pointsEarned: Number(responseData.pointsEarned || 0),
    gamePin,
    timestamp: Date.now()
  };

  if (isFirebaseConfigured && db) {
    try {
      const responseRef = doc(db, `games/${gamePin}/responses`, responseId);
      await setDoc(responseRef, payload, { merge: true });
    } catch (e) {
      console.error("Firestore savePlayerResponse error:", e);
      throw e;
    }
  }

  // Multi-tab broadcast
  broadcastLocalEvent('PLAYER_ANSWERED', { gamePin, responseData: payload });
};

export const subscribeToGameSession = (gamePin, callback) => {
  let unsubscribeFirestore = () => {};

  if (isFirebaseConfigured && db) {
    try {
      const gameRef = doc(db, 'games', gamePin);
      unsubscribeFirestore = onSnapshot(gameRef, (snapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.data());
        }
      }, (err) => console.warn("Firestore snapshot error:", err));
    } catch (e) {
      console.warn("Firestore listener error:", e);
    }
  }

  const handleBroadcast = (event) => {
    if (event.data?.payload?.gamePin === gamePin && event.data?.payload?.sessionData) {
      callback(event.data.payload.sessionData);
    }
  };

  if (channel) {
    channel.addEventListener('message', handleBroadcast);
  }

  const localSession = localStorage.getItem(`${FALLBACK_KEY_PREFIX}${gamePin}`);
  if (localSession) {
    try {
      callback(JSON.parse(localSession));
    } catch (e) {}
  }

  return () => {
    unsubscribeFirestore();
    if (channel) {
      channel.removeEventListener('message', handleBroadcast);
    }
  };
};

export const subscribeToPlayers = (gamePin, callback) => {
  let unsubscribeFirestore = () => {};

  if (isFirebaseConfigured && db) {
    try {
      const playersCol = collection(db, `games/${gamePin}/players`);
      unsubscribeFirestore = onSnapshot(playersCol, (snapshot) => {
        const playersObj = {};
        snapshot.forEach((docSnap) => {
          playersObj[docSnap.id] = docSnap.data();
        });
        callback(playersObj);
      }, (err) => console.warn("Firestore players listener error:", err));
    } catch (e) {
      console.warn("Firestore players error:", e);
    }
  }

  const handleBroadcast = (event) => {
    if (event.data?.payload?.gamePin === gamePin && event.data?.payload?.players) {
      callback(event.data.payload.players);
    }
  };

  if (channel) {
    channel.addEventListener('message', handleBroadcast);
  }

  const key = `qb_players_${gamePin}`;
  const existingRaw = localStorage.getItem(key);
  if (existingRaw) {
    try {
      callback(JSON.parse(existingRaw));
    } catch (e) {}
  }

  return () => {
    unsubscribeFirestore();
    if (channel) {
      channel.removeEventListener('message', handleBroadcast);
    }
  };
};