/**
 * lib/share-utils.ts
 *
 * Extracted share-button handlers for the Bluminoo web app.
 * Keeping them here (rather than inline in app/page.tsx) lets Vitest import
 * the exact production functions — no duplication, no drift.
 *
 * Imported by:
 *   - app/page.tsx  (production React component)
 *   - __tests__/share-button.test.tsx  (Vitest regression suite)
 */

// ── Constants ────────────────────────────────────────────────────────────────

export const SNAP_SHARE_MAX_DIMENSION = 1600;
export const SNAP_SHARE_JPEG_QUALITY = 0.85;

/**
 * Official Snapchat "Camera Roll" lens — opens directly in Snapchat's camera
 * on mobile, letting the user pick a photo from their library and apply it as
 * a filter without having to search manually.
 */
export const SNAP_UPLOAD_LENS_URL =
  "https://www.snapchat.com/lens/a9cd4b5d2687457eb0be82bd332a2a74";

// ── prepareShareFile ─────────────────────────────────────────────────────────

/**
 * Converts the result (often a high-resolution PNG) into a resized JPEG before
 * passing it to navigator.share(). Snapchat share-extensions on iOS have very
 * limited memory and display a black screen / crash with large PNGs; a lighter
 * JPEG fixes the problem.
 */
export async function prepareShareFile(blob: Blob): Promise<File> {
  const objectUrl = URL.createObjectURL(blob);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Unable to read image."));
      image.src = objectUrl;
    });

    const { width, height } = img;
    const longSide = Math.max(width, height);
    const scale =
      longSide > SNAP_SHARE_MAX_DIMENSION
        ? SNAP_SHARE_MAX_DIMENSION / longSide
        : 1;
    const targetW = Math.round(width * scale);
    const targetH = Math.round(height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Unable to prepare share.");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, targetW, targetH);
    ctx.drawImage(img, 0, 0, targetW, targetH);

    const shareBlob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", SNAP_SHARE_JPEG_QUALITY),
    );
    if (!shareBlob) throw new Error("Unable to prepare share.");

    return new File([shareBlob], "bluminoo-result.jpg", {
      type: "image/jpeg",
    });
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

// ── Shared types ─────────────────────────────────────────────────────────────

/** Injectable dependencies — swap out heavy browser APIs in tests. */
export interface ShareDeps {
  /** Convert the raw result blob to the final File to share. Defaults to prepareShareFile. */
  prepareFile?: (blob: Blob) => Promise<File>;
  /**
   * Point d'injection d'une redirection. **Délibérément inutilisé** : le flux
   * Red Snap s'arrête à la feuille de partage depuis le 24/09. Il reste
   * déclaré pour que le test de non-régression puisse vérifier que personne
   * n'a réintroduit de redirection automatique — elle arrachait de l'écran
   * les gens qui venaient de partager vers Snapchat.
   */
  redirect?: (url: string) => void;
}

// ── shareToSnapchat ──────────────────────────────────────────────────────────

export interface ShareToSnapchatState {
  sharing: boolean;
  error: string;
}

/**
 * Fetches the generated result, converts it to a share-friendly JPEG, and
 * opens the native share sheet. Intended for sharing directly to Snapchat.
 *
 * Design notes (from hard-won testing on iOS):
 * - Only pass `files`; adding `title`/`text` causes Snapchat's share extension
 *   to render a black screen (known iOS compositing bug with captions).
 * - Use a JPEG ≤ 1600 px on the long side — Snapchat extensions OOM on large PNGs.
 */
export async function shareToSnapchat(
  result: string,
  setState: (patch: Partial<ShareToSnapchatState>) => void,
  { prepareFile = prepareShareFile }: ShareDeps = {},
): Promise<void> {
  if (!result) return;
  if (!navigator.share) {
    setState({
      error:
        "Direct sharing is available from a compatible phone. Download the image if needed.",
    });
    return;
  }

  setState({ sharing: true, error: "" });
  try {
    const response = await fetch(result);
    if (!response.ok) {
      throw new Error("The result can't be prepared for sharing.");
    }
    const blob = await response.blob();
    const file = await prepareFile(blob);

    if (navigator.canShare && !navigator.canShare({ files: [file] })) {
      throw new Error(
        "File sharing isn't supported by this browser.",
      );
    }

    // Pass files only — no title/text (Snapchat iOS share-extension bug).
    await navigator.share({ files: [file] });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return;
    setState({
      error:
        err instanceof Error
          ? err.message
          : "Sharing the photo isn't possible right now.",
    });
  } finally {
    setState({ sharing: false });
  }
}

// ── sendAsRedSnap ────────────────────────────────────────────────────────────

export interface SendAsRedSnapState {
  sendingRedSnap: boolean;
  error: string;
  /** Passe à true après un partage abouti : l'UI peut alors proposer le repli. */
  sharedOnce: boolean;
}

/**
 * "Red Snap" : on ouvre la feuille de partage native, et c'est tout.
 *
 * Snapchat y figure comme destination, et son extension de partage ouvre
 * l'application avec la photo déjà chargée, prête à envoyer. Deux gestes en
 * tout : Red Snap, puis Snapchat dans la liste. La photo ne passe jamais par
 * la pellicule, et aucun filtre n'est à retrouver.
 *
 * Cette fonction redirigeait auparavant vers le lens « Camera Roll » juste
 * après la feuille. Ça poussait tout le monde vers le chemin long — tout
 * enregistrer, ouvrir le lens, retrouver la photo, quatre gestes — et ça
 * arrachait de l'écran ceux qui venaient justement de partager vers
 * Snapchat. Le lens reste accessible, mais en repli proposé par l'UI
 * (`sharedOnce`), pour qui a enregistré la photo au lieu de la partager.
 *
 * Rien de tout cela ne permet d'écrire dans la pellicule sans geste de
 * l'utilisateur : Apple et Google le bloquent, aucune API web n'y donne
 * accès. La feuille de partage est le plus court chemin qui existe.
 */
export async function sendAsRedSnap(
  result: string,
  setState: (patch: Partial<SendAsRedSnapState>) => void,
  { prepareFile = prepareShareFile }: ShareDeps = {},
): Promise<void> {
  if (!result) return;
  if (!navigator.share) {
    setState({
      error: "This feature is available from a compatible phone.",
    });
    return;
  }

  setState({ sendingRedSnap: true, error: "" });
  try {
    const response = await fetch(result);
    if (!response.ok) {
      throw new Error("The result can't be prepared.");
    }
    const blob = await response.blob();
    const file = await prepareFile(blob);

    if (navigator.canShare && !navigator.canShare({ files: [file] })) {
      throw new Error(
        "File sharing isn't supported by this browser.",
      );
    }

    await navigator.share({ files: [file] });

    // Pas de redirection : si l'utilisateur a choisi Snapchat, il y est déjà
    // avec sa photo. On signale seulement que le partage a eu lieu, pour que
    // l'UI propose le lens à qui aurait plutôt enregistré l'image.
    setState({ sharedOnce: true });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return;
    setState({
      error:
        err instanceof Error
          ? err.message
          : "Sending as Red Snap isn't possible right now.",
    });
  } finally {
    setState({ sendingRedSnap: false });
  }
}
