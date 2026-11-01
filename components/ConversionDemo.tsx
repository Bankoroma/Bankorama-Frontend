"use client";

import { useEffect, useRef, useState } from "react";
import { Check, FileSpreadsheet, FileText, Pause, Play, Sparkles } from "lucide-react";

// Relevé fictif utilisé pour la démonstration
const ROWS = [
  { date: "02/10", type: "Virement", label: "Client Alpha", debit: "", credit: "12 500,00", raw: "VIR RECU CLIENT ALPHA" },
  { date: "05/10", type: "Carte", label: "Station service", debit: "450,00", credit: "", raw: "CB STATION SERVICE" },
  { date: "15/10", type: "Retrait", label: "DAB Casablanca", debit: "2 000,00", credit: "", raw: "RETRAIT DAB CASABLANCA" },
  { date: "28/10", type: "Prélèvement", label: "Loyer bureaux", debit: "8 000,00", credit: "", raw: "PRLV LOYER BUREAUX" },
];

// Étapes : 0 PDF seul · 1 lecture · 2..5 une ligne extraite par étape · 6 totaux · 7 terminé
const DURATIONS = [900, 600, 650, 650, 650, 650, 700, 3200];
const FIRST_ROW_STEP = 2;
const TOTAL_STEP = FIRST_ROW_STEP + ROWS.length;
const DONE_STEP = TOTAL_STEP + 1;

function statusFor(step: number) {
  if (step === 0) return "Relevé importé";
  if (step === 1) return "Lecture du PDF…";
  if (step < TOTAL_STEP) return "Extraction des transactions…";
  if (step === TOTAL_STEP) return "Calcul des totaux…";
  return "Fichier Excel prêt";
}

export function ConversionDemo({ className = "" }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(true);
  const [reduced, setReduced] = useState(false);

  // Mouvement réduit : état final figé, sans boucle
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      setReduced(media.matches);
      if (media.matches) setStep(DONE_STEP);
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  // Pause automatique hors écran
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.2 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (paused || !visible || reduced) return;
    const timer = setTimeout(() => setStep((s) => (s + 1) % DURATIONS.length), DURATIONS[step]);
    return () => clearTimeout(timer);
  }, [step, paused, visible, reduced]);

  const extracted = Math.max(0, Math.min(ROWS.length, step - FIRST_ROW_STEP + 1));
  const scanning = step >= 1 && step < TOTAL_STEP;
  const scanIndex = Math.max(0, Math.min(ROWS.length - 1, step - FIRST_ROW_STEP + (step === 1 ? 1 : 0)));
  const done = step >= DONE_STEP;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <p className="sr-only">
        Démonstration animée : un relevé bancaire PDF est lu ligne par ligne, chaque transaction est extraite
        puis placée dans un tableau Excel avec ses totaux.
      </p>

      {!reduced && (
        <button
          type="button"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? "Reprendre l’animation" : "Mettre l’animation en pause"}
          className="absolute -right-1 -top-1 z-10 grid h-11 w-11 place-items-center rounded-full text-white/60 transition-colors hover:bg-white/10 hover:text-white"
        >
          {paused ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
        </button>
      )}

      <div aria-hidden="true">
        {/* ---------- PDF ---------- */}
        <div className="flex items-center gap-3 pr-10">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10"><FileText size={19} /></span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">releve_octobre.pdf</p>
            <p className="text-xs text-white/55">1 page · 1 crédit</p>
          </div>
        </div>

        <div className="relative mt-3 overflow-hidden rounded-2xl bg-[#fbfbfd] p-3 text-ink">
          <div className="flex items-center justify-between border-b border-dashed border-line pb-2">
            <p className="text-[10px] font-bold uppercase tracking-wider">Banque exemple</p>
            <p className="text-[10px] text-muted">Relevé · octobre 2026</p>
          </div>

          <div className="relative mt-1.5">
            {/* Faisceau de lecture : seule la translation est animée */}
            <div
              className={`pointer-events-none absolute inset-x-0 top-0 h-7 rounded-md bg-mint/25 shadow-[0_0_0_1px_rgba(52,211,153,0.6)] transition-[transform,opacity] duration-500 ease-out ${scanning ? "opacity-100" : "opacity-0"}`}
              style={{ transform: `translateY(${scanIndex * 100}%)` }}
            />
            {ROWS.map((row, i) => (
              <div key={row.raw} className="relative flex h-7 items-center gap-2 px-1.5 font-mono text-[10px] tabular">
                <span className="w-9 shrink-0 text-muted">{row.date}</span>
                <span className={`min-w-0 flex-1 truncate transition-colors duration-300 ${i < extracted ? "text-ink" : "text-subtle"}`}>{row.raw}</span>
                <span className="shrink-0">{row.debit || row.credit}</span>
                <span className={`grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full bg-primary text-white transition-[transform,opacity] duration-300 ${i < extracted ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}>
                  <Check size={9} strokeWidth={4} />
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ---------- Statut IA ---------- */}
        <div className="my-3 flex justify-center">
          <span className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors duration-300 ${done ? "bg-mint text-ink" : "bg-white/10 text-white"}`}>
            {done ? <Check size={13} strokeWidth={3} /> : <Sparkles size={13} className={step > 0 ? "animate-pulse" : ""} />}
            {statusFor(step)}
          </span>
        </div>

        {/* ---------- Excel ---------- */}
        <div className="overflow-hidden rounded-2xl bg-white text-ink">
          <div className="flex items-center justify-between gap-2 border-b border-line px-3.5 py-2">
            <p className="flex items-center gap-2 text-xs font-semibold">
              <FileSpreadsheet size={14} className="text-primary" /> releve_octobre.xlsx
            </p>
            <span className={`rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-semibold text-primary transition-[transform,opacity] duration-300 ${done ? "scale-100 opacity-100" : "scale-75 opacity-0"}`}>
              Téléchargé
            </span>
          </div>
          <table className="w-full table-fixed text-left text-[10.5px] tabular">
            <colgroup>
              <col className="w-[16%]" /><col className="w-[22%]" /><col /><col className="w-[19%]" /><col className="w-[19%]" />
            </colgroup>
            <thead className="bg-ink text-white">
              <tr>{["Date", "Type", "Libellé", "Débit", "Crédit"].map((h, j) => <th key={h} className={`px-2 py-1.5 font-semibold ${j > 2 ? "text-right" : ""}`}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => (
                <tr
                  key={row.raw}
                  className={`transition-[transform,opacity] duration-500 ease-out ${i % 2 ? "bg-mist" : ""} ${i < extracted ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"}`}
                >
                  <td className="truncate px-2 py-1.5">{row.date}</td>
                  <td className="truncate px-2 py-1.5">{row.type}</td>
                  <td className="truncate px-2 py-1.5">{row.label}</td>
                  <td className="truncate px-2 py-1.5 text-right">{row.debit}</td>
                  <td className="truncate px-2 py-1.5 text-right">{row.credit}</td>
                </tr>
              ))}
              <tr className={`border-t-2 border-ink font-bold transition-opacity duration-500 ${step >= TOTAL_STEP ? "opacity-100" : "opacity-0"}`}>
                <td colSpan={3} className="px-2 py-1.5 text-right">Total</td>
                <td className="truncate px-2 py-1.5 text-right">10 450,00</td>
                <td className="truncate px-2 py-1.5 text-right">12 500,00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
