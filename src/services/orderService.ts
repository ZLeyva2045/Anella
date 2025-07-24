// src/services/orderService.ts
import {
  collection,
  doc,
  setDoc,
  addDoc,
  serverTimestamp,
  runTransaction,
  writeBatch,
  getDoc,
  arrayUnion,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Order, User, Product, PaymentDetail, FulfillmentStatus } from '@/types/firestore';

// Omit fields that are auto-generated or handled by the backend
type OrderData = Omit<Order, 'id' | 'createdAt' >;

export async function saveOrder(
  orderId: string | undefined,
  data: Partial<OrderData>
): Promise<string> {
  return runTransaction(db, async (transaction) => {
    const productRefsAndData: { ref: any; data: Product }[] = [];

    // 1. READ PHASE: Perform all reads first.
    if (data.items) {
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
    }

    // --- WRITE PHASE: All reads are done, now we can write. ---

    // 2. Save the order
    let finalOrderId: string;
    let orderRef;
    
    if (orderId) {
        finalOrderId = orderId;
        orderRef = doc(db, 'orders', orderId);
        // For updates, we just merge the new data.
        const updateData = {
          ...data,
          updatedAt: serverTimestamp(),
        };
        transaction.set(orderRef, updateData, { merge: true });
    } else {
        orderRef = doc(collection(db, 'orders'));
        finalOrderId = orderRef.id;

        // Ensure numeric fields are initialized to prevent 'undefined' errors
        const totalAmount = data.totalAmount ?? 0;
        const amountPaid = data.amountPaid ?? 0;
        const amountDue = totalAmount - amountPaid;
        
        // Determine paymentStatus based on what's passed in, or calculate it
        const paymentStatus = data.paymentStatus 
            ? data.paymentStatus 
            : amountPaid >= totalAmount ? 'paid' : (amountPaid > 0 ? 'partially-paid' : 'unpaid');

        const newOrderData: Partial<Order> = {
            ...data,
            createdAt: serverTimestamp() as Timestamp,
            fulfillmentStatus: data.fulfillmentStatus || 'pending',
            paymentStatus: paymentStatus,
            paymentDetails: data.paymentDetails || [],
            totalAmount: totalAmount,
            amountPaid: amountPaid,
            amountDue: amountDue,
            shippingCost: data.shippingCost || 0,
            pointsAwarded: false,
        };
        transaction.set(orderRef, newOrderData);
    }
    
    // 3. Update stock for all items on new order creation
    if (!orderId && data.items) {
      for (const item of data.items) {
        const productInfo = productRefsAndData.find(p => p.ref.id === item.itemId);
        if (productInfo && productInfo.data.productType !== 'Servicios') {
          const newStock = productInfo.data.stock - item.quantity;
          transaction.update(productInfo.ref, { stock: newStock });
        }
      }
    }

    return finalOrderId;
  });
}


/**
 * Updates an order's fulfillment status.
 * @param orderId The ID of the order to update.
 * @param status The new fulfillment status for the order.
 */
export async function updateFulfillmentStatus(orderId: string, status: FulfillmentStatus) {
    const orderRef = doc(db, 'orders', orderId);
    
    return runTransaction(db, async (transaction) => {
        // --- READ PHASE ---
        const orderDoc = await transaction.get(orderRef);
        if (!orderDoc.exists()) {
            throw new Error("El pedido no existe.");
        }
        const orderData = orderDoc.data() as Order;

        let userRef;
        let userDoc;

        // If completing the order, ensure it's paid and get user for points.
        if (status === 'completed') {
            if (orderData.paymentStatus !== 'paid') {
                throw new Error("El pedido debe estar completamente pagado para marcarlo como entregado.");
            }
            if (orderData.userId && !orderData.pointsAwarded) {
                userRef = doc(db, 'users', orderData.userId);
                userDoc = await transaction.get(userRef);
            }
        }
        
        // --- WRITE PHASE ---
        transaction.update(orderRef, { fulfillmentStatus: status, updatedAt: serverTimestamp() });

        // Award points if conditions are met
        if (status === 'completed' && userRef && userDoc?.exists() && !orderData.pointsAwarded) {
             const userData = userDoc.data() as User;
             const currentPoints = userData.loyaltyPoints || 0;
             const newPoints = Math.floor(orderData.totalAmount);
             transaction.update(userRef, { loyaltyPoints: currentPoints + newPoints });
             transaction.update(orderRef, { pointsAwarded: true });
        }
    });
}


/**
 * Adds a payment to an order and updates its payment status.
 * @param orderId The ID of the order.
 * @param payment The payment detail to add.
 */
export async function addPaymentToOrder(orderId: string, payment: Omit<PaymentDetail, 'date'>) {
    const orderRef = doc(db, 'orders', orderId);
    
    await runTransaction(db, async (transaction) => {
        // --- READ PHASE ---
        const orderDoc = await transaction.get(orderRef);
        if (!orderDoc.exists()) {
            throw new Error("El pedido no existe.");
        }
        const order = orderDoc.data() as Order;
        
        // --- WRITE PHASE ---
        const newPayment: PaymentDetail = {
            ...payment,
            date: Timestamp.now(),
        };

        const newAmountPaid = (order.amountPaid || 0) + newPayment.amount;
        const newAmountDue = order.totalAmount - newAmountPaid;
        const newPaymentStatus = newAmountDue <= 0.001 ? 'paid' : 'partially-paid';
        
        transaction.update(orderRef, {
            paymentDetails: arrayUnion(newPayment),
            amountPaid: newAmountPaid,
            amountDue: newAmountDue,
            paymentStatus: newPaymentStatus,
            updatedAt: serverTimestamp(),
        });
    });
}
