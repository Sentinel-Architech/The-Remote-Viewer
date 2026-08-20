export const RATINGS = ["standard", "adult", "cannabis", "civic"] as const;
export type ContentRating = (typeof RATINGS)[number];

export const RATING_COPY: Record<ContentRating, string> = {
  standard: "Open feed",
  adult: "Adult · blurred until verified + follow (price optional)",
  cannabis: "Garden / cultivation live — allowed",
  civic: "Second Amendment education — allowed",
};

export const WATCH_MILES = 100;

export function isRating(v: string): v is ContentRating {
  return (RATINGS as readonly string[]).includes(v);
}

export function milesBetween(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 3958.8;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLng / 2);
  const h =
    s1 * s1 +
    Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * s2 * s2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function coarsen(n: number): number {
  return Math.round(n * 20) / 20;
}
