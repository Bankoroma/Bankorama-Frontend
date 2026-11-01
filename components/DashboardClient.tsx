"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle, ArrowUpRight, CalendarClock, CheckCircle2, Clock3, FileText, Layers, Plus, RefreshCw, X, XCircle,
} from "lucide-react";
import { AppShell, type Section } from "./AppShell";
import { UploadBox } from "./UploadBox";
import {
  formatDate, formatPrice, getConversions, getMe, STATUS_LABELS,
  type Conversion, type CurrentUser,
} from "@/lib/api";

type View = Exclude<Section, "admin">;

const TITLES: Record<View, [string, string]> = {
  dashboard: ["Vue d’ensemble", "Vos crédits et vos dernières conversions."],
  conversions: ["Mes conversions", "L’historique complet de vos traitements."],
  account: ["Mon compte", "Vos informations et votre abonnement."],
};

export default function DashboardClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requested = searchParams.get("view");
  const view: View = requested === "conversions" || requested === "account" ? requested : "dashboard";

  const [showUpload, setShowUpload] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const [me, history] = await Promise.all([getMe(), getConversions(100)]);
      setUser(me);
      setConversions(history);
    } catch {
      setLoadError(true);
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
      failed: conversions.length - success.length,
      pages: success.reduce((sum, c) => sum + c.pages, 0),
    };
  }, [conversions]);

  const quota = user?.plan?.monthly_credits ?? 0;
  const credits = user?.credits ?? 0;
  const canConvert = user?.subscription_status === "active";
  const [title, subtitle] = TITLES[view];

  return (
    <AppShell user={user} active={view}>
      {/* En-tête de page */}
      <div className="bento mb-2.5 flex flex-col justify-between gap-5 p-6 sm:flex-row sm:items-center md:p-8">
        <div className="min-w-0">
          <p className="eyebrow">{user ? `Bonjour, ${user.raison_sociale}` : "Espace client"}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tightest md:text-4xl">{title}</h1>
          <p className="mt-1 text-muted">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowUpload(true)}
          disabled={!canConvert}
          aria-describedby={canConvert ? undefined : "statut-abonnement"}
          className="btn-primary h-12 shrink-0 px-6 text-[15px]"
        >
          <Plus size={18} aria-hidden="true" /> Nouvelle conversion
        </button>
      </div>

      {loadError && (
        <div role="alert" className="bento mb-2.5 flex flex-wrap items-center justify-between gap-3 p-5 text-danger">
          <p className="text-sm font-medium">Impossible de charger vos données. Vérifiez votre connexion puis réessayez.</p>
          <button type="button" onClick={() => void load()} className="btn-ghost">Réessayer</button>
        </div>
      )}

      {user && user.subscription_status !== "active" && <StatusBanner user={user} />}

      {loading && !user ? (
        <DashboardSkeleton />
      ) : (
        <>
          {view === "dashboard" && user && (
            <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-4">
              <CreditsCard user={user} />

              <button
                type="button"
                onClick={() => setShowUpload(true)}
                disabled={!canConvert}
                className="bento group flex min-h-[180px] flex-col justify-between p-6 text-left text-white transition-transform duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 col-span-2"
                style={{ background: "linear-gradient(145deg, #0F766E 0%, #12806f 55%, #1D9486 100%)" }}
              >
                <span className="flex w-full items-start justify-between">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15"><Plus size={22} aria-hidden="true" /></span>
                  <ArrowUpRight size={22} aria-hidden="true" className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
                <span>
                  <span className="block font-display text-2xl font-bold tracking-tight">Convertir un relevé</span>
                  <span className="mt-1 block text-sm text-white/80">PDF jusqu’à 10&nbsp;Mo · 1 page = 1 crédit</span>
                </span>
              </button>

              <StatCard icon={Layers} label="Conversions" value={stats.total} note={`${stats.success} réussie(s)`} />
              <StatCard icon={FileText} label="Pages traitées" value={stats.pages} note="Depuis l’ouverture" />

              <div className="col-span-2 xl:col-span-4">
                <HistoryCard
                  items={conversions.slice(0, 5)}
                  title="Conversions récentes"
                  loading={loading}
                  onRefresh={load}
                  footer={conversions.length > 5 ? { href: "/dashboard?view=conversions", label: `Voir les ${conversions.length} conversions` } : undefined}
                />
              </div>
            </div>
          )}

          {view === "conversions" && (
            <div className="space-y-2.5">
              <div className="grid gap-2.5 sm:grid-cols-3">
                <StatCard icon={Layers} label="Total" value={stats.total} />
                <StatCard icon={CheckCircle2} label="Réussies" value={stats.success} accent="text-primary" />
                <StatCard icon={XCircle} label="Échecs remboursés" value={stats.failed} accent={stats.failed ? "text-danger" : undefined} />
              </div>
              <HistoryCard items={conversions} title="Historique" loading={loading} onRefresh={load} />
            </div>
          )}

          {view === "account" && user && (
            <div className="grid gap-2.5 md:grid-cols-2">
              <div className="bento p-6 md:p-8">
                <h2 className="text-lg font-bold">Informations</h2>
                <dl className="mt-6 divide-y divide-line text-sm">
                  <Row label="Raison sociale" value={user.raison_sociale} />
                  <Row label="Email" value={user.email} />
                  <Row label="Rôle" value={user.role === "admin" ? "Administrateur" : "Client"} />
                </dl>
              </div>
              <div className="bento p-6 md:p-8">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-bold">Abonnement</h2>
                  <StatusPill status={user.subscription_status} />
                </div>
                <dl className="mt-6 divide-y divide-line text-sm">
                  <Row label="Formule" value={user.plan?.name ?? "—"} />
                  <Row label="Tarif" value={user.plan ? `${formatPrice(user.plan.price_ttc)} DH TTC / mois` : "—"} />
                  <Row label="Crédits mensuels" value={String(quota)} />
                  <Row label="Crédits restants" value={String(credits)} />
                  <Row label="Activé le" value={formatDate(user.subscription_activated_at)} />
                  <Row label="Prochaine recharge" value={formatDate(user.credits_renew_at)} />
                </dl>
              </div>
            </div>
          )}
        </>
      )}

      {showUpload && (
        <UploadDialog
          busy={uploadBusy}
          onClose={() => setShowUpload(false)}
        >
          <UploadBox
            disabled={!canConvert}
            onBusyChange={setUploadBusy}
            onUploaded={(remaining) => {
              setUser((u) => (u ? { ...u, credits: remaining } : u));
              void load();
            }}
          />
        </UploadDialog>
      )}
    </AppShell>
  );
}

