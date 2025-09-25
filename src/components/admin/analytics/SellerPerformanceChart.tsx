// src/components/admin/analytics/SellerPerformanceChart.tsx
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import type { Order, User } from '@/types/firestore';
import { useMemo } from 'react';

export function SellerPerformanceChart({ orders, users }: { orders: Order[], users: User[] }) {
    
  const data = useMemo(() => {
    const sellerSales: { [key: string]: number } = {};
    const sellerMap = new Map(users.filter(u => u.role !== 'customer').map(u => [u.id, u.name]));

    orders.forEach(order => {
        if(order.sellerId) {
            if (!sellerSales[order.sellerId]) {
                sellerSales[order.sellerId] = 0;
            }
            sellerSales[order.sellerId]++;
        }
    });

    return Object.entries(sellerSales)
        .map(([sellerId, count]) => ({
            name: sellerMap.get(sellerId) || 'Desconocido',
            ventas: count,
        }))
        .sort((a,b) => b.ventas - a.ventas);

  }, [orders, users]);
  
  if (data.length === 0) {
      return (
        <Card>
            <CardHeader>
                <CardTitle>Rendimiento por Vendedor</CardTitle>
                <CardDescription>Cantidad de ventas gestionadas por cada vendedor.</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] flex items-center justify-center">
                 <p className="text-muted-foreground">No hay datos de ventas para mostrar.</p>
            </CardContent>
        </Card>
      )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rendimiento por Vendedor</CardTitle>
        <CardDescription>Cantidad de ventas gestionadas por cada vendedor.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ fill: 'hsl(var(--accent))', opacity: 0.3 }}
              contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
            />
            <Bar dataKey="ventas" name="Nº de Ventas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
