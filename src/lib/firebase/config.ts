// src/lib/firebase/config.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDebUCPTSwiyTdPhpBbe0fwAcMa_7wGnlA",
  authDomain: "anella-boutique.firebaseapp.com",
  projectId: "anella-boutique",
  storageBucket: "anella-boutique.firebasestorage.app",
  messagingSenderId: "762665326989",
  appId: "1:762665326989:web:043807ca3ec66d536ac5c4",
  measurementId: "G-YM6540GV18"
};

// Inicializar Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
