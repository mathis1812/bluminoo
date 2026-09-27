import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Palette relevée sur usenoway.com : noir pur, accent bleu vif, et
        // un grand panneau clair qui vient trancher dans le noir.
        ink: "#000000",
        panel: "#0c1111",
        line: "#232828",
        light: "#fbfbfb",
        // Jaune officiel de Snapchat, et couleur de L'ACTION dans tout le
        // produit : chaque bouton qui fait avancer — Generate, Continue,
        // Top up, See the plans — le porte, landing comprise.
        //
        // Il est tres clair : tout element qui le prend passe son texte a
        // l'encre (#121212). Du blanc dessus tombe sous 1,1:1 de contraste,
        // donc illisible.
        snap: "#FFFC00",
        // Rouge du snap photo (le carre plein « Delivered »), la couleur qui
        // donne son nom au Red Snap. Elle le signale partout : le bouton du
        // rendu, la carte du menu, les touches de la landing.
        //
        // Le bouton Red Snap portait le jaune jusqu'au 27/09. Depuis que le
        // jaune designe l'action, le garder l'aurait noye parmi les autres
        // boutons — et le rouge, lui, decrit ce qu'il envoie.
        snapred: "#F23B3B",
        muted: "#a8a8a8",
        faint: "#4f4f4f",
        // Le bleu n'est plus la couleur de l'action depuis le 27/09. Il lui
        // reste l'information et l'etat : barre de progression, pastilles de
        // selection, badges. Sur la landing, c'est l'ami qui repond.
        primary: {
          DEFAULT: "#0285fe",
          soft: "#4da8ff",
          deep: "#0166c7",
        },
      },
      fontFamily: {
        // Une seule famille sur tout le site, comme le modèle. Les deux
        // alias sont conservés le temps de la refonte : le balisage existant
        // utilise encore font-display et font-body un peu partout.
        display: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        body: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        // L'interlettrage négatif des titres est la signature typographique
        // du modèle : -1px à 40px, -0.8px à 32px.
        title: "-0.025em",
        display: "-0.03em",
      },
      animation: {
        "fade-up": "fade-up 0.55s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-up-delay":
          "fade-up 0.65s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both",
        reveal: "reveal 0.7s cubic-bezier(0.16, 1, 0.3, 1) both",
        "magic-reveal": "magic-reveal 0.9s cubic-bezier(0.16, 1, 0.3, 1) both",
        "marquee-left": "marquee-left 80s linear infinite",
        "marquee-right": "marquee-right 80s linear infinite",
        // Easing relevé sur le modèle (cubic-bezier(0.22, 1, 0.36, 1),
        // ~ easeOutQuint) : sa signature de mouvement, réutilisée pour le
        // dépliage des outils de la barre et la montée des feuilles.
        // Durée, délai et absence de transform copiés du modèle : sa classe
        // `apparition-outils` (relevée dans son CSS compilé, keyframes
        // `noway-apparition`) est un pur fondu d'opacité, jamais un
        // glissement — l'impression de "fade up" vient de la barre qui
        // grandit sous ces outils (transition sur min-height, ajoutée sur le
        // textarea juste en dessous), pas d'un déplacement des outils eux-mêmes.
        "tools-in": "tools-in 0.26s cubic-bezier(0.22, 1, 0.36, 1) 0.15s both",
        "sheet-up": "sheet-up 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",
        // Transition entre le studio et la page des gabarits : la nouvelle
        // page glisse depuis le haut de l'écran jusqu'en place — un vrai
        // glissement plein écran (-100vh), pas un petit décalage de
        // quelques pixels qui se lisait comme un simple fondu.
        "page-in": "page-in 0.42s cubic-bezier(0.22, 1, 0.36, 1) both",
        // Barre de progression du snap ouvert dans le hero. Sa duree doit
        // rester egale a SLIDE_DURATION_MS (components/landing/SnapPhone).
        "snap-timer": "snap-timer 3.6s linear both",
      },
      keyframes: {
        "snap-timer": {
          from: { transform: "scaleX(0)" },
          to: { transform: "scaleX(1)" },
        },
        "tools-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "sheet-up": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "page-in": {
          from: { opacity: "0", transform: "translateY(-100vh)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(14px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        reveal: {
          from: { opacity: "0", transform: "translateY(18px) scale(0.97)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "magic-reveal": {
          "0%": {
            opacity: "0",
            transform: "scale(1.08)",
            filter: "blur(16px) brightness(1.9) saturate(1.4)",
          },
          "60%": {
            opacity: "1",
            filter: "blur(2px) brightness(1.15) saturate(1.1)",
          },
          "100%": {
            opacity: "1",
            transform: "scale(1)",
            filter: "blur(0) brightness(1) saturate(1)",
          },
        },
        "marquee-left": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-100%)" },
        },
        "marquee-right": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
