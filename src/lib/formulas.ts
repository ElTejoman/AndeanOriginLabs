import { getCollection, type CollectionEntry } from "astro:content";
import type { FORMATS } from "@/content.config";
import { getHerb, type Herb } from "@/lib/herbs";

/** Una fórmula con sus plantas ya resueltas (en el JSON son referencias por id). */
export type Formula = Omit<CollectionEntry<"formulas">["data"], "herbs"> & { id: string; herbs: Herb[] };
export type Format = (typeof FORMATS)[number];

const FORMAT_LABELS: Record<Format, string> = {
  hidroalcoholico: "Extracto hidroalcohólico",
  granulos: "Extracto seco en gránulos",
};

/** Formatos de la fórmula en texto. Sin formatos definidos, un texto genérico. */
export const formatsLabel = (formula: Formula): string =>
  formula.formats?.map((format) => FORMAT_LABELS[format]).join(" · ") ?? "Extracto concentrado";

/** Todas las fórmulas, en orden, con sus plantas. */
export async function getFormulas(herbs: Herb[]): Promise<Formula[]> {
  const entries = await getCollection("formulas");
  return entries
    .map((entry) => ({ ...entry.data, id: entry.id, herbs: entry.data.herbs.map((ref) => getHerb(herbs, ref.id)) }))
    .sort((a, b) => a.order - b.order);
}

/** La fórmula que lleva esta planta. Cada planta pertenece a una sola. */
export function formulaOf(formulas: Formula[], herbId: string): Formula {
  const formula = formulas.find((f) => f.herbs.some((herb) => herb.id === herbId));
  if (!formula) throw new Error(`La planta "${herbId}" no está en ninguna fórmula de src/content/formulas`);
  return formula;
}

/** "Fórmula 01" */
export const formulaNumber = (formula: Pick<Formula, "order">): string =>
  `Fórmula ${String(formula.order).padStart(2, "0")}`;
