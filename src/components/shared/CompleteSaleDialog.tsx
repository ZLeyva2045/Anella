// src/components/shared/CompleteSaleDialog.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import type { User, OrderItem, PaymentMethod, PaymentDetail } from '@/types/firestore';
import { saveOrder } from '@/services/orderService';
import { Loader2, UserPlus, CheckCircle, Search, DollarSign } from 'lucide-react';
import { collection, onSnapshot, query, where, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { PosCartItem } from '@/app/admin/pos/page';
import { useAuth } from '@/hooks/useAuth';
import { CustomerForm } from './CustomerForm';
import { Input } from '@/components/ui/input';
import { useClickAway } from 'react-use';


const saleSchema = z.object({
  customerId: z.string().min(1, 'Debe seleccionar un cliente.'),
  paymentMethod: z.custom<PaymentMethod>((val) => typeof val === 'string' && val.length > 0, 'Debe seleccionar un método de pago.'),
  amountPaid: z.coerce.number().min(0, 'El monto pagado no puede ser negativo.'),
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
  const [allCustomers, setAllCustomers] = useState<User[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<User[]>([]);
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomerName, setSelectedCustomerName] = useState('');
  const [isListVisible, setIsListVisible] = useState(false);
  
  const searchContainerRef = useRef(null);
  
  const { toast } = useToast();
  const { user: sellerUser } = useAuth();
  
  useClickAway(searchContainerRef, () => {
    setIsListVisible(false);
  });

  const form = useForm<SaleFormValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      customerId: '',
      paymentMethod: 'cash',
      amountPaid: 0,
    },
  });
  
   useEffect(() => {
    if (isOpen) {
      form.setValue('amountPaid', totalAmount);
    }
  }, [isOpen, totalAmount, form]);


  useEffect(() => {
    if (isOpen) {
        const q = query(collection(db, "users"), where('role', '==', 'customer'));
        const unsubscribe = onSnapshot(q, snapshot => {
            setAllCustomers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)));
        });
        return () => unsubscribe();
    } else {
        form.reset();
        setSearchQuery('');
        setSelectedCustomerName('');
        setFilteredCustomers([]);
    }
  }, [isOpen, form]);
  
  useEffect(() => {
    if (searchQuery.length > 1) {
      const filtered = allCustomers.filter(customer =>
        customer.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCustomers(filtered);
      setIsListVisible(true);
    } else {
      setFilteredCustomers([]);
      setIsListVisible(false);
    }
  }, [searchQuery, allCustomers]);


  const onSubmit = async (data: SaleFormValues) => {
    setLoading(true);
    try {
      const customer = allCustomers.find(c => c.id === data.customerId);
      if (!customer) {
        toast({ variant: 'destructive', title: 'Error', description: 'Cliente no encontrado.' });
        setLoading(false);
        return;
      }
       if (data.amountPaid > totalAmount) {
        toast({ variant: 'destructive', title: 'Error', description: 'El pago no puede ser mayor al total.' });
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
      
      const paymentDetails: PaymentDetail[] = [];
      if (data.amountPaid > 0) {
        paymentDetails.push({
            amount: data.amountPaid,
            method: data.paymentMethod,
            date: Timestamp.now(),
        });
      }

      await saveOrder(undefined, {
        userId: customer.id,
        sellerId: sellerUser?.uid,
        items: orderItems,
        customerInfo: {
          name: customer.name,
          email: customer.email || '',
          phone: customer.phone || '',
          address: customer.address || '',
        },
        deliveryMethod: 'localPickup',
        deliveryDate: new Date(),
        totalAmount: totalAmount,
        amountPaid: data.amountPaid, // Pass this to the service
        paymentDetails, // Pass this to the service
        fulfillmentStatus: 'completed'
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
      handleSelectCustomer(newCustomer);
      toast({ title: 'Cliente añadido', description: 'El nuevo cliente ha sido creado y seleccionado.' });
      setIsCustomerFormOpen(false);
    } catch (error) {
       console.error("Error saving customer: ", error);
       toast({ variant: "destructive", title: "Error", description: "No se pudo guardar el cliente." });
    }
  }
  
  const handleSelectCustomer = (customer: User) => {
    form.setValue('customerId', customer.id, { shouldValidate: true });
    setSelectedCustomerName(customer.name);
    setSearchQuery(customer.name);
    setIsListVisible(false);
  };

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

              <FormItem ref={searchContainerRef}>
                <FormLabel>Buscar Cliente</FormLabel>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Escribe para buscar..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if(form.getValues('customerId')) {
                           form.setValue('customerId', '');
                           setSelectedCustomerName('');
                        }
                    }}
                    onFocus={() => setIsListVisible(searchQuery.length > 1)}
                  />
                </div>
                {isListVisible && filteredCustomers.length > 0 && (
                  <div className="absolute z-10 w-[calc(100%-3rem)] bg-background border rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                    {filteredCustomers.map(customer => (
                      <div
                        key={customer.id}
                        className="p-2 hover:bg-accent cursor-pointer"
                        onClick={() => handleSelectCustomer(customer)}
                      >
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">{customer.email}</p>
                      </div>
                    ))}
                  </div>
                )}
                <FormMessage>{form.formState.errors.customerId?.message}</FormMessage>
              </FormItem>


              <Button type="button" variant="outline" className="w-full" onClick={() => setIsCustomerFormOpen(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Añadir Nuevo Cliente
              </Button>
              
               <div className="grid grid-cols-2 gap-4">
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
                  <FormField
                    control={form.control}
                    name="amountPaid"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Adelanto (S/)</FormLabel>
                             <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <FormControl><Input type="number" step="0.01" className="pl-9" {...field} /></FormControl>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />
               </div>


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
