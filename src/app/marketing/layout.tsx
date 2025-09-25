// src/app/marketing/layout.tsx
"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  LayoutDashboard,
  Image as ImageIcon,
  Share2,
  Settings,
  Bell
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

const marketingNavItems: NavItem[] = [
  { href: '/marketing', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/marketing/hero', label: 'Portada', icon: ImageIcon },
  { href: '/marketing/posts', label: 'Publicaciones', icon: Share2 },
];

const MarketingNav = () => {
    const pathname = usePathname();
    const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');
    
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
                    {marketingNavItems.map(item => (
                         <SidebarMenuItem key={item.href}>
                            <SidebarMenuButton
                                asChild
                                isActive={isActive(item.href)}
                                tooltip={{ children: item.label }}
                                className="text-foreground/70 hover:text-primary data-[active=true]:bg-secondary data-[active=true]:text-primary"
                            >
                                <Link href={item.href}><item.icon /><span>{item.label}</span></Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
                 <SidebarMenu className="px-4">
                    <SidebarMenuItem>
                         <SidebarMenuButton asChild isActive={isActive('/marketing/settings')} className="text-foreground/70 hover:text-primary data-[active=true]:bg-secondary data-[active=true]:text-primary" tooltip={{ children: "Configuración" }}>
                             <Link href="/marketing/settings"><Settings /><span>Configuración</span></Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    )
}

export default function MarketingLayout({
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

        return () => window.removeEventListener('storage', updateTheme);
    }, []);

    return (
        <div className={cn('marketing-dashboard', themeClasses)}>
            <SidebarProvider>
                <div className="flex min-h-screen">
                     <MarketingNav />
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
                                            <AvatarImage src={firestoreUser?.photoURL ?? ''} alt={firestoreUser?.name ?? 'Marketing'} />
                                            <AvatarFallback>{firestoreUser?.name?.charAt(0) ?? 'M'}</AvatarFallback>
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
                             <BottomNavBar navItems={marketingNavItems} />
                         </SidebarInset>
                    </div>
                </div>
            </SidebarProvider>
        </div>
    );
}
