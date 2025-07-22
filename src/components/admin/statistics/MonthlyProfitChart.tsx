// src/components/admin/statistics/MonthlyProfitChart.tsx
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

// Datos de ejemplo
const data = [
  { month: 'Ene', profit: 2800 },
  { month: 'Feb', profit: 2200 },
  { month: 'Mar', profit: 3400 },
  { month: 'Abr', profit: 2500 },
  { month: 'May', profit: 3800 },
  { month: 'Jun', profit: 4100 },
];

export function MonthlyProfitChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Utilidad Mensual</CardTitle>
        <CardDescription>Visualización de la rentabilidad (ingresos - costos) mes a mes.</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `S/${value / 1000}k`} />
            <Tooltip
              cursor={{ fill: 'hsl(var(--accent))', opacity: 0.3 }}
              contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 'var(--radius)' }}
            />
            <Bar dataKey="profit" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
