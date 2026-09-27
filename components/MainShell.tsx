"use client";

import { usePathname } from "next/navigation";
import { hasOwnHeader } from "@/lib/app-shell-routes";

/**
 * Le `<main>` global appliquait `mx-auto max-w-7xl px-4 py-8` à TOUTES les
 * pages — pensé pour la vitrine (marketing), pas pour les écrans plein
 * écran (studio, gabarits, galerie, réglages, tarifs) qui gèrent déjà leur
 * propre hauteur (`h-dvh`) et leur propre respiration.
 *
 * Trouvé le 30/08 en traçant pourquoi la carte du studio débordait
 * systématiquement de l'écran, quelle que soit la structure interne
 * corrigée : ce `py-8` (64px) s'additionnait TOUJOURS par-dessus, sur
 * toutes les pages à en-tête propre. C'était la vraie cause des
 * débordements corrigés au pansement plus tôt dans le projet.
 *
 * Même prédicat que SiteHeader/SiteFooter : les écrans à en-tête propre
 * reçoivent un `<main>` nu, les autres gardent le conteneur marketing.
 */
export default function MainShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // `/` reste nu, et c'est le studio qui s'y contraint lui-meme
  // (app/page.tsx). Le middleware sert la landing a cette meme adresse aux
  // visiteurs non connectes : poser la colonne ici l'aurait ecrasee dans
  // une bande de telephone, hero en deux colonnes compris. La landing ne
  // rend jamais le composant du studio, donc elle reste intacte.
  if (pathname === "/") {
    return <main>{children}</main>;
  }

  // Cadre de l'app sur ordinateur, cf. `maxWidth.app` dans tailwind.config.
  if (hasOwnHeader(pathname)) {
    return (
      <main className="mx-auto min-h-dvh w-full max-w-app">
        {children}
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
      {children}
    </main>
  );
}
