// src/components/admin/payroll/AttendanceTracker.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { db } from '@/lib/firebase/config';
import type { Attendance, User, MonthlyAttendance } from '@/types/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CalendarIcon, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { ManualAttendanceForm } from './ManualAttendanceForm';
import { useAuth } from '@/hooks/useAuth';
import { getMonthlyAttendanceData } from '@/services/reportService';
import { AttendanceCalendar } from './reports/AttendanceCalendar';
import { Separator } from '@/components/ui/separator';

interface EnrichedAttendance extends Attendance {
  employeeName: string;
}

interface AttendanceTrackerProps {
    employees: User[];
}

export function AttendanceTracker({ employees }: AttendanceTrackerProps) {
  const [date, setDate] = useState<Date>(new Date());
  const [attendances, setAttendances] = useState<EnrichedAttendance[]>([]);
  const [monthlyAttendance, setMonthlyAttendance] = useState<MonthlyAttendance | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const { firestoreUser } = useAuth();
  const isAdmin = firestoreUser?.role === 'manager';

  const employeeMap = useMemo(() => {
    return new Map(employees.map(emp => [emp.id, emp.name]));
  }, [employees]);

  useEffect(() => {
    setLoading(true);

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const attendanceRef = collection(db, 'attendance');
    let q = query(
      attendanceRef,
      where('timestamp', '>=', Timestamp.fromDate(startOfDay)),
      where('timestamp', '<=', Timestamp.fromDate(endOfDay)),
      orderBy('timestamp', 'desc')
    );

    if (selectedEmployeeId !== 'all') {
      q = query(q, where('employeeId', '==', selectedEmployeeId));
    }

    const unsubscribeDaily = onSnapshot(q, (snapshot) => {
      const attendanceData = snapshot.docs.map(doc => ({ 
        id: doc.id,
        ...doc.data(),
        employeeName: employeeMap.get(doc.data().employeeId) || 'Desconocido'
      } as EnrichedAttendance));
      setAttendances(attendanceData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching daily attendance: ", error);
      setLoading(false);
    });

    // Fetch monthly data if an employee is selected
    if (selectedEmployeeId && selectedEmployeeId !== 'all') {
      const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);
      if(selectedEmployee) {
          getMonthlyAttendanceData(selectedEmployeeId, selectedEmployee.schedule, date).then(data => {
            setMonthlyAttendance(data);
          });
      }
    } else {
        setMonthlyAttendance(null);
    }


    return () => unsubscribeDaily();
  }, [date, selectedEmployeeId, employeeMap, employees]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <Card>
            <CardHeader>
            <CardTitle>Control de Asistencias</CardTitle>
            <CardDescription>
                Registros de entrada y salida del personal. Selecciona un día y/o empleado para filtrar.
            </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
                <Popover>
                <PopoverTrigger asChild>
                    <Button
                    variant={"outline"}
                    className={cn("w-full md:w-[280px] justify-start text-left font-normal", !date && "text-muted-foreground")}
                    >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={(d) => setDate(d || new Date())} initialFocus locale={es} />
                </PopoverContent>
                </Popover>
                <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                <SelectTrigger className="w-full md:w-[280px]">
                    <SelectValue placeholder="Filtrar por empleado" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todos los empleados</SelectItem>
                    {employees.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
                <div className="border rounded-md">
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Empleado</TableHead>
                        <TableHead>Hora</TableHead>
                        <TableHead>Tipo</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {attendances.length === 0 ? (
                        <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground h-24">
                            No hay registros de asistencia para esta fecha.
                        </TableCell>
                        </TableRow>
                    ) : (
                        attendances.map(record => (
                        <TableRow key={record.id}>
                            <TableCell className="font-medium flex items-center gap-2">
                            <UserIcon className="h-4 w-4 text-muted-foreground" />
                            {record.employeeName}
                            </TableCell>
                            <TableCell>
                            {format(record.timestamp.toDate(), 'p', { locale: es })}
                            </TableCell>
                            <TableCell>
                            <Badge variant={record.type === 'check-in' ? 'secondary' : 'outline'} className={cn(record.type === 'check-in' ? "text-green-600 border-green-200 bg-green-50" : "text-red-600 border-red-200 bg-red-50")}>
                                {record.type === 'check-in' ? 'Entrada' : 'Salida'}
                            </Badge>
                            </TableCell>
                        </TableRow>
                        ))
                    )}
                    </TableBody>
                </Table>
                </div>
            )}
            </CardContent>
        </Card>
        
        {monthlyAttendance && (
           <AttendanceCalendar attendanceData={monthlyAttendance} month={date} />
        )}
      </div>

      <div>
        {isAdmin && (
            <ManualAttendanceForm employees={employees} selectedDate={date} />
        )}
      </div>
    </div>
  );
}
