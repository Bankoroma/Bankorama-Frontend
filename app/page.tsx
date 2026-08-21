import Link from "next/link";
import { ArrowRight, Check, FileSpreadsheet, LockKeyhole, ShieldCheck, Zap } from "lucide-react";
import { MarketingHeader } from "@/components/MarketingHeader";
import { Footer } from "@/components/Footer";

const plans = [
  { name: "Starter", price: "300", old: "250", credits: "30 relevés / an", note: "Engagement 1 an renouvelable", icon: FileSpreadsheet },
  { name: "Standard", price: "600", old: "500", credits: "70 relevés / an", note: "Engagement 1 an renouvelable", popular: true, icon: Zap },
  { name: "Illimité", price: "1 800", old: "1 500", credits: "Relevés illimités", note: "Engagement 1 an renouvelable", icon: Zap },
  { name: "Sans engagement", price: "50", old: "", credits: "1 relevé = 1 crédit", note: "Aucun engagement", icon: FileSpreadsheet, suffix: "/ relevé" },
];

export default function Home() {
  return (
    <>
      <MarketingHeader />
      <main>
        <section className="relative overflow-hidden bg-secondary/60">
          <div className="absolute inset-0 bg-grid opacity-60" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 lg:grid-cols-2 lg:px-8 lg:py-28">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-primary shadow-sm">
                <span className="h-2 w-2 rounded-full bg-primary" /> Conversion bancaire intelligente
              </div>
              <h1 className="mt-6 text-5xl font-extrabold leading-tight tracking-tight text-slate-950 md:text-6xl">
                Vos relevés bancaires.
                <span className="block text-primary">Enfin exploitables.</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                Transformez automatiquement vos relevés bancaires PDF en fichiers Excel
                structurés, prêts à être utilisés dans vos logiciels de comptabilité.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/login" className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3.5 font-semibold text-white shadow-lg shadow-primary/20 hover:bg-teal-700">
                  Commencer maintenant <ArrowRight size={18} />
                </Link>
                <a href="#fonctionnement" className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-semibold text-slate-700 hover:border-primary">
                  Découvrir
                </a>
              </div>
              <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-500">
                <span className="flex items-center gap-2"><Check size={16} className="text-primary" /> Excel structuré</span>
                <span className="flex items-center gap-2"><Check size={16} className="text-primary" /> Jusqu'à 10 Mo</span>
                <span className="flex items-center gap-2"><Check size={16} className="text-primary" /> Gain de temps</span>
              </div>
            </div>

            <div className="rounded-3xl border border-white bg-white p-4 shadow-soft">
              <div className="rounded-2xl bg-secondary/60 p-7">
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary text-white"><FileSpreadsheet /></div>
                  <div>
                    <p className="font-bold text-slate-900">Relevé bancaire.pdf</p>
                    <p className="text-xs text-slate-500">Prêt à être converti</p>
                  </div>
                </div>
                <div className="my-8 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-full w-3/4 rounded-full bg-primary" />
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  {["Date", "Libellé", "Montant"].map((x) => (
                    <div key={x} className="rounded-xl bg-white p-4 shadow-sm">
                      <p className="text-xs text-slate-400">{x}</p>
                      <p className="mt-1 font-bold text-slate-800">Structuré</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-xl bg-primary p-4 text-center font-semibold text-white">
                  ✓ Fichier Excel prêt
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="fonctionnement" className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-bold uppercase tracking-wider text-primary">Comment ça marche ?</p>
            <h2 className="mt-3 text-4xl font-extrabold text-slate-950">Du PDF à Excel en quelques clics</h2>
            <p className="mt-4 text-slate-600">LedgerConvert automatise le travail répétitif pour vous permettre de vous concentrer sur votre comptabilité.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              ["01", "Importez", "Déposez votre relevé bancaire PDF dans votre espace."],
              ["02", "Convertissez", "Notre moteur extrait et structure les transactions."],
              ["03", "Exploitez", "Téléchargez votre Excel et utilisez-le dans votre logiciel comptable."],
            ].map(([n, title, text]) => (
              <div key={n} className="rounded-2xl border border-slate-200 p-7 shadow-sm">
                <span className="text-4xl font-black text-primary/25">{n}</span>
                <h3 className="mt-4 text-xl font-bold">{title}</h3>
                <p className="mt-2 leading-7 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="abonnements" className="bg-secondary/55 px-5 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="text-center">
              <p className="font-bold uppercase tracking-wider text-primary">Abonnements</p>
              <h2 className="mt-3 text-4xl font-extrabold text-slate-950">Choisissez la formule qui vous correspond</h2>
              <p className="mt-4 text-slate-600">Des tarifs simples et transparents, adaptés à votre volume de relevés.</p>
            </div>
            <div className="mt-12 grid gap-5 lg:grid-cols-4">
              {plans.map((plan) => {
                const Icon = plan.icon;
                return (
                  <div key={plan.name} className={`relative rounded-2xl border p-6 shadow-sm ${plan.popular ? "border-primary bg-primary text-white shadow-lg shadow-primary/20" : "border-slate-200 bg-white"}`}>
                    {plan.popular && <div className="absolute -top-5 left-0 right-0 rounded-t-xl bg-tertiary py-1.5 text-center text-xs font-extrabold uppercase text-slate-900">Le plus choisi</div>}
                    <div className={`mx-auto grid h-11 w-11 place-items-center rounded-full ${plan.popular ? "bg-white text-primary" : "bg-primary text-white"}`}><Icon size={20} /></div>
                    <h3 className="mt-4 text-center font-bold">{plan.name}</h3>
                    <div className="mt-4 text-center">
                      <span className="text-2xl font-extrabold">{plan.price} DH TTC</span>
                      {plan.suffix && <span className="text-sm"> {plan.suffix}</span>}
                      {plan.old && <p className={`mt-1 text-xs line-through ${plan.popular ? "text-white/60" : "text-slate-400"}`}>{plan.old} DH HT</p>}
                    </div>
                    <div className={`my-5 border-t ${plan.popular ? "border-white/25" : "border-slate-200"}`} />
                    <p className="text-center text-sm font-semibold">{plan.credits}</p>
                    <p className={`mt-7 text-center text-xs ${plan.popular ? "text-white/75" : "text-slate-500"}`}>{plan.note}</p>
                    <Link href="/login" className={`mt-7 block rounded-xl py-3 text-center text-sm font-bold ${plan.popular ? "bg-white text-primary" : "bg-primary text-white"}`}>
                      Choisir
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="confiance" className="mx-auto max-w-7xl px-5 py-20 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="font-bold uppercase tracking-wider text-primary">Pourquoi nous faire confiance ?</p>
              <h2 className="mt-3 text-4xl font-extrabold text-slate-950">Pensé pour les professionnels</h2>
              <div className="mt-8 space-y-6">
                {[
                  [ShieldCheck, "Sécurité", "Vos documents sont traités dans un environnement conçu pour protéger vos données."],
                  [Zap, "Rapidité", "Réduisez les saisies manuelles et récupérez rapidement un fichier exploitable."],
                  [LockKeyhole, "Confidentialité", "Vos données restent dédiées à votre usage et à votre traitement."],
                ].map(([Icon, title, text]) => {
                  const I = Icon as typeof ShieldCheck;
                  return <div key={title as string} className="flex gap-4"><div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-secondary text-primary"><I size={21}/></div><div><h3 className="font-bold">{title as string}</h3><p className="mt-1 text-sm leading-6 text-slate-600">{text as string}</p></div></div>
                })}
              </div>
            </div>
            <div className="rounded-3xl bg-neutral p-9 text-white">
              <p className="text-sm font-bold uppercase tracking-wider text-tertiary">Ils nous font confiance</p>
              <div className="mt-8 grid grid-cols-2 gap-4">
                {["Cabinets comptables", "TPE & PME", "Entrepreneurs", "Associations"].map((x) => (
                  <div key={x} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <p className="font-semibold">{x}</p>
                    <p className="mt-1 text-xs text-slate-400">Conversion simplifiée</p>
                  </div>
                ))}
              </div>
              <p className="mt-8 text-sm leading-6 text-slate-300">
                Une solution pensée pour toutes les équipes qui manipulent régulièrement des relevés bancaires et veulent éviter les ressaisies.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}