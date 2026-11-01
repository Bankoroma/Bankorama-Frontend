"use client";

import { ChangeEvent, DragEvent, useEffect, useRef, useState } from "react";
import { FileUp, Loader2, CheckCircle2, AlertCircle, FileText } from "lucide-react";
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
      setMessage("Veuillez sélectionner un fichier PDF.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setPhase("error");
      setMessage("Le fichier ne doit pas dépasser 10 Mo.");
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
        `Conversion réussie : ${result.pagesProcessed} page(s), ${result.creditsConsumed} crédit(s) consommé(s). Le fichier Excel a été téléchargé.`
      );
      onUploaded?.(result.creditsRemaining);
    } catch (error) {
      setPhase("error");
      setMessage(await apiErrorMessage(error, "La conversion a échoué. Veuillez réessayer."));
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
    return (
      <div className="rounded-2xl border-2 border-primary/30 bg-primary/5 p-10 text-center" role="status" aria-live="polite">
        <div className="relative mx-auto h-20 w-20">
          <div className="absolute inset-0 rounded-full border-4 border-primary/15" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary" />
          <div className="absolute inset-0 grid place-items-center text-primary">
            <FileText size={26} />
          </div>
        </div>

        <h3 className="mt-6 text-xl font-bold text-slate-900">
          {phase === "uploading" ? "Envoi du relevé…" : "Extraction en cours"}
        </h3>
        <p className="mt-1 truncate text-sm text-slate-500">{filename}</p>

        {phase === "uploading" ? (
          <div className="mx-auto mt-6 max-w-sm">
            <div className="h-2 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-2 text-xs font-semibold text-primary">{progress} %</p>
          </div>
        ) : (
          <div className="mx-auto mt-6 max-w-sm space-y-2 text-left">
            {EXTRACTION_STEPS.map((label, i) => (
              <p
                key={label}
                className={`flex items-center gap-2 text-sm ${
                  i < step ? "text-emerald-600" : i === step ? "font-semibold text-slate-900" : "text-slate-400"
                }`}
              >
                {i < step ? <CheckCircle2 size={16} /> : i === step ? <Loader2 size={16} className="animate-spin" /> : <span className="h-4 w-4 rounded-full border border-slate-300" />}
                {label}
              </p>
            ))}
          </div>
        )}

        <p className="mt-6 text-xs text-slate-400">
          Cela peut prendre jusqu&apos;à quelques minutes selon la taille du relevé. Ne fermez pas cette fenêtre.
        </p>
      </div>
    );
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      className={`rounded-2xl border-2 border-dashed p-10 text-center transition ${
        dragging ? "border-primary bg-primary/5" : "border-slate-300 bg-secondary/40"
      }`}
    >
      <input ref={inputRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={onChange} />
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary text-white">
        <FileUp />
      </div>
      <h3 className="mt-5 text-xl font-bold text-slate-900">
        Glissez-déposez votre PDF ici
      </h3>
      <p className="mt-2 text-sm text-slate-500">ou cliquez pour parcourir vos fichiers</p>
      <p className="mt-1 text-xs text-slate-400">PDF uniquement · 10 Mo maximum · 1 page = 1 crédit</p>
      <button
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className="mt-6 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-60"
      >
        {phase === "done" ? "Convertir un autre relevé" : "Sélectionner un fichier"}
      </button>
      {message && (
        <p className={`mt-4 flex items-center justify-center gap-2 text-sm ${
          phase === "done" ? "text-primary" : "text-red-600"
        }`}>
          {phase === "done" ? <CheckCircle2 size={16} className="shrink-0" /> : <AlertCircle size={16} className="shrink-0" />}
          {message}
        </p>
      )}
    </div>
  );
}
