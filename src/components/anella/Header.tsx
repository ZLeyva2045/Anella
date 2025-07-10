// src/components/anella/Header.tsx
'use client';

import { Gift, LogIn, User } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export function Header() {
  const { user, loading } = useAuth();

  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-40 w-full border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <a href="/" className="flex items-center gap-2">
          <Gift className="h-7 w-7 text-primary" />
          <span className="text-2xl font-headline text-primary">Anella</span>
        </a>
        <nav className="hidden md:flex gap-6 text-sm font-medium items-center">
          <a href="/#recommendations" className="hover:text-primary transition-colors">Encontrar un Regalo</a>
          <a href="/#gallery" className="hover:text-primary transition-colors">Galería</a>
          <a href="/#contact" className="hover:text-primary transition-colors">Contacto</a>
          {!loading && (
            <>
              {user ? (
                <Link href="/dashboard" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <User className="h-4 w-4" />
                  <span>Mi Cuenta</span>
                </Link>
              ) : (
                <Link href="/login" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <LogIn className="h-4 w-4" />
                  <span>Acceder</span>
                </Link>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
