-- Prépare le passage de `photo-uploads` en bucket privé (migration 0012).
--
-- Depuis 0010, plus aucune policy `select` n'existe sur `storage.objects` :
-- le listing anonyme est fermé, mais `createSignedUrl()` ne fonctionne pas
-- non plus, car signer un objet exige le droit de le lire.
--
-- On rouvre donc `select`, mais strictement sur le dossier de l'utilisateur
-- authentifié : `(storage.foldername(name))[1]` est le premier segment du
-- chemin, et `uploadImage()` écrit toujours en `${user.id}/${uuid}.ext`
-- (cf. `lib/studio-image.ts`, policy d'insertion de 0008).
--
-- `anon` reste sans aucune policy `select` : l'énumération fermée par 0010
-- le demeure. Un utilisateur connecté ne peut lister que son propre dossier,
-- ce qu'il peut déjà faire puisque ce sont ses fichiers.
--
-- Cette migration est sans effet sur le code en ligne : elle ajoute un droit,
-- elle n'en retire aucun. Elle doit être appliquée AVANT le déploiement du
-- code qui utilise `createSignedUrl`, lui-même avant 0012.

drop policy if exists "Owners can read their own photo-uploads folder"
  on storage.objects;

create policy "Owners can read their own photo-uploads folder"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'photo-uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
