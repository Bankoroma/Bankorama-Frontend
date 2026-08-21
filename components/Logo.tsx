import { FileSpreadsheet } from "lucide-react";

export function Logo({ light = false }: { light?: boolean }) {
  return (
    <div className={`flex items-center gap-2 font-bold tracking-tight ${light ? "text-white" : "text-neutral"}`}>
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-white">
        <FileSpreadsheet size={19} />
      </span>
      <span className="text-xl">Ledger<span className="text-primary">Convert</span></span>
    </div>
  );
}