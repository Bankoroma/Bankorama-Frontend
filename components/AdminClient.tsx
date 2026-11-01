"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Clock3, Loader2, PauseCircle, RefreshCw, Search, Users, XCircle } from "lucide-react";
import { AppShell } from "./AppShell";
import {
  adminActivate, adminListUsers, adminSuspend, apiErrorMessage, formatDate, formatPrice, getMe, getPlans,
  STATUS_LABELS, type AdminUser, type CurrentUser, type Plan, type SubscriptionStatus,
} from "@/lib/api";

type Filter = SubscriptionStatus | "all";

const FILTERS: { key: Filter; label: string; icon: typeof Users; accent: string }[] = [
  { key: "pending", label: "En attente", icon: Clock3, accent: "text-amber" },
  { key: "active", label: "Actifs", icon: CheckCircle2, accent: "text-primary" },
  { key: "suspended", label: "Suspendus", icon: XCircle, accent: "text-danger" },
  { key: "all", label: "Tous", icon: Users, accent: "text-ink" },
];

const BADGE: Record<SubscriptionStatus, string> = {
  pending: "bg-amber-50 text-amber",
  active: "bg-primary-soft text-primary",
  suspended: "bg-danger/10 text-danger",
};

export default function AdminClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requested = searchParams.get("status") as Filter | null;
  const filter: Filter = requested && FILTERS.some((f) => f.key === requested) ? requested : "pending";

  const [me, setMe] = useState<CurrentUser | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [search, setSearch] = useState("");
  const [selectedPlans, setSelectedPlans] = useState<Record<number, string>>({});
  const [confirmSuspend, setConfirmSuspend] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setUsers(await adminListUsers());
    } catch (error) {
      setFeedback({ ok: false, text: await apiErrorMessage(error, "Impossible de charger les comptes. Actualisez la page.") });
    } finally {
      setLoading(false);
    }
  }, []);

  // Garde d'affichage uniquement : l'API et le RLS refusent de toute façon un non-admin
  useEffect(() => {
    if (!localStorage.getItem("ledger_token")) {
      router.replace("/login");
      return;
    }
    getMe()
      .then((user) => {
        if (user.role !== "admin") {
          router.replace("/dashboard");
          return;
        }
        setMe(user);
        void load();
        getPlans().then(setPlans).catch(() => undefined);
      })
      .catch(() => router.replace("/login"));
  }, [router, load]);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { all: users.length, pending: 0, active: 0, suspended: 0 };
    users.forEach((u) => { c[u.subscription_status] += 1; });
    return c;
  }, [users]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) =>
      (filter === "all" || u.subscription_status === filter) &&
      (!q || u.email.toLowerCase().includes(q) || u.raison_sociale.toLowerCase().includes(q))
    );
  }, [users, filter, search]);

  function replaceUser(updated: AdminUser) {
    setUsers((list) => list.map((u) => (u.id === updated.id ? updated : u)));
  }

  async function activate(user: AdminUser) {
    const planCode = selectedPlans[user.id] ?? user.plan?.code;
    setBusyId(user.id);
    setFeedback(null);
    try {
      const updated = await adminActivate(user.id, planCode);
      replaceUser(updated);
      setFeedback({ ok: true, text: `Formule ${updated.plan?.name} activée pour ${updated.raison_sociale} : ${updated.credits} crédits disponibles.` });
    } catch (error) {
      setFeedback({ ok: false, text: await apiErrorMessage(error, "Activation impossible. Réessayez.") });
    } finally {
      setBusyId(null);
    }
  }

  async function suspend(user: AdminUser) {
    setBusyId(user.id);
    setConfirmSuspend(null);
    setFeedback(null);
    try {
      const updated = await adminSuspend(user.id);
      replaceUser(updated);
      setFeedback({ ok: true, text: `Abonnement de ${updated.raison_sociale} suspendu. Vous pouvez le réactiver à tout moment.` });
    } catch (error) {
      setFeedback({ ok: false, text: await apiErrorMessage(error, "Suspension impossible. Réessayez.") });
    } finally {
      setBusyId(null);
    }
  }

  if (!me) {
    return <div className="grid min-h-dvh place-items-center text-primary" aria-label="Chargement…"><Loader2 className="animate-spin" size={32} aria-hidden="true" /></div>;
  }

  return (
    <AppShell user={me} active="admin">
      <div className="bento mb-2.5 flex flex-col justify-between gap-5 p-6 sm:flex-row sm:items-center md:p-8">
        <div>
          <p className="eyebrow">Administration</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tightest md:text-4xl">Abonnements</h1>
          <p className="mt-1 text-muted">Les nouveaux comptes se connectent tout de suite et convertissent après votre activation.</p>
        </div>
        <button type="button" onClick={() => void load()} disabled={loading} className="btn-ghost shrink-0">
          <RefreshCw size={16} aria-hidden="true" className={loading ? "animate-spin" : ""} /> Actualiser
        </button>
      </div>

      <nav aria-label="Filtrer par statut" className="mb-2.5 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        {FILTERS.map(({ key, label, icon: Icon, accent }) => {
          const current = filter === key;
          return (
            <Link
              key={key}
              href={`${pathname}?status=${key}`}
              scroll={false}
              aria-current={current ? "page" : undefined}
              className={`flex flex-col justify-between gap-5 rounded-bento p-5 transition-[background-color,box-shadow] duration-200 ${
                current ? "bg-ink text-white" : "bg-white shadow-bento hover:shadow-lift"
              }`}
            >
              <Icon size={20} aria-hidden="true" className={current ? "text-mint" : accent} />
              <div>
                <p className="num text-4xl">{counts[key]}</p>
                <p className={`mt-1 text-sm font-medium ${current ? "text-white/70" : "text-muted"}`}>{label}</p>
              </div>
            </Link>
          );
        })}
      </nav>

      {feedback && (
        <p role={feedback.ok ? "status" : "alert"} className={`bento mb-2.5 px-5 py-4 text-sm font-medium ${feedback.ok ? "text-primary" : "text-danger"}`}>
          {feedback.text}
        </p>
      )}

      <section className="bento" aria-labelledby="comptes-titre">
        <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
          <h2 id="comptes-titre" className="text-lg font-bold">
            {FILTERS.find((f) => f.key === filter)?.label} <span className="text-muted tabular">· {visible.length}</span>
          </h2>
          <div className="field mt-0 sm:w-80">
            <Search size={17} aria-hidden="true" className="shrink-0 text-subtle" />
            <label htmlFor="recherche" className="sr-only">Rechercher un compte</label>
            <input
              id="recherche"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              placeholder="Email ou raison sociale…"
            />
          </div>
        </div>

        {visible.length === 0 ? (
          <p className="px-5 pb-12 pt-6 text-center text-muted">{loading ? "Chargement des comptes…" : "Aucun compte dans cette catégorie."}</p>
        ) : (
          <ul className="divide-y divide-line px-2 pb-2">
            {visible.map((u) => {
              const busy = busyId === u.id;
              const isAdmin = u.role === "admin";
              return (
                <li key={u.id} className="grid gap-4 rounded-2xl px-3 py-4 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1.3fr)_auto] lg:items-center">
                  <div className="flex min-w-0 items-center gap-3">
                    <span aria-hidden="true" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-pill font-display text-sm font-bold">
                      {u.raison_sociale.slice(0, 1).toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 font-semibold">
                        <span className="truncate">{u.raison_sociale}</span>
                        {isAdmin && <span className="shrink-0 rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">Admin</span>}
                      </p>
                      <p className="truncate text-xs text-muted" title={u.email}>{u.email}</p>
                      <p className="text-xs text-subtle">Inscrit le {formatDate(u.created_at)}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${BADGE[u.subscription_status]}`}>{STATUS_LABELS[u.subscription_status]}</span>
                    <span className="rounded-full bg-pill px-3 py-1 text-xs font-medium text-muted tabular">
                      {u.credits}{u.plan ? ` / ${u.plan.monthly_credits}` : ""} crédits
                    </span>
                    <span className="rounded-full bg-pill px-3 py-1 text-xs font-medium text-muted tabular">{u.conversions_count} conversion(s)</span>
                  </div>

                  {!isAdmin && (
                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                      <label htmlFor={`plan-${u.id}`} className="sr-only">Formule de {u.raison_sociale}</label>
                      <select
                        id={`plan-${u.id}`}
                        value={selectedPlans[u.id] ?? u.plan?.code ?? ""}
                        onChange={(e) => setSelectedPlans((s) => ({ ...s, [u.id]: e.target.value }))}
                        className="min-h-11 rounded-full border border-line bg-white px-4 text-sm text-ink"
                      >
                        {!u.plan && <option value="">Choisir une formule…</option>}
                        {plans.map((p) => (
                          <option key={p.code} value={p.code}>
                            {p.name} · {formatPrice(p.price_ttc)} DH · {p.monthly_credits} cr.
                          </option>
                        ))}
                      </select>

                      <button type="button" onClick={() => void activate(u)} disabled={busy} className="btn-primary">
                        {busy ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <CheckCircle2 size={15} aria-hidden="true" />}
                        {u.subscription_status === "active" ? "Appliquer & recharger" : "Activer"}
                      </button>

                      {u.subscription_status !== "suspended" && (
                        confirmSuspend === u.id ? (
                          <span className="flex items-center gap-1 rounded-full bg-danger/5 p-1">
                            <button type="button" onClick={() => void suspend(u)} disabled={busy} className="btn min-h-9 bg-danger px-4 text-white hover:bg-danger/90">
                              Confirmer
                            </button>
                            <button type="button" onClick={() => setConfirmSuspend(null)} className="btn min-h-9 px-3 text-muted hover:bg-white">
                              Annuler
                            </button>
                          </span>
                        ) : (
                          <button type="button" onClick={() => setConfirmSuspend(u.id)} disabled={busy} className="btn-ghost hover:text-danger">
                            <PauseCircle size={15} aria-hidden="true" /> Suspendre
                          </button>
                        )
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </AppShell>
  );
}
