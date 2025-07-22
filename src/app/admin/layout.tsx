// src/app/admin/layout.tsx
"use client";
import React from 'react';
import Image from 'next/image';
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  LineChart,
  Settings,
  Store,
  FileText,
  Gift,
  ShoppingBasket,
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

const adminNavItems: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: Home },
  { href: '/admin/pos', label: 'POS', icon: Store },
  { href: '/admin/orders', label: 'Pedidos', icon: ShoppingCart },
  { href: '/admin/gifts', label: 'Regalos', icon: Gift },
  { href: '/admin/products', label: 'Inventario', icon: Package },
  { href: '/admin/compras', label: 'Compras', icon: ShoppingBasket },
  { href: '/admin/customers', label: 'Clientes', icon: Users },
  { href: '/admin/reports', label: 'Reportes', icon: FileText },
  { href: '/admin/statistics', label: 'Estadísticas', icon: LineChart },
];


const AdminNav = () => {
    const pathname = usePathname();
    const { firestoreUser } = useAuth();
    
    return (
        <Sidebar>
            <SidebarHeader>
                <div className="flex items-center gap-2">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={firestoreUser?.photoURL ?? ''} alt={firestoreUser?.name ?? 'Admin'} />
                        <AvatarFallback>{firestoreUser?.name?.charAt(0) ?? 'A'}</AvatarFallback>
                    </Avatar>
                     <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                        <span className="font-semibold text-sm">{firestoreUser?.name ?? 'Admin'}</span>
                        <span className="text-xs text-muted-foreground">{firestoreUser?.email}</span>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                 <SidebarMenu>
                    <SidebarMenuItem>
                         <SidebarMenuButton
                            asChild
                            isActive={pathname === '/admin'}
                            tooltip={{ children: "Dashboard" }}
                         >
                            <Link href="/admin"><Home /><span>Dashboard</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            isActive={pathname.startsWith('/admin/pos')}
                            tooltip={{ children: "Punto de Venta" }}
                        >
                             <Link href="/admin/pos"><Store /><span>Punto de Venta</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            isActive={pathname.startsWith('/admin/orders')}
                            tooltip={{ children: "Pedidos" }}
                        >
                             <Link href="/admin/orders"><ShoppingCart /><span>Pedidos</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            isActive={pathname.startsWith('/admin/gifts')}
                            tooltip={{ children: "Regalos" }}
                        >
                             <Link href="/admin/gifts"><Gift /><span>Regalos</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            isActive={pathname.startsWith('/admin/compras')}
                            tooltip={{ children: "Compras" }}
                        >
                             <Link href="/admin/compras"><ShoppingBasket /><span>Compras</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            isActive={pathname.startsWith('/admin/products')}
                            tooltip={{ children: "Inventario" }}
                        >
                             <Link href="/admin/products"><Package /><span>Inventario</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            isActive={pathname.startsWith('/admin/customers')}
                            tooltip={{ children: "Clientes" }}
                        >
                             <Link href="/admin/customers"><Users /><span>Clientes</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            isActive={pathname.startsWith('/admin/reports')}
                            tooltip={{ children: "Reportes" }}
                        >
                            <Link href="/admin/reports"><FileText /><span>Reportes</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            isActive={pathname.startsWith('/admin/statistics')}
                            tooltip={{ children: "Estadísticas" }}
                        >
                            <Link href="/admin/statistics"><LineChart /><span>Estadísticas</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
                 <SidebarMenu>
                    <SidebarMenuItem>
                         <SidebarMenuButton asChild tooltip={{ children: "Configuración" }}>
                             <Link href="#"><Settings /><span>Configuración</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
        <div className="flex min-h-screen">
             <AdminNav />
            <SidebarInset className="flex-1 pb-16 md:pb-0">
                 {/* Mobile Header */}
                <header className="sticky top-0 z-40 md:hidden flex items-center justify-between px-4 py-2 bg-background border-b">
                    <Link href="/" className="flex items-center gap-2 font-bold text-lg">
                         <Image
                            src="https://i.ibb.co/MyXzBh0r/Anella.png"
                            alt="Anella Boutique Logo"
                            width={120}
                            height={30}
                            className="object-contain"
                        />
                    </Link>
                </header>
                 <main className="p-4 sm:p-6 lg:p-8">
                     {children}
                 </main>
                 <BottomNavBar navItems={adminNavItems} />
             </SidebarInset>
        </div>
    </SidebarProvider>
  );
}
