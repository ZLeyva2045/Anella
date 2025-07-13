// src/services/giftService.ts
import {
  collection,
  doc,
  setDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Gift } from '@/types/firestore';

type GiftData = Omit<Gift, 'id' | 'createdAt' | 'updatedAt' | 'rating'>;

export async function saveGift(
  giftId: string | undefined,
  data: GiftData
) {
  if (giftId) {
    const giftRef = doc(db, 'gifts', giftId);
    await setDoc(giftRef, {
      ...data,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return giftId;
  } else {
    const newGiftData = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      rating: Math.floor(Math.random() * (50 - 40) + 40) / 10, // Default random rating 4.0-5.0
    };
    const giftsCollection = collection(db, 'gifts');
    const newDocRef = await addDoc(giftsCollection, newGiftData);
    return newDocRef.id;
  }
}
