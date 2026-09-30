import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

const BUCKET = "gallery";
const PUBLIC_PREFIX = `/storage/v1/object/public/${BUCKET}/`;

/**
 * Supprime une création de la galerie : le fichier du bucket puis la ligne.
 * La table n'a aucune policy d'écriture pour `authenticated` : on passe par
 * le client service, APRÈS avoir vérifié que l'entrée appartient bien au
 * compte connecté.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const {
    data: { user },
  } = await createClient().auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  const service = createServiceClient();
  const { data: entry } = await service
    .from("gallery_entries")
    .select("id, result_url")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!entry) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  // Une vidéo restée sur l'URL temporaire du fournisseur n'a pas de fichier
  // chez nous : seule la ligne est à effacer. Le chemin doit aussi être dans
  // le dossier du compte, par prudence.
  const url = new URL(entry.result_url as string);
  const idx = url.pathname.indexOf(PUBLIC_PREFIX);
  if (idx !== -1) {
    const path = decodeURIComponent(url.pathname.slice(idx + PUBLIC_PREFIX.length));
    if (path.startsWith(`${user.id}/`)) {
      const { error } = await service.storage.from(BUCKET).remove([path]);
      if (error) {
        console.error(`Failed to remove gallery file ${path}:`, error.message);
        return NextResponse.json(
          { error: "Unable to delete right now. Please try again." },
          { status: 500 },
        );
      }
    }
  }

  const { error: deleteError } = await service
    .from("gallery_entries")
    .delete()
    .eq("id", entry.id);
  if (deleteError) {
    console.error(`Failed to delete gallery entry ${entry.id}:`, deleteError.message);
    return NextResponse.json(
      { error: "Unable to delete right now. Please try again." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
