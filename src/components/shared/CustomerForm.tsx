// src/components/shared/CustomerForm.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
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
import type { User } from '@/types/firestore';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const customerSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  email: z.string().email('Por favor, ingresa un correo electrónico válido.').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  dni_ruc: z.string().min(8, 'Debe tener entre 8 y 11 caracteres.').max(11, 'Debe tener entre 8 y 11 caracteres.').optional(),
  birthDate: z.date().optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  customer?: User | null;
  onSubmit: (data: Partial<User>) => Promise<void>;
}

export function CustomerForm({ isOpen, setIsOpen, customer, onSubmit }: CustomerFormProps) {
  const [loading, setLoading] = React.useState(false);
  
  const [day, setDay] = useState<string | undefined>();
  const [month, setMonth] = useState<string | undefined>();
  const [year, setYear] = useState<string | undefined>();

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      dni_ruc: '',
      birthDate: undefined,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (customer) {
        const birthDate = customer.birthDate ? (customer.birthDate as any).toDate() : undefined;
        form.reset({
          name: customer.name || '',
          email: customer.email || '',
          phone: customer.phone || '',
          address: customer.address || '',
          dni_ruc: customer.dni_ruc || '',
          birthDate: birthDate,
        });
        if (birthDate) {
            setDay(String(birthDate.getDate()));
            setMonth(String(birthDate.getMonth() + 1));
            setYear(String(birthDate.getFullYear()));
        } else {
            setDay(undefined); setMonth(undefined); setYear(undefined);
        }
      } else {
        form.reset({
          name: '', email: '', phone: '', address: '', dni_ruc: '', birthDate: undefined,
        });
        setDay(undefined); setMonth(undefined); setYear(undefined);
      }
    }
  }, [customer, form, isOpen]);

  useEffect(() => {
    if(day && month && year) {
        const newDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        form.setValue('birthDate', newDate, { shouldValidate: true, shouldDirty: true });
    }
  }, [day, month, year, form]);


  const handleFormSubmit = async (data: CustomerFormValues) => {
    setLoading(true);
    await onSubmit(data);
    setLoading(false);
  };
  
  const years = Array.from({ length: 70 }, (_, i) => new Date().getFullYear() - i);
  const months = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: format(new Date(0, i), 'MMMM', { locale: es }) }));
  const daysInMonth = (year && month) ? new Date(parseInt(year), parseInt(month), 0).getDate() : 31;
  const days = Array.from({length: daysInMonth}, (_, i) => i + 1);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{customer ? 'Editar Cliente' : 'Añadir Nuevo Cliente'}</DialogTitle>
          <DialogDescription>Completa la información del cliente. Haz clic en guardar cuando termines.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre Completo</FormLabel>
                <FormControl><Input placeholder="Ej: Juan Pérez" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Correo Electrónico (Opcional)</FormLabel>
                <FormControl><Input placeholder="cliente@correo.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem>
                <FormLabel>Teléfono</FormLabel>
                <FormControl><Input placeholder="987654321" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
             <FormField control={form.control} name="dni_ruc" render={({ field }) => (
              <FormItem>
                <FormLabel>DNI o RUC (Opcional)</FormLabel>
                <FormControl><Input placeholder="12345678" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <FormItem>
                 <FormLabel>Fecha de Nacimiento (Opcional)</FormLabel>
                 <div className="flex gap-3">
                    <Select value={month} onValueChange={setMonth}>
                        <SelectTrigger className="w-full h-20 text-2xl font-bold"><SelectValue placeholder="Mes" /></SelectTrigger>
                        <SelectContent>
                            {months.map(m => <SelectItem key={m.value} value={String(m.value)} className="capitalize">{m.label}</SelectItem>)}
                        </SelectContent>
                    </Select>
                     <Select value={day} onValueChange={setDay} disabled={!month || !year}>
                        <SelectTrigger className="w-full h-20 text-2xl font-bold"><SelectValue placeholder="Día" /></SelectTrigger>
                        <SelectContent>
                            {days.map(d => <SelectItem key={d} value={String(d)}>{d}</SelectItem>)}
                        </SelectContent>
                    </Select>
                     <Select value={year} onValueChange={setYear}>
                        <SelectTrigger className="w-full h-20 text-2xl font-bold"><SelectValue placeholder="Año" /></SelectTrigger>
                        <SelectContent>
                            {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                        </SelectContent>
                    </Select>
                 </div>
                 <FormMessage>{form.formState.errors.birthDate?.message}</FormMessage>
            </FormItem>

            <FormField control={form.control} name="address" render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección (Opcional)</FormLabel>
                <FormControl><Input placeholder="Av. Principal 123" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {customer ? 'Guardar Cambios' : 'Crear Cliente'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
