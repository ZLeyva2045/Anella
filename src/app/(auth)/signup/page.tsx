// src/app/(auth)/signup/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, UserPlus } from 'lucide-react';
import { setDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { User } from '@/types/firestore';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signUpWithEmail } = useAuth();
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const userCredential = await signUpWithEmail(email, password);
      const user = userCredential.user;

      const newUser: User = {
        id: user.uid,
        email: user.email || '',
        name: name,
        phone: '',
        address: '',
        orders: [],
      };

      await setDoc(doc(db, "users", user.uid), newUser);
      
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message || 'Error al registrarse. Inténtalo de nuevo.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Crear Cuenta</CardTitle>
          <CardDescription>Únete a Anella Boutique para regalos únicos</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <p className="mb-4 text-center text-red-500 bg-red-100 p-3 rounded-md">{error}</p>}
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo</Label>
              <Input
                id="name"
                type="text"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : <UserPlus className="mr-2" />}
              Registrarse
            </Button>
          </form>
           <p className="mt-4 text-center text-sm text-muted-foreground">
              ¿Ya tienes una cuenta? <a href="/login" className="font-semibold text-primary hover:underline">Inicia Sesión</a>
            </p>
        </CardContent>
      </Card>
    </div>
  );
}
