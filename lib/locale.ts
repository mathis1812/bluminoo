/**
 * Langue et devise du visiteur, une seule regle pour toute l'app : le bouton
 * FR/EN de la landing (cookie) l'emporte, sinon la langue preferee du
 * navigateur. Francais → euros, le reste → dollars.
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

/** Le bouton FR/EN l'emporte sur la langue du telephone ; valeur inconnue ignoree. */
export function resolveLocale(
  cookie: string | undefined,
  acceptLanguage: string | null,
): Locale {
  if (cookie === "fr" || cookie === "en") return cookie;
  return localeFromAcceptLanguage(acceptLanguage);
}

export function currencyForLocale(locale: Locale): Currency {
  return locale === "fr" ? "eur" : "usd";
}
