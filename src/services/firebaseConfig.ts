import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

// Import the Firebase configuration
import firebaseConfig from '../../firebase-applet-config.json';

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
