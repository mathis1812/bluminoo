-- 0014 — Crédits de pack conservés au renouvellement de l'abonnement.
--
-- Le webhook remplaçait le solde par le forfait du palier à chaque
-- renouvellement (`credits = creditsFor(plan)`) : un abonné qui avait acheté
-- un pack, vendu « sans expiration », le perdait la semaine suivante.
--
-- `credits` reste le solde total, lu par l'interface et débité par
-- `spend_credits`. `topup_credits` est la part de ce solde qui vient des
-- packs. Le forfait de la semaine se consomme en premier ; au renouvellement,
-- le solde repart à `forfait + topup_credits`.
--
-- À APPLIQUER AVANT de fusionner la PR qui l'accompagne : le webhook appelle
-- `add_topup_credits` et `grant_plan_credits`. Sans elles, il répond 500 et
-- Stripe rejoue plus tard — rien n'est perdu, mais rien n'est crédité.

alter table public.profiles
  add column if not exists topup_credits integer not null default 0;

-- Même débit atomique qu'en 0003. La part pack est plafonnée au nouveau
-- solde : les crédits du forfait partent d'abord. Dans un UPDATE, `credits`
-- à droite du `=` est l'ancienne valeur.
create or replace function public.spend_credits(p_user_id uuid, p_amount integer)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  updated_rows integer;
begin
  update public.profiles
  set credits = credits - p_amount,
      topup_credits = least(topup_credits, credits - p_amount)
  where id = p_user_id and credits >= p_amount;

  get diagnostics updated_rows = row_count;
  return updated_rows > 0;
end;
$$;

-- Achat d'un pack : ajoute au solde ET à la part pack.
create or replace function public.add_topup_credits(p_user_id uuid, p_amount integer)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.profiles
  set credits = credits + p_amount,
      topup_credits = topup_credits + p_amount
  where id = p_user_id;
end;
$$;

-- Abonnement ou renouvellement : le forfait remplace l'ancien forfait, la
-- part pack est conservée.
create or replace function public.grant_plan_credits(p_user_id uuid, p_amount integer)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.profiles
  set credits = p_amount + topup_credits
  where id = p_user_id;
end;
$$;

-- Serveur uniquement, comme en 0003 : aucune de ces fonctions ne vérifie
-- auth.uid().
revoke execute on function public.add_topup_credits(uuid, integer) from public, anon, authenticated;
revoke execute on function public.grant_plan_credits(uuid, integer) from public, anon, authenticated;
grant execute on function public.add_topup_credits(uuid, integer) to service_role;
grant execute on function public.grant_plan_credits(uuid, integer) to service_role;
