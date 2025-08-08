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
import type { LeaveRequest, Notification } from '@/types/firestore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
 * Updates the status of an existing leave request and creates a notification.
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
  const notificationRef = doc(collection(db, 'notifications'));

  // Use a transaction or batch write to ensure atomicity
  const batch = setDoc(db);
  
  const requestUpdate = {
    status: status,
    reviewedBy: reviewedById,
    reviewedAt: serverTimestamp(),
  };
  updateDoc(requestRef, requestUpdate);

  // Get the leave request to create the notification message
  const requestSnap = await getDoc(requestRef);
  if (!requestSnap.exists()) {
    throw new Error("Leave request not found");
  }
  const leaveRequest = requestSnap.data() as LeaveRequest;

  // Create notification
  const notification: Omit<Notification, 'id'> = {
    userId: leaveRequest.employeeId,
    title: `Solicitud de Permiso ${status === 'approved' ? 'Aprobada' : 'Rechazada'}`,
    message: `Tu solicitud para el día ${format(leaveRequest.leaveDate.toDate(), 'P', { locale: es })} ha sido ${status === 'approved' ? 'aprobada' : 'rechazada'}.`,
    link: '/sales/payroll',
    isRead: false,
    createdAt: serverTimestamp() as Timestamp,
    type: status === 'approved' ? 'leave_approved' : 'leave_rejected',
  };
  setDoc(notificationRef, notification);
  
  // Here you would add logic to update the attendance record if approved.
  // This might involve creating a special "leave" record in the attendance collection
  // or a related collection to prevent marking the employee as absent.
  // This logic is complex and depends on the final attendance system structure.
}

