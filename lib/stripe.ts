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

export const PLANS: Record<
  PlanId,
  {
    name: string;
    priceId: string;
    /**
     * Par semaine — ces abonnements se renouvellent chaque semaine, pas
     * chaque mois. Meme montant en dollars et en euros (TTC) : la devise
     * EUR est une `currency_options` du meme prix Stripe, cf. formatPrice.
     */
    price: number;
    creditsPerWeek: number;
    imageResolution: ImageResolution;
  }
> = {
  lite: {
    name: "Lite",
    priceId: envValue("STRIPE_PRICE_LITE"),
    price: 4.99,
    creditsPerWeek: 1000,
    imageResolution: "1K",
  },
  pro: {
    name: "Pro",
    priceId: envValue("STRIPE_PRICE_PRO"),
    price: 9.99,
    creditsPerWeek: 2250,
    imageResolution: "2K",
  },
  max: {
    name: "Max",
    priceId: envValue("STRIPE_PRICE_MAX"),
    price: 19.99,
    creditsPerWeek: 5000,
    imageResolution: "4K",
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

export function priceIdFor(planId: PlanId): string {
  return PLANS[planId].priceId;
}

export function creditsFor(planId: PlanId): number {
  return PLANS[planId].creditsPerWeek;
}

export function resolveSubscriptionPriceId(
  priceId: string | undefined,
): PlanId | null {
  if (!priceId) return null;
  for (const [id, plan] of Object.entries(PLANS) as [PlanId, (typeof PLANS)[PlanId]][]) {
    if (plan.priceId === priceId) return id;
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
