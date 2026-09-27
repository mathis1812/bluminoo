"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import FaqAccordion from "@/components/FaqAccordion";
import SnapPhone from "@/components/landing/SnapPhone";
import TemplatesCarousel from "@/components/TemplatesCarousel";
import TestimonialMarquee from "@/components/TestimonialMarquee";
import {
  trackLandingCtaClick,
  trackLandingPageView,
  type LandingCtaId,
} from "@/lib/analytics";
import { createClient } from "@/lib/supabase/client";

/**
 * Landing — direction artistique « Fake it. Snap it. » (refonte du 27/09).
 *
 * L'ancienne version reprenait la palette du produit de reference (noir +
 * bleu #0285fe) et ouvrait sur un avant/apres en 16:9. Deux problemes :
 * la page ressemblait a celle d'un concurrent qu'une partie du trafic
 * TikTok a deja vue, et le bleu disait « outil SaaS » la ou la cible
 * (18-24 ans, US) achete un effet entre potes.
 *
 * Nouvelle grammaire, appliquee a toute la page :
 * - noir + jaune Snapchat (`snap`) pour l'action : chaque CTA est jaune ;
 * - rouge du snap photo (`snapred`) pour signaler le Red Snap, en touches ;
 * - le bleu `primary` ne sert plus qu'a l'ami qui repond, comme dans les
 *   conversations Snapchat ou l'autre personne est en bleu.
 * - le visuel du hero montre le snap RECU et la reaction de l'ami : c'est
 *   la promesse du titre, pas une fonction.
 */

const FAQ_ITEMS = [
  {
    question: "How does it work?",
    answer:
      "Upload a clear photo of yourself, then pick a template or describe the scene you want. The AI puts you in it photorealistically, keeping your face, pose and lighting. Then you send it as a Red Snap.",
  },
  {
    question: "What is a Red Snap?",
    answer:
      "A way of sending your pic through Snapchat's camera instead of attaching it. A regular upload shows up as a camera roll photo. A Red Snap shows up like a snap you just took: no camera roll tag, no border. The in-app tutorial walks you through it once, and it takes seconds after that.",
  },
  {
    question: "Which plans include Red Snap?",
    answer:
      "Pro and Max. Lite covers image generation at 1K, without Red Snap or video.",
  },
  {
    question: "How long does it take?",
    answer:
      "A few seconds for an image, one to two minutes for a video. You can start a render and send it right away.",
  },
  {
    question: "Can I use someone else's photo?",
    answer:
      "Only photos of yourself, or of friends who are in on the joke. Using a photo of someone without their permission isn't allowed.",
  },
  {
    question: "Are my photos private?",
    answer:
      "Your Gallery is private and tied only to your account. The privacy policy lists the subprocessors used to handle photos.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes, from your account, through the secure Stripe portal. Your plan stays active until the end of the period you've already paid for.",
  },
  {
    question: "What if I don't like the result?",
    answer:
      "AI output varies from one generation to the next, so just run it again. A sharp, well-lit photo with your face clearly visible gives the best results.",
  },
  {
    question: "Is Bluminoo affiliated with Snapchat?",
    answer:
      "No. Bluminoo is an independent app and is not affiliated with, endorsed by, or sponsored by Snap Inc.",
  },
];

const STEPS = [
  {
    title: "Drop a selfie",
    body: "One clear photo of you. That's the only thing we need.",
  },
  {
    title: "Pick a scene",
    body: "Private jet, supercar, rooftop, snow chalet. One tap, no prompt.",
  },
  {
    title: "Send it as a Red Snap",
    body: "It lands like you just took it. Now wait for the replies.",
  },
];

/** Petit carre plein du snap photo : la signature visuelle du Red Snap. */
function RedSquare({ className = "h-3 w-3" }: { className?: string }) {
  return (
    <span aria-hidden className={`inline-block rounded-[3px] bg-snapred ${className}`} />
  );
}

