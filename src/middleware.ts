// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Usamos la cookie 'isLoggedIn' que establecemos manualmente
  const isLoggedIn = request.cookies.get('isLoggedIn')?.value === 'true';

  // Rutas protegidas que requieren autenticación
  const protectedPaths = ['/dashboard', '/admin'];
  const isAdminPath = pathname.startsWith('/admin');
  const isDashboardPath = pathname.startsWith('/dashboard');

  // Si el usuario intenta acceder a una ruta protegida y no está logueado
  if ((isAdminPath || isDashboardPath) && !isLoggedIn) {
    // Redirigir a la página de login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si el usuario está logueado e intenta acceder a login o signup
  const authPaths = ['/login', '/signup', '/forgot-password'];
  if (authPaths.includes(pathname) && isLoggedIn) {
    // Redirigir al dashboard como ruta por defecto para usuarios logueados
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Ejecutar el middleware en estas rutas
  matcher: ['/dashboard/:path*', '/admin/:path*', '/login', '/signup', '/forgot-password'],
};
