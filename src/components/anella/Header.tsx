// src/components/anella/Header.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Gift,
  Search,
  ShoppingCart,
  User,
  LogOut,
  LogIn,
  Menu,
  Heart,
  UserPlus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';
import { useCart } from '@/hooks/useCart';
import Image from 'next/image';
import { Input } from '../ui/input';

export function Header() {
  const { user, signOut, loading } = useAuth();
  const { cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const UserMenu = () => (
    <div className="flex items-center gap-2">
        <button aria-label="Buscar" className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full size-10 neumorphism-btn text-[var(--main-text)]">
            <Search className="h-5 w-5" />
        </button>
        <button aria-label="Carrito" className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full size-10 neumorphism-btn text-[var(--main-text)]">
            <ShoppingCart className="h-5 w-5" />
        </button>
        <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <button aria-label="Menú de usuario" className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full size-10 neumorphism-btn text-[var(--main-text)]">
                <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border border-[var(--border-beige)]" style={{backgroundImage: `url("${user?.photoURL || 'https://i.pravatar.cc/40'}")`}}></div>
            </button>
        </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {user ? (
          <>
            <DropdownMenuLabel>
              <p className="font-normal">Conectado como</p>
              <p className="font-semibold truncate">{user.displayName || user.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard">
                <User className="mr-2 h-4 w-4" />
                <span>Mi Cuenta</span>
              </Link>
            </DropdownMenuItem>
             <DropdownMenuItem asChild>
              <Link href="/wishlist">
                <Heart className="mr-2 h-4 w-4" />
                <span>Lista de Deseos</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuLabel>Bienvenido</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" />
                <span>Iniciar Sesión</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/signup">
                <UserPlus className="mr-2 h-4 w-4" />
                <span>Registrarse</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
    </div>
  );

  const MainNav = ({ className }: { className?: string }) => (
    <nav className={cn("hidden items-center gap-9 md:flex", className)}>
        <a className="text-[hsl(var(--secondary-text))] hover:text-[hsl(var(--main-text))] text-sm font-medium leading-normal" href="/">Inicio</a>
        <a className="text-[hsl(var(--secondary-text))] hover:text-[hsl(var(--main-text))] text-sm font-medium leading-normal" href="/products">Regalos</a>
        <a className="text-[hsl(var(--secondary-text))] hover:text-[hsl(var(--main-text))] text-sm font-medium leading-normal" href="/#gallery">Galería</a>
        <a className="text-[hsl(var(--secondary-text))] hover:text-[hsl(var(--main-text))] text-sm font-medium leading-normal" href="/personalize">Personalizar</a>
    </nav>
  );

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[hsl(var(--border-beige))] px-10 py-4 bg-[hsl(var(--surface-beige))]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-3 text-[hsl(var(--main-text))]">
            <Image alt="Anella Logo" width={32} height={32} className="h-8 w-8 text-[hsl(var(--brand-pink))]" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCAYhmI8Slc2WLi7Exz7PvDE8MSR7DvuApGIGA1Fj_qkH4DNJF_9TMjXFultxoxybke23dwTU7KAdOHSjg1uDZGxW0_goOPVF_9CZg4LlD0NRdYn2J20y5LkNKNLZ900CwJE7JDAP67i4doZtgheVOk7t2Ru4rmUmdfkXwyUgxyR3nQR8apyEXIjkXUdZkh6_054UF80Br6DDLPeBMsy4u0jD4gjEmHHpznaSmUa-S4FUccvwUkucJiqzRrfE5Kijc_78EF2dKgMXI"/>
            <h2 className="text-[hsl(var(--main-text))] text-2xl font-bold tracking-[-0.015em]">Anella</h2>
        </div>
        <nav className="flex flex-1 justify-center">
            <MainNav />
        </nav>
        <div className="flex items-center gap-4">
            {!loading && <UserMenu />}
        </div>
    </header>
  );
}
