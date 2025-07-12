// src/app/sales/orders/create/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import type { User, Product } from '@/types/firestore';
import { saveOrder } from '@/services/orderService';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Loader2, Save, Trash2, UserPlus } from 'lucide-react';
import { CustomerForm } from '@/components/shared/CustomerForm';

interface CartItem extends Product {
  quantity: number;
}

const orderProductSchema = z.object({
  productId: z.string(),
  name: z.string(),
  price: z.number(),
  quantity: z.number().min(1),
  image: z.string(),
});

const orderSchema = z.object({
  customer: z.object({
    id: z.string().min(1, 'Debe seleccionar un cliente.'),
    name: z.string(),
    email: z.string(),
    phone: z.string(),
    address: z.string(),
  }),
  products: z.array(orderProductSchema).min(1, 'El pedido debe tener al menos un producto.'),
  paymentMethod: z.enum(['creditCard', 'paypal', 'bankTransfer']),
  deliveryMethod: z.enum(['storePickup', 'homeDelivery']),
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
});

type OrderFormValues = z.infer<typeof orderSchema>;

export default function CreateOrderPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customers, setCustomers] = useState<User[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customer: { id: '', name: '', email: '', phone: '', address: '' },
      products: [],
      paymentMethod: 'creditCard',
      deliveryMethod: 'storePickup',
      status: 'processing',
    },
  });

  const { fields, remove } = useFieldArray({
    control: form.control,
    name: "products",
  });

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('pendingOrderCart');
    if (savedCart) {
      const parsedCart: CartItem[] = JSON.parse(savedCart);
      setCartItems(parsedCart);
      form.setValue('products', parsedCart.map(p => ({ productId: p.id, name: p.name, price: p.price, quantity: p.quantity, image: p.images[0] })));
      localStorage.removeItem('pendingOrderCart');
    }

    // Load customers
    const fetchCustomers = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      const customersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      setCustomers(customersData);
    };
    fetchCustomers();
  }, [form]);

  useEffect(() => {
    if (selectedCustomer) {
      form.setValue('customer', {
        id: selectedCustomer.id,
        name: selectedCustomer.name || '',
        email: selectedCustomer.email || '',
        phone: selectedCustomer.phone || '',
        address: selectedCustomer.address || '',
      });
    }
  }, [selectedCustomer, form]);

  const totalAmount = useMemo(() => {
    return form.watch('products').reduce((acc, p) => acc + p.price * p.quantity, 0);
  }, [form.watch('products')]);

  const onSubmit = async (data: OrderFormValues) => {
    if (!user) {
        toast({ variant: 'destructive', title: 'Error', description: 'Debe iniciar sesión para crear un pedido.' });
        return;
    }
    setLoading(true);
    try {
        await saveOrder(undefined, {
            ...data,
            totalAmount: totalAmount,
            userId: user.uid,
            sellerId: user.uid, // Assuming the creator is the seller
            customerInfo: {
                name: data.customer.name,
                email: data.customer.email,
                phone: data.customer.phone,
                address: data.customer.address,
            },
            products: data.products.map(p => ({ productId: p.productId, quantity: p.quantity })),
        });
        toast({ title: 'Pedido Creado', description: 'El nuevo pedido se ha guardado correctamente.' });
        router.push('/sales/orders');
    } catch (error) {
        console.error("Error creating order: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo crear el pedido.' });
    } finally {
        setLoading(false);
    }
  };
  
  return (
    <>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Crear Nuevo Pedido</h1>
          <p className="text-muted-foreground">
            Completa la información para registrar el nuevo pedido.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main form */}
            <div className="lg:col-span-2 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Productos del Pedido</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Producto</TableHead>
                                    <TableHead>Cantidad</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead />
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {fields.map((field, index) => (
                                    <TableRow key={field.id}>
                                        <TableCell className="flex items-center gap-2">
                                            <Image src={field.image} alt={field.name} width={40} height={40} className="rounded-md" />
                                            <div>
                                                <p className="font-medium">{field.name}</p>
                                                <p className="text-sm text-muted-foreground">S/{field.price.toFixed(2)}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Input 
                                                type="number" 
                                                className="w-20"
                                                {...form.register(`products.${index}.quantity`, { valueAsNumber: true })}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right">S/{(field.price * form.watch(`products.${index}.quantity`)).toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" onClick={() => remove(index)}>
                                                <Trash2 className="h-4 w-4 text-destructive"/>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                         <FormMessage>{form.formState.errors.products?.message}</FormMessage>
                    </CardContent>
                </Card>
            </div>
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Información del Cliente</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="customer.id"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Seleccionar Cliente</FormLabel>
                                <Select onValueChange={(value) => {
                                    field.onChange(value);
                                    const customer = customers.find(c => c.id === value);
                                    setSelectedCustomer(customer || null);
                                }}>
                                    <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Busca o selecciona un cliente" />
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
                         <Button variant="outline" className="w-full" onClick={() => setIsCustomerFormOpen(true)}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Añadir Nuevo Cliente
                        </Button>
                        <Separator />
                         <FormField control={form.control} name="customer.name" render={({ field }) => ( <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} disabled /></FormControl></FormItem> )} />
                         <FormField control={form.control} name="customer.email" render={({ field }) => ( <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} disabled /></FormControl></FormItem> )} />
                         <FormField control={form.control} name="customer.address" render={({ field }) => ( <FormItem><FormLabel>Dirección</FormLabel><FormControl><Input {...field} /></FormControl></FormItem> )} />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Detalles del Pedido</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <FormField control={form.control} name="paymentMethod" render={({ field }) => ( <FormItem><FormLabel>Método de Pago</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="creditCard">Tarjeta</SelectItem><SelectItem value="bankTransfer">Transferencia</SelectItem><SelectItem value="paypal">Paypal</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                         <FormField control={form.control} name="deliveryMethod" render={({ field }) => ( <FormItem><FormLabel>Método de Entrega</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="storePickup">Recojo en tienda</SelectItem><SelectItem value="homeDelivery">Delivery</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                         <CardTitle>Resumen</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between"><span>Subtotal</span><span>S/{totalAmount.toFixed(2)}</span></div>
                        <div className="flex justify-between"><span>IGV (18%)</span><span>S/{(totalAmount * 0.18).toFixed(2)}</span></div>
                         <div className="flex justify-between font-bold text-lg pt-2 border-t"><span>Total</span><span>S/{(totalAmount * 1.18).toFixed(2)}</span></div>
                    </CardContent>
                </Card>

                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                    {loading && <Loader2 className="mr-2 animate-spin" />}
                    <Save className="mr-2"/>
                    Guardar Pedido
                </Button>
            </div>
          </form>
        </Form>
      </div>
      <CustomerForm isOpen={isCustomerFormOpen} setIsOpen={setIsCustomerFormOpen} />
    </>
  );
}
