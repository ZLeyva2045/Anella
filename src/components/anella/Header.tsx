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

const AnellaLogo = () => (
    <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
        <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd"></path>
        <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd"></path>
    </svg>
)

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
    <nav className={cn("hidden items-center gap-8 md:flex", className)}>
        <Link className="text-[var(--text-primary)] text-sm font-medium leading-normal hover:text-[var(--primary-color)] transition-colors" href="/">Inicio</Link>
        <Link className="text-[var(--text-primary)] text-sm font-medium leading-normal hover:text-[var(--primary-color)] transition-colors" href="/products">Regalos</Link>
        <Link className="text-[var(--text-primary)] text-sm font-medium leading-normal hover:text-[var(--primary-color)] transition-colors" href="/#gallery">Galería</Link>
        <Link className="text-[var(--text-primary)] text-sm font-medium leading-normal hover:text-[var(--primary-color)] transition-colors" href="/personalize">Personalizar</Link>
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
                    <AnellaLogo />
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
             <Link href="/personalize" className="block py-2 text-lg" onClick={() => setMobileMenuOpen(false)}>Personalizar</Link>
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
            <div className="size-6 text-primary"><AnellaLogo /></div>
            <h2 className="text-xl font-bold leading-tight tracking-[-0.015em]">Anella</h2>
          </Link>
        </div>

        <MainNav />
        
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
