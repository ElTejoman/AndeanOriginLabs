import { defineCollection, reference } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

/** Formatos de extracto. Cada fórmula viene en uno o en ambos. */
export const FORMATS = ["hidroalcoholico", "granulos"] as const;

/**
 * De dónde viene lo que respalda a la planta (ver la sección "Cómo leer la evidencia"):
 * estudios en personas, en laboratorio y animales, o solo uso tradicional.
 */
export const EVIDENCE_LEVELS = ["humanos", "preclinica", "tradicional"] as const;

/** Ícono de la ficha: la parte de la planta que se usa, dibujada con la forma de esa planta. */
export const PART_GLYPHS = [
  "corteza",
  "hoja",
  "hoja-citrica",
  "hojas-opuestas",
  "raiz",
  "rizoma",
  "flor",
  "tuberculo",
  "planta",
  "ramillete",
] as const;

const formula = z
  .string()
  .regex(/^([A-Z][a-z]?\d*)+$/, "Fórmula molecular inválida, por ejemplo C21H24N2O4");

const study = z.object({
  /** "Autor et al., año" o la institución. */
  citation: z.string(),
  /** Título original. Se omite si no se pudo confirmar. */
  title: z.string().optional(),
  /** Qué se estudió y qué se encontró, en una línea y en lenguaje simple. */
  finding: z.string(),
  url: z.url(),
});

/**
 * Un ingrediente de las fórmulas: un archivo JSON por planta en src/content/herbs.
 * El contenido sale del dossier científico (reference/dossier): tradición, lo que muestran los estudios
 * y, cuando corresponde, cuidados.
 */
const herbs = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/herbs" }),
  schema: z.object({
    order: z.number().int().positive(),
    name: z.string(),
    otherNames: z.array(z.string()).optional(),
    scientificName: z.string(),
    /** Aviso sobre la identificación botánica: provisional, nombre común ambiguo, etc. */
    identityNote: z.string().optional(),
    origin: z.string(),
    sourcing: z.string(),
    partUsed: z.string(),
    partGlyph: z.enum(PART_GLYPHS),
    focus: z.string(),
    compounds: z.array(z.string()).optional(),
    /** Compuesto representativo, solo cuando las fuentes lo nombran. */
    molecule: z
      .object({
        name: z.string(),
        formula,
        family: z.string().optional(),
      })
      .optional(),
    evidence: z.object({
      level: z.enum(EVIDENCE_LEVELS),
      summary: z.string(),
    }),
    tradition: z.object({
      title: z.string(),
      paragraphs: z.array(z.string()).min(1),
    }),
    science: z.object({
      title: z.string(),
      paragraphs: z.array(z.string()).min(1),
    }),
    cautions: z.array(z.string()).optional(),
    studies: z.array(study).min(1),
  }),
});

/**
 * Una razón de "Por qué juntas", con los estudios que la respaldan. Cada estudio se cita por su
 * planta y su número en la lista `studies` de esa planta (1 = el primero).
 */
const reason = z.object({
  text: z.string(),
  studies: z
    .array(z.object({ herb: reference("herbs"), study: z.number().int().positive() }))
    .min(1)
    .optional(),
});

/** Las fórmulas que se venden: un archivo JSON por fórmula en src/content/formulas. */
const formulas = defineCollection({
  loader: glob({ pattern: "*.json", base: "./src/content/formulas" }),
  schema: z.object({
    order: z.number().int().positive(),
    name: z.string(),
    focus: z.string(),
    summary: z.string(),
    herbs: z.array(reference("herbs")).min(1),
    /** Formatos en que se vende. Mientras no esté definido, se muestra un texto genérico. */
    formats: z.array(z.enum(FORMATS)).min(1).optional(),
    rationale: z.array(reason).min(1),
    cautions: z.array(z.string()).optional(),
  }),
});

export const collections = { herbs, formulas };
