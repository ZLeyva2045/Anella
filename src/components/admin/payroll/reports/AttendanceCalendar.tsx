// src/components/admin/payroll/reports/AttendanceCalendar.tsx
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { MonthlyAttendance, DailyAttendance } from '@/types/firestore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface AttendanceCalendarProps {
  attendanceData: MonthlyAttendance;
  month: Date;
}

function getDayTooltipText(dayData: DailyAttendance | undefined): string {
    if (!dayData) return "Sin datos";
    if (dayData.status === 'absent') return "Ausente";

    let morningText = "Mañana: No registrada";
    if(dayData.morning?.checkIn && dayData.morning?.checkOut) {
        morningText = `Mañana: ${format(dayData.morning.checkIn.toDate(), 'p', { locale: es })} - ${format(dayData.morning.checkOut.toDate(), 'p', { locale: es })}`;
    } else if (dayData.morning?.checkIn) {
        morningText = `Mañana (Incompleto): Entrada ${format(dayData.morning.checkIn.toDate(), 'p', { locale: es })}`;
    }

    let afternoonText = "Tarde: No registrada";
     if(dayData.afternoon?.checkIn && dayData.afternoon?.checkOut) {
        afternoonText = `Tarde: ${format(dayData.afternoon.checkIn.toDate(), 'p', { locale: es })} - ${format(dayData.afternoon.checkOut.toDate(), 'p', { locale: es })}`;
    } else if (dayData.afternoon?.checkIn) {
        afternoonText = `Tarde (Incompleto): Entrada ${format(dayData.afternoon.checkIn.toDate(), 'p', { locale: es })}`;
    }

    if(dayData.status === 'present_morning') return morningText;
    if(dayData.status === 'present_afternoon') return afternoonText;
    if(dayData.status === 'present') return `${morningText} | ${afternoonText}`;

    return `Incompleto: ${morningText} | ${afternoonText}`;
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
                    return !!attendanceData[day] && (attendanceData[day].status === 'present' || attendanceData[day].status === 'present_morning' || attendanceData[day].status === 'present_afternoon');
                },
                incomplete: (date) => {
                    const day = date.getDate();
                    return !!attendanceData[day] && attendanceData[day].status === 'incomplete';
                },
                absent: (date) => {
                    const day = date.getDate();
                    const dayOfWeek = date.getDay();
                    return dayOfWeek !== 0 && (!attendanceData[day] || attendanceData[day].status === 'absent');
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
                    const tooltipText = getDayTooltipText(attendance);
                    
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
