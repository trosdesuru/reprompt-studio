// frontend/src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 🌍 1. Configuramos los idiomas soportados
const locales = ["es", "en"];
const defaultLocale = "es";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 🌍 2. ¿La URL actual tiene ya un idioma en la ruta? (ej. /es/algo o /en/algo)
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  // Si NO tiene idioma (ej. entró a "/studio"), lo redirigimos añadiendo el idioma por defecto
  if (!pathnameHasLocale) {
    // Nota: Más adelante podemos hacer que lea el navegador para elegir entre ES/EN
    return NextResponse.redirect(new URL(`/${defaultLocale}${pathname}`, request.url));
  }

  // 🔒 3. LOGICA DE AUTENTICACIÓN
  const token = request.cookies.get("access_token")?.value;

  // Extraemos qué idioma está usando ahora mismo para no perderlo en las redirecciones
  const currentLocale =
    locales.find((locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) ||
    defaultLocale;

  // "Limpiamos" la ruta mentalmente para aplicar las reglas más fácil
  // Si la ruta es "/es/login", pathWithoutLocale será "/login"
  const pathWithoutLocale = pathname.replace(`/${currentLocale}`, "") || "/";

  const isPublicPath = pathWithoutLocale === "/login" || pathWithoutLocale === "/join";

  // 🔒 REGLA A: Si NO tiene token y va a una ruta privada -> Al Login (con su idioma)
  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL(`/${currentLocale}/login`, request.url));
  }

  // 🔒 REGLA B: Si SÍ tiene token y va al Login/Join -> Al Home (con su idioma)
  if (token && isPublicPath) {
    return NextResponse.redirect(new URL(`/${currentLocale}`, request.url));
  }

  // Si todo está correcto, le dejamos continuar
  return NextResponse.next();
}

// Configuración: ignoramos API, estáticos de Next y archivos públicos de imágenes
export const config = {
  matcher: [
    // Se saltará las rutas /api, _next y archivos con extensión (como .svg, .png, etc)
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
