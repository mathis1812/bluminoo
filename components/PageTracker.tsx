"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { trackPageView } from "@/lib/analytics";

/**
 * Une page vue par changement de chemin, sur tout le site. Monté une fois
 * par le layout ; la landing n'envoie donc plus sa propre page vue.
 */
export default function PageTracker() {
  const pathname = usePathname();

  useEffect(() => {
    trackPageView();
  }, [pathname]);

  return null;
}
