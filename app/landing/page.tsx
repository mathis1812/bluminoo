import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import { createServiceClient } from "@/lib/supabase/service";
import LandingView from "./LandingView";
import { LANDING_COPY, LOCALE_COOKIE, resolveLocale } from "./copy";

/**
 * Coquille serveur de la landing : elle lit `Accept-Language` pour servir
 * la version FR aux telephones regles en francais, la version US sinon —
 * sauf si le visiteur a choisi sa langue avec le bouton FR/EN (cookie).
 * Lire les headers rend la page dynamique — voulu, la reponse depend du
 * visiteur.
 */

const SITE_TITLE = "Bluminoo Studio";

function currentLocale() {
  return resolveLocale(
    cookies().get(LOCALE_COOKIE)?.value,
    headers().get("accept-language"),
  );
}

// `openGraph` et `twitter` d'une page REMPLACENT ceux du layout au lieu de
// s'y fusionner : on redonne donc tous les champs, pas seulement la
// description traduite.
export function generateMetadata(): Metadata {
  const { meta } = LANDING_COPY[currentLocale()];
  return {
    description: meta.description,
    openGraph: {
      title: SITE_TITLE,
      description: meta.description,
      url: "/",
      siteName: SITE_TITLE,
      locale: meta.ogLocale,
      type: "website",
    },
    twitter: {
      card: "summary",
      title: SITE_TITLE,
      description: meta.description,
    },
  };
}

// Sous ce seuil, le compteur fait plus de tort que de bien : on le cache.
const MIN_LIVE_COUNT = 50;

/**
 * Vrai nombre de rendus des dernieres 24 h — jamais un chiffre invente :
 * une preuve sociale fausse est une pratique commerciale trompeuse
 * (art. L121-2 du Code de la consommation). `null` = badge masque.
 */
async function liveGenerationCount(): Promise<number | null> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  // ponytail: count sans index sur created_at seul, ajouter l'index si la table grossit
  const { count, error } = await createServiceClient()
    .from("gallery_entries")
    .select("id", { count: "exact", head: true })
    .gte("created_at", since);
  if (error || count === null || count < MIN_LIVE_COUNT) return null;
  return count;
}

export default async function LandingPage() {
  return (
    <LandingView
      locale={currentLocale()}
      liveCount={await liveGenerationCount()}
    />
  );
}
