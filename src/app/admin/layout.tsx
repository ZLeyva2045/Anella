
// src/app/admin/layout.tsx
"use client";
import React from 'react';
import {
  Bell,
  Home,
  Package,
  ShoppingCart,
  Users,
  LineChart,
  Settings,
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
import { Button } from '@/components/ui/button';
import { Header } from '@/components/anella/Header';


const AdminNav = () => {
    const pathname = usePathname();
    const { user, signOut } = useAuth();
    const { state } = useSidebar();
    
    return (
        <Sidebar>
            <SidebarHeader>
                <div className="flex items-center gap-2">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={user?.photoURL ?? ''} alt={user?.displayName ?? 'Admin'} />
                        <AvatarFallback>{user?.displayName?.charAt(0) ?? 'A'}</AvatarFallback>
                    </Avatar>
                     <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                        <span className="font-semibold text-sm">{user?.displayName ?? 'Admin'}</span>
                        <span className="text-xs text-muted-foreground">{user?.email}</span>
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
                            isActive={pathname.startsWith('/admin/orders')}
                            tooltip={{ children: "Pedidos" }}
                        >
                             <Link href="#"><ShoppingCart /><span>Pedidos</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            isActive={pathname.startsWith('/admin/products')}
                            tooltip={{ children: "Productos" }}
                        >
                             <Link href="#"><Package /><span>Productos</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            isActive={pathname.startsWith('/admin/customers')}
                            tooltip={{ children: "Clientes" }}
                        >
                             <Link href="#"><Users /><span>Clientes</span></Link>
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
