// src/app/admin/layout.tsx
"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  BarChart2,
  Settings,
  Store,
  FileText,
  Gift,
  ShoppingBasket,
  LineChart,
  Receipt,
  Bell,
  ClipboardList,
  UserCog,
  Palette,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BottomNavBar, type NavItem } from '@/components/shared/BottomNavBar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';


const adminNavItems: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: Home },
  { href: '/admin/pos', label: 'POS', icon: Store },
  { href: '/admin/orders', label: 'Pedidos', icon: ShoppingCart },
  { href: '/admin/gifts', label: 'Regalos', icon: Gift },
  { href: '/admin/products', label: 'Inventario', icon: Package },
  { href: '/admin/themes', label: 'Temáticas', icon: Palette },
  { href: '/admin/compras', label: 'Compras', icon: ShoppingBasket },
  { href: '/admin/expenses', label: 'Gastos', icon: Receipt },
  { href: '/admin/customers', label: 'Clientes', icon: Users },
  { href: '/admin/employees', label: 'Empleados', icon: UserCog },
  { href: '/admin/payroll', label: 'RR.HH.', icon: ClipboardList },
  { href: '/admin/reports', label: 'Reportes', icon: FileText },
  { href: '/admin/statistics', label: 'Estadísticas', icon: LineChart },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
];


