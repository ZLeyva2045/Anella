// src/app/admin/layout.tsx
"use client";
import React from 'react';
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

const adminNavItems: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: Home },
  { href: '/admin/pos', label: 'POS', icon: Store },
  { href: '/admin/orders', label: 'Pedidos', icon: ShoppingCart },
  { href: '/admin/gifts', label: 'Regalos', icon: Gift },
  { href: '/admin/products', label: 'Inventario', icon: Package },
  { href: '/admin/compras', label: 'Compras', icon: ShoppingBasket },
  { href: '/admin/expenses', label: 'Gastos', icon: Receipt },
  { href: '/admin/customers', label: 'Clientes', icon: Users },
  { href: '/admin/reports', label: 'Reportes', icon: FileText },
  { href: '/admin/statistics', label: 'Estadísticas', icon: LineChart },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart2 },
];


const AdminNav = () => {
    const pathname = usePathname();
    const { firestoreUser } = useAuth();
    
    const isActive = (path: string) => pathname === path;
    
    return (
      <Sidebar>
        <SidebarHeader className="h-20 justify-center">
            <div className="flex items-center gap-3 text-2xl font-bold text-gray-900">
                <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd"></path>
                    <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd"></path>
                </svg>
                <span className="group-data-[collapsible=icon]:hidden">Anella</span>
            </div>
        </SidebarHeader>
        <SidebarContent>
             <SidebarMenu className="px-4">
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={isActive('/admin')} className="text-gray-600 hover:text-primary data-[active=true]:bg-secondary data-[active=true]:text-primary" tooltip={{children: "Inicio"}}><Link href="/admin"><Home /><span>Inicio</span></Link></SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/customers')} className="text-gray-600 hover:text-primary data-[active=true]:bg-secondary data-[active=true]:text-primary" tooltip={{children: "Clientes"}}><Link href="/admin/customers"><Users /><span>Clientes</span></Link></SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/products')} className="text-gray-600 hover:text-primary data-[active=true]:bg-secondary data-[active=true]:text-primary" tooltip={{children: "Productos"}}><Link href="/admin/products"><Package /><span>Productos</span></Link></SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/gifts')} className="text-gray-600 hover:text-primary data-[active=true]:bg-secondary data-[active=true]:text-primary" tooltip={{children: "Regalos"}}><Link href="/admin/gifts"><Gift /><span>Regalos</span></Link></SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/orders')} className="text-gray-600 hover:text-primary data-[active=true]:bg-secondary data-[active=true]:text-primary" tooltip={{children: "Pedidos"}}><Link href="/admin/orders"><ShoppingCart /><span>Pedidos</span></Link></SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/compras')} className="text-gray-600 hover:text-primary data-[active=true]:bg-secondary data-[active=true]:text-primary" tooltip={{children: "Compras"}}><Link href="/admin/compras"><ShoppingBasket /><span>Compras</span></Link></SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/expenses')} className="text-gray-600 hover:text-primary data-[active=true]:bg-secondary data-[active=true]:text-primary" tooltip={{children: "Gastos"}}><Link href="/admin/expenses"><Receipt /><span>Gastos</span></Link></SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/analytics')} className="text-gray-600 hover:text-primary data-[active=true]:bg-secondary data-[active=true]:text-primary" tooltip={{children: "Análisis"}}><Link href="/admin/analytics"><BarChart2 /><span>Análisis</span></Link></SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/statistics')} className="text-gray-600 hover:text-primary data-[active=true]:bg-secondary data-[active=true]:text-primary" tooltip={{children: "Estadísticas"}}><Link href="/admin/statistics"><LineChart /><span>Estadísticas</span></Link></SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/reports')} className="text-gray-600 hover:text-primary data-[active=true]:bg-secondary data-[active=true]:text-primary" tooltip={{children: "Reportes"}}><Link href="/admin/reports"><FileText /><span>Reportes</span></Link></SidebarMenuButton>
                </SidebarMenuItem>
                 <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname.startsWith('/admin/pos')} className="text-gray-600 hover:text-primary data-[active=true]:bg-secondary data-[active=true]:text-primary" tooltip={{children: "Punto de Venta"}}><Link href="/admin/pos"><Store /><span>Punto de Venta</span></Link></SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
             <SidebarMenu className="px-4">
                <SidebarMenuItem>
                    <SidebarMenuButton asChild className="text-gray-600 hover:text-primary" tooltip={{ children: "Configuración" }}>
                         <Link href="#"><Settings /><span>Configuración</span></Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
    );
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { firestoreUser } = useAuth();
    return (
        <SidebarProvider>
            <div className="flex min-h-screen">
                <AdminNav />
                <div className="flex-1 flex flex-col">
                    <header className="flex h-20 items-center justify-end whitespace-nowrap border-b border-solid border-pink-100 bg-white px-8">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" className="relative rounded-full p-2 text-gray-500 hover:bg-secondary hover:text-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                                <span className="sr-only">Ver notificaciones</span>
                                <Bell />
                            </Button>
                            <div className="relative">
                                <button className="flex items-center gap-2">
                                    <Avatar className="size-10">
                                        <AvatarImage src={firestoreUser?.photoURL ?? ''} alt={firestoreUser?.name ?? 'Admin'} />
                                        <AvatarFallback>{firestoreUser?.name?.charAt(0) ?? 'A'}</AvatarFallback>
                                    </Avatar>
                                    <span className="text-sm font-medium text-gray-700 hidden sm:inline">{firestoreUser?.name}</span>
                                </button>
                            </div>
                        </div>
                    </header>
                    <SidebarInset className="flex-1 bg-soft-pink">
                        <main className="p-4 sm:p-6 lg:p-8">
                            {children}
                        </main>
                        <BottomNavBar navItems={adminNavItems} />
                    </SidebarInset>
                </div>
            </div>
        </SidebarProvider>
    );
}
