// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Las cookies de Firebase Auth se gestionan automáticamente en el lado del cliente,
  // y la sesión se verifica con el oyente onAuthStateChanged.
  // Un middleware basado en cookies del lado del servidor podría ser complejo
  // y propenso a errores sin una estrategia de sincronización de tokens.
  // Por lo tanto, dejaremos que la lógica del lado del cliente en los componentes y hooks
  // maneje la redirección basada en el estado de autenticación.

  return NextResponse.next();
}

export const config = {
  // No es necesario que el middleware se ejecute en ninguna ruta por ahora.
  matcher: [],
};
