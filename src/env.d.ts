/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** Webhook de n8n para la lista de espera. Si no existe, el formulario funciona en modo demostración. */
  readonly PUBLIC_WAITLIST_WEBHOOK_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
