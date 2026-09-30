// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const addCredits = vi.fn();
const deleteEvent = vi.fn();

vi.mock("@/lib/credits", () => ({ addCredits: (...a: unknown[]) => addCredits(...a) }));

vi.mock("@/lib/supabase/service", () => ({
  createServiceClient: () => ({
    from: () => ({
      insert: async () => ({ error: null }),
      delete: () => ({
        eq: async (_col: string, id: string) => {
          deleteEvent(id);
          return { error: null };
        },
      }),
    }),
  }),
}));

vi.mock("@/lib/stripe", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/stripe")>();
  return {
    ...actual,
    isStripeConfigured: () => true,
    envValue: () => "whsec_test",
    stripe: {
      webhooks: {
        constructEvent: () => ({
          id: "evt_1",
          type: "checkout.session.completed",
          data: {
            object: { metadata: { supabase_user_id: "user_1", topup: "small" } },
          },
        }),
      },
    },
  };
});

async function post() {
  const { POST } = await import("@/app/api/stripe/webhook/route");
  const req = new Request("https://x.test/api/stripe/webhook", {
    method: "POST",
    headers: { "stripe-signature": "sig" },
    body: "{}",
  });
  return POST(req as never);
}

describe("webhook Stripe — pack de crédits", () => {
  beforeEach(() => {
    addCredits.mockReset();
    deleteEvent.mockReset();
  });

  it("crédite le pack et acquitte l'événement", async () => {
    addCredits.mockResolvedValue(undefined);
    const res = await post();
    expect(res.status).toBe(200);
    expect(addCredits).toHaveBeenCalledWith("user_1", 1000);
    expect(deleteEvent).not.toHaveBeenCalled();
  });

  it("libère l'événement et répond 500 si le crédit échoue, pour que Stripe rejoue", async () => {
    addCredits.mockRejectedValue(new Error("db down"));
    const res = await post();
    expect(res.status).toBe(500);
    expect(deleteEvent).toHaveBeenCalledWith("evt_1");
  });
});
