import { createServiceClient } from "@/lib/supabase/service";
import { IMAGE_GENERATION_COST } from "@/lib/generation-cost";

// Réexporté pour ne pas casser les appelants existants. La valeur elle-même
// vit dans un module sans dépendance serveur, afin que l'interface puisse
// l'afficher avant de lancer une génération.
export { IMAGE_GENERATION_COST };
export const VIDEO_GENERATION_COST = 400;

export async function spendCredits(
  userId: string,
  amount: number,
): Promise<boolean> {
  const service = createServiceClient();
  const { data, error } = await service.rpc("spend_credits", {
    p_user_id: userId,
    p_amount: amount,
  });
  if (error) {
    throw new Error(error.message);
  }
  return data === true;
}

export async function refundCredits(
  userId: string,
  amount: number,
): Promise<void> {
  const service = createServiceClient();
  const { error } = await service.rpc("refund_credits", {
    p_user_id: userId,
    p_amount: amount,
  });
  if (error) {
    console.error(
      `Failed to refund ${amount} credits for user ${userId}:`,
      error.message,
    );
  }
}

/**
 * Appelle une fonction de crédit du webhook. L'erreur est LEVÉE, pas
 * journalisée : un paiement dont le crédit échoue doit faire rejouer le
 * webhook par Stripe, pas disparaître en silence.
 */
async function creditRpc(
  fn: "add_topup_credits" | "grant_plan_credits",
  userId: string,
  amount: number,
): Promise<void> {
  const service = createServiceClient();
  const { error } = await service.rpc(fn, {
    p_user_id: userId,
    p_amount: amount,
  });
  if (error) {
    throw new Error(`${fn}(${amount}) failed: ${error.message}`);
  }
}

/** Pack acheté : ajouté au solde et à la part pack, qui survit aux renouvellements (migration 0014). */
export const addCredits = (userId: string, amount: number) =>
  creditRpc("add_topup_credits", userId, amount);

/** Abonnement ou renouvellement : le forfait remplace l'ancien, la part pack est gardée. */
export const grantPlanCredits = (userId: string, amount: number) =>
  creditRpc("grant_plan_credits", userId, amount);
