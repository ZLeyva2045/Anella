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
  const { user, firestoreUser, signOut, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  if (loading || !user) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
  }

  const isAdmin = firestoreUser?.role === 'manager' || firestoreUser?.role === 'designer';
  const productsLink = isAdmin ? '/admin/products' : '/products';


  return (
    <div className="container mx-auto p-4 md:p-8">
      <Card className="max-w-2xl mx-auto shadow-paper animate-subtle-bounce">
        <CardHeader>
          <CardTitle>Bienvenido a tu Panel, {firestoreUser?.name || user.displayName || user.email?.split('@')[0]}</CardTitle>
          <CardDescription>
            {isAdmin ? 'Gestiona productos, pedidos y más.' : 'Aquí podrás gestionar tus pedidos y tu perfil.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div>
                <h3 className="font-semibold text-muted-foreground">Email</h3>
                <p>{user.email}</p>
            </div>
            {firestoreUser?.role && (
                 <div>
                    <h3 className="font-semibold text-muted-foreground">Rol</h3>
                    <p className="capitalize">{firestoreUser.role}</p>
                </div>
            )}
             <div>
                <h3 className="font-semibold text-muted-foreground">ID de Usuario</h3>
                <p className="text-sm break-all">{user.uid}</p>
            </div>
        </CardContent>
        <CardFooter className="flex justify-between">
            <Button asChild variant="outline">
                <Link href={productsLink}>Ver Productos</Link>
            </Button>
            <Button onClick={handleSignOut} variant="destructive">
                Cerrar Sesión
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
