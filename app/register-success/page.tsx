import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function RegisterSuccessPage() {
  return (
    <main className="min-h-screen bg-secondary/60">
      <div className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-5 py-10">
        <div className="w-full max-w-xl rounded-3xl bg-white p-10 text-center shadow-soft">

          <Logo />

          <div className="mx-auto mt-8 grid h-20 w-20 place-items-center rounded-full bg-emerald-50">
            <CheckCircle2 size={42} className="text-primary" />
          </div>

          <h1 className="mt-6 text-3xl font-extrabold text-slate-950">
            Compte créé avec succès
          </h1>

          <p className="mt-4 leading-7 text-slate-600">
            Votre compte a bien été créé.
            <br />
            Avant de pouvoir vous connecter, vous devez vérifier votre adresse email.
            <br />
            Consultez votre boîte mail et cliquez sur le lien de vérification envoyé.
          </p>

          <Link
            href="/login"
            className="mt-8 inline-block w-full rounded-xl bg-primary px-6 py-3.5 font-bold text-white transition hover:bg-teal-700"
          >
            J’ai vérifié mon email
          </Link>

        </div>
      </div>
    </main>
  );
}