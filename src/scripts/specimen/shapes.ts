import { gauss, pick, rand, randomSide } from "@/scripts/specimen/random";

/**
 * Las tres formas del espécimen. Cada una reparte N partículas (posición xyz + color rgb)
 * sobre su figura. Son funciones puras sin three.js: el morph interpola entre estos buffers.
 */
export type Shape = { positions: Float32Array; colors: Float32Array };
type RGB = readonly [number, number, number];

const hex = (value: string): RGB => {
  const n = Number.parseInt(value.slice(1), 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
};

export const PALETTE = {
  hoja: hex("#4f9a5c"),
  hojaLuz: hex("#8fd19b"),
  selva: hex("#2f6b40"),
  achiote: hex("#f07a5c"),
  maca: hex("#e3b05c"),
  blanco: hex("#eef3ea"),
  tapa: hex("#c2412b"),
} as const;

function createShape(count: number, place: (i: number) => { p: [number, number, number]; c: RGB }): Shape {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const { p, c } = place(i);
    positions.set(p, i * 3);
    colors.set(c, i * 3);
  }
  return { positions, colors };
}

/* ───── 01 · La hoja (tradición) ───── */

export function leafShape(count: number): Shape {
  const BASE = -1.8;
  const LENGTH = 3.7;
  const TILT = -0.45;
  /** Ancho de la lámina a lo largo de la hoja (t de 0 a 1). */
  const width = (t: number) => 1.05 * Math.pow(Math.sin(Math.PI * t), 0.85) * (1 - 0.18 * t);

  return createShape(count, () => {
    let x: number;
    let y: number;
    let c: RGB;
    const k = Math.random();

    if (k < 0.06) {
      // pecíolo
      y = rand(-2.6, BASE);
      x = 0.02 * gauss();
      c = PALETTE.selva;
    } else if (k < 0.2) {
      // nervio central
      y = rand(BASE, 1.9);
      x = 0.015 * gauss();
      c = PALETTE.hojaLuz;
    } else if (k < 0.4) {
      // nervios laterales
      const t0 = (1 + Math.floor(Math.random() * 8)) / 9;
      const s = Math.random();
      x = randomSide() * s * width(Math.min(t0 + 0.07, 1)) * 0.92;
      y = BASE + t0 * LENGTH + s * 0.55;
      c = PALETTE.hojaLuz;
    } else if (k < 0.7) {
      // borde
      const t = Math.random();
      y = BASE + t * LENGTH;
      x = randomSide() * width(t) + 0.02 * gauss();
      c = PALETTE.hoja;
    } else {
      // lámina, con motas de achiote y maca
      const t = Math.random();
      y = BASE + t * LENGTH;
      x = (Math.random() * 2 - 1) * width(t) * 0.95;
      c = Math.random() < 0.12 ? PALETTE.achiote : Math.random() < 0.08 ? PALETTE.maca : PALETTE.hoja;
    }

    const z = 0.28 * x * x - 0.12 + 0.03 * gauss();
    const rx = x * Math.cos(TILT) - y * Math.sin(TILT);
    const ry = x * Math.sin(TILT) + y * Math.cos(TILT);
    return { p: [rx, ry, z], c };
  });
}

/* ───── 02 · La molécula (ciencia) ───── */

type AtomType = "C" | "O" | "N";
type Atom = { x: number; y: number; z: number; type: AtomType; ringCenter?: number };
type Bond = { a: number; b: number; double: boolean };

/** Tres anillos aromáticos fusionados con sustituyentes (O, N) fuera del plano. */
function buildMolecule(): { atoms: Atom[]; bonds: Bond[] } {
  const BOND = 0.62;
  const ringOffset = Math.sqrt(3) * BOND;
  const atoms: Atom[] = [];
  const indexByKey = new Map<string, number>();

  const addAtom = (x: number, y: number, z: number, type: AtomType): number => {
    const key = `${x.toFixed(2)},${y.toFixed(2)}`;
    const existing = indexByKey.get(key);
    if (existing !== undefined) return existing;
    indexByKey.set(key, atoms.length);
    atoms.push({ x, y, z, type });
    return atoms.length - 1;
  };

  for (const cx of [-ringOffset, 0, ringOffset]) {
    for (let k = 0; k < 6; k++) {
      const angle = Math.PI / 6 + (k * Math.PI) / 3;
      const index = addAtom(cx + BOND * Math.cos(angle), BOND * Math.sin(angle), 0, "C");
      atoms[index]!.ringCenter ??= cx;
    }
  }

  const bonds: Bond[] = [];
  for (let i = 0; i < atoms.length; i++) {
    for (let j = i + 1; j < atoms.length; j++) {
      const d = Math.hypot(atoms[i]!.x - atoms[j]!.x, atoms[i]!.y - atoms[j]!.y);
      if (Math.abs(d - BOND) < 0.05) bonds.push({ a: i, b: j, double: bonds.length % 2 === 0 });
    }
  }

  // sustituyentes: carbonilo, hidroxilos y una cadena con nitrógeno
  const degree = atoms.map(() => 0);
  for (const { a, b } of bonds) {
    degree[a]!++;
    degree[b]!++;
  }
  const outer = atoms
    .map((_, i) => i)
    .filter((i) => degree[i] === 2)
    .sort((i, j) => Math.atan2(atoms[i]!.y, atoms[i]!.x) - Math.atan2(atoms[j]!.y, atoms[j]!.x));
  const substituents: ReadonlyArray<readonly [AtomType, number]> = [
    ["O", 0], ["O", 0.2], ["N", 0.5], ["O", -0.3], ["C", 0.6], ["O", 0.1],
  ];

  outer
    .filter((_, k) => k % 2 === 0)
    .slice(0, substituents.length)
    .forEach((atomIndex, k) => {
      const atom = atoms[atomIndex]!;
      const [type, z] = substituents[k]!;
      const dx = atom.x - (atom.ringCenter ?? 0);
      const dy = atom.y;
      const length = Math.hypot(dx, dy) || 1;
      atoms.push({ x: atom.x + (dx / length) * BOND, y: atom.y + (dy / length) * BOND, z, type });
      bonds.push({ a: atomIndex, b: atoms.length - 1, double: type === "O" && k % 2 === 0 });
    });

  return { atoms, bonds };
}

