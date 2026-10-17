/**
 * Langue et devise du visiteur, une seule regle pour toute l'app.
 *
 * Lancement France : tout le monde est en francais, paie en euros, au mois.
 * Le bouton FR/EN de la landing (cookie) ne change que la langue de la
 * landing. Pour relancer les US : remettre la detection par le navigateur
 * dans resolveLocale et le dollar dans currencyForLocale.
 *
 * Module pur (ni React ni Stripe) : importe aussi bien par les pages
 * serveur, la route de paiement que les composants client.
 */

export type Locale = "en" | "fr";
export type Currency = "usd" | "eur";

/** Cookie pose par le bouton FR/EN : le choix explicite du visiteur. */
export const LOCALE_COOKIE = "lang";

/** Premiere langue du header (celle que le navigateur prefere) : fr* → fr. */
export function localeFromAcceptLanguage(header: string | null): Locale {
  const first = header?.split(",")[0]?.trim().toLowerCase() ?? "";
  return first.startsWith("fr") ? "fr" : "en";
}

/**
 * Le bouton FR/EN l'emporte ; sinon francais pour tous, quelle que soit la
 * langue du telephone (lancement France). `acceptLanguage` reste en
 * parametre pour la relance US : localeFromAcceptLanguage(acceptLanguage).
 */
export function resolveLocale(
  cookie: string | undefined,
  acceptLanguage: string | null,
): Locale {
  if (cookie === "fr" || cookie === "en") return cookie;
  return "fr";
}

/** Euros pour tous pendant le lancement France, meme sur la landing EN. */
export function currencyForLocale(locale: Locale): Currency {
  return "eur";
}
