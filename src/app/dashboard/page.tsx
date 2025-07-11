// src/app/dashboard/page.tsx
'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Si la carga ha terminado y no hay usuario, redirige.
    // Esto se ejecuta después del renderizado, evitando el error.
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  if (loading || !user) {
    // Muestra un loader mientras carga o mientras se redirige.
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="max-w-2xl mx-auto shadow-paper animate-subtle-bounce">
        <CardHeader>
          <CardTitle>Bienvenido a tu Panel, {user.displayName || user.email?.split('@')[0]}</CardTitle>
          <CardDescription>Aquí podrás gestionar tus pedidos y tu perfil.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div>
                <h3 className="font-semibold text-muted-foreground">Email</h3>
                <p>{user.email}</p>
            </div>
             <div>
                <h3 className="font-semibold text-muted-foreground">ID de Usuario</h3>
                <p className="text-sm break-all">{user.uid}</p>
            </div>
        </CardContent>
        <CardFooter className="flex justify-between">
            <Button asChild variant="outline">
                <Link href="/products">Ver Productos</Link>
            </Button>
            <Button onClick={handleSignOut} variant="destructive">
                Cerrar Sesión
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}