// src/components/admin/payroll/AttendanceTracker.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { collection, onSnapshot, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { db } from '@/lib/firebase/config';
import type { Attendance, User } from '@/types/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CalendarIcon, ArrowRight, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface EnrichedAttendance extends Attendance {
  employeeName: string;
}

export function AttendanceTracker() {
  const [date, setDate] = useState<Date>(new Date());
  const [attendances, setAttendances] = useState<EnrichedAttendance[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const employeeMap = useMemo(() => {
    return new Map(employees.map(emp => [emp.id, emp.name]));
  }, [employees]);

  useEffect(() => {
    const employeeRoles = ['manager', 'sales', 'designer', 'manufacturing', 'creative'];
    const employeesQuery = query(collection(db, 'users'), where('role', 'in', employeeRoles));
    
    const unsubscribeEmployees = onSnapshot(employeesQuery, (snapshot) => {
      setEmployees(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)));
    });

    return () => unsubscribeEmployees();
  }, []);

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

    const unsubscribeAttendance = onSnapshot(q, (snapshot) => {
      const attendanceData = snapshot.docs.map(doc => ({ 
        id: doc.id,
        ...doc.data(),
        employeeName: employeeMap.get(doc.data().employeeId) || 'Desconocido'
      } as EnrichedAttendance));
      setAttendances(attendanceData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching attendance: ", error);
      setLoading(false);
    });

    return () => unsubscribeAttendance();
  }, [date, selectedEmployeeId, employeeMap]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Control de Asistencias</CardTitle>
        <CardDescription>
          Registros de entrada y salida del personal para el día seleccionado.
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
  );
}
