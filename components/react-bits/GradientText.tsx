"use client";

import type { CSSProperties, ReactNode } from "react";

/**
 * Texte parcouru par un dégradé animé — le mot-symbole Bluminoo.
 *
 * Porté de reactbits.dev le 10/09, sans sa dépendance `motion` (~100 Ko).
 * L'original anime `background-position` image par image en JavaScript ;
 * c'est exactement ce qu'une animation CSS fait nativement, sur le thread de
 * composition et sans réveiller React à chaque frame. Le rendu est le même,
 * et le logo s'affiche sur toutes les pages du produit — y compris avant que
 * le JavaScript n'ait fini de charger.
 *
 * Sont aussi écartées les options `showBorder`, `pauseOnHover` et
 * `direction` : un mot-symbole n'a ni bordure, ni état de survol, ni sens de
 * lecture variable. Elles auraient été du code jamais exécuté.
 *
 * La couleur de départ est répétée à la fin de la liste, comme dans
 * l'original : sans elle, la boucle saute visiblement au moment où le
 * dégradé se rembobine.
 */
/**
 * Palette par défaut : blanc, bleu très pâle, puis le violet doux de
 * l'ancienne direction artistique (`#d8b4fe`, relevé dans l'en-tête de
 * `components/MagicSparkles.tsx`, dont la variante pleine est `#a855f7`).
 *
 * Les teintes sont volontairement proches du blanc. Un dégradé saturé sur un
 * mot de trois centimètres se lit comme un bug d'affichage, pas comme une
 * identité — d'où cette dérive à peine perceptible, qui ne se remarque qu'en
 * regardant le mot, jamais en lisant la page.
 */
const DEFAULT_COLORS = ["#ffffff", "#cfe3ff", "#d8b4fe"];

export default function GradientText({
  children,
  colors = DEFAULT_COLORS,
  /**
   * Fixe par défaut. L'animation reste disponible pour un usage ponctuel,
   * mais un logo présent sur toutes les pages qui scintille en permanence
   * attire l'œil en continu au lieu de le laisser au contenu.
   */
  animated = false,
  /** Durée d'un parcours complet, en secondes. Sans effet si `animated` est faux. */
  animationSpeed = 8,
  className = "",
  style,
}: {
  children: ReactNode;
  colors?: string[];
  animated?: boolean;
  animationSpeed?: number;
  className?: string;
  style?: CSSProperties;
}) {
  // La première couleur n'est répétée que pour une boucle : figé, ce doublon
  // écraserait la fin du dégradé et le violet disparaîtrait.
  const gradient = (animated ? [...colors, colors[0]] : colors).join(", ");

  return (
    <span
      className={`gradient-text${animated ? " gradient-text--animated" : ""}${
        className ? ` ${className}` : ""
      }`}
      style={
        {
          backgroundImage: `linear-gradient(to right, ${gradient})`,
          "--gradient-text-duration": `${animationSpeed}s`,
          ...style,
        } as CSSProperties
      }
    >
      {children}
    </span>
  );
}
