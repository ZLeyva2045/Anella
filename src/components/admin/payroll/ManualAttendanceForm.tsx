// src/components/admin/payroll/ManualAttendanceForm.tsx
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import type { User } from '@/types/firestore';
import { recordManualAttendance } from '@/services/attendanceService';
import { Loader2, Save } from 'lucide-react';

const manualAttendanceSchema = z.object({
  employeeId: z.string().min(1, 'Debes seleccionar un empleado.'),
  type: z.enum(['check-in', 'check-out'], { required_error: 'Debes seleccionar el tipo de registro.' }),
  shift: z.enum(['morning', 'afternoon'], { required_error: 'Debes seleccionar un turno.' }),
  isLate: z.boolean().default(false),
});

type ManualAttendanceFormValues = z.infer<typeof manualAttendanceSchema>;

interface ManualAttendanceFormProps {
  employees: User[];
  selectedDate: Date;
}

export function ManualAttendanceForm({ employees, selectedDate }: ManualAttendanceFormProps) {
  const [loading, setLoading] = useState(false);
  const { firestoreUser } = useAuth();
  const { toast } = useToast();

  const form = useForm<ManualAttendanceFormValues>({
    resolver: zodResolver(manualAttendanceSchema),
    defaultValues: { employeeId: '', type: 'check-in', shift: 'morning', isLate: false },
  });

  const onSubmit = async (data: ManualAttendanceFormValues) => {
    if (!firestoreUser) return;
    setLoading(true);
    try {
      await recordManualAttendance(firestoreUser.id, { ...data, date: selectedDate });
      toast({ title: 'Registro Guardado', description: 'La asistencia ha sido registrada manualmente.' });
      form.reset({ employeeId: data.employeeId, type: 'check-in', shift: 'morning', isLate: false });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setLoading(false);
    }
  };
  
  const recordType = form.watch('type');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Registro Manual</CardTitle>
        <CardDescription>Añade un registro de asistencia para un empleado en la fecha seleccionada.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField name="employeeId" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>Empleado</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Selecciona un empleado" /></SelectTrigger></FormControl>
                  <SelectContent>{employees.map(emp => <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>)}</SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField name="type" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="check-in">Entrada</SelectItem>
                      <SelectItem value="check-out">Salida</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField name="shift" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Turno</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="morning">Mañana</SelectItem>
                      <SelectItem value="afternoon">Tarde</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            
            {recordType === 'check-in' && (
              <FormField name="isLate" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>Puntualidad</FormLabel>
                  <RadioGroup onValueChange={(val) => field.onChange(val === 'true')} value={String(field.value)} className="flex gap-4 pt-2">
                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="false" /></FormControl><FormLabel className="font-normal">A Tiempo</FormLabel></FormItem>
                    <FormItem className="flex items-center space-x-2"><FormControl><RadioGroupItem value="true" /></FormControl><FormLabel className="font-normal">Tardanza</FormLabel></FormItem>
                  </RadioGroup>
                  <FormMessage />
                </FormItem>
              )} />
            )}

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="mr-2 animate-spin" /> : <Save className="mr-2" />}
                Guardar Registro
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
