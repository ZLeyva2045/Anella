// src/services/attendanceService.ts
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  Timestamp,
  orderBy,
  limit,
  addDoc,
  getDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { User } from '@/types/firestore';

/**
 * Records an attendance event for a given employee.
 * It checks for the last record of the day to determine if it's a check-in or check-out.
 * The registrar must be the same as the employee whose QR code is being scanned.
 * @param registrarId - The ID of the user who is performing the scan (logged-in user).
 * @param employeeIdFromQR - The ID of the employee from the scanned QR code.
 */
export async function recordAttendance(registrarId: string, employeeIdFromQR: string) {
  // Security check: Ensure the logged-in user is scanning their own ID card.
  if (registrarId !== employeeIdFromQR) {
    throw new Error('No puedes registrar la asistencia de otro empleado. Escanea tu propio carnet.');
  }

  // Verify if the scanned ID corresponds to a valid employee
  const employeeRef = doc(db, 'users', employeeIdFromQR);
  const employeeSnap = await getDoc(employeeRef);
  if (!employeeSnap.exists() || !['manager', 'sales', 'designer', 'manufacturing', 'creative'].includes(employeeSnap.data().role)) {
    throw new Error('Código QR inválido o no corresponde a un empleado.');
  }
  
  // Define the start and end of the current day
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  // Query for attendance records for the employee for the current day
  const attendanceRef = collection(db, 'attendance');
  const q = query(
    attendanceRef,
    where('employeeId', '==', employeeIdFromQR),
    where('timestamp', '>=', Timestamp.fromDate(startOfDay)),
    where('timestamp', '<', Timestamp.fromDate(endOfDay)),
    orderBy('timestamp', 'desc'),
    limit(1)
  );
  
  const querySnapshot = await getDocs(q);
  
  let recordType: 'check-in' | 'check-out' = 'check-in';
  
  // If there are records for today, determine the next record type
  if (!querySnapshot.empty) {
    const lastRecord = querySnapshot.docs[0].data();
    if (lastRecord.type === 'check-in') {
      recordType = 'check-out';
    }
  }

  // Create the new attendance record
  const newRecord = {
    employeeId: employeeIdFromQR,
    registrarId,
    timestamp: Timestamp.now(),
    type: recordType,
  };
  
  const newDocRef = await addDoc(attendanceRef, newRecord);

  return { ...newRecord, id: newDocRef.id };
}
