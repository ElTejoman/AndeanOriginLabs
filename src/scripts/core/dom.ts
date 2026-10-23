/** Utilidades DOM tipadas. */

export function qs<T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T | null {
  return root.querySelector<T>(selector);
}

export function qsa<T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T[] {
  return Array.from(root.querySelectorAll<T>(selector));
}

/** Como qs, pero falla en voz alta si el marcado no tiene el elemento esperado. */
export function mustQs<T extends Element = HTMLElement>(selector: string, root: ParentNode = document): T {
  const el = qs<T>(selector, root);
  if (!el) throw new Error(`Falta el elemento "${selector}" en el marcado`);
  return el;
}

export const prefersReducedMotion = (): boolean => matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Ejecuta `callback` una sola vez cuando el elemento entra en pantalla. */
export function onFirstVisible(el: Element, callback: () => void, threshold = 0.18): void {
  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      callback();
    },
    { threshold },
  );
  observer.observe(el);
}
