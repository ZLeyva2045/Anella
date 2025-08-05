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
import { BarcodeScannerDialog } from '@/components/shared/BarcodeScannerDialog';
import { useToast } from '@/hooks/use-toast';
import { recordAttendance } from '@/services/attendanceService';

const MetricCard = ({ title, value, icon, loading }: { title: string, value: string, icon: React.ElementType, loading?: boolean }) => {
  const Icon = icon;
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm flex items-center gap-6">
       <div className="p-3 rounded-full bg-secondary text-primary">
            <Icon className="h-7 w-7" />
       </div>
       <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            {loading ? (
                <Loader2 className="h-8 w-8 animate-spin mt-1" />
            ) : (
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            )}
       </div>
    </div>
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
        <div className="mt-10 bg-white rounded-lg shadow-sm overflow-hidden">
            <h2 className="text-lg font-semibold text-gray-900 p-6">Mis Pedidos Recientes</h2>
             <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="text-xs text-gray-700 uppercase bg-pink-50">
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
                        <TableRow key={order.id}>
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
            </div>
        </div>
    )
}

export default function SalesDashboardPage() {
    const { user, firestoreUser } = useAuth();
    const [metrics, setMetrics] = useState({
        monthlyRevenue: 0,
        monthlySalesCount: 0,
        newCustomersCount: 0,
        closeRate: 0,
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
            
            const completedOrders = monthlyOrders.filter(o => o.fulfillmentStatus === 'completed');
            
            const revenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
            const salesCount = completedOrders.length;
            
            setMetrics(prev => ({
                ...prev,
                monthlyRevenue: revenue,
                monthlySalesCount: salesCount,
            }));
            
            setTimeout(() => setLoading(false), 500);
        });

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
                <h1 className="text-3xl font-bold text-gray-900">Dashboard de Ventas</h1>
                <p className="text-gray-500 mt-1">{new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                    title="Mis Ingresos (Mes)"
                    value={`S/${metrics.monthlyRevenue.toFixed(2)}`}
                    icon={DollarSign}
                    loading={loading}
                />
                <MetricCard
                    title="Mis Ventas (Mes)"
                    value={`${metrics.monthlySalesCount}`}
                    icon={CreditCard}
                    loading={loading}
                />
                 <Card className="bg-white p-6 rounded-lg shadow-sm flex flex-col justify-center items-center text-center gap-4">
                  <h3 className="font-semibold text-gray-900">Acceso Rápido</h3>
                  <Button onClick={() => setIsScannerOpen(true)} className="w-full">
                    <QrCode className="mr-2 h-4 w-4" />
                    Registrar Mi Asistencia
                  </Button>
                </Card>
                <MetricCard
                    title="Mi Tasa de Cierre"
                    value={`${metrics.closeRate}%`}
                    icon={Activity}
                    loading={true}
                />
            </div>

            {user && <RecentOrdersTable sellerId={user.uid} />}
        </div>
        <BarcodeScannerDialog
          isOpen={isScannerOpen}
          setIsOpen={setIsScannerOpen}
          onScanSuccess={handleScanSuccess}
        />
      </>
    );
}