/** Libelle de bloc : crochets rouges, texte espace. */
function Eyebrow({
  children,
  tone = "light",
}: {
  children: React.ReactNode;
  /** `light` sur le panneau clair, `dark` sur le noir, `snap` sur le jaune. */
  tone?: "light" | "dark" | "snap";
}) {
  const label =
    tone === "dark"
      ? "text-white/60"
      : tone === "snap"
        ? "text-[#121212]"
        : "text-[#4f4f4f]";
  // Sur le jaune, le rouge vibre et perd sa lisibilite : crochets a l'encre.
  const bracket = tone === "snap" ? "text-[#121212]" : "text-snapred";
  return (
    <p
      className={`flex items-center gap-2 text-[15px] font-semibold tracking-[0.08em] ${label}`}
    >
      <span aria-hidden className={`text-[17px] font-normal ${bracket}`}>
        [
      </span>
      {children}
      <span aria-hidden className={`text-[17px] font-normal ${bracket}`}>
        ]
      </span>
    </p>
  );
}

/**
 * Bouton d'appel de la landing, le meme partout : jaune Snapchat, texte
 * encre. Une seule couleur d'action sur toute la page, pour que l'oeil
 * sache ou cliquer sans lire.
 *
 * Un visiteur connecte est envoye au studio par un vrai lien — la
 * destination doit rester ouvrable dans un nouvel onglet. Un visiteur
 * deconnecte ouvre la feuille d'inscription sans quitter la page : c'est un
 * bouton, pas un lien, puisqu'il ne navigue nulle part.
 */
function CtaButton({
  isLoggedIn,
  label,
  ctaId,
  className = "",
}: {
  isLoggedIn: boolean;
  label: string;
  ctaId: LandingCtaId;
  className?: string;
}) {
  const shared = `group flex h-[56px] shrink-0 items-center justify-center gap-4 rounded-full bg-snap pl-7 pr-2 text-[17px] font-bold text-[#121212] shadow-[0_0_24px_rgba(255,252,0,0.35),0_0_60px_rgba(255,252,0,0.15)] transition hover:brightness-95 active:scale-[0.98] ${className}`;

  const content = (
    <>
      {label}
      <span
        aria-hidden
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#121212] text-snap transition group-hover:translate-x-0.5"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </span>
    </>
  );

  if (isLoggedIn) {
    return (
      <Link
        href="/"
        onClick={() => trackLandingCtaClick(ctaId)}
        className={shared}
      >
        {content}
      </Link>
    );
  }

  // Non connecte : on entre dans le studio, pas dans un formulaire. Le
  // visiteur depose sa photo, ecrit sa scene et lance la generation ; rien
  // n'est envoye ni facture, et c'est le paywall en fin de chargement simule
  // qui propose les abonnements (`useStudioGeneration`). Ces boutons
  // ouvraient la creation de compte : il fallait donc un compte pour
  // seulement essayer, alors que c'est l'essai qui donne envie du compte.
  //
  // `?try=1` : sans ce parametre le middleware sert la landing sur `/`, et
  // le bouton ramenerait a la page qu'on vient de quitter.
  return (
    <Link
      href="/?try=1"
      onClick={() => trackLandingCtaClick(ctaId)}
      className={shared}
    >
      {content}
    </Link>
  );
}

