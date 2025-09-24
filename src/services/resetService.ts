// src/services/resetService.ts
import { collection, writeBatch, getDocs, query, type Query } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

// List of collections to delete ALL documents from
const COLLECTIONS_TO_CLEAR: string[] = [
    'orders',
    'expenses',
    'attendance',
    'evaluations',
    'feedback',
    'leaveRequests',
    'notifications',
    'products',
    'gifts',
    'themes',
    'categories',
    'lotes',
    'users' // Now includes all users
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
 * Resets all store data.
 * Deletes all documents from specified collections.
 * **This is a destructive and irreversible operation.**
 */
export async function resetStoreData(): Promise<void> {
    // Firestore allows a maximum of 500 operations in a single batch.
    // We will process collections in separate batches to avoid exceeding this limit.
    for (const collectionName of COLLECTIONS_TO_CLEAR) {
        const batch = writeBatch(db);
        const collRef = collection(db, collectionName);
        console.log(`Preparing to delete all documents from: ${collectionName}`);
        
        // This simple batch delete might fail if a collection is very large.
        // For production apps, a more robust solution using Cloud Functions is recommended.
        const snapshot = await getDocs(collRef);
        snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        
        await batch.commit();
        console.log(`Successfully deleted all documents from: ${collectionName}`);
    }
    
    // Note: This process does NOT delete Firebase Auth users or files in Firebase Storage.
    // Those must be handled separately, typically via a backend process or Cloud Function.
}
