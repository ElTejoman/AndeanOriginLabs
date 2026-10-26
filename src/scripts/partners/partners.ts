/** Lógica del formulario de médicos y clínicas, sin DOM: validación y envío al webhook de n8n. */
import type { FieldErrors } from "@/scripts/core/formErrors";
import { EMAIL_PATTERN, postToWebhook } from "@/scripts/core/webhook";

export type PartnerRequest = {
  nombre: string;
  tipo: string;
  /** Especialidad del médico o nombre de la clínica. */
  especialidad: string;
  ciudad: string;
  correo: string;
  telefono: string;
};

/** Devuelve un mensaje por cada campo inválido; un objeto vacío si todo está bien. */
export function validateRequest(request: PartnerRequest): FieldErrors<PartnerRequest> {
  const errors: FieldErrors<PartnerRequest> = {};
  if (!request.nombre) errors.nombre = "Escribe tu nombre y apellido.";
  if (!request.tipo) errors.tipo = "Elige si eres médico o clínica.";
  if (!request.correo) errors.correo = "Escribe tu correo.";
  else if (!EMAIL_PATTERN.test(request.correo)) errors.correo = "Revisa el correo: parece incompleto.";
  return errors;
}

export const submitRequest = (webhookUrl: string, request: PartnerRequest): Promise<void> =>
  postToWebhook(webhookUrl, { ...request, tipoSolicitud: "aliado" });
