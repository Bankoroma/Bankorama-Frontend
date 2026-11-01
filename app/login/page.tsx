"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { AuthShell, FormError } from "@/components/AuthShell";
import { apiErrorMessage, login } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setLoading(true);
    setError("");
    try {
      const data = await login({
        email: String(form.get("email")),
        password: String(form.get("password")),
      });
      localStorage.setItem("ledger_token", data.access_token);
      localStorage.removeItem("ledger_user");
      router.push("/dashboard");
    } catch (error) {
      setError(await apiErrorMessage(error, "Identifiants incorrects. Vérifiez votre email et votre mot de passe."));
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Connexion"
      subtitle="Accédez à votre espace de conversion."
      aside={{
        title: "Vos relevés, prêts pour la comptabilité.",
        text: "Importez un PDF, récupérez un Excel structuré et suivez vos crédits depuis votre tableau de bord.",
      }}
    >
      <form onSubmit={submit} className="mt-8 space-y-5">
        <div>
          <label htmlFor="email" className="text-sm font-semibold">Email</label>
          <div className="field">
            <Mail size={18} aria-hidden="true" className="shrink-0 text-subtle" />
            <input id="email" name="email" type="email" required autoComplete="email" inputMode="email" spellCheck={false} placeholder="vous@entreprise.ma…" />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-semibold">Mot de passe</label>
          </div>
          <div className="field">
            <Lock size={18} aria-hidden="true" className="shrink-0 text-subtle" />
            <input id="password" name="password" type={showPassword ? "text" : "password"} required autoComplete="current-password" placeholder="Votre mot de passe…" />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              className="-mr-2 grid h-10 w-10 shrink-0 place-items-center rounded-full text-subtle hover:bg-pill hover:text-ink"
            >
              {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
            </button>
          </div>
        </div>

        <FormError message={error} />

        <button type="submit" disabled={loading} className="btn-dark h-12 w-full text-[15px]">
          {loading ? <><Loader2 size={18} className="animate-spin" aria-hidden="true" /> Connexion…</> : "Se connecter"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        Pas encore de compte ?{" "}
        <Link href="/register" className="font-semibold text-primary hover:underline">Créer un compte</Link>
      </p>
    </AuthShell>
  );
}
