
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // El nombre de la cookie de sesión de Firebase puede variar, pero a menudo
  // la presencia de una cookie de sesión es un buen indicador (aunque no infalible).
  // La validación real se hace en el cliente con onAuthStateChanged.
  // Esta cookie es un proxy para saber si el usuario *podría* estar logueado.
  // La nombraremos 'isLoggedIn' y la manejaremos en el cliente.
  const isLoggedIn = request.cookies.get('firebaseAuth.user');

  // Rutas protegidas que requieren autenticación
  const protectedPaths = ['/dashboard', '/admin'];

  // Si el usuario intenta acceder a una ruta protegida y no está logueado
  if (protectedPaths.some(p => pathname.startsWith(p)) && !isLoggedIn) {
    // Redirigir a la página de login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si el usuario está logueado e intenta acceder a login o signup
  const authPaths = ['/login', '/signup', '/forgot-password'];
  if (authPaths.includes(pathname) && isLoggedIn) {
    // Redirigir al dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Ejecutar el middleware en estas rutas
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login', '/signup', '/forgot-password'],
};
