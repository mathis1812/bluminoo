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
  /**
   * En-têtes de sécurité, appliqués à toutes les routes.
   *
   * Le plus utile ici est `X-Frame-Options` : l'application expose la
   * suppression de compte et le changement de formule en un clic, et sans lui
   * elle est encadrable dans une iframe — un overlay suffit alors à faire
   * cliquer quelqu'un sur « supprimer mon compte » en croyant cliquer
   * ailleurs.
   *
   * `Referrer-Policy` compte depuis que `photo-uploads` est privé (migration
   * 0012) : ses URLs portent un jeton en query, et l'en-tête `Referer` par
   * défaut le laisserait fuiter vers un site tiers depuis une page qui
   * l'affiche.
   *
   * Pas de `preload` sur HSTS : c'est un engagement difficile à défaire, à
   * n'ajouter qu'une fois le domaine stabilisé. Pas de CSP non plus pour
   * l'instant — Stripe et Supabase demandent une liste d'origines à établir
   * avec soin, et une CSP approximative casse le paiement.
   */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
        ],
      },
    ];
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
