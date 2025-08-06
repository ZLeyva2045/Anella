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
import type { User, Attendance } from '@/types/firestore';

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

  // Verify if the scanned ID corresponds to a valid employee and get their schedule
  const employeeRef = doc(db, 'users', employeeIdFromQR);
  const employeeSnap = await getDoc(employeeRef);
  if (!employeeSnap.exists()) {
    throw new Error('Código QR inválido o no corresponde a un empleado.');
  }
  const employeeData = employeeSnap.data() as User;
  if (!['manager', 'sales', 'designer', 'manufacturing', 'creative'].includes(employeeData.role || '')) {
      throw new Error('El código QR no pertenece a un empleado válido.');
  }
  const employeeSchedule = employeeData.schedule || 'full-day';


  // Define the start and end of the current day
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  // Determine current shift based on time
  const currentHour = now.getHours();
  let currentShift: 'morning' | 'afternoon';
  // Morning shift check-in/out window (e.g., 7am-2pm)
  if (currentHour >= 7 && currentHour < 14) {
    currentShift = 'morning';
  } 
  // Afternoon shift check-in/out window (e.g., 2pm-9pm)
  else if (currentHour >= 14 && currentHour < 22) {
    currentShift = 'afternoon';
  } else {
    throw new Error('Fuera del horario de registro. El registro es de 7am a 10pm.');
  }
  
  // Check if employee schedule allows for this shift
  if (employeeSchedule !== 'full-day' && employeeSchedule !== currentShift) {
      throw new Error(`No puedes registrar en este horario. Tu turno es por la ${employeeSchedule === 'morning' ? 'mañana' : 'tarde'}.`);
  }

  // Query for attendance records for the employee for the current day and shift
  const attendanceRef = collection(db, 'attendance');
  const q = query(
    attendanceRef,
    where('employeeId', '==', employeeIdFromQR),
    where('timestamp', '>=', Timestamp.fromDate(startOfDay)),
    where('timestamp', '<', Timestamp.fromDate(endOfDay)),
    where('shift', '==', currentShift),
    orderBy('timestamp', 'desc'),
    limit(1)
  );
  
  const querySnapshot = await getDocs(q);
  
  let recordType: 'check-in' | 'check-out' = 'check-in';
  
  // If there are records for today in this shift, determine the next record type
  if (!querySnapshot.empty) {
    const lastRecord = querySnapshot.docs[0].data();
    if (lastRecord.type === 'check-in') {
      recordType = 'check-out';
    } else {
      // If last record was a check-out, they can't check-in again for the same shift
      throw new Error(`Ya has registrado tu salida para el turno de la ${currentShift === 'morning' ? 'mañana' : 'tarde'}.`);
    }
  }

  // Create the new attendance record
  const newRecord = {
    employeeId: employeeIdFromQR,
    registrarId,
    timestamp: Timestamp.now(),
    type: recordType,
    shift: currentShift,
  };
  
  const newDocRef = await addDoc(attendanceRef, newRecord);

  return { ...newRecord, id: newDocRef.id };
}
