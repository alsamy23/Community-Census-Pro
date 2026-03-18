import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_FIRESTORE_DB_ID
};

export { firebaseConfig };

// Validate config before initialization
if (!firebaseConfig.projectId || firebaseConfig.projectId.includes('TODO')) {
  console.warn("Firebase Project ID is missing or placeholder. The app will run in Demo Mode (Local Storage) until configuration is provided.");
}

const app = firebaseConfig.projectId && !firebaseConfig.projectId.includes('TODO') 
  ? initializeApp(firebaseConfig) 
  : null;

export const db = app ? getFirestore(app, firebaseConfig.firestoreDatabaseId) : null;
export const auth = app ? getAuth(app) : null;
export const analytics = app && typeof window !== 'undefined' && firebaseConfig.measurementId ? getAnalytics(app) : null;

// Connection test
if (db) {
  import('firebase/firestore').then(({ doc, getDocFromCache, getDocFromServer }) => {
    const testConn = async () => {
      try {
        // Try to fetch a non-existent doc just to check connectivity/permissions
        await getDocFromServer(doc(db, '_connection_test', 'ping'));
        console.log("Firestore connection verified.");
      } catch (error: any) {
        if (error.message?.includes('offline')) {
          console.error("Firestore is offline. Check your configuration.");
        }
      }
    };
    testConn();
  });
}
