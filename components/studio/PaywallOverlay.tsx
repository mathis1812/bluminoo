import Link from "next/link";

/**
 * Écran du paywall, commun au studio et aux templates : la photo du visiteur
 * floutée, comme si sa scène était déjà prête, et un bouton au carré rouge
 * du snap photo — il ne débloque pas une image, il envoie un snap.
 *
 * `previewUrl` est l'aperçu local (blob) de la photo déposée : il ne quitte
 * jamais le navigateur, le paywall garantit qu'aucune photo d'un visiteur
 * non abonné n'est envoyée.
 */
export default function PaywallOverlay({ previewUrl }: { previewUrl: string }) {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={previewUrl}
        alt=""
        aria-hidden
        className="h-full w-full scale-110 object-cover blur-xl"
      />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/50 px-8 text-center">
        <p className="text-[19px] font-semibold text-white">
          Ta scène est prête
        </p>
        <p className="text-[15px] leading-[1.5] text-white/70">
          Abonne-toi pour l&apos;envoyer à tes amis.
        </p>
        <Link
          href="/pricing"
          className="mt-1 flex h-12 items-center justify-center gap-2.5 rounded-3xl bg-snapred px-6 text-[16px] font-semibold text-white transition active:opacity-90"
        >
          <span aria-hidden className="h-3.5 w-3.5 rounded-[3px] bg-white" />
          Envoyer le snap
        </Link>
      </div>
    </div>
  );
}
