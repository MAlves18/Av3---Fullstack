-- Observatório de Vulnerabilidade Socioenergética de Salvador
-- Execute no SQL Editor do Supabase.
create extension if not exists pgcrypto;

create table if not exists public.territories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  ibge_code text,
  territory_type text not null default 'bairro',
  parent_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  institution text not null,
  title text not null,
  url text,
  access_date date,
  geographic_scale text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.indicators (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  unit text not null,
  dimension text not null,
  methodology text,
  classification text not null check (classification in ('Dado observado','Indicador derivado','Proxy/estimativa')),
  created_at timestamptz not null default now()
);

create table if not exists public.observations (
  id uuid primary key default gen_random_uuid(),
  territory_id uuid references public.territories(id) on delete restrict,
  indicator_id uuid not null references public.indicators(id) on delete restrict,
  source_id uuid not null references public.sources(id) on delete restrict,
  year integer not null check (year between 1900 and 2100),
  value numeric not null,
  classification text not null check (classification in ('Dado observado','Indicador derivado','Proxy/estimativa')),
  geographic_scale text not null,
  notes text,
  created_at timestamptz not null default now(),
  unique (territory_id, indicator_id, source_id, year, geographic_scale)
);

create index if not exists idx_observations_year on public.observations(year);
create index if not exists idx_observations_territory on public.observations(territory_id);
create index if not exists idx_observations_indicator on public.observations(indicator_id);

-- Para dados estaduais (ex.: EPE/Bahia), territory_id fica NULL e geographic_scale='estadual'.
-- Assim, o registro estadual nunca é apresentado como observação de bairro.

insert into public.territories (name, slug, territory_type)
values
 ('Beiru/Tancredo Neves','beiru-tancredo-neves','bairro'),
 ('Pernambués','pernambues','bairro')
on conflict (slug) do nothing;

insert into public.sources (institution,title,url,geographic_scale,notes)
values
 ('IBGE','Censo Demográfico 2022 - Agregados por bairros','https://ftp.ibge.gov.br/Censos/Censo_Demografico_2022/Agregados_por_Setores_Censitarios/Agregados_por_Bairro_csv/','Bairro','Confirmar equivalência territorial e ano de referência de cada variável.'),
 ('IPEA','Atlas da Vulnerabilidade Social','http://ivs.ipea.gov.br/','Conforme publicação','Usar somente na escala efetivamente publicada.'),
 ('EPE','Anuário Estatístico de Energia Elétrica','https://www.epe.gov.br/pt/publicacoes-dados-abertos/dados-abertos/dados-do-anuario-estatistico-de-energia-eletrica','Estadual ou conforme base','Não atribuir dados estaduais diretamente aos bairros.')
on conflict do nothing;

-- RLS: leitura pública para dashboard acadêmico. Escrita deve ser feita por importação segura
-- no painel/ETL usando credencial de servidor, nunca exponha service_role no navegador.
alter table public.territories enable row level security;
alter table public.sources enable row level security;
alter table public.indicators enable row level security;
alter table public.observations enable row level security;

drop policy if exists "Leitura pública de territórios" on public.territories;
create policy "Leitura pública de territórios" on public.territories for select using (true);
drop policy if exists "Leitura pública de fontes" on public.sources;
create policy "Leitura pública de fontes" on public.sources for select using (true);
drop policy if exists "Leitura pública de indicadores" on public.indicators;
create policy "Leitura pública de indicadores" on public.indicators for select using (true);
drop policy if exists "Leitura pública de observações" on public.observations;
create policy "Leitura pública de observações" on public.observations for select using (true);

grant select on public.territories, public.sources, public.indicators, public.observations to anon, authenticated;
