// src/services/productService.ts
import {
  collection,
  doc,
  setDoc,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase/config';
import type { Product, Category, Theme } from '@/types/firestore';

// Omit fields that are auto-generated or handled by the backend
type ProductData = Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'rating'>;
type CategoryData = Omit<Category, 'id'>;
type ThemeData = Omit<Theme, 'id'>;

export async function uploadImage(file: File, path: string): Promise<string> {
  const storageRef = ref(storage, `${path}/${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
}

export async function saveProduct(
  productId: string | undefined,
  data: ProductData
) {
  if (productId) {
    // Actualizar producto existente
    const productRef = doc(db, 'products', productId);
    await setDoc(productRef, {
      ...data,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return productId;
  } else {
    // Crear nuevo producto
    const newProductData = {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      rating: Math.floor(Math.random() * (50 - 40) + 40) / 10, // Default random rating 4.0-5.0
    };
    const productsCollection = collection(db, 'products');
    const newDocRef = await addDoc(productsCollection, newProductData);
    return newDocRef.id;
  }
}

// --- Category Functions ---

export async function getCategories(): Promise<Category[]> {
  const categoriesCollection = collection(db, 'categories');
  const snapshot = await getDocs(categoriesCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
}

export async function addCategory(data: CategoryData): Promise<string> {
  // Check if category already exists to avoid duplicates
  const q = query(collection(db, 'categories'), where("name", "==", data.name));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    // Return existing category ID
    return querySnapshot.docs[0].id;
  }
  // Add new category
  const newDocRef = await addDoc(collection(db, 'categories'), data);
  return newDocRef.id;
}


// --- Theme Functions ---

export async function getThemes(): Promise<Theme[]> {
  const themesCollection = collection(db, 'themes');
  const snapshot = await getDocs(themesCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Theme));
}

export async function addTheme(data: ThemeData): Promise<string> {
   // Check if theme already exists
  const q = query(collection(db, 'themes'), where("name", "==", data.name));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].id;
  }
  // Add new theme
  const newDocRef = await addDoc(collection(db, 'themes'), data);
  return newDocRef.id;
}
