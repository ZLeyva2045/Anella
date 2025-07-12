// src/app/admin/reports/page.tsx
'use client';

import React, { useState, useMemo } from 'react';
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
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DollarSign,
  CreditCard,
  Banknote,
  ShoppingCart,
  CalendarIcon,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { Order } from '@/types/firestore';

// Datos de ejemplo para el reporte
const mockTransactions: (Order & { time: string })[] = [
  { id: 'ORD101', userId: 'usr1', customerInfo: { name: 'Liam Johnson', email: 'liam@test.com', phone: '123', address: '123 Main' }, products: [], status: 'delivered', paymentMethod: 'creditCard', deliveryMethod: 'storePickup', createdAt: new Date(), totalAmount: 75.50, time: '09:15 AM' },
  { id: 'ORD102', userId: 'usr2', customerInfo: { name: 'Olivia Smith', email: 'olivia@test.com', phone: '123', address: '123 Main' }, products: [], status: 'delivered', paymentMethod: 'bankTransfer', deliveryMethod: 'storePickup', createdAt: new Date(), totalAmount: 120.00, time: '10:30 AM' },
  { id: 'ORD103', userId: 'usr3', customerInfo: { name: 'Noah Williams', email: 'noah@test.com', phone: '123', address: '123 Main' }, products: [], status: 'delivered', paymentMethod: 'creditCard', deliveryMethod: 'storePickup', createdAt: new Date(), totalAmount: 210.25, time: '11:45 AM' },
  { id: 'ORD104', userId: 'usr4', customerInfo: { name: 'Emma Brown', email: 'emma@test.com', phone: '123', address: '123 Main' }, products: [], status: 'delivered', paymentMethod: 'bankTransfer', deliveryMethod: 'storePickup', createdAt: new Date(), totalAmount: 50.00, time: '02:00 PM' },
  { id: 'ORD105', userId: 'usr5', customerInfo: { name: 'Ava Jones', email: 'ava@test.com', phone: '123', address: '123 Main' }, products: [], status: 'delivered', paymentMethod: 'creditCard', deliveryMethod: 'storePickup', createdAt: new Date(), totalAmount: 350.00, time: '04:20 PM' },
];


const MetricCard = ({ title, value, icon }: { title: string, value: string, icon: React.ElementType }) => {
  const Icon = icon;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
};

export default function DailyCashReportPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const reportData = useMemo(() => {
    // En una aplicación real, aquí se filtrarían las transacciones por la fecha seleccionada
    const transactions = mockTransactions;
    const totalSales = transactions.reduce((acc, t) => acc + t.totalAmount, 0);
    const cashSales = transactions.filter(t => t.paymentMethod === 'bankTransfer').reduce((acc, t) => acc + t.totalAmount, 0);
    const cardSales = transactions.filter(t => t.paymentMethod === 'creditCard').reduce((acc, t) => acc + t.totalAmount, 0);
    const totalOrders = transactions.length;

    return { transactions, totalSales, cashSales, cardSales, totalOrders };
  }, [date]);


  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reporte Diario de Caja</h1>
          <p className="text-muted-foreground">
            Resumen de ventas y transacciones del día seleccionado.
          </p>
        </div>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[280px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP", { locale: es }) : <span>Selecciona una fecha</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
              locale={es}
            />
          </PopoverContent>
        </Popover>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Ventas Totales" value={`S/${reportData.totalSales.toFixed(2)}`} icon={DollarSign} />
        <MetricCard title="Ventas en Efectivo" value={`S/${reportData.cashSales.toFixed(2)}`} icon={Banknote} />
        <MetricCard title="Ventas con Tarjeta" value={`S/${reportData.cardSales.toFixed(2)}`} icon={CreditCard} />
        <MetricCard title="Pedidos Totales" value={reportData.totalOrders.toString()} icon={ShoppingCart} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transacciones del Día</CardTitle>
          <CardDescription>
            Listado detallado de todas las ventas realizadas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Pedido</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Método de Pago</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reportData.transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium">{tx.id}</TableCell>
                  <TableCell>{tx.time}</TableCell>
                  <TableCell>{tx.customerInfo.name}</TableCell>
                  <TableCell>
                    {tx.paymentMethod === 'creditCard' ? 'Tarjeta' : 'Efectivo/Transf.'}
                  </TableCell>
                  <TableCell className="text-right">S/{tx.totalAmount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
