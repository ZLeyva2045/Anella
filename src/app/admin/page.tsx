// src/app/admin/page.tsx
'use client';
import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DollarSign, Users, CreditCard, Loader2, QrCode } from 'lucide-react';
import type { Order, User } from '@/types/firestore';
import { collection, onSnapshot, query, orderBy, limit, Timestamp, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { DashboardAlerts } from '@/components/admin/DashboardAlerts';
import { Button } from '@/components/ui/button';
import { BarcodeScannerDialog } from '@/components/shared/BarcodeScannerDialog';
import { useToast } from '@/hooks/use-toast';
import { recordAttendance } from '@/services/attendanceService';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';

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


const RecentActivityTable = () => {
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

    if (loading) {
        return <div className="flex justify-center items-center h-40"><Loader2 className="animate-spin" /></div>;
    }
    
    return (
        <div className="mt-10 bg-white rounded-lg shadow-sm overflow-hidden">
            <h2 className="text-lg font-semibold text-gray-900 p-6">Actividad reciente</h2>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="text-xs text-gray-700 uppercase bg-pink-50">
                        <TableRow>
                            <TableHead>Fecha</TableHead>
                            <TableHead>Actividad</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Total</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order) => (
                        <TableRow key={order.id} className="bg-white border-b border-pink-100">
                            <TableCell>{new Date((order.createdAt as any).seconds * 1000).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}</TableCell>
                            <TableCell className="font-medium text-gray-900">Nuevo pedido #{order.id.substring(0,7)}</TableCell>
                            <TableCell>{order.customerInfo.name}</TableCell>
                            <TableCell>S/{order.totalAmount.toFixed(2)}</TableCell>
                        </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    newCustomers: 0,
    completedSales: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const { toast } = useToast();
  const { firestoreUser } = useAuth();

  useEffect(() => {
    setLoading(true);

    const ordersQuery = query(collection(db, "orders"));
    const unsubOrders = onSnapshot(ordersQuery, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => doc.data() as Order);
      
      const completedOrders = ordersData.filter(o => o.fulfillmentStatus === 'completed');
      const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      
      setMetrics(prev => ({
        ...prev,
        totalRevenue,
        completedSales: completedOrders.length,
      }));
    });

    const usersQuery = query(collection(db, "users"), where("role", "==", "customer"));
    const unsubUsers = onSnapshot(usersQuery, (snapshot) => {
      const usersData = snapshot.docs.map(doc => doc.data() as User);
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      
      const newCustomersThisMonth = usersData.filter(user => {
        const createdAt = (user.createdAt as Timestamp)?.toDate();
        return createdAt && createdAt >= startOfMonth;
      });
      setMetrics(prev => ({ ...prev, newCustomers: newCustomersThisMonth.length }));
    });
    
    const timer = setTimeout(() => setLoading(false), 500);

    return () => {
      unsubOrders();
      unsubUsers();
      clearTimeout(timer);
    };
  }, []);

  const handleScanSuccess = async (qrContent: string) => {
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
  };

  return (
    <>
      <div className="max-w-7xl mx-auto">
          <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Panel de control</h1>
              <p className="text-gray-500 mt-1">{new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
              title="Ingresos (Completados)"
              value={`S/${metrics.totalRevenue.toFixed(2)}`}
              icon={DollarSign}
              loading={loading}
              />
              <MetricCard
              title="Pedidos Completados"
              value={`${metrics.completedSales}`}
              icon={CreditCard}
              loading={loading}
              />
              <MetricCard
              title="Nuevos Clientes (Mes)"
              value={`+${metrics.newCustomers}`}
              icon={Users}
              loading={loading}
              />
               <Card className="bg-white p-6 rounded-lg shadow-sm flex flex-col justify-center items-center text-center gap-4">
                  <h3 className="font-semibold text-gray-900">Acceso Rápido</h3>
                  <Button onClick={() => setIsScannerOpen(true)} className="w-full">
                    <QrCode className="mr-2 h-4 w-4" />
                    Registrar Mi Asistencia
                  </Button>
              </Card>
          </div>
          
          <div className="mt-6">
            <DashboardAlerts />
          </div>

          <RecentActivityTable />
      </div>

      <BarcodeScannerDialog
        isOpen={isScannerOpen}
        setIsOpen={setIsScannerOpen}
        onScanSuccess={handleScanSuccess}
      />
    </>
  );
}
