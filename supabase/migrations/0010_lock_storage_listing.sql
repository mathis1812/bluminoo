-- Ferme l'énumération des buckets par la clé anon.
--
-- Constat (testé le 2026-09-10 avec la seule clé anon, celle du bundle public) :
-- les policies « Public read access to <bucket> » accordaient `select` sur
-- `storage.objects` à `anon`. Or c'est cette table qui sert au *listing*.
-- N'importe qui pouvait donc :
--   1. lister les dossiers racine   -> les IDs de tous les utilisateurs
--   2. lister dans un dossier       -> les noms de fichiers complets
--   3. télécharger chaque chemin    -> les buckets étant `public = true`
-- L'entropie des chemins `${userId}/${crypto.randomUUID()}` ne protégeait rien,
-- puisqu'on pouvait énumérer au lieu de deviner. Le plus sensible est
-- `photo-uploads` : les photos sources envoyées par les utilisateurs.
--
-- Correctif retenu : retirer `select` sur `storage.objects` pour anon, en
-- laissant les buckets `public = true`.
--   - le listing passe par `storage.objects` -> désormais bloqué ;
--   - l'endpoint `/object/public/...` ne consulte pas les policies -> les URL
--     publiques déjà distribuées continuent de fonctionner.
-- Donc aucun changement de code : `getPublicUrl()` reste valide, et le partage
-- de la galerie n'est pas cassé.
--
-- Les écritures et le balayage passent par `service_role`, qui ignore le RLS
-- (`lib/supabase/service.ts`, `lib/upload-cleanup.ts`, `app/api/account/delete`).
-- Rien d'autre ne dépend de ces policies.
--
-- Reste à faire, hors de cette migration : passer `photo-uploads` en privé avec
-- des URLs signées (`createSignedUrl`), seule vraie protection du contenu. Cela
-- demande de modifier `lib/gallery-server.ts`, `lib/studio-image.ts` et
-- `lib/url-allowlist.ts`, et ne peut pas se faire sans déploiement coordonné.

drop policy if exists "Public read access to gallery bucket" on storage.objects;
drop policy if exists "Public read access to photo-uploads bucket" on storage.objects;
drop policy if exists "Public read access to video-uploads bucket" on storage.objects;
