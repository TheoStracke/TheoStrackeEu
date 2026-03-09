import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { i18n } from "./lib/i18n";

function getPreferredLocale(request: NextRequest) {
  const acceptLanguage = request.headers.get("accept-language")?.toLowerCase() || "";

  if (acceptLanguage.includes("en")) {
    return "en";
  }

  return i18n.defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const matchedLocale = i18n.locales.find(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  if (matchedLocale) {
    const response = NextResponse.next();
    response.cookies.set("NEXT_LOCALE", matchedLocale, { path: "/" });
    return response;
  }

  const locale = getPreferredLocale(request);
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;

  const response = NextResponse.redirect(redirectUrl);
  response.cookies.set("NEXT_LOCALE", locale, { path: "/" });
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|.*\\..*).*)"],
};
