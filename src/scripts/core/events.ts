/**
 * Bus de eventos de la página. Desacopla las secciones:
 * el perfil de altitud pide seleccionar una hierba, la colección la muestra,
 * y el botón "Reservar" de la ficha avisa al formulario de preventa.
 */
export type AppEvents = {
  /** Mostrar la ficha de una hierba. `scroll` lleva la vista hasta la ficha. */
  "herb:select": { id: string; scroll: boolean };
  /** El usuario quiere reservar esta hierba: precargar el formulario. */
  "herb:reserve": { id: string };
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
