"use client";

import { useEffect, useState } from "react";
import {
  LOCALE_COOKIE,
  currencyForLocale,
  resolveLocale,
  type Currency,
} from "@/lib/locale";

/**
 * Devise a afficher dans les composants client, avec la meme regle que la
 * route de paiement (lib/locale.ts) : le prix affiche est celui facture.
 *
 * Demarre en euros (lancement France), puis relit apres montage :
 * lire cookie et langue du navigateur pendant le rendu casserait
 * l'hydratation.
 */
export function useCurrency(): Currency {
  const [currency, setCurrency] = useState<Currency>("eur");

  useEffect(() => {
    const cookie = document.cookie
      .split("; ")
      .find((c) => c.startsWith(`${LOCALE_COOKIE}=`))
      ?.slice(LOCALE_COOKIE.length + 1);
    const languages = navigator.languages?.join(",") || navigator.language;
    setCurrency(currencyForLocale(resolveLocale(cookie, languages)));
  }, []);

  return currency;
}
