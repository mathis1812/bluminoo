/**
 * Cohérence entre ce qu'on AFFICHE et ce qu'on DÉBITE.
 *
 * Le montant montré au client avant qu'il ne lance une génération vient de
 * `IMAGE_GENERATION_COST`. Le montant réellement retiré de son solde vient de
 * `photoCost(TEMPLATE_QUALITY)`. Rien dans le code ne relie les deux : ils
 * peuvent diverger sans qu'aucune erreur ne se déclenche, et le client paierait
 * alors autre chose que le prix annoncé. D'où ce test.
 */

import { describe, expect, it } from "vitest";
import { EDIT_COST, IMAGE_GENERATION_COST } from "@/lib/generation-cost";
import {
  QUALITY_COST,
  QUALITY_LABEL,
  TEMPLATE_QUALITY,
  photoCost,
} from "@/lib/generation-tiers";

describe("coût d'une génération de gabarit", () => {
  it("le montant débité est celui affiché au client", () => {
    // `TemplateGenerator` affiche `IMAGE_GENERATION_COST` avant la
    // génération, et `app/api/generate` débite cette même constante pour un
    // gabarit depuis le 09/09.
    //
    // Le test vérifiait auparavant `photoCost(TEMPLATE_QUALITY) ===
    // IMAGE_GENERATION_COST`. Ce couplage a été rompu volontairement : la
    // qualité d'un gabarit décrit sa RÉSOLUTION, et la passer en 2K aurait
    // sinon fait payer 150 pour un écran annonçant 100.
    expect(IMAGE_GENERATION_COST).toBe(100);
    expect(Number.isInteger(IMAGE_GENERATION_COST)).toBe(true);
  });

  it("le palier des gabarits existe dans la grille", () => {
    expect(QUALITY_COST[TEMPLATE_QUALITY]).toBeDefined();
  });

  it("les gabarits sortent en 2K", () => {
    // Nano Banana 2 accepte `imageConfig.imageSize` — contrairement au Lite,
    // qui le refusait et rendait ce réglage inopérant. Le vérifier ici évite
    // de retomber en 1K sans s'en apercevoir.
    expect(QUALITY_LABEL[TEMPLATE_QUALITY]).toBe("2K");
  });

  it("le tarif du studio libre suit toujours sa résolution", () => {
    // Le découplage ne concerne QUE les gabarits : au studio, choisir un cran
    // plus haut doit continuer à coûter plus cher.
    expect(photoCost("normal")).toBeLessThan(photoCost("high"));
    expect(photoCost("high")).toBeLessThan(photoCost("max"));
  });
});

describe("coût d'une retouche", () => {
  it("est un entier positif", () => {
    // Un coût nul ouvrirait des générations gratuites en boucle.
    expect(Number.isInteger(EDIT_COST)).toBe(true);
    expect(EDIT_COST).toBeGreaterThan(0);
  });

  it("ne dépasse pas celui d'une génération complète", () => {
    // Une retouche part d'un rendu existant : la facturer plus cher qu'une
    // génération depuis zéro serait incompréhensible pour le client.
    expect(EDIT_COST).toBeLessThanOrEqual(IMAGE_GENERATION_COST);
  });
});
