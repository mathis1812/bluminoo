-- Ferme réellement l'accès au contenu de `photo-uploads`.
--
-- 0010 avait fermé l'énumération, pas le téléchargement : le bucket restant
-- `public = true`, quiconque connaissait déjà un chemin pouvait récupérer le
-- fichier via `/object/public/`, qui ne consulte pas les policies. C'est le
-- bucket le plus sensible du projet — les photos sources des utilisateurs.
--
-- En privé, `/object/public/` cesse de servir ces objets et le seul accès
-- devient l'URL signée émise par `uploadImage()` (0011 accorde le `select`
-- nécessaire, limité au dossier du propriétaire).
--
-- ORDRE D'APPLICATION — cette migration casse la production si le code en
-- ligne appelle encore `getPublicUrl()` :
--   1. appliquer 0011
--   2. déployer le code qui utilise `createSignedUrl`
--   3. appliquer 0012 (ce fichier)
--
-- `gallery` et `video-uploads` restent publics : ils servent le partage des
-- rendus, et leurs URLs sont distribuées volontairement.
--
-- Rollback : `update storage.buckets set public = true where id =
-- 'photo-uploads';` — les URLs publiques redeviennent servies immédiatement.

update storage.buckets
set public = false
where id = 'photo-uploads';
