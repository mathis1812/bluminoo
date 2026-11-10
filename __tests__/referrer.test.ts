import { describe, expect, it } from "vitest";
import { externalReferrer } from "@/lib/referrer";

describe("provenance des visites de la landing", () => {
  it("garde seulement l'origine d'un site externe", () => {
    expect(externalReferrer("https://www.tiktok.com/@bluminoo/video/123?x=1", "www.bluminoo.com"))
      .toBe("https://www.tiktok.com");
  });

  it("ignore la navigation interne, avec ou sans www", () => {
    expect(externalReferrer("https://bluminoo.com/", "www.bluminoo.com")).toBeNull();
    expect(externalReferrer("https://www.bluminoo.com/landing", "bluminoo.com")).toBeNull();
  });

  it("renvoie null pour un accès direct ou une valeur invalide", () => {
    expect(externalReferrer("", "bluminoo.com")).toBeNull();
    expect(externalReferrer(undefined, "bluminoo.com")).toBeNull();
    expect(externalReferrer("javascript:alert(1)", "bluminoo.com")).toBeNull();
    expect(externalReferrer("pas une url", "bluminoo.com")).toBeNull();
  });
});
