// src/app/dashboard/page.tsx
'use client';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const { user, signOut, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  if (loading) {
    return <p>Cargando...</p>;
  }

  if (!user) {
    // Esto no debería pasar si el middleware funciona, pero es una buena práctica
    return <p>Acceso denegado. Por favor, inicia sesión.</p>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Bienvenido a tu Panel, {user.displayName || user.email}</CardTitle>
          <CardDescription>Aquí podrás gestionar tus pedidos y tu perfil.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Email: {user.email}</p>
          <p>UID: {user.uid}</p>
          <Button onClick={handleSignOut} variant="destructive" className="mt-4">
            Cerrar Sesión
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
