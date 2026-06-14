-- Layer 04: RLS for the site brain.
-- anon/authenticated: read-only, and only "published" rows
-- (published_at is not null and <= now()). All writes are service_role only.

alter table public.projects enable row level security;
alter table public.posts enable row level security;

grant usage on schema public to anon, authenticated, service_role;

grant select on public.projects, public.posts to anon, authenticated;

create policy "Public read access to published projects" on public.projects
  for select to anon, authenticated
  using (published_at is not null and published_at <= now());

create policy "Public read access to published posts" on public.posts
  for select to anon, authenticated
  using (published_at is not null and published_at <= now());

-- service_role: full access to every table, including drafts/unpublished rows.
grant all on public.projects, public.posts to service_role;

create policy "service_role full access" on public.projects
  for all to service_role using (true) with check (true);

create policy "service_role full access" on public.posts
  for all to service_role using (true) with check (true);
