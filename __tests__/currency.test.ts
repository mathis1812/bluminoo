import { describe, expect, it } from "vitest";
import { currencyForLocale, resolveLocale } from "@/lib/locale";
import { formatPrice } from "@/lib/stripe";

describe("devise du visiteur", () => {
  it("un visiteur FR paie en euros, les autres en dollars", () => {
    expect(currencyForLocale(resolveLocale(undefined, "fr-FR,fr;q=0.9"))).toBe("eur");
    expect(currencyForLocale(resolveLocale(undefined, "en-US"))).toBe("usd");
    expect(currencyForLocale(resolveLocale("en", "fr-FR"))).toBe("usd");
  });
});

describe("formatPrice", () => {
  it("affiche le dollar devant, l'euro derriere avec une virgule", () => {
    expect(formatPrice(9.99)).toBe("$9.99");
    expect(formatPrice(9.99, "usd")).toBe("$9.99");
    expect(formatPrice(9.99, "eur")).toBe("9,99 €");
    expect(formatPrice(19.99 - 9.99, "eur")).toBe("10,00 €");
  });
});
