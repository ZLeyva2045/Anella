// src/services/themeService.ts
import {
  collection,
  doc,
  setDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase/config';
import type { Theme } from '@/types/firestore';

type ThemeData = Omit<Theme, 'id'>;

export async function uploadImage(file: File, path: string): Promise<string> {
  const storageRef = ref(storage, `${path}/${Date.now()}-${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
}

export async function addTheme(data: ThemeData): Promise<string> {
  const themesCollection = collection(db, 'themes');
  const newDocRef = await addDoc(themesCollection, { ...data, createdAt: serverTimestamp() });
  return newDocRef.id;
}

export async function updateTheme(themeId: string, data: Partial<ThemeData>): Promise<void> {
  const themeRef = doc(db, 'themes', themeId);
  await setDoc(themeRef, data, { merge: true });
}
