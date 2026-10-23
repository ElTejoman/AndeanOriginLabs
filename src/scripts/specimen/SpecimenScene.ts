import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  ColorManagement,
  LinearSRGBColorSpace,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  WebGLRenderer,
} from "three";
import { gauss, rand } from "@/scripts/specimen/random";
import { jarShape, leafShape, moleculeShape, type Shape } from "@/scripts/specimen/shapes";

/** Tiempos del ciclo automático hoja → molécula → frasco (ms). */
export const HOLD_MS = 3800;
export const MORPH_MS = 1900;
export const STAGE_COUNT = 3;

const DUST_COUNT = 260;
const SMALL_SCREEN = 700;
const NARROW_CANVAS = 480;

/**
 * Los colores se definen en sRGB y se envían tal cual a la pantalla, como en el diseño original
 * (three r128). Sin esto, la gestión de color moderna de three cambiaría la mezcla aditiva.
 */
ColorManagement.enabled = false;

const easeInOutCubic = (t: number): number => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

type Options = {
  /** Contenedor del canvas: define el tamaño del render. */
  stage: HTMLElement;
  /** Zona que reacciona al puntero (inclina la figura). */
  pointerArea: HTMLElement;
  reducedMotion: boolean;
  onStageChange: (stage: number) => void;
};

/**
 * Nube de partículas que se transforma entre tres figuras.
 * Lanza un error si WebGL no está disponible: quien la crea debe mostrar el respaldo.
 */
export class SpecimenScene {
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera = new PerspectiveCamera(38, 1, 0.1, 100);
  private readonly geometry = new BufferGeometry();
  private readonly points: Points;
  private readonly dust: Points;

  private readonly count: number;
  private readonly shapes: Shape[];
  private readonly scatter: Float32Array;
  private readonly phase: Float32Array;
  private readonly positions: Float32Array;
  private readonly colors: Float32Array;

  private from = 0;
  private to = 0;
  private morphStart = 0;
  private lastSwitch = performance.now();
  private readonly autoPlay: boolean;

  private pointer = { x: 0, y: 0 };
  private tilt = { x: 0, y: 0 };
  private spin = 0;

  private visible = true;
  private running = false;

  constructor(private readonly options: Options) {
    this.renderer = new WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.outputColorSpace = LinearSRGBColorSpace;
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.domElement.classList.add("specimen__canvas");
    options.stage.prepend(this.renderer.domElement);

    const small = innerWidth < SMALL_SCREEN;
    this.count = small ? 1700 : 2800;
    this.autoPlay = !options.reducedMotion;

    this.shapes = [leafShape(this.count), moleculeShape(this.count), jarShape(this.count)];
    this.scatter = Float32Array.from({ length: this.count * 3 }, () => gauss() * 1.4);
    this.phase = Float32Array.from({ length: this.count }, () => Math.random() * Math.PI * 2);
    this.positions = new Float32Array(this.shapes[0]!.positions);
    this.colors = new Float32Array(this.shapes[0]!.colors);

    this.geometry.setAttribute("position", new BufferAttribute(this.positions, 3));
    this.geometry.setAttribute("color", new BufferAttribute(this.colors, 3));
    this.points = new Points(
      this.geometry,
      new PointsMaterial({
        size: small ? 0.075 : 0.062,
        map: createSpriteTexture(),
        vertexColors: true,
        transparent: true,
        depthWrite: false,
        blending: AdditiveBlending,
        opacity: 0.95,
      }),
    );
    this.points.position.y = 0.3;
    this.scene.add(this.points);

    this.dust = createDust();
    this.scene.add(this.dust);

    this.camera.position.set(0, 0, 8.4);
    this.bindEvents();
    this.resize();
    this.start();
  }

  get currentStage(): number {
    return this.to;
  }

  /** Cambia de figura. Las interacciones del usuario reinician la cuenta del ciclo automático. */
  goTo(stage: number, now = performance.now()): void {
    this.lastSwitch = now;
    if (stage === this.to) return;
    this.from = this.to;
    this.to = stage;
    this.morphStart = this.options.reducedMotion ? -Infinity : now;
    this.options.onStageChange(stage);
    this.start();
  }

