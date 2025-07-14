// src/components/shared/CompleteSaleDialog.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { User, OrderItem, Product } from '@/types/firestore';
import { saveOrder } from '@/services/orderService';
import { Loader2, PlusCircle, UserPlus, CheckCircle } from 'lucide-react';
import { collection, onSnapshot, query, where, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { PosCartItem } from '@/app/admin/pos/page';
import { useAuth } from '@/hooks/useAuth';
import { CustomerForm } from './CustomerForm';

const saleSchema = z.object({
  customerId: z.string().min(1, 'Debe seleccionar un cliente.'),
  paymentMethod: z.enum(['yapePlin', 'bankTransfer', 'card', 'mercadoPago', 'paypal'], {
    required_error: 'Debe seleccionar un método de pago.'
  }),
});

type SaleFormValues = z.infer<typeof saleSchema>;

interface CompleteSaleDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  cartItems: PosCartItem[];
  totalAmount: number;
  onSaleSuccess: () => void;
}

export function CompleteSaleDialog({ 
  isOpen, 
  setIsOpen, 
  cartItems, 
  totalAmount, 
  onSaleSuccess 
}: CompleteSaleDialogProps) {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<User[]>([]);
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  const { toast } = useToast();
  const { user: sellerUser } = useAuth();

  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      customerId: '',
      paymentMethod: 'yapePlin',
    },
  });

  useEffect(() => {
    if (isOpen) {
        const q = query(collection(db, "users"), where('role', '==', 'customer'));
        const unsubscribe = onSnapshot(q, snapshot => {
            setCustomers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)));
        });
        return () => unsubscribe();
    }
  }, [isOpen]);

  const onSubmit = async (data: SaleFormValues) => {
    setLoading(true);
    try {
      const selectedCustomer = customers.find(c => c.id === data.customerId);
      if (!selectedCustomer) {
        toast({ variant: 'destructive', title: 'Error', description: 'Cliente no encontrado.' });
        setLoading(false);
        return;
      }
      
      const orderItems: OrderItem[] = cartItems.map(item => ({
        itemId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.images[0] || '',
      }));

      await saveOrder(undefined, {
        userId: selectedCustomer.id,
        sellerId: sellerUser?.uid,
        items: orderItems,
        customerInfo: {
          name: selectedCustomer.name,
          email: selectedCustomer.email || '',
          phone: selectedCustomer.phone || '',
          address: selectedCustomer.address || '',
        },
        status: 'completed', // POS sales are completed immediately
        paymentMethod: data.paymentMethod,
        deliveryMethod: 'localPickup', // POS sales are local pickup
        deliveryDate: new Date(),
        totalAmount: totalAmount,
        pointsAwarded: false,
      });

      onSaleSuccess();
      form.reset();
    } catch (error: any) {
      console.error('Error completing sale: ', error);
      toast({
        variant: 'destructive',
        title: 'Error al completar la venta',
        description: error.message || 'No se pudo registrar la venta.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerFormSubmit = async (data: Partial<User>) => {
    try {
      const usersCollection = collection(db, 'users');
      const newDocRef = await addDoc(usersCollection, { 
        ...data, 
        role: 'customer', 
        createdAt: new Date(),
        orders: [],
        loyaltyPoints: 0,
      });
      
      const newCustomer = {id: newDocRef.id, ...data} as User
      form.setValue('customerId', newCustomer.id, { shouldValidate: true });

      toast({ title: 'Cliente añadido', description: 'El nuevo cliente ha sido creado y seleccionado.' });
      setIsCustomerFormOpen(false);
    } catch (error) {
       console.error("Error saving customer: ", error);
       toast({ variant: "destructive", title: "Error", description: "No se pudo guardar el cliente." });
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Finalizar Venta</DialogTitle>
            <DialogDescription>Confirma los detalles para completar la transacción.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
               <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un cliente" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="button" variant="outline" className="w-full" onClick={() => setIsCustomerFormOpen(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Añadir Nuevo Cliente
              </Button>

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Método de Pago</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="yapePlin">Yape/Plin</SelectItem>
                        <SelectItem value="bankTransfer">Transferencia</SelectItem>
                        <SelectItem value="card">Tarjeta (Comisión)</SelectItem>
                        <SelectItem value="mercadoPago">Mercado Pago</SelectItem>
                        <SelectItem value="paypal">Paypal</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="text-right space-y-1 pt-4">
                <p className="text-muted-foreground">Total a Pagar:</p>
                <p className="text-2xl font-bold">S/{totalAmount.toFixed(2)}</p>
              </div>

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={loading}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading || cartItems.length === 0}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                  Confirmar Venta
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <CustomerForm
        isOpen={isCustomerFormOpen}
        setIsOpen={setIsCustomerFormOpen}
        onSubmit={handleCustomerFormSubmit}
      />
    </>
  );
}
