"use client";

/**
 * L'état « génération en cours », partagé par le studio et les gabarits.
 *
 * Le fond est la photo du client, floutée et assombrie : elle occupe le cadre
 * pendant l'attente, donc l'écran ne se vide jamais et le client garde sous
 * les yeux ce sur quoi il travaille. Un aplat de couleur avait été essayé le
 * 09/09 (repris du produit de référence, bleu quadrillé) et écarté.
 *
 * Par-dessus, le mot-symbole en grand, puis la progression chiffrée. Les
 * deux écrans en avaient chacun leur copie — c'est ce qui les aurait fait
 * diverger au premier ajustement.
 */
export default function GeneratingCard({
  message,
  progressPercent,
  previewUrl,
}: {
  message: string;
  /** Progression perçue, 0-92. Cf. `useElapsedProgress`. */
  progressPercent: number;
  /** Photo source à flouter. Absente, le fond retombe sur un noir plein. */
  previewUrl?: string;
}) {
  return (
    <div
      className="absolute inset-0 overflow-hidden bg-black"
      role="status"
      aria-live="polite"
    >
      {previewUrl && (
        <>
          {/* scale-110 : le flou érode les bords, l'agrandissement évite la
              frange claire qui apparaîtrait sinon au ras du cadre. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full scale-110 object-cover blur-2xl"
          />
          {/* Voile sombre : sans lui, une photo claire rendrait le texte
              blanc illisible. */}
          <div aria-hidden className="absolute inset-0 bg-black/55" />
        </>
      )}

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-8 text-center">
        {/* `pb-1` : les lettres descendantes seraient rognées par le
            découpage du dégradé sans cette marge basse. */}
        <p className="wordmark-working pb-1 text-[2.75rem] font-bold leading-none tracking-title text-white">
          Bluminoo
        </p>

        <div className="flex w-full max-w-[220px] flex-col items-center gap-2">
          <div className="h-1 w-full overflow-hidden rounded-full bg-white/15">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-1000 ease-linear"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {/* tabular-nums : sans lui, la largeur du nombre change à chaque
              chiffre et le pourcentage tressaute sous la barre. */}
          <p className="text-[13px] font-semibold tabular-nums text-white/80">
            {progressPercent}%
          </p>
        </div>

        <p className="text-[14px] leading-snug text-white/60">{message}</p>
      </div>
    </div>
  );
}
