"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import EditPanel from "@/components/EditPanel";
import {
  sendAsRedSnap as sendAsRedSnapFn,
  SNAPCHAT_APP_URL,
  SNAPCHAT_FALLBACK_DELAY_MS,
} from "@/lib/share-utils";

/**
 * Actions proposées une fois le rendu obtenu, partagées par le studio et
 * les pages de gabarit.
 *
 * Le Red Snap est un avantage des paliers Essentiel et Ultimate, annoncé
 * comme tel sur /pricing. Un abonné Starter voit à la place une invitation
 * à le débloquer : si cette distinction saute, la grille tarifaire ment.
 */
/**
 * TEMPORAIRE : rappel des trois gestes Snapchat masqué pendant le tournage
 * des vidéos TikTok, pour que la méthode n'apparaisse pas à l'écran. Repasser
 * à `true` pour le réafficher.
 */
const SHOW_SNAP_STEPS = false;

export default function ResultActions({
  resultUrl,
  hasRedSnap,
  canShare,
  onReset,
  onError,
  onEdited,
  editLabel,
}: {
  resultUrl: string;
  hasRedSnap: boolean;
  canShare: boolean;
  onReset: () => void;
  onError: (message: string) => void;
  /**
   * Remonte l'URL du rendu retouché. Optionnelle : sans elle, le bouton
   * « Edit » n'est pas proposé — c'est ce qui laisse inchangés les appelants
   * qui ne savent pas remplacer leur résultat affiché.
   */
  onEdited?: (imageUrl: string) => void;
  /** Libellé de l'entrée d'origine, repris pour nommer la retouche. */
  editLabel?: string;
}) {
  const [sendingRedSnap, setSendingRedSnap] = useState(false);
  const [savedOnce, setSavedOnce] = useState(false);
  // Passe à true si la page est encore là après la redirection : Safari l'a
  // bloquée, faute de geste utilisateur frais (cf. SNAPCHAT_FALLBACK_DELAY_MS).
  const [snapchatBlocked, setSnapchatBlocked] = useState(false);
  const fallbackTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => clearTimeout(fallbackTimer.current), []);
  const [editing, setEditing] = useState(false);

  const download = useCallback(async () => {
    if (!resultUrl) return;

    const fallbackToAnchor = () => {
      const a = document.createElement("a");
      a.href = resultUrl;
      a.download = "bluminoo-result.png";
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };

    try {
      const res = await fetch(resultUrl);
      const blob = await res.blob();
      const file = new File([blob], "bluminoo-result.png", {
        type: blob.type || "image/png",
      });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
        return;
      }
    } catch (err) {
      // L'utilisateur a simplement fermé la feuille de partage : ne pas
      // enchaîner sur un téléchargement qu'il n'a pas demandé.
      if (err instanceof DOMException && err.name === "AbortError") return;
    }

    fallbackToAnchor();
  }, [resultUrl]);

  const sendAsRedSnap = useCallback(async () => {
    await sendAsRedSnapFn(resultUrl, (patch) => {
      if (patch.sendingRedSnap !== undefined)
        setSendingRedSnap(patch.sendingRedSnap);
      if (patch.savedOnce !== undefined) {
        setSavedOnce(patch.savedOnce);
        // Armé au moment de l'enregistrement, donc juste avant la redirection.
        // S'il arrive à échéance, c'est qu'on n'a pas quitté la page.
        fallbackTimer.current = setTimeout(
          () => setSnapchatBlocked(true),
          SNAPCHAT_FALLBACK_DELAY_MS,
        );
      }
      if (patch.error !== undefined) onError(patch.error);
    });
  }, [resultUrl, onError]);

  if (editing && onEdited) {
    return (
      <div className="mt-4">
        <EditPanel
          sourceUrl={resultUrl}
          label={editLabel}
          onCancel={() => setEditing(false)}
          onEdited={(imageUrl) => {
            setEditing(false);
            onEdited(imageUrl);
          }}
        />
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
      <button type="button" onClick={download} className={LIGHT_BUTTON}>
        {canShare ? "Share" : "Download"}
      </button>

      {onEdited && (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className={LIGHT_BUTTON}
        >
          Edit
        </button>
      )}

      {/* Red Snap au rouge du snap photo (`snapred`), le carré plein que
          Snapchat affiche dans une conversation — et la couleur qui lui donne
          son nom.

          Il portait le jaune Snapchat jusqu'au 27/09, pour que la destination
          se reconnaisse avant le libellé. Le jaune désigne désormais l'action
          dans toute l'app, comme sur la landing : le garder ici aurait noyé le
          bouton parmi les autres. Le rouge le distingue, et il le décrit. */}
      {hasRedSnap ? (
        <button
          type="button"
          onClick={sendAsRedSnap}
          disabled={sendingRedSnap}
          className={SNAP_BUTTON}
        >
          <GhostIcon />
          {sendingRedSnap ? "Saving…" : "Red Snap"}
          <NewSnapSquare />
        </button>
      ) : (
        <Link href="/pricing" className={SNAP_BUTTON}>
          <GhostIcon />
          Unlock Red Snap
        </Link>
      )}

      {/* Après l'enregistrement : les trois gestes qui restent, et qui se
          déroulent dans Snapchat où l'on ne peut plus rien pour l'utilisateur.
          Le tutoriel vidéo les enseigne en entier — ces lignes ne sont qu'un
          rappel, pas un mode d'emploi bis.

          Le bouton n'apparaît que si la redirection a été bloquée : quand
          elle passe, la page est déjà quittée et personne ne le voit. */}
      {savedOnce && (
        <div className="mt-2 w-full">
          {SHOW_SNAP_STEPS && (
            <ol className="mx-auto flex max-w-[22rem] list-decimal flex-col gap-1 pl-5 text-left text-[14px] leading-5 text-white/45">
              <li>Green screen, then pick the photo you just saved</li>
              <li>Step out of the frame</li>
              <li>Take the shot, then send it</li>
            </ol>
          )}

          {snapchatBlocked && (
            <a href={SNAPCHAT_APP_URL} className={`${SNAP_BUTTON} mt-3 w-full`}>
              <GhostIcon />
              Open Snapchat
            </a>
          )}
        </div>
      )}

      {/* Repartir de zéro n'agit pas sur le rendu : le garder discret évite
          qu'il concurrence visuellement les trois actions qui, elles, en
          font quelque chose. */}
      <button
        type="button"
        onClick={onReset}
        className="flex h-12 items-center justify-center rounded-3xl px-4 text-[16px] font-medium text-white/50 transition active:opacity-70"
      >
        New photo
      </button>
    </div>
  );
}

