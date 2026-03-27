// frontend/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. Buscamos la cookie HttpOnly que nos dio el backend
  const token = request.cookies.get('access_token')?.value;
  const { pathname } = request.nextUrl;

  // 2. Definimos las rutas a las que SÍ se puede entrar sin login
  const isPublicPath = pathname === '/login' || pathname === '/join';

  // 3. REGLA A: Si NO tiene token y quiere entrar al Home (o cualquier otra privada) -> Al Login
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 4. REGLA B: Si SÍ tiene token y quiere ir al Login/Join -> Lo devolvemos al Home
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Si todo está correcto, le dejamos continuar
  return NextResponse.next();
}

// 5. Configuración: Le decimos a Next.js que ejecute esto en todas las páginas,
// excepto en archivos estáticos (imágenes, CSS) para no ralentizar la web.
export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};