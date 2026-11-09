import { createTimeline, stagger, type Timeline } from "animejs";
import { mustQs, qsa } from "@/scripts/core/dom";
import { on } from "@/scripts/core/events";
import { isMotionEnabled } from "@/scripts/motion/motion";

/** Momento (ms) en que empieza cada paso; coinciden con EXTRACTION_STEPS. */
const STEP_AT = [0, 2400, 5600, 9000] as const;
/** Salida de la tolva, por donde caen los trozos de planta. */
const HOPPER_OUTLET = { x: 340, y: 130 };

type Scene = HTMLElement;

/**
 * Animación de la extracción. El SVG ya trae todo dibujado; al abrir su modal, la línea de tiempo lo esconde
 * y lo arma paso a paso, resaltando el texto de cada paso. Con movimiento reducido no hace nada: queda el esquema.
 */
export function initExtraction(scene: Scene): void {
  if (!isMotionEnabled()) return;

  const steps = qsa("[data-extraction-step]", scene);
  const highlight = (active: number | null) => steps.forEach((step, i) => step.classList.toggle("is-active", i === active));
  const timeline = buildTimeline(scene, highlight);
  const play = () => {
    highlight(0);
    timeline.restart();
  };

  const replay = mustQs("[data-extraction-replay]", scene);
  replay.hidden = false;
  replay.addEventListener("click", play);
  on("modal:open", ({ id }) => {
    if (document.getElementById(id)?.contains(scene)) play();
  });
  scene.closest("dialog")?.addEventListener("close", () => timeline.pause());
}

function buildTimeline(scene: Scene, highlight: (step: number | null) => void): Timeline {
  const timeline = createTimeline({ autoplay: false, onComplete: () => highlight(null) });
  addFragments(timeline, scene);
  addSolvent(timeline, scene);
  addInfusion(timeline, scene);
  addFiltering(timeline, scene);
  STEP_AT.forEach((at, i) => timeline.call(() => highlight(i), at));
  return timeline;
}

/** Paso 1: los trozos de planta salen de la tolva y caen al fondo del tanque. */
function addFragments(timeline: Timeline, scene: Scene): void {
  qsa<SVGGElement>("[data-fragment]", scene).forEach((fragment, i) => {
    const { x, y, fromX, fromY } = fragment.dataset;
    const [endX, endY] = [Number(x), Number(y)];
    const at = STEP_AT[0] + i * 150;
    timeline
      .set(fragment, { translateX: Number(fromX) - endX, translateY: Number(fromY) - endY, rotate: 0 }, 0)
      .add(fragment, { translateX: HOPPER_OUTLET.x - endX, translateY: HOPPER_OUTLET.y - endY, duration: 380, ease: "inOutSine" }, at)
      .add(fragment, { translateX: 0, translateY: 0, rotate: i % 2 ? 180 : -180, duration: 700, ease: "inQuad" }, at + 380);
  });
}

/** Paso 2: el agua y el alcohol bajan por la tubería y llenan el tanque. */
function addSolvent(timeline: Timeline, scene: Scene): void {
  const at = STEP_AT[1];
  const flowing = [mustQs("[data-flow='solvent']", scene), mustQs("[data-stream]", scene)];
  const liquid = mustQs("[data-tank-liquid]", scene);
  const bottles = qsa("[data-bottle-level]", scene);
  timeline
    .set(flowing, { opacity: 0 }, 0)
    .set(liquid, { translateY: 110 }, 0)
    .set(bottles, { translateY: 0 }, 0)
    .add(flowing, { opacity: 1, duration: 250 }, at)
    .add(flowing, { strokeDashoffset: [0, -168], duration: 3000, ease: "linear" }, at)
    .add(flowing, { opacity: 0, duration: 300 }, at + 2800)
    .add(liquid, { translateY: 0, duration: 2800, ease: "inOutSine" }, at + 300)
    .add(bottles, { translateY: 26, duration: 2800, ease: "inOutSine" }, at + 300);
}

/** Paso 3: pasa el tiempo y los compuestos de la planta tiñen el líquido. */
function addInfusion(timeline: Timeline, scene: Scene): void {
  const at = STEP_AT[2];
  const hand = mustQs("[data-clock-hand]", scene);
  const tint = mustQs("[data-tint]", scene);
  const compounds = qsa("[data-compound]", scene);
  const tintOpacity = Number(getComputedStyle(tint).opacity);
  timeline
    .set(hand, { rotate: 0 }, 0)
    .set(tint, { opacity: 0 }, 0)
    .set(compounds, { opacity: 0, translateY: 34 }, 0)
    .add(hand, { rotate: 720, duration: 3200, ease: "inOutSine" }, at)
    .add(tint, { opacity: tintOpacity, duration: 3000, ease: "inOutSine" }, at + 200)
    .add(compounds, { opacity: 1, translateY: 0, duration: 1400, delay: stagger(130), ease: "outSine" }, at + 200);
}

/** Paso 4: se abre la válvula, la bomba lleva el líquido al filtro y el extracto llena el frasco. */
function addFiltering(timeline: Timeline, scene: Scene): void {
  const at = STEP_AT[3];
  const valve = mustQs("[data-valve-handle]", scene);
  const flow = mustQs("[data-flow='outlet']", scene);
  const pump = mustQs("[data-pump]", scene);
  const liquid = mustQs("[data-tank-liquid]", scene);
  const flask = mustQs("[data-flask-liquid]", scene);
  const label = mustQs("[data-extract-label]", scene);
  timeline
    .set(valve, { scaleX: 1 }, 0)
    .set(flow, { opacity: 0 }, 0)
    .set(pump, { rotate: 0 }, 0)
    .set(flask, { translateY: 40 }, 0)
    .set(label, { opacity: 0 }, 0)
    .add(valve, { scaleX: 0.15, duration: 400, ease: "inOutSine" }, at)
    .add(flow, { opacity: 1, duration: 250 }, at + 300)
    .add(flow, { strokeDashoffset: [0, -252], duration: 3600, ease: "linear" }, at + 300)
    .add(flow, { opacity: 0, duration: 300 }, at + 3600)
    .add(pump, { rotate: 1080, duration: 3600, ease: "inOutSine" }, at + 300)
    .add(liquid, { translateY: 50, duration: 3000, ease: "inOutSine" }, at + 500)
    .add(flask, { translateY: 0, duration: 3000, ease: "inOutSine" }, at + 900)
    .add(label, { opacity: 1, duration: 500 }, at + 3600);
}