export function moleculeShape(count: number): Shape {
  const { atoms, bonds } = buildMolecule();
  const SCALE = 1.12;
  const colorOf = (type: AtomType): RGB =>
    type === "O" ? PALETTE.achiote : type === "N" ? PALETTE.maca : PALETTE.blanco;

  return createShape(count, () => {
    let x: number;
    let y: number;
    let z: number;
    let c: RGB;

    if (Math.random() < 0.5) {
      // átomo: esfera llena
      const atom = pick(atoms);
      const radius = (atom.type === "C" ? 0.12 : 0.17) * Math.cbrt(Math.random());
      const u = Math.random() * Math.PI * 2;
      const v = Math.acos(2 * Math.random() - 1);
      x = atom.x + radius * Math.sin(v) * Math.cos(u);
      y = atom.y + radius * Math.sin(v) * Math.sin(u);
      z = atom.z + radius * Math.cos(v);
      c = colorOf(atom.type);
    } else {
      // enlace: segmento, desplazado si es doble
      const bond = pick(bonds);
      const a = atoms[bond.a]!;
      const b = atoms[bond.b]!;
      const s = rand(0.12, 0.88);
      x = a.x + (b.x - a.x) * s;
      y = a.y + (b.y - a.y) * s;
      z = a.z + (b.z - a.z) * s;
      if (bond.double && Math.random() < 0.5) {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const length = Math.hypot(dx, dy);
        x += (-dy / length) * 0.09;
        y += (dx / length) * 0.09;
      }
      x += 0.012 * gauss();
      y += 0.012 * gauss();
      c = Math.random() < 0.85 ? PALETTE.hojaLuz : PALETTE.hoja;
    }

    return { p: [x * SCALE, y * SCALE, z * SCALE], c };
  });
}

/* ───── 03 · El frasco (producto) ───── */

export function jarShape(count: number): Shape {
  const BODY_RADIUS = 1.05;
  const BODY_BOTTOM = -1.9;
  const BODY_TOP = 0.95;
  const LID_RADIUS = 1.0;
  const LID_TOP = 1.6;
  const SCALE = 0.86;

  return createShape(count, () => {
    let x: number;
    let y: number;
    let z: number;
    let c: RGB;
    const k = Math.random();
    const theta = Math.random() * Math.PI * 2;

    if (k < 0.62) {
      // cuerpo, con hombro redondeado y etiqueta clara
      y = rand(BODY_BOTTOM, BODY_TOP);
      const shoulder =
        y > BODY_TOP - 0.15 ? Math.sqrt(Math.max(0, 1 - ((y - (BODY_TOP - 0.15)) / 0.17) ** 2)) : 1;
      const r = BODY_RADIUS * (0.93 + 0.07 * shoulder);
      x = r * Math.cos(theta);
      z = r * Math.sin(theta);
      const onLabel = y > -1.05 && y < 0.25;
      c = onLabel ? (Math.abs(y + 0.38) < 0.12 ? PALETTE.hojaLuz : PALETTE.blanco) : PALETTE.hoja;
    } else if (k < 0.72) {
      // base
      const r = BODY_RADIUS * Math.sqrt(Math.random());
      y = BODY_BOTTOM;
      x = r * Math.cos(theta);
      z = r * Math.sin(theta);
      c = PALETTE.selva;
    } else if (k < 0.92) {
      // tapa
      y = rand(BODY_TOP + 0.1, LID_TOP);
      x = LID_RADIUS * Math.cos(theta);
      z = LID_RADIUS * Math.sin(theta);
      c = PALETTE.tapa;
    } else {
      // cara superior de la tapa
      const r = LID_RADIUS * Math.sqrt(Math.random());
      y = LID_TOP;
      x = r * Math.cos(theta);
      z = r * Math.sin(theta);
      c = PALETTE.achiote;
    }

    return { p: [x * SCALE, y * SCALE + 0.05, z * SCALE], c };
  });
}
