"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Building2, Lock, Mail } from "lucide-react";
import { Logo } from "@/components/Logo";
import { register } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [raisonSociale, setRaisonSociale] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      setLoading(false);
      return;
    }

    try {
      await register({
        raison_sociale: raisonSociale,
        email,
        password,
        confirm_password: confirmPassword,
      });

      router.push("/register-success");
    } catch (error: any) {
    const message =
    error.response?.data?.detail ||
    "Impossible de créer le compte. Veuillez réessayer.";

    setError(message);
} finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-secondary/60">
      <div className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-5 py-10">

        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-soft lg:grid-cols-2">

          <div className="hidden bg-primary p-12 text-white lg:block">
            <Logo light />

            <div className="mt-24">
              <p className="text-sm font-bold uppercase tracking-wider text-white/70">
                LedgerConvert
              </p>

              <h1 className="mt-4 text-4xl font-extrabold leading-tight">
                Transformez vos relevés bancaires en fichiers Excel structurés.
              </h1>

              <p className="mt-5 leading-7 text-white/80">
                Créez votre compte et commencez à convertir vos relevés
                bancaires rapidement et simplement.
              </p>
            </div>
          </div>

          <div className="p-7 sm:p-12">

            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary"
            >
              <ArrowLeft size={16} />
              Retour
            </Link>

            <div className="mt-8">

              <Logo />

              <h2 className="mt-6 text-3xl font-extrabold text-slate-950">
                Créer un compte
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Créez votre espace LedgerConvert.
              </p>

              <form onSubmit={submit} className="mt-7 space-y-4">

                <label className="block">
                  <span className="text-sm font-semibold">
                    Raison sociale
                  </span>

                  <div className="mt-2 flex items-center rounded-xl border border-slate-300 px-3 focus-within:border-primary">
                    <Building2 size={18} className="text-slate-400" />

                    <input
                      required
                      type="text"
                      value={raisonSociale}
                      onChange={(e) => setRaisonSociale(e.target.value)}
                      className="w-full border-0 bg-transparent px-3 py-3 outline-none"
                      placeholder="Votre entreprise"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="text-sm font-semibold">
                    Email
                  </span>

                  <div className="mt-2 flex items-center rounded-xl border border-slate-300 px-3 focus-within:border-primary">
                    <Mail size={18} className="text-slate-400" />

                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full border-0 bg-transparent px-3 py-3 outline-none"
                      placeholder="vous@entreprise.com"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="text-sm font-semibold">
                    Mot de passe
                  </span>

                  <div className="mt-2 flex items-center rounded-xl border border-slate-300 px-3 focus-within:border-primary">
                    <Lock size={18} className="text-slate-400" />

                    <input
                      required
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full border-0 bg-transparent px-3 py-3 outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="text-sm font-semibold">
                    Confirmer le mot de passe
                  </span>

                  <div className="mt-2 flex items-center rounded-xl border border-slate-300 px-3 focus-within:border-primary">
                    <Lock size={18} className="text-slate-400" />

                    <input
                      required
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full border-0 bg-transparent px-3 py-3 outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                </label>

                <div className="rounded-xl bg-slate-50 p-4 text-xs leading-6">
                    <p className="font-semibold text-slate-700">
                        Le mot de passe doit contenir :
                    </p>

                    <p className={password.length >= 8 ? "text-emerald-600" : "text-slate-500"}>
                        {password.length >= 8 ? "✓" : "✗"} Au moins 8 caractères
                    </p>

                    <p className={/[A-Z]/.test(password) ? "text-emerald-600" : "text-slate-500"}>
                        {/[A-Z]/.test(password) ? "✓" : "✗"} Une lettre majuscule
                    </p>

                    <p className={/[a-z]/.test(password) ? "text-emerald-600" : "text-slate-500"}>
                        {/[a-z]/.test(password) ? "✓" : "✗"} Une lettre minuscule
                    </p>

                    <p className={/[0-9]/.test(password) ? "text-emerald-600" : "text-slate-500"}>
                        {/[0-9]/.test(password) ? "✓" : "✗"} Un chiffre
                    </p>

                    <p className={/[^A-Za-z0-9]/.test(password) ? "text-emerald-600" : "text-slate-500"}>
                        {/[^A-Za-z0-9]/.test(password) ? "✓" : "✗"} Un caractère spécial (!, @, #, ...)
                    </p>
                </div>

                {error && (
                  <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
                    {error}
                  </p>
                )}

                <button
                  disabled={loading}
                  className="w-full rounded-xl bg-primary py-3.5 font-bold text-white hover:bg-teal-700 disabled:opacity-60"
                >
                  {loading ? "Création..." : "Créer mon compte"}
                </button>

              </form>

              <p className="mt-6 text-center text-sm text-slate-500">
                Vous avez déjà un compte ?{" "}
                <Link
                  href="/login"
                  className="font-bold text-primary hover:underline"
                >
                  Se connecter
                </Link>
              </p>

            </div>
          </div>

        </div>
      </div>
    </main>
  );
}