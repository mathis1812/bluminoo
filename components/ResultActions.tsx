"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import EditPanel from "@/components/EditPanel";
import {
  sendAsRedSnap as sendAsRedSnapFn,
  SNAP_UPLOAD_LENS_URL,
} from "@/lib/share-utils";

/**
 * Actions proposées une fois le rendu obtenu, partagées par le studio et
 * les pages de gabarit.
 *
 * Le Red Snap est un avantage des paliers Essentiel et Ultimate, annoncé
 * comme tel sur /pricing. Un abonné Starter voit à la place une invitation
 * à le débloquer : si cette distinction saute, la grille tarifaire ment.
 */
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
  const [sharedOnce, setSharedOnce] = useState(false);
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
      if (patch.sharedOnce !== undefined) setSharedOnce(patch.sharedOnce);
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
        {canShare ? "Save" : "Download"}
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

      {/* Red Snap aux couleurs de Snapchat — le même jaune que la carte du
          menu (#FFFC00), pour que la destination se reconnaisse avant même
          qu'on lise le libellé. */}
      {hasRedSnap ? (
        <button
          type="button"
          onClick={sendAsRedSnap}
          disabled={sendingRedSnap}
          className={SNAP_BUTTON}
        >
          <GhostIcon />
          {sendingRedSnap ? "Preparing…" : "Red Snap"}
          <NewSnapSquare />
        </button>
      ) : (
        <Link href="/pricing" className={SNAP_BUTTON}>
          <GhostIcon />
          Unlock Red Snap
        </Link>
      )}

      {/* Repli, affiché seulement après un partage. Choisir Snapchat dans la
          feuille suffit — la photo y arrive prête à envoyer. Mais certains
          l'enregistrent dans leurs photos par réflexe : pour ceux-là, et pour
          eux seuls, on propose le filtre qui va la rechercher. L'afficher
          d'emblée renverrait tout le monde vers le chemin long. */}
      {sharedOnce && (
        <a
          href={SNAP_UPLOAD_LENS_URL}
          className="text-center text-[14px] leading-5 text-white/45 underline underline-offset-4 transition active:opacity-70"
        >
          Saved to your photos instead? Open the Snapchat filter
        </a>
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
  "flex h-12 items-center justify-center gap-2 rounded-3xl bg-[#FFFC00] px-5 text-[16px] font-semibold text-black transition active:opacity-90 disabled:opacity-60";

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
