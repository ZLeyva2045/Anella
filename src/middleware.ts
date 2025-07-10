// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('firebase-auth-token');
  const { pathname } = request.nextUrl;

  // Rutas que requieren autenticación
  const protectedRoutes = ['/dashboard'];

  // Si el usuario intenta acceder a una ruta protegida sin token,
  // redirigirlo a la página de login.
  if (protectedRoutes.some(path => pathname.startsWith(path)) && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Si el usuario está autenticado (tiene token) e intenta acceder
  // a /login o /signup, redirigirlo al dashboard.
  if (token && (pathname.startsWith('/login') || pathname.startsWith('/signup'))) {
     return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Coincidir con todas las rutas excepto las de la API, next/static, next/image y favicon.ico
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
