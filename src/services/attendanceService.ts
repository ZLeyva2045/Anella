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
  const currentMinutes = now.getMinutes();
  let currentShift: 'morning' | 'afternoon' | null = null;
  
  // Morning shift window
  if (currentHour >= 7 && (currentHour < 14)) {
      currentShift = 'morning';
  }
  // Afternoon shift window
  else if (currentHour >= 14 && (currentHour < 22)) {
      currentShift = 'afternoon';
  }
  
  if (!currentShift) {
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
  
  let recordType: 'check-in' | 'check-out';
  let attendanceStatus: 'on-time' | 'late' | undefined = undefined;
  
  // If there are no records for today in this shift, it must be a check-in.
  if (querySnapshot.empty) {
      recordType = 'check-in';
      // Determine if the check-in is late
      const isMorningLate = currentShift === 'morning' && (currentHour > 8 || (currentHour === 8 && currentMinutes > 5));
      const isAfternoonLate = currentShift === 'afternoon' && (currentHour > 15 || (currentHour === 15 && currentMinutes > 5));
      
      if (isMorningLate || isAfternoonLate) {
          attendanceStatus = 'late';
      } else {
          attendanceStatus = 'on-time';
      }

  } else {
    // If there are records, determine the next action
    const lastRecord = querySnapshot.docs[0].data();
    if (lastRecord.type === 'check-in') {
      recordType = 'check-out';
    } else {
      // If last record was a check-out, they can't check-in again for the same shift
      throw new Error(`Ya has registrado tu salida para el turno de la ${currentShift === 'morning' ? 'mañana' : 'tarde'}.`);
    }
  }


  // Create the new attendance record
  const newRecord: Omit<Attendance, 'id'> = {
    employeeId: employeeIdFromQR,
    registrarId,
    timestamp: Timestamp.now(),
    type: recordType,
    shift: currentShift,
  };
  
  if (attendanceStatus) {
    newRecord.status = attendanceStatus;
  }
  
  const newDocRef = await addDoc(attendanceRef, newRecord);

  return { ...newRecord, id: newDocRef.id };
}

/**
 * Records a manual attendance entry by an administrator.
 * @param registrarId - The ID of the admin performing the action.
 * @param data - The details of the manual attendance record.
 */
export async function recordManualAttendance(
  registrarId: string,
  data: {
    employeeId: string;
    type: 'check-in' | 'check-out';
    shift: 'morning' | 'afternoon';
    isLate: boolean;
    date: Date;
  }
): Promise<string> {
  const { employeeId, type, shift, isLate, date } = data;

  // Set the timestamp to a specific time within the selected shift on the selected day
  let recordTimestamp: Date;
  if (type === 'check-in') {
      recordTimestamp = shift === 'morning' 
          ? new Date(date.getFullYear(), date.getMonth(), date.getDate(), 8, 0, 0)
          : new Date(date.getFullYear(), date.getMonth(), date.getDate(), 15, 0, 0);
  } else { // check-out
      recordTimestamp = shift === 'morning' 
          ? new Date(date.getFullYear(), date.getMonth(), date.getDate(), 13, 0, 0)
          : new Date(date.getFullYear(), date.getMonth(), date.getDate(), 20, 0, 0);
  }

  const newRecord: Omit<Attendance, 'id'> = {
    employeeId: employeeId,
    registrarId: registrarId,
    timestamp: Timestamp.fromDate(recordTimestamp),
    type: type,
    shift: shift,
    status: isLate && type === 'check-in' ? 'late' : 'on-time',
  };

  const newDocRef = await addDoc(collection(db, 'attendance'), newRecord);
  return newDocRef.id;
}
