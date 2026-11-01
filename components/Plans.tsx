"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { formatPrice, getPlans, type Plan } from "@/lib/api";

// Formule mise en avant
const POPULAR = "standard";

const PERKS: Record<string, string[]> = {
  starter: ["Idéal pour une TPE", "Export Excel avec totaux", "Historique des conversions"],
  standard: ["Pour les PME actives", "Export Excel avec totaux", "Historique des conversions"],
  ultime: ["Cabinets & gros volumes", "Export Excel avec totaux", "Historique des conversions"],
};

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
    return <p role="alert" className="rounded-2xl bg-danger/5 p-3 text-sm text-danger">Impossible de charger les formules. Rechargez la page.</p>;
  }

  if (loading) {
    return (
      <div className="grid gap-2 sm:grid-cols-3" aria-busy="true" aria-label="Chargement des formules…">
        {[0, 1, 2].map((i) => <div key={i} className="h-[104px] animate-pulse rounded-2xl bg-pill" />)}
      </div>
    );
  }

  return (
    <fieldset>
      <legend className="sr-only">Formule d’abonnement</legend>
      <div className="grid gap-2 sm:grid-cols-3">
        {plans.map((plan) => {
          const selected = plan.code === value;
          return (
            <label
              key={plan.code}
              className={`relative cursor-pointer rounded-2xl border p-3.5 transition-[border-color,background-color,box-shadow] duration-200 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-primary ${
                selected ? "border-primary bg-primary-soft shadow-[inset_0_0_0_1px_#0F766E]" : "border-line bg-white hover:border-subtle"
              }`}
            >
              <input
                type="radio"
                name="plan"
                value={plan.code}
                checked={selected}
                onChange={() => onChange(plan.code)}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className={`absolute right-3 top-3 grid h-5 w-5 place-items-center rounded-full border transition-colors ${
                  selected ? "border-primary bg-primary text-white" : "border-line bg-white"
                }`}
              >
                {selected && <Check size={12} strokeWidth={3} />}
              </span>
              <span className="block text-sm font-semibold">{plan.name}</span>
              <span className="mt-2 block font-display text-xl font-bold tracking-tight tabular">
                {formatPrice(plan.price_ttc)}<span className="text-xs font-semibold text-muted">&nbsp;DH&nbsp;TTC</span>
              </span>
              <span className="mt-0.5 block text-xs text-muted tabular">{plan.monthly_credits} crédits / mois</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function PlansGrid() {
  const { plans, error, loading } = usePlans();

  if (error) {
    return <p className="bento mt-10 p-8 text-center text-muted">Les formules sont momentanément indisponibles. Réessayez dans quelques instants.</p>;
  }

  if (loading) {
    return (
      <div className="mt-10 grid gap-2.5 lg:grid-cols-3" aria-busy="true" aria-label="Chargement des formules…">
        {[0, 1, 2].map((i) => <div key={i} className="h-[420px] animate-pulse rounded-bento bg-white" />)}
      </div>
    );
  }

  return (
    <div className="mt-10 grid gap-2.5 lg:grid-cols-3">
      {plans.map((plan) => {
        const popular = plan.code === POPULAR;
        const pricePerCredit = Number(plan.price_ttc) / plan.monthly_credits;
        return (
          <div key={plan.code} className={`${popular ? "bento-dark" : "bento"} flex flex-col p-7`}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">{plan.name}</h3>
              {popular && <span className="rounded-full bg-mint/15 px-3 py-1 text-xs font-semibold text-mint">Le plus choisi</span>}
            </div>

            <p className="mt-8 flex items-baseline gap-1.5">
              <span className="num text-6xl">{formatPrice(plan.price_ttc)}</span>
              <span className={`text-sm font-semibold ${popular ? "text-white/60" : "text-muted"}`}>DH&nbsp;TTC / mois</span>
            </p>

            <div className={`mt-6 rounded-2xl p-4 ${popular ? "bg-white/[0.07]" : "bg-mist"}`}>
              <p className="num text-3xl">{plan.monthly_credits}</p>
              <p className={`mt-1 text-sm ${popular ? "text-white/65" : "text-muted"}`}>
                crédits par mois · soit {formatPrice(pricePerCredit)}&nbsp;DH la page
              </p>
            </div>

            <ul className={`mt-6 flex-1 space-y-3 text-sm ${popular ? "text-white/80" : "text-ink"}`}>
              {(PERKS[plan.code] ?? []).map((perk) => (
                <li key={perk} className="flex items-center gap-2.5">
                  <Check size={16} aria-hidden="true" className={popular ? "text-mint" : "text-primary"} /> {perk}
                </li>
              ))}
            </ul>

            <Link
              href={`/register?plan=${plan.code}`}
              className={`${popular ? "btn-light" : "btn-dark"} mt-8 h-12 w-full`}
              aria-label={`Choisir la formule ${plan.name}`}
            >
              Choisir {plan.name} <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        );
      })}
    </div>
  );
}
