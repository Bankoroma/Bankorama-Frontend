import Link from "next/link";
import {
  ArrowRight, ArrowUpRight, Brain, Check, Clock3, Download, FileUp, Fingerprint,
  LockKeyhole, ShieldCheck, Sparkles, Trash2, UserCheck,
} from "lucide-react";
import { MarketingHeader } from "@/components/MarketingHeader";
import { Footer } from "@/components/Footer";
import { PlansGrid } from "@/components/Plans";
import { ConversionDemo } from "@/components/ConversionDemo";

const STEPS = [
  { n: "01", icon: FileUp, title: "Importez", text: "Déposez le relevé PDF de n’importe quelle banque, jusqu’à 10 Mo." },
  { n: "02", icon: Brain, title: "Extraction", text: "L’IA lit chaque ligne : date de valeur, type, libellé, débit et crédit." },
  { n: "03", icon: Download, title: "Exploitez", text: "Téléchargez un Excel propre, avec totaux, prêt pour votre logiciel comptable." },
];

const SECURITY = [
  { icon: Trash2, title: "Fichiers éphémères", text: "Le PDF et l’Excel sont supprimés du serveur dès le téléchargement." },
  { icon: UserCheck, title: "Comptes validés", text: "Chaque abonnement est activé manuellement par notre équipe." },
  { icon: LockKeyhole, title: "Accès protégé", text: "Mots de passe hachés avec bcrypt, sessions signées et limitées dans le temps." },
  { icon: Fingerprint, title: "Anti-intrusion", text: "Tentatives de connexion limitées pour bloquer les attaques par force brute." },
];

