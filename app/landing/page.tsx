"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { openAuthSheet } from "@/components/AuthSheet";
import FaqAccordion from "@/components/FaqAccordion";
import HeroSlider from "@/components/HeroSlider";
import SpecularButton from "@/components/SpecularButton";
import TemplatesCarousel from "@/components/TemplatesCarousel";
import TestimonialMarquee from "@/components/TestimonialMarquee";
import {
  trackLandingCtaClick,
  trackLandingPageView,
  type LandingCtaId,
} from "@/lib/analytics";
import { createClient } from "@/lib/supabase/client";

const FAQ_ITEMS = [
  {
    question: "How does the image generation work?",
    answer:
      "You send your photo, add 1 to 3 photos of the place you want to appear in (or just describe the scene), and the AI blends you in photorealistically while preserving your face, pose, and the original lighting.",
  },
  {
    question: "How long does it take?",
    answer:
      "A few seconds for an image, one to two minutes for a video. You can start a render and send it right away.",
  },
  {
    question: "Do the photos belong to me?",
    answer:
      "Yes. Your renders are saved in your Gallery, tied to your account, and accessible from any device once you're signed in.",
  },
  {
    question: "What is the Red Snap system?",
    answer:
      "A way of sending your render through Snapchat's camera rather than attaching it. Snapchat tags attached photos as loaded media, which tells the other person the shot came from a gallery. Sent as a Red Snap, it carries no such tag. The tutorial in the app shows the whole thing once, and it takes seconds after that.",
  },
  {
    question: "Which plans include Red Snap?",
    answer:
      "Pro and Max. Lite covers image generation at 1K, without Red Snap or video.",
  },
  {
    question: "Can I cancel my subscription?",
    answer:
      "Yes, anytime from your account area, through the secure management portal. Your plan stays active until the end of the period you've already paid for.",
  },
  {
    question: "Are payments secure?",
    answer:
      "Payments are processed by Stripe. No banking data ever passes through or is stored on our servers.",
  },
  {
    question: "Are my generated photos private?",
    answer:
      "Your Gallery is private and tied only to your account. The privacy policy details the subprocessors used to handle photos.",
  },
  {
    question: "What if I don't like the result?",
    answer:
      "AI output can vary from one generation to the next — just run it again. For best results, use a sharp, well-lit photo with the subject clearly visible.",
  },
];

/** Libellé de bloc du panneau clair : crochets bleus, texte gris espacé. */
function PanelEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-[15px] font-medium tracking-[0.06em] text-[#4f4f4f]">
      <span aria-hidden className="text-[17px] font-normal text-primary">
        [
      </span>
      {children}
      <span aria-hidden className="text-[17px] font-normal text-primary">
        ]
      </span>
    </p>
  );
}

/**
 * Bouton d'appel de la landing, partagé par le hero et les blocs du
 * panneau clair.
 *
 * Un visiteur connecté est envoyé au studio par un vrai lien — la
 * destination doit rester ouvrable dans un nouvel onglet. Un visiteur
 * déconnecté ouvre la feuille de connexion sans quitter la page : c'est un
 * bouton, pas un lien, puisqu'il ne navigue nulle part.
 */
