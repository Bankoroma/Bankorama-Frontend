"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, Mail } from "lucide-react";
import { Logo } from "@/components/Logo";
import { login } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await login({ email, password });
      localStorage.setItem("ledger_token", data.access_token);
      localStorage.setItem("ledger_user", JSON.stringify(data.user || { name: "Admin", email }));
      router.push("/dashboard");
    } catch {
      setError("Identifiants incorrects ou API indisponible.");
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
              <p className="text-sm font-bold uppercase tracking-wider text-white/70">LedgerConvert</p>
              <h1 className="mt-4 text-4xl font-extrabold leading-tight">Vos relevés bancaires, prêts pour votre comptabilité.</h1>
              <p className="mt-5 leading-7 text-white/80">Importez un PDF, récupérez un Excel structuré et gardez le contrôle depuis votre tableau de bord.</p>
            </div>
          </div>
          <div className="p-7 sm:p-12">
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-primary"><ArrowLeft size={16}/> Retour</Link>
            <div className="mt-12">
              <Logo />
              <h2 className="mt-8 text-3xl font-extrabold text-slate-950">Connexion</h2>
              <p className="mt-2 text-sm text-slate-500">Accédez à votre espace LedgerConvert.</p>
              <form onSubmit={submit} className="mt-8 space-y-5">
                <label className="block">
                  <span className="text-sm font-semibold">Email</span>
                  <div className="mt-2 flex items-center rounded-xl border border-slate-300 px-3 focus-within:border-primary">
                    <Mail size={18} className="text-slate-400"/>
                    <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full border-0 bg-transparent px-3 py-3 outline-none" placeholder="vous@entreprise.com"/>
                  </div>
                </label>
                <label className="block">
                  <span className="text-sm font-semibold">Mot de passe</span>
                  <div className="mt-2 flex items-center rounded-xl border border-slate-300 px-3 focus-within:border-primary">
                    <Lock size={18} className="text-slate-400"/>
                    <input required type="password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full border-0 bg-transparent px-3 py-3 outline-none" placeholder="••••••••"/>
                  </div>
                </label>
                {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}
                <button disabled={loading} className="w-full rounded-xl bg-primary py-3.5 font-bold text-white hover:bg-teal-700 disabled:opacity-60">
                  {loading ? "Connexion..." : "Se connecter"}
                </button>
              </form>
              <p className="mt-6 text-center text-xs text-slate-400">Le bouton de connexion est prêt à être relié à votre API via Axios.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}