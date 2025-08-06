// src/components/admin/payroll/reports/AttendanceCalendar.tsx
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { MonthlyAttendance } from '@/types/firestore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AttendanceCalendarProps {
  attendanceData: MonthlyAttendance;
  month: Date;
}

export function AttendanceCalendar({ attendanceData, month }: AttendanceCalendarProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Calendario de Asistencias</CardTitle>
        <CardDescription>Resumen visual de la asistencia durante el mes.</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <TooltipProvider>
            <Calendar
            month={month}
            modifiers={{
                present: (date) => {
                    const day = date.getDate();
                    return attendanceData[day]?.status === 'present';
                },
                incomplete: (date) => {
                    const day = date.getDate();
                    return attendanceData[day]?.status === 'incomplete';
                },
                absent: (date) => {
                    const day = date.getDate();
                    const dayOfWeek = date.getDay();
                    return attendanceData[day]?.status === 'absent' && dayOfWeek !== 0; // Exclude Sundays
                }
            }}
            modifiersClassNames={{
                present: 'bg-green-100 text-green-800 rounded-md',
                incomplete: 'bg-yellow-100 text-yellow-800 rounded-md',
                absent: 'bg-red-100 text-red-800 rounded-md',
            }}
            components={{
                DayContent: (props) => {
                    const day = props.date.getDate();
                    const attendance = attendanceData[day];
                    if (!attendance) return <div {...props}>{props.date.getDate()}</div>;
                    
                    let tooltipText = "Ausente";
                    if (attendance.status === 'present' && attendance.checkIn && attendance.checkOut) {
                        tooltipText = `Entrada: ${format(attendance.checkIn.toDate(), 'p', {locale: es})} - Salida: ${format(attendance.checkOut.toDate(), 'p', {locale: es})}`;
                    } else if (attendance.status === 'incomplete') {
                        tooltipText = `Incompleto - ${attendance.checkIn ? `Solo Entrada: ${format(attendance.checkIn.toDate(), 'p', {locale: es})}` : `Solo Salida: ${format(attendance.checkOut?.toDate(), 'p', {locale: es})}`}`;
                    }

                    return (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <span>{props.date.getDate()}</span>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{tooltipText}</p>
                            </TooltipContent>
                        </Tooltip>
                    );
                }
            }}
            />
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
