// src/app/sales/page.tsx
'use client';
import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { DollarSign, Users, CreditCard, Activity, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Order } from '@/types/firestore';
import Link from 'next/link';

const MetricCard = ({ title, value, icon, description }: { title: string, value: string, icon: React.ElementType, description: string }) => {
  const Icon = icon;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};

const RecentOrdersTable = ({ sellerId }: { sellerId: string }) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!sellerId) return;

        const q = query(
            collection(db, "orders"), 
            orderBy("createdAt", "desc"),
            limit(5)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const ordersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)).filter(order => order.sellerId === sellerId);
            setOrders(ordersData);
            setLoading(false);
        }, (error) => {
          console.error(error);
          setLoading(false);
        });

        return () => unsubscribe();
    }, [sellerId]);
    
     const getStatusVariant = (status: Order['status']) => {
        switch (status) {
        case 'completed': return 'default';
        case 'processing': return 'secondary';
        case 'finishing': return 'outline';
        case 'cancelled': return 'destructive';
        case 'pending': return 'secondary';
        default: return 'outline';
        }
    };
    
    if (loading) {
        return <div className="flex justify-center items-center h-40"><Loader2 className="animate-spin" /></div>;
    }

    if (orders.length === 0) {
        return <p className="text-center text-muted-foreground py-4">No has gestionado pedidos recientes.</p>;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Mis Pedidos Recientes</CardTitle>
                <CardDescription>Un resumen de los pedidos que has gestionado.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Pedido</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead>Fecha</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order) => (
                        <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.id.substring(0,7)}...</TableCell>
                            <TableCell>{order.customerInfo.name}</TableCell>
                            <TableCell>S/{order.totalAmount.toFixed(2)}</TableCell>
                            <TableCell>
                                <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                            </TableCell>
                            <TableCell>{new Date((order.createdAt as any).seconds * 1000).toLocaleDateString()}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

export default function SalesDashboardPage() {
    const { user } = useAuth();
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard de Ventas</h1>
         <div className="flex items-center space-x-2">
            <Button asChild>
                <Link href="/sales/orders/create">+ Crear Pedido</Link>
            </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Mis Ingresos (Mes)"
          value="S/0.00"
          icon={DollarSign}
          description="Calculando..."
        />
        <MetricCard
          title="Nuevos Clientes (Mes)"
          value="0"
          icon={Users}
          description="Asignados a tu cartera"
        />
        <MetricCard
          title="Mis Ventas (Mes)"
          value="0"
          icon={CreditCard}
          description="Calculando..."
        />
        <MetricCard
          title="Mi Tasa de Cierre"
          value="0%"
          icon={Activity}
          description="Calculando..."
        />
      </div>

      {user && <RecentOrdersTable sellerId={user.uid} />}
    </div>
  );
}
