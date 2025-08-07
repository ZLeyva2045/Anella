
'use client';
import { usePathname } from 'next/navigation';
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/hooks/useAuth';
import { CartProvider } from '@/hooks/useCart';
import { WhatsAppButton } from '@/components/anella/WhatsAppButton';
import { cn } from '@/lib/utils';
import { ThemeProvider } from '@/hooks/useTheme';

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
  
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;700;800&family=Noto+Sans:wght@400;500;700;900&display=swap" rel="stylesheet" />
        <title>{String(metadata.title)}</title>
        <meta name="description" content={String(metadata.description)} />
      </head>
      <body className={cn(isAdminOrSalesPath ? 'sales-dashboard' : '', "antialiased")}>
        <ThemeProvider>
            <AuthProvider>
            <CartProvider>
                {children}
                {showWhatsAppButton && <WhatsAppButton />}
            </CartProvider>
            </AuthProvider>
            <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
