import { getCollection, type CollectionEntry } from "astro:content";
import type { FORMATS } from "@/content.config";
import { getHerb, type Herb, type Study } from "@/lib/herbs";

type FormulaEntry = CollectionEntry<"formulas">;
type StudyRef = NonNullable<FormulaEntry["data"]["rationale"][number]["studies"]>[number];

/** Un estudio de una de las plantas de la fórmula, citado en "Por qué juntas". */
export type CitedStudy = { herb: Herb; study: Study };
export type Reason = { text: string; studies: CitedStudy[] };

/** Una fórmula con sus plantas y estudios citados ya resueltos (en el JSON son referencias). */
export type Formula = Omit<FormulaEntry["data"], "herbs" | "rationale"> & {
  id: string;
  herbs: Herb[];
  rationale: Reason[];
};
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
  return entries.map((entry) => toFormula(entry, herbs)).sort((a, b) => a.order - b.order);
}

function toFormula({ id, data }: FormulaEntry, allHerbs: Herb[]): Formula {
  const herbs = data.herbs.map((ref) => getHerb(allHerbs, ref.id));
  const rationale = data.rationale.map((reason) => ({
    text: reason.text,
    studies: (reason.studies ?? []).map((ref) => citedStudy(id, herbs, ref)),
  }));
  return { ...data, id, herbs, rationale };
}

/** El estudio citado, que debe ser de una planta que lleva la fórmula. */
function citedStudy(formulaId: string, herbs: Herb[], ref: StudyRef): CitedStudy {
  const herb = herbs.find((h) => h.id === ref.herb.id);
  const study = herb?.studies[ref.study - 1];
  if (!herb || !study) {
    throw new Error(
      `La fórmula "${formulaId}" cita el estudio ${ref.study} de "${ref.herb.id}": la planta no está en la fórmula o no tiene ese estudio`,
    );
  }
  return { herb, study };
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
