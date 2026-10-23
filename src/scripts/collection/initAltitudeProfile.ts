import { animate, stagger } from "animejs";
import { mustQs, onFirstVisible, qsa } from "@/scripts/core/dom";
import { emit } from "@/scripts/core/events";
import { EASE, isMotionEnabled, settle } from "@/scripts/motion/motion";

/**
 * Perfil de altitud: cada pin abre la ficha de su hierba en la colección.
 * Al entrar en pantalla se dibuja la cresta, caen los pines y laten los halos.
 */
export function initAltitudeProfile(svg: SVGSVGElement): void {
  const openPin = (target: EventTarget | null): void => {
    const pin = (target as Element | null)?.closest<SVGGElement>("[data-pin]");
    if (pin) emit("herb:select", { id: pin.dataset["pin"]!, scroll: true });
  };

  svg.addEventListener("click", (event) => openPin(event.target));
  svg.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openPin(event.target);
  });

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
