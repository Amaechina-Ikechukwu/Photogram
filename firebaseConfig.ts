// Import the functions you need
import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your Firebase config object (from Firebase Console > Project Settings)
const firebaseConfig = {
  apiKey:process.env.EXPO_PUBLIC_API_KEY,
  authDomain:process.env.EXPO_PUBLIC_AUTH_DOMAIN,
  projectId:process.env.EXPO_PUBLIC_PROJECT_ID,
  storageBucket:process.env.EXPO_PUBLIC_STORAGE_BUCKET,
  messagingSenderId:process.env.EXPO_PUBLIC_MESSEGING_SENDER_ID,
  appId:process.env.EXPO_PUBLIC_APP_ID,
};

// Prevent re-initialization in Expo fast refresh
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Firebase services
const storage = getStorage(app);
const db = getFirestore(app);

export { app, db, storage };

