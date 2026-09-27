"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

/**
 * Visuel du hero : un snap vu COTE DESTINATAIRE.
 *
 * L'ancien hero montrait un avant/apres en 16:9. Il prouvait la qualite de
 * generation, mais pas la promesse du titre (« Nobody knows ») : ce qui fait
 * convertir, c'est de voir le snap arriver chez un ami comme un vrai, et
 * l'ami y croire. D'ou un ecran vertical (le format natif de Snapchat) et une
 * reponse qui tombe apres chaque photo.
 *
 * Les images sont des rendus verticaux de `public/landing/showcase/`
 * (700 x 1254), jusque-la inutilises.
 *
 * On n'affiche ni le logo fantome ni l'interface exacte de Snapchat : un
 * rappel (jaune, carre rouge du snap photo) suffit a situer la scene sans
 * laisser croire a un produit officiel de Snap Inc.
 */

const SLIDE_DURATION_MS = 3_600;
/** Delai avant que la reponse de l'ami n'apparaisse sur chaque photo. */
const REPLY_DELAY_MS = 1_100;

type Snap = {
  src: string;
  alt: string;
  from: string;
  reply: string;
};

const SNAPS: Snap[] = [
  {
    src: "/landing/showcase/3.webp",
    alt: "A woman walking toward a private jet at night.",
    from: "Jordan",
    reply: "since when do you fly private??",
  },
  {
    src: "/landing/showcase/12.webp",
    alt: "A hand on the steering wheel of a Lamborghini.",
    from: "Maya",
    reply: "no way you're driving that rn",
  },
  {
    src: "/landing/showcase/8.webp",
    alt: "A woman standing in front of a black Rolls-Royce at night.",
    from: "Chris",
    reply: "wait whose car is that 😭",
  },
  {
    src: "/landing/showcase/13.webp",
    alt: "Legs stretched out in the back seat of a Maybach.",
    from: "Alex",
    reply: "ok where are you actually",
  },
];

export default function SnapPhone() {
  const [index, setIndex] = useState(0);
  const [showReply, setShowReply] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % SNAPS.length);
    }, SLIDE_DURATION_MS);
    return () => clearInterval(timer);
  }, []);

  // La reponse repart de zero a chaque photo : elle doit arriver APRES le
  // snap, sinon on ne lit plus la sequence « snap recu -> ami bluffe ».
  useEffect(() => {
    setShowReply(false);
    const timer = setTimeout(() => setShowReply(true), REPLY_DELAY_MS);
    return () => clearTimeout(timer);
  }, [index]);

  const snap = SNAPS[index];

  return (
    <div className="relative mx-auto w-full max-w-[300px]">
      {/* Halo jaune derriere le telephone : seule source de couleur du hero,
          il attire l'oeil sur la demo plutot que sur le fond. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-10 -z-10 rounded-full bg-snap/20 blur-3xl"
      />

      <div className="rounded-[40px] border border-white/10 bg-[#0b0b0b] p-2 shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
        <div className="relative aspect-[700/1254] w-full overflow-hidden rounded-[32px] bg-black">
          {/* Toutes les images restent montees et se relaient en fondu :
              demonter/remonter une <Image> ferait clignoter le noir entre
              deux snaps. */}
          {SNAPS.map((item, i) => (
            <Image
              key={item.src}
              src={item.src}
              alt={item.alt}
              fill
              sizes="300px"
              priority={i === 0}
              className={`object-cover transition-opacity duration-700 ${
                i === index ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}

          {/* En-tete du snap ouvert : expediteur, horodatage, barre de
              progression — ce qui fait lire l'image comme un snap recu. */}
          <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/60 to-transparent px-3 pb-8 pt-3">
            <div className="h-[3px] w-full overflow-hidden rounded-full bg-white/30">
              <div
                key={index}
                className="h-full w-full origin-left bg-white motion-safe:animate-snap-timer"
              />
            </div>
            <div className="mt-2.5 flex items-center gap-2">
              <span
                aria-hidden
                className="h-7 w-7 shrink-0 rounded-full border-2 border-snap bg-white/25"
              />
              <span className="text-[14px] font-semibold text-white">You</span>
              <span className="text-[12px] text-white/70">just now</span>
            </div>
          </div>

          {/* La reponse de l'ami : le « resultat » que vend le produit. */}
          <div className="absolute inset-x-3 bottom-3">
            <div
              className={`rounded-2xl border-l-[3px] border-primary bg-white/95 px-3 py-2.5 text-left shadow-lg backdrop-blur transition-all duration-500 ${
                showReply
                  ? "translate-y-0 opacity-100"
                  : "translate-y-3 opacity-0"
              }`}
            >
              <p className="text-[12px] font-bold text-primary">{snap.from}</p>
              <p className="mt-0.5 text-[14px] leading-snug text-[#0f0f10]">
                {snap.reply}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pastille « Red Snap » accrochee au telephone : rappelle que le snap
          est parti par la camera, sans mention pellicule. */}
      <div className="absolute -right-3 top-24 flex items-center gap-2 rounded-full bg-white px-3 py-2 text-[13px] font-semibold text-[#0f0f10] shadow-xl sm:-right-10">
        <span aria-hidden className="h-3 w-3 rounded-[3px] bg-snapred" />
        Delivered
      </div>
      <div className="absolute -left-3 bottom-28 rounded-full bg-[#121212] px-3 py-2 text-[13px] font-semibold text-white shadow-xl ring-1 ring-white/10 sm:-left-10">
        No camera roll tag
      </div>
    </div>
  );
}
