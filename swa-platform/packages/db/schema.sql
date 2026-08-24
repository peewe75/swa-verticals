create extension if not exists pg_cron;

create table if not exists tenants (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  vertical text not null check (vertical in ('realty','dental','motors')),
  plan text default 'demo',
  status text default 'active',
  config_json jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists jobs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id),
  type text not null,
  payload jsonb default '{}'::jsonb,
  status text not null default 'queued' check (status in ('queued','running','done','failed')),
  attempts int default 0,
  result_url text,
  error text,
  cost_eur numeric(10,4) default 0,
  created_at timestamptz default now(),
  finished_at timestamptz
);

create index if not exists jobs_status_created_idx on jobs (status, created_at);

create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id),
  channel text default 'whatsapp',
  wa_id text,
  state jsonb default '{}'::jsonb,
  escalated boolean default false,
  summary text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (tenant_id, channel, wa_id)
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade,
  role text not null check (role in ('user','assistant','system')),
  content text not null,
  ts timestamptz default now()
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references tenants(id),
  vertical text not null,
  source text default 'demo',
  name text,
  phone text,
  intent jsonb default '{}'::jsonb,
  score int default 0,
  status text default 'new',
  created_at timestamptz default now()
);

create table if not exists api_usage (
  id bigint generated always as identity primary key,
  tenant_id uuid references tenants(id),
  service text not null,
  units numeric(10,4) default 0,
  cost_eur numeric(10,4) default 0,
  day date default current_date,
  created_at timestamptz default now()
);

alter table jobs enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table leads enable row level security;
alter table api_usage enable row level security;
alter table tenants enable row level security;

insert into storage.buckets (id, name, public)
values ('renders', 'renders', true)
on conflict (id) do nothing;

insert into tenants (id, slug, name, vertical, config_json) values
('11111111-1111-1111-1111-111111111111', 'demo-dental', 'Studio Dentistico Demo', 'dental', $json$
{
  "studio_name": "Studio Dentistico Demo",
  "city": "Milano",
  "orari": "lun-ven 9:00-13:00 e 14:30-19:00, sabato chiuso",
  "servizi": ["Controllo", "Igiene", "Sbiancamento", "Ortodonzia", "Implantologia"],
  "prezzi_indicativi": {"Igiene": "80-120 EUR", "Controllo": "da definire in sede"},
  "tono": "famigliare e professionale"
}$json$),
('22222222-2222-2222-2222-222222222222', 'demo-realty', 'Agenzia Demo', 'realty', '{}'),
('33333333-3333-3333-3333-333333333333', 'demo-motors', 'Concessionaria Demo', 'motors', '{}')
on conflict (slug) do nothing;
