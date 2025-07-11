// src/app/(auth)/login/page.tsx
'use client';
import {useState, type FormEvent} from 'react';
import {useRouter} from 'next/navigation';
import {useAuth} from '@/hooks/useAuth';
import {Button} from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Separator} from '@/components/ui/separator';
import {Loader2, LogIn} from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const {signInWithEmail, signInWithGoogle, getUserRole} = useAuth();
  const router = useRouter();

  const handleLoginSuccess = async (userId: string) => {
    const role = await getUserRole(userId);
    if (role === 'manager' || role === 'designer') {
      router.push('/admin');
    } else if (role === 'sales') {
      router.push('/sales');
    } else {
      router.push('/dashboard');
    }
  };

  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmail(email, password);
      await handleLoginSuccess(userCredential.user.uid);
    } catch (error: any) {
      setError(error.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithGoogle();
      await handleLoginSuccess(userCredential.user.uid);
    } catch (error: any) {
      setError(error.message || 'Error al iniciar sesión con Google.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md shadow-floating animate-subtle-bounce">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Iniciar Sesión</CardTitle>
          <CardDescription>Accede a tu cuenta de Anella Boutique</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="mb-4 rounded-md bg-destructive/10 p-3 text-center text-sm text-destructive">
              {error}
            </p>
          )}
          <form onSubmit={handleEmailLogin} className="space-y-4">
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : <LogIn />}
              Acceder
            </Button>
          </form>
          <div className="mt-4 text-right text-sm">
            <Link href="/forgot-password" className="text-primary hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <Separator className="my-6" />
          <div className="space-y-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              <svg
                className="mr-2 h-4 w-4"
                viewBox="0 0 48 48"
                role="img"
                aria-label="Google logo"
              >
                <path
                  fill="#4285F4"
                  d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.38 6.62v5.51h7.08c4.14-3.83 6.54-9.47 6.54-16.14z"
                ></path>
                <path
                  fill="#34A853"
                  d="M24 46c6.48 0 11.93-2.13 15.89-5.82l-7.08-5.51c-2.15 1.45-4.92 2.3-8.81 2.3-6.76 0-12.47-4.55-14.51-10.68H2.3v5.68C6.27 40.85 14.63 46 24 46z"
                ></path>
                <path
                  fill="#FBBC05"
                  d="M9.49 27.82c-.46-1.36-.72-2.82-.72-4.32s.26-2.96.72-4.32V13.5H2.3C.83 16.39 0 19.99 0 24s.83 7.61 2.3 10.5l7.19-5.68z"
                ></path>
                <path
                  fill="#EA4335"
                  d="M24 9.18c3.55 0 6.63 1.23 9.09 3.57l6.23-6.23C35.91 2.51 30.46 0 24 0 14.63 0 6.27 5.15 2.3 13.5l7.19 5.68C11.53 13.73 17.24 9.18 24 9.18z"
                ></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
              Continuar con Google
            </Button>
          </div>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            ¿No tienes una cuenta?{' '}
            <Link href="/signup" className="font-semibold text-primary hover:underline">
              Crea una ahora
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
