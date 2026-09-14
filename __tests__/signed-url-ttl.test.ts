/**
 * Garde-fou : la photo source est signée pour une durée limitée
 * (`SIGNED_URL_TTL_SECONDS`, `lib/studio-image.ts`). Si cette durée descend
 * sous le temps d'une génération, l'URL expire pendant que le fournisseur
 * l'utilise encore — et la panne est silencieuse et intermittente : elle
 * n'apparaît que lorsque la file d'attente de fal.ai traîne, jamais sur un
 * essai rapide en local.
 *
 * Le pire cas est la vidéo Kling, abandonnée au bout de 230 s par
 * `app/api/generate-video` (`POLL_TIMEOUT_MS`). On exige cinq minutes, ce qui
 * couvre ce délai avec de la marge sans faire de l'URL un lien durable.
 */
import { describe, expect, it } from "vitest";

import { SIGNED_URL_TTL_SECONDS } from "@/lib/studio-image";

const VIDEO_POLL_TIMEOUT_SECONDS = 230;

describe("SIGNED_URL_TTL_SECONDS", () => {
  it("couvre le délai d'abandon de la génération vidéo", () => {
    expect(SIGNED_URL_TTL_SECONDS).toBeGreaterThan(VIDEO_POLL_TIMEOUT_SECONDS);
  });

  it("laisse au moins cinq minutes de marge d'attente", () => {
    expect(SIGNED_URL_TTL_SECONDS).toBeGreaterThanOrEqual(5 * 60);
  });

  it("ne transforme pas la photo source en lien durable", () => {
    expect(SIGNED_URL_TTL_SECONDS).toBeLessThanOrEqual(60 * 60);
  });
});
