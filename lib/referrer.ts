const bareHost = (host: string) => host.toLowerCase().replace(/^www\./, "").split(":")[0];

/**
 * Origine (https://site.tld) du site d'où vient le visiteur, ou null pour un
 * accès direct, une navigation interne ou une valeur invalide. Seule
 * l'origine est gardée : le chemin et la query peuvent contenir des jetons.
 */
export function externalReferrer(raw: unknown, ownHost: string): string | null {
  if (typeof raw !== "string" || !raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    if (bareHost(url.hostname) === bareHost(ownHost)) return null;
    return url.origin.slice(0, 200);
  } catch {
    return null;
  }
}
