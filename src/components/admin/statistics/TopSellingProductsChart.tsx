// src/components/admin/statistics/TopSellingProductsChart.tsx
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Datos de ejemplo
const topProducts = [
  { name: 'Lámpara de Luna Personalizada', sales: 125, type: 'Producto' },
  { name: 'Caja de Rosas Eternas', sales: 98, type: 'Producto' },
  { name: 'Taza Mágica con Foto', sales: 85, type: 'Insumo' },
  { name: 'Chocolates Ferrero Rocher', sales: 210, type: 'Insumo' },
  { name: 'Marco de Spotify', sales: 72, type: 'Producto' },
];

export function TopSellingProductsChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Productos e Insumos Más Vendidos</CardTitle>
        <CardDescription>Artículos con mayor rotación en el último mes.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead className="text-right">Unidades Vendidas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topProducts.map((product) => (
              <TableRow key={product.name}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="text-right font-bold">{product.sales}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
