import { mustQs } from "@/scripts/core/dom";
import { clearErrorsOnEdit, showFieldErrors } from "@/scripts/core/formErrors";
import { submitRequest, validateRequest, type PartnerRequest } from "@/scripts/partners/partners";

const MESSAGES = {
  invalid: "Revisa los campos marcados.",
  sending: "Enviando tu solicitud…",
  success: (name: string) => `Gracias, ${name}. Recibimos tu solicitud y te escribiremos para coordinar la alianza.`,
  demo: (name: string) => `Gracias, ${name}. En la versión final aquí se enviará tu solicitud de alianza.`,
  failure: "No pudimos enviar tu solicitud. Revisa tu conexión e inténtalo de nuevo.",
} as const;

/** Formulario de asociación para médicos y clínicas. Sin webhook configurado funciona en modo demostración. */
export function initPartnerForm(form: HTMLFormElement, webhookUrl: string | undefined): void {
  const submitButton = mustQs<HTMLButtonElement>("button[type='submit']", form);
  const status = mustQs("[data-status]", form);

  const showStatus = (message: string, kind: "ok" | "error" | "info"): void => {
    status.hidden = false;
    status.dataset["kind"] = kind;
    status.textContent = message;
  };

  clearErrorsOnEdit(form, () => {
    if (status.dataset["kind"] === "error") status.hidden = true;
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const field = (name: string): string => String(data.get(name) ?? "").trim();

    // Trampa para bots: el campo "sitio" es invisible para las personas.
    if (field("sitio")) return;

    const request: PartnerRequest = {
      nombre: field("nombre"),
      tipo: field("tipo"),
      especialidad: field("especialidad"),
      ciudad: field("ciudad"),
      correo: field("correo"),
      telefono: field("telefono"),
    };

    if (showFieldErrors(form, validateRequest(request))) return showStatus(MESSAGES.invalid, "error");

    if (!webhookUrl) return showStatus(MESSAGES.demo(request.nombre), "ok");

    submitButton.disabled = true;
    showStatus(MESSAGES.sending, "info");
    try {
      await submitRequest(webhookUrl, request);
      form.reset();
      showStatus(MESSAGES.success(request.nombre), "ok");
    } catch {
      showStatus(MESSAGES.failure, "error");
    } finally {
      submitButton.disabled = false;
    }
  });
}
