import type { Metadata } from "next";
import { Inter, Unbounded } from "next/font/google";
import "./globals.css";
import { LenisProvider } from "./components/lenis-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const unbounded = Unbounded({
  subsets: ["latin"],
  variable: "--font-unbounded",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Theo Stracke | Portfólio",
  description: "Analista de Suporte & Desenvolvedor de Sistemas — Portfólio de Theo Stracke.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${unbounded.variable} bg-background text-ink antialiased`}>
        <LenisProvider>
          <div className="min-h-screen bg-[radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.04)_1px,transparent_0)] bg-[length:14px_14px]">
            {children}
          </div>
        </LenisProvider>
      </body>
    </html>
  );
}
