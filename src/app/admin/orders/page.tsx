// src/app/admin/orders/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  MoreHorizontal,
  PlusCircle,
  Truck,
  CheckCircle2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Order } from '@/types/firestore';
// En una implementación real, se obtendrían de Firestore
// import { collection, onSnapshot } from 'firebase/firestore';
// import { db } from '@/lib/firebase/config';

// Datos de ejemplo
const mockOrders: Order[] = [
  { id: 'ORD001', userId: 'usr1', customerInfo: { name: 'Liam Johnson', email: 'liam@test.com', phone: '123', address: '123 Main' }, products: [], status: 'delivered', paymentMethod: 'creditCard', deliveryMethod: 'homeDelivery', createdAt: new Date('2023-11-23'), totalAmount: 250.00 },
  { id: 'ORD002', userId: 'usr2', customerInfo: { name: 'Olivia Smith', email: 'olivia@test.com', phone: '123', address: '123 Main' }, products: [], status: 'shipped', paymentMethod: 'creditCard', deliveryMethod: 'homeDelivery', createdAt: new Date('2023-11-22'), totalAmount: 150.75 },
  { id: 'ORD003', userId: 'usr3', customerInfo: { name: 'Noah Williams', email: 'noah@test.com', phone: '123', address: '123 Main' }, products: [], status: 'processing', paymentMethod: 'paypal', deliveryMethod: 'homeDelivery', createdAt: new Date('2023-11-21'), totalAmount: 350.00 },
  { id: 'ORD004', userId: 'usr4', customerInfo: { name: 'Emma Brown', email: 'emma@test.com', phone: '123', address: '123 Main' }, products: [], status: 'pending', paymentMethod: 'bankTransfer', deliveryMethod: 'storePickup', createdAt: new Date('2023-11-20'), totalAmount: 450.50 },
  { id: 'ORD005', userId: 'usr5', customerInfo: { name: 'Ava Jones', email: 'ava@test.com', phone: '123', address: '123 Main' }, products: [], status: 'cancelled', paymentMethod: 'creditCard', deliveryMethod: 'homeDelivery', createdAt: new Date('2023-11-19'), totalAmount: 55.00 },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [loading, setLoading] = useState(false); // Cambiar a true al usar Firestore

  // Lógica de Firestore (descomentar para usar)
  /*
  useEffect(() => {
    setLoading(true);
    const ordersCollection = collection(db, 'orders');
    const unsubscribe = onSnapshot(ordersCollection, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(ordersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  */

  const getStatusVariant = (status: Order['status']) => {
    switch (status) {
      case 'delivered': return 'default';
      case 'processing': return 'secondary';
      case 'shipped': return 'outline';
      case 'cancelled': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Pedidos</h1>
          <p className="text-muted-foreground">
            Visualiza y gestiona todos los pedidos de la tienda.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Crear Pedido
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos los Pedidos</CardTitle>
          <CardDescription>
            Un listado completo de los pedidos recibidos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead className="hidden md:table-cell">Fecha</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>
                  <span className="sr-only">Acciones</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.customerInfo.name}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {new Intl.DateTimeFormat('es-PE').format(order.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(order.status)} className="capitalize">{order.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    S/{order.totalAmount.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-haspopup="true"
                          size="icon"
                          variant="ghost"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem>Ver Detalles</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Truck className="mr-2 h-4 w-4" />
                          Marcar como Enviado
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Marcar como Entregado
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
