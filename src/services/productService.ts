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
  WriteBatch,
  writeBatch,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase/config';
import type { Product, Category, Theme, Subcategory } from '@/types/firestore';

// Omit fields that are auto-generated or handled by the backend
type ProductData = Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'rating'>;
type CategoryData = Omit<Category, 'id'>;
type SubcategoryData = Omit<Subcategory, 'id'>;
type ThemeData = Omit<Theme, 'id'>;

export async function uploadImage(file: File, path: string): Promise<string> {
  const storageRef = ref(storage, `${path}/${Date.now()}-${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
}

export async function saveProduct(
  productId: string | undefined,
  data: Partial<ProductData>
) {
  // Clean up data before sending to Firestore
  const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
    // Remove keys with undefined, null, or empty string values, except for description
    if (value !== undefined && value !== null && (value !== '' || key === 'description')) {
      (acc as any)[key] = value;
    }
    return acc;
  }, {} as Partial<ProductData>);

  if (productId) {
    // Update existing product
    const productRef = doc(db, 'products', productId);
    await setDoc(productRef, {
      ...cleanData,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return productId;
  } else {
    // Create new product
    const newProductData = {
      ...cleanData,
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

// --- Subcategory Functions ---

export async function addSubcategory(data: SubcategoryData): Promise<string> {
  // Check if subcategory already exists for this category to avoid duplicates
  const q = query(collection(db, 'subcategories'), where("name", "==", data.name), where("categoryId", "==", data.categoryId));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    // Return existing subcategory ID
    return querySnapshot.docs[0].id;
  }
  // Add new subcategory
  const newDocRef = await addDoc(collection(db, 'subcategories'), data);
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
