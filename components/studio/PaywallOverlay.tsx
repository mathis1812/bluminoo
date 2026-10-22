"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import RechargeSheet from "@/components/RechargeSheet";

/**
 * Écran du paywall, commun au studio et aux templates : la photo du visiteur
 * floutée, comme si sa scène était déjà prête, et pour seul élément le
 * bouton au carré rouge du snap photo. Pas de texte : l'envie d'envoyer le
 * snap suffit, et l'appui fait monter les tarifs par-dessus le studio
 * (même feuille que la pastille de crédits) sans quitter la page.
 *
 * `previewUrl` est l'aperçu local (blob) de la photo déposée : il ne quitte
 * jamais le navigateur, le paywall garantit qu'aucune photo d'un visiteur
 * non abonné n'est envoyée.
 */
export default function PaywallOverlay({ previewUrl }: { previewUrl: string }) {
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={previewUrl}
        alt=""
        aria-hidden
        className="h-full w-full scale-110 object-cover blur-xl"
      />
      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
        <button
          type="button"
          onClick={() => setIsPricingOpen(true)}
          className="flex h-12 items-center justify-center gap-2.5 rounded-3xl bg-snapred px-6 text-[16px] font-semibold text-white transition active:opacity-90"
        >
          <span aria-hidden className="h-3.5 w-3.5 rounded-[3px] bg-white" />
          Envoyer le snap
        </button>
      </div>

      {/* Portail vers <body> : rendue dans la carte, la feuille héritait de
          son contexte d'empilement et passait sous l'en-tête du site. */}
      {isPricingOpen &&
        createPortal(
          <RechargeSheet isOpen onClose={() => setIsPricingOpen(false)} />,
          document.body,
        )}
    </div>
  );
}
