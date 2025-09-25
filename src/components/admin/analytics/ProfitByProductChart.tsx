// src/components/admin/analytics/ProfitByProductChart.tsx
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import type { Order } from '@/types/firestore';
import { useMemo } from 'react';

interface ChartData {
  name: string;
  ventas: number;
  utilidad: number;
}

export function ProfitByProductChart({ orders }: { orders: Order[] }) {
  const data = useMemo<ChartData[]>(() => {
    const productStats: { [key: string]: { ventas: number; costo: number } } = {};

    orders.forEach(order => {
      order.items.forEach(item => {
        if (!productStats[item.name]) {
          productStats[item.name] = { ventas: 0, costo: 0 };
        }
        const itemTotal = item.price * item.quantity;
        // Asumimos un costo del 60% si no está definido para el ejemplo.
        // En una app real, buscaríamos el `costPrice` del producto.
        const itemCost = (item as any).costPrice ? ((item as any).costPrice * item.quantity) : (itemTotal * 0.6);
        
        productStats[item.name].ventas += itemTotal;
        productStats[item.name].costo += itemCost;
      });
    });
    
    return Object.entries(productStats)
      .map(([name, stats]) => ({
        name,
        ventas: stats.ventas,
        utilidad: stats.ventas - stats.costo,
      }))
      .sort((a, b) => b.utilidad - a.utilidad) // Sort by profit
      .slice(0, 10); // Show top 10

  }, [orders]);

  if (data.length === 0) {
      return (
        <Card>
            <CardHeader>
                <CardTitle>Rentabilidad por Producto</CardTitle>
                 <CardDescription>Comparativa de ventas totales vs. utilidad por producto.</CardDescription>
            </CardHeader>
            <CardContent className="h-[350px] flex items-center justify-center">
                 <p className="text-muted-foreground">No hay datos de pedidos completados para mostrar.</p>
            </CardContent>
        </Card>
      )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rentabilidad por Producto</CardTitle>
        <CardDescription>Comparativa de ventas totales vs. utilidad por producto para identificar los más rentables.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `S/${value >= 1000 ? `${value / 1000}k` : value}`} />
            <Tooltip
              cursor={{ fill: 'hsl(var(--accent))', opacity: 0.2 }}
              contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
            />
            <Legend wrapperStyle={{fontSize: "12px"}}/>
            <Bar dataKey="ventas" name="Ventas" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
            <Bar dataKey="utilidad" name="Utilidad" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
