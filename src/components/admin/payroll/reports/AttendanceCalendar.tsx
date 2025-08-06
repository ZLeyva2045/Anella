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
        <CardDescription>Pasa el cursor sobre un día para ver los detalles de entrada y salida.</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <TooltipProvider>
            <Calendar
            month={month}
            modifiers={{
                present: (date) => {
                    const day = date.getDate();
                    return !!attendanceData[day] && attendanceData[day].status === 'present';
                },
                incomplete: (date) => {
                    const day = date.getDate();
                    return !!attendanceData[day] && attendanceData[day].status === 'incomplete';
                },
                absent: (date) => {
                    const day = date.getDate();
                    const dayOfWeek = date.getDay();
                    // Consider absent if there's no record and it's not Sunday
                    return (!attendanceData[day] || attendanceData[day].status === 'absent') && dayOfWeek !== 0;
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
                    
                    let tooltipText = "Ausente";
                    if (attendance) {
                      const checkInTime = attendance.checkIn ? format(attendance.checkIn.toDate(), 'p', { locale: es }) : null;
                      const checkOutTime = attendance.checkOut ? format(attendance.checkOut.toDate(), 'p', { locale: es }) : null;

                      if (attendance.status === 'present' && checkInTime && checkOutTime) {
                          tooltipText = `Entrada: ${checkInTime} - Salida: ${checkOutTime}`;
                      } else if (attendance.status === 'incomplete') {
                          if (checkInTime) {
                            tooltipText = `Incompleto - Solo Entrada: ${checkInTime}`;
                          } else if (checkOutTime) {
                            tooltipText = `Incompleto - Solo Salida: ${checkOutTime}`;
                          } else {
                            tooltipText = `Incompleto - Sin registros de hora`;
                          }
                      }
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
