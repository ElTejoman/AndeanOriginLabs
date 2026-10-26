/** Envío de formularios a webhooks de n8n. */

export const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export class WebhookError extends Error {}

/**
 * Envía `payload` como JSON, con datos de origen añadidos.
 * En n8n: nodo Webhook (POST) con "Allowed Origins (CORS)" apuntando al dominio del sitio.
 */
export async function postToWebhook(webhookUrl: string, payload: Record<string, unknown>): Promise<void> {
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      origen: "web",
      pagina: location.href,
      enviadoEn: new Date().toISOString(),
    }),
  }).catch(() => {
    throw new WebhookError("network");
  });

  if (!response.ok) throw new WebhookError(`http ${response.status}`);
}
