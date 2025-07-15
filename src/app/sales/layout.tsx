// src/app/sales/layout.tsx
"use client";
import React from 'react';
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Store,
  Calculator,
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
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BottomNavBar, type NavItem } from '@/components/shared/BottomNavBar';

const salesNavItems: NavItem[] = [
  { href: '/sales', label: 'Dashboard', icon: Home },
  { href: '/sales/pos', label: 'POS', icon: Store },
  { href: '/sales/orders', label: 'Pedidos', icon: ShoppingCart },
  { href: '/sales/customers', label: 'Clientes', icon: Users },
  { href: '/sales/calculator', label: 'Calculadora', icon: Calculator },
];

const SalesNav = () => {
    const pathname = usePathname();
    const { firestoreUser } = useAuth();
    
    return (
        <Sidebar>
            <SidebarHeader>
                <div className="flex items-center gap-2">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={firestoreUser?.photoURL ?? ''} alt={firestoreUser?.name ?? 'Vendedor'} />
                        <AvatarFallback>{firestoreUser?.name?.charAt(0) ?? 'V'}</AvatarFallback>
                    </Avatar>
                     <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                        <span className="font-semibold text-sm">{firestoreUser?.name ?? 'Vendedor'}</span>
                        <span className="text-xs text-muted-foreground">{firestoreUser?.email}</span>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                 <SidebarMenu>
                    <SidebarMenuItem>
                         <SidebarMenuButton
                            asChild
                            isActive={pathname === '/sales'}
                            tooltip={{ children: "Dashboard" }}
                         >
                            <Link href="/sales"><Home /><span>Dashboard</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            isActive={pathname.startsWith('/sales/pos')}
                            tooltip={{ children: "Punto de Venta" }}
                        >
                             <Link href="/sales/pos"><Store /><span>Punto de Venta</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            isActive={pathname.startsWith('/sales/calculator')}
                            tooltip={{ children: "Calculadora" }}
                        >
                             <Link href="/sales/calculator"><Calculator /><span>Calculadora</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            isActive={pathname.startsWith('/sales/orders')}
                            tooltip={{ children: "Pedidos" }}
                        >
                             <Link href="/sales/orders"><ShoppingCart /><span>Pedidos</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            isActive={pathname.startsWith('/sales/customers')}
                            tooltip={{ children: "Clientes" }}
                        >
                             <Link href="/sales/customers"><Users /><span>Clientes</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            isActive={pathname.startsWith('/products')}
                            tooltip={{ children: "Catálogo" }}
                        >
                             <Link href="/products"><Package /><span>Catálogo</span></Link>
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

export default function SalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
        <div className="flex min-h-screen">
             <SalesNav />
            <SidebarInset className="flex-1 pb-16 md:pb-0">
                <header className="sticky top-0 z-40 md:hidden flex items-center justify-between px-4 py-2 bg-background border-b">
                    <Link href="/" className="flex items-center gap-2 font-bold text-lg">
                        <Package className="h-6 w-6 text-primary" />
                        <span style={{fontFamily: 'Amarillo', color: 'hsl(var(--primary))'}}>Anella Ventas</span>
                    </Link>
                </header>
                 <main className="p-4 sm:p-6 lg:p-8">
                     {children}
                 </main>
                 <BottomNavBar navItems={salesNavItems} />
             </SidebarInset>
        </div>
    </SidebarProvider>
  );
}