function CtaButton({
  isLoggedIn,
  label,
  ctaId,
  className,
}: {
  isLoggedIn: boolean;
  label: string;
  ctaId: LandingCtaId;
  className: string;
}) {
  const shared = `flex h-[52px] shrink-0 items-center justify-center gap-[22px] rounded-3xl bg-primary text-[17px] font-semibold text-white shadow-[0_0_18px_rgba(2,133,254,0.45),0_0_44px_rgba(2,133,254,0.22)] transition active:opacity-90 ${className}`;

  const content = (
    <>
      {label}
      <span
        aria-hidden
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[15px] border border-white/25 bg-white/20"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="M9 18l6-6-6-6" />
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

  return (
    <button
      type="button"
      onClick={() => {
        trackLandingCtaClick(ctaId);
        // Ces boutons proposent de commencer, pas de se reconnecter : la
        // feuille s'ouvre donc sur la création de compte.
        openAuthSheet("signup");
      }}
      className={shared}
    >
      {content}
    </button>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    trackLandingPageView();
  }, []);

  // Un visiteur déjà connecté n'a rien à faire sur /sign-up : on le
  // renvoie vers le studio plutôt que de lui reproposer de créer un compte.
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

  const ctaLabel = isLoggedIn ? "Open the studio" : "Get started now";

  return (
    <div className="mx-auto max-w-6xl px-4 animate-fade-up">
      {/* HERO — fond noir plein, sans mosaïque derrière : le contraste vient
          du seul bloc média, comme sur le modèle. */}
      <section className="relative flex flex-col items-center gap-5 px-2 pb-16 pt-12 text-center sm:pt-16">
        <h1 className="mx-auto max-w-[19ch] text-[2.5rem] font-[550] leading-[1.08] tracking-tight text-white">
          Send a snap from{" "}
          <span className="bg-gradient-to-r from-[#0285fe] to-[#5ac8fa] bg-clip-text text-transparent">
            somewhere you have never been
          </span>
          .
        </h1>

        <p className="mx-auto max-w-[40ch] text-[17px] leading-[1.55] text-white/60">
          Pick a scene, add your photo, then send it with the Red Snap method.
          It lands as a snap taken on the spot, not as a photo picked from a
          gallery.
        </p>

        <SpecularButton
          size="lg"
          radius={18}
          tint="#ffffff"
          tintOpacity={0}
          blur={0}
          textColor="#f5f5f5"
          lineColor="#ffffff"
          baseColor="#0285fe"
          intensity={2}
          shineSize={10}
          shineFade={40}
          thickness={2.5}
          speed={0.35}
          followMouse
          proximity={250}
          autoAnimate={false}
          className="mt-3 self-center"
          onClick={() => {
            trackLandingCtaClick("hero_primary");
            if (isLoggedIn) {
              router.push("/");
            } else {
              openAuthSheet("signup");
            }
          }}
        >
          {ctaLabel}
        </SpecularButton>

        {/* La landing n'affichait aucun prix et ne menait nulle part vers
            /pricing : le visiteur devait s'inscrire pour decouvrir ce que ca
            coute. Le palier est nomme ici parce que le Red Snap, promesse du
            titre, demande Pro — l'annoncer avant l'inscription vaut mieux que
            de le faire decouvrir derriere un paywall.

            Le montant est ecrit en dur : lib/stripe.ts construit PLANS avec
            envValue(), donc l'importer ici embarquerait la configuration
            Stripe dans le bundle client. Source de verite : PLANS.pro. */}
        <p className="mt-4 text-[14px] text-white/45">
          Red Snap included from $9.99 a week.{" "}
          <Link
            href="/pricing"
            className="text-white/70 underline decoration-white/25 underline-offset-4 transition hover:text-white"
          >
            See plans
          </Link>
        </p>

        <div className="mt-8 flex w-full justify-center">
          <HeroSlider />
        </div>
      </section>

      {/* mx-[calc(50%-50vw)] + w-screen : seul le bandeau doit aller bord à
          bord, indépendamment des paddings cumulés de ce conteneur et de
          <main> (layout) et du plafond max-w-6xl. */}
      <div className="mx-[calc(50%-50vw)] w-screen">
        <TestimonialMarquee />
      </div>

      {/* PANNEAU CLAIR — le geste visuel fort du modèle : un grand pavé
          #fbfbfb à coins 28px encastré dans le noir, texte sombre dedans.
          Trois blocs de structure identique, séparés par un filet.
          Dimensions relevées : pt-20 / pb-[72px], colonne de texte plafonnée
          à 440px, filet my-14. */}
      <section className="mx-[calc(50%-50vw)] mb-14 w-screen rounded-[28px] bg-light pb-[72px] pt-20 text-black">
        <div className="px-6">
          <div className="mx-auto w-full max-w-[440px]">
            <PanelEyebrow>SNAPCHAT</PanelEyebrow>
            <h2 className="mt-6 text-[2rem] font-[550] leading-[1.12] tracking-tight text-[#0f0f10]">
              It arrives as a camera snap, not an import
            </h2>
            <p className="mt-5 text-[16px] leading-[1.55] text-[#4f4f4f]">
              Attach a photo the usual way and Snapchat marks it as loaded
              media. The Red Snap method sends yours through the camera
              instead, so nothing underneath it says where it came from. The
              tutorial inside the app walks you through it once.
            </p>
            <CtaButton
              isLoggedIn={isLoggedIn}
              label={ctaLabel}
              ctaId="panel_snapchat"
              className="mt-9 w-full"
            />

            {/* Aperçu d'une conversation, reconstruit en CSS. */}
            <div className="mt-9 rounded-3xl bg-[rgba(15,15,16,0.05)] p-4">
              <div className="flex items-center gap-2.5">
                <span aria-hidden className="text-[rgba(15,15,16,0.5)]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                  >
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </span>
                <span
                  aria-hidden
                  className="h-7 w-7 shrink-0 rounded-full bg-[rgba(15,15,16,0.18)]"
                />
                <span className="text-[15px] font-semibold text-[#0f0f10]">
                  Alex
                </span>
                <span
                  aria-hidden
                  className="ml-auto flex items-center gap-3 text-[rgba(15,15,16,0.5)]"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M6.6 10.8a15 15 0 006.6 6.6l2.2-2.2a1 1 0 011-.25 11.4 11.4 0 003.6.6 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.6 3.6a1 1 0 01-.25 1l-2.25 2.2z" />
                  </svg>
                  <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                    <path d="M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z" />
                  </svg>
                </span>
              </div>

              <div className="mt-3 rounded-2xl border-l-[3px] border-[#f23b3b] bg-white p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-[#f23b3b]">Me</span>
                  <span className="text-[12px] text-[rgba(15,15,16,0.4)]">
                    10:44
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-[rgba(15,15,16,0.10)] px-3 py-2">
                  <span aria-hidden className="text-[#f23b3b]">
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-3.5 w-3.5"
                    >
                      <path d="M6 4l14 8-14 8V4z" />
                    </svg>
                  </span>
                  <span className="text-[14px] font-semibold text-[#0f0f10]">
                    Delivered
                  </span>
                </div>
              </div>

              {/* La reponse recue, et non l'envoi, est la promesse du produit :
                  c'est le seul element de la maquette qui montre un resultat
                  plutot qu'une fonction. */}
              <div className="mt-2 rounded-2xl border-l-[3px] border-primary bg-white p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-primary">Alex</span>
                  <span className="text-[12px] text-[rgba(15,15,16,0.4)]">
                    10:45
                  </span>
                </div>
                <p className="mt-2 text-[14px] leading-[1.45] text-[#0f0f10]">
                  wait where are you right now
                </p>
              </div>
            </div>
            <hr className="my-14 h-px border-0 bg-[rgba(15,15,16,0.12)]" />

            <PanelEyebrow>TEMPLATES</PanelEyebrow>
            <h2 className="mt-6 text-[2rem] font-[550] leading-[1.12] tracking-tight text-[#0f0f10]">
              Create in one click with templates
            </h2>
            <p className="mt-5 text-[16px] leading-[1.55] text-[#4f4f4f]">
              Browse a full catalogue of ready-made templates: viral pranks,
              vehicle swaps, voxel worlds and plenty more. Pick one, add your
              photo, and it is ready to send.
            </p>
            <CtaButton
              isLoggedIn={isLoggedIn}
              label={ctaLabel}
              ctaId="panel_templates"
              className="mt-9 w-full"
            />
          </div>
        </div>

        {/* Hors de la colonne de 440px : les cartes doivent pouvoir dépasser
            sur les côtés, la suivante restant visible en amorce. */}
        <TemplatesCarousel />

        <div className="px-6">
          <div className="mx-auto w-full max-w-[440px]">
            <hr className="my-14 h-px border-0 bg-[rgba(15,15,16,0.12)]" />

            <PanelEyebrow>FREE MODE</PanelEyebrow>
            <h2 className="mt-6 text-[2rem] font-[550] leading-[1.12] tracking-tight text-[#0f0f10]">
              Generate without limits in free mode
            </h2>
            <p className="mt-5 text-[16px] leading-[1.55] text-[#4f4f4f]">
              Bring your own ideas to life. Describe the scene you have in mind,
              create images up to 4K, then turn any of them into video.
            </p>
            <CtaButton
              isLoggedIn={isLoggedIn}
              label={ctaLabel}
              ctaId="panel_free_mode"
              className="mt-9 w-full"
            />

            {/* Aperçu de la barre de saisie du studio, reconstruit en CSS. */}
            <div className="mt-9 rounded-3xl bg-[rgba(15,15,16,0.05)] p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[15px] text-[rgba(15,15,16,0.45)]">
                  Describe what you want to change…
                </p>
                <span
                  aria-hidden
                  className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-[rgba(15,15,16,0.35)] text-[10px] font-semibold text-[rgba(15,15,16,0.45)]"
                >
                  i
                </span>
              </div>
              <div className="mt-6 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="rounded-full bg-[#3f3f42] px-3.5 py-1.5 text-[13px] font-semibold text-white">
                    Photo
                  </span>
                  <span className="rounded-full bg-[rgba(15,15,16,0.08)] px-3.5 py-1.5 text-[13px] font-medium text-[rgba(15,15,16,0.45)]">
                    Video
                  </span>
                  <span className="rounded-full bg-[rgba(15,15,16,0.08)] px-3 py-1.5 text-[13px] font-medium text-[rgba(15,15,16,0.45)]">
                    4K
                  </span>
                </div>
                <span className="flex items-center gap-2 rounded-full bg-[#3f3f42] px-3 py-1.5 text-[13px] font-semibold text-white">
                  250
                  <span
                    aria-hidden
                    className="flex h-5 w-5 items-center justify-center rounded-full bg-white/25"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-3 w-3"
                    >
                      <path d="M12 19V5M5 12l7-7 7 7" />
                    </svg>
                  </span>
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ — même gabarit de bloc que le panneau clair, mais sur fond noir :
          libellé entre crochets, titre en 2rem, colonne de 440px. Les
          séparateurs sont en pointillés, et un seul panneau reste ouvert. */}
      <section className="px-6 pb-20">
        <div className="mx-auto w-full max-w-[440px]">
          <p className="flex items-center gap-2 text-[15px] font-medium tracking-[0.06em] text-white/60">
            <span aria-hidden className="text-[17px] font-normal text-primary">
              [
            </span>
            F.A.Q
            <span aria-hidden className="text-[17px] font-normal text-primary">
              ]
            </span>
          </p>
          <h2 className="mt-6 text-[2rem] font-[550] leading-[1.12] tracking-tight text-white">
            Frequently asked questions
          </h2>
          <FaqAccordion items={FAQ_ITEMS} />
        </div>
      </section>

      {/* MARQUE GÉANTE — dernier bloc avant le pied de page. Le mot est
          dimensionné en unité de conteneur pour remplir toute la largeur.
          overflow-x-clip contient les débordements de jambages sans créer
          de conteneur de défilement. La marge négative compense l'approche
          gauche de la lettre, sinon le mot paraît décalé vers la droite. */}
      <div className="marque-geante mx-[calc(50%-50vw)] mt-14 w-screen overflow-x-clip px-4">
        <p className="marque-geante-mot -ml-[0.074em] font-bold leading-none tracking-tight text-white">
          Bluminoo
        </p>
      </div>
    </div>
  );
}
