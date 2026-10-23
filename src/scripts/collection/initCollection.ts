import { animate, stagger } from "animejs";
import { mustQs, prefersReducedMotion, qsa } from "@/scripts/core/dom";
import { emit, on } from "@/scripts/core/events";
import { EASE, isMotionEnabled, settle } from "@/scripts/motion/motion";

export const ALL_REGIONS = "todas";

/**
 * Colección de hierbas: filtro por región, tarjetas y ficha de detalle.
 * Todo el contenido ya viene renderizado en el HTML; aquí solo se cambia qué se muestra.
 */
export function initCollection(root: HTMLElement): void {
  const filterButtons = qsa<HTMLButtonElement>("[data-filter]", root);
  const grid = mustQs("[data-herb-grid]", root);
  const cards = qsa<HTMLButtonElement>("[data-herb-card]", grid);
  const details = qsa("[data-herb-detail]", root);
  const regionOf = new Map(cards.map((card) => [card.dataset["herbCard"]!, card.dataset["region"]!]));

  let filter = ALL_REGIONS;

  const setFilter = (value: string): void => {
    filter = value;
    filterButtons.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset["filter"] === value)));
    const visible = cards.filter((card) => {
      const show = value === ALL_REGIONS || card.dataset["region"] === value;
      card.hidden = !show;
      return show;
    });
    if (isMotionEnabled()) {
      animate(visible, {
        translateY: [20, 0],
        opacity: [0, 1],
        delay: stagger(50),
        duration: 600,
        ease: EASE.expo,
        onComplete: settle([grid]),
      });
    }
  };

  const select = (id: string, scroll: boolean): void => {
    const detail = details.find((d) => d.dataset["herbDetail"] === id);
    if (!detail) return;

    if (filter !== ALL_REGIONS && regionOf.get(id) !== filter) setFilter(ALL_REGIONS);
    cards.forEach((card) => card.setAttribute("aria-current", String(card.dataset["herbCard"] === id)));
    details.forEach((d) => (d.hidden = d !== detail));

    if (isMotionEnabled()) {
      animate(qsa("[data-detail-part]", detail), {
        translateY: [16, 0],
        opacity: [0, 1],
        delay: stagger(70),
        duration: 700,
        ease: EASE.expo,
        onComplete: settle(),
      });
    }

    if (scroll) {
      detail.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
      mustQs("h3", detail).focus({ preventScroll: true });
    }
  };

  filterButtons.forEach((button) => button.addEventListener("click", () => setFilter(button.dataset["filter"]!)));
  cards.forEach((card) => card.addEventListener("click", () => select(card.dataset["herbCard"]!, true)));

  root.addEventListener("click", (event) => {
    const reserve = (event.target as Element).closest<HTMLElement>("[data-reserve]");
    if (reserve) emit("herb:reserve", { id: reserve.dataset["reserve"]! });
  });

  on("herb:select", ({ id, scroll }) => select(id, scroll));
}
