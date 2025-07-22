// src/components/admin/statistics/SalesByTimeChart.tsx
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

// Datos de ejemplo
const data = [
  { day: 'Lun', sales: 12 },
  { day: 'Mar', sales: 18 },
  { day: 'Mié', sales: 25 },
  { day: 'Jue', sales: 22 },
  { day: 'Vie', sales: 30 },
  { day: 'Sáb', sales: 45 },
  { day: 'Dom', sales: 28 },
];

export function SalesByTimeChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ventas por Día de la Semana</CardTitle>
        <CardDescription>Identifica los días de mayor actividad de ventas en la semana.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="day" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              cursor={{ fill: 'hsl(var(--accent))', opacity: 0.3 }}
              contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
            />
            <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
