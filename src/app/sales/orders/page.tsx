// src/app/sales/orders/page.tsx
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
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  Loader2,
  Eye,
} from 'lucide-react';
import type { Order, FulfillmentStatus, PaymentStatus } from '@/types/firestore';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SalesOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    
    const ordersCollection = collection(db, 'orders');
    // Sales users can see all orders, but could be filtered by sellerId if needed
    // const q = query(ordersCollection, where("sellerId", "==", user.uid));
    const q = query(ordersCollection, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching orders: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const getFulfillmentStatusInfo = (status: FulfillmentStatus) => {
    switch (status) {
      case 'completed': return { variant: 'default', text: 'Entregado', icon: CheckCircle2 };
      case 'processing': return { variant: 'secondary', text: 'En Curso', icon: Clock };
      case 'finishing': return { variant: 'outline', text: 'Por Terminar', icon: Sparkles };
      case 'cancelled': return { variant: 'destructive', text: 'Cancelado', icon: XCircle };
      case 'pending': default: return { variant: 'secondary', text: 'Pendiente', icon: Clock };
    }
  };
  
  const getPaymentStatusInfo = (status: PaymentStatus) => {
      switch (status) {
          case 'paid': return { variant: 'default', text: 'Pagado', color: 'text-green-600' };
          case 'partially-paid': return { variant: 'outline', text: 'Parcial', color: 'text-amber-600' };
          case 'unpaid': default: return { variant: 'destructive', text: 'No Pagado', color: 'text-red-600' };
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
          <Button asChild>
            <Link href="/sales/orders/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Crear Pedido
            </Link>
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
          {loading ? (
             <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="hidden md:table-cell">F. Entrega</TableHead>
                  <TableHead>Pago</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead>
                    <span className="sr-only">Acciones</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => {
                  const fulfillmentStatusInfo = getFulfillmentStatusInfo(order.fulfillmentStatus);
                  const paymentStatusInfo = getPaymentStatusInfo(order.paymentStatus);
                  return (
                    <TableRow key={order.id} className="cursor-pointer" onClick={() => router.push(`/sales/orders/${order.id}`)}>
                      <TableCell className="font-medium">{order.id.substring(0, 7)}...</TableCell>
                      <TableCell>{order.customerInfo.name}</TableCell>
                      <TableCell className="hidden md:table-cell">
                         {order.deliveryDate ? new Intl.DateTimeFormat('es-PE').format(order.deliveryDate.toDate()) : 'N/A'}
                      </TableCell>
                       <TableCell>
                        <Badge variant={paymentStatusInfo.variant} className={`capitalize ${paymentStatusInfo.color}`}>{paymentStatusInfo.text}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={fulfillmentStatusInfo.variant} className="capitalize">{fulfillmentStatusInfo.text}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        S/{order.totalAmount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Ver Detalles</span>
                          </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
