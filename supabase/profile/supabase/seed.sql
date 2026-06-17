-- Placeholder seed data for local dev / integration tests.
-- Matches the schema in 20260614120000_create_profile_schema.sql.

insert into public.about (bio_short, bio_long, target_roles)
values (
  'Full-Stack Software Engineer',
  'Full-stack engineer with a focus on TypeScript, React and cloud-native backends. I enjoy turning ambiguous problems into well-tested, maintainable systems.',
  array['Backend Development', 'Full-Stack Development']
);

insert into public.experience (title, company, employment_type, location, location_type, description, achievements, start_date, end_date, display_order)
values
  (
    'Senior Software Engineer', 'Acme Corp', 'full-time', 'Remote', 'remote',
    'Lead development of the customer-facing portal (Next.js/TypeScript) and its supporting APIs.',
    array['Introduced automated testing and CI pipelines, reducing regressions by 40%', 'Mentored two junior engineers'],
    '2023-01-15', null, 0
  ),
  (
    'Software Engineer', 'Globex Inc', 'full-time', 'Warsaw, Poland', 'on-site',
    'Built and maintained internal tooling and REST APIs in Node.js/Fastify.',
    array['Migrated a legacy monolith to a modular service architecture'],
    '2020-06-01', '2022-12-31', 1
  ),
  (
    'Junior Developer', 'Initech', 'full-time', 'Warsaw, Poland', 'on-site',
    'Developed features for an internal CRM using React and Express.',
    array['Contributed to the team''s first end-to-end test suite'],
    '2018-09-01', '2020-05-31', 2
  );

insert into public.qualifications (title, issuer, type, description, credential_url, issue_date, expiry_date, display_order)
values
  ('MSc Computer Science', 'University of Technology', 'degree',
   'Specialization in distributed systems and software architecture.', null,
   '2018-06-30', null, 0),
  ('BSc Computer Science', 'University of Technology', 'degree',
   'Core coursework in algorithms, databases, and software engineering fundamentals.', null,
   '2016-06-30', null, 1),
  ('AWS Certified Solutions Architect – Associate', 'Amazon Web Services', 'certificate',
   null, 'https://www.credly.com/badges/example-aws-csa',
   '2023-03-15', '2026-03-15', 2),
  ('Professional Scrum Master I', 'Scrum.org', 'certificate',
   null, 'https://www.scrum.org/certificates/example-psm1',
   '2021-05-10', null, 3);

insert into public.projects (title, type, status, description, highlights, repo_url, demo_url, start_date, end_date, display_order)
values
  ('Portfolio Website', 'web', 'completed',
   'Personal portfolio site built with Next.js 16, Supabase, and AWS CDK.',
   array['Next.js', 'TypeScript', 'Supabase', 'AWS CDK', 'Tailwind CSS'],
   'https://github.com/kilogrampaliwa/portfolio-site-js-based', 'https://kilogrampaliwa.com',
   '2026-01-01', null, 0),
  ('REST API Toolkit', 'library', 'completed',
   'Reusable Fastify plugins for authentication, rate-limiting, and structured errors.',
   array['Fastify', 'Node.js', 'TypeScript'],
   null, null, '2024-06-01', '2024-09-30', 1);

insert into public.skills (name, category, competency_level, years_of_experience, description, display_order)
values
  ('TypeScript', 'language', 'advanced', 5, null, 0),
  ('Python', 'language', 'advanced', 4, null, 1),
  ('React', 'framework', 'advanced', 5, null, 2),
  ('Node.js', 'framework', 'advanced', 5, null, 3),
  ('PostgreSQL', 'tool', 'intermediate', 3, null, 4),
  ('Docker', 'tool', 'intermediate', 3, null, 5),
  ('AWS', 'cloud', 'intermediate', 2, null, 6);

-- Test API key for the "web" client. Raw value (sha-256 hashed below):
--   a456fb3913986e5dd8970c52013d2602bd222a2fbf23c05a27891d11def215db
insert into public.api_keys (key_hash, client_name)
values (
  'd4eef7393432c820b1b3b50d3db128b57de332d8a1348bf94ef739b986ecde40',
  'web'
);

-- Revoked test API key for integration tests (assert 401).
insert into public.api_keys (key_hash, client_name, revoked_at)
values (
  '6fd41bc19b8007c79c63ae82fe054349e32fa44a0ff60579947b4f5ce1527f72',
  'revoked-test-client',
  now()
);
