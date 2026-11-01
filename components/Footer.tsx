import Link from "next/link";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="safe-x pb-8">
      <div className="bento-dark mx-auto max-w-6xl px-7 py-10 md:px-10">
        <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr]">
          <div>
            <Logo light />
            <p className="mt-5 max-w-sm text-sm leading-6 text-white/65">
              Vos relevés bancaires PDF transformés en fichiers Excel structurés,
              prêts pour votre logiciel comptable.
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold">Produit</h2>
            <ul className="mt-4 space-y-3 text-sm text-white/65">
              <li><a href="#fonctionnement" className="hover:text-white">Fonctionnement</a></li>
              <li><a href="#tarifs" className="hover:text-white">Tarifs</a></li>
              <li><a href="#securite" className="hover:text-white">Sécurité</a></li>
            </ul>
          </div>
          <div>
            <h2 className="text-sm font-semibold">Espace client</h2>
            <ul className="mt-4 space-y-3 text-sm text-white/65">
              <li><Link href="/login" className="hover:text-white">Connexion</Link></li>
              <li><Link href="/register" className="hover:text-white">Créer un compte</Link></li>
              <li><Link href="/dashboard" className="hover:text-white">Tableau de bord</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col justify-between gap-2 border-t border-white/10 pt-6 text-xs text-white/45 sm:flex-row">
          <span>© {new Date().getFullYear()} <span translate="no">LedgerConvert</span>. Tous droits réservés.</span>
          <span>Paiement en dirhams · Prix TTC</span>
        </div>
      </div>
    </footer>
  );
}
