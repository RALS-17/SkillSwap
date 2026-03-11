import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// User needs to replace this with their actual config later
const firebaseConfig = {
  apiKey: "AIzaSyAmsZjRZcUkGdZtSiE6iJGZfonnENGEIJU",
  authDomain: "skillswap-408e5.firebaseapp.com",
  projectId: "skillswap-408e5",
  storageBucket: "skillswap-408e5.firebasestorage.app",
  messagingSenderId: "800786359825",
  appId: "1:800786359825:web:1cdbeeed877c0723ea73b0",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
