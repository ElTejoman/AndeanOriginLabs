/** Lógica de la lista de espera, sin DOM: validación y envío al webhook de n8n. */
import type { FieldErrors } from "@/scripts/core/formErrors";
import { EMAIL_PATTERN, postToWebhook } from "@/scripts/core/webhook";

export type WaitlistEntry = {
  nombre: string;
  correo: string;
  /** id de la hierba elegida, o "" si todavía no sabe. */
  hierba: string;
  hierbaNombre: string;
};

/** Devuelve un mensaje por cada campo inválido; un objeto vacío si todo está bien. */
export function validateEntry(entry: WaitlistEntry): FieldErrors<WaitlistEntry> {
  const errors: FieldErrors<WaitlistEntry> = {};
  if (!entry.nombre) errors.nombre = "Escribe tu nombre.";
  if (!entry.correo) errors.correo = "Escribe tu correo.";
  else if (!EMAIL_PATTERN.test(entry.correo)) errors.correo = "Revisa el correo: parece incompleto.";
  return errors;
}

export const submitEntry = (webhookUrl: string, entry: WaitlistEntry): Promise<void> =>
  postToWebhook(webhookUrl, entry);
