// src/app/admin/analytics/page.tsx
import { ProfitByProductChart } from "@/components/admin/analytics/ProfitByProductChart";
import { SellerPerformanceChart } from "@/components/admin/analytics/SellerPerformanceChart";
import { TopCustomersList } from "@/components/admin/analytics/TopCustomersList";

export default function AnalyticsPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Análisis y Estrategia</h1>
        <p className="text-gray-500 mt-1">
          Análisis profundos para optimizar tu negocio y tomar decisiones informadas.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ProfitByProductChart />
        </div>
        <div>
          <TopCustomersList />
        </div>
      </div>

      <div>
        <SellerPerformanceChart />
      </div>
    </div>
  );
}
