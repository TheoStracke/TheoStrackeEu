import type { Route } from "next";
import Link from "next/link";
import en from "@/dictionaries/en.json";
import es from "@/dictionaries/es.json";
import pt from "@/dictionaries/pt.json";
import { TsLogo } from "../components/ui/icons";

// not-found não recebe params: oferece o caminho de volta nos três idiomas
const HOME_LINKS = [
  { href: "/pt", label: pt.nav.home },
  { href: "/en", label: en.nav.home },
  { href: "/es", label: es.nav.home },
];

export default function NotFound() {
  return (
    <main className="container-editorial flex min-h-svh flex-col items-start justify-center gap-10">
      <TsLogo className="h-10 w-auto text-white" />
      <p className="display text-[clamp(5rem,18vw,16rem)] text-white">404</p>
      <nav className="label flex flex-wrap gap-6 text-muted">
        {HOME_LINKS.map(({ href, label }) => (
          <Link key={href} href={href as Route} className="link-underline hover:text-white">
            {label}
          </Link>
        ))}
      </nav>
    </main>
  );
}
