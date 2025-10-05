// Firebase configuration and initialization
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics, Analytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAjA4_UKHasPhGuxy5QUtmLIlbj1ecqXyk",
  authDomain: "oversight-2ff8f.firebaseapp.com",
  databaseURL: "https://oversight-2ff8f-default-rtdb.firebaseio.com",
  projectId: "oversight-2ff8f",
  storageBucket: "oversight-2ff8f.firebasestorage.app",
  messagingSenderId: "165570876233",
  appId: "1:165570876233:web:da26dd144b87277c5f0098",
  measurementId: "G-CVHGER7WQ0"
};

// Initialize Firebase (singleton pattern to avoid multiple initializations)
let app: FirebaseApp;
let db: Firestore;
let analytics: Analytics | null = null;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  
  // Initialize analytics only on client side
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }
} else {
  app = getApps()[0];
  db = getFirestore(app);
  
  if (typeof window !== 'undefined') {
    analytics = getAnalytics(app);
  }
}

export { app, db, analytics };
export default app;
