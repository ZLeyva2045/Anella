// src/components/shared/AddPaymentDialog.tsx
'use client';

import React, { useState } from 'react';
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
import { Loader2, DollarSign } from 'lucide-react';
import { addPaymentToOrder } from '@/services/orderService';
import type { PaymentMethod } from '@/types/firestore';

interface AddPaymentDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  orderId: string;
  amountDue: number | undefined;
}

const paymentSchema = z.object({
  amount: z.coerce.number().positive('El monto debe ser mayor a cero.'),
  method: z.custom<PaymentMethod>((val) => typeof val === 'string' && val.length > 0, 'Debe seleccionar un método de pago.'),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

export function AddPaymentDialog({ isOpen, setIsOpen, orderId, amountDue }: AddPaymentDialogProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: amountDue || 0,
      method: 'cash',
    },
  });
  
  React.useEffect(() => {
    if(isOpen) {
        form.reset({ amount: amountDue || 0, method: 'cash' });
    }
  }, [isOpen, amountDue, form]);


  const onSubmit = async (data: PaymentFormValues) => {
    setLoading(true);
    try {
        if (data.amount > (amountDue ?? 0)) {
            toast({
                variant: 'destructive',
                title: 'Monto inválido',
                description: 'El monto a pagar no puede ser mayor que el saldo pendiente.'
            });
            setLoading(false);
            return;
        }

        await addPaymentToOrder(orderId, {
            amount: data.amount,
            method: data.method,
        });

      toast({ title: 'Pago Registrado', description: 'El pago ha sido añadido al pedido correctamente.' });
      setIsOpen(false);
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Añadir Nuevo Pago</DialogTitle>
          <DialogDescription>Registra un pago total o parcial para este pedido.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto a Pagar (S/)</FormLabel>
                   <div className="relative">
                     <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                     <FormControl><Input type="number" step="0.01" className="pl-9" {...field} /></FormControl>
                   </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Método de Pago</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="cash">Efectivo</SelectItem>
                      <SelectItem value="yapePlin">Yape/Plin</SelectItem>
                      <SelectItem value="bankTransfer">Transferencia</SelectItem>
                      <SelectItem value="card">Tarjeta</SelectItem>
                      <SelectItem value="mercadoPago">Mercado Pago</SelectItem>
                      <SelectItem value="paypal">Paypal</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Registrar Pago
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
