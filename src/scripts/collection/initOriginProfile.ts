import { animate, stagger } from "animejs";
import { mustQs, onFirstVisible, qsa } from "@/scripts/core/dom";
import { EASE, isMotionEnabled, settle } from "@/scripts/motion/motion";

/**
 * Perfil de origen: al entrar en pantalla se dibuja la cresta, caen los puntos de cada zona y laten sus halos.
 * Las plantas de cada zona se abren desde la lista bajo el perfil (data-select-herb).
 */
export function initOriginProfile(svg: SVGSVGElement): void {
  if (isMotionEnabled()) onFirstVisible(svg, () => playProfileIntro(svg));
}

function playProfileIntro(svg: SVGSVGElement): void {
  const ridge = mustQs<SVGPathElement>("[data-ridge]", svg);
  const length = ridge.getTotalLength();
  ridge.style.strokeDasharray = String(length);
  ridge.classList.add("is-revealed");
  const pins = qsa("[data-pin]", svg);

  animate(ridge, { strokeDashoffset: [length, 0], duration: 1800, ease: EASE.inOutQuart });
  animate(pins, {
    opacity: [0, 1],
    translateY: [-10, 0],
    delay: stagger(120, { start: 500 }),
    duration: 700,
    ease: EASE.back,
    onComplete: settle(pins),
  });
  animate(qsa("[data-halo]", svg), {
    r: [7, 18],
    opacity: [0.8, 0],
    loop: true,
    duration: 2400,
    delay: stagger(300),
    ease: EASE.sine,
  });
}