const LIGHT_BUTTON =
  "flex h-12 items-center justify-center rounded-3xl bg-white px-6 text-[16px] font-semibold text-black transition active:opacity-90";

const SNAP_BUTTON =
  "flex h-12 items-center justify-center gap-2 rounded-3xl bg-snapred px-5 text-[16px] font-semibold text-white transition active:opacity-90 disabled:opacity-60";

/**
 * Fantôme dessiné à la main plutôt que le logo Snapchat : une silhouette
 * générique évoque la destination sans reproduire une marque déposée.
 */
function GhostIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-[19px] w-[19px] shrink-0"
    >
      <path d="M12 2.6c-3.2 0-5.6 2.4-5.6 5.5 0 1 0 1.9-.2 2.6-.3.9-1 1.4-1.8 1.6-.4.1-.6.4-.6.8s.3.7.7.8c.6.2 1.2.4 1.5.8.2.3.1.6-.1 1-.2.3-.1.7.2.9.3.2.7.1 1-.1.5-.4 1.1-.5 1.7-.3.7.2 1.3.7 1.9 1.1.4.3.9.5 1.3.5s.9-.2 1.3-.5c.6-.4 1.2-.9 1.9-1.1.6-.2 1.2-.1 1.7.3.3.2.7.3 1 .1.3-.2.4-.6.2-.9-.2-.4-.3-.7-.1-1 .3-.4.9-.6 1.5-.8.4-.1.7-.4.7-.8s-.2-.7-.6-.8c-.8-.2-1.5-.7-1.8-1.6-.2-.7-.2-1.6-.2-2.6 0-3.1-2.4-5.5-5.6-5.5Z" />
    </svg>
  );
}

/**
 * Le carré rouge de Snapchat — celui qui signale un snap reçu — posé à droite
 * du libellé. Purement décoratif : il ne compte rien, il cite le geste.
 */
function NewSnapSquare() {
  return (
    <span
      aria-hidden
      className="ml-0.5 h-[15px] w-[15px] shrink-0 rounded-[4px] bg-[#ff3a3a]"
    />
  );
}
