"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FileSpreadsheet, FileText, LayoutDashboard, LogOut, Menu, Plus, RefreshCw, UserCircle, X, Download } from "lucide-react";
import { UploadBox } from "./UploadBox";
import type { Conversion } from "@/lib/types";

const initialConversions: Conversion[] = [
  { id: "1", filename: "Factures_Janvier.xlsx", date: "12 Fév", type: "Grand Livre", status: "Terminé" },
  { id: "2", filename: "Releve_Bancaire.xlsx", date: "10 Fév", type: "Rapport", status: "En cours" },
  { id: "3", filename: "Notes_de_frais_Equipe.pdf", date: "08 Fév", type: "Relevé", status: "Échec" },
];

export default function DashboardClient() {
  const router = useRouter();
  const [sidebar, setSidebar] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [user, setUser] = useState({ name: "Admin", email: "" });
  const [conversions, setConversions] = useState(initialConversions);

  useEffect(() => {
    const token = localStorage.getItem("ledger_token");
    if (!token) router.replace("/login");
    const raw = localStorage.getItem("ledger_user");
    if (raw) setUser(JSON.parse(raw));
  }, [router]);

  const completed = useMemo(() => conversions.filter(c => c.status === "Terminé").length, [conversions]);

  function logout() {
    localStorage.removeItem("ledger_token");
    localStorage.removeItem("ledger_user");
    router.push("/login");
  }

  function refresh() {
    setConversions((items) => items.map((x, i) => i === 1 ? { ...x, status: "Terminé" } : x));
  }

  return (
    <div className="min-h-screen bg-secondary/45 text-neutral">
      <div className="flex min-h-screen">
        {sidebar && (
          <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white lg:static">
            <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
              <div className="text-xl font-extrabold">Ledger<span className="text-primary">Convert</span></div>
              <button className="lg:hidden" onClick={() => setSidebar(false)}><X size={20}/></button>
            </div>
            <nav className="flex-1 p-4">
              <p className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">Menu</p>
              <button className="mt-2 flex w-full items-center gap-3 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white">
                <LayoutDashboard size={18}/> Tableau de bord
              </button>
              <button className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-secondary">
                <FileSpreadsheet size={18}/> Mes conversions
              </button>
              <button className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-secondary">
                <UserCircle size={18}/> Mon compte
              </button>
            </nav>
            <div className="border-t border-slate-100 p-4">
              <button onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-red-50 hover:text-red-600">
                <LogOut size={18}/> Déconnexion
              </button>
            </div>
          </aside>
        )}

        <section className="min-w-0 flex-1">
          <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 lg:px-8">
            <div className="flex items-center gap-3">
              {!sidebar && <button onClick={() => setSidebar(true)}><Menu /></button>}
              <div className="lg:hidden text-lg font-extrabold">Ledger<span className="text-primary">Convert</span></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-bold">{user.name || "Admin"}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-full bg-secondary text-primary"><UserCircle size={22}/></div>
            </div>
          </header>

          <main className="mx-auto max-w-6xl p-5 lg:p-8">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm text-slate-500">Tableau de bord · LedgerConvert</p>
                <h1 className="mt-1 text-3xl font-extrabold text-slate-950">Bonjour, {user.name || "Admin"}</h1>
                <p className="mt-1 text-sm text-slate-500">Voici l'état de vos ressources.</p>
              </div>
              <button onClick={() => setShowUpload(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-white shadow-sm hover:bg-teal-700">
                <Plus size={19}/> Nouvelle conversion
              </button>
            </div>

            <div className="mt-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-500">Solde de conversion</p>
                  <p className="mt-2 text-3xl font-extrabold text-slate-950">150 <span className="text-base font-semibold text-slate-400">crédits restants</span></p>
                </div>
                <span className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-bold text-primary">150 / 500</span>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full w-[30%] rounded-full bg-primary"/></div>
            </div>

            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {[
                ["Conversions", String(conversions.length), "Total"],
                ["Terminées", String(completed), "Prêtes à télécharger"],
                ["Crédits", "150", "Sur 500"],
              ].map(([label, value, note]) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-slate-500">{label}</p>
                  <p className="mt-2 text-2xl font-extrabold">{value}</p>
                  <p className="mt-1 text-xs text-slate-400">{note}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 p-5">
                <div><h2 className="font-bold text-slate-900">Conversions récentes</h2><p className="mt-1 text-xs text-slate-400">Vos derniers traitements</p></div>
                <button onClick={refresh} className="inline-flex items-center gap-2 text-xs font-bold text-primary"><RefreshCw size={15}/> Actualiser</button>
              </div>
              <div className="divide-y divide-slate-100">
                {conversions.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4 p-5">
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-secondary text-primary"><FileText size={19}/></div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{item.filename}</p>
                        <p className="mt-1 text-xs text-slate-400">{item.date} · {item.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                        item.status === "Terminé" ? "bg-emerald-50 text-emerald-600" :
                        item.status === "En cours" ? "bg-blue-50 text-blue-600" : "bg-red-50 text-red-600"
                      }`}>{item.status}</span>
                      {item.status === "Terminé" && <button title="Télécharger" className="text-primary hover:text-teal-700"><Download size={18}/></button>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </section>
      </div>

      {showUpload && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-5">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div><h2 className="text-2xl font-extrabold">Nouvelle conversion</h2><p className="mt-1 text-sm text-slate-500">Importez votre relevé bancaire PDF.</p></div>
              <button onClick={() => setShowUpload(false)} className="rounded-full p-2 hover:bg-secondary"><X/></button>
            </div>
            <UploadBox onUploaded={() => setShowUpload(false)} />
          </div>
        </div>
      )}
    </div>
  );
}