import { animate, stagger } from "animejs";
import { mustQs, onFirstVisible, qsa } from "@/scripts/core/dom";
import { EASE, isMotionEnabled, settle } from "@/scripts/motion/motion";

/** Proceso: el riel se llena de verde a achiote y los pasos suben en cascada. */
export function initProcessRail(root: HTMLElement): void {
  if (!isMotionEnabled()) return;

  onFirstVisible(root, () => {
    const fill = mustQs("[data-rail-fill]", root);
    const steps = qsa("[data-step]", root);
    animate(fill, { scaleX: [0, 1], duration: 1600, ease: EASE.inOutQuart, onComplete: settle([fill]) });
    animate(steps, {
      translateY: [30, 0],
      opacity: [0, 1],
      delay: stagger(180, { start: 200 }),
      duration: 900,
      ease: EASE.expo,
      onComplete: settle(steps),
    });
  });
}
