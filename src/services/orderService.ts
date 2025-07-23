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
  getDoc,
  increment,
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
    let userRef: any;
    let customerDoc: any;

    // 1. READ PHASE: Perform all reads first.
    for (const item of data.items) {
      const productRef = doc(db, 'products', item.itemId);
      const productDoc = await transaction.get(productRef); // READ
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
    if (data.status === 'completed' && !data.pointsAwarded && data.userId) {
        userRef = doc(db, 'users', data.userId);
        customerDoc = await transaction.get(userRef); // READ
    }

    // --- WRITE PHASE: All reads are done, now we can write. ---

    // 2. Save the order
    let finalOrderId = orderId;
    const orderRef = orderId ? doc(db, 'orders', orderId) : doc(collection(db, 'orders'));
    
    if (!orderId) {
        finalOrderId = orderRef.id;
    }

    const finalOrderData = {
        ...data,
        createdAt: orderId ? undefined : serverTimestamp(), // Only set createdAt on new orders
        pointsAwarded: data.pointsAwarded || false,
    };
    
    transaction.set(orderRef, finalOrderData, { merge: true });
    
    // 3. Update stock for all items
    for (const item of data.items) {
      const productInfo = productRefsAndData.find(p => p.ref.id === item.itemId);
      if (productInfo && productInfo.data.productType !== 'Servicios') {
        const newStock = productInfo.data.stock - item.quantity;
        transaction.update(productInfo.ref, { stock: newStock });
      }
    }

    // 4. Award points if the order is completed
    if (data.status === 'completed' && !data.pointsAwarded && customerDoc?.exists()) {
        const userData = customerDoc.data() as User;
        const currentPoints = userData.loyaltyPoints || 0;
        const newPoints = Math.floor(data.totalAmount);
        transaction.update(userRef, { loyaltyPoints: currentPoints + newPoints });
        // Also update the order to reflect points have been awarded
        transaction.update(orderRef, { pointsAwarded: true });
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
    // --- READ PHASE ---
    const orderDoc = await transaction.get(orderRef);
    if (!orderDoc.exists()) {
      throw "El pedido no existe.";
    }

    const order = orderDoc.data() as Order;
    let userRef;
    let userDoc;

    // Only read the user doc if we need to award points
    if (status === 'completed' && !order.pointsAwarded && order.userId) {
        userRef = doc(db, 'users', order.userId);
        userDoc = await transaction.get(userRef);
    }
    
    // --- WRITE PHASE ---
    
    // Update the order status regardless
    transaction.update(orderRef, { status });

    // Award points if the conditions are met
    if (status === 'completed' && !order.pointsAwarded && userRef && userDoc?.exists()) {
        const userData = userDoc.data() as User;
        const currentPoints = userData.loyaltyPoints || 0;
        const newPoints = Math.floor(order.totalAmount);

        transaction.update(userRef, { loyaltyPoints: currentPoints + newPoints });
        // Mark that points have been awarded for this order
        transaction.update(orderRef, { pointsAwarded: true });
    }
  });
}
