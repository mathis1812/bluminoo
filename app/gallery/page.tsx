import { redirect } from "next/navigation";
import GalleryGrid from "@/components/GalleryGrid";
import TemplateHeader from "@/components/TemplateHeader";
import { createClient } from "@/lib/supabase/server";

type GalleryEntry = {
  id: string;
  mode: "image" | "video";
  result_url: string;
  label: string;
  created_at: string;
};

/**
 * Reconstruite le 29/08 sur le même en-tête partagé que les écrans de
 * gabarit : relevé en lisant le DOM de /galerie sur le produit de référence.
 * `PlaceholderSection` (fond glassy violet, pré-refonte) n'y a plus sa
 * place — laissé intact ailleurs, faute d'autre appelant à corriger.
 */
/** Taille d'une page de galerie ; « Load more » en ajoute autant. */
const PAGE_SIZE = 60;
const MAX_LIMIT = 1000;

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: { limit?: string };
}) {
  const requested = Number.parseInt(searchParams.limit ?? "", 10);
  const limit = Number.isFinite(requested)
    ? Math.min(Math.max(requested, PAGE_SIZE), MAX_LIMIT)
    : PAGE_SIZE;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { data: entries } = await supabase
    .from("gallery_entries")
    .select("id, mode, result_url, label, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit)
    .returns<GalleryEntry[]>();

  return (
    <>
      <TemplateHeader backHref="/" title="Gallery" />

      <div className="animate-fade-up flex min-h-dvh flex-col px-4 pb-[calc(env(safe-area-inset-bottom)+16px)] pt-[calc(env(safe-area-inset-top)+76px)]">
        {entries && entries.length > 0 ? (
          <GalleryGrid
            entries={entries}
            nextHref={
              entries.length === limit && limit < MAX_LIMIT
                ? `/gallery?limit=${limit + PAGE_SIZE}`
                : null
            }
          />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center">
            <p className="text-[17px] font-semibold text-white">
              Nothing here yet
            </p>
            <p className="max-w-[280px] text-[14px] leading-snug text-white/50">
              Every successful generation is saved here automatically.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
