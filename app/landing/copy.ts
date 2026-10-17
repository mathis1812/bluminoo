import type { FaqItem } from "@/components/FaqAccordion";

/**
 * Textes de la landing, en anglais (trafic US) et en francais (lancement FR
 * du 14/10). La langue vient de `Accept-Language` (cf. `page.tsx`) : pas de
 * selecteur, le visiteur TikTok arrive deja dans la langue de son telephone.
 *
 * `LandingCopy` est le contrat : une cle oubliee dans une langue casse le
 * typage plutot que d'afficher un trou sur la page.
 */

// Detection de langue partagee avec les prix et le paiement : lib/locale.ts.
import type { Locale } from "@/lib/locale";
export {
  LOCALE_COOKIE,
  localeFromAcceptLanguage,
  resolveLocale,
  type Locale,
} from "@/lib/locale";

export type SnapCopy = { alt: string; from: string; reply: string };

export type LandingCopy = {
  meta: { description: string; ogLocale: string };
  langSwitch: string;
  heroBadge: string;
  heroTitle: [string, string, string];
  heroBody: string;
  ctaLoggedIn: string;
  ctaLoggedOut: string;
  stepsEyebrow: string;
  stepsTitle: string;
  steps: { title: string; body: string }[];
  redSnapEyebrow: string;
  redSnapTitle: string;
  redSnapBody: string;
  regularUpload: string;
  delivered: string;
  cameraRoll: string;
  busted: string;
  deliveredNow: string;
  clean: string;
  friendReply: string;
  templatesEyebrow: string;
  templatesTitle: string;
  templatesBody: string;
  freeEyebrow: string;
  freeTitle: string;
  freeBody: string;
  freePrompt: string;
  freeChips: [string, string, string];
  faqTitle: string;
  faq: FaqItem[];
  finalTitle: string;
  finalBody: string;
  phone: {
    you: string;
    justNow: string;
    delivered: string;
    noCameraRoll: string;
    snaps: [SnapCopy, SnapCopy, SnapCopy, SnapCopy];
  };
  carousel: {
    before: string;
    after: string;
    showTemplate: (n: number) => string;
    alts: [string, string, string, string];
  };
};

const EN: LandingCopy = {
  meta: {
    description:
      "Create a hyper-realistic photo or video of the life you dream about — a place, a scene, a moment — and post it to your story to stun everyone you know.",
    ogLocale: "en_US",
  },
  langSwitch: "Language",
  heroBadge: "Red Snap · no camera roll tag",
  heroTitle: ["Fake it.", "Snap it.", "Nobody knows."],
  heroBody:
    "Generate an ultra-realistic photo in one click and send it straight to Snap — it shows up like you just took it.",
  ctaLoggedIn: "Open the studio",
  ctaLoggedOut: "Create your first snap",
  stepsEyebrow: "HOW IT WORKS",
  stepsTitle: "Three taps. Zero proof.",
  steps: [
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
  ],
  redSnapEyebrow: "RED SNAP",
  redSnapTitle: "Lands like you just took it.",
  redSnapBody:
    "No “camera roll” tag. No border. Nothing to give you away. The Red Snap method sends your pic through Snapchat's camera, so it looks exactly like a snap taken on the spot.",
  regularUpload: "Regular upload",
  delivered: "Delivered",
  cameraRoll: "Camera Roll",
  busted: "Busted",
  deliveredNow: "Delivered · just now",
  clean: "Clean",
  friendReply: "wait where are you right now",
  templatesEyebrow: "TEMPLATES",
  templatesTitle: "One click. Zero prompt.",
  templatesBody:
    "Pranks, supercar swaps, voxel worlds and a lot more. Pick a template, add your photo, and it's ready to snap.",
  freeEyebrow: "FREE MODE",
  freeTitle: "Or make it up from scratch.",
  freeBody:
    "Describe any scene you want, generate up to 4K, then turn it into a video.",
  freePrompt: "me on a yacht in Monaco at sunset",
  freeChips: ["Photo", "Video", "4K"],
  faqTitle: "Questions? Answers.",
  faq: [
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
  ],
  finalTitle: "Your friends are about to believe anything.",
  finalBody:
    "One photo, one click. Ultra-realistic pics your friends will swear are real.",
  phone: {
    you: "You",
    justNow: "just now",
    delivered: "Delivered",
    noCameraRoll: "No camera roll tag",
    snaps: [
      {
        alt: "A woman walking toward a private jet at night.",
        from: "Jordan",
        reply: "since when do you fly private??",
      },
      {
        alt: "A hand on the steering wheel of a Lamborghini.",
        from: "Maya",
        reply: "no way you're driving that rn",
      },
      {
        alt: "A woman standing in front of a black Rolls-Royce at night.",
        from: "Chris",
        reply: "wait whose car is that 😭",
      },
      {
        alt: "Legs stretched out in the back seat of a Maybach.",
        from: "Alex",
        reply: "ok where are you actually",
      },
    ],
  },
  carousel: {
    before: "Before",
    after: "After",
    showTemplate: (n) => `Show template ${n}`,
    alts: [
      "A living room, then the same room with a collapsed ceiling.",
      "A parked saloon car, then the same shot with a sports car.",
      "A hiker on a mountain path, then the same scene as a voxel world.",
      "A fluffy kitten, then the same kitten with its coat shaved.",
    ],
  },
};

