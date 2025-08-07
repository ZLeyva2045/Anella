
'use client';
import { usePathname } from 'next/navigation';
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/hooks/useAuth';
import { CartProvider } from '@/hooks/useCart';
import { WhatsAppButton } from '@/components/anella/WhatsAppButton';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

const metadata: Metadata = {
  title: 'Anella Boutique',
  description: 'Regalos personalizados desde Cajamarca, Perú.',
};

type Theme = 'dark' | 'light';
type AccentColor = 'default' | 'green' | 'blue' | 'orange';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAdminOrSalesPath = pathname.startsWith('/admin') || pathname.startsWith('/sales');
  const showWhatsAppButton = !isAdminOrSalesPath;
  
  const [theme, setTheme] = useState<Theme>('light');
  const [accentColor, setAccentColor] = useState<AccentColor>('default');

  useEffect(() => {
    const savedTheme = localStorage.getItem('anella-theme') as Theme | null;
    const savedAccent = localStorage.getItem('anella-accent-color') as AccentColor | null;
    if (savedTheme) setTheme(savedTheme);
    if (savedAccent) setAccentColor(savedAccent);
  }, []);
  
  const bodyClasses = cn(
    'antialiased',
    isAdminOrSalesPath ? 'sales-dashboard' : '',
    theme,
    accentColor !== 'default' ? `theme-${accentColor}` : ''
  );
  
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700;800&family=Noto+Sans:wght@400;500;700;900&display=swap" rel="stylesheet" />
        <title>{String(metadata.title)}</title>
        <meta name="description" content={String(metadata.description)} />
      </head>
      <body className={bodyClasses}>
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
