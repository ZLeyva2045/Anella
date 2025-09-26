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
  deleteDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase/config';
import type { Product, Category, Subcategory } from '@/types/firestore';

// Omit fields that are auto-generated or handled by the backend
type ProductData = Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'rating'>;
type CategoryData = Omit<Category, 'id'>;
type SubcategoryData = Omit<Subcategory, 'id'>;

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
    
    // Check for dependencies in 'lotes'
    const lotesRef = collection(db, 'lotes');
    const lotesQuery = query(lotesRef, where('productoId', 'in', productIds));
    const lotesSnapshot = await getDocs(lotesQuery);

    if (!lotesSnapshot.empty) {
        // If there are dependent lots, we should not delete the product.
        // Or handle it differently (e.g., archive the product).
        // For now, we will prevent deletion.
        const productNamesInUse = new Set<string>();
        const productsInUse = await getDocs(query(collection(db, 'products'), where('id', 'in', productIds)));
        productsInUse.forEach(p => productNamesInUse.add(p.data().name));

        throw new Error(`No se pueden eliminar productos que tienen lotes de compra asociados. Productos en uso: ${Array.from(productNamesInUse).join(', ')}`);
    }

    productIds.forEach(id => {
        const docRef = doc(db, 'products', id);
        batch.delete(docRef);
    });
    await batch.commit();
}


export async function updateProductsInBatch(productIds: string[], data: Partial<Product>): Promise<void> {
    const batch = writeBatch(db);
    const updateData = {
        ...data,
        updatedAt: serverTimestamp(),
    };
    productIds.forEach(id => {
        const docRef = doc(db, 'products', id);
        batch.update(docRef, updateData);
    });
    await batch.commit();
}

export async function importProducts(products: ProductData[]): Promise<void> {
    const batch = writeBatch(db);
    const productsCollection = collection(db, 'products');

    for (const productData of products) {
        const newProductRef = doc(productsCollection);
        const newProduct = {
            ...productData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            rating: Math.floor(Math.random() * (50 - 40) + 40) / 10,
        };
        batch.set(newProductRef, newProduct);
    }

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
// Moved to a dedicated themeService.ts
