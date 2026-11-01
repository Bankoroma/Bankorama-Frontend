"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle, Clock, FileSpreadsheet, FileText, LayoutDashboard, Loader2, LogOut, Menu, Plus,
  RefreshCw, ShieldCheck, UserCircle, X,
} from "lucide-react";
import { UploadBox } from "./UploadBox";
import {
  formatDate, formatPrice, getConversions, getMe, STATUS_LABELS,
  type Conversion, type CurrentUser,
} from "@/lib/api";

type View = "dashboard" | "conversions" | "account";

export default function DashboardClient() {
  const router = useRouter();
  const [sidebar, setSidebar] = useState(true);
  const [view, setView] = useState<View>("dashboard");
  const [showUpload, setShowUpload] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [me, history] = await Promise.all([getMe(), getConversions()]);
      setUser(me);
      setConversions(history);
    } catch (error) {
      console.error("Erreur de chargement du tableau de bord :", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("ledger_token")) {
      router.replace("/login");
      return;
    }
    void load();
  }, [router, load]);

  const stats = useMemo(() => {
    const success = conversions.filter((c) => c.status === "success");
    return {
      total: conversions.length,
      success: success.length,
      pages: success.reduce((sum, c) => sum + c.pages, 0),
    };
  }, [conversions]);

  function logout() {
    localStorage.removeItem("ledger_token");
    localStorage.removeItem("ledger_user");
    router.push("/login");
  }

  const quota = user?.plan?.monthly_credits ?? 0;
  const credits = user?.credits ?? 0;
  const ratio = quota ? Math.min(100, Math.round((credits / quota) * 100)) : 0;
  const canConvert = user?.subscription_status === "active";
  const displayedConversions = view === "dashboard" ? conversions.slice(0, 5) : conversions;

  const navItems: [View, string, typeof LayoutDashboard][] = [
    ["dashboard", "Tableau de bord", LayoutDashboard],
    ["conversions", "Mes conversions", FileSpreadsheet],
    ["account", "Mon compte", UserCircle],
  ];

  return (
    <div className="min-h-screen bg-secondary/45 text-neutral">
      <div className="flex min-h-screen">
        {sidebar && (
          <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white lg:static">
            <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
              <div className="text-xl font-extrabold">Ledger<span className="text-primary">Convert</span></div>
              <button className="lg:hidden" onClick={() => setSidebar(false)}><X size={20}/></button>
            </div>
            <nav className="flex-1 p-4">
              <p className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">Menu</p>
              {navItems.map(([key, label, Icon]) => (
                <button
                  key={key}
                  onClick={() => setView(key)}
                  className={`mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm ${
                    view === key ? "bg-primary font-semibold text-white" : "font-medium text-slate-600 hover:bg-secondary"
                  }`}
                >
                  <Icon size={18}/> {label}
                </button>
              ))}
              {user?.role === "admin" && (
                <>
                  <p className="mt-6 px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">Administration</p>
                  <Link href="/admin" className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-secondary">
                    <ShieldCheck size={18}/> Gestion des abonnements
                  </Link>
                </>
              )}
            </nav>
            <div className="border-t border-slate-100 p-4">
              <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600">
                <LogOut size={18}/> Déconnexion
              </button>
            </div>
          </aside>
        )}

        <section className="min-w-0 flex-1">
          <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 lg:px-8">
            <div className="flex items-center gap-3">
              {!sidebar && <button onClick={() => setSidebar(true)}><Menu /></button>}
              <div className="lg:hidden text-lg font-extrabold">Ledger<span className="text-primary">Convert</span></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-bold">{user?.raison_sociale ?? "…"}</p>
                <p className="text-xs text-slate-400">{user?.email}</p>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-primary"><UserCircle size={22}/></div>
            </div>
          </header>

          <main className="mx-auto max-w-6xl p-5 lg:p-8">
            {loading && !user ? (
              <div className="grid h-64 place-items-center text-primary"><Loader2 className="animate-spin" size={32} /></div>
            ) : (
              <>
                <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-sm text-slate-500">LedgerConvert · {navItems.find(([k]) => k === view)?.[1]}</p>
                    <h1 className="mt-1 text-3xl font-extrabold text-slate-950">Bonjour, {user?.raison_sociale}</h1>
                    <p className="mt-1 text-sm text-slate-500">Voici l&apos;état de vos ressources.</p>
                  </div>
                  <button
                    onClick={() => setShowUpload(true)}
                    disabled={!canConvert}
                    title={canConvert ? undefined : "Disponible après activation de votre abonnement"}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-white shadow-sm hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Plus size={19}/> Nouvelle conversion
                  </button>
                </div>

                {user && user.subscription_status !== "active" && (
                  <div className={`mt-6 flex gap-3 rounded-2xl border p-5 ${
                    user.subscription_status === "pending" ? "border-amber-200 bg-amber-50 text-amber-800" : "border-red-200 bg-red-50 text-red-700"
                  }`}>
                    {user.subscription_status === "pending" ? <Clock className="shrink-0" size={20}/> : <AlertTriangle className="shrink-0" size={20}/>}
                    <div>
                      <p className="font-bold">{STATUS_LABELS[user.subscription_status]}</p>
                      <p className="mt-1 text-sm">
                        {user.subscription_status === "pending"
                          ? `Votre formule ${user.plan?.name ?? ""} sera activée par notre équipe après validation. Vous recevrez un email dès que les conversions seront disponibles.`
                          : "Votre abonnement est suspendu : les conversions sont désactivées. Contactez le support pour le réactiver."}
                      </p>
                    </div>
                  </div>
                )}

                {view !== "account" && (
                  <>
                    {view === "dashboard" && (
                      <>
                        <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                          <div className="flex items-end justify-between">
                            <div>
                              <p className="text-sm font-semibold text-slate-500">Solde de conversion</p>
                              <p className="mt-2 text-3xl font-extrabold text-slate-950">
                                {credits}{" "}
                                <span className="text-base font-semibold text-slate-400">crédits restants</span>
                              </p>
                            </div>
                            <span className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-bold text-primary">
                              {credits} / {quota}
                            </span>
                          </div>
                          <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-200">
                            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${ratio}%` }}/>
                          </div>
                          {user?.credits_renew_at && canConvert && (
                            <p className="mt-3 text-xs text-slate-400">Recharge à {quota} crédits le {formatDate(user.credits_renew_at)}</p>
                          )}
                        </div>

                        <div className="mt-8 grid gap-5 md:grid-cols-3">
                          {[
                            ["Conversions", String(stats.total), "Total"],
                            ["Réussies", String(stats.success), `${stats.pages} page(s) traitée(s)`],
                            ["Formule", user?.plan?.name ?? "—", user?.plan ? `${quota} crédits / mois` : "Aucune formule"],
                          ].map(([label, value, note]) => (
                            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                              <p className="text-sm text-slate-500">{label}</p>
                              <p className="mt-2 text-2xl font-extrabold">{value}</p>
                              <p className="mt-1 text-xs text-slate-400">{note}</p>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
                      <div className="flex items-center justify-between border-b border-slate-100 p-5">
                        <div>
                          <h2 className="font-bold text-slate-900">{view === "dashboard" ? "Conversions récentes" : "Historique des conversions"}</h2>
                          <p className="mt-1 text-xs text-slate-400">Vos derniers traitements</p>
                        </div>
                        <button onClick={() => void load()} className="inline-flex items-center gap-2 text-xs font-bold text-primary">
                          <RefreshCw size={15} className={loading ? "animate-spin" : ""}/> Actualiser
                        </button>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {displayedConversions.length === 0 && (
                          <p className="p-8 text-center text-sm text-slate-400">Aucune conversion pour le moment.</p>
                        )}
                        {displayedConversions.map((item) => (
                          <div key={item.id} className="flex items-center justify-between gap-4 p-5">
                            <div className="flex min-w-0 items-center gap-4">
                              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-secondary text-primary"><FileText size={19}/></div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold">{item.filename}</p>
                                <p className="mt-1 text-xs text-slate-400">
                                  {formatDate(item.created_at, true)} · {item.pages} page(s) · {item.credits_used} crédit(s)
                                </p>
                              </div>
                            </div>
                            <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                              item.status === "success" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                            }`}>{item.status === "success" ? "Terminé" : "Échec (remboursé)"}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {view === "account" && user && (
                  <div className="mt-7 grid gap-5 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                      <h2 className="font-bold text-slate-900">Informations</h2>
                      <dl className="mt-4 space-y-3 text-sm">
                        <div className="flex justify-between gap-4"><dt className="text-slate-500">Raison sociale</dt><dd className="font-semibold">{user.raison_sociale}</dd></div>
                        <div className="flex justify-between gap-4"><dt className="text-slate-500">Email</dt><dd className="font-semibold">{user.email}</dd></div>
                      </dl>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                      <h2 className="font-bold text-slate-900">Abonnement</h2>
                      <dl className="mt-4 space-y-3 text-sm">
                        <div className="flex justify-between gap-4"><dt className="text-slate-500">Formule</dt><dd className="font-semibold">{user.plan?.name ?? "—"}</dd></div>
                        <div className="flex justify-between gap-4"><dt className="text-slate-500">Tarif</dt><dd className="font-semibold">{user.plan ? `${formatPrice(user.plan.price_ttc)} DH TTC` : "—"}</dd></div>
                        <div className="flex justify-between gap-4"><dt className="text-slate-500">Crédits mensuels</dt><dd className="font-semibold">{quota}</dd></div>
                        <div className="flex justify-between gap-4"><dt className="text-slate-500">Statut</dt><dd className="font-semibold">{STATUS_LABELS[user.subscription_status]}</dd></div>
                        <div className="flex justify-between gap-4"><dt className="text-slate-500">Activé le</dt><dd className="font-semibold">{formatDate(user.subscription_activated_at)}</dd></div>
                        <div className="flex justify-between gap-4"><dt className="text-slate-500">Prochaine recharge</dt><dd className="font-semibold">{formatDate(user.credits_renew_at)}</dd></div>
                      </dl>
                    </div>
                  </div>
                )}
              </>
            )}
          </main>
        </section>
      </div>

      {showUpload && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-5">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div><h2 className="text-2xl font-extrabold">Nouvelle conversion</h2><p className="mt-1 text-sm text-slate-500">Importez votre relevé bancaire PDF.</p></div>
              <button
                onClick={() => setShowUpload(false)}
                disabled={uploadBusy}
                title={uploadBusy ? "Conversion en cours" : "Fermer"}
                className="rounded-full p-2 hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-30"
              ><X/></button>
            </div>
            <UploadBox
              disabled={!canConvert}
              onBusyChange={setUploadBusy}
              onUploaded={(remaining) => {
                setUser((u) => (u ? { ...u, credits: remaining } : u));
                void load();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
