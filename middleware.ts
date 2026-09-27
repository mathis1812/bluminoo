import { createServerClient } from "@supabase/ssr";
    import { type NextRequest, NextResponse } from "next/server";

    export async function middleware(request: NextRequest) {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        return NextResponse.next({ request });
      }

      let response = NextResponse.next({ request });

      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value),
            );
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options),
            );
          },
        },
      });

      // Rafraîchit la session — jose 6.x peut lever une exception sur certains
      // tokens Edge ; on l'attrape pour ne jamais retourner MIDDLEWARE_INVOCATION_FAILED.
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Un visiteur non connecté qui arrive sur la racine voit la landing, pas
      // le studio. Jusqu'au 27/09, `/` servait `app/page.tsx` à tout le monde :
      // le trafic d'acquisition tombait sur l'interface de génération sans
      // avoir vu un exemple, un prix ni un témoignage, et le seul lien vers
      // `/landing` était le mot-symbole de la barre du haut — donc visible
      // uniquement une fois déjà dans l'app.
      //
      // Réécriture et non redirection : l'URL partagée reste bluminoo.com, et
      // les robots — toujours non connectés — indexent la landing sur `/`, ce
      // que le sitemap annonce déjà (`/` en priorité 1, `/landing` absent).
      // Deux parametres disent « je veux entrer dans l'app », et priment donc
      // sur la porte d'entree :
      //
      // `screen` — `/templates` redirige vers `/?screen=templates`
      // (app/templates/page.tsx : studio et gabarits vivent dans le meme DOM,
      // glisses par un rail). Reecrire cette URL rendait les gabarits
      // inatteignables deconnecte, Googlebot compris.
      //
      // `try` — les boutons de la landing y mènent : un visiteur non abonne
      // parcourt tout le flux, et c'est le paywall en fin de generation
      // simulee qui lui propose de s'abonner (`useStudioGeneration`). Sans
      // cette sortie, la landing ne menait qu'a la creation de compte, et il
      // fallait un compte pour seulement essayer.
      const wantsApp =
        request.nextUrl.searchParams.has("screen") ||
        request.nextUrl.searchParams.has("try");

      if (!user && request.nextUrl.pathname === "/" && !wantsApp) {
        const url = request.nextUrl.clone();
        url.pathname = "/landing";
        const rewritten = NextResponse.rewrite(url);
        // Les cookies posés par le rafraîchissement de session ci-dessus
        // vivent sur `response`, qu'on ne renvoie plus : sans ce report, une
        // session expirée ne serait jamais nettoyée côté navigateur.
        for (const cookie of response.cookies.getAll()) {
          rewritten.cookies.set(cookie);
        }
        return rewritten;
      }

      return response;
    } catch (err) {
      // Dégradation gracieuse : la requête passe sans rafraîchissement de session.
      // Le Server Component côté page se charge de vérifier l'auth.
      console.error("[middleware] session refresh failed:", err instanceof Error ? err.message : err);
      return NextResponse.next({ request });
    }
    }

    export const config = {
    matcher: [
      "/((?!_next/static|_next/image|favicon.ico|api|.*\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
    // Autorise jose (utilisé par @supabase/auth-js) à utiliser du code dynamique
    // en Edge runtime — nécessaire depuis jose 6.x.
    unstable_allowDynamic: [
      "**/node_modules/jose/**",
      "**/node_modules/@supabase/**",
    ],
    };
    