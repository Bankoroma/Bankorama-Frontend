"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { FileUp, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { uploadStatement } from "@/lib/api";

export function UploadBox({ onUploaded }: { onUploaded?: () => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleFile(file?: File) {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setMessage("Veuillez sélectionner un fichier PDF.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setMessage("Le fichier ne doit pas dépasser 10 Mo.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      await uploadStatement(file);
      setMessage("Conversion lancée avec succès.");
      onUploaded?.();
    } catch {
      setMessage("Impossible de contacter l'API. Vérifiez votre backend.");
    } finally {
      setLoading(false);
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
        {loading ? <Loader2 className="animate-spin" /> : <FileUp />}
      </div>
      <h3 className="mt-5 text-xl font-bold text-slate-900">
        Glissez-déposez votre PDF ici
      </h3>
      <p className="mt-2 text-sm text-slate-500">ou cliquez pour parcourir vos fichiers</p>
      <p className="mt-1 text-xs text-slate-400">PDF uniquement · 10 Mo maximum</p>
      <button
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="mt-6 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-60"
      >
        {loading ? "Envoi en cours..." : "Sélectionner un fichier"}
      </button>
      {message && (
        <p className={`mt-4 flex items-center justify-center gap-2 text-sm ${
          message.includes("succès") ? "text-primary" : "text-red-600"
        }`}>
          {message.includes("succès") ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {message}
        </p>
      )}
    </div>
  );
}