"use client";

import { FormEvent, Suspense, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, Check, Eye, EyeOff, Loader2, Lock, Mail, X } from "lucide-react";
import { AuthShell, FormError } from "@/components/AuthShell";
import { PlanSelector } from "@/components/Plans";
import { apiErrorMessage, register } from "@/lib/api";

const RULES: [string, (p: string) => boolean][] = [
  ["8 caractères minimum", (p) => p.length >= 8],
  ["Une majuscule", (p) => /[A-Z]/.test(p)],
  ["Une minuscule", (p) => /[a-z]/.test(p)],
  ["Un chiffre", (p) => /[0-9]/.test(p)],
  ["Un caractère spécial", (p) => /[^A-Za-z0-9]/.test(p)],
];

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [planCode, setPlanCode] = useState(searchParams.get("plan") || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const confirmRef = useRef<HTMLInputElement>(null);

  const passwordOk = RULES.every(([, test]) => test(password));

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const confirm = String(form.get("confirm_password"));
    setError("");

    if (!planCode) {
      setError("Choisissez une formule d’abonnement pour continuer.");
      return;
    }
    if (!passwordOk) {
      setError("Le mot de passe ne respecte pas encore toutes les règles ci-dessus.");
      return;
    }
    if (password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas. Saisissez-les à nouveau.");
      confirmRef.current?.focus();
      return;
    }

    setLoading(true);
    try {
      await register({
        raison_sociale: String(form.get("raison_sociale")),
        email: String(form.get("email")),
        password,
        confirm_password: confirm,
        plan_code: planCode,
      });
      router.push("/register-success");
    } catch (error) {
      setError(await apiErrorMessage(error, "Impossible de créer le compte. Réessayez dans un instant."));
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Créer un compte"
      subtitle="Choisissez votre formule et ouvrez votre espace en une minute."
      aside={{
        title: "Commencez maintenant, convertissez dès l’activation.",
        text: "Votre espace est accessible immédiatement. Notre équipe active ensuite votre abonnement et vos crédits mensuels.",
      }}
    >
      <form onSubmit={submit} className="mt-8 space-y-6">
        <div>
          <p className="text-sm font-semibold" aria-hidden="true">Formule</p>
          <div className="mt-2">
            <PlanSelector value={planCode} onChange={setPlanCode} />
          </div>
        </div>

        <div>
          <label htmlFor="raison_sociale" className="text-sm font-semibold">Raison sociale</label>
          <div className="field">
            <Building2 size={18} aria-hidden="true" className="shrink-0 text-subtle" />
            <input id="raison_sociale" name="raison_sociale" required minLength={2} maxLength={255} autoComplete="organization" placeholder="Ex. Atlas Conseil SARL…" />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="text-sm font-semibold">Email professionnel</label>
          <div className="field">
            <Mail size={18} aria-hidden="true" className="shrink-0 text-subtle" />
            <input id="email" name="email" type="email" required autoComplete="email" inputMode="email" spellCheck={false} placeholder="vous@entreprise.ma…" />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="text-sm font-semibold">Mot de passe</label>
          <div className="field">
            <Lock size={18} aria-hidden="true" className="shrink-0 text-subtle" />
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-describedby="password-rules"
              placeholder="Choisissez un mot de passe…"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              className="-mr-2 grid h-10 w-10 shrink-0 place-items-center rounded-full text-subtle hover:bg-pill hover:text-ink"
            >
              {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
            </button>
          </div>
          <ul id="password-rules" className="mt-3 flex flex-wrap gap-1.5">
            {RULES.map(([label, test]) => {
              const ok = test(password);
              return (
                <li key={label} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${ok ? "bg-primary-soft text-primary" : "bg-pill text-muted"}`}>
                  {ok ? <Check size={12} strokeWidth={3} aria-hidden="true" /> : <X size={12} aria-hidden="true" />}
                  <span>{label}</span>
                  <span className="sr-only">{ok ? " : respecté" : " : manquant"}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <label htmlFor="confirm_password" className="text-sm font-semibold">Confirmer le mot de passe</label>
          <div className="field">
            <Lock size={18} aria-hidden="true" className="shrink-0 text-subtle" />
            <input ref={confirmRef} id="confirm_password" name="confirm_password" type={showPassword ? "text" : "password"} required autoComplete="new-password" placeholder="Saisissez-le à nouveau…" />
          </div>
        </div>

        <FormError message={error} />

        <button type="submit" disabled={loading} className="btn-dark h-12 w-full text-[15px]">
          {loading ? <><Loader2 size={18} className="animate-spin" aria-hidden="true" /> Création du compte…</> : "Créer mon compte"}
        </button>

        <p className="text-center text-xs leading-5 text-muted">
          Les conversions sont disponibles dès l’activation de votre abonnement par notre équipe.
        </p>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        Déjà inscrit ?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">Se connecter</Link>
      </p>
    </AuthShell>
  );
}
