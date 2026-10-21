import { NextResponse, type NextRequest } from "next/server";
import { i18n, isValidLocale, type Locale } from "./lib/i18n";

const maintenanceModeEnabled = process.env.MAINTENANCE_MODE === "true";
const LOCALE_COOKIE = "NEXT_LOCALE";

// ── Resolução de idioma: cookie → Accept-Language → padrão ──
function getPreferredLocale(request: NextRequest): Locale {
  const savedLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  if (savedLocale && isValidLocale(savedLocale)) return savedLocale;

  // Ex.: "pt-br,pt;q=0.9,es;q=0.8" → ["pt", "pt", "es"]
  const requested = (request.headers.get("accept-language") ?? "")
    .toLowerCase()
    .split(",")
    .map((lang) => lang.split(";")[0].split("-")[0].trim());

  return requested.find(isValidLocale) ?? i18n.defaultLocale;
}

function redirectTo(request: NextRequest, pathname: string, locale: Locale) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  const response = NextResponse.redirect(url);
  response.cookies.set(LOCALE_COOKIE, locale, { path: "/" });
  return response;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const matchedLocale = i18n.locales.find((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`));

  const isMaintenanceRoute = i18n.locales.some(
    (locale) => pathname === `/${locale}/maintenance` || pathname.startsWith(`/${locale}/maintenance/`),
  );

  if (maintenanceModeEnabled && !isMaintenanceRoute) {
    const locale = matchedLocale ?? getPreferredLocale(request);
    return redirectTo(request, `/${locale}/maintenance`, locale);
  }

  if (matchedLocale) {
    const response = NextResponse.next();
    response.cookies.set(LOCALE_COOKIE, matchedLocale, { path: "/" });
    return response;
  }

  // Raiz ou URL sem idioma → prefixa com o idioma preferido
  const locale = getPreferredLocale(request);
  return redirectTo(request, pathname === "/" ? `/${locale}` : `/${locale}${pathname}`, locale);
}

export const config = {
  // Ignora assets, imagens, OG e arquivos com extensão
  matcher: ["/((?!api|_next/static|_next/image|og|favicon.ico|images|.*\\..*).*)"],
};
