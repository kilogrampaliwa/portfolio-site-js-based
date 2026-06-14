-- Layer 02: placeholder seed data for local dev / integration tests.
-- Realistic but fictional content in en/pl. Replace with real profile data later
-- (e.g. via a future admin tool, layer 11) -- the shape is what matters here.

insert into public.profile (id, full_name, tagline, bio, email, social_links, avatar_url)
values (
  '00000000-0000-0000-0000-000000000001',
  'Jane Doe',
  '{"en": "Full-Stack Software Engineer", "pl": "Inżynier Full-Stack"}',
  '{
    "en": "Full-stack engineer with a focus on TypeScript, React and cloud-native backends. I enjoy turning ambiguous problems into well-tested, maintainable systems.",
    "pl": "Inżynier full-stack specjalizujący się w TypeScript, React i backendach natywnych dla chmury. Lubię przekształcać niejasne problemy w dobrze przetestowane, łatwe w utrzymaniu systemy."
  }',
  'jane.doe@example.com',
  '{"github": "https://github.com/janedoe", "linkedin": "https://www.linkedin.com/in/janedoe"}',
  null
);

insert into public.experience (company, role, location, start_date, end_date, description, order_index)
values
  (
    'Acme Corp', 'Senior Software Engineer', 'Remote', '2023-01-15', null,
    '{
      "en": "Lead development of the customer-facing portal (Next.js/TypeScript) and its supporting APIs. Introduced automated testing and CI pipelines, reducing regressions by 40%.",
      "pl": "Prowadzenie rozwoju portalu klienta (Next.js/TypeScript) oraz wspierających go API. Wprowadzenie automatycznych testów i pipeline''ów CI, co zmniejszyło liczbę regresji o 40%."
    }',
    0
  ),
  (
    'Globex Inc', 'Software Engineer', 'Warsaw, Poland', '2020-06-01', '2022-12-31',
    '{
      "en": "Built and maintained internal tooling and REST APIs in Node.js/Fastify. Migrated a legacy monolith to a modular service architecture.",
      "pl": "Tworzenie i utrzymywanie wewnętrznych narzędzi oraz REST API w Node.js/Fastify. Migracja przestarzałego monolitu do modularnej architektury usług."
    }',
    1
  ),
  (
    'Initech', 'Junior Developer', 'Warsaw, Poland', '2018-09-01', '2020-05-31',
    '{
      "en": "Developed features for an internal CRM using React and Express, and contributed to the team''s first end-to-end test suite.",
      "pl": "Tworzenie funkcjonalności wewnętrznego systemu CRM w React i Express oraz wsparcie w budowie pierwszego zestawu testów end-to-end zespołu."
    }',
    2
  );

insert into public.education (institution, degree, field, start_date, end_date, description, order_index)
values
  (
    'University of Technology', 'MSc', 'Computer Science', '2016-10-01', '2018-06-30',
    '{
      "en": "Specialization in distributed systems and software architecture. Thesis on caching strategies for high-throughput APIs.",
      "pl": "Specjalizacja w systemach rozproszonych i architekturze oprogramowania. Praca magisterska dotycząca strategii cachowania dla API o wysokiej przepustowości."
    }',
    0
  ),
  (
    'University of Technology', 'BSc', 'Computer Science', '2013-10-01', '2016-06-30',
    '{
      "en": "Core coursework in algorithms, databases, and software engineering fundamentals.",
      "pl": "Podstawowe zajęcia z algorytmów, baz danych oraz podstaw inżynierii oprogramowania."
    }',
    1
  );

insert into public.certificates (name, issuer, issue_date, expiry_date, credential_url, order_index)
values
  (
    'AWS Certified Solutions Architect – Associate', 'Amazon Web Services',
    '2023-03-15', '2026-03-15', 'https://www.credly.com/badges/example-aws-csa', 0
  ),
  (
    'Professional Scrum Master I', 'Scrum.org',
    '2021-05-10', null, 'https://www.scrum.org/certificates/example-psm1', 1
  );

insert into public.skills (name, category, level, keywords, order_index)
values
  ('TypeScript', 'language', 'advanced', array['typescript', 'javascript'], 0),
  ('Python', 'language', 'advanced', array['python'], 1),
  ('React', 'framework', 'advanced', array['react', 'next.js', 'frontend'], 2),
  ('Node.js', 'framework', 'advanced', array['node', 'fastify', 'backend'], 3),
  ('PostgreSQL', 'tool', 'intermediate', array['postgres', 'sql', 'database'], 4),
  ('Docker', 'tool', 'intermediate', array['docker', 'containers'], 5),
  ('AWS', 'cloud', 'intermediate', array['aws', 'lambda', 'amplify', 'cdk'], 6);

insert into public.languages (name, fluency, order_index)
values
  ('English', '{"en": "Fluent (C1)", "pl": "Biegły (C1)"}', 0),
  ('Polish', '{"en": "Native", "pl": "Ojczysty"}', 1),
  ('German', '{"en": "Intermediate (B1)", "pl": "Średniozaawansowany (B1)"}', 2);

-- Test API key for the "web" client (apps/web's first-party key, used by
-- apps/api-profile integration tests). Raw value (sha-256 hashed below):
--   a456fb3913986e5dd8970c52013d2602bd222a2fbf23c05a27891d11def215db
-- Use this raw value as PROFILE_API_KEY in local .env files. Never commit the
-- raw value anywhere outside this comment in a local-only seed file.
insert into public.api_keys (key_hash, client_name)
values (
  'd4eef7393432c820b1b3b50d3db128b57de332d8a1348bf94ef739b986ecde40',
  'web'
);
