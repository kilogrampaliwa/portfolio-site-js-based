-- Layer 02: RLS for the profile/CV brain.
-- Content tables: anon/authenticated get read-only access; all writes are
-- service_role only (RLS has no insert/update/delete policies for anon/authenticated,
-- so they are denied by default).
-- api_keys: no policies and no grants for anon/authenticated at all -> fully
-- inaccessible except via service_role (which bypasses RLS).

alter table public.profile enable row level security;
alter table public.experience enable row level security;
alter table public.education enable row level security;
alter table public.certificates enable row level security;
alter table public.skills enable row level security;
alter table public.languages enable row level security;
alter table public.api_keys enable row level security;

grant usage on schema public to anon, authenticated, service_role;

-- Read-only access to published content for anon + authenticated.
grant select on
  public.profile,
  public.experience,
  public.education,
  public.certificates,
  public.skills,
  public.languages
to anon, authenticated;

create policy "Public read access" on public.profile
  for select to anon, authenticated using (true);

create policy "Public read access" on public.experience
  for select to anon, authenticated using (true);

create policy "Public read access" on public.education
  for select to anon, authenticated using (true);

create policy "Public read access" on public.certificates
  for select to anon, authenticated using (true);

create policy "Public read access" on public.skills
  for select to anon, authenticated using (true);

create policy "Public read access" on public.languages
  for select to anon, authenticated using (true);

-- service_role: full access to every table, including api_keys.
grant all on
  public.profile,
  public.experience,
  public.education,
  public.certificates,
  public.skills,
  public.languages,
  public.api_keys
to service_role;

create policy "service_role full access" on public.profile
  for all to service_role using (true) with check (true);

create policy "service_role full access" on public.experience
  for all to service_role using (true) with check (true);

create policy "service_role full access" on public.education
  for all to service_role using (true) with check (true);

create policy "service_role full access" on public.certificates
  for all to service_role using (true) with check (true);

create policy "service_role full access" on public.skills
  for all to service_role using (true) with check (true);

create policy "service_role full access" on public.languages
  for all to service_role using (true) with check (true);

create policy "service_role full access" on public.api_keys
  for all to service_role using (true) with check (true);
