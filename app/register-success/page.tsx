import Link from "next/link";
import { ArrowRight, Check, Clock3, MailCheck } from "lucide-react";
import { Logo } from "@/components/Logo";

const STEPS = [
  { icon: Check, title: "Compte créé", text: "Votre espace est prêt.", done: true },
  { icon: Clock3, title: "Activation", text: "Notre équipe valide votre abonnement.", done: false },
  { icon: MailCheck, title: "Confirmation", text: "Vous recevez un email avec vos crédits.", done: false },
];

export default function RegisterSuccessPage() {
  return (
    <main id="contenu" className="safe-x grid min-h-dvh place-items-center py-8">
      <div className="w-full max-w-xl space-y-2.5">
        <div className="bento p-8 text-center sm:p-12">
          <Logo />
          <div className="mx-auto mt-10 grid h-16 w-16 animate-rise place-items-center rounded-full bg-primary text-white">
            <Check size={30} strokeWidth={3} aria-hidden="true" />
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tightest sm:text-4xl">Bienvenue à bord</h1>
          <p className="mx-auto mt-3 max-w-sm leading-7 text-muted">
            Vous pouvez vous connecter dès maintenant. Les conversions seront disponibles
            après l’activation de votre abonnement.
          </p>
          <Link href="/login" className="btn-dark mt-8 h-12 w-full text-[15px]">
            Accéder à mon espace <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>

        <ol className="grid gap-2.5 sm:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, text, done }, i) => (
            <li key={title} className="bento p-5">
              <span className={`grid h-9 w-9 place-items-center rounded-full ${done ? "bg-primary text-white" : "bg-pill text-muted"}`}>
                <Icon size={17} aria-hidden="true" />
              </span>
              <p className="mt-4 text-sm font-semibold"><span className="sr-only">Étape {i + 1} : </span>{title}</p>
              <p className="mt-1 text-xs leading-5 text-muted">{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}
