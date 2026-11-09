import { getCollection, type CollectionEntry } from "astro:content";
import type { EVIDENCE_LEVELS, PART_GLYPHS } from "@/content.config";

export type Herb = CollectionEntry<"herbs">["data"] & { id: string };
export type EvidenceLevel = (typeof EVIDENCE_LEVELS)[number];
export type PartGlyph = (typeof PART_GLYPHS)[number];

/** Nombre corto de cada tipo de evidencia, igual en las fichas y en "Cómo leer la evidencia". */
export const EVIDENCE_LABELS: Record<EvidenceLevel, string> = {
  humanos: "Estudios en personas",
  preclinica: "Laboratorio y animales",
  tradicional: "Uso tradicional",
};

/** Todas las plantas, en el orden editorial definido en cada archivo. */
export async function getHerbs(): Promise<Herb[]> {
  const entries = await getCollection("herbs");
  return entries.map((entry) => ({ id: entry.id, ...entry.data })).sort((a, b) => a.order - b.order);
}

export function getHerb(herbs: Herb[], id: string): Herb {
  const herb = herbs.find((h) => h.id === id);
  if (!herb) throw new Error(`No existe la planta "${id}" en src/content/herbs`);
  return herb;
}
