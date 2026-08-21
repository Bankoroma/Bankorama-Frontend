import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LedgerConvert — Vos relevés bancaires, enfin exploitables",
  description: "Convertissez vos relevés bancaires PDF en fichiers Excel structurés.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}