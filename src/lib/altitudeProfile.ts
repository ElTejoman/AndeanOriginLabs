import type { Herb, Region } from "@/lib/herbs";

/**
 * Geometría del perfil de altitud (sección "Origen"), calculada en build.
 * Coordenadas en el sistema del viewBox 0 0 1000 380.
 */
export const VIEWBOX = { width: 1000, height: 380 } as const;

const PLOT = { left: 70, right: 980, bottom: 330, top: 40 } as const;
const MAX_ALTITUDE = 5000;
const GRID_STEP = 1000;

/** Silueta del terreno: [x, altitud] desde el llano amazónico hasta la puna. */
const TERRAIN: ReadonlyArray<readonly [number, number]> = [
  [PLOT.left, 150], [180, 200], [330, 420], [430, 900], [520, 1800],
  [600, 2700], [680, 3400], [760, 4000], [860, 4300], [PLOT.right, 4450],
];

const ZONES: ReadonlyArray<{ label: string; x: number }> = [
  { label: "Selva baja", x: 130 },
  { label: "Selva alta", x: 390 },
  { label: "Valles interandinos", x: 560 },
  { label: "Puna", x: 840 },
];

/** Altura (y) de la etiqueta de cada hierba, para que no se pisen entre sí. */
const LABEL_Y: Record<string, number> = {
  "chuchuhuasi": 215, "achiote": 150, "sangre-de-grado": 215, "una-de-gato": 110,
  "matico": 190, "muna": 110, "hercampuri": 70, "maca": 50,
};
const DEFAULT_LABEL_Y = 110;

const yAt = (altitude: number): number => PLOT.bottom - (altitude / MAX_ALTITUDE) * (PLOT.bottom - PLOT.top);

/** x sobre la silueta del terreno para una altitud dada (interpolación lineal por tramos). */
function xAt(altitude: number): number {
  for (let i = 1; i < TERRAIN.length; i++) {
    const [xa, aa] = TERRAIN[i - 1]!;
    const [xb, ab] = TERRAIN[i]!;
    if (altitude >= aa && altitude <= ab) return xa + ((altitude - aa) / (ab - aa)) * (xb - xa);
  }
  return PLOT.left;
}

export type ProfilePin = {
  herb: Herb;
  region: Region;
  x: number;
  y: number;
  labelY: number;
};

export type AltitudeProfile = {
  gridLines: Array<{ altitude: number; y: number }>;
  plot: typeof PLOT;
  ridgePath: string;
  terrainPath: string;
  zones: Array<{ label: string; x: number; y: number }>;
  pins: ProfilePin[];
};

export function buildAltitudeProfile(herbs: Herb[]): AltitudeProfile {
  const ridgePath = TERRAIN.map(([x, a], i) => `${i ? "L" : "M"}${x} ${yAt(a)}`).join(" ");

  const gridLines = [];
  for (let altitude = 0; altitude <= MAX_ALTITUDE; altitude += GRID_STEP) gridLines.push({ altitude, y: yAt(altitude) });

  return {
    gridLines,
    plot: PLOT,
    ridgePath,
    terrainPath: `${ridgePath} L${PLOT.right} ${PLOT.bottom} L${PLOT.left} ${PLOT.bottom}Z`,
    zones: ZONES.map((zone) => ({ ...zone, y: PLOT.bottom + 30 })),
    pins: herbs.map((herb) => ({
      herb,
      region: herb.region,
      x: xAt(herb.altitude.typical),
      y: yAt(herb.altitude.typical),
      labelY: LABEL_Y[herb.id] ?? DEFAULT_LABEL_Y,
    })),
  };
}
