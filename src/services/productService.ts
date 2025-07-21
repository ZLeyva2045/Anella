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

export async function deleteProducts(productIds: string[]): Promise<void> {
    const batch = writeBatch(db);
    productIds.forEach(id => {
        const docRef = doc(db, 'products', id);
        batch.delete(docRef);
    });
    await batch.commit();
}


// --- Category Functions ---

export async function getCategories(): Promise<Category[]> {
  const categoriesCollection = collection(db, 'categories');
  const snapshot = await getDocs(categoriesCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Category));
}

export async function addCategory(data: CategoryData): Promise<string> {
  const q = query(collection(db, 'categories'), where("name", "==", data.name));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].id;
  }
  const newDocRef = await addDoc(collection(db, 'categories'), data);
  return newDocRef.id;
}

// --- Subcategory Functions ---

export async function addSubcategory(categoryId: string, data: SubcategoryData): Promise<string> {
  const subcategoriesRef = collection(db, 'categories', categoryId, 'subcategories');
  const q = query(subcategoriesRef, where("name", "==", data.name));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].id;
  }
  const newDocRef = await addDoc(subcategoriesRef, data);
  return newDocRef.id;
}

// --- Theme Functions ---

export async function getThemes(): Promise<Theme[]> {
  const themesCollection = collection(db, 'themes');
  const snapshot = await getDocs(themesCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Theme));
}

export async function addTheme(data: ThemeData): Promise<string> {
  const q = query(collection(db, 'themes'), where("name", "==", data.name));
  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].id;
  }
  const newDocRef = await addDoc(collection(db, 'themes'), data);
  return newDocRef.id;
}
