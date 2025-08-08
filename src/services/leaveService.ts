// src/services/leaveService.ts
import {
  collection,
  doc,
  setDoc,
  addDoc,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { LeaveRequest } from '@/types/firestore';

type LeaveRequestData = Omit<LeaveRequest, 'id' | 'requestDate' | 'status'>;

/**
 * Creates a new leave request in the database.
 * @param data - The data for the new leave request.
 */
export async function createLeaveRequest(
  data: Omit<LeaveRequestData, 'reviewedBy' | 'reviewedAt'>
): Promise<string> {
  const leaveRequestsCollection = collection(db, 'leaveRequests');
  const newRequestData: Omit<LeaveRequest, 'id'> = {
    ...data,
    leaveDate: Timestamp.fromDate(data.leaveDate),
    requestDate: serverTimestamp() as Timestamp,
    status: 'pending',
  };
  const newDocRef = await addDoc(leaveRequestsCollection, newRequestData);
  return newDocRef.id;
}

/**
 * Updates the status of an existing leave request.
 * @param requestId - The ID of the leave request to update.
 * @param status - The new status ('approved' or 'rejected').
 * @param reviewedById - The ID of the admin who reviewed the request.
 */
export async function updateLeaveRequestStatus(
  requestId: string,
  status: 'approved' | 'rejected',
  reviewedById: string
): Promise<void> {
  const requestRef = doc(db, 'leaveRequests', requestId);
  await updateDoc(requestRef, {
    status: status,
    reviewedBy: reviewedById,
    reviewedAt: serverTimestamp(),
  });
  
  // Here you would add logic to update the attendance record if approved.
  // This might involve creating a special "leave" record in the attendance collection
  // or a related collection to prevent marking the employee as absent.
  // This logic is complex and depends on the final attendance system structure.
}