// ---------------------------------------------------------------------------

function CreditsCard({ user }: { user: CurrentUser }) {
  const credits = user.credits;
  const quota = user.plan?.monthly_credits ?? 0;
  const renewAt = user.subscription_status === "active" ? user.credits_renew_at : null;
  const ratio = quota ? Math.min(1, credits / quota) : 0;
  const r = 52;
  const circumference = 2 * Math.PI * r;
  const low = quota > 0 && ratio <= 0.15;

  return (
    <div className="bento-dark col-span-2 flex flex-col justify-between gap-6 p-6 md:p-7 xl:row-span-2">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/60">Solde de crédits</p>
          <p className="mt-3 flex items-baseline gap-2">
            <span className="num text-6xl md:text-7xl">{credits}</span>
            <span className="text-lg font-semibold text-white/50 tabular">/ {quota}</span>
          </p>
        </div>
        <svg viewBox="0 0 128 128" role="img" aria-label={`${Math.round(ratio * 100)} % du quota mensuel restant`} className="h-24 w-24 shrink-0 md:h-32 md:w-32">
          <circle cx="64" cy="64" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
          <g style={{ transformBox: "fill-box", transformOrigin: "center", transform: "rotate(-90deg)" }}>
            <circle
              cx="64" cy="64" r={r} fill="none"
              stroke={low ? "#fb923c" : "#34d399"}
              strokeWidth="12" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - ratio)}
            />
          </g>
          <text x="64" y="70" textAnchor="middle" className="fill-white font-display text-[20px] font-bold">{Math.round(ratio * 100)}%</text>
        </svg>
      </div>

      {/* Formule intégrée à la carte : remplit le bloc et évite une cellule vide dans la grille */}
      <div className="rounded-2xl bg-white/[0.06] p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-white/60">Formule</p>
            <p className="mt-0.5 truncate font-display text-xl font-bold tracking-tight">{user.plan?.name ?? "Aucune"}</p>
          </div>
          <StatusPill status={user.subscription_status} dark />
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-xl bg-white/[0.06] px-3 py-2.5">
            <dt className="text-xs text-white/60">Tarif</dt>
            <dd className="mt-0.5 font-semibold tabular">{user.plan ? `${formatPrice(user.plan.price_ttc)} DH TTC` : "—"}</dd>
          </div>
          <div className="rounded-xl bg-white/[0.06] px-3 py-2.5">
            <dt className="text-xs text-white/60">Crédits / mois</dt>
            <dd className="mt-0.5 font-semibold tabular">{quota}</dd>
          </div>
        </dl>
      </div>

      <div className="space-y-3">
        {low && (
          <p className="flex items-center gap-2 rounded-2xl bg-orange-400/15 px-3.5 py-2.5 text-sm text-orange-200">
            <AlertTriangle size={16} aria-hidden="true" /> Crédits bientôt épuisés.
          </p>
        )}
        <p className="flex items-center gap-2 text-sm text-white/65">
          <CalendarClock size={16} aria-hidden="true" />
          {renewAt ? <>Recharge à {quota} crédits le {formatDate(renewAt)}</> : "Recharge mensuelle après activation"}
        </p>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, note, accent }: {
  icon: typeof Layers; label: string; value: number; note?: string; accent?: string;
}) {
  return (
    <div className="bento flex flex-col justify-between gap-6 p-6">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-pill text-ink"><Icon size={18} aria-hidden="true" /></span>
      <div>
        <p className={`num text-4xl ${accent ?? "text-ink"}`}>{value}</p>
        <p className="mt-1.5 text-sm font-semibold">{label}</p>
        {note && <p className="text-xs text-muted">{note}</p>}
      </div>
    </div>
  );
}

