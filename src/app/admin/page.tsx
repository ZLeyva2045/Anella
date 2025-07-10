
// src/app/admin/page.tsx
'use client';
import React from 'react';
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
import { DollarSign, Users, CreditCard, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

const recentOrders = [
    { id: 'ORD001', customer: 'Liam Johnson', date: '2023-11-23', total: '$250.00', status: 'Delivered', payment: 'Paid' },
    { id: 'ORD002', customer: 'Olivia Smith', date: '2023-11-22', total: '$150.75', status: 'Shipped', payment: 'Paid' },
    { id: 'ORD003', customer: 'Noah Williams', date: '2023-11-21', total: '$350.00', status: 'Processing', payment: 'Pending' },
    { id: 'ORD004', customer: 'Emma Brown', date: '2023-11-20', total: '$450.50', status: 'Delivered', payment: 'Paid' },
    { id: 'ORD005', customer: 'Ava Jones', date: '2023-11-19', total: '$55.00', status: 'Cancelled', payment: 'Refunded' },
];

const RecentOrdersTable = () => (
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
                    {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>{order.total}</TableCell>
                        <TableCell>
                            <Badge variant={
                                order.status === 'Delivered' ? 'default' :
                                order.status === 'Processing' ? 'secondary' :
                                order.status === 'Cancelled' ? 'destructive' : 'outline'
                            }>{order.status}</Badge>
                        </TableCell>
                        <TableCell>{order.date}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
        </CardContent>
    </Card>
)

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
         <div className="flex items-center space-x-2">
            <Button>+ Crear Pedido</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Ingresos Totales"
          value="S/45,231.89"
          icon={DollarSign}
          description="+20.1% desde el mes pasado"
        />
        <MetricCard
          title="Nuevos Clientes"
          value="+2,350"
          icon={Users}
          description="+180.1% desde el mes pasado"
        />
        <MetricCard
          title="Ventas"
          value="+1,234"
          icon={CreditCard}
          description="+19% desde el mes pasado"
        />
        <MetricCard
          title="Tasa de conversión"
          value="12.5%"
          icon={Activity}
          description="+2.1% desde el mes pasado"
        />
      </div>

      <RecentOrdersTable />
    </div>
  );
}

