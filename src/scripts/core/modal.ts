import { emit } from "@/scripts/core/events";

/**
 * Modales (components/ui/Modal.astro), para cualquier sección:
 * `data-open-modal="<id>"` abre el <dialog> con ese id. Se cierra con su botón ×, con Esc, al hacer clic
 * fuera o al seguir un enlace interno desde adentro (por ejemplo, "Solicitar" lleva a #aliados).
 */
export function initModals(root: Document | HTMLElement = document): void {
  root.addEventListener("click", (event) => {
    const target = event.target as Element;

    const opener = target.closest<HTMLElement>("[data-open-modal]");
    if (opener) {
      openModal(opener.dataset["openModal"]!);
      return;
    }

    const dialog = target.closest<HTMLDialogElement>("dialog[data-modal]");
    if (!dialog) return;
    if (target === dialog && isOutside(dialog, event as MouseEvent)) dialog.close();
    else if (target.closest("a[href^='#']")) dialog.close();
  });
}

function openModal(id: string): void {
  const dialog = document.getElementById(id);
  if (!(dialog instanceof HTMLDialogElement)) throw new Error(`No existe el modal "${id}"`);
  dialog.showModal();
  emit("modal:open", { id });
}

/** El clic sobre el fondo oscuro llega al propio <dialog>, pero fuera de su caja. */
function isOutside(dialog: HTMLDialogElement, event: MouseEvent): boolean {
  const box = dialog.getBoundingClientRect();
  return event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom;
}