function StatusPill({ status, dark = false }: { status: CurrentUser["subscription_status"]; dark?: boolean }) {
  const style = dark
    ? { active: "bg-mint/15 text-mint", pending: "bg-amber-300/15 text-amber-200", suspended: "bg-red-400/15 text-red-200" }[status]
    : { active: "bg-primary-soft text-primary", pending: "bg-amber-50 text-amber", suspended: "bg-danger/10 text-danger" }[status];
  return <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${style}`}>{STATUS_LABELS[status]}</span>;
}

function StatusBanner({ user }: { user: CurrentUser }) {
  const pending = user.subscription_status === "pending";
  return (
    <div id="statut-abonnement" role="status" className={`bento mb-2.5 flex gap-4 p-5 ${pending ? "ring-1 ring-amber/30" : "ring-1 ring-danger/30"}`}>
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl ${pending ? "bg-amber-50 text-amber" : "bg-danger/10 text-danger"}`}>
        {pending ? <Clock3 size={20} aria-hidden="true" /> : <AlertTriangle size={20} aria-hidden="true" />}
      </span>
      <div>
        <p className="font-semibold">{pending ? "Abonnement en attente d’activation" : "Abonnement suspendu"}</p>
        <p className="mt-1 text-sm leading-6 text-muted">
          {pending
            ? `Votre formule ${user.plan?.name ?? ""} sera activée par notre équipe après validation. Vous recevrez un email dès que vos crédits seront disponibles.`
            : "Les conversions sont désactivées. Contactez le support pour réactiver votre abonnement."}
        </p>
      </div>
    </div>
  );
}

