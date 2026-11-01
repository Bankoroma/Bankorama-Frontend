"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Crown, FileSpreadsheet, Zap } from "lucide-react";
import { formatPrice, getPlans, type Plan } from "@/lib/api";

const ICONS: Record<string, typeof Zap> = {
  starter: FileSpreadsheet,
  standard: Zap,
  ultime: Crown,
};

// Formule mise en avant sur la page d'accueil
const POPULAR = "standard";

export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    getPlans().then(setPlans).catch(() => setError(true));
  }, []);

  return { plans, error, loading: !error && plans.length === 0 };
}

export function PlanSelector({ value, onChange }: { value: string; onChange: (code: string) => void }) {
  const { plans, error, loading } = usePlans();

  useEffect(() => {
    if (plans.length && !plans.some((p) => p.code === value)) {
      onChange(plans.find((p) => p.code === POPULAR)?.code ?? plans[0].code);
    }
  }, [plans, value, onChange]);

  if (error) {
    return <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">Impossible de charger les formules.</p>;
  }

  if (loading) {
    return (
      <div className="grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-100" />)}
      </div>
    );
  }

  return (
    <div role="radiogroup" aria-label="Formule d'abonnement" className="grid gap-3 sm:grid-cols-3">
      {plans.map((plan) => {
        const selected = plan.code === value;
        return (
          <button
            key={plan.code}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(plan.code)}
            className={`relative rounded-xl border-2 p-3 text-left transition ${
              selected ? "border-primary bg-primary/5" : "border-slate-200 hover:border-primary/50"
            }`}
          >
            {selected && (
              <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-primary text-white">
                <Check size={13} />
              </span>
            )}
            <p className="text-sm font-bold text-slate-900">{plan.name}</p>
            <p className="mt-1 text-lg font-extrabold text-primary">
              {formatPrice(plan.price_ttc)} <span className="text-xs font-semibold">DH TTC</span>
            </p>
            <p className="mt-1 text-xs text-slate-500">{plan.monthly_credits} crédits / mois</p>
          </button>
        );
      })}
    </div>
  );
}

export function PlansGrid() {
  const { plans, error, loading } = usePlans();

  if (error) {
    return <p className="mt-12 text-center text-sm text-slate-500">Les formules sont momentanément indisponibles.</p>;
  }

  if (loading) {
    return (
      <div className="mt-12 grid gap-5 lg:grid-cols-3">
        {[0, 1, 2].map((i) => <div key={i} className="h-80 animate-pulse rounded-2xl bg-white" />)}
      </div>
    );
  }

  return (
    <div className="mx-auto mt-12 grid max-w-5xl gap-5 lg:grid-cols-3">
      {plans.map((plan) => {
        const Icon = ICONS[plan.code] || FileSpreadsheet;
        const popular = plan.code === POPULAR;
        return (
          <div key={plan.code} className={`relative rounded-2xl border p-6 shadow-sm ${popular ? "border-primary bg-primary text-white shadow-lg shadow-primary/20" : "border-slate-200 bg-white"}`}>
            {popular && <div className="absolute -top-5 left-0 right-0 rounded-t-xl bg-tertiary py-1.5 text-center text-xs font-extrabold uppercase text-slate-900">Le plus choisi</div>}
            <div className={`mx-auto grid h-11 w-11 place-items-center rounded-full ${popular ? "bg-white text-primary" : "bg-primary text-white"}`}><Icon size={20} /></div>
            <h3 className="mt-4 text-center font-bold">{plan.name}</h3>
            <div className="mt-4 text-center">
              <span className="text-2xl font-extrabold">{formatPrice(plan.price_ttc)} DH TTC</span>
            </div>
            <div className={`my-5 border-t ${popular ? "border-white/25" : "border-slate-200"}`} />
            <p className="text-center text-sm font-semibold">{plan.monthly_credits} crédits / mois</p>
            <p className={`mt-2 text-center text-xs ${popular ? "text-white/75" : "text-slate-500"}`}>1 crédit = 1 page de relevé</p>
            <Link href={`/register?plan=${plan.code}`} className={`mt-7 block rounded-xl py-3 text-center text-sm font-bold ${popular ? "bg-white text-primary" : "bg-primary text-white"}`}>
              Choisir
            </Link>
          </div>
        );
      })}
    </div>
  );
}
