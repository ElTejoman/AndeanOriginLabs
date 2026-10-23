import { animate, utils } from "animejs";
import { mustQs, prefersReducedMotion, qsa } from "@/scripts/core/dom";
import { isMotionEnabled } from "@/scripts/motion/motion";

/**
 * Controlador del espécimen del hero: conecta los botones de etapa, la nota y la barra de progreso
 * con la escena 3D. three.js se carga aparte (import dinámico) para no frenar el resto de la página.
 */
export async function initSpecimen(root: HTMLElement): Promise<void> {
  const stage = mustQs("[data-specimen-stage]", root);
  const buttons = qsa<HTMLButtonElement>("[data-stage-button]", root);
  const notes = qsa("[data-stage-note]", root);
  const progressBars = buttons.map((button) => mustQs("[data-stage-progress]", button));
  const reducedMotion = prefersReducedMotion();

  let scene: import("@/scripts/specimen/SpecimenScene").SpecimenScene;
  let cycleMs = 0;

  const showStage = (index: number): void => {
    buttons.forEach((button, i) => button.setAttribute("aria-pressed", String(i === index)));
    notes.forEach((note, i) => (note.hidden = i !== index));
    if (isMotionEnabled()) runProgress(index);
  };

  const runProgress = (index: number): void => {
    utils.remove(progressBars);
    progressBars.forEach((bar) => (bar.style.width = "0"));
    animate(progressBars[index]!, { width: ["0%", "100%"], duration: cycleMs, ease: "linear" });
  };

  try {
    const { SpecimenScene, HOLD_MS, MORPH_MS } = await import("@/scripts/specimen/SpecimenScene");
    cycleMs = HOLD_MS + MORPH_MS;
    scene = new SpecimenScene({ stage, pointerArea: root, reducedMotion, onStageChange: showStage });
  } catch {
    // Sin WebGL: se muestra el frasco dibujado con CSS.
    mustQs("[data-specimen-fallback]", root).hidden = false;
    return;
  }

  buttons.forEach((button, index) => button.addEventListener("click", () => scene.goTo(index)));
  showStage(scene.currentStage);
}
