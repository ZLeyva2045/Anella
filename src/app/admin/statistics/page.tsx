// src/app/admin/statistics/page.tsx
'use client';
import { MonthlyProfitChart } from '@/components/admin/statistics/MonthlyProfitChart';
import { MonthlySalesChart } from '@/components/admin/statistics/MonthlySalesChart';
import { SalesByTimeChart } from '@/components/admin/statistics/SalesByTimeChart';
import { TopSellingProductsChart } from '@/components/admin/statistics/TopSellingProductsChart';

export default function StatisticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Estadísticas y Analíticas</h1>
        <p className="text-muted-foreground">
          Visualiza el rendimiento de tu negocio con estos gráficos detallados.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <MonthlySalesChart />
        <MonthlyProfitChart />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TopSellingProductsChart />
        <SalesByTimeChart />
      </div>
    </div>
  );
}
