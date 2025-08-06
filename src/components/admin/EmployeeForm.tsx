// src/components/admin/EmployeeForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { User, EmployeeRole, EmployeeSchedule } from '@/types/firestore';
import { employeeRoles, employeeSchedules } from '@/types/firestore';
import { createEmployee, updateEmployee } from '@/services/employeeService';
import { Loader2, UserPlus } from 'lucide-react';
import { uploadImage } from '@/services/productService';

const employeeSchema = z.object({
  name: z.string().min(3, 'El nombre es obligatorio.'),
  email: z.string().email('Debe ser un correo electrónico válido.'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.').optional(),
  role: z.custom<EmployeeRole>((val) => employeeRoles.includes(val as EmployeeRole), {
    message: 'Debe seleccionar un rol válido.',
  }),
  schedule: z.custom<EmployeeSchedule>((val) => employeeSchedules.includes(val as EmployeeSchedule), {
    message: 'Debe seleccionar un horario válido.',
  }),
  photoURL: z.string().optional(),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  employee?: User | null;
}

export function EmployeeForm({ isOpen, setIsOpen, employee }: EmployeeFormProps) {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { toast } = useToast();

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema.refine(data => employee || (data.password && data.password.length > 0), {
      message: 'La contraseña es obligatoria para nuevos empleados.',
      path: ['password'],
    })),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'sales',
      schedule: 'full-day',
      photoURL: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (employee) {
        form.reset({
          name: employee.name || '',
          email: employee.email || '',
          password: '', // No precargar contraseña por seguridad
          role: employee.role as EmployeeRole || 'sales',
          schedule: employee.schedule || 'full-day',
          photoURL: employee.photoURL || '',
        });
      } else {
        form.reset({
          name: '',
          email: '',
          password: '',
          role: 'sales',
          schedule: 'full-day',
          photoURL: '',
        });
      }
      setImageFile(null); // Reset file input on open
    }
  }, [employee, form, isOpen]);

  const onSubmit = async (data: EmployeeFormValues) => {
    setLoading(true);
    try {
      let photoUrl = data.photoURL || '';
      
      if (imageFile) {
        photoUrl = await uploadImage(imageFile, 'employee_photos');
      } else if (!employee?.photoURL) {
        // Asignar una imagen por defecto si no se sube una nueva y no existe una previa
        photoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random`;
      }

      if (employee) {
        // Actualizar empleado existente
        await updateEmployee(employee.id, { name: data.name, role: data.role, schedule: data.schedule, photoURL: photoUrl });
        toast({ title: 'Empleado actualizado', description: 'Los datos del empleado se han guardado correctamente.' });
      } else {
        // Crear nuevo empleado
        if (!data.password) {
            toast({ variant: 'destructive', title: 'Error', description: 'La contraseña es obligatoria para nuevos empleados.' });
            setLoading(false);
            return;
        }
        await createEmployee({ ...data, photoURL: photoUrl });
        toast({ title: 'Empleado creado', description: 'El nuevo empleado ha sido añadido y puede iniciar sesión.' });
      }
      
      setIsOpen(false);
    } catch (error: any) {
      console.error('Error saving employee: ', error);
      toast({
        variant: 'destructive',
        title: 'Error al guardar',
        description: error.message || 'No se pudo guardar el empleado.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{employee ? 'Editar Empleado' : 'Añadir Nuevo Empleado'}</DialogTitle>
          <DialogDescription>
            Completa los detalles del miembro del equipo.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField name="name" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Nombre Completo</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField name="email" control={form.control} render={({ field }) => (
              <FormItem><FormLabel>Correo Electrónico</FormLabel><FormControl><Input type="email" {...field} disabled={!!employee} /></FormControl><FormMessage /></FormItem>
            )} />
            {!employee && (
                <FormField name="password" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Contraseña</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
            )}
            <div className="grid grid-cols-2 gap-4">
                <FormField name="role" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Rol</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>{employeeRoles.map(role => (
                    <SelectItem key={role} value={role} className="capitalize">{role}</SelectItem>
                ))}</SelectContent></Select><FormMessage /></FormItem>
                )} />
                 <FormField name="schedule" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Horario</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>
                    <SelectItem value="morning">Mañana (8am-1pm)</SelectItem>
                    <SelectItem value="afternoon">Tarde (3pm-8pm)</SelectItem>
                    <SelectItem value="full-day">Día Completo</SelectItem>
                </SelectContent></Select><FormMessage /></FormItem>
                )} />
            </div>
            <FormItem>
              <FormLabel>Foto del Empleado</FormLabel>
              <FormControl>
                 <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                />
              </FormControl>
              <FormMessage>{form.formState.errors.photoURL?.message}</FormMessage>
            </FormItem>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {employee ? 'Guardar Cambios' : 'Crear Empleado'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
