-- Layer 02: Profile/CV "brain" schema.
-- Field names loosely follow the JSON Resume convention (basics, work, education,
-- certificates, skills, languages). Any field meant to hold free text shown to end
-- users (tagline, bio, description, fluency) is jsonb shaped like {"en": "...", "pl": "..."}.
-- Short proper nouns (company, institution, certificate/skill names) stay plain text.

create extension if not exists pgcrypto;

-- profile: singleton row ("basics"). The check constraint pins the id to a fixed
-- value so the primary key also enforces "only one row".
create table public.profile (
  id uuid primary key default '00000000-0000-0000-0000-000000000001',
  full_name text not null,
  tagline jsonb not null,
  bio jsonb not null,
  email text not null,
  social_links jsonb not null default '{}'::jsonb,
  avatar_url text,
  updated_at timestamptz not null default now(),
  constraint profile_singleton check (id = '00000000-0000-0000-0000-000000000001')
);

comment on table public.profile is
  'Singleton "basics" row for the profile/CV brain. Only one row may ever exist.';

-- experience ("work")
create table public.experience (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  role text not null,
  location text,
  start_date date not null,
  end_date date,
  description jsonb not null default '{}'::jsonb,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- education
create table public.education (
  id uuid primary key default gen_random_uuid(),
  institution text not null,
  degree text not null,
  field text,
  start_date date not null,
  end_date date,
  description jsonb not null default '{}'::jsonb,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- certificates
create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  issuer text not null,
  issue_date date not null,
  expiry_date date,
  credential_url text,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- skills
create table public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  level text,
  keywords text[] not null default '{}',
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- languages (spoken/written, not programming)
create table public.languages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  fluency jsonb not null,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- api_keys: access control for the universal API (apps/api-profile, layer 03).
-- service_role-only; never exposed to anon/authenticated (see RLS migration).
create table public.api_keys (
  id uuid primary key default gen_random_uuid(),
  key_hash text not null unique,
  client_name text not null,
  created_at timestamptz not null default now(),
  revoked_at timestamptz,
  last_used_at timestamptz
);

comment on table public.api_keys is
  'service_role-only. sha-256 hashes of API keys used by apps/api-profile to '
  'authenticate clients via the X-API-Key header. Raw keys are never stored.';

create index experience_order_idx on public.experience (order_index);
create index education_order_idx on public.education (order_index);
create index certificates_order_idx on public.certificates (order_index);
create index skills_order_idx on public.skills (order_index);
create index languages_order_idx on public.languages (order_index);
create index api_keys_key_hash_idx on public.api_keys (key_hash);
