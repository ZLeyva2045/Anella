// src/services/settingsService.ts
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase/config';

const HERO_IMAGE_SETTING_ID = 'heroImage';
const SETTINGS_COLLECTION = 'app_settings';

/**
 * Retrieves the URL of the current hero image from Firestore.
 * @returns The URL of the hero image, or a default placeholder.
 */
export async function getHeroImage(): Promise<string> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, HERO_IMAGE_SETTING_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists() && docSnap.data()?.url) {
      return docSnap.data().url;
    }
    // Return a default image if not set
    return "https://lh3.googleusercontent.com/aida-public/AB6AXuDDF6Km3T2PJxSEDAO7qxQBJLqLsl_GUnkhleGVMyMPnQK9HXSG7caWO-df-Y3fRgPt4y3qctsdeLLCj86y5cdK1s5GJrdbwP5YUl3CMQZVrFw4961e_-T8T-47zGIMXgWMD1-XWXmrumZhabSFHWzgAF-QZSSEfALRGhBsqL-g2Prgw-2_LXZVWQaDMsLAw-63x0IPU74h51ee9HU3Q0EJi8UmpNTs58_Bj8upj0lEa2KK9vpmJeDXAYSE0349Rs1whHLhRKZG6T8";
  } catch (error) {
    console.error("Error fetching hero image:", error);
    return "https://placehold.co/1200x520/FFF0F5/FF69B4?text=Anella";
  }
}

/**
 * Uploads a new hero image to Firebase Storage and updates the URL in Firestore.
 * @param imageFile - The image file to upload.
 * @returns The new public URL of the uploaded image.
 */
export async function updateHeroImage(imageFile: File): Promise<string> {
  try {
    // 1. Upload image to Firebase Storage
    const storageRef = ref(storage, `app_settings/hero/${Date.now()}-${imageFile.name}`);
    const snapshot = await uploadBytes(storageRef, imageFile);
    const downloadURL = await getDownloadURL(snapshot.ref);

    // 2. Update the URL in Firestore
    const docRef = doc(db, SETTINGS_COLLECTION, HERO_IMAGE_SETTING_ID);
    await setDoc(docRef, { url: downloadURL, updatedAt: new Date() });

    return downloadURL;
  } catch (error) {
    console.error("Error updating hero image:", error);
    throw new Error("No se pudo actualizar la imagen de portada.");
  }
}
