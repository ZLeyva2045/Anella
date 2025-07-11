// src/app/admin/layout.tsx
"use client";
import React from 'react';
import {
  Home,
  Package,
  ShoppingCart,
  Users,
  LineChart,
  Settings,
  Store,
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
                            isActive={pathname.startsWith('/admin/products')}
                            tooltip={{ children: "Productos" }}
                        >
                             <Link href="/admin/products"><Package /><span>Productos</span></Link>
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
                            isActive={pathname.startsWith('/admin/analytics')}
                            tooltip={{ children: "Analytics" }}
                        >
                            <Link href="#"><LineChart /><span>Analytics</span></Link>
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
            <SidebarInset className="flex-1">
                 {/* Mobile Header */}
                <header className="sticky top-0 z-40 lg:hidden flex items-center justify-between px-4 py-2 bg-background border-b">
                    <Link href="/" className="flex items-center gap-2 font-bold text-lg">
                        <Package className="h-6 w-6 text-primary" />
                        <span style={{fontFamily: 'Amarillo', color: 'hsl(var(--primary))'}}>Anella Admin</span>
                    </Link>
                </header>
                 <main className="p-4 sm:p-6 lg:p-8">
                     {children}
                 </main>
             </SidebarInset>
        </div>
    </SidebarProvider>
  );
}
