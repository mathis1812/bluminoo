export type AttemptOutcome = "ok" | "paiement" | "quota" | "refusee" | "erreur";

/** Ce qu'a donné une tentative de rendu, lu sur le code HTTP renvoyé ; null si personne n'est connecté. */
export function attemptOutcome(status: number): AttemptOutcome | null {
  if (status === 401) return null;
  if (status < 300) return "ok";
  if (status === 402 || status === 403) return "paiement";
  if (status === 429) return "quota";
  if (status < 500) return "refusee";
  return "erreur";
}

type Rpc = { rpc: (fn: string, args: object) => PromiseLike<{ error: { message: string } | null }> };

/** Note la tentative du compte connecté pour la console (table attempts) ; n'échoue jamais. */
export async function recordAttempt(supabase: Rpc, status: number): Promise<void> {
  const outcome = attemptOutcome(status);
  if (!outcome) return;
  try {
    const { error } = await supabase.rpc("record_attempt", { p_outcome: outcome });
    if (error) console.error("[attempt]", error.message);
  } catch (e) {
    console.error("[attempt]", e);
  }
}
