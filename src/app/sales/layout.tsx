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
  { href: '/products', label: 'Catálogo', icon: Package },
];

const SalesNav = () => {
    const pathname = usePathname();
    const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');
    
    return (
        <Sidebar>
            <SidebarHeader className="h-20 justify-center border-b border-gray-200">
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
                            className="text-gray-600 hover:text-primary data-[active=true]:bg-secondary data-[active=true]:text-primary"
                         >
                            <Link href="/sales"><Home /><span>Dashboard</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            isActive={isActive('/sales/pos')}
                            tooltip={{ children: "Punto de Venta" }}
                            className="text-gray-600 hover:text-primary data-[active=true]:bg-secondary data-[active=true]:text-primary"
                        >
                             <Link href="/sales/pos"><Store /><span>Punto de Venta</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            isActive={isActive('/sales/calculator')}
                            tooltip={{ children: "Calculadora" }}
                            className="text-gray-600 hover:text-primary data-[active=true]:bg-secondary data-[active=true]:text-primary"
                        >
                             <Link href="/sales/calculator"><Calculator /><span>Calculadora</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            isActive={isActive('/sales/orders')}
                            tooltip={{ children: "Pedidos" }}
                            className="text-gray-600 hover:text-primary data-[active=true]:bg-secondary data-[active=true]:text-primary"
                        >
                             <Link href="/sales/orders"><ShoppingCart /><span>Pedidos</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            isActive={isActive('/sales/customers')}
                            tooltip={{ children: "Clientes" }}
                            className="text-gray-600 hover:text-primary data-[active=true]:bg-secondary data-[active=true]:text-primary"
                        >
                             <Link href="/sales/customers"><Users /><span>Clientes</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            isActive={isActive('/products')}
                            tooltip={{ children: "Catálogo" }}
                            className="text-gray-600 hover:text-primary data-[active=true]:bg-secondary data-[active=true]:text-primary"
                        >
                             <Link href="/products"><Package /><span>Catálogo</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
                 <SidebarMenu className="px-4">
                    <SidebarMenuItem>
                         <SidebarMenuButton asChild isActive={isActive('/admin/settings')} className="text-gray-600 hover:text-primary data-[active=true]:bg-secondary data-[active=true]:text-primary" tooltip={{ children: "Configuración" }}>
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
    const [theme, setTheme] = useState('light');
    const [accentColor, setAccentColor] = useState('default');
    
    useEffect(() => {
        const savedTheme = localStorage.getItem('anella-theme') || 'light';
        const savedAccent = localStorage.getItem('anella-accent-color') || 'default';
        setTheme(savedTheme);
        setAccentColor(savedAccent);
        
        const handleStorageChange = () => {
            const updatedTheme = localStorage.getItem('anella-theme') || 'light';
            const updatedAccent = localStorage.getItem('anella-accent-color') || 'default';
            setTheme(updatedTheme);
            setAccentColor(updatedAccent);
        };
        
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('themeChange', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('themeChange', handleStorageChange);
        };
    }, []);

    const themeClasses = cn(
        'sales-dashboard',
        theme,
        accentColor !== 'default' ? `theme-${accentColor}` : ''
    );
    
    return (
        <div className={themeClasses}>
            <SidebarProvider>
                <div className="flex min-h-screen">
                     <SalesNav />
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
                                            <AvatarImage src={firestoreUser?.photoURL ?? ''} alt={firestoreUser?.name ?? 'Vendedor'} />
                                            <AvatarFallback>{firestoreUser?.name?.charAt(0) ?? 'V'}</AvatarFallback>
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
                             <BottomNavBar navItems={salesNavItems} />
                         </SidebarInset>
                    </div>
                </div>
            </SidebarProvider>
        </div>
    );
}
