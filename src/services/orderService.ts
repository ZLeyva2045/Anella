// src/services/orderService.ts
import {
  collection,
  doc,
  setDoc,
  addDoc,
  serverTimestamp,
  runTransaction,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Order, User } from '@/types/firestore';

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

/**
 * Updates an order's status and, if the status is 'delivered',
 * adds loyalty points to the customer.
 * @param orderId The ID of the order to update.
 * @param status The new status for the order.
 */
export async function updateOrderStatus(orderId: string, status: Order['status']) {
  const orderRef = doc(db, 'orders', orderId);

  await runTransaction(db, async (transaction) => {
    const orderDoc = await transaction.get(orderRef);
    if (!orderDoc.exists()) {
      throw "El pedido no existe.";
    }

    const order = orderDoc.data() as Order;

    // Solo se otorgan puntos si el pedido se marca como entregado
    // y si no se han otorgado puntos previamente por este pedido.
    if (status === 'delivered' && !order.pointsAwarded) {
      const customerId = order.userId;
      if (customerId) {
        const userRef = doc(db, 'users', customerId);
        const userDoc = await transaction.get(userRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          const currentPoints = userData.loyaltyPoints || 0;
          // 1 punto por cada Sol gastado
          const newPoints = Math.floor(order.totalAmount);
          transaction.update(userRef, { loyaltyPoints: currentPoints + newPoints });
        }
      }
      
      // Marcar que los puntos ya fueron otorgados para este pedido
      transaction.update(orderRef, { status, pointsAwarded: true });

    } else {
        // Si no es para entrega, solo actualiza el estado
        transaction.update(orderRef, { status });
    }
  });
}
