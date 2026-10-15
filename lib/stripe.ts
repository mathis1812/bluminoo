import Stripe from "stripe";
import type { Currency } from "@/lib/locale";

// Toute valeur lue depuis l'environnement est nettoyée : un caractère invisible
// collé par erreur (BOM, espace, retour ligne) rend la clé invalide, et Stripe
// échoue alors sur une « erreur de connexion » impossible à diagnostiquer.
// Le BOM comptant comme un espace en JS, `.trim()` le supprime également.
export function envValue(name: string): string {
  return (process.env[name] ?? "").trim();
}

export const stripe = new Stripe(
  envValue("STRIPE_SECRET_KEY") || "sk_placeholder_missing_key",
  { apiVersion: "2026-07-29.dahlia" },
);

// Le SDK Stripe accepte silencieusement une clé absente/placeholder à la
// construction ; chaque route doit vérifier explicitement avant d'appeler
// l'API, pour renvoyer le même message clair que les autres clés (kie.ai)
// plutôt qu'une erreur Stripe "Invalid API Key" moins lisible.
export function isStripeConfigured(): boolean {
  return envValue("STRIPE_SECRET_KEY").length > 0;
}

/**
 * Structure relevée le 29/08 sur `GET /api/billing/catalogue` du produit de
 * référence (prix Stripe réels, pas une estimation) : trois paliers
 * d'abonnement hebdomadaire — Lite/Pro/Max — plus trois packs de crédits à
 * l'unité, sans rapport avec l'ancienne grille mensuelle/annuelle
 * Starter/Essential/Ultimate qu'ils remplacent.
 *
 * Chaque palier débloque des fonctions différentes : Lite s'arrête au 1K
 * sans vidéo ni Red Snap, Pro monte au 2K avec vidéo et Red Snap, Max
 * ajoute le 4K. Voir `lib/generation-tiers.ts`, qui porte ces règles.
 *
 * Une version antérieure de ce commentaire affirmait l'inverse (« les trois
 * paliers débloquent les mêmes fonctions ») sur la foi d'une comparaison
 * faussée : les boutons Lite et Pro étaient `disabled` sur le compte
 * observé, donc les clics ne changeaient jamais la sélection.
 *
 * Pas de repli vers l'ancienne grille EUR mensuelle/annuelle : contrairement
 * à la bascule EUR→USD (même produit, autre devise), c'est ici toute la
 * structure qui change. Le seul abonné existant est un compte de test de
 * l'auteur.
 */
export type PlanId = "lite" | "pro" | "max";
export type ImageResolution = "1K" | "2K" | "4K";

/**
 * Rythme de facturation : la France teste le mensuel (9,99 / 19,99 / 39,99 €)
 * pendant que les US restent en hebdo. Meme prix par credit dans les deux
 * cas : le mensuel donne 2x les credits hebdo pour 2x le prix.
 */
export type Billing = "week" | "month";

export function billingFor(currency: Currency): Billing {
  return currency === "eur" ? "month" : "week";
}

type Offer = { priceId: string; price: number; credits: number };

/**
 * `week` : prix hebdo en dollars, avec une `currency_options` EUR (cf.
 * formatPrice). `month` : prix mensuels distincts dans Stripe — l'intervalle
 * d'un prix ne se change pas, il faut un prix par rythme.
 */
export const PLANS: Record<
  PlanId,
  { name: string; imageResolution: ImageResolution } & Record<Billing, Offer>
> = {
  lite: {
    name: "Lite",
    imageResolution: "1K",
    week: { priceId: envValue("STRIPE_PRICE_LITE"), price: 4.99, credits: 1000 },
    month: { priceId: envValue("STRIPE_PRICE_LITE_MONTHLY"), price: 9.99, credits: 2000 },
  },
  pro: {
    name: "Pro",
    imageResolution: "2K",
    week: { priceId: envValue("STRIPE_PRICE_PRO"), price: 9.99, credits: 2250 },
    month: { priceId: envValue("STRIPE_PRICE_PRO_MONTHLY"), price: 19.99, credits: 4500 },
  },
  max: {
    name: "Max",
    imageResolution: "4K",
    week: { priceId: envValue("STRIPE_PRICE_MAX"), price: 19.99, credits: 5000 },
    month: { priceId: envValue("STRIPE_PRICE_MAX_MONTHLY"), price: 39.99, credits: 10000 },
  },
};

/**
 * Packs de crédits à l'unité — paiement unique, sans abonnement, sans
 * expiration. N'accordent aucune fonction (Red Snap, résolution) : ce sont
 * des crédits, pas un palier. Un client sans abonnement qui en achète un
 * reste sur la résolution et les droits de son statut d'origine.
 */
export type TopupId = "small" | "medium" | "large";

export const TOPUPS: Record<
  TopupId,
  { priceId: string; price: number; credits: number }
> = {
  small: {
    priceId: envValue("STRIPE_PRICE_TOPUP_SMALL"),
    price: 7.99,
    credits: 1000,
  },
  medium: {
    priceId: envValue("STRIPE_PRICE_TOPUP_MEDIUM"),
    price: 14.99,
    credits: 2000,
  },
  large: {
    priceId: envValue("STRIPE_PRICE_TOPUP_LARGE"),
    price: 29.99,
    credits: 4500,
  },
};

/** « $9.99 » pour les visiteurs US, « 9,99 € » (TTC) pour les visiteurs FR. */
export function formatPrice(amount: number, currency: Currency = "usd"): string {
  return currency === "eur"
    ? `${amount.toFixed(2).replace(".", ",")} €`
    : `$${amount.toFixed(2)}`;
}

export function priceIdFor(planId: PlanId, billing: Billing): string {
  return PLANS[planId][billing].priceId;
}

export function creditsFor(planId: PlanId, billing: Billing): number {
  return PLANS[planId][billing].credits;
}

/** Formule et rythme d'un prix Stripe d'abonnement, hebdo ou mensuel. */
export function resolveSubscriptionPrice(
  priceId: string | undefined,
): { planId: PlanId; billing: Billing } | null {
  if (!priceId) return null;
  for (const planId of Object.keys(PLANS) as PlanId[]) {
    for (const billing of ["week", "month"] as const) {
      if (PLANS[planId][billing].priceId === priceId) return { planId, billing };
    }
  }
  return null;
}

export function resolveTopupPriceId(
  priceId: string | undefined,
): TopupId | null {
  if (!priceId) return null;
  for (const [id, pack] of Object.entries(TOPUPS) as [
    TopupId,
    (typeof TOPUPS)[TopupId],
  ][]) {
    if (pack.priceId === priceId) return id;
  }
  return null;
}
