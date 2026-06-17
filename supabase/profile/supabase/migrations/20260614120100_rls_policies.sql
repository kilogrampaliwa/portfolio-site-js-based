-- RLS for the profile/CV brain.
-- Content tables: anon/authenticated get read-only via public views.
-- Base tables + api_keys: service_role only.
-- Junction tables: service_role only (no anon/authenticated access).

alter table public.about enable row level security;
alter table public.experience enable row level security;
alter table public.qualifications enable row level security;
alter table public.projects enable row level security;
alter table public.skills enable row level security;
alter table public.experience_skills enable row level security;
alter table public.project_skills enable row level security;
alter table public.qualification_skills enable row level security;
alter table public.api_keys enable row level security;

grant usage on schema public to anon, authenticated, service_role;

-- anon/authenticated: read-only on views (already filtered by is_public)
grant select on
  public.v_experience,
  public.v_projects,
  public.v_qualifications,
  public.v_skills
to anon, authenticated;

-- anon/authenticated also need select on underlying tables for views to work
grant select on
  public.about,
  public.experience,
  public.qualifications,
  public.projects,
  public.skills
to anon, authenticated;

create policy "Public read access" on public.about
  for select to anon, authenticated using (true);

create policy "Public read access" on public.experience
  for select to anon, authenticated using (is_public = true);

create policy "Public read access" on public.qualifications
  for select to anon, authenticated using (is_public = true);

create policy "Public read access" on public.projects
  for select to anon, authenticated using (is_public = true);

create policy "Public read access" on public.skills
  for select to anon, authenticated using (is_public = true);

-- service_role: full access to every table
grant all on
  public.about,
  public.experience,
  public.qualifications,
  public.projects,
  public.skills,
  public.experience_skills,
  public.project_skills,
  public.qualification_skills,
  public.api_keys
to service_role;

create policy "service_role full access" on public.about
  for all to service_role using (true) with check (true);

create policy "service_role full access" on public.experience
  for all to service_role using (true) with check (true);

create policy "service_role full access" on public.qualifications
  for all to service_role using (true) with check (true);

create policy "service_role full access" on public.projects
  for all to service_role using (true) with check (true);

create policy "service_role full access" on public.skills
  for all to service_role using (true) with check (true);

create policy "service_role full access" on public.experience_skills
  for all to service_role using (true) with check (true);

create policy "service_role full access" on public.project_skills
  for all to service_role using (true) with check (true);

create policy "service_role full access" on public.qualification_skills
  for all to service_role using (true) with check (true);

create policy "service_role full access" on public.api_keys
  for all to service_role using (true) with check (true);
