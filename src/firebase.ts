import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { MatchConfig, Player } from './types';
import { DEFAULT_PLAYERS, formatFullArabicDate, loadSavedMatch, saveMatchConfig } from './utils/helpers';

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Cloud Firestore using databaseId if provided
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Reference to shared single match configuration document
const SHARED_MATCH_DOC_PATH = 'match_configs';
const SHARED_MATCH_DOC_ID = 'current_wednesday_match';

export function getSharedMatchDocRef() {
  return doc(db, SHARED_MATCH_DOC_PATH, SHARED_MATCH_DOC_ID);
}

/**
 * Real-time listener for the shared match data across all users and devices.
 * If the document does not exist yet, it initializes it with default/current local data.
 */
export function subscribeToSharedMatch(
  onUpdate: (match: MatchConfig) => void,
  onError?: (error: Error) => void
) {
  const docRef = getSharedMatchDocRef();

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as Partial<MatchConfig>;
        const matchData: MatchConfig = {
          matchTitle: data.matchTitle || 'تقييمات مباراة الأربعاء',
          matchDate: data.matchDate || formatFullArabicDate(),
          players: Array.isArray(data.players)
            ? data.players.map((p: Player) => ({
                ...p,
                ratings: Array.isArray(p.ratings) ? p.ratings : [],
                history: Array.isArray(p.history) ? p.history : [],
                comments: Array.isArray(p.comments) ? p.comments : [],
              }))
            : DEFAULT_PLAYERS,
        };
        // Also keep local cache fresh
        saveMatchConfig(matchData);
        onUpdate(matchData);
      } else {
        // Document does not exist yet, seed initial match
        const initial = loadSavedMatch();
        setDoc(docRef, initial).catch((err) => {
          console.warn('Initial seeding of match data failed, falling back to local:', err);
        });
        onUpdate(initial);
      }
    },
    (error) => {
      console.error('Firestore subscription error:', error);
      if (onError) onError(error);
    }
  );
}

/**
 * Save updated match config directly to Firestore so all users see it immediately.
 */
export async function updateSharedMatch(newConfig: MatchConfig): Promise<void> {
  // Update local cache immediately for zero-lag UI
  saveMatchConfig(newConfig);

  const docRef = getSharedMatchDocRef();
  try {
    await setDoc(docRef, newConfig, { merge: true });
  } catch (err) {
    console.error('Failed to update shared match config in Firestore:', err);
    throw err;
  }
}
