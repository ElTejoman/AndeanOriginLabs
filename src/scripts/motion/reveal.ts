import { animate, stagger } from "animejs";
import { onFirstVisible, qsa } from "@/scripts/core/dom";
import { EASE, isMotionEnabled, settle } from "@/scripts/motion/motion";

/**
 * Revela al hacer scroll los hijos de cada [data-reveal] (suben 40px y aparecen en cascada).
 * Las secciones con coreografía propia (perfil de altitud, proceso) usan sus propios módulos.
 */
export function initScrollReveal(): void {
  if (!isMotionEnabled()) return;

  for (const container of qsa("[data-reveal]")) {
    onFirstVisible(container, () => {
      animate(container.children, {
        translateY: [40, 0],
        opacity: [0, 1],
        delay: stagger(90),
        duration: 1000,
        ease: EASE.expo,
        onComplete: settle([container]),
      });
    });
  }
}
