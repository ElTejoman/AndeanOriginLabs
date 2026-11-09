/**
 * Geometría del perfil de origen (sección "Origen"), calculada en build.
 * Es un esquema, no un mapa a escala: un terreno que sube de la Amazonía a los Andes,
 * con un punto por zona de abastecimiento, repartidos en el orden del dossier.
 * Coordenadas en el sistema del viewBox 0 0 1000 340.
 */
export const VIEWBOX = { width: 1000, height: 340 } as const;

const PLOT = { left: 40, right: 960, bottom: 290 } as const;
const FIRST_PIN_X = 150;
const LAST_PIN_X = 830;
const LABEL_GAP = 46;

/** Silueta del terreno: [x, y] del llano amazónico a la cordillera. */
const TERRAIN: ReadonlyArray<readonly [number, number]> = [
  [PLOT.left, 270], [180, 266], [320, 256], [430, 238], [530, 210],
  [620, 168], [700, 120], [780, 92], [870, 80], [PLOT.right, 74],
];

const REGIONS: ReadonlyArray<{ label: string; x: number }> = [
  { label: "Amazonía", x: 200 },
  { label: "Andes", x: 840 },
];

/** y sobre la silueta del terreno para un x dado (interpolación lineal por tramos). */
function yAt(x: number): number {
  for (let i = 1; i < TERRAIN.length; i++) {
    const [xa, ya] = TERRAIN[i - 1]!;
    const [xb, yb] = TERRAIN[i]!;
    if (x >= xa && x <= xb) return ya + ((x - xa) / (xb - xa)) * (yb - ya);
  }
  return TERRAIN.at(-1)![1];
}

export type ProfilePin = { place: string; count: number; x: number; y: number; labelY: number };

export type OriginProfile = {
  ridgePath: string;
  terrainPath: string;
  regions: Array<{ label: string; x: number; y: number }>;
  pins: ProfilePin[];
};

export function buildOriginProfile(places: ReadonlyArray<{ place: string; herbs: readonly string[] }>): OriginProfile {
  const ridgePath = TERRAIN.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
  const step = places.length > 1 ? (LAST_PIN_X - FIRST_PIN_X) / (places.length - 1) : 0;

  return {
    ridgePath,
    terrainPath: `${ridgePath} L${PLOT.right} ${PLOT.bottom} L${PLOT.left} ${PLOT.bottom}Z`,
    regions: REGIONS.map((region) => ({ ...region, y: PLOT.bottom + 32 })),
    pins: places.map(({ place, herbs }, i) => {
      const x = FIRST_PIN_X + i * step;
      const y = yAt(x);
      return { place, count: herbs.length, x, y, labelY: y - LABEL_GAP };
    }),
  };
}
