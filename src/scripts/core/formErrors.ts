/** Errores junto a cada campo: aria-invalid, mensaje enlazado por aria-describedby y foco al primer campo inválido. */
import { qsa } from "@/scripts/core/dom";

/** Mensaje de error por nombre de campo; los campos válidos no aparecen. */
export type FieldErrors<T> = Partial<Record<Extract<keyof T, string>, string>>;

type Field = HTMLInputElement | HTMLSelectElement;

const fieldFor = (form: HTMLFormElement, name: string): Field | null => {
  const el = form.elements.namedItem(name);
  return el instanceof HTMLInputElement || el instanceof HTMLSelectElement ? el : null;
};

function setError(form: HTMLFormElement, slot: HTMLElement, message: string | undefined): void {
  const field = fieldFor(form, slot.dataset["errorFor"] ?? "");
  slot.textContent = message ?? "";
  slot.hidden = !message;
  if (message) field?.setAttribute("aria-invalid", "true");
  else field?.removeAttribute("aria-invalid");
}

/**
 * Pinta los errores en los `[data-error-for]` del formulario y lleva el foco al primer campo inválido.
 * Devuelve true si hay errores.
 */
export function showFieldErrors(form: HTMLFormElement, errors: Record<string, string | undefined>): boolean {
  const slots = qsa("[data-error-for]", form);
  for (const slot of slots) setError(form, slot, errors[slot.dataset["errorFor"] ?? ""]);

  const first = slots.find((slot) => !slot.hidden);
  if (!first) return false;
  fieldFor(form, first.dataset["errorFor"] ?? "")?.focus();
  return true;
}

/** Borra el error de un campo en cuanto la persona lo corrige; `onAllCleared` corre al quedar sin errores. */
export function clearErrorsOnEdit(form: HTMLFormElement, onAllCleared?: () => void): void {
  const clear = (event: Event): void => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return;
    if (!target.hasAttribute("aria-invalid")) return;
    const slot = qsa("[data-error-for]", form).find((s) => s.dataset["errorFor"] === target.name);
    if (slot) setError(form, slot, undefined);
    if (qsa("[data-error-for]", form).every((s) => s.hidden)) onAllCleared?.();
  };
  form.addEventListener("input", clear);
  form.addEventListener("change", clear);
}
