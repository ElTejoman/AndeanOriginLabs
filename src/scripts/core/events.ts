/**
 * Bus de eventos de la página. Desacopla las secciones:
 * las fórmulas y el perfil de origen piden mostrar una planta, el herbario muestra su ficha,
 * y los botones "Solicitar" de una fórmula la preseleccionan en los formularios.
 */
export type AppEvents = {
  /** Mostrar la ficha de una planta. `scroll` lleva la vista hasta la ficha. */
  "herb:select": { id: string; scroll: boolean };
  /** El usuario se interesa en esta fórmula: preseleccionarla en los formularios. */
  "formula:choose": { id: string };
  /** Se abrió el modal con este id (ver scripts/core/modal.ts). */
  "modal:open": { id: string };
};

type EventName = keyof AppEvents;

const bus = new EventTarget();

export function emit<K extends EventName>(name: K, detail: AppEvents[K]): void {
  bus.dispatchEvent(new CustomEvent(name, { detail }));
}

export function on<K extends EventName>(name: K, handler: (detail: AppEvents[K]) => void): () => void {
  const listener = (event: Event) => handler((event as CustomEvent<AppEvents[K]>).detail);
  bus.addEventListener(name, listener);
  return () => bus.removeEventListener(name, listener);
}
