// src/app/marketing/page.tsx
'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Activity, BarChart, Eye, Users, Palette, Megaphone } from 'lucide-react';
import Link from 'next/link';

const MetricCard = ({ title, value, icon: Icon, link }: { title: string; value: string; icon: React.ElementType, link?: string }) => (
  <Card className="hover:border-primary/50 hover:bg-muted/50 transition-colors">
    <Link href={link || '#'}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Link>
  </Card>
);

export default function MarketingDashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Panel de Marketing</h1>
        <p className="text-muted-foreground">
          Gestiona el contenido visual y las campañas para atraer a más clientes.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard title="Visitas a la Web (Mes)" value="12,450" icon={Eye} />
        <MetricCard title="Nuevos Seguidores (Mes)" value="+820" icon={Users} />
        <MetricCard title="Interacción (Mes)" value="3.4%" icon={Activity} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
           <CardHeader>
            <CardTitle className="flex items-center gap-2"><Megaphone /> Herramientas de Contenido</CardTitle>
            <CardDescription>Accede a las secciones para actualizar el contenido de la web y redes.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             <Link href="/marketing/hero" className="block p-4 rounded-lg bg-secondary/50 hover:bg-secondary">
                <h3 className="font-semibold flex items-center gap-2"><Palette/> Portada Principal</h3>
                <p className="text-sm text-muted-foreground">Cambia la imagen de la página de inicio.</p>
             </Link>
             <Link href="/marketing/posts" className="block p-4 rounded-lg bg-secondary/50 hover:bg-secondary">
                <h3 className="font-semibold flex items-center gap-2"><Share2/> Publicaciones Sociales</h3>
                <p className="text-sm text-muted-foreground">Gestiona los posts de Instagram, TikTok, etc.</p>
             </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart /> Analíticas</CardTitle>
            <CardDescription>Resumen del rendimiento de tus campañas.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Las analíticas detalladas estarán disponibles pronto.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
