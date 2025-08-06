// src/services/reportService.ts
import {
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  doc,
  getDoc,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { User, Evaluation, Feedback, Attendance, MonthlyAttendance, ReportData, DailyAttendance } from '@/types/firestore';
import { getMonth, getYear, getDaysInMonth, startOfMonth, endOfMonth, getDay } from 'date-fns';

/**
 * Generates a comprehensive report for a given employee and month.
 * @param employeeId - The ID of the employee.
 * @param date - A date within the desired month for the report.
 * @returns A ReportData object or null if essential data is missing.
 */
export async function generateEmployeeReportData(employeeId: string, date: Date): Promise<ReportData | null> {
  const period = `${date.toLocaleString('es-PE', { month: 'long' })} ${getYear(date)}`.replace(/^\w/, c => c.toUpperCase());

  // 1. Fetch Employee Data
  const employeeRef = doc(db, 'users', employeeId);
  const employeeSnap = await getDoc(employeeRef);
  if (!employeeSnap.exists()) {
    console.error("Employee not found");
    return null;
  }
  const employee = { id: employeeSnap.id, ...employeeSnap.data() } as User;

  // 2. Fetch Evaluation
  const evaluationsRef = collection(db, 'evaluations');
  const evalQuery = query(evaluationsRef, where('employeeId', '==', employeeId), where('period', '==', period));
  const evalSnap = await getDocs(evalQuery);
  const evaluation = evalSnap.empty ? null : { id: evalSnap.docs[0].id, ...evalSnap.docs[0].data() } as Evaluation;

  // 3. Fetch Feedback
  const feedbackRef = collection(db, 'feedback');
  const feedbackQuery = query(feedbackRef, where('employeeId', '==', employeeId), where('period', '==', period));
  const feedbackSnap = await getDocs(feedbackQuery);
  const allFeedback = feedbackSnap.docs.map(d => ({ id: d.id, ...d.data() } as Feedback));
  
  const recognitions = allFeedback.filter(f => f.type === 'recognition');
  const improvements = allFeedback.filter(f => f.type === 'improvement');

  // 4. Fetch Attendance and count tardiness
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);

  const attendanceRef = collection(db, 'attendance');
  const attendanceQuery = query(
    attendanceRef,
    where('employeeId', '==', employeeId),
    where('timestamp', '>=', Timestamp.fromDate(monthStart)),
    where('timestamp', '<=', Timestamp.fromDate(monthEnd)),
    orderBy('timestamp', 'asc')
  );
  const attendanceSnap = await getDocs(attendanceQuery);
  const attendanceRecords = attendanceSnap.docs.map(d => d.data() as Attendance);

  const tardinessCount = attendanceRecords.filter(r => r.type === 'check-in' && r.status === 'late').length;
  const tardinessPenalty = tardinessCount * 10; // S/ 10 penalty per late arrival

  const monthlyAttendance: MonthlyAttendance = {};
  const daysInMonth = getDaysInMonth(date);

  for (let i = 1; i <= daysInMonth; i++) {
    const dayDate = new Date(getYear(date), getMonth(date), i);
    const dayOfWeek = getDay(dayDate); // Sunday = 0, Saturday = 6

    const recordsForDay = attendanceRecords.filter(r => r.timestamp.toDate().getDate() === i);
    
    const morningCheckIn = recordsForDay.find(r => r.shift === 'morning' && r.type === 'check-in');
    const morningCheckOut = recordsForDay.find(r => r.shift === 'morning' && r.type === 'check-out');
    const afternoonCheckIn = recordsForDay.find(r => r.shift === 'afternoon' && r.type === 'check-in');
    const afternoonCheckOut = recordsForDay.find(r => r.shift === 'afternoon' && r.type === 'check-out');

    const isWorkDay = dayOfWeek >= 1 && dayOfWeek <= 5; // Monday to Friday
    
    let status: DailyAttendance['status'] = 'absent';
    if (!isWorkDay) {
        status = 'absent';
    } else {
        const morningPresent = morningCheckIn && morningCheckOut;
        const afternoonPresent = afternoonCheckIn && afternoonCheckOut;
        const isLate = morningCheckIn?.status === 'late' || afternoonCheckIn?.status === 'late';

        if(isLate) status = 'late';
        else if (employee.schedule === 'full-day') {
            if (morningPresent && afternoonPresent) status = 'present';
            else if (morningPresent || afternoonPresent) status = 'incomplete';
        } else if (employee.schedule === 'morning') {
            if (morningPresent) status = 'present_morning';
            else if (morningCheckIn || morningCheckOut) status = 'incomplete';
        } else if (employee.schedule === 'afternoon') {
            if (afternoonPresent) status = 'present_afternoon';
            else if (afternoonCheckIn || afternoonCheckOut) status = 'incomplete';
        }
    }


    monthlyAttendance[i] = {
        date: dayDate,
        status: isWorkDay ? status : 'absent',
        morning: {
            checkIn: morningCheckIn?.timestamp,
            checkOut: morningCheckOut?.timestamp,
            late: morningCheckIn?.status === 'late'
        },
        afternoon: {
            checkIn: afternoonCheckIn?.timestamp,
            checkOut: afternoonCheckOut?.timestamp,
            late: afternoonCheckIn?.status === 'late'
        }
    };
  }

  return {
    employee,
    period,
    evaluation,
    feedback: { recognitions, improvements },
    attendance: monthlyAttendance,
    tardinessCount,
    tardinessPenalty,
  };
}
