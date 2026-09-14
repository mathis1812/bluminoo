/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    /**
     * AVIF avant WebP. À poids égal il tient nettement mieux les aplats et
     * les dégradés — précisément ce qui compose nos visuels de gabarits
     * (ciels, carrosseries, eau). Next retombe seul sur WebP, puis sur
     * l'original, si le navigateur ne suit pas.
     *
     * Ne corrige PAS un visuel trop petit : une image de 648 px affichée sur
     * 880 px reste agrandie, quel que soit le format.
     */
    formats: ["image/avif", "image/webp"],
  },
  async redirects() {
    return [
      { source: "/tarifs", destination: "/pricing", permanent: true },
      { source: "/compte", destination: "/account", permanent: true },
      { source: "/connexion", destination: "/sign-in", permanent: true },
      { source: "/inscription", destination: "/sign-up", permanent: true },
      { source: "/galerie", destination: "/gallery", permanent: true },
      { source: "/a-propos", destination: "/about", permanent: true },
      { source: "/cgv", destination: "/terms", permanent: true },
      { source: "/confidentialite", destination: "/privacy", permanent: true },
      { source: "/mentions-legales", destination: "/legal", permanent: true },
    ];
  },
};

export default nextConfig;