  private bindEvents(): void {
    const { stage, pointerArea } = this.options;

    new ResizeObserver(() => this.resize()).observe(stage);

    pointerArea.addEventListener("pointermove", (event) => {
      const rect = pointerArea.getBoundingClientRect();
      this.pointer.x = (event.clientX - rect.left) / rect.width - 0.5;
      this.pointer.y = (event.clientY - rect.top) / rect.height - 0.5;
    });
    pointerArea.addEventListener("pointerleave", () => {
      this.pointer.x = 0;
      this.pointer.y = 0;
    });

    // Fuera de pantalla no se dibuja.
    new IntersectionObserver(([entry]) => {
      this.visible = entry?.isIntersecting ?? true;
      if (this.visible) this.start();
    }).observe(pointerArea);
  }

  private resize(): void {
    const { clientWidth: width, clientHeight: height } = this.options.stage;
    if (!width || !height) return;
    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.position.z = width < NARROW_CANVAS ? 9.6 : 8.4;
    this.camera.updateProjectionMatrix();
    if (!this.running) this.renderer.render(this.scene, this.camera);
  }

  /** Arranca el bucle de render si no está corriendo (evita bucles duplicados). */
  private start(): void {
    if (this.running) return;
    this.running = true;
    requestAnimationFrame(this.tick);
  }

  private readonly tick = (now: number): void => {
    if (this.autoPlay && now - this.lastSwitch > HOLD_MS + MORPH_MS) {
      this.goTo((this.to + 1) % STAGE_COUNT, now);
    }

    this.updateParticles(now);
    this.updateRotation(now);
    this.renderer.render(this.scene, this.camera);

    // Con movimiento reducido se dibuja un solo cuadro por cambio de figura.
    if (this.visible && !this.options.reducedMotion) {
      requestAnimationFrame(this.tick);
    } else {
      this.running = false;
    }
  };

  private updateParticles(now: number): void {
    const reduced = this.options.reducedMotion;
    const progress = Math.min(1, Math.max(0, (now - this.morphStart) / MORPH_MS));
    const eased = easeInOutCubic(progress);
    const burst = Math.sin(Math.PI * eased);
    const a = this.shapes[this.from]!;
    const b = this.shapes[this.to]!;
    const time = now * 0.001;
    const { positions, colors, scatter, phase } = this;

    for (let i = 0; i < this.count; i++) {
      const j = i * 3;
      const wobble = reduced ? 0 : 0.025 * Math.sin(time * 1.4 + phase[i]!);
      for (let axis = 0; axis < 3; axis++) {
        const from = a.positions[j + axis]!;
        const to = b.positions[j + axis]!;
        positions[j + axis] = from + (to - from) * eased + scatter[j + axis]! * burst + (axis < 2 ? wobble : 0);
        colors[j + axis] = a.colors[j + axis]! + (b.colors[j + axis]! - a.colors[j + axis]!) * eased;
      }
    }

    this.geometry.attributes["position"]!.needsUpdate = true;
    this.geometry.attributes["color"]!.needsUpdate = true;
  }

  private updateRotation(now: number): void {
    const time = now * 0.001;
    this.tilt.x += (this.pointer.y * 0.5 - this.tilt.x) * 0.05;
    this.tilt.y += (this.pointer.x * 0.8 - this.tilt.y) * 0.05;
    this.spin += this.to === 0 ? 0.0035 : 0.006;

    const baseTilt = this.to === 1 ? 0.25 : 0.08;
    this.points.rotation.set(this.tilt.x + baseTilt, Math.sin(this.spin) * 0.9 + this.tilt.y, 0);
    this.dust.rotation.y = time * 0.02;
    this.dust.position.y = Math.sin(time * 0.3) * 0.15;
  }
}

/** Punto suave: degradado radial blanco que se tiñe con el color de cada partícula. */
function createSpriteTexture(): CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const ctx = canvas.getContext("2d")!;
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(0.35, "rgba(255,255,255,.85)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  return new CanvasTexture(canvas);
}

/** Esporas que flotan lentamente alrededor del espécimen. */
function createDust(): Points {
  const positions = new Float32Array(DUST_COUNT * 3);
  for (let i = 0; i < DUST_COUNT; i++) {
    positions.set([rand(-6, 6), rand(-4, 4), rand(-4, 1)], i * 3);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  return new Points(
    geometry,
    new PointsMaterial({ size: 0.03, color: 0x8fd19b, transparent: true, opacity: 0.35, depthWrite: false }),
  );
}
