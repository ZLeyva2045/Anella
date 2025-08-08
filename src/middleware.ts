// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { UserRole } from './types/firestore';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const isLoggedIn = request.cookies.get('isLoggedIn')?.value === 'true';
  const userRole = request.cookies.get('userRole')?.value as UserRole | undefined;

  const isAdminPath = pathname.startsWith('/admin');
  const isSalesPath = pathname.startsWith('/sales');
  const isDashboardPath = pathname.startsWith('/dashboard');

  // Si no está logueado y trata de acceder a una ruta protegida -> redirigir a login
  if (!isLoggedIn && (isAdminPath || isSalesPath || isDashboardPath)) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si está logueado...
  if (isLoggedIn) {
    // Si intenta acceder a login/signup -> redirigir a su dashboard
    const authPaths = ['/login', '/signup', '/forgot-password'];
    if (authPaths.includes(pathname)) {
        const homeURL = userRole === 'customer' ? '/dashboard' : `/${userRole}`;
        return NextResponse.redirect(new URL(homeURL, request.url));
    }

    // --- Control de Acceso por Rol ---
    // Si un vendedor intenta acceder a una ruta de admin
    if (userRole === 'sales' && isAdminPath) {
        return NextResponse.redirect(new URL('/sales', request.url)); // Redirigir a su dashboard de ventas
    }
    // Si un cliente intenta acceder a una ruta de admin o ventas
    if (userRole === 'customer' && (isAdminPath || isSalesPath)) {
        return NextResponse.redirect(new URL('/dashboard', request.url)); // Redirigir a su dashboard de cliente
    }
  }

  return NextResponse.next();
}

export const config = {
  // Aplicar middleware a todas las rutas protegidas y de autenticación
  matcher: ['/dashboard/:path*', '/admin/:path*', '/sales/:path*', '/login', '/signup', '/forgot-password'],
};
