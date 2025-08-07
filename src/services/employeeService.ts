// src/services/employeeService.ts
import {
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  getDoc,
  Timestamp,
} from 'firebase/firestore';
import { 
  createUserWithEmailAndPassword,
  // deleteUser // This needs to be called from a backend environment (Firebase Function)
} from 'firebase/auth';
import { db, auth } from '@/lib/firebase/config';
import type { User } from '@/types/firestore';

// Note: For full user deletion, you need a Firebase Function to delete the auth user.
// The client-side can only delete the Firestore document.

type EmployeeData = Omit<User, 'id' | 'createdAt' | 'orders'>;

export async function createEmployee(data: Omit<EmployeeData, 'password'> & { password?: string }) {
  if (!data.password) {
    throw new Error('Password is required for new employee creation.');
  }

  // Create user in Firebase Auth
  const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
  const newUserId = userCredential.user.uid;

  // Create user document in Firestore
  const userRef = doc(db, 'users', newUserId);
  const newUserDoc: Omit<User, 'id'> = {
    name: data.name,
    email: data.email,
    role: data.role || 'sales',
    schedule: data.schedule || 'full-day',
    photoURL: data.photoURL || '',
    createdAt: serverTimestamp() as Timestamp,
    // Initialize other fields as needed
    phone: '',
    address: '',
    orders: [],
    loyaltyPoints: 0,
  };

  await setDoc(userRef, newUserDoc);

  return newUserId;
}


export async function updateEmployee(employeeId: string, data: Partial<EmployeeData>) {
  const employeeRef = doc(db, 'users', employeeId);
  await setDoc(employeeRef, data, { merge: true });
}

export async function deleteEmployee(employeeId: string) {
  // IMPORTANT: Deleting the Firebase Auth user should be done from a secure backend environment
  // like a Firebase Cloud Function, as it's a privileged operation.
  // The code below only deletes the Firestore document.
  // You would typically call a cloud function here to perform the full deletion.
  
  const employeeRef = doc(db, 'users', employeeId);
  const employeeSnap = await getDoc(employeeRef);

  if (!employeeSnap.exists()) {
    throw new Error('Employee not found in database.');
  }

  // For now, we just delete the Firestore document.
  await deleteDoc(employeeRef);

  // In a real app, you would now call your cloud function:
  // const deleteUserFunction = httpsCallable(functions, 'deleteUser');
  // await deleteUserFunction({ uid: employeeId });
}