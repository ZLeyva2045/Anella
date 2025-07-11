// src/hooks/useAuth.tsx
'use client';

import React, { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { 
  type User as FirebaseUser,
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  type UserCredential
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import type { User as FirestoreUser } from '@/types/firestore';

interface AuthContextType {
  user: FirebaseUser | null;
  firestoreUser: FirestoreUser | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<UserCredential>;
  signUpWithEmail: (email: string, password: string) => Promise<UserCredential>;
  signInWithGoogle: () => Promise<UserCredential>;
  signOut: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  getUserRole: (userId: string) => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function setCookie(name: string, value: string, days: number) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function eraseCookie(name: string) {
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [firestoreUser, setFirestoreUser] = useState<FirestoreUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        setCookie('isLoggedIn', 'true', 7);
        // Fetch user data from Firestore
        await getUserRole(user.uid);
      } else {
        eraseCookie('isLoggedIn');
        setFirestoreUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getUserRole = async (userId: string) => {
    const userDocRef = doc(db, "users", userId);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const userData = { id: userDoc.id, ...userDoc.data() } as FirestoreUser;
      setFirestoreUser(userData);
      return userData.role || null;
    }
    setFirestoreUser(null);
    return null;
  };

  const signInWithEmail = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    if(userCredential.user) {
        setCookie('isLoggedIn', 'true', 7);
    }
    return userCredential;
  };

  const signUpWithEmail = (email: string, password: string) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;
    if (user) {
        setCookie('isLoggedIn', 'true', 7);
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        // If user doesn't exist in Firestore, create them
        if (!userDoc.exists()) {
            const newUser: FirestoreUser = {
                id: user.uid,
                email: user.email || '',
                name: user.displayName || '',
                phone: user.phoneNumber || '',
                address: '',
                orders: [],
                role: 'customer',
                photoURL: user.photoURL || '',
            };
            await setDoc(userDocRef, newUser);
        }
    }
    return userCredential;
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    eraseCookie('isLoggedIn');
    setFirestoreUser(null);
  };
  
  const sendPasswordResetEmail = (email: string) => {
    return firebaseSendPasswordResetEmail(auth, email);
  };

  const value = {
    user,
    firestoreUser,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
    sendPasswordResetEmail,
    getUserRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
