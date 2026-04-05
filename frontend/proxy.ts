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

  const hasAnyAuth = !!accessToken || !!refreshToken;

  if (!hasAnyAuth && !isPublicPath) {
    console.log(`   🛑 [MIDDLEWARE] Bloqueado. Redirigiendo a /login (Sin sesión)`);
    return NextResponse.redirect(new URL(`/${currentLocale}/login`, request.url));
  }

  if (hasAnyAuth && isPublicPath) {
    console.log(
      `   ♻️ [MIDDLEWARE] Usuario ya logueado o con Refresh vivo. Redirigiendo a la Home.`,
    );
    return NextResponse.redirect(new URL(`/${currentLocale}`, request.url));
  }

  if (!accessToken && refreshToken && !isPublicPath) {
    console.log(
      `   🔄 [MIDDLEWARE] Access Token caducado. Permitimos paso para que el cliente haga Silent Refresh.`,
    );
    return NextResponse.next();
  }

  console.log(`   ✅ [MIDDLEWARE] Paso permitido.`);
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
