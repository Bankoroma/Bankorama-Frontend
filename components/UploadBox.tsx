"use client";

import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import { AlertCircle, Check, CheckCircle2, FileText, FileUp, Loader2 } from "lucide-react";
import { apiErrorMessage, uploadStatement } from "@/lib/api";

type Phase = "idle" | "uploading" | "extracting" | "done" | "error";

const EXTRACTION_STEPS = [
  "Lecture du relevé…",
  "Extraction des transactions…",
  "Vérification des montants…",
  "Génération du fichier Excel…",
];

export function UploadBox({
  onUploaded,
  onBusyChange,
  disabled,
}: {
  onUploaded?: (creditsRemaining: number) => void;
  onBusyChange?: (busy: boolean) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);
  const [filename, setFilename] = useState("");
  const [message, setMessage] = useState("");

  const busy = phase === "uploading" || phase === "extracting";

  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);

  // Empêche de quitter la page pendant un traitement en cours
  useEffect(() => {
    if (!busy) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [busy]);

  // Fait défiler les étapes pendant l'extraction (durée inconnue côté client)
  useEffect(() => {
    if (phase !== "extracting") return;
    setStep(0);
    const timer = setInterval(() => {
      setStep((s) => Math.min(s + 1, EXTRACTION_STEPS.length - 1));
    }, 6000);
    return () => clearInterval(timer);
  }, [phase]);

  async function handleFile(file?: File) {
    if (!file || busy || disabled) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setPhase("error");
      setMessage("Ce fichier n’est pas un PDF. Sélectionnez un relevé au format PDF.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setPhase("error");
      setMessage("Le fichier dépasse 10 Mo. Compressez-le ou découpez le relevé en plusieurs PDF.");
      return;
    }

    setFilename(file.name);
    setProgress(0);
    setMessage("");
    setPhase("uploading");

    try {
      const result = await uploadStatement(file, (percent) => {
        setProgress(percent);
        if (percent >= 100) setPhase("extracting");
      });

      setPhase("done");
      setMessage(
        `${result.pagesProcessed} page(s) convertie(s), ${result.creditsConsumed} crédit(s) utilisé(s). Votre fichier Excel a été téléchargé.`
      );
      onUploaded?.(result.creditsRemaining);
    } catch (error) {
      setPhase("error");
      setMessage(await apiErrorMessage(error, "La conversion a échoué. Réessayez dans un instant."));
    } finally {
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    void handleFile(e.target.files?.[0]);
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    void handleFile(e.dataTransfer.files?.[0]);
  }

  if (busy) {
    const extracting = phase === "extracting";
    return (
      <div className="rounded-bento bg-ink p-8 text-white" role="status" aria-live="polite">
        <div className="flex items-center gap-4">
          <div className="relative h-16 w-16 shrink-0" aria-hidden="true">
            <div className="absolute inset-0 rounded-full border-[5px] border-white/10" />
            <div className="absolute inset-0 animate-spin rounded-full border-[5px] border-transparent border-t-mint" />
            <div className="absolute inset-0 grid place-items-center text-white/80"><FileText size={22} /></div>
          </div>
          <div className="min-w-0">
            <p className="font-display text-xl font-bold tracking-tight">{extracting ? "Extraction en cours…" : "Envoi du relevé…"}</p>
            <p className="mt-0.5 truncate text-sm text-white/55">{filename}</p>
          </div>
        </div>

        {extracting ? (
          <ol className="mt-7 space-y-1.5">
            {EXTRACTION_STEPS.map((label, i) => {
              const state = i < step ? "done" : i === step ? "current" : "todo";
              return (
                <li
                  key={label}
                  aria-current={state === "current" ? "step" : undefined}
                  className={`flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm transition-colors ${
                    state === "current" ? "bg-white/[0.08] font-semibold text-white" : state === "done" ? "text-mint" : "text-white/35"
                  }`}
                >
                  {state === "done" ? <Check size={16} strokeWidth={3} aria-hidden="true" />
                    : state === "current" ? <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                    : <span className="h-4 w-4 rounded-full border border-white/25" aria-hidden="true" />}
                  {label}
                </li>
              );
            })}
          </ol>
        ) : (
          <div className="mt-7">
            <div className="h-2 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} aria-label="Progression de l’envoi">
              <div className="h-full origin-left rounded-full bg-mint transition-transform duration-300" style={{ transform: `scaleX(${progress / 100})` }} />
            </div>
            <p className="mt-2 text-right text-xs font-semibold text-mint tabular">{progress}&nbsp;%</p>
          </div>
        )}

        <p className="mt-6 text-xs leading-5 text-white/45">
          Selon la taille du relevé, cela peut prendre jusqu’à quelques minutes. Gardez cette fenêtre ouverte.
        </p>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={`rounded-bento border-2 border-dashed p-8 text-center transition-[border-color,background-color] duration-200 sm:p-10 ${
        dragging ? "border-primary bg-primary-soft" : "border-line bg-mist"
      }`}
    >
      <input ref={inputRef} id="releve-pdf" type="file" accept=".pdf,application/pdf" className="sr-only" onChange={onChange} disabled={disabled} />
      <span className={`mx-auto grid h-16 w-16 place-items-center rounded-[20px] transition-transform duration-200 ${dragging ? "scale-110 bg-primary text-white" : "bg-white text-ink shadow-bento"}`}>
        <FileUp size={26} aria-hidden="true" />
      </span>
      <p className="mt-5 font-display text-xl font-bold tracking-tight">Glissez votre relevé ici</p>
      <p className="mt-1 text-sm text-muted">PDF uniquement · 10&nbsp;Mo maximum · 1 page = 1 crédit</p>
      <label
        htmlFor="releve-pdf"
        className={`btn-dark mt-6 cursor-pointer ${disabled ? "pointer-events-none opacity-50" : ""}`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-disabled={disabled}
      >
        {phase === "done" ? "Convertir un autre relevé" : "Choisir un fichier"}
      </label>

      {message && (
        <p
          role={phase === "error" ? "alert" : "status"}
          className={`mx-auto mt-6 flex max-w-md items-start justify-center gap-2 rounded-2xl px-4 py-3 text-left text-sm ${
            phase === "done" ? "bg-primary-soft text-primary" : "bg-danger/5 text-danger"
          }`}
        >
          {phase === "done" ? <CheckCircle2 size={18} aria-hidden="true" className="mt-px shrink-0" /> : <AlertCircle size={18} aria-hidden="true" className="mt-px shrink-0" />}
          {message}
        </p>
      )}
    </div>
  );
}
