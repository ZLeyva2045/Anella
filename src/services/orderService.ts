// src/services/orderService.ts
import {
  collection,
  doc,
  setDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Order } from '@/types/firestore';

// Omit fields that are auto-generated or handled by the backend
type OrderData = Omit<Order, 'id' | 'createdAt'>;

export async function saveOrder(
  orderId: string | undefined,
  data: OrderData
) {
  if (orderId) {
    // Actualizar pedido existente (podría ser útil para cambiar estado, etc.)
    const orderRef = doc(db, 'orders', orderId);
    await setDoc(orderRef, {
      ...data,
      // No actualizamos createdAt, pero sí updatedAt si lo tuviéramos
    }, { merge: true });
    return orderId;
  } else {
    // Crear nuevo pedido
    const newOrderData = {
      ...data,
      createdAt: serverTimestamp(),
    };
    const ordersCollection = collection(db, 'orders');
    const newDocRef = await addDoc(ordersCollection, newOrderData);
    return newDocRef.id;
  }
}
