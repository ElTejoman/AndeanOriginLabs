/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** Webhook de n8n para la lista de espera. Si no existe, el formulario funciona en modo demostración. */
  readonly PUBLIC_WAITLIST_WEBHOOK_URL?: string;
  /** Webhook de n8n para las solicitudes de médicos y clínicas. Sin él, el formulario funciona en modo demostración. */
  readonly PUBLIC_PARTNERS_WEBHOOK_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
