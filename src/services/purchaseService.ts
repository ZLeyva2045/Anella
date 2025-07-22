// src/services/purchaseService.ts
import {
  collection,
  doc,
  writeBatch,
  serverTimestamp,
  runTransaction,
  increment
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
    for (const item of loteItems) {
      // 1. Create a new document in the 'lotes' collection
      const newLoteRef = doc(collection(db, 'lotes'));
      transaction.set(newLoteRef, item);

      // 2. Update the corresponding product in the 'products' collection
      const productRef = doc(db, 'products', item.productoId);
      const productDoc = await transaction.get(productRef);

      if (!productDoc.exists()) {
        throw new Error(`El producto con ID ${item.productoId} no fue encontrado.`);
      }
      
      const productData = productDoc.data() as Product;

      // Increment stock and update cost price
      const updatedData: Partial<Product> = {
          stock: increment(item.cantidadActual),
          costPrice: item.costoUnitarioCompra, // We'll just use the latest cost price for simplicity
          updatedAt: serverTimestamp()
      }

      transaction.update(productRef, updatedData);
    }
  });
}
