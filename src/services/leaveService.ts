// src/services/leaveService.ts
import {
  collection,
  doc,
  setDoc,
  addDoc,
  serverTimestamp,
  Timestamp,
  updateDoc,
  getDoc,
  WriteBatch,
  writeBatch
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
  data: Omit<LeaveRequestData, 'reviewedBy' | 'reviewedAt' | 'rejectionReason'>
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
 * @param rejectionReason - The reason for rejection, if applicable.
 */
export async function updateLeaveRequestStatus(
  requestId: string,
  status: 'approved' | 'rejected',
  reviewedById: string,
  rejectionReason?: string
): Promise<void> {
  const requestRef = doc(db, 'leaveRequests', requestId);
  const notificationRef = doc(collection(db, 'notifications'));
  const batch = writeBatch(db);

  const requestUpdate: Partial<LeaveRequest> = {
    status,
    reviewedBy: reviewedById,
    reviewedAt: serverTimestamp() as Timestamp,
  };
  
  if (status === 'rejected' && rejectionReason) {
    requestUpdate.rejectionReason = rejectionReason;
  }

  batch.update(requestRef, requestUpdate);

  // Get the leave request to create the notification message
  const requestSnap = await getDoc(requestRef);
  if (!requestSnap.exists()) {
    throw new Error("Leave request not found");
  }
  const leaveRequest = requestSnap.data() as LeaveRequest;

  let message = `Tu solicitud para el día ${format(leaveRequest.leaveDate.toDate(), 'P', { locale: es })} ha sido ${status === 'approved' ? 'aprobada' : 'rechazada'}.`;
  if(status === 'rejected' && rejectionReason) {
    message += ` Motivo: ${rejectionReason}`;
  }

  // Create notification
  const notification: Omit<Notification, 'id'> = {
    userId: leaveRequest.employeeId,
    title: `Solicitud de Permiso ${status === 'approved' ? 'Aprobada' : 'Rechazada'}`,
    message: message,
    link: '/sales/payroll',
    isRead: false,
    createdAt: serverTimestamp() as Timestamp,
    type: status === 'approved' ? 'leave_approved' : 'leave_rejected',
  };
  batch.set(notificationRef, notification);

  await batch.commit();
  
  // Here you would add logic to update the attendance record if approved.
  // This might involve creating a special "leave" record in the attendance collection
  // or a related collection to prevent marking the employee as absent.
  // This logic is complex and depends on the final attendance system structure.
}
