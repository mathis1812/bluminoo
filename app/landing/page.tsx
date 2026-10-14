import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
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

export default function LandingPage() {
  return <LandingView locale={currentLocale()} />;
}
