import type { Metadata } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import { LenisProvider } from "./components/lenis-provider";
import { CustomCursor } from "./components/custom-cursor";


const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap", weight: ["400", "500"] });
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
  weight: ["500", "700"],
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  weight: ["500"],
});

export const metadata: Metadata = {
  title: "Theo Stracke | Portfólio",
  description: "Analista de Suporte & Desenvolvedor de Sistemas — Portfólio de Theo Stracke.",
  icons: {
    icon: "/images/logos/ts.svg",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Se for Next.js 15+, precisa do await. Se for 14, funciona igual.
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value;
  
  // Agora o espanhol não cai mais de gaiato no pt-BR
  const htmlLang = locale === "en" ? "en" : locale === "es" ? "es" : "pt-BR";

  return (
    <html lang={htmlLang}>
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} bg-background text-ink antialiased`}>
        <CustomCursor />
        <LenisProvider>
          <div className="min-h-screen bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.04)_1px,transparent_0)] bg-[length:14px_14px]">
            {children}
          </div>
        </LenisProvider>
      </body>
    </html>
  );
}
