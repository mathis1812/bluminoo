/**
 * D'où vient un visiteur — TikTok, Instagram, un lien direct — pour le
 * retrouver au moment où il crée son compte.
 *
 * La source est notée à l'arrivée (paramètres `utm_*` du lien en bio, ou à
 * défaut le domaine référent), gardée dans le navigateur, puis jointe à
 * l'inscription : Supabase la range dans `auth.users.raw_user_meta_data`,
 * sans migration. Première source utile gagnante : un visiteur arrivé par
 * TikTok puis revenu en tapant l'adresse reste compté TikTok.
 *
 * Donnée envoyée par le navigateur, donc déclarative : bonne pour compter,
 * jamais pour décider d'un droit.
 */

export type Acquisition = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referrer?: string;
};

const STORAGE_KEY = "bluminoo:acquisition";
const MAX_LENGTH = 100;
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign"] as const;

/** Extrait la source d'une arrivée, ou `null` si elle n'apprend rien. */
export function parseAcquisition(
  search: string,
  referrer: string,
  ownHost: string,
): Acquisition | null {
  const params = new URLSearchParams(search);
  const found: Acquisition = {};

  for (const key of UTM_KEYS) {
    const value = params.get(key)?.trim().toLowerCase().slice(0, MAX_LENGTH);
    if (value) found[key] = value;
  }

  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    if (host && host !== ownHost.replace(/^www\./, "")) {
      found.referrer = host.slice(0, MAX_LENGTH);
    }
  } catch {
    // Référent vide ou illisible : arrivée directe, rien à noter.
  }

  return Object.keys(found).length > 0 ? found : null;
}

/** À l'arrivée sur le site : note la source si aucune ne l'est encore. */
export function captureAcquisition() {
  try {
    if (localStorage.getItem(STORAGE_KEY)) return;
    const found = parseAcquisition(
      location.search,
      document.referrer,
      location.hostname,
    );
    if (found) localStorage.setItem(STORAGE_KEY, JSON.stringify(found));
  } catch {
    // Stockage bloqué (navigation privée) : on perd la source, pas l'inscription.
  }
}

/** La source notée, à joindre aux données de l'inscription. */
export function readAcquisition(): Acquisition {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}
