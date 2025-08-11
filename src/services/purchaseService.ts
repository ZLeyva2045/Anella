// src/services/purchaseService.ts
import {
  collection,
  doc,
  writeBatch,
  serverTimestamp,
  runTransaction,
  increment,
  DocumentReference,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { LoteItem, Product } from '@/types/firestore';

/**
 * Saves multiple purchase lot items in a single transaction.
 * For each item, it creates a new document in the 'lotes' collection
 * and updates the stock and cost price of the corresponding product
 * in the 'products' collection.
 * @param loteItems - An array of LoteItem objects to be saved.
 */
export async function savePurchaseLote(loteItems: LoteItem[]): Promise<void> {
  if (!loteItems || loteItems.length === 0) {
    throw new Error('La lista de items del lote no puede estar vacía.');
  }

  await runTransaction(db, async (transaction) => {
    const productRefs = new Map<string, DocumentReference>();
    const productDataMap = new Map<string, Product>();

    // --- READ PHASE ---
    // First, gather all product documents that need to be read.
    for (const item of loteItems) {
      const productRef = doc(db, 'products', item.productoId);
      productRefs.set(item.productoId, productRef);
    }
    
    // Then, execute all reads.
    for (const [productId, productRef] of productRefs.entries()) {
      const productDoc = await transaction.get(productRef);
      if (!productDoc.exists()) {
        throw new Error(`El producto con ID ${productId} no fue encontrado.`);
      }
      productDataMap.set(productId, productDoc.data() as Product);
    }

    // --- WRITE PHASE ---
    // All reads are done, now we can perform writes.
    for (const item of loteItems) {
      // 1. Create a new document in the 'lotes' collection
      const newLoteRef = doc(collection(db, 'lotes'));
      transaction.set(newLoteRef, item);

      // 2. Update the corresponding product in the 'products' collection
      const productRef = productRefs.get(item.productoId);
      
      if (productRef) {
          const updatedData: Partial<Product> = {
              stock: increment(item.cantidadInicial), // Use cantidadInicial as it's a new lot
              costPrice: item.costoUnitarioCompra, // We'll just use the latest cost price for simplicity
              updatedAt: serverTimestamp()
          } as any; // Cast because serverTimestamp is not a standard field

          transaction.update(productRef, updatedData);
      }
    }
  });
}
