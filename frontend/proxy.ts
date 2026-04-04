import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["es", "en"];
const defaultLocale = "es";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  if (!pathnameHasLocale) {
    return NextResponse.redirect(new URL(`/${defaultLocale}${pathname}`, request.url));
  }

  // ==============================================================
  // 🕵️‍♂️ INICIO TELEMETRÍA MIDDLEWARE
  // ==============================================================
  const accessToken = request.cookies.get("access_token")?.value;
  const refreshToken = request.cookies.get("refresh_token")?.value;

  console.log(`\n🚦 [MIDDLEWARE] Interceptando navegación hacia: ${pathname}`);
  console.log(`   👉 Access Token (15m) presente:  ${accessToken ? "✅ SÍ" : "❌ NO"}`);
  console.log(`   👉 Refresh Token (7d) presente: ${refreshToken ? "✅ SÍ" : "❌ NO"}`);
  // ==============================================================

  const currentLocale =
    locales.find((locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) ||
    defaultLocale;

  const pathWithoutLocale = pathname.replace(`/${currentLocale}`, "") || "/";
  const isPublicPath = pathWithoutLocale === "/login" || pathWithoutLocale === "/join";

  if (!accessToken && !isPublicPath) {
    console.log(`   🛑 [MIDDLEWARE] Bloqueado. Redirigiendo a /login (Falta Access Token)`);
    return NextResponse.redirect(new URL(`/${currentLocale}/login`, request.url));
  }

  if (accessToken && isPublicPath) {
    console.log(`   ♻️ [MIDDLEWARE] Usuario ya logueado. Redirigiendo a la Home.`);
    return NextResponse.redirect(new URL(`/${currentLocale}`, request.url));
  }

  console.log(`   ✅ [MIDDLEWARE] Paso permitido.`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
