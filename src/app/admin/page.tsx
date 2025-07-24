// src/app/admin/page.tsx
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
import Link from 'next/link';
import type { Order, User } from '@/types/firestore';
import { collection, onSnapshot, query, orderBy, limit, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { DashboardAlerts } from '@/components/admin/DashboardAlerts';

const MetricCard = ({ title, value, icon, description, loading }: { title: string, value: string, icon: React.ElementType, description: string, loading?: boolean }) => {
  const Icon = icon;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
            <div className="text-2xl font-bold">{value}</div>
        )}
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
};


const RecentOrdersTable = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(5));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const ordersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
            setOrders(ordersData);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const getStatusVariant = (status: Order['fulfillmentStatus']) => {
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
        return <p className="text-center text-muted-foreground py-4">No hay pedidos recientes.</p>;
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Pedidos Recientes</CardTitle>
                <CardDescription>Un resumen de los pedidos más recientes.</CardDescription>
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
                            <TableCell className="font-medium">{order.id.substring(0, 7)}...</TableCell>
                            <TableCell>{order.customerInfo.name}</TableCell>
                            <TableCell>S/{order.totalAmount.toFixed(2)}</TableCell>
                            <TableCell>
                                <Badge variant={getStatusVariant(order.fulfillmentStatus)}>{order.fulfillmentStatus}</Badge>
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

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    newCustomers: 0,
    completedSales: 0,
    completionRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Listener for orders
    const ordersQuery = query(collection(db, "orders"));
    const unsubOrders = onSnapshot(ordersQuery, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => doc.data() as Order);
      
      const completedOrders = ordersData.filter(o => o.fulfillmentStatus === 'completed');
      const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      const completionRate = ordersData.length > 0 ? (completedOrders.length / ordersData.length) * 100 : 0;
      
      setMetrics(prev => ({
        ...prev,
        totalRevenue,
        completedSales: completedOrders.length,
        completionRate
      }));
      if(!loading) setLoading(false);
    });

    // Listener for new customers this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const usersQuery = query(
      collection(db, "users"),
      where("role", "==", "customer")
    );
    const unsubUsers = onSnapshot(usersQuery, (snapshot) => {
      const usersData = snapshot.docs.map(doc => doc.data() as User);
      const newCustomersThisMonth = usersData.filter(user => {
        const createdAt = (user.createdAt as Timestamp)?.toDate();
        return createdAt && createdAt >= startOfMonth;
      });
      setMetrics(prev => ({ ...prev, newCustomers: newCustomersThisMonth.length }));
      if(!loading) setLoading(false);
    });
    
    setLoading(false);

    return () => {
      unsubOrders();
      unsubUsers();
    };
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
         <div className="flex items-center space-x-2">
            <Button asChild>
                <Link href="/admin/orders/create">+ Crear Pedido</Link>
            </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Ingresos Totales"
          value={`S/${metrics.totalRevenue.toFixed(2)}`}
          icon={DollarSign}
          description="Suma de pedidos completados"
          loading={loading}
        />
        <MetricCard
          title="Nuevos Clientes (Mes)"
          value={`+${metrics.newCustomers}`}
          icon={Users}
          description="Clientes registrados este mes"
          loading={loading}
        />
        <MetricCard
          title="Ventas Completadas"
          value={`${metrics.completedSales}`}
          icon={CreditCard}
          description="Pedidos entregados y pagados"
          loading={loading}
        />
        <MetricCard
          title="Tasa de Pedidos Completados"
          value={`${metrics.completionRate.toFixed(1)}%`}
          icon={Activity}
          description="Porcentaje de pedidos finalizados"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2">
           <RecentOrdersTable />
        </div>
        <div>
          <DashboardAlerts />
        </div>
      </div>
    </div>
  );
}
