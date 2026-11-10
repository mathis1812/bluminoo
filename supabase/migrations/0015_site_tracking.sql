-- Mesure des visites sur tout le site (plus seulement /landing) : appareil
-- et paramètres utm de chaque visite, pour relier une campagne (lien en bio
-- TikTok…) aux visites qu'elle amène. La source jointe à l'inscription vit
-- déjà dans auth.users.raw_user_meta_data (lib/acquisition.ts).
--
-- La table garde son nom `landing_events` : la renommer casserait le code en
-- ligne avant le déploiement. Elle contient désormais toutes les pages.
--
-- Colonnes nullables uniquement : compatible avec le code déjà en ligne, qui
-- ne les renseigne pas. Ré-exécutable.

alter table public.landing_events
  add column if not exists device text
    check (device is null or device in ('mobile', 'tablet', 'desktop')),
  add column if not exists utm_source text
    check (utm_source is null or char_length(utm_source) <= 100),
  add column if not exists utm_medium text
    check (utm_medium is null or char_length(utm_medium) <= 100),
  add column if not exists utm_campaign text
    check (utm_campaign is null or char_length(utm_campaign) <= 100);

create index if not exists landing_events_created_at_idx
  on public.landing_events (created_at desc);
