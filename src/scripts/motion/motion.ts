import { utils, type Renderable } from "animejs";

/**
 * Punto de entrada del movimiento con anime.js.
 * La clase `motion` en <html> (ver BaseLayout) indica que las animaciones están activas
 * y que los elementos animables parten ocultos desde CSS (styles/motion.css).
 */
export const isMotionEnabled = (): boolean => document.documentElement.classList.contains("motion");

/** Avisa al <head> que las animaciones arrancaron (si no, a los 4 s se muestra todo sin animar). */
export function markMotionReady(): void {
  document.documentElement.dataset["motionReady"] = "true";
}

/**
 * Callback de fin para animaciones de entrada: marca los elementos como revelados
 * y quita los estilos en línea, devolviendo el control al CSS (hover, transiciones).
 */
export function settle(revealed: Iterable<Element> = []) {
  return (animation: Renderable): void => {
    for (const el of revealed) el.classList.add("is-revealed");
    utils.cleanInlineStyles(animation);
  };
}

/** Curvas compartidas, traducidas del prototipo (anime v3 → v4). */
export const EASE = {
  expo: "outExpo",
  quart: "outQuart",
  inOutQuart: "inOutQuart",
  back: "outBack",
  sine: "outSine",
  linear: "linear",
} as const;
