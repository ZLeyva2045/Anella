// src/components/admin/analytics/SellerPerformanceChart.tsx
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

// Datos de ejemplo
const data = [
  { name: 'Ana', ventas: 50 },
  { name: 'Luis', ventas: 42 },
  { name: 'Maria', ventas: 35 },
  { name: 'Carlos', ventas: 28 },
];

export function SellerPerformanceChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rendimiento por Vendedor</CardTitle>
        <CardDescription>Cantidad de ventas gestionadas por cada vendedor en el último mes.</CardDescription>
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
