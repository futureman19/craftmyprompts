import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// 1. User's specific configuration (for StackBlitz/Production)
const userFirebaseConfig = {
  apiKey: "AIzaSyDPA3ub150UZqnf2tltnKU9Mh5HIJvw74I",
  authDomain: "craft-my-prompt-app.firebaseapp.com",
  projectId: "craft-my-prompt-app",
  storageBucket: "craft-my-prompt-app.firebasestorage.app",
  messagingSenderId: "222602005796",
  appId: "1:222602005796:web:4100bd0dbd8b17883637b1"
};

// 2. Environment Selection Logic
const firebaseConfig = (typeof __firebase_config !== 'undefined') 
  ? JSON.parse(__firebase_config) 
  : userFirebaseConfig;

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const APP_ID = (typeof __app_id !== 'undefined') ? __app_id : "craft-my-prompt-app";