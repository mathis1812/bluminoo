import { describe, expect, it } from "vitest";
import { attemptOutcome, recordAttempt } from "@/lib/attempts";

describe("attempts", () => {
  it("classe l'issue d'un rendu d'après le code HTTP", () => {
    expect([200, 402, 403, 429, 400, 502, 401].map(attemptOutcome)).toEqual([
      "ok", "paiement", "paiement", "quota", "refusee", "erreur", null,
    ]);
  });

  it("enregistre l'issue, rien pour un déconnecté, et n'échoue jamais", async () => {
    const calls: unknown[] = [];
    const ok = { rpc: async (fn: string, args: object) => (calls.push([fn, args]), { error: null }) };
    await recordAttempt(ok, 402);
    await recordAttempt(ok, 401);
    expect(calls).toEqual([["record_attempt", { p_outcome: "paiement" }]]);
    await expect(recordAttempt({ rpc: async () => { throw new Error("réseau"); } }, 200)).resolves.toBeUndefined();
  });
});