export default function Home() {
  return (
    <>
      <MarketingHeader />
      <main id="contenu">
        {/* ---------- HERO ---------- */}
        <section className="safe-x pt-8 md:pt-12">
          <div className="mx-auto grid max-w-6xl gap-2.5 lg:grid-cols-12">
            <div className="bento flex animate-rise flex-col justify-between p-8 md:p-12 lg:col-span-7">
              <div>
                <span className="pill"><Sparkles size={13} aria-hidden="true" className="text-primary" /> Conversion par IA</span>
                <h1 className="mt-6 text-[2.6rem] font-bold leading-[1.05] tracking-tightest sm:text-6xl">
                  Vos relevés bancaires,
                  <span className="block text-primary">enfin exploitables.</span>
                </h1>
                <p className="mt-6 max-w-lg text-lg leading-8 text-muted">
                  Transformez vos relevés PDF en fichiers Excel structurés en quelques secondes,
                  sans aucune ressaisie.
                </p>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Link href="/register" className="btn-dark h-12 px-6 text-[15px]">
                  Commencer <ArrowRight size={17} aria-hidden="true" />
                </Link>
                <a href="#tarifs" className="btn h-12 px-6 text-[15px] text-ink hover:bg-black/5">Voir les tarifs</a>
              </div>
            </div>

            {/* Démo animée PDF -> Excel */}
            <div className="bento-dark animate-rise p-6 [animation-delay:80ms] md:p-8 lg:col-span-5">
              <ConversionDemo />
            </div>

            {/* Rangée de chiffres */}
            {[
              ["1", "page = 1 crédit", "Vous ne payez que ce que vous convertissez."],
              ["10 Mo", "par relevé", "Les relevés multi-pages passent sans souci."],
              ["5", "colonnes normalisées", "Date, type, libellé, débit, crédit."],
            ].map(([value, label, note], i) => (
              <div key={label} className="bento animate-rise p-6 lg:col-span-4" style={{ animationDelay: `${160 + i * 60}ms` }}>
                <p className="num text-5xl text-ink">{value}</p>
                <p className="mt-2 font-semibold">{label}</p>
                <p className="mt-1 text-sm text-muted">{note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- FONCTIONNEMENT ---------- */}
        <section id="fonctionnement" className="safe-x pt-24">
          <div className="mx-auto max-w-6xl">
            <p className="eyebrow">Fonctionnement</p>
            <h2 className="mt-3 max-w-2xl text-4xl font-bold tracking-tightest md:text-5xl">Du PDF à Excel en trois étapes.</h2>

            <div className="mt-10 grid gap-2.5 md:grid-cols-3">
              {STEPS.map(({ n, icon: Icon, title, text }) => (
                <div key={n} className="bento flex flex-col p-7">
                  <div className="flex items-center justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary"><Icon size={22} aria-hidden="true" /></span>
                    <span className="num text-3xl text-line" aria-hidden="true">{n}</span>
                  </div>
                  <h3 className="mt-8 text-xl font-bold">{title}</h3>
                  <p className="mt-2 leading-7 text-muted">{text}</p>
                </div>
              ))}

              <div className="bento-dark flex flex-col justify-between gap-6 p-8 md:col-span-2">
                <p className="font-display text-2xl font-semibold leading-snug tracking-tight md:text-3xl">
                  « Fini la <em className="not-italic text-mint">ressaisie</em>. Place à l’<em className="not-italic text-mint">analyse</em>. »
                </p>
                <p className="text-sm text-white/60">Pensé pour les cabinets comptables, les TPE & PME et les directions financières.</p>
              </div>

              <div className="bento p-7" style={{ background: "linear-gradient(145deg, #0F766E 0%, #12806f 55%, #1D9486 100%)" }}>
                <Clock3 size={22} aria-hidden="true" className="text-white/85" />
                <p className="num mt-6 text-5xl text-white">Secondes</p>
                <p className="mt-2 font-semibold text-white/90">au lieu d’heures de saisie manuelle</p>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- TARIFS ---------- */}
        <section id="tarifs" className="safe-x pt-24">
          <div className="mx-auto max-w-6xl">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <p className="eyebrow">Tarifs</p>
                <h2 className="mt-3 text-4xl font-bold tracking-tightest md:text-5xl">Une formule pour chaque volume.</h2>
              </div>
              <p className="max-w-sm text-muted">Prix TTC en dirhams. Vos crédits sont rechargés automatiquement chaque mois.</p>
            </div>
            <PlansGrid />
          </div>
        </section>

        {/* ---------- SÉCURITÉ ---------- */}
        <section id="securite" className="safe-x pt-24">
          <div className="mx-auto max-w-6xl">
            <p className="eyebrow">Sécurité</p>
            <h2 className="mt-3 max-w-2xl text-4xl font-bold tracking-tightest md:text-5xl">Vos données financières restent les vôtres.</h2>

            <div className="mt-10 grid gap-2.5 md:grid-cols-2">
              <div className="bento-dark flex flex-col justify-between p-8 md:row-span-2">
                <ShieldCheck size={28} aria-hidden="true" className="text-mint" />
                <div className="mt-16">
                  <h3 className="text-3xl font-bold tracking-tight">Isolation au niveau de la base de données.</h3>
                  <p className="mt-4 leading-7 text-white/70">
                    Chaque compte n’accède qu’à ses propres données, contrôlé directement par PostgreSQL
                    (Row Level Security), et pas seulement par l’application.
                  </p>
                </div>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2 md:row-span-2">
                {SECURITY.map(({ icon: Icon, title, text }) => (
                  <div key={title} className="bento p-6">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-pill text-ink"><Icon size={20} aria-hidden="true" /></span>
                    <h3 className="mt-5 font-bold">{title}</h3>
                    <p className="mt-1 text-sm leading-6 text-muted">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ---------- CTA ---------- */}
        <section className="safe-x py-24">
          <div className="bento mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 p-8 md:flex-row md:items-center md:p-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tightest md:text-4xl">Prêt à gagner du temps ?</h2>
              <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
                {["Accès immédiat à votre espace", "Activation rapide", "Crédits rechargés chaque mois"].map((x) => (
                  <li key={x} className="flex items-center gap-2"><Check size={16} aria-hidden="true" className="text-primary" /> {x}</li>
                ))}
              </ul>
            </div>
            <Link href="/register" className="btn-primary h-12 shrink-0 px-6 text-[15px]">
              Créer mon compte <ArrowUpRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
