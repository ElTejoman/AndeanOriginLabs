/** Lógica de la lista de espera, sin DOM: validación y envío al webhook de n8n. */

export type WaitlistEntry = {
  nombre: string;
  correo: string;
  /** id de la hierba elegida, o "" si todavía no sabe. */
  hierba: string;
  hierbaNombre: string;
};

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Devuelve el mensaje de error para mostrar, o null si los datos son válidos. */
export function validateEntry(entry: WaitlistEntry): string | null {
  if (!entry.nombre || !EMAIL_PATTERN.test(entry.correo)) return "Escribe tu nombre y un correo válido.";
  return null;
}

export class WaitlistError extends Error {}

/**
 * Envía la reserva al webhook de n8n como JSON.
 * En n8n: nodo Webhook (POST) con "Allowed Origins (CORS)" apuntando al dominio del sitio.
 */
export async function submitEntry(webhookUrl: string, entry: WaitlistEntry): Promise<void> {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...entry,
      origen: "web",
      pagina: location.href,
      enviadoEn: new Date().toISOString(),
    }),
  }).catch(() => {
    throw new WaitlistError("network");
  });

  if (!response.ok) throw new WaitlistError(`http ${response.status}`);
}
