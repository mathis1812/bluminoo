import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Retour des liens e-mail de Supabase (réinitialisation du mot de passe).
 * Le lien porte un `code` à échanger contre une session, dans le navigateur
 * qui a fait la demande (flux PKCE). `next` est restreint à un chemin
 * interne : une URL externe ferait de cette route une redirection ouverte.
 */
export async function GET(req: NextRequest) {
  const { searchParams, origin } = req.nextUrl;
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/";
  const next =
    nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/";

  if (code) {
    const { error } = await createClient().auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(`${origin}${next}`);
    console.error("Auth code exchange failed:", error.message);
  }
  return NextResponse.redirect(`${origin}/reset-password?error=expired`);
}
