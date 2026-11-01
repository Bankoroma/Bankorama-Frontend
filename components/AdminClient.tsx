"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Loader2, PauseCircle, RefreshCw, Search, ShieldCheck } from "lucide-react";
import {
  adminActivate, adminListUsers, adminSuspend, apiErrorMessage, formatDate, formatPrice, getMe, getPlans,
  STATUS_LABELS, type AdminUser, type Plan, type SubscriptionStatus,
} from "@/lib/api";

const FILTERS: [SubscriptionStatus | "all", string][] = [
  ["pending", "En attente"],
  ["active", "Actifs"],
  ["suspended", "Suspendus"],
  ["all", "Tous"],
];

const BADGE: Record<SubscriptionStatus, string> = {
  pending: "bg-amber-50 text-amber-700",
  active: "bg-emerald-50 text-emerald-600",
  suspended: "bg-red-50 text-red-600",
};

export default function AdminClient() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [filter, setFilter] = useState<SubscriptionStatus | "all">("pending");
  const [search, setSearch] = useState("");
  const [selectedPlans, setSelectedPlans] = useState<Record<number, string>>({});
  const [busyId, setBusyId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setUsers(await adminListUsers());
    } catch (error) {
      setFeedback({ ok: false, text: await apiErrorMessage(error, "Impossible de charger les comptes.") });
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
      .then((me) => {
        if (me.role !== "admin") {
          router.replace("/dashboard");
          return;
        }
        setAuthorized(true);
        void load();
        getPlans().then(setPlans).catch(() => undefined);
      })
      .catch(() => router.replace("/login"));
  }, [router, load]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: users.length, pending: 0, active: 0, suspended: 0 };
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
      setFeedback({ ok: true, text: `Abonnement ${updated.plan?.name} activé pour ${updated.raison_sociale} (${updated.credits} crédits).` });
    } catch (error) {
      setFeedback({ ok: false, text: await apiErrorMessage(error, "Activation impossible.") });
    } finally {
      setBusyId(null);
    }
  }

  async function suspend(user: AdminUser) {
    setBusyId(user.id);
    setFeedback(null);
    try {
      const updated = await adminSuspend(user.id);
      replaceUser(updated);
      setFeedback({ ok: true, text: `Abonnement de ${updated.raison_sociale} suspendu.` });
    } catch (error) {
      setFeedback({ ok: false, text: await apiErrorMessage(error, "Suspension impossible.") });
    } finally {
      setBusyId(null);
    }
  }

  if (!authorized) {
    return <div className="grid min-h-screen place-items-center text-primary"><Loader2 className="animate-spin" size={32} /></div>;
  }

  return (
    <div className="min-h-screen bg-secondary/45 text-neutral">
      <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 lg:px-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary">
            <ArrowLeft size={16}/> Tableau de bord
          </Link>
          <span className="hidden text-slate-300 sm:inline">|</span>
          <p className="hidden items-center gap-2 font-extrabold sm:flex"><ShieldCheck size={18} className="text-primary"/> Administration</p>
        </div>
        <button onClick={() => void load()} className="inline-flex items-center gap-2 text-xs font-bold text-primary">
          <RefreshCw size={15} className={loading ? "animate-spin" : ""}/> Actualiser
        </button>
      </header>

      <main className="mx-auto max-w-7xl p-5 lg:p-8">
        <h1 className="text-3xl font-extrabold text-slate-950">Gestion des abonnements</h1>
        <p className="mt-1 text-sm text-slate-500">
          Les nouveaux comptes peuvent se connecter mais ne convertissent qu&apos;après votre activation.
        </p>

        <div className="mt-7 grid gap-4 sm:grid-cols-4">
          {FILTERS.map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`rounded-2xl border p-4 text-left shadow-sm transition ${
                filter === key ? "border-primary bg-primary text-white" : "border-slate-200 bg-white hover:border-primary/50"
              }`}
            >
              <p className={`text-sm ${filter === key ? "text-white/80" : "text-slate-500"}`}>{label}</p>
              <p className="mt-1 text-2xl font-extrabold">{counts[key]}</p>
            </button>
          ))}
        </div>

        {feedback && (
          <p className={`mt-6 rounded-xl p-3 text-sm ${feedback.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
            {feedback.text}
          </p>
        )}

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center gap-3 border-b border-slate-100 p-4">
            <Search size={18} className="text-slate-400"/>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher par email ou raison sociale"
              className="w-full border-0 bg-transparent text-sm outline-none"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-3">Client</th>
                  <th className="px-5 py-3">Inscription</th>
                  <th className="px-5 py-3">Formule</th>
                  <th className="px-5 py-3">Statut</th>
                  <th className="px-5 py-3">Crédits</th>
                  <th className="px-5 py-3">Conversions</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visible.length === 0 && (
                  <tr><td colSpan={7} className="p-8 text-center text-slate-400">{loading ? "Chargement…" : "Aucun compte."}</td></tr>
                )}
                {visible.map((u) => {
                  const busy = busyId === u.id;
                  return (
                    <tr key={u.id}>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">
                          {u.raison_sociale}
                          {u.role === "admin" && <span className="ml-2 rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">Admin</span>}
                        </p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-500">{formatDate(u.created_at)}</td>
                      <td className="px-5 py-4">
                        {u.role === "admin" ? "—" : (
                          <select
                            value={selectedPlans[u.id] ?? u.plan?.code ?? ""}
                            onChange={(e) => setSelectedPlans((s) => ({ ...s, [u.id]: e.target.value }))}
                            className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-primary"
                          >
                            {!u.plan && <option value="">Choisir…</option>}
                            {plans.map((p) => (
                              <option key={p.code} value={p.code}>
                                {p.name} · {formatPrice(p.price_ttc)} DH · {p.monthly_credits} cr.
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${BADGE[u.subscription_status]}`}>
                          {STATUS_LABELS[u.subscription_status]}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-semibold">{u.credits}{u.plan ? <span className="font-normal text-slate-400"> / {u.plan.monthly_credits}</span> : null}</td>
                      <td className="px-5 py-4">{u.conversions_count}</td>
                      <td className="px-5 py-4">
                        {u.role !== "admin" && (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => void activate(u)}
                              disabled={busy}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white hover:bg-teal-700 disabled:opacity-50"
                            >
                              {busy ? <Loader2 size={14} className="animate-spin"/> : <CheckCircle2 size={14}/>}
                              {u.subscription_status === "active" ? "Appliquer / recharger" : "Activer"}
                            </button>
                            {u.subscription_status !== "suspended" && (
                              <button
                                onClick={() => void suspend(u)}
                                disabled={busy}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-600 hover:border-red-300 hover:text-red-600 disabled:opacity-50"
                              >
                                <PauseCircle size={14}/> Suspendre
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
