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

  console.log(`\n🚦 [PROXY] Interceptando navegación hacia: ${pathname}`);
  console.log(`   👉 Access Token (15m) presente:  ${accessToken ? "✅ SÍ" : "❌ NO"}`);
  console.log(`   👉 Refresh Token (7d) presente: ${refreshToken ? "✅ SÍ" : "❌ NO"}`);
  // ==============================================================

  const currentLocale =
    locales.find((locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) ||
    defaultLocale;

  const pathWithoutLocale = pathname.replace(`/${currentLocale}`, "") || "/";

  // 🟢 LA SOLUCIÓN: Definimos rutas públicas exactas y prefijos públicos
  const publicExactPaths = ["/login"]; // Quitamos "/join" porque ya purgramos ese código muerto
  const publicPrefixes = ["/google/callback", "/discord/callback"]; // Vía libre a los OAuth

  // Comprobamos si la ruta actual es pública
  const isPublicPath =
    publicExactPaths.includes(pathWithoutLocale) ||
    publicPrefixes.some((prefix) => pathWithoutLocale.startsWith(prefix));

  const hasAnyAuth = !!accessToken || !!refreshToken;

  if (!hasAnyAuth && !isPublicPath) {
    console.log(`   🛑 [PROXY] Bloqueado. Redirigiendo a /login (Sin sesión)`);
    return NextResponse.redirect(new URL(`/${currentLocale}/login`, request.url));
  }

  const isCallbackPath = publicPrefixes.some((prefix) => pathWithoutLocale.startsWith(prefix));

  if (hasAnyAuth && isPublicPath && !isCallbackPath) {
    console.log(`   ♻️ [PROXY] Usuario ya logueado o con Refresh vivo. Redirigiendo a la Home.`);
    return NextResponse.redirect(new URL(`/${currentLocale}`, request.url));
  }

  if (!accessToken && refreshToken && !isPublicPath) {
    console.log(
      `   🔄 [PROXY] Access Token caducado. Permitimos paso para que el cliente haga Silent Refresh.`,
    );
    return NextResponse.next();
  }

  console.log(`   ✅ [PROXY] Paso permitido.`);
  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
