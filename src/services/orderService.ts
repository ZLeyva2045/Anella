// src/services/orderService.ts
import {
  collection,
  doc,
  setDoc,
  addDoc,
  serverTimestamp,
  runTransaction,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Order, User, Product } from '@/types/firestore';

// Omit fields that are auto-generated or handled by the backend
type OrderData = Omit<Order, 'id' | 'createdAt'>;

export async function saveOrder(
  orderId: string | undefined,
  data: OrderData
) {
  return runTransaction(db, async (transaction) => {
    // 1. Check stock for all items in the order
    for (const item of data.items) {
      const productRef = doc(db, 'products', item.itemId);
      const productDoc = await transaction.get(productRef);
      if (!productDoc.exists()) {
        throw new Error(`Producto con ID ${item.itemId} no encontrado.`);
      }
      const productData = productDoc.data() as Product;
      
      // Stock check only applies to non-service products
      if (productData.productType !== 'Servicios') {
        if (productData.stock < item.quantity) {
          throw new Error(`Stock insuficiente para ${productData.name}. Disponible: ${productData.stock}, solicitado: ${item.quantity}.`);
        }
      }
    }

    // 2. If stock is sufficient, proceed with saving the order and updating stock
    let finalOrderId = orderId;
    if (orderId) {
      // Update existing order
      const orderRef = doc(db, 'orders', orderId);
      transaction.set(orderRef, data, { merge: true });
    } else {
      // Create new order
      const newOrderData = {
        ...data,
        createdAt: serverTimestamp(),
        pointsAwarded: false,
      };
      const newOrderRef = doc(collection(db, 'orders'));
      transaction.set(newOrderRef, newOrderData);
      finalOrderId = newOrderRef.id;
    }

    // 3. Update stock for all items that are not services
    for (const item of data.items) {
      const productRef = doc(db, 'products', item.itemId);
      const productDoc = await transaction.get(productRef); 
      const productData = productDoc.data() as Product;

      if (productData.productType !== 'Servicios') {
        const currentStock = productData.stock || 0;
        const newStock = currentStock - item.quantity;
        transaction.update(productRef, { stock: newStock });
      }
    }

    // If order is completed, award points
    if (data.status === 'completed' && !data.pointsAwarded) {
        await awardPoints(transaction, data as Order);
        if (finalOrderId) {
            const orderRef = doc(db, 'orders', finalOrderId);
            transaction.update(orderRef, { pointsAwarded: true });
        }
    }

    return finalOrderId;
  });
}


/**
 * Updates an order's status and, if the status is 'completed',
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

    // Solo se otorgan puntos si el pedido se marca como completado
    // y si no se han otorgado puntos previamente por este pedido.
    if (status === 'completed' && !order.pointsAwarded) {
      await awardPoints(transaction, order);
      
      // Marcar que los puntos ya fueron otorgados para este pedido
      transaction.update(orderRef, { status, pointsAwarded: true });

    } else {
        // Si no es para completar, solo actualiza el estado
        transaction.update(orderRef, { status });
    }
  });
}

async function awardPoints(transaction: any, order: Order) {
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
}
