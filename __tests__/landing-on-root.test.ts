// @vitest-environment node
/**
 * Garde-fou : la racine `/` doit servir la landing à un visiteur non connecté.
 *
 * La panne que ce test empêche est entièrement silencieuse : si la réécriture
 * disparaît du middleware, chaque page continue de fonctionner, aucun test ne
 * rougit, aucune erreur ne remonte — mais tout le trafic d'acquisition tombe
 * sur le studio sans avoir vu un exemple, un prix ni un témoignage. Le
 * symptôme n'est pas une erreur, c'est une conversion qui s'effondre, et on ne
 * le relie pas au code.
 *
 * On vérifie les trois cas qui comptent : visiteur sur `/` (réécrit),
 * utilisateur connecté sur `/` (studio intact), visiteur ailleurs que sur la
 * racine (aucune interception).
 */
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const getUser = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({ auth: { getUser } }),
}));

const { middleware } = await import("@/middleware");

function requestFor(pathname: string) {
  return new NextRequest(new URL(pathname, "https://www.bluminoo.com"));
}

describe("middleware — la landing sur la racine", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://exemple.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "cle-de-test";
    getUser.mockReset();
  });

  it("réécrit `/` vers `/landing` pour un visiteur non connecté", async () => {
    getUser.mockResolvedValue({ data: { user: null } });

    const response = await middleware(requestFor("/"));

    expect(response.headers.get("x-middleware-rewrite")).toContain("/landing");
  });

  it("laisse `/` servir le studio à un utilisateur connecté", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "un-utilisateur" } } });

    const response = await middleware(requestFor("/"));

    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
  });

  it("n'intercepte que la racine", async () => {
    getUser.mockResolvedValue({ data: { user: null } });

    const response = await middleware(requestFor("/pricing"));

    expect(response.headers.get("x-middleware-rewrite")).toBeNull();
  });
});
