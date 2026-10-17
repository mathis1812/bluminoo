import { describe, expect, it } from "vitest";
import { currencyForLocale, resolveLocale } from "@/lib/locale";
import { PLANS, billingFor, formatPrice } from "@/lib/stripe";

describe("devise du visiteur", () => {
  it("tout le monde paie en euros pendant le lancement France", () => {
    expect(currencyForLocale(resolveLocale(undefined, "fr-FR,fr;q=0.9"))).toBe("eur");
    expect(currencyForLocale(resolveLocale(undefined, "en-US"))).toBe("eur");
    expect(currencyForLocale(resolveLocale("en", "fr-FR"))).toBe("eur");
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

describe("rythme de facturation", () => {
  it("les euros passent au mensuel, les dollars restent en hebdo", () => {
    expect(billingFor("eur")).toBe("month");
    expect(billingFor("usd")).toBe("week");
  });

  it("le mensuel garde le prix par credit de l'hebdo", () => {
    for (const plan of Object.values(PLANS)) {
      const perCredit = (o: { price: number; credits: number }) => o.price / o.credits;
      expect(perCredit(plan.month)).toBeCloseTo(perCredit(plan.week), 3);
    }
  });
});
