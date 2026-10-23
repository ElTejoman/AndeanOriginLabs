import { animate, createTimeline, stagger } from "animejs";
import { formatNumber } from "@/lib/format";
import { mustQs, qsa } from "@/scripts/core/dom";
import { EASE, isMotionEnabled, settle } from "@/scripts/motion/motion";
import { splitText } from "@/scripts/motion/splitText";

/**
 * Entrada del hero: el titular cae letra por letra, luego aparecen la bajada, los botones
 * y los datos, mientras los contadores suben desde cero.
 */
export function playHeroIntro(root: HTMLElement): void {
  if (!isMotionEnabled()) return;

  const title = mustQs("[data-hero-title]", root);
  const chars = splitText(title);
  title.classList.add("is-split");
  const introBlocks = qsa("[data-intro]", root);

  createTimeline({ defaults: { ease: EASE.expo }, onComplete: settle([title, ...introBlocks]) })
    .add(chars, {
      translateY: ["0.6em", 0],
      opacity: [0, 1],
      rotate: [6, 0],
      duration: 1100,
      delay: stagger(22),
    })
    .add(
      introBlocks,
      { translateY: [24, 0], opacity: [0, 1], duration: 900, delay: stagger(110) },
      "-=800",
    );

  for (const counter of qsa("[data-count]", root)) countUp(counter);
}

function countUp(el: HTMLElement): void {
  const end = Number(el.dataset["count"]);
  const state = { value: 0 };
  el.textContent = formatNumber(0);
  animate(state, {
    value: end,
    duration: 1800,
    delay: 500,
    ease: EASE.quart,
    onUpdate: () => {
      el.textContent = formatNumber(Math.round(state.value));
    },
  });
}
