/** Locale único del sitio: español de Perú (separador de miles con coma: 4,500). */
export const LOCALE = "es-PE";

const numberFormat = new Intl.NumberFormat(LOCALE, { useGrouping: "always" });

export const formatNumber = (value: number): string => numberFormat.format(value);

/** "200 – 800" */
export const formatRange = (min: number, max: number): string => `${formatNumber(min)} – ${formatNumber(max)}`;

export type FormulaPart = { text: string; sub: boolean };

/**
 * Separa una fórmula molecular en partes para dibujar los subíndices.
 * "C21H24N2O4" → C, 21(sub), H, 24(sub), N, 2(sub), O, 4(sub)
 */
export function splitFormula(formula: string): FormulaPart[] {
  return Array.from(formula.matchAll(/([A-Z][a-z]?)(\d*)/g)).flatMap(([, element = "", count = ""]) =>
    count ? [{ text: element, sub: false }, { text: count, sub: true }] : [{ text: element, sub: false }],
  );
}

const SUBSCRIPT_DIGITS = "₀₁₂₃₄₅₆₇₈₉";

/** Versión en texto plano con dígitos Unicode en subíndice: "C₂₁H₂₄N₂O₄". */
export const formulaToUnicode = (formula: string): string =>
  formula.replace(/\d/g, (digit) => SUBSCRIPT_DIGITS[Number(digit)] ?? digit);
