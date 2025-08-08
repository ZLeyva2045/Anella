// src/app/sales/layout.tsx
"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Store,
  Calculator,
  Bell,
  ClipboardList,
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
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const salesNavItems: NavItem[] = [
  { href: '/sales', label: 'Dashboard', icon: Home },
  { href: '/sales/pos', label: 'POS', icon: Store },
  { href: '/sales/orders', label: 'Pedidos', icon: ShoppingCart },
  { href: '/sales/customers', label: 'Clientes', icon: Users },
  { href: '/sales/calculator', label: 'Calculadora', icon: Calculator },
  { href: '/admin/payroll', label: 'RR.HH.', icon: ClipboardList },
  { href: '/products', label: 'Catálogo', icon: Package },
];

const SalesNav = () => {
    const pathname = usePathname();
    const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');
    
    return (
        <Sidebar>
            <SidebarHeader className="h-20 justify-center">
                 <Link href="/sales">
                    <Image
                    src="https://i.ibb.co/MyXzBh0r/Anella.png"
                    alt="Anella Boutique Logo"
                    width={140}
                    height={35}
                    className="object-contain"
                    />
                </Link>
            </SidebarHeader>
            <SidebarContent>
                 <SidebarMenu className="px-4">
                    <SidebarMenuItem>
                         <SidebarMenuButton
                            asChild
                            isActive={pathname === '/sales'}
                            tooltip={{ children: "Dashboard" }}
                            className="text-foreground/70 hover:text-primary data-[active=true]:bg-secondary data-[active=true]:text-primary"
                         >
                            <Link href="/sales"><Home /><span>Dashboard</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            isActive={isActive('/sales/pos')}
                            tooltip={{ children: "Punto de Venta" }}
                            className="text-foreground/70 hover:text-primary data-[active=true]:bg-secondary data-[active=true]:text-primary"
                        >
                             <Link href="/sales/pos"><Store /><span>Punto de Venta</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            isActive={isActive('/sales/calculator')}
                            tooltip={{ children: "Calculadora" }}
                            className="text-foreground/70 hover:text-primary data-[active=true]:bg-secondary data-[active=true]:text-primary"
                        >
                             <Link href="/sales/calculator"><Calculator /><span>Calculadora</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            isActive={isActive('/sales/orders')}
                            tooltip={{ children: "Pedidos" }}
                            className="text-foreground/70 hover:text-primary data-[active=true]:bg-secondary data-[active=true]:text-primary"
                        >
                             <Link href="/sales/orders"><ShoppingCart /><span>Pedidos</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            isActive={isActive('/sales/customers')}
                            tooltip={{ children: "Clientes" }}
                            className="text-foreground/70 hover:text-primary data-[active=true]:bg-secondary data-[active=true]:text-primary"
                        >
                             <Link href="/sales/customers"><Users /><span>Clientes</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            isActive={isActive('/admin/payroll')}
                            tooltip={{ children: "RR.HH. / Permisos" }}
                            className="text-foreground/70 hover:text-primary data-[active=true]:bg-secondary data-[active=true]:text-primary"
                        >
                             <Link href="/admin/payroll"><ClipboardList /><span>RR.HH. / Permisos</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            isActive={isActive('/products')}
                            tooltip={{ children: "Catálogo" }}
                            className="text-foreground/70 hover:text-primary data-[active=true]:bg-secondary data-[active=true]:text-primary"
                        >
                             <Link href="/products"><Package /><span>Catálogo</span></Link>
                        </SidebarMenuButton>
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
    )
}

export default function SalesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const { firestoreUser } = useAuth();
    const [themeClasses, setThemeClasses] = useState('');
    
    useEffect(() => {
        const updateTheme = () => {
            const accent = localStorage.getItem('anella-accent-color') || 'default';
            const density = localStorage.getItem('anella-density') || 'normal';
            setThemeClasses(`theme-${accent} density-${density}`);
        };
        
        updateTheme();
        
        window.addEventListener('storage', updateTheme);

        return () => {
            window.removeEventListener('storage', updateTheme);
        };
    }, []);

    return (
        <div className={cn('sales-dashboard', themeClasses)}>
            <SidebarProvider>
                <div className="flex min-h-screen">
                     <SalesNav />
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
                                            <AvatarImage src={firestoreUser?.photoURL ?? ''} alt={firestoreUser?.name ?? 'Vendedor'} />
                                            <AvatarFallback>{firestoreUser?.name?.charAt(0) ?? 'V'}</AvatarFallback>
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
                             <BottomNavBar navItems={salesNavItems} />
                         </SidebarInset>
                    </div>
                </div>
            </SidebarProvider>
        </div>
    );
}
