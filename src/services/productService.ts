// src/services/productService.ts
import {
  collection,
  doc,
  setDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Product } from '@/types/firestore';

// Omit fields that are auto-generated or handled by the backend
type ProductData = Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'rating'>;

export async function saveProduct(
  productId: string | undefined,
  data: ProductData
) {
  const productData = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  if (productId) {
    // Actualizar producto existente
    const productRef = doc(db, 'products', productId);
    await setDoc(productRef, productData, { merge: true });
    return productRef.id;
  } else {
    // Crear nuevo producto
    const newProductData = {
      ...productData,
      createdAt: serverTimestamp(),
      rating: Math.floor(Math.random() * (50 - 40) + 40) / 10, // Default random rating 4.0-5.0
    };
    const productsCollection = collection(db, 'products');
    const newDocRef = await addDoc(productsCollection, newProductData);
    return newDocRef.id;
  }
}
