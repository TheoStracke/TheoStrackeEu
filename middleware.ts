import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { i18n } from "./lib/i18n";

const maintenanceModeEnabled = process.env.MAINTENANCE_MODE === "true";

function getPreferredLocale(request: NextRequest): string {
  // 1. Primeiro de tudo: respeitar a escolha prévia do vivente (Cookie)
  const savedLocale = request.cookies.get("NEXT_LOCALE")?.value;
  if (savedLocale && i18n.locales.includes(savedLocale as any)) {
    return savedLocale;
  }

  // 2. Se não tem cookie, vamos espiar o idioma do navegador
  const acceptLanguage = request.headers.get("accept-language")?.toLowerCase() || "";
  
  // Extrai os idiomas na ordem de preferência do usuário
  // Ex: "pt-br,pt;q=0.9,es;q=0.8" -> ["pt", "pt", "es"]
  const requestedLocales = acceptLanguage
    .split(",")
    .map((lang) => lang.split(";")[0].split("-")[0].trim());

  // Acha o primeiro idioma da lista do navegador que a gente suporta
  const matched = requestedLocales.find((lang) =>
    i18n.locales.includes(lang as any)
  );

  // 3. Retorna o que achou, ou cai pro fallback seguro (defaultLocale)
  return matched || i18n.defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const matchedLocale = i18n.locales.find(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  );

  const isMaintenanceRoute =
    pathname === "/maintenance" ||
    i18n.locales.some(
      (locale) =>
        pathname === `/${locale}/maintenance` || pathname.startsWith(`/${locale}/maintenance/`)
    );

  if (maintenanceModeEnabled && !isMaintenanceRoute) {
    const locale = matchedLocale || getPreferredLocale(request);
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = `/${locale}/maintenance`;

    const response = NextResponse.redirect(redirectUrl);
    response.cookies.set("NEXT_LOCALE", locale, { path: "/" });
    return response;
  }

  // Verifica se a URL já tá com o idioma certinho
  if (matchedLocale) {
    // Se já tá certo, só renova o cookie e segue o baile (NextResponse.next)
    const response = NextResponse.next();
    response.cookies.set("NEXT_LOCALE", matchedLocale, { path: "/" });
    return response;
  }

  // Se chegou aqui, tá na raiz (/) ou numa URL sem idioma. Vamos redirecionar!
  const locale = getPreferredLocale(request);
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;

  const response = NextResponse.redirect(redirectUrl);
  response.cookies.set("NEXT_LOCALE", locale, { path: "/" });
  return response;
}

export const config = {
  // Esse matcher garante que não vamos tentar traduzir imagens, favicons ou robôs
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images|.*\\..*).*)"],
};