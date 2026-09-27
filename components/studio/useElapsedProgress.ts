"use client";

import { useEffect, useState } from "react";

/** Durée typique observée d'une génération, pour calibrer la progression. */
export const IMAGE_EXPECTED_SECONDS = 30;

/**
 * Intervalle entre deux messages d'attente, en secondes.
 *
 * 2,6 s : la cadence d'une seconde, héritée de l'ancien compteur, faisait
 * défiler les messages trop vite pour être lus.
 */
const LOADING_MESSAGE_SECONDS = 2.6;

export const GENERATION_LOADING_MESSAGES = [
  "Analyzing the light…",
  "Adjusting the reflections…",
  "Adding the finishing touches…",
  "Finalizing the render…",
];

/**
 * Progression purement perçue, sans lien avec l'état réel côté Gemini :
 * grimpe vite au début puis ralentit et plafonne à 92%, pour ne jamais
 * laisser croire que c'est fini avant que ça le soit vraiment.
 *
 * Extrait de `app/page.tsx` le 06/09 pour alléger l'écran studio. Une copie
 * non factorisée de la même formule vit encore dans
 * `components/TemplateGenerator.tsx` — les deux doivent bouger ensemble tant
 * qu'elle n'a pas été ramenée ici.
 */
export function useElapsedProgress(active: boolean, expectedSeconds: number) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!active) {
      setElapsedSeconds(0);
      return;
    }
    const interval = setInterval(() => {
      setElapsedSeconds((s) => s + 1);
    }, 1_000);
    return () => clearInterval(interval);
  }, [active]);

  const progressPercent = Math.min(
    92,
    Math.round(100 * (1 - Math.exp((-2 * elapsedSeconds) / expectedSeconds))),
  );

  // Dérivé du temps écoulé plutôt que porté par un intervalle propre : le
  // studio et les gabarits en ont chacun un, et un troisième exemplaire de la
  // même boucle aurait dérivé des deux autres au premier ajustement.
  const loadingMessage =
    GENERATION_LOADING_MESSAGES[
      Math.floor(elapsedSeconds / LOADING_MESSAGE_SECONDS) %
        GENERATION_LOADING_MESSAGES.length
    ];

  return { elapsedSeconds, progressPercent, loadingMessage };
}
