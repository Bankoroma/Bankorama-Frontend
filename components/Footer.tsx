import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="bg-neutral text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <Logo light />
          <p className="mt-5 max-w-md text-sm leading-6 text-slate-300">
            LedgerConvert transforme vos relevés bancaires PDF en fichiers Excel structurés,
            prêts à être exploités dans vos outils de comptabilité.
          </p>
        </div>
        <div>
          <h3 className="font-semibold">Produit</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li><a href="#fonctionnement" className="hover:text-white">Fonctionnement</a></li>
            <li><a href="#abonnements" className="hover:text-white">Abonnements</a></li>
            <li><a href="/login" className="hover:text-white">Connexion</a></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold">Entreprise</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-300">
            <li><a href="#" className="hover:text-white">À propos</a></li>
            <li><a href="#" className="hover:text-white">Confidentialité</a></li>
            <li><a href="#" className="hover:text-white">Contact</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 px-5 py-5 text-xs text-slate-400 md:flex-row lg:px-8">
          <span>© 2026 LedgerConvert. Tous droits réservés.</span>
          <span>Conversion simple · Rapide · Structurée</span>
        </div>
      </div>
    </footer>
  );
}