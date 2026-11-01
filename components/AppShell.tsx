"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileSpreadsheet, LayoutGrid, LogOut, Menu, ShieldCheck, UserRound, X } from "lucide-react";
import { Logo } from "./Logo";
import type { CurrentUser } from "@/lib/api";

export type Section = "dashboard" | "conversions" | "account" | "admin";

const NAV: { key: Section; href: string; label: string; icon: typeof LayoutGrid }[] = [
  { key: "dashboard", href: "/dashboard", label: "Vue d’ensemble", icon: LayoutGrid },
  { key: "conversions", href: "/dashboard?view=conversions", label: "Mes conversions", icon: FileSpreadsheet },
  { key: "account", href: "/dashboard?view=account", label: "Mon compte", icon: UserRound },
];

export function AppShell({
  user,
  active,
  children,
}: {
  user: CurrentUser | null;
  active: Section;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    setDrawer(false);
  }, [active]);

  useEffect(() => {
    if (!drawer) return;
    const close = (e: KeyboardEvent) => e.key === "Escape" && setDrawer(false);
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [drawer]);

  function logout() {
    localStorage.removeItem("ledger_token");
    localStorage.removeItem("ledger_user");
    router.push("/login");
  }

  const items = user?.role === "admin"
    ? [...NAV, { key: "admin" as Section, href: "/admin", label: "Abonnements", icon: ShieldCheck }]
    : NAV;

  const nav = (
    <nav aria-label="Navigation de l’espace client" className="flex flex-1 flex-col gap-1">
      {items.map(({ key, href, label, icon: Icon }) => (
        <Link
          key={key}
          href={href}
          aria-current={active === key ? "page" : undefined}
          className={`flex min-h-11 items-center gap-3 rounded-2xl px-4 text-sm font-medium transition-colors ${
            active === key ? "bg-ink text-white" : "text-muted hover:bg-pill hover:text-ink"
          } ${key === "admin" ? "mt-4" : ""}`}
        >
          <Icon size={18} aria-hidden="true" /> {label}
        </Link>
      ))}
    </nav>
  );

  const account = (
    <div className="rounded-2xl bg-mist p-3">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-ink font-display text-sm font-bold text-white">
          {(user?.raison_sociale ?? "·").slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{user?.raison_sociale ?? "Chargement…"}</p>
          <p className="truncate text-xs text-muted">{user?.email}</p>
        </div>
      </div>
      <button type="button" onClick={logout} className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-muted transition-colors hover:bg-white hover:text-danger">
        <LogOut size={16} aria-hidden="true" /> Déconnexion
      </button>
    </div>
  );

  return (
    <div className="safe-x flex min-h-dvh gap-2.5 py-2.5 lg:pl-2.5">
      {/* Barre latérale desktop */}
      <aside className="bento sticky top-2.5 hidden h-[calc(100dvh-1.25rem)] w-64 shrink-0 flex-col gap-6 p-4 lg:flex">
        <Link href="/" aria-label="Accueil LedgerConvert" className="w-fit rounded-xl px-2 pt-2"><Logo /></Link>
        {nav}
        {account}
      </aside>

      {/* Tiroir mobile */}
      {drawer && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" aria-label="Fermer le menu" onClick={() => setDrawer(false)} className="absolute inset-0 bg-ink/30 backdrop-blur-sm" />
          <aside className="bento absolute inset-y-2.5 left-2.5 flex w-72 max-w-[85vw] flex-col gap-6 overscroll-contain p-4">
            <div className="flex items-center justify-between px-2 pt-2">
              <Logo />
              <button type="button" onClick={() => setDrawer(false)} aria-label="Fermer le menu" className="grid h-11 w-11 place-items-center rounded-full hover:bg-pill">
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            {nav}
            {account}
          </aside>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="bento mb-2.5 flex h-16 items-center justify-between px-3 lg:hidden">
          <button type="button" onClick={() => setDrawer(true)} aria-label="Ouvrir le menu" aria-expanded={drawer} className="grid h-11 w-11 place-items-center rounded-full hover:bg-pill">
            <Menu size={20} aria-hidden="true" />
          </button>
          <Logo />
          <span className="w-11" aria-hidden="true" />
        </div>
        <main id="contenu" className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
