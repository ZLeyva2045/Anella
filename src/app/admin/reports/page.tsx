// src/app/admin/reports/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import type { Order } from '@/types/firestore';
import { collection, onSnapshot, query, where, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';

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
  const [transactions, setTransactions] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!date) return;
    setLoading(true);

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const startTimestamp = Timestamp.fromDate(startOfDay);
    const endTimestamp = Timestamp.fromDate(endOfDay);
    
    const q = query(
      collection(db, "orders"), 
      where("createdAt", ">=", startTimestamp),
      where("createdAt", "<=", endTimestamp)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const transactionsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setTransactions(transactionsData);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching transactions: ", error);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [date]);

  const reportData = useMemo(() => {
    const totalSales = transactions.reduce((acc, t) => acc + t.totalAmount, 0);
    const cashSales = transactions.filter(t => t.paymentMethod === 'bankTransfer').reduce((acc, t) => acc + t.totalAmount, 0);
    const cardSales = transactions.filter(t => t.paymentMethod === 'creditCard').reduce((acc, t) => acc + t.totalAmount, 0);
    const totalOrders = transactions.length;

    return { totalSales, cashSales, cardSales, totalOrders };
  }, [transactions]);


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
            {loading ? (
                 <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : (
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
                    {transactions.map((tx) => (
                        <TableRow key={tx.id}>
                        <TableCell className="font-medium">{tx.id.substring(0, 7)}...</TableCell>
                        <TableCell>{new Date((tx.createdAt as any).seconds * 1000).toLocaleTimeString()}</TableCell>
                        <TableCell>{tx.customerInfo.name}</TableCell>
                        <TableCell>
                            {tx.paymentMethod === 'creditCard' ? 'Tarjeta' : 'Efectivo/Transf.'}
                        </TableCell>
                        <TableCell className="text-right">S/{tx.totalAmount.toFixed(2)}</TableCell>
                        </TableRow>
                    ))}
                    </TableBody>
                </Table>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
