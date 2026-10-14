import { describe, expect, it } from "vitest";
import { localeFromAcceptLanguage } from "@/app/landing/copy";

describe("localeFromAcceptLanguage", () => {
  it("sert le francais quand le navigateur prefere le francais", () => {
    expect(localeFromAcceptLanguage("fr-FR,fr;q=0.9,en;q=0.8")).toBe("fr");
    expect(localeFromAcceptLanguage("fr")).toBe("fr");
    expect(localeFromAcceptLanguage("FR-ca")).toBe("fr");
  });

  it("sert l'anglais sinon, y compris quand le francais n'est que second", () => {
    expect(localeFromAcceptLanguage("en-US,en;q=0.9,fr;q=0.8")).toBe("en");
    expect(localeFromAcceptLanguage("de-DE")).toBe("en");
    expect(localeFromAcceptLanguage("")).toBe("en");
    expect(localeFromAcceptLanguage(null)).toBe("en");
  });
});
