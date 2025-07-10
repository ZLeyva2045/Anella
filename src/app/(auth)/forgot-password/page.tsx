// src/app/(auth)/forgot-password/page.tsx
'use client';
import { useState, type FormEvent } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, MailQuestion } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { sendPasswordResetEmail } = useAuth();

  const handlePasswordReset = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);
    try {
      await sendPasswordResetEmail(email);
      setMessage('Se ha enviado un correo para restablecer tu contraseña. Revisa tu bandeja de entrada.');
    } catch (error: any) {
      setError(error.message || 'Error al enviar el correo. Verifica la dirección e inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md shadow-floating">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">¿Olvidaste tu Contraseña?</CardTitle>
          <CardDescription>
            No te preocupes. Ingresa tu correo y te enviaremos un enlace para recuperarla.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="mb-4 rounded-md bg-destructive/10 p-3 text-center text-sm text-destructive">
              {error}
            </p>
          )}
          {message && (
             <p className="mb-4 rounded-md bg-primary/10 p-3 text-center text-sm text-primary">
              {message}
            </p>
          )}
          <form onSubmit={handlePasswordReset} className="space-y-4">
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
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : <MailQuestion />}
              Enviar Correo
            </Button>
          </form>
           <p className="mt-4 text-center text-sm text-muted-foreground">
            ¿Recordaste tu contraseña?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Inicia Sesión
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
