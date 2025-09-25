// src/components/anella/Header.tsx
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
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
  Heart,
  UserPlus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';
import { useCart } from '@/hooks/useCart';
import Image from 'next/image';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function Header() {
  const { user, signOut, loading } = useAuth();
  const { cartCount } = useCart();

  const handleSignOut = async () => {
    await signOut();
  };

  const UserMenu = () => (
    <div className="flex items-center gap-2">
      <button aria-label="Buscar" className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full size-10 neumorphism-btn text-[var(--main-text)]">
        <Search className="h-5 w-5" />
      </button>
      <Link href="/cart" aria-label="Carrito" className="relative flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full size-10 neumorphism-btn text-[var(--main-text)]">
        <ShoppingCart className="h-5 w-5" />
        {cartCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
            {cartCount}
          </span>
        )}
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full w-11 h-11" aria-label='Abrir perfil'>
                 <Avatar className="h-10 w-10 border-2 border-border">
                    <AvatarImage src={user?.photoURL ?? undefined} alt="Avatar de usuario" />
                    <AvatarFallback>{user?.displayName?.charAt(0) ?? user?.email?.charAt(0)}</AvatarFallback>
                </Avatar>
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
    </div>
  );

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50 px-10 py-4">
        <Link href="/" className="flex items-center gap-3 text-foreground">
             <Image alt="Anella Logo" width={232} height={95} className="w-[120px] h-auto object-contain" src="https://i.ibb.co/MyXzBh0r/Anella.png" unoptimized/>
        </Link>
        
        <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                        <Link href="/">Inicio</Link>
                    </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                        <Link href="/products">Regalos</Link>
                    </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                        <Link href="/follow-us">Síguenos</Link>
                    </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                     <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                        <Link href="/personalize">Personalizar</Link>
                    </NavigationMenuLink>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center gap-4">
            {!loading && <UserMenu />}
        </div>
    </header>
  );
}
