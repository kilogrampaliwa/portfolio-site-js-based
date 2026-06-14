-- Layer 04: Site "brain" schema — portfolio projects and blog posts.
-- Any field meant to hold free text shown to end users (title, description,
-- excerpt, content) is jsonb shaped like {"en": "...", "pl": "..."}. Short
-- identifiers (slugs, tech stack entries, tags) stay plain text/text[].

create extension if not exists pgcrypto;

-- projects: portfolio showcase entries.
create table public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description jsonb not null default '{}'::jsonb,
  tech_stack text[] not null default '{}',
  link text,
  repo_url text,
  image_url text,
  featured boolean not null default false,
  order_index integer not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.projects is
  'Portfolio project showcase entries. A null published_at (or one in the '
  'future) means the project is not yet visible to anon/authenticated.';

-- posts: blog entries.
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title jsonb not null default '{}'::jsonb,
  excerpt jsonb not null default '{}'::jsonb,
  content jsonb not null default '{}'::jsonb,
  tags text[] not null default '{}',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.posts is
  'Blog posts. A null published_at means the post is a draft; one in the '
  'future is scheduled. Either way it is invisible to anon/authenticated.';

create index projects_order_idx on public.projects (order_index);
create index projects_published_at_idx on public.projects (published_at);
create index posts_published_at_idx on public.posts (published_at);