export default function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    trackLandingPageView();
  }, []);

  // Un visiteur deja connecte ne doit pas se voir reproposer l'inscription :
  // les CTA l'envoient au studio.
  useEffect(() => {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      return;
    }
    createClient()
      .auth.getSession()
      .then(({ data: { session } }) => {
        setIsLoggedIn(!!session);
      })
      .catch(() => {});
  }, []);

  const ctaLabel = isLoggedIn ? "Open the studio" : "Create your first snap";

  return (
    <div className="mx-auto max-w-6xl px-4 animate-fade-up">
      {/* HERO — mobile d'abord : le trafic vient de TikTok et de Reels.
          Sur grand ecran, le texte passe a gauche et le telephone a droite. */}
      <section className="relative grid items-center gap-12 px-2 pb-20 pt-10 sm:pt-16 lg:grid-cols-[1.1fr_1fr] lg:gap-8 lg:pb-28">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <p className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-[13px] font-semibold text-white/80">
            <RedSquare className="h-2.5 w-2.5" />
            Red Snap · no camera roll tag
          </p>

          <h1 className="mt-6 text-[3.1rem] font-extrabold leading-[0.98] tracking-[-0.04em] text-white sm:text-[4.2rem] lg:text-[4.8rem]">
            Fake it.
            <br />
            Snap it.
            <br />
            <span className="text-snap">Nobody knows.</span>
          </h1>

          <p className="mt-6 max-w-[34ch] text-[18px] leading-[1.5] text-white/65">
            Generate an ultra-realistic photo in one click and send it straight
            to Snap — it shows up like you just took it.
          </p>

          <CtaButton
            isLoggedIn={isLoggedIn}
            label={ctaLabel}
            ctaId="hero_primary"
            className="mt-9 w-full max-w-[340px]"
          />

          {/* Montant ecrit en dur : lib/stripe.ts construit PLANS avec
              envValue(), l'importer ici embarquerait la configuration Stripe
              dans le bundle client. Source de verite : PLANS.pro. */}
          <p className="mt-5 text-[14px] text-white/45">
            <span className="font-semibold text-white/80">Red Snap</span>{" "}
            included from $9.99 a week.{" "}
            <Link
              href="/pricing"
              className="text-white/70 underline decoration-white/25 underline-offset-4 transition hover:text-white"
            >
              See plans
            </Link>
          </p>
        </div>

        <SnapPhone />
      </section>

      {/* Avis : juste sous le hero. La preuve sociale arrive avant
          l'explication — le bandeau defilant se lit d'un coup d'oeil, donc il
          rassure sans retarder la demo qui suit. */}
      <div className="mx-[calc(50%-50vw)] w-screen">
        <TestimonialMarquee />
      </div>

      {/* COMMENT CA MARCHE — trois etapes, pas plus : le visiteur doit
          comprendre qu'il n'a rien a ecrire ni a savoir faire. */}
      <section className="px-2 pb-20">
        <div className="mx-auto max-w-[960px]">
          <Eyebrow tone="dark">HOW IT WORKS</Eyebrow>
          <h2 className="mt-6 text-[2.25rem] font-extrabold leading-[1.05] tracking-[-0.03em] text-white">
            Three taps. Zero proof.
          </h2>
          <ol className="mt-10 grid gap-3 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <li
                key={step.title}
                className="rounded-3xl border border-line bg-panel p-6"
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-[15px] font-extrabold ${
                    i === STEPS.length - 1
                      ? "bg-snapred text-white"
                      : "bg-white/10 text-white"
                  }`}
                >
                  {i + 1}
                </span>
                <h3 className="mt-5 text-[19px] font-bold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-[15px] leading-[1.5] text-white/55">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* PANNEAU CLAIR — un grand pave clair encastre dans le noir, ouvert
          par la bande jaune Snapchat. Bornes du degrade en pixels et non en
          pourcentages : la hauteur du panneau varie avec le contenu, et un
          pourcentage etirerait le jaune. Fin du degrade sur le meme RVB a
          alpha nul : `transparent` vire au gris sur WebKit. */}
      <section
        className="mx-[calc(50%-50vw)] mb-4 w-screen rounded-[28px] bg-light pb-[72px] pt-20 text-black"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, #FFFC00 0px, #FFFC00 190px, rgba(251, 251, 251, 0) 560px)",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="px-6">
          <div className="mx-auto w-full max-w-[440px]">
            <Eyebrow tone="snap">RED SNAP</Eyebrow>
            <h2 className="mt-6 text-[2.25rem] font-extrabold leading-[1.05] tracking-[-0.03em] text-[#0f0f10]">
              Lands like you just took it.
            </h2>
            <p className="mt-5 text-[16px] leading-[1.55] text-[#3a3a3a]">
              No &ldquo;camera roll&rdquo; tag. No border. Nothing to give you
              away. The Red Snap method sends your pic through Snapchat&apos;s
              camera, so it looks exactly like a snap taken on the spot.
            </p>

            {/* Comparaison cote a cote : c'est la preuve de la promesse. Une
                phrase peut etre mise en doute, deux lignes de conversation
                l'une sous l'autre, non. */}
            <div className="mt-9 grid gap-2.5">
              <div className="flex items-center gap-3 rounded-2xl border border-[rgba(15,15,16,0.08)] bg-white p-3.5 opacity-70">
                <span
                  aria-hidden
                  className="h-9 w-9 shrink-0 rounded-full bg-[rgba(15,15,16,0.12)]"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-[#0f0f10]">
                    Regular upload
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-[rgba(15,15,16,0.5)]">
                    <RedSquare className="h-2.5 w-2.5" />
                    Delivered ·{" "}
                    <span className="rounded bg-[rgba(15,15,16,0.08)] px-1.5 py-px text-[12px] font-semibold text-[rgba(15,15,16,0.7)]">
                      Camera Roll
                    </span>
                  </p>
                </div>
                <span className="text-[12px] font-bold uppercase tracking-wide text-[rgba(15,15,16,0.4)]">
                  Busted
                </span>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border-2 border-[#121212] bg-white p-3.5 shadow-[0_8px_24px_rgba(15,15,16,0.10)]">
                <span
                  aria-hidden
                  className="h-9 w-9 shrink-0 rounded-full border-2 border-snap bg-[rgba(15,15,16,0.12)]"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-[#0f0f10]">
                    Red Snap
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-[rgba(15,15,16,0.6)]">
                    <RedSquare className="h-2.5 w-2.5" />
                    Delivered · just now
                  </p>
                </div>
                <span className="rounded-full bg-snap px-2.5 py-1 text-[12px] font-bold uppercase tracking-wide text-[#121212]">
                  Clean
                </span>
              </div>

              {/* La reponse de l'ami : le seul element qui montre un
                  resultat plutot qu'une fonction. */}
              <div className="ml-12 rounded-2xl border-l-[3px] border-primary bg-white p-3">
                <p className="text-[13px] font-bold text-primary">Alex</p>
                <p className="mt-1 text-[14px] leading-[1.45] text-[#0f0f10]">
                  wait where are you right now
                </p>
              </div>
            </div>

            <CtaButton
              isLoggedIn={isLoggedIn}
              label={ctaLabel}
              ctaId="panel_snapchat"
              className="mt-9 w-full"
            />

            <hr className="my-14 h-px border-0 bg-[rgba(15,15,16,0.12)]" />

            <Eyebrow>TEMPLATES</Eyebrow>
            <h2 className="mt-6 text-[2.25rem] font-extrabold leading-[1.05] tracking-[-0.03em] text-[#0f0f10]">
              One click. Zero prompt.
            </h2>
            <p className="mt-5 text-[16px] leading-[1.55] text-[#3a3a3a]">
              Pranks, supercar swaps, voxel worlds and a lot more. Pick a
              template, add your photo, and it&apos;s ready to snap.
            </p>
            <CtaButton
              isLoggedIn={isLoggedIn}
              label={ctaLabel}
              ctaId="panel_templates"
              className="mt-9 w-full"
            />
          </div>
        </div>

        {/* Hors de la colonne de 440px : les cartes doivent pouvoir depasser
            sur les cotes, la suivante restant visible en amorce. */}
        <TemplatesCarousel />

        <div className="px-6">
          <div className="mx-auto w-full max-w-[440px]">
            <hr className="my-14 h-px border-0 bg-[rgba(15,15,16,0.12)]" />

            <Eyebrow>FREE MODE</Eyebrow>
            <h2 className="mt-6 text-[2.25rem] font-extrabold leading-[1.05] tracking-[-0.03em] text-[#0f0f10]">
              Or make it up from scratch.
            </h2>
            <p className="mt-5 text-[16px] leading-[1.55] text-[#3a3a3a]">
              Describe any scene you want, generate up to 4K, then turn it
              into a video.
            </p>

            {/* Apercu de la barre de saisie du studio, reconstruit en CSS. */}
            <div className="mt-9 rounded-3xl bg-[rgba(15,15,16,0.05)] p-4">
              <p className="text-[15px] text-[rgba(15,15,16,0.7)]">
                me on a yacht in Monaco at sunset
                <span
                  aria-hidden
                  className="ml-0.5 inline-block h-[1.1em] w-[2px] translate-y-[3px] animate-pulse bg-[#0f0f10]"
                />
              </p>
              <div className="mt-6 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="rounded-full bg-[#121212] px-3.5 py-1.5 text-[13px] font-semibold text-white">
                    Photo
                  </span>
                  <span className="rounded-full bg-[rgba(15,15,16,0.08)] px-3.5 py-1.5 text-[13px] font-medium text-[rgba(15,15,16,0.5)]">
                    Video
                  </span>
                  <span className="rounded-full bg-[rgba(15,15,16,0.08)] px-3 py-1.5 text-[13px] font-medium text-[rgba(15,15,16,0.5)]">
                    4K
                  </span>
                </div>
                <span
                  aria-hidden
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-snap text-[#121212]"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3.5 w-3.5"
                  >
                    <path d="M12 19V5M5 12l7-7 7 7" />
                  </svg>
                </span>
              </div>
            </div>

            <CtaButton
              isLoggedIn={isLoggedIn}
              label={ctaLabel}
              ctaId="panel_free_mode"
              className="mt-9 w-full"
            />
          </div>
        </div>
      </section>

      {/* FAQ — meme gabarit de bloc que le panneau clair, sur fond noir. */}
      <section className="px-6 pb-20">
        <div className="mx-auto w-full max-w-[440px]">
          <Eyebrow tone="dark">F.A.Q</Eyebrow>
          <h2 className="mt-6 text-[2.25rem] font-extrabold leading-[1.05] tracking-[-0.03em] text-white">
            Questions? Answers.
          </h2>
          <FaqAccordion items={FAQ_ITEMS} />
        </div>
      </section>

      {/* DERNIER APPEL — le visiteur qui a tout lu jusqu'ici doit trouver un
          bouton sans remonter la page. */}
      <section className="px-2 pb-8">
        <div className="relative mx-auto max-w-[960px] overflow-hidden rounded-[28px] bg-snap px-6 py-14 text-center">
          <h2 className="mx-auto max-w-[16ch] text-[2.4rem] font-extrabold leading-[1.02] tracking-[-0.04em] text-[#121212] sm:text-[3.2rem]">
            Your friends are about to believe anything.
          </h2>
          <p className="mx-auto mt-4 max-w-[36ch] text-[16px] text-[#121212]/70">
            One photo, one click. Ultra-realistic pics your friends will swear
            are real.
          </p>
          <div className="mt-8 flex justify-center">
            {/* Sur le jaune, le bouton passe en encre : un CTA jaune sur fond
                jaune disparaitrait. */}
            {isLoggedIn ? (
              <Link
                href="/"
                onClick={() => trackLandingCtaClick("final_cta")}
                className="flex h-[56px] items-center justify-center rounded-full bg-[#121212] px-8 text-[17px] font-bold text-white transition hover:bg-black"
              >
                {ctaLabel}
              </Link>
            ) : (
              <Link
                href="/?try=1"
                onClick={() => trackLandingCtaClick("final_cta")}
                className="flex h-[56px] items-center justify-center rounded-full bg-[#121212] px-8 text-[17px] font-bold text-white transition hover:bg-black"
              >
                {ctaLabel}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* MARQUE GEANTE — dimensionnee en unite de conteneur pour remplir
          toute la largeur (cf. .marque-geante dans globals.css). */}
      <div className="marque-geante mx-[calc(50%-50vw)] mt-14 w-screen overflow-x-clip px-4">
        <p className="marque-geante-mot -ml-[0.074em] font-bold leading-none tracking-tight text-white">
          Bluminoo
        </p>
      </div>
    </div>
  );
}