function HistoryCard({ items, title, loading, onRefresh, footer }: {
  items: Conversion[];
  title: string;
  loading: boolean;
  onRefresh: () => void;
  footer?: { href: string; label: string };
}) {
  return (
    <section className="bento" aria-labelledby="historique-titre">
      <div className="flex items-center justify-between gap-4 p-6 pb-4">
        <h2 id="historique-titre" className="text-lg font-bold">{title}</h2>
        <button type="button" onClick={onRefresh} disabled={loading} className="btn h-10 min-h-10 px-4 text-ink hover:bg-pill">
          <RefreshCw size={15} aria-hidden="true" className={loading ? "animate-spin" : ""} /> Actualiser
        </button>
      </div>

      {items.length === 0 ? (
        <div className="px-6 pb-10 pt-6 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-pill text-muted"><FileText size={22} aria-hidden="true" /></span>
          <p className="mt-4 font-semibold">Aucune conversion pour le moment</p>
          <p className="mt-1 text-sm text-muted">Vos relevés convertis apparaîtront ici.</p>
        </div>
      ) : (
        <ul className="divide-y divide-line px-2 pb-2">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 rounded-2xl px-4 py-3.5 transition-colors hover:bg-mist">
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${item.status === "success" ? "bg-primary-soft text-primary" : "bg-danger/10 text-danger"}`}>
                <FileText size={18} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold" title={item.filename}>{item.filename}</p>
                <p className="mt-0.5 text-xs text-muted tabular">
                  {formatDate(item.created_at, true)} · {item.pages} page(s) · {item.credits_used} crédit(s)
                </p>
              </div>
              <span className={`hidden shrink-0 rounded-full px-3 py-1 text-xs font-semibold sm:inline ${
                item.status === "success" ? "bg-primary-soft text-primary" : "bg-danger/10 text-danger"
              }`}>
                {item.status === "success" ? "Terminé" : "Échec · remboursé"}
              </span>
            </li>
          ))}
        </ul>
      )}

      {footer && (
        <Link href={footer.href} className="flex min-h-12 items-center justify-center gap-2 border-t border-line text-sm font-semibold text-primary hover:bg-mist">
          {footer.label} <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
      )}
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="text-muted">{label}</dt>
      <dd className="min-w-0 truncate text-right font-semibold">{value}</dd>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-4" aria-busy="true" aria-label="Chargement…">
      <div className="col-span-2 h-[372px] animate-pulse rounded-bento bg-white xl:row-span-2" />
      <div className="col-span-2 h-[180px] animate-pulse rounded-bento bg-white" />
      <div className="h-[180px] animate-pulse rounded-bento bg-white" />
      <div className="h-[180px] animate-pulse rounded-bento bg-white" />
    </div>
  );
}

function UploadDialog({ busy, onClose, children }: { busy: boolean; onClose: () => void; children: React.ReactNode }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const state = useRef({ busy, onClose });
  state.current = { busy, onClose };

  // Montage uniquement : focus initial, Échap et blocage du défilement de la page
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !state.current.busy) state.current.onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previous?.focus();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overscroll-contain p-4" role="dialog" aria-modal="true" aria-labelledby="upload-titre">
      <button type="button" tabIndex={-1} aria-hidden="true" onClick={() => !busy && onClose()} className="absolute inset-0 cursor-default bg-ink/40 backdrop-blur-sm" />
      <div className="bento relative w-full max-w-2xl animate-rise p-6 shadow-lift md:p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 id="upload-titre" className="text-2xl font-bold tracking-tight">Nouvelle conversion</h2>
            <p className="mt-1 text-sm text-muted">Importez votre relevé bancaire au format PDF.</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label={busy ? "Conversion en cours, fermeture impossible" : "Fermer"}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full hover:bg-pill disabled:cursor-not-allowed disabled:opacity-30"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
