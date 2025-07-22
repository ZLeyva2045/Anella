// src/components/admin/analytics/ProfitByProductChart.tsx
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';

// Datos de ejemplo
const data = [
  { name: 'Caja Rosas', ventas: 4000, utilidad: 2400 },
  { name: 'Taza Mágica', ventas: 3000, utilidad: 1800 },
  { name: 'Lámpara Luna', ventas: 2000, utilidad: 1300 },
  { name: 'Marco Spotify', ventas: 2780, utilidad: 1500 },
  { name: 'Box Chelero', ventas: 1890, utilidad: 900 },
];

export function ProfitByProductChart() {
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
            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `S/${value / 1000}k`} />
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
