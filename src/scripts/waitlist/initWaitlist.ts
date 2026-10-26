import { mustQs } from "@/scripts/core/dom";
import { on } from "@/scripts/core/events";
import { clearErrorsOnEdit, showFieldErrors } from "@/scripts/core/formErrors";
import { submitEntry, validateEntry, type WaitlistEntry } from "@/scripts/waitlist/waitlist";

const MESSAGES = {
  invalid: "Revisa los campos marcados.",
  sending: "Enviando tu reserva…",
  success: (name: string) => `Gracias, ${name}. Ya estás en la lista de espera: te avisaremos antes que a nadie.`,
  demo: (name: string) => `Gracias, ${name}. En la versión final aquí quedarás inscrito en la lista de espera.`,
  failure: "No pudimos registrar tu reserva. Revisa tu conexión e inténtalo de nuevo.",
} as const;

/** Formulario de preventa. Sin webhook configurado funciona en modo demostración. */
export function initWaitlist(form: HTMLFormElement, webhookUrl: string | undefined): void {
  const herbSelect = mustQs<HTMLSelectElement>("select[name='hierba']", form);
  const submitButton = mustQs<HTMLButtonElement>("button[type='submit']", form);
  const status = mustQs("[data-status]", form);

  const showStatus = (message: string, kind: "ok" | "error" | "info"): void => {
    status.hidden = false;
    status.dataset["kind"] = kind;
    status.textContent = message;
  };

  on("herb:reserve", ({ id }) => {
    herbSelect.value = id;
  });

  clearErrorsOnEdit(form, () => {
    if (status.dataset["kind"] === "error") status.hidden = true;
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const data = new FormData(form);

    // Trampa para bots: el campo "empresa" es invisible para las personas.
    if (String(data.get("empresa") ?? "")) return;

    const entry: WaitlistEntry = {
      nombre: String(data.get("nombre") ?? "").trim(),
      correo: String(data.get("correo") ?? "").trim(),
      hierba: herbSelect.value,
      hierbaNombre: herbSelect.value ? herbSelect.selectedOptions[0]?.textContent ?? "" : "",
    };

    if (showFieldErrors(form, validateEntry(entry))) return showStatus(MESSAGES.invalid, "error");

    if (!webhookUrl) return showStatus(MESSAGES.demo(entry.nombre), "ok");

    submitButton.disabled = true;
    showStatus(MESSAGES.sending, "info");
    try {
      await submitEntry(webhookUrl, entry);
      form.reset();
      showStatus(MESSAGES.success(entry.nombre), "ok");
    } catch {
      showStatus(MESSAGES.failure, "error");
    } finally {
      submitButton.disabled = false;
    }
  });
}
