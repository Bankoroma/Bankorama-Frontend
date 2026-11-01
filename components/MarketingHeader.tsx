"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";

const LINKS = [
  ["#fonctionnement", "Fonctionnement"],
  ["#tarifs", "Tarifs"],
  ["#securite", "Sécurité"],
];

export function MarketingHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const close = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-mist/80 backdrop-blur-xl">
      <div className="safe-x mx-auto flex h-16 max-w-6xl items-center justify-between">
        <Link href="/" aria-label="Accueil LedgerConvert" className="rounded-xl">
          <Logo />
        </Link>

        <nav aria-label="Navigation principale" className="hidden items-center gap-1 md:flex">
          {LINKS.map(([href, label]) => (
            <a key={href} href={href} className="rounded-full px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-black/5 hover:text-ink">
              {label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/login" className="btn text-ink hover:bg-black/5">Connexion</Link>
          <Link href="/register" className="btn-dark">Créer un compte</Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="menu-mobile"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          className="grid h-11 w-11 place-items-center rounded-full text-ink hover:bg-black/5 md:hidden"
        >
          {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>
      </div>

      {open && (
        <nav id="menu-mobile" aria-label="Navigation mobile" className="safe-x border-t border-black/5 bg-mist pb-5 pt-2 md:hidden">
          {LINKS.map(([href, label]) => (
            <a key={href} href={href} onClick={() => setOpen(false)} className="block rounded-2xl px-4 py-3 text-base font-medium hover:bg-black/5">
              {label}
            </a>
          ))}
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link href="/login" className="btn-ghost">Connexion</Link>
            <Link href="/register" className="btn-dark">Créer un compte</Link>
          </div>
        </nav>
      )}
    </header>
  );
}
