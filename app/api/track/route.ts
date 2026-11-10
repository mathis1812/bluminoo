import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { externalReferrer } from "@/lib/referrer";
import { cleanUtm, deviceOf, isBot, normalizePath } from "@/lib/track";

export const runtime = "nodejs";

const ALLOWED_EVENT_TYPES = ["page_view", "cta_click"] as const;
type EventType = (typeof ALLOWED_EVENT_TYPES)[number];

// Doit rester synchronisée avec LandingCtaId (lib/analytics.ts) : un
// identifiant présent côté client mais absent ici voit son clic rejeté
// sans que rien ne le signale.
const ALLOWED_CTA_IDS = [
  "hero_primary",
  "panel_templates",
  "panel_free_mode",
  "panel_snapchat",
  "final_cta",
] as const;
type CtaId = (typeof ALLOWED_CTA_IDS)[number];

type TrackBody = {
  event?: string;
  ctaId?: string;
  path?: string;
  sessionId?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
};

/**
 * Enregistre les visites de toutes les pages et les clics CTA de la landing
 * dans `landing_events` (0007, colonnes appareil/utm en 0015). Alimenté par
 * lib/analytics.ts, appelé via navigator.sendBeacon depuis le client.
 */
export async function POST(req: NextRequest) {
  const userAgent = req.headers.get("user-agent") ?? "";
  // Robots et aperçus de liens : pas des visiteurs, rien à compter.
  if (isBot(userAgent)) return new NextResponse(null, { status: 204 });

  let body: TrackBody;
  try {
    body = (await req.json()) as TrackBody;
  } catch {
    return NextResponse.json(
      { error: "Requête invalide : corps JSON illisible." },
      { status: 400 },
    );
  }

  const { event, ctaId, path, sessionId, referrer, utmSource, utmMedium, utmCampaign } = body;

  if (!event || !ALLOWED_EVENT_TYPES.includes(event as EventType)) {
    return NextResponse.json(
      { error: "Type d'événement invalide." },
      { status: 400 },
    );
  }

  if (ctaId && !ALLOWED_CTA_IDS.includes(ctaId as CtaId)) {
    return NextResponse.json(
      { error: "Identifiant de CTA invalide." },
      { status: 400 },
    );
  }

  const supabase = createServiceClient();
  const { error } = await supabase.from("landing_events").insert({
    event_type: event,
    cta_id: ctaId ?? null,
    path: normalizePath(path) ?? "/landing",
    session_id: typeof sessionId === "string" ? sessionId.slice(0, 100) : null,
    // document.referrer envoyé par le client : l'en-tête Referer de la
    // requête pointe vers la landing elle-même, pas vers le site d'origine.
    referrer: externalReferrer(referrer, req.nextUrl.hostname),
    device: deviceOf(userAgent),
    utm_source: cleanUtm(utmSource),
    utm_medium: cleanUtm(utmMedium),
    utm_campaign: cleanUtm(utmCampaign),
  });

  if (error) {
    return NextResponse.json(
      { error: "Impossible d'enregistrer l'événement." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
