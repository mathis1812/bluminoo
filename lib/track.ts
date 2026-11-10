/**
 * Fonctions pures de /api/track (testées dans __tests__/track.test.ts).
 * Reprises de ChartX (lib/track.ts), qui mesure déjà ses visites ainsi.
 */

export type Device = "mobile" | "tablet" | "desktop";

const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|monitor|curl|wget|python|node-fetch/i;
const MAX_PATH = 200;
const MAX_UTM = 100;

/** Chemin seul (sans query ni ancre), ou null si ce n'est pas un chemin du site. */
export function normalizePath(raw: unknown): string | null {
  if (typeof raw !== "string" || !raw.startsWith("/") || raw.startsWith("//")) return null;
  const path = raw.split(/[?#]/)[0];
  return path.length <= MAX_PATH ? path : null;
}

export function deviceOf(userAgent: string): Device {
  if (/ipad|tablet|(android(?!.*mobile))/i.test(userAgent)) return "tablet";
  if (/mobi|iphone|android/i.test(userAgent)) return "mobile";
  return "desktop";
}

/** Robots d'indexation, aperçus de liens et navigateurs sans tête : pas des visiteurs. */
export const isBot = (userAgent: string) => !userAgent || BOT.test(userAgent);

/** Valeur utm envoyée par le navigateur : minuscules, 100 caractères max, null si vide. */
export function cleanUtm(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const value = raw.trim().toLowerCase().slice(0, MAX_UTM);
  return value || null;
}
