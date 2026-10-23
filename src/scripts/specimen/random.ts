/** Aleatorios para la nube de partículas. */

export const rand = (min: number, max: number): number => min + Math.random() * (max - min);

/** Aproximación barata a una gaussiana centrada en 0 (suma de 3 uniformes). */
export const gauss = (): number => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

export const randomSide = (): -1 | 1 => (Math.random() < 0.5 ? -1 : 1);

export const pick = <T>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)]!;