// Vocabulaire Snapchat FR : « Pellicule » pour Camera Roll, « Distribué »
// pour Delivered — ce que le visiteur voit dans sa propre app.
const FR: LandingCopy = {
  meta: {
    description:
      "Crée une photo ou une vidéo hyper-réaliste de la vie dont tu rêves — un lieu, une scène, un moment — et poste-la en story pour bluffer tout le monde.",
    ogLocale: "fr_FR",
  },
  langSwitch: "Langue",
  heroBadge: "Red Snap · sans mention Pellicule",
  heroTitle: ["Fake-le.", "Snappe-le.", "Personne ne saura."],
  heroBody:
    "Génère une photo ultra-réaliste en un clic et envoie-la direct sur Snap : elle arrive comme si tu venais de la prendre.",
  ctaLoggedIn: "Ouvrir le studio",
  ctaLoggedOut: "Crée ton premier snap",
  stepsEyebrow: "COMMENT ÇA MARCHE",
  stepsTitle: "Trois clics. Zéro preuve.",
  steps: [
    {
      title: "Dépose un selfie",
      body: "Une photo nette de toi. C'est tout ce qu'il nous faut.",
    },
    {
      title: "Choisis une scène",
      body: "Jet privé, supercar, rooftop, chalet à la montagne. Un clic, zéro prompt.",
    },
    {
      title: "Envoie-la en Red Snap",
      body: "Elle arrive comme si tu venais de la prendre. Plus qu'à attendre les réponses.",
    },
  ],
  redSnapEyebrow: "RED SNAP",
  redSnapTitle: "Comme si tu venais de la prendre.",
  redSnapBody:
    "Pas de mention « Pellicule ». Pas de bordure. Rien qui te trahit. La méthode Red Snap envoie ta photo via la caméra de Snapchat : elle ressemble exactement à un snap pris sur le moment.",
  regularUpload: "Envoi classique",
  delivered: "Distribué",
  cameraRoll: "Pellicule",
  busted: "Grillé",
  deliveredNow: "Distribué · à l'instant",
  clean: "Nickel",
  friendReply: "attends t'es où là",
  templatesEyebrow: "MODÈLES",
  templatesTitle: "Un clic. Zéro prompt.",
  templatesBody:
    "Pranks, swaps de supercar, mondes en voxels et plein d'autres. Choisis un modèle, ajoute ta photo, c'est prêt à snapper.",
  freeEyebrow: "MODE LIBRE",
  freeTitle: "Ou invente tout de A à Z.",
  freeBody:
    "Décris n'importe quelle scène, génère jusqu'en 4K, puis transforme-la en vidéo.",
  freePrompt: "moi sur un yacht à Monaco au coucher du soleil",
  freeChips: ["Photo", "Vidéo", "4K"],
  faqTitle: "Des questions ? Des réponses.",
  faq: [
    {
      question: "Comment ça marche ?",
      answer:
        "Envoie une photo nette de toi, puis choisis un modèle ou décris la scène que tu veux. L'IA t'y place de façon photoréaliste, en gardant ton visage, ta pose et la lumière. Ensuite, tu l'envoies en Red Snap.",
    },
    {
      question: "C'est quoi, un Red Snap ?",
      answer:
        "Une façon d'envoyer ta photo via la caméra de Snapchat au lieu de la joindre. Un envoi classique s'affiche comme une photo de la Pellicule. Un Red Snap s'affiche comme un snap que tu viens de prendre : pas de mention Pellicule, pas de bordure. Le tutoriel de l'app te montre comment faire une fois, ensuite ça prend quelques secondes.",
    },
    {
      question: "Quelles formules incluent le Red Snap ?",
      answer:
        "Pro et Max. Lite couvre la génération d'images en 1K, sans Red Snap ni vidéo.",
    },
    {
      question: "Ça prend combien de temps ?",
      answer:
        "Quelques secondes pour une image, une à deux minutes pour une vidéo. Tu peux lancer un rendu et l'envoyer tout de suite.",
    },
    {
      question: "Je peux utiliser la photo de quelqu'un d'autre ?",
      answer:
        "Seulement tes propres photos, ou celles d'amis qui sont dans la blague. Utiliser la photo de quelqu'un sans son accord est interdit.",
    },
    {
      question: "Mes photos restent privées ?",
      answer:
        "Ta Galerie est privée et liée uniquement à ton compte. La politique de confidentialité liste les sous-traitants qui traitent les photos.",
    },
    {
      question: "Je peux résilier quand je veux ?",
      answer:
        "Oui, depuis ton compte, via le portail sécurisé Stripe. Ta formule reste active jusqu'à la fin de la période déjà payée.",
    },
    {
      question: "Et si le résultat ne me plaît pas ?",
      answer:
        "Le rendu de l'IA varie d'une génération à l'autre : relance-la. Une photo nette, bien éclairée, avec ton visage bien visible donne les meilleurs résultats.",
    },
    {
      question: "Bluminoo est lié à Snapchat ?",
      answer:
        "Non. Bluminoo est une app indépendante, sans lien avec Snap Inc., qui ne la soutient ni ne la sponsorise.",
    },
  ],
  finalTitle: "Tes potes vont croire n'importe quoi.",
  finalBody:
    "Une photo, un clic. Des photos si réalistes que tes potes jureront qu'elles sont vraies.",
  phone: {
    you: "Toi",
    justNow: "à l'instant",
    delivered: "Distribué",
    noCameraRoll: "Sans mention Pellicule",
    snaps: [
      {
        alt: "Une femme marche vers un jet privé, de nuit.",
        from: "Inès",
        reply: "depuis quand tu prends des jets privés ??",
      },
      {
        alt: "Une main sur le volant d'une Lamborghini.",
        from: "Léa",
        reply: "nan t'es pas en train de conduire ça",
      },
      {
        alt: "Une femme devant une Rolls-Royce noire, de nuit.",
        from: "Hugo",
        reply: "attends c'est la voiture de qui 😭",
      },
      {
        alt: "Des jambes allongées à l'arrière d'une Maybach.",
        from: "Alex",
        reply: "ok t'es où en vrai",
      },
    ],
  },
  carousel: {
    before: "Avant",
    after: "Après",
    showTemplate: (n) => `Afficher le modèle ${n}`,
    alts: [
      "Un salon, puis la même pièce avec le plafond effondré.",
      "Une berline garée, puis la même photo avec une voiture de sport.",
      "Un randonneur sur un sentier de montagne, puis la même scène en monde voxel.",
      "Un chaton tout duveteux, puis le même chaton au pelage rasé.",
    ],
  },
};

export const LANDING_COPY: Record<Locale, LandingCopy> = { en: EN, fr: FR };
