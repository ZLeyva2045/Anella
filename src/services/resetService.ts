// src/services/resetService.ts
import { collection, writeBatch, getDocs, query, where, Query } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

// List of collections to delete ALL documents from
const COLLECTIONS_TO_CLEAR: string[] = [
    'orders',
    'expenses',
    'attendance',
    'evaluations',
    'feedback',
    'leaveRequests',
    'notifications'
];

/**
 * Fetches all documents from a collection or query and adds delete operations to a batch.
 * @param batch - The Firestore write batch.
 * @param queryOrCollection - The collection reference or query to fetch documents from.
 */
async function batchDelete(batch: ReturnType<typeof writeBatch>, queryOrCollection: Query) {
    const snapshot = await getDocs(queryOrCollection);
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
}

/**
 * Resets the store's transactional data.
 * Deletes all documents from specified collections and deletes only customer users.
 * **This is a destructive and irreversible operation.**
 */
export async function resetStoreData(): Promise<void> {
    const batch = writeBatch(db);

    // 1. Delete all documents from the specified collections
    for (const collectionName of COLLECTIONS_TO_CLEAR) {
        const collRef = collection(db, collectionName);
        await batchDelete(batch, collRef);
    }

    // 2. Delete only users with the role 'customer'
    const usersRef = collection(db, 'users');
    const customersQuery = query(usersRef, where('role', '==', 'customer'));
    await batchDelete(batch, customersQuery);

    // Commit the batch operation
    await batch.commit();
}
