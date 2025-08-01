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

export function Header() {
  const { user, signOut, loading } = useAuth();
  const { cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <User className="h-5 w-5" />
          <span className="sr-only">Menú de usuario</span>
        </Button>
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
  );

  const MainNav = ({ className }: { className?: string }) => (
    <nav className={cn("flex items-center gap-8", className)}>
        <Link className="text-[var(--text-primary)] text-sm font-medium leading-normal hover:text-[var(--primary-color)] transition-colors" href="/">Inicio</Link>
        <Link className="text-[var(--text-primary)] text-sm font-medium leading-normal hover:text-[var(--primary-color)] transition-colors" href="/products">Regalos</Link>
        <Link className="text-[var(--text-primary)] text-sm font-medium leading-normal hover:text-[var(--primary-color)] transition-colors" href="/#gallery">Galería</Link>
        <Link className="text-[var(--text-primary)] text-sm font-medium leading-normal hover:text-[var(--primary-color)] transition-colors" href="/#contact">Contacto</Link>
    </nav>
  );

  const MobileNav = () => (
     <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Abrir menú</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[350px] p-0">
         <SheetHeader className="p-4 border-b">
            <SheetTitle>
              <Link href="/" className="flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
                 <div className="size-6 text-primary">
                    <Gift />
                 </div>
                 <h2 className="text-xl font-bold leading-tight tracking-[-0.015em]">Anella</h2>
              </Link>
            </SheetTitle>
          </SheetHeader>
        <nav className="flex flex-col h-full">
          <div className="flex-grow p-4 space-y-2 overflow-y-auto">
             <Link href="/" className="block py-2 text-lg" onClick={() => setMobileMenuOpen(false)}>Inicio</Link>
             <Link href="/products" className="block py-2 text-lg" onClick={() => setMobileMenuOpen(false)}>Regalos</Link>
             <Link href="/#gallery" className="block py-2 text-lg" onClick={() => setMobileMenuOpen(false)}>Galería</Link>
             <Link href="/#contact" className="block py-2 text-lg" onClick={() => setMobileMenuOpen(false)}>Contacto</Link>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );

  return (
    <header className="sticky top-0 z-50 w-full whitespace-nowrap border-b border-solid border-gray-200 bg-white/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <div className="flex items-center gap-4">
           <MobileNav />
          <Link href="/" className="flex items-center gap-3 text-[var(--text-primary)]">
            <div className="size-6 text-primary"><Gift /></div>
            <h2 className="text-xl font-bold leading-tight tracking-[-0.015em]">Anella</h2>
          </Link>
        </div>

        <div className="hidden md:flex">
           <MainNav />
        </div>
        
        <div className="flex items-center gap-2">
           <Button variant="ghost" size="icon" className="rounded-full">
            <Search className="h-5 w-5" />
            <span className="sr-only">Buscar</span>
          </Button>
          <Button asChild variant="ghost" size="icon" className="rounded-full relative">
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">Carrito</span>
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground transform translate-x-1/4 -translate-y-1/4">
                  {cartCount}
                </span>
              )}
            </Link>
          </Button>
          {!loading && <UserMenu />}
        </div>
      </div>
    </header>
  );
}
