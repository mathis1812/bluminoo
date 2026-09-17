-- Journal des événements Stripe déjà traités, pour rendre le webhook idempotent.
--
-- Stripe garantit une livraison *au moins une fois* : il rejoue tout événement
-- qu'il n'a pas vu acquitté en 2xx, et peut livrer deux fois le même même
-- quand tout va bien. Sans déduplication, un `checkout.session.completed` de
-- pack de crédits rejoué appelait `addCredits` une seconde fois — mille
-- crédits offerts pour un seul paiement.
--
-- Le webhook réserve l'événement en insérant son id AVANT de le traiter : une
-- livraison concurrente ou tardive tombe sur la violation de clé primaire et
-- ressort en 200 sans rien faire. En cas d'échec d'écriture pendant le
-- traitement, la route supprime sa réservation avant de renvoyer 500, pour que
-- le rejeu de Stripe puisse retraiter l'événement — sans quoi on échangerait
-- le double paiement contre une perte pure.
--
-- Aucune policy : RLS actif et deny-by-default, comme le reste du schéma.
-- Seul `service_role`, qui contourne RLS, écrit ici (app/api/stripe/webhook).

create table if not exists public.stripe_events (
  id text primary key,
  type text,
  processed_at timestamptz not null default now()
);

alter table public.stripe_events enable row level security;

-- Purge : les événements de plus de 90 jours ne servent plus à dédupliquer,
-- Stripe cessant ses rejeux bien avant. À passer en cron si la table grossit.
create index if not exists stripe_events_processed_at_idx
  on public.stripe_events (processed_at);
