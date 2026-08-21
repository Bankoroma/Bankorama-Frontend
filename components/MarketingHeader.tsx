import Link from "next/link";
import { Logo } from "./Logo";

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
        <Link href="/"><Logo /></Link>
        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          <a href="#fonctionnement" className="hover:text-primary">Comment ça marche</a>
          <a href="#abonnements" className="hover:text-primary">Abonnements</a>
          <a href="#confiance" className="hover:text-primary">Pourquoi nous</a>
        </nav>
        <Link
          href="/login"
          className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
        >
          Connexion
        </Link>
      </div>
    </header>
  );
}