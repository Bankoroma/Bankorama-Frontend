export const BRAND = { first: "Ledger", second: "Convert" };

export function Logo({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  return (
    <span translate="no" className={`inline-flex items-center gap-2.5 font-display font-bold tracking-tight ${light ? "text-white" : "text-ink"}`}>
      <span aria-hidden="true" className={`grid h-9 w-9 place-items-center rounded-[11px] ${light ? "bg-white text-ink" : "bg-ink text-white"}`}>
        {/* Feuille de calcul stylisée : grille 2×2 dont une cellule en couleur de marque */}
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <rect x="1" y="1" width="7" height="7" rx="2" fill="currentColor" />
          <rect x="10" y="1" width="7" height="7" rx="2" fill="#34d399" />
          <rect x="1" y="10" width="7" height="7" rx="2" fill="currentColor" opacity="0.55" />
          <rect x="10" y="10" width="7" height="7" rx="2" fill="currentColor" />
        </svg>
      </span>
      {!compact && (
        <span className="text-lg">
          {BRAND.first}<span className={light ? "text-mint" : "text-primary"}>{BRAND.second}</span>
        </span>
      )}
    </span>
  );
}
