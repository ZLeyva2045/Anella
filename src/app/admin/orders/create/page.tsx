// src/app/admin/orders/create/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandInput, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import type { User, Product } from '@/types/firestore';
import { saveOrder } from '@/services/orderService';
import { collection, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Loader2, Save, Trash2, UserPlus, CalendarIcon, Search } from 'lucide-react';
import { CustomerForm } from '@/components/shared/CustomerForm';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CartItem extends Product {
  quantity: number;
}

const orderItemSchema = z.object({
  itemId: z.string(),
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
  items: z.array(orderItemSchema).min(1, 'El pedido debe tener al menos un producto.'),
  paymentMethod: z.enum(['yapePlin', 'bankTransfer', 'card', 'mercadoPago', 'paypal']),
  deliveryMethod: z.enum(['localPickup', 'delivery']),
  status: z.enum(['pending', 'processing', 'finishing', 'completed', 'cancelled']),
  deliveryDate: z.date({
    required_error: "La fecha de entrega es requerida.",
  }),
});

type OrderFormValues = z.infer<typeof orderSchema>;

export default function CreateOrderPage() {
  const [customers, setCustomers] = useState<User[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inventory, setInventory] = useState<Product[]>([]);
  const [searchPopoverOpen, setSearchPopoverOpen] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');


  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      customer: { id: '', name: '', email: '', phone: '', address: '' },
      items: [],
      paymentMethod: 'yapePlin',
      deliveryMethod: 'localPickup',
      status: 'pending',
      deliveryDate: new Date(),
    },
  });

  const { fields, remove, append } = useFieldArray({
    control: form.control,
    name: "items",
  });
  
  const addProductToOrder = (product: Product) => {
    const existingItem = fields.find(item => item.itemId === product.id);
    if (existingItem) {
        toast({ variant: 'destructive', title: 'Producto ya añadido', description: 'Este producto ya está en el pedido.'})
        return;
    }
    append({
        itemId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.images[0] || '',
    });
    setSearchPopoverOpen(false);
  }

  useEffect(() => {
    // Load cart from localStorage
    const savedCart = localStorage.getItem('pendingOrderCart');
    if (savedCart) {
      const parsedCart: CartItem[] = JSON.parse(savedCart);
      form.setValue('items', parsedCart.map(p => ({ itemId: p.id, name: p.name, price: p.price, quantity: p.quantity, image: p.images[0] || '' })));
      localStorage.removeItem('pendingOrderCart');
    }

    // Load customers
    const unsubCustomers = onSnapshot(collection(db, "users"), (snapshot) => {
      const customersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      setCustomers(customersData);
    });
    
    // Load inventory
    const unsubInventory = onSnapshot(collection(db, 'products'), (snapshot) => {
        setInventory(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()} as Product)));
    });

    return () => {
      unsubCustomers();
      unsubInventory();
    };
  }, [form]);
  
  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(customerSearchQuery.toLowerCase())
  );

  useEffect(() => {
    if (selectedCustomer) {
      form.setValue('customer', {
        id: selectedCustomer.id,
        name: selectedCustomer.name || '',
        email: selectedCustomer.email || '',
        phone: selectedCustomer.phone || '',
        address: selectedCustomer.address || '',
      });
    } else {
        form.setValue('customer', { id: '', name: '', email: '', phone: '', address: '' });
    }
  }, [selectedCustomer, form]);

  const totalAmount = useMemo(() => {
    return form.watch('items').reduce((acc, p) => acc + p.price * p.quantity, 0);
  }, [form.watch('items')]);

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
            userId: data.customer.id,
            sellerId: user.uid,
            customerInfo: {
                name: data.customer.name,
                email: data.customer.email,
                phone: data.customer.phone,
                address: data.customer.address,
            },
        });
        toast({ title: 'Pedido Creado', description: 'El nuevo pedido se ha guardado correctamente.' });
        router.push('/admin/orders');
    } catch (error) {
        console.error("Error creating order: ", error);
        toast({ variant: 'destructive', title: 'Error', description: 'No se pudo crear el pedido.' });
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
        setSelectedCustomer(newCustomer)

        toast({ title: 'Cliente añadido', description: 'El nuevo cliente ha sido creado y seleccionado.' });
        setIsCustomerFormOpen(false);
    } catch (error) {
       console.error("Error saving customer: ", error);
       toast({ variant: "destructive", title: "Error", description: "No se pudo guardar el cliente." });
    }
  }
  
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
                        <CardDescription>Busca y añade productos del inventario al pedido.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Popover open={searchPopoverOpen} onOpenChange={setSearchPopoverOpen}>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start">
                                    <Search className="mr-2 h-4 w-4" />
                                    Buscar producto para añadir...
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                                <Command>
                                    <CommandInput placeholder="Buscar por nombre..." />
                                    <CommandList>
                                        <CommandEmpty>No se encontraron productos.</CommandEmpty>
                                        <CommandGroup>
                                            {inventory.map(product => (
                                                <CommandItem
                                                    key={product.id}
                                                    value={product.name}
                                                    onSelect={() => addProductToOrder(product)}
                                                >
                                                    {product.name}
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </CommandList>
                                </Command>
                            </PopoverContent>
                        </Popover>
                        <Separator className="my-4" />
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
                                {fields.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                                            Añade productos para empezar
                                        </TableCell>
                                    </TableRow>
                                )}
                                {fields.map((field, index) => (
                                    <TableRow key={field.id}>
                                        <TableCell className="flex items-center gap-2">
                                            <Image src={field.image || '/placeholder.svg'} alt={field.name} width={40} height={40} className="rounded-md" />
                                            <div>
                                                <p className="font-medium">{field.name}</p>
                                                <p className="text-sm text-muted-foreground">S/{field.price.toFixed(2)}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Input 
                                                type="number" 
                                                min={1}
                                                className="w-20"
                                                {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right">S/{(field.price * form.watch(`items.${index}.quantity`)).toFixed(2)}</TableCell>
                                        <TableCell>
                                            <Button variant="ghost" size="icon" onClick={() => remove(index)}>
                                                <Trash2 className="h-4 w-4 text-destructive"/>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                         <FormMessage>{form.formState.errors.items?.message}</FormMessage>
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
                       <div className="space-y-2">
                            <FormLabel>Cliente</FormLabel>
                            <div className="p-2 border rounded-md min-h-[40px] bg-muted">
                                {selectedCustomer?.name || <span className="text-muted-foreground">Ningún cliente seleccionado</span>}
                            </div>
                            <Command className="border rounded-lg">
                                <CommandInput 
                                    placeholder="Buscar cliente..."
                                    value={customerSearchQuery}
                                    onValueChange={setCustomerSearchQuery}
                                />
                                <CommandList>
                                    <ScrollArea className="h-48">
                                    <CommandEmpty>No se encontró el cliente.</CommandEmpty>
                                    <CommandGroup>
                                        {filteredCustomers.map((customer) => (
                                            <CommandItem
                                                key={customer.id}
                                                value={customer.name}
                                                onSelect={() => {
                                                    setSelectedCustomer(customer);
                                                    form.setValue('customer.id', customer.id, { shouldValidate: true });
                                                    setCustomerSearchQuery('');
                                                }}
                                                className="cursor-pointer"
                                            >
                                            <div>
                                                <p>{customer.name}</p>
                                                <p className="text-xs text-muted-foreground">{customer.email}</p>
                                            </div>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                    </ScrollArea>
                                </CommandList>
                            </Command>
                             <FormMessage>{form.formState.errors.customer?.id?.message}</FormMessage>
                        </div>
                         <Button variant="outline" className="w-full" onClick={() => setIsCustomerFormOpen(true)}>
                            <UserPlus className="mr-2 h-4 w-4" />
                            Añadir Nuevo Cliente
                        </Button>
                        <Separator />
                         <FormField control={form.control} name="customer.name" render={({ field }) => ( <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} readOnly /></FormControl></FormItem> )} />
                         <FormField control={form.control} name="customer.email" render={({ field }) => ( <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} readOnly /></FormControl></FormItem> )} />
                         <FormField control={form.control} name="customer.address" render={({ field }) => ( <FormItem><FormLabel>Dirección</FormLabel><FormControl><Input {...field} /></FormControl></FormItem> )} />
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>Detalles del Pedido</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField control={form.control} name="deliveryDate" render={({ field }) => (
                            <FormItem className="flex flex-col">
                                <FormLabel>Fecha de Entrega</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                {field.value ? format(field.value, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus locale={es} />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField control={form.control} name="paymentMethod" render={({ field }) => ( <FormItem><FormLabel>Método de Pago</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="yapePlin">Yape/Plin</SelectItem><SelectItem value="bankTransfer">Transferencia</SelectItem><SelectItem value="card">Tarjeta (Comisión)</SelectItem><SelectItem value="mercadoPago">Mercado Pago</SelectItem><SelectItem value="paypal">Paypal</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="deliveryMethod" render={({ field }) => ( <FormItem><FormLabel>Método de Entrega</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="localPickup">Recojo en Local</SelectItem><SelectItem value="delivery">Delivery</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                        <FormField control={form.control} name="status" render={({ field }) => ( <FormItem><FormLabel>Estado del Pedido</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="pending">Pendiente</SelectItem><SelectItem value="processing">En Curso</SelectItem><SelectItem value="finishing">Por Terminar</SelectItem><SelectItem value="completed">Terminado</SelectItem><SelectItem value="cancelled">Cancelado</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
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
      <CustomerForm isOpen={isCustomerFormOpen} setIsOpen={setIsCustomerFormOpen} onSubmit={handleCustomerFormSubmit} />
    </>
  );
}
