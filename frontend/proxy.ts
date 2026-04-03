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

  const token = request.cookies.get("access_token")?.value;

  const currentLocale =
    locales.find((locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) ||
    defaultLocale;

  const pathWithoutLocale = pathname.replace(`/${currentLocale}`, "") || "/";

  const isPublicPath = pathWithoutLocale === "/login" || pathWithoutLocale === "/join";

  if (!token && !isPublicPath) {
    return NextResponse.redirect(new URL(`/${currentLocale}/login`, request.url));
  }

  if (token && isPublicPath) {
    return NextResponse.redirect(new URL(`/${currentLocale}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
