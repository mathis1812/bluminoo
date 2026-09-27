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
 * Lien profond vers l'application Snapchat.
 *
 * Remplace le lens « Camera Roll » (`snapchat.com/lens/a9cd4b5d…`) visé
 * jusqu'au 27/09 : ce lens n'est plus d'actualité, et le lien de repli affiché
 * sous le bouton Red Snap envoyait donc les utilisateurs dans le vide.
 *
 * On ouvre l'application, pas un outil : l'outil green screen vit dans la
 * caméra de Snapchat et n'a pas d'URL publique qui l'active. C'est le tutoriel
 * vidéo intégré qui apprend à l'atteindre.
 */
export const SNAPCHAT_APP_URL = "snapchat://";

/**
 * Délai avant d'afficher le bouton de repli « Open Snapchat ».
 *
 * Safari bloque une navigation qui ne part pas d'un geste utilisateur, et
 * `await navigator.share()` consomme le geste du clic d'origine : la
 * redirection automatique qui suit peut donc ne rien faire du tout. Si la page
 * est toujours là passé ce délai, c'est qu'elle a été bloquée, et on rend la
 * main à l'utilisateur — dont le tap fournira un geste frais.
 */
export const SNAPCHAT_FALLBACK_DELAY_MS = 800;

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
   * Redirection vers Snapchat, appelée après un enregistrement abouti.
   *
   * Elle avait été retirée le 24/09 parce qu'elle arrachait de l'écran ceux
   * qui venaient de partager *vers* Snapchat : ils y étaient déjà, et la
   * redirection était une interruption. Depuis le 27/09 le bouton enregistre
   * dans la pellicule au lieu de partager, donc partir vers Snapchat est la
   * suite du geste et non son interruption.
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
  /**
   * Passe à true dès que la feuille d'enregistrement s'est refermée sans
   * annulation. L'UI s'en sert pour afficher les gestes restants et le bouton
   * de repli vers Snapchat.
   */
  savedOnce: boolean;
}

/**
 * « Red Snap » : enregistrer la photo dans la pellicule, puis ouvrir Snapchat.
 *
 * La méthode qui donne son nom au produit se déroule *dans* Snapchat, pas
 * ici : on enregistre la photo, on la met en fond avec l'outil green screen,
 * on sort la tête du cadre et on déclenche. Le snap envoyé est alors une
 * vraie capture caméra — c'est ce qui le distingue d'une pièce jointe, et
 * c'est tout l'intérêt de la fonction.
 *
 * D'où l'enregistrement plutôt que le partage. Jusqu'au 27/09 ce bouton
 * ouvrait la feuille et laissait choisir Snapchat, ce qui y déposait la photo
 * en pièce jointe : le chemin exactement opposé à la méthode, sous le nom de
 * la méthode.
 *
 * Aucune API web n'écrit dans la pellicule sans un geste de l'utilisateur —
 * Apple et Google le bloquent. La feuille de partage, où « Save Image »
 * attend à un tap, reste le plus court chemin qui existe.
 *
 * La redirection est tentée mais jamais garantie : `await navigator.share()`
 * consomme le geste d'origine, et Safari peut bloquer la navigation qui suit.
 * L'appelant affiche donc un bouton de repli au bout de
 * `SNAPCHAT_FALLBACK_DELAY_MS` (cf. `savedOnce`).
 */
export async function sendAsRedSnap(
  result: string,
  setState: (patch: Partial<SendAsRedSnapState>) => void,
  {
    prepareFile = prepareShareFile,
    redirect = (url: string) => {
      window.location.href = url;
    },
  }: ShareDeps = {},
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

    // `savedOnce` avant la redirection : si celle-ci est bloquée, l'UI a déjà
    // de quoi afficher le repli et les gestes restants.
    setState({ savedOnce: true });
    redirect(SNAPCHAT_APP_URL);
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return;
    setState({
      error:
        err instanceof Error
          ? err.message
          : "Saving the photo isn't possible right now.",
    });
  } finally {
    setState({ sendingRedSnap: false });
  }
}
