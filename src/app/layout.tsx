// src/app/layout.tsx
'use client';
import { usePathname } from 'next/navigation';
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/hooks/useAuth';
import { CartProvider } from '@/hooks/useCart';
import { WhatsAppButton } from '@/components/anella/WhatsAppButton';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

const metadata: Metadata = {
  title: 'Anella Boutique',
  description: 'Regalos personalizados desde Cajamarca, Perú.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAdminOrSalesPath = pathname.startsWith('/admin') || pathname.startsWith('/sales');
  const showWhatsAppButton = !isAdminOrSalesPath;
  
   useEffect(() => {
    if (isAdminOrSalesPath) {
      const theme = localStorage.getItem('anella-theme') || 'light';
      document.documentElement.classList.add(theme);
    } else {
      document.documentElement.classList.remove('dark');
    }

    const handleThemeChange = () => {
      if (isAdminOrSalesPath) {
        const theme = localStorage.getItem('anella-theme') || 'light';
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    window.addEventListener('themeChange', handleThemeChange);
    window.addEventListener('storage', handleThemeChange);
    
    handleThemeChange(); // Initial check

    return () => {
      window.removeEventListener('themeChange', handleThemeChange);
      window.removeEventListener('storage', handleThemeChange);
    };
  }, [isAdminOrSalesPath]);

  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Lexend:wght@400;500;700;800&family=Parisienne&display=swap" rel="stylesheet" />
        <title>{String(metadata.title)}</title>
        <meta name="description" content={String(metadata.description)} />
      </head>
      <body>
            <AuthProvider>
            <CartProvider>
                {children}
                {showWhatsAppButton && <WhatsAppButton />}
            </CartProvider>
            </AuthProvider>
            <Toaster />
      </body>
    </html>
  );
}
