export type ConversionStatus = "Terminé" | "En cours" | "Échec";

export type Conversion = {
  id: string;
  filename: string;
  date: string;
  type: string;
  status: ConversionStatus;
};