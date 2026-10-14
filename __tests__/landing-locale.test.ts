import { describe, expect, it } from "vitest";
import { localeFromAcceptLanguage, resolveLocale } from "@/app/landing/copy";

describe("resolveLocale", () => {
  it("le bouton FR/EN l'emporte sur la langue du telephone", () => {
    expect(resolveLocale("en", "fr-FR,fr;q=0.9")).toBe("en");
    expect(resolveLocale("fr", "en-US")).toBe("fr");
  });

  it("ignore un cookie absent ou invalide", () => {
    expect(resolveLocale(undefined, "fr-FR")).toBe("fr");
    expect(resolveLocale("de", "en-US")).toBe("en");
  });
});

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
