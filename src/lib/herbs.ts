import { getCollection, type CollectionEntry } from "astro:content";
import type { REGIONS } from "@/content.config";

export type Herb = CollectionEntry<"herbs">["data"] & { id: string };
export type Region = (typeof REGIONS)[number];

const REGION_LABELS: Record<Region, string> = {
  amazonia: "Amazonía",
  andes: "Andes",
};

export const regionLabel = (region: Region): string => REGION_LABELS[region];

/** Todas las hierbas, en el orden editorial definido en cada archivo. */
export async function getHerbs(): Promise<Herb[]> {
  const entries = await getCollection("herbs");
  return entries.map((entry) => ({ id: entry.id, ...entry.data })).sort((a, b) => a.order - b.order);
}

export function getHerb(herbs: Herb[], id: string): Herb {
  const herb = herbs.find((h) => h.id === id);
  if (!herb) throw new Error(`No existe la hierba "${id}" en src/content/herbs`);
  return herb;
}

/** La altitud máxima del hábitat entre todas las hierbas (dato del hero). */
export const highestAltitude = (herbs: Herb[]): number => Math.max(...herbs.map((h) => h.altitude.max));
