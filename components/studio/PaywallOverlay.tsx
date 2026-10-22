"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import RechargeSheet from "@/components/RechargeSheet";

/**
 * Paywall, commun au studio et aux templates, en deux morceaux parce qu'ils
 * vivent à deux endroits : la photo floutée DANS la carte, et le bouton
 * Snap rouge JUSTE EN DESSOUS — rien n'est écrit sur l'image.
 */

/**
 * La photo du visiteur floutée, comme si sa scène était déjà prête.
 * `previewUrl` est l'aperçu local (blob) : il ne quitte jamais le
 * navigateur, le paywall garantit qu'aucune photo d'un visiteur non abonné
 * n'est envoyée.
 */
export function PaywallPreview({ previewUrl }: { previewUrl: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={previewUrl}
        alt=""
        aria-hidden
        className="h-full w-full scale-110 object-cover blur-xl"
      />
    </div>
  );
}

/**
 * Bouton au carré rouge du snap photo, seul, sans texte autour : l'appui
 * fait monter les tarifs par-dessus la page (même feuille que la pastille
 * de crédits) sans la quitter.
 */
export function PaywallSnapButton() {
  const [isPricingOpen, setIsPricingOpen] = useState(false);

  return (
    <div className="my-4 flex justify-center">
      <button
        type="button"
        onClick={() => setIsPricingOpen(true)}
        className="flex h-12 items-center justify-center gap-2.5 rounded-3xl bg-snapred px-6 text-[16px] font-semibold text-white transition active:opacity-90"
      >
        <span aria-hidden className="h-3.5 w-3.5 rounded-[3px] bg-white" />
        Envoyer le snap
      </button>

      {/* Portail vers <body> : rendue dans la page, la feuille héritait du
          contexte d'empilement de son parent et passait sous l'en-tête. */}
      {isPricingOpen &&
        createPortal(
          <RechargeSheet isOpen onClose={() => setIsPricingOpen(false)} />,
          document.body,
        )}
    </div>
  );
}
