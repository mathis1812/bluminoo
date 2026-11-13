"use client";

import { isTrackingOff, parseAcquisition } from "@/lib/acquisition";

const TRACK_ENDPOINT = "/api/track";
const SESSION_STORAGE_KEY = "bluminoo_landing_session_id";

// Toute modification ici doit être répercutée dans ALLOWED_CTA_IDS
// (app/api/track/route.ts) : le serveur rejette les identifiants absents de
// sa propre liste, et le clic serait perdu sans erreur visible.
export type LandingCtaId =
  | "hero_primary"
  | "panel_templates"
  | "panel_free_mode"
  | "panel_snapchat"
  | "final_cta";

/**
 * Identifiant de session éphémère (sessionStorage, pas de cookie tiers ni de
 * PII) pour pouvoir relier une visite /landing à ses propres clics dans la
 * même session, sans rien partager entre visiteurs.
 */
function getSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}

// La provenance ne part qu'avec la première page vue après un chargement :
// document.referrer ne change pas pendant la navigation interne de Next, et
// chaque page de la visite serait sinon attribuée au site d'origine.
let isFirstView = true;

function arrival() {
  const utm = parseAcquisition(window.location.search, "", window.location.hostname, navigator.userAgent);
  return {
    referrer: document.referrer,
    utmSource: utm?.utm_source,
    utmMedium: utm?.utm_medium,
    utmCampaign: utm?.utm_campaign,
  };
}

function send(event: "page_view" | "cta_click", ctaId?: LandingCtaId) {
  if (typeof window === "undefined" || isTrackingOff()) return;

  const isArrival = event === "page_view" && isFirstView;
  if (event === "page_view") isFirstView = false;

  const payload = JSON.stringify({
    event,
    ctaId,
    path: window.location.pathname,
    sessionId: getSessionId(),
    ...(isArrival ? arrival() : {}),
  });

  // sendBeacon survit à la navigation déclenchée par le clic CTA (un fetch
  // classique peut être annulé par le changement de page) ; fallback fetch
  // keepalive si sendBeacon est indisponible.
  if (navigator.sendBeacon) {
    const blob = new Blob([payload], { type: "application/json" });
    if (navigator.sendBeacon(TRACK_ENDPOINT, blob)) return;
  }

  fetch(TRACK_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: payload,
    keepalive: true,
  }).catch(() => {
    // Best-effort : un échec de tracking ne doit jamais bloquer l'usage.
  });
}

/** Une page vue, n'importe où sur le site (appelé par components/PageTracker). */
export function trackPageView() {
  send("page_view");
}

export function trackLandingCtaClick(ctaId: LandingCtaId) {
  send("cta_click", ctaId);
}