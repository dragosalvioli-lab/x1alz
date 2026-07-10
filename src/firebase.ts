import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, updateDoc, doc, onSnapshot, query, where, setDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, signOut } from 'firebase/auth';

const firebaseConfig = {
  projectId: "gen-lang-client-0562218046",
  appId: "1:687383719974:web:e6a3cf5e24ea3966ca36e7",
  apiKey: "AIzaSyAFazilT63NYaWGYZ1MiRwWEpe4bHdajpI",
  authDomain: "gen-lang-client-0562218046.firebaseapp.com",
  storageBucket: "gen-lang-client-0562218046.firebasestorage.app",
  messagingSenderId: "687383719974",
  measurementId: ""
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, 'ai-studio-x1alz-d62556a6-1287-4c0b-aeaf-a69402e26df5');
export const auth = getAuth(app);
