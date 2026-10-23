import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

/** Regiones de origen. Cada hierba pertenece a una sola. */
export const REGIONS = ["amazonia", "andes"] as const;

const formula = z
  .string()
  .regex(/^([A-Z][a-z]?\d*)+$/, "Fórmula molecular inválida, por ejemplo C21H24N2O4");

/** Una hierba de la colección: un archivo JSON por hierba en src/content/herbs. */
const herbs = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/herbs" }),
  schema: z.object({
    order: z.number().int().positive(),
    name: z.string(),
    scientificName: z.string(),
    region: z.enum(REGIONS),
    regionDetail: z.string(),
    partUsed: z.string(),
    altitude: z
      .object({
        typical: z.number().int().nonnegative(),
        min: z.number().int().nonnegative(),
        max: z.number().int().positive(),
      })
      .refine((a) => a.min <= a.typical && a.typical <= a.max, "La altitud típica debe estar dentro del rango"),
    molecule: z.object({
      name: z.string(),
      formula,
      family: z.string().optional(),
    }),
    science: z.object({
      title: z.string(),
      paragraphs: z.array(z.string()).min(1),
      sources: z.string(),
    }),
    tradition: z.object({
      title: z.string(),
      paragraphs: z.array(z.string()).min(1),
    }),
    usage: z.object({
      traditional: z.string(),
      withExtract: z.string(),
    }),
    lot: z.object({
      origin: z.string(),
      code: z.string().optional(),
      altitude: z.number().int().optional(),
      harvest: z.string().optional(),
    }),
  }),
});

export const collections = { herbs };
