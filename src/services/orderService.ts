// src/services/orderService.ts
import {
  collection,
  doc,
  setDoc,
  addDoc,
  serverTimestamp,
  runTransaction,
  writeBatch,
  Transaction,
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
    const productRefsAndData: { ref: any, data: Product }[] = [];

    // 1. READ PHASE: Perform all reads first.
    for (const item of data.items) {
      const productRef = doc(db, 'products', item.itemId);
      const productDoc = await transaction.get(productRef);
      if (!productDoc.exists()) {
        throw new Error(`Producto con ID ${item.itemId} no encontrado.`);
      }
      const productData = productDoc.data() as Product;
      
      // Stock check for non-service products
      if (productData.productType !== 'Servicios') {
        if (productData.stock < item.quantity) {
          throw new Error(`Stock insuficiente para ${productData.name}. Disponible: ${productData.stock}, solicitado: ${item.quantity}.`);
        }
      }
      productRefsAndData.push({ ref: productRef, data: productData });
    }
    
    // If order is completed, read the user for loyalty points.
    if (data.status === 'completed' && !data.pointsAwarded) {
        const customerId = data.userId;
        if(customerId) {
            const userRef = doc(db, 'users', customerId);
            // This get is safe as it's still in the read phase.
            await transaction.get(userRef);
        }
    }

    // --- WRITE PHASE: All reads are done, now we can write. ---

    // 2. Save the order
    let finalOrderId = orderId;
    if (orderId) {
      const orderRef = doc(db, 'orders', orderId);
      transaction.set(orderRef, data, { merge: true });
    } else {
      const newOrderData = { ...data, createdAt: serverTimestamp(), pointsAwarded: false };
      const newOrderRef = doc(collection(db, 'orders'));
      transaction.set(newOrderRef, newOrderData);
      finalOrderId = newOrderRef.id;
    }

    // 3. Update stock for all items
    for (const item of data.items) {
      const productInfo = productRefsAndData.find(p => p.data.id === item.itemId || p.ref.id === item.itemId);
      if (productInfo && productInfo.data.productType !== 'Servicios') {
        const newStock = productInfo.data.stock - item.quantity;
        transaction.update(productInfo.ref, { stock: newStock });
      }
    }

    // 4. Award points if the order is completed
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

async function awardPoints(transaction: Transaction, order: Order) {
    const customerId = order.userId;
    if (customerId) {
        const userRef = doc(db, 'users', customerId);
        // We get the user doc again here because we can't pass it from the outer scope
        // This read is safe because it's followed only by a write on the same doc.
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