const AdminNav = () => {
    const pathname = usePathname();
    const { firestoreUser } = useAuth();
    
    const isActive = (path: string) => pathname.startsWith(path);
    
    return (
      <Sidebar>
        <SidebarHeader className="h-20 justify-center">
          <Link href="/">
            <Image
              src="https://i.ibb.co/MyXzBh0r/Anella.png"
              alt="Anella Logo"
              width={140}
              height={35}
              className="object-contain"
            />
          </Link>
        </SidebarHeader>
        <SidebarContent>
             <SidebarMenu className="px-4">
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === '/admin'} className="text-foreground/70 hover:text-primary data-[active=true]:bg-secondary data-[active=true]:text-primary" tooltip={{children: "Inicio"}}><Link href="/admin"><Home /><span>Inicio</span></Link></SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive('/admin/customers')} className="text-foreground/70 hover:text-primary data-[active=true]:bg-secondary data-[active=true]:text-primary" tooltip={{children: "Clientes"}}><Link href="/admin/customers"><Users /><span>Clientes</span></Link></SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive('/admin/employees')} className="text-foreground/70 hover:text-primary data-[active=true]:bg-secondary data-[active=true]:text-primary" tooltip={{children: "Empleados"}}><Link href="/admin/employees"><UserCog /><span>Empleados</span></Link></SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive('/admin/products')} className="text-foreground/70 hover:text-primary data-[active=true]:bg-secondary data-[active=true]:text-primary" tooltip={{children: "Productos"}}><Link href="/admin/products"><Package /><span>Productos</span></Link></SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive('/admin/gifts')} className="text-foreground/70 hover:text-primary data-[active=true]:bg-secondary data-[active=true]:text-primary" tooltip={{children: "Regalos"}}><Link href="/admin/gifts"><Gift /><span>Regalos</span></Link></SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive('/admin/themes')} className="text-foreground/70 hover:text-primary data-[active=true]:bg-secondary data-[active=true]:text-primary" tooltip={{children: "Temáticas"}}><Link href="/admin/themes"><Palette /><span>Temáticas</span></Link></SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive('/admin/orders')} className="text-foreground/70 hover:text-primary data-[active=true]:bg-secondary data-[active=true]:text-primary" tooltip={{children: "Pedidos"}}><Link href="/admin/orders"><ShoppingCart /><span>Pedidos</span></Link></SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive('/admin/compras')} className="text-foreground/70 hover:text-primary data-[active=true]:bg-secondary data-[active=true]:text-primary" tooltip={{children: "Compras"}}><Link href="/admin/compras"><ShoppingBasket /><span>Compras</span></Link></SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive('/admin/expenses')} className="text-foreground/70 hover:text-primary data-[active=true]:bg-secondary data-[active=true]:text-primary" tooltip={{children: "Gastos"}}><Link href="/admin/expenses"><Receipt /><span>Gastos</span></Link></SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive('/admin/payroll')} className="text-foreground/70 hover:text-primary data-[active=true]:bg-secondary data-[active=true]:text-primary" tooltip={{children: "RR.HH. / Nómina"}}><Link href="/admin/payroll"><ClipboardList /><span>RR.HH. / Nómina</span></Link></SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive('/admin/analytics')} className="text-foreground/70 hover:text-primary data-[active=true]:bg-secondary data-[active=true]:text-primary" tooltip={{children: "Análisis"}}><Link href="/admin/analytics"><BarChart2 /><span>Análisis</span></Link></SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive('/admin/statistics')} className="text-foreground/70 hover:text-primary data-[active=true]:bg-secondary data-[active=true]:text-primary" tooltip={{children: "Estadísticas"}}><Link href="/admin/statistics"><LineChart /><span>Estadísticas</span></Link></SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive('/admin/reports')} className="text-foreground/70 hover:text-primary data-[active=true]:bg-secondary data-[active=true]:text-primary" tooltip={{children: "Reportes"}}><Link href="/admin/reports"><FileText /><span>Reportes</span></Link></SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive('/admin/pos')} className="text-foreground/70 hover:text-primary data-[active=true]:bg-secondary data-[active=true]:text-primary" tooltip={{children: "Punto de Venta"}}><Link href="/admin/pos"><Store /><span>Punto de Venta</span></Link></SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
             <SidebarMenu className="px-4">
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive('/admin/settings')} className="text-foreground/70 hover:text-primary data-[active=true]:bg-secondary data-[active=true]:text-primary" tooltip={{ children: "Configuración" }}>
                         <Link href="/admin/settings"><Settings /><span>Configuración</span></Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    );
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { firestoreUser } = useAuth();
    const [themeClasses, setThemeClasses] = useState('');
    
    useEffect(() => {
        const updateTheme = () => {
            const accent = localStorage.getItem('anella-accent-color') || 'default';
            const density = localStorage.getItem('anella-density') || 'normal';
            setThemeClasses(`theme-${accent} density-${density}`);
        };
        
        updateTheme();
        
        // Use 'storage' event to listen for changes from other tabs/windows
        window.addEventListener('storage', updateTheme);

        return () => {
            window.removeEventListener('storage', updateTheme);
        };
    }, []);
    
    return (
        <div className={cn("sales-dashboard", themeClasses)}>
            <SidebarProvider>
                <div className="flex min-h-screen">
                    <AdminNav />
                    <div className="flex-1 flex flex-col">
                        <header className="flex h-20 items-center justify-end whitespace-nowrap border-b bg-card px-8">
                            <div className="flex items-center gap-4">
                                <Button variant="ghost" size="icon" className="relative rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                                    <span className="sr-only">Ver notificaciones</span>
                                    <Bell />
                                </Button>
                                <div className="relative">
                                    <button className="flex items-center gap-2">
                                        <Avatar className="size-10">
                                            <AvatarImage src={firestoreUser?.photoURL ?? ''} alt={firestoreUser?.name ?? 'Admin'} />
                                            <AvatarFallback>{firestoreUser?.name?.charAt(0) ?? 'A'}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm font-medium text-card-foreground hidden sm:inline">{firestoreUser?.name}</span>
                                    </button>
                                </div>
                            </div>
                        </header>
                        <SidebarInset className="flex-1 bg-background">
                            <main className="p-4 sm:p-6 lg:p-8">
                                {children}
                            </main>
                            <BottomNavBar navItems={adminNavItems} />
                        </SidebarInset>
                    </div>
                </div>
            </SidebarProvider>
        </div>
    );
}
