import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { refundCredits, spendCredits } from "@/lib/credits";
import { persistVideoFromUrl } from "@/lib/gallery-server";
import { createFalTask, pollFalTask, type FalTask } from "@/lib/fal-jobs";
import { buildKlingVideoInput, KLING_VIDEO_MODEL_ID } from "@/lib/kling-video";
import {
  asPlanId,
  isVideoOpen,
  VIDEO_DURATIONS,
  videoCost,
  type VideoDuration,
} from "@/lib/generation-tiers";
import {
  DISALLOWED_ASSET_URL_MESSAGE,
  isAllowedAssetUrl,
} from "@/lib/url-allowlist";

export const runtime = "nodejs";
export const maxDuration = 300;

const POLL_INTERVAL_MS = 4_000;
// 230 s au lieu de 280 : le reste du budget `maxDuration` sert à
// télécharger la vidéo chez fal.ai et à la réhéberger dans notre Storage.
// Sans cette marge, une génération lente ferait expirer la fonction avant
// la persistance, et l'utilisateur se retrouverait avec une URL temporaire.
const POLL_TIMEOUT_MS = 230_000;

const MAX_PROMPT_LENGTH = 500;

type GenerateVideoBody = {
  sourceImageUrl?: string;
  prompt?: string;
  duration?: number;
  label?: string;
};

/**
 * Photo → vidéo, sur Kling 3.0 via la queue fal.ai.
 *
 * Remplace la route Kling de remplacement d'objet dans une vidéo existante,
 * qui n'avait aucun appelant depuis la migration et savait pourtant débiter
 * des crédits.
 *
 * L'ordre des contrôles n'est pas indifférent : entrées, liste blanche,
 * palier, et le débit seulement ensuite. Tout ce qui peut refuser la requête
 * le fait avant qu'un seul crédit ne bouge.
 */
export async function POST(req: NextRequest) {
  const apiKey = process.env.FAL_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Clé API manquante. Définis FAL_KEY dans tes variables d'environnement." },
      { status: 500 },
    );
  }

  let body: GenerateVideoBody;
  try {
    body = (await req.json()) as GenerateVideoBody;
  } catch {
    return NextResponse.json(
      { error: "Requête invalide : corps JSON illisible." },
      { status: 400 },
    );
  }

  const { sourceImageUrl, prompt, duration, label } = body;

  if (!sourceImageUrl || typeof sourceImageUrl !== "string") {
    return NextResponse.json(
      { error: "Photo source manquante. Envoie une image et réessaie." },
      { status: 400 },
    );
  }

  if (!prompt || !prompt.trim()) {
    return NextResponse.json(
      { error: "Décris le mouvement que tu veux dans la vidéo." },
      { status: 400 },
    );
  }

  if (prompt.trim().length > MAX_PROMPT_LENGTH) {
    return NextResponse.json(
      { error: `Description trop longue (${MAX_PROMPT_LENGTH} caractères maximum).` },
      { status: 400 },
    );
  }

  // La durée est validée contre la liste, jamais reprise telle quelle : elle
  // pilote directement ce que fal.ai nous facture. Une valeur falsifiée à 30
  // coûterait plus de six fois le tarif d'un 4 s, débité au prix d'un 4 s.
  if (!VIDEO_DURATIONS.includes(duration as VideoDuration)) {
    return NextResponse.json(
      {
        error: `Durée invalide. Choisis parmi ${VIDEO_DURATIONS.join(", ")} secondes.`,
      },
      { status: 400 },
    );
  }
  const videoDuration = duration as VideoDuration;

  // Anti-SSRF : cette URL est transmise au fournisseur, qui la télécharge.
  // Elle doit provenir de notre Storage. Contrôle effectué avant tout débit.
  if (!isAllowedAssetUrl(sourceImageUrl)) {
    return NextResponse.json(
      { error: DISALLOWED_ASSET_URL_MESSAGE },
      { status: 400 },
    );
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "Connecte-toi pour générer une vidéo." },
      { status: 401 },
    );
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("plan")
    .eq("id", user.id)
    .single();
  if (profileError) {
    console.error(
      `Failed to read plan for user ${user.id}:`,
      profileError.message,
    );
  }
  const planId = asPlanId(profile?.plan as string | null | undefined);

  // La vidéo est réservée aux paliers Pro et Max. L'interface masque déjà le
  // mode aux autres ; ce contrôle rattrape une requête falsifiée, sinon un
  // compte sans palier obtiendrait la génération la plus chère du produit.
  if (!isVideoOpen(planId)) {
    return NextResponse.json(
      { error: "La vidéo est disponible avec les offres Pro et Max." },
      { status: 403 },
    );
  }

  const cost = videoCost(videoDuration);

  let hasCredits: boolean;
  try {
    hasCredits = await spendCredits(user.id, cost);
  } catch (err) {
    console.error("Failed to check credits:", err);
    return NextResponse.json(
      { error: "Erreur interne lors de la vérification des crédits." },
      { status: 500 },
    );
  }
  if (!hasCredits) {
    return NextResponse.json(
      {
        error:
          "Insufficient credits. Go to the Pricing page to recharge your account.",
      },
      { status: 402 },
    );
  }

  let task: FalTask | null = null;
  try {
    task = await createFalTask(
      apiKey,
      KLING_VIDEO_MODEL_ID,
      buildKlingVideoInput({
        imageUrl: sourceImageUrl,
        prompt: prompt.trim(),
        duration: videoDuration,
      }),
    );
    const resultUrl = await pollFalTask(apiKey, task, {
      intervalMs: POLL_INTERVAL_MS,
      timeoutMs: POLL_TIMEOUT_MS,
    });
    const storedUrl = await persistVideoFromUrl(
      user.id,
      resultUrl,
      label?.trim() || "Génération vidéo",
    );
    return NextResponse.json({ videoUrl: storedUrl });
  } catch (err) {
    await refundCredits(user.id, cost);
    if (err instanceof Error && err.message === "TIMEOUT") {
      // fal.ai continue la génération, et la facture, après notre abandon.
      // L'URL porte l'identifiant de la tâche : de quoi la retrouver et
      // la réclamer au support fal.
      console.error(
        `Video generation timed out for user ${user.id}; fal task still running: ${task?.statusUrl}`,
      );
      return NextResponse.json(
        { error: "La génération a pris trop de temps. Réessaie dans quelques instants." },
        { status: 504 },
      );
    }
    const message =
      err instanceof Error
        ? err.message
        : "Erreur inconnue pendant la génération de la vidéo.";
    return NextResponse.json(
      { error: `Erreur du service vidéo fal.ai. ${message}` },
      { status: 502 },
    );
  }
}
