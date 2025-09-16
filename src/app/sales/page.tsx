// src/app/sales/page.tsx
'use client';
import React, { useEffect, useState, useCallback } from 'react';
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
import { DollarSign, Users, CreditCard, Activity, Loader2, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { collection, query, where, onSnapshot, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import type { Order } from '@/types/firestore';
import Link from 'next/link';
import { QrCodeScannerDialog } from '@/components/shared/QrCodeScannerDialog';
import { useToast } from '@/hooks/use-toast';
import { recordAttendance } from '@/services/attendanceService';

const MetricCard = ({ title, value, icon, loading, link, linkText }: { title: string, value: string | number, icon: React.ElementType, loading?: boolean, link?: string, linkText?: string }) => {
  const Icon = icon;
  return (
    <Card className="transition-transform duration-300 hover:-translate-y-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-5 w-5 text-muted-foreground" />
       </CardHeader>
       <CardContent>
            {loading ? (
                <Loader2 className="h-8 w-8 animate-spin mt-1" />
            ) : (
               <>
                <div className="text-2xl font-bold">{typeof value === 'number' && title.toLowerCase().includes('ingresos') ? `S/${value.toFixed(2)}` : value}</div>
                {link && linkText && (
                  <Link href={link} className="text-xs text-muted-foreground hover:text-primary transition-colors">
                    {linkText}
                  </Link>
                )}
               </>
            )}
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
            where("sellerId", "==", sellerId),
            orderBy("createdAt", "desc"),
            limit(5)
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const ordersData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
            setOrders(ordersData);
            setLoading(false);
        }, (error) => {
          console.error(error);
          setLoading(false);
        });

        return () => unsubscribe();
    }, [sellerId]);
    
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

    return (
        <Card className="mt-8 overflow-hidden">
            <CardHeader>
                <CardTitle>Mis Pedidos Recientes</CardTitle>
                 <CardDescription>Los últimos 5 pedidos que has gestionado.</CardDescription>
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
                        {orders.length === 0 ? (
                             <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground py-4">No has gestionado pedidos recientes.</TableCell>
                            </TableRow>
                        ) : orders.map((order) => (
                        <TableRow key={order.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => window.location.href = `/sales/orders/${order.id}`}>
                            <TableCell className="font-medium">{order.id.substring(0,7)}...</TableCell>
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

export default function SalesDashboardPage() {
    const { user, firestoreUser } = useAuth();
    const [metrics, setMetrics] = useState({
        monthlyRevenue: 0,
        monthlySalesCount: 0,
        newCustomersCount: 0,
    });
    const [loading, setLoading] = useState(true);
    const [isScannerOpen, setIsScannerOpen] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (!user) return;
        setLoading(true);

        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const startOfMonthTimestamp = Timestamp.fromDate(startOfMonth);

        const ordersQuery = query(
            collection(db, "orders"),
            where("sellerId", "==", user.uid),
            where("createdAt", ">=", startOfMonthTimestamp)
        );

        const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
            const monthlyOrders = snapshot.docs.map(doc => doc.data() as Order);
            
            const revenue = monthlyOrders.reduce((sum, order) => sum + order.totalAmount, 0);
            const salesCount = monthlyOrders.length;
            
            setMetrics(prev => ({
                ...prev,
                monthlyRevenue: revenue,
                monthlySalesCount: salesCount,
            }));
            
            setTimeout(() => setLoading(false), 500);
        });

        // Add a listener for new customers if needed
        // const customersQuery = query(collection(db, "users"), where("role", "==", "customer"), where("createdAt", ">=", startOfMonthTimestamp));
        // ...

        return () => unsubscribe();

    }, [user]);

    const handleScanSuccess = useCallback(async (qrContent: string) => {
      setIsScannerOpen(false);
      if (!firestoreUser) return;
  
      try {
        await recordAttendance(firestoreUser.id, qrContent);
        toast({
          title: 'Asistencia Registrada',
          description: 'Tu entrada/salida ha sido registrada correctamente.',
        });
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error al registrar',
          description: error.message,
        });
      }
    }, [firestoreUser, toast]);


    return (
      <>
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Dashboard de Ventas</h1>
                <p className="text-muted-foreground">{new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Mis Ingresos (Mes)"
                    value={metrics.monthlyRevenue}
                    icon={DollarSign}
                    loading={loading}
                />
                <MetricCard
                    title="Mis Ventas (Mes)"
                    value={metrics.monthlySalesCount}
                    icon={CreditCard}
                    loading={loading}
                    link="/sales/orders"
                    linkText="Ver todos mis pedidos"
                />
                 <Card className="flex flex-col justify-center items-center p-6 bg-primary text-primary-foreground transition-transform duration-300 hover:-translate-y-1">
                    <Button onClick={() => setIsScannerOpen(true)} className="w-full h-full flex flex-col gap-2 bg-transparent hover:bg-white/10">
                        <QrCode className="h-8 w-8" />
                        <span className="font-semibold">Registrar Asistencia</span>
                    </Button>
                </Card>
                <MetricCard
                    title="Nuevos Clientes"
                    value={metrics.newCustomersCount}
                    icon={Users}
                    loading={loading}
                    link="/sales/customers"
                    linkText="Gestionar clientes"
                />
            </div>

            {user && <RecentOrdersTable sellerId={user.uid} />}
        </div>
        <QrCodeScannerDialog
          isOpen={isScannerOpen}
          setIsOpen={setIsScannerOpen}
          onScanSuccess={handleScanSuccess}
        />
      </>
    );
}
