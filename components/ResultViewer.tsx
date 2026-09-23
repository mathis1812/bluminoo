"use client";

import { useEffect } from "react";
import ResultActions from "@/components/ResultActions";

/**
 * Vue plein écran d'un rendu, ouverte en touchant l'image.
 *
 * Deux raisons d'exister, toutes deux invisibles tant qu'on ne regarde pas
 * un vrai rendu à l'écran. La vignette du gabarit est un cadre `aspect-[9/11]`
 * en `object-cover` : un rendu qui sort en ~4:3 y perd ses côtés. Et le
 * dégradé qui fond l'exemple dans le noir de la page en couvrait la moitié
 * basse. Ici l'image est en `object-contain` — entière, jamais rognée, rien
 * par-dessus.
 *
 * Le rendu est présenté dans un cadre 9:16, le format d'un snap. C'est ce
 * que le destinataire verra, et c'est la seule question que se pose
 * quelqu'un avant d'envoyer. Le cadre ne rogne rien : `/api/generate` aligne
 * le rendu sur le format de la photo source (`matchFirstImageAspect`), donc
 * un rendu paysage arrive ici en paysage et prend des bandes en haut et en
 * bas plutôt que de perdre ses côtés — c'est exactement ce que fera
 * Snapchat. Le fond du cadre est un blanc à 4 % : sur le noir de la page,
 * c'est ce qui rend la forme du snap perceptible.
 *
 * Les actions viennent de `ResultActions`, celui-là même que la vignette
 * utilise. Un jeu de boutons propre au visualiseur finirait par diverger du
 * premier — un bouton ajouté d'un côté et pas de l'autre.
 */
export default function ResultViewer({
  resultUrl,
  alt,
  hasRedSnap,
  canShare,
  onReset,
  onError,
  onEdited,
  editLabel,
  onClose,
}: {
  resultUrl: string;
  alt: string;
  hasRedSnap: boolean;
  canShare: boolean;
  onReset: () => void;
  onError: (message: string) => void;
  onEdited?: (imageUrl: string) => void;
  editLabel?: string;
  onClose: () => void;
}) {
  // Échap ferme, comme toute vue modale. Sans ça, au clavier, la seule
  // sortie serait le bouton — et il n'y a rien derrière lui à atteindre.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Full size result"
      className="fixed inset-0 z-50 flex flex-col bg-black"
    >
      {/* Même bouton de retour que `TemplateHeader` — chevron, 42 px, même
          bordure. Un visualiseur avec sa propre croix apprenait aux gens deux
          gestes différents pour la même chose. */}
      <div className="flex shrink-0 justify-start px-4 pt-[calc(env(safe-area-inset-top)+12px)]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Back"
          className="flex h-[42px] items-center gap-1.5 rounded-full border border-[#2d2d2d] bg-[#161616] pl-2.5 pr-4 text-[15px] font-medium text-white transition active:opacity-80"
        >
          <svg
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-[18px] w-[18px]"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back
        </button>
      </div>

      {/* min-h-0 : sans lui, l'image d'un flex-1 refuse de se réduire et
          pousse les actions hors de l'écran sur un mobile bas. */}
      <div className="flex min-h-0 flex-1 items-center justify-center px-4 py-3">
        {/* Le cadre prend toute la hauteur disponible et en déduit sa largeur
            par le ratio — `h-full w-auto` plutôt que `w-full`, sans quoi sur
            un écran étroit la hauteur calculée dépasserait l'espace et
            pousserait les actions dehors. `max-w-full` borne le cas inverse,
            un écran très court et étroit, où le cadre serait alors un peu
            moins large que 9:16 ; l'image reste juste, elle est en
            `object-contain`. */}
        <div
          className="flex h-full w-auto max-w-full items-center justify-center overflow-hidden rounded-3xl bg-white/[0.04]"
          style={{ aspectRatio: "9 / 16" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resultUrl}
            alt={alt}
            className="h-full w-full object-contain"
          />
        </div>
      </div>

      <div className="shrink-0 px-4 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <ResultActions
          resultUrl={resultUrl}
          hasRedSnap={hasRedSnap}
          canShare={canShare}
          onReset={() => {
            onClose();
            onReset();
          }}
          onError={onError}
          onEdited={onEdited}
          editLabel={editLabel}
        />
      </div>
    </div>
  );
}
