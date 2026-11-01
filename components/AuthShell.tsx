import Link from "next/link";
import { ArrowLeft, FileSpreadsheet, ShieldCheck, Zap } from "lucide-react";
import { ConversionDemo } from "./ConversionDemo";
import { Logo } from "./Logo";

export function AuthShell({
  title,
  subtitle,
  aside,
  children,
}: {
  title: string;
  subtitle: string;
  aside: { title: string; text: string };
  children: React.ReactNode;
}) {
  return (
    <main id="contenu" className="safe-x min-h-dvh py-5">
      <div className="mx-auto grid min-h-[calc(100dvh-2.5rem)] max-w-6xl gap-2.5 lg:grid-cols-[5fr_6fr]">
        {/* Panneau bento sombre (masqué sur mobile) */}
        <aside className="hidden grid-rows-[1fr_auto] gap-2.5 lg:grid">
          <div className="bento-dark flex flex-col justify-between gap-8 p-10">
            <Link href="/" aria-label="Accueil LedgerConvert" className="w-fit rounded-xl"><Logo light /></Link>
            <ConversionDemo className="mx-auto w-full max-w-md" />
            <div>
              <h2 className="text-4xl font-bold leading-tight tracking-tightest">{aside.title}</h2>
              <p className="mt-4 max-w-sm leading-7 text-white/65">{aside.text}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              [FileSpreadsheet, "Excel", "structuré"],
              [Zap, "IA", "rapide"],
              [ShieldCheck, "RLS", "isolation"],
            ].map(([Icon, value, label]) => {
              const I = Icon as typeof Zap;
              return (
                <div key={value as string} className="bento p-5">
                  <I size={18} aria-hidden="true" className="text-primary" />
                  <p className="num mt-4 text-2xl">{value as string}</p>
                  <p className="mt-1 text-xs text-muted">{label as string}</p>
                </div>
              );
            })}
          </div>
        </aside>

        <section className="bento flex flex-col p-6 sm:p-10 lg:p-14">
          <div className="flex items-center justify-between">
            <Link href="/" className="inline-flex min-h-11 items-center gap-2 rounded-full pr-3 text-sm font-semibold text-muted transition-colors hover:text-ink">
              <ArrowLeft size={16} aria-hidden="true" /> Accueil
            </Link>
            <span className="lg:hidden"><Logo compact /></span>
          </div>
          <div className="mx-auto my-auto w-full max-w-md py-10">
            <h1 className="text-3xl font-bold tracking-tightest sm:text-4xl">{title}</h1>
            <p className="mt-2 text-muted">{subtitle}</p>
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}

export function FormError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-2xl bg-danger/5 px-4 py-3 text-sm font-medium text-danger">
      {message}
    </p>
  );
}
