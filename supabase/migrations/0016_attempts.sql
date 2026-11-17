-- Tentatives d'analyse ou de rendu, comptées par la console (copie de console/sql/tentatives.sql, partie site).
create table if not exists public.attempts (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users (id) on delete cascade,
  outcome    text not null check (outcome in ('ok', 'paiement', 'quota', 'refusee', 'erreur')),
  created_at timestamptz not null default now()
);
create index if not exists attempts_user_idx on public.attempts (user_id, created_at);
alter table public.attempts enable row level security;
revoke all on public.attempts from public, anon, authenticated;

create or replace function public.record_attempt(p_outcome text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null or p_outcome is null or p_outcome not in ('ok', 'paiement', 'quota', 'refusee', 'erreur') then
    return;
  end if;
  -- ponytail: plafond de 200 lignes par compte et par heure contre un client trafiqué ; largement au-dessus d'un usage réel.
  if (select count(*) from public.attempts a where a.user_id = uid and a.created_at > now() - interval '1 hour') >= 200 then
    return;
  end if;
  insert into public.attempts (user_id, outcome) values (uid, p_outcome);
end;
$$;
revoke all on function public.record_attempt(text) from public, anon;
grant execute on function public.record_attempt(text) to authenticated;
