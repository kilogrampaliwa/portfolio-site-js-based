-- Real seed data for Filip Ciąder's portfolio.
-- Matches the schema in 20260614120000_create_profile_schema.sql.

-- Clear existing placeholder data
truncate public.experience_skills, public.project_skills, public.qualification_skills cascade;
truncate public.skills cascade;
truncate public.projects cascade;
truncate public.qualifications cascade;
truncate public.experience cascade;
truncate public.about cascade;

-- ─── ABOUT ────────────────────────────────────────────────────────────────────

insert into public.about (bio_short, bio_long, target_roles)
values (
  'Engineer & Python Developer',
  'Versatile engineer with 5+ years of programming experience across aerospace, robotics, and data engineering domains. I bridge mechanical engineering expertise with modern software development — building Python automation solutions, optimizing XML/ODX databases at Viessmann, and exploring backend, AI/LLM, and data engineering technologies. Currently finishing economics studies while constantly expanding my tech stack through hands-on projects.',
  array['Python / JS Automation', 'Data Engineering', 'Backend Development', 'AI / ML Engineering']
);

-- ─── EXPERIENCE ───────────────────────────────────────────────────────────────

insert into public.experience (title, company, employment_type, location, location_type, description, achievements, start_date, end_date, display_order)
values
  (
    'Database Modeling Specialist', 'Viessmann', 'full-time', '', 'remote',
    'Enhancement and optimization of ODX signal databases (XML). Developing Python scripts that automate work previously done manually in KPIT DatabaseDeveloper, speeding up tasks from hours/weeks to minutes.',
    array[
      'Built Python automation scripts replacing manual ODX database operations, reducing task time from weeks to minutes',
      'Created tools for automatic repo build preparation — uploading, merging, tagging',
      'Implemented JavaScript scripts for Google Sheets before migration to Python-based solutions',
      'Developed version-checking and auto-upgrade download tools integrated with Bitbucket'
    ],
    '2023-05-01', null, 0
  ),
  (
    'Robotics Programmer', 'Qt - Swiss', 'full-time', 'Wrocław, PL / Oxford, UK', 'hybrid',
    'Offline process simulation using Dassault DELMIA for Mercedes-Benz Group AG. Online implementation at the Mini BMW factory in Oxford.',
    array[
      'Process simulation for Mercedes-Benz Group AG using Dassault DELMIA',
      'On-site robotic implementation at BMW Mini factory in Oxford, UK'
    ],
    '2022-02-01', '2023-05-31', 1
  ),
  (
    'Student Project — Mechatronics Workstation', 'Wrocław University of Technology', 'project', 'Wrocław, Poland', 'on-site',
    'Personal technical project alongside studies. Built the complete electronics and software stack for a mechatronics device independently.',
    array[
      'Built GUI application for non-technical operators (Python, Tkinter)',
      'Designed and soldered custom motor drivers and control circuits from scratch',
      'Implemented SPI and USB communication between Arduino and PC'
    ],
    '2021-06-01', '2021-10-31', 2
  ),
  (
    'Intern — Editorial Assistant', 'Evionica', 'internship', 'Warszawa, Poland', 'on-site',
    'Created and edited multimedia training materials for international airline pilots and aviation schools.',
    array[
      'Developed multimedia training content using Articulate Storyline',
      'Designed visual materials in Figma for international aviation clients'
    ],
    '2020-08-01', '2020-09-30', 3
  ),
  (
    'Intern — Quality Control', 'Leonardo PZL Świdnik', 'internship', 'Świdnik, Poland', 'on-site',
    'Quality control of helicopter fuselages. Worked with technical documentation and familiarized with composite materials, metallurgy, and production processes.',
    array[
      'Physical inspection of helicopter fuselage components',
      'Worked with paper-based technical documentation and checklists'
    ],
    '2019-09-01', '2019-09-30', 4
  );

-- ─── QUALIFICATIONS (education: type=degree, certificates: type=certificate/course) ──

insert into public.qualifications (title, issuer, type, description, credential_url, issue_date, expiry_date, display_order)
values
  (
    'MSc(E) Mechanical Engineering of Power Machines (Aerospace Engineering)',
    'Wrocław University of Science and Technology',
    'degree',
    'Faculty of Mechanical and Power Engineering. Thesis: Investigation of Orbital State Estimation Algorithms for Low Earth Orbit Satellites — implemented Kalman filter simulation in Python.',
    null, '2022-06-30', null, 0
  ),
  (
    'BSc(E) Mechanical Engineering (Aerospace Engineering)',
    'Wrocław University of Science and Technology',
    'degree',
    'Faculty of Mechanical and Power Engineering. Thesis: Preliminary Project of Unmanned Aerial Vehicle Flight Control System.',
    null, '2021-06-30', null, 1
  ),
  (
    'BSc(E) Mechatronics',
    'Wrocław University of Science and Technology',
    'degree',
    'Faculty of Mechanical Engineering. Thesis: Railway Traffic Control Station Model — full electronics and software stack (Python, C++, Arduino).',
    null, '2021-06-30', null, 2
  ),
  (
    'BAEcon Economics',
    'University of Economics in Katowice',
    'degree',
    'In progress. Thesis: Forex historical analysis of level-based strategy — Python, PostgreSQL.',
    null, '2026-06-30', null, 3
  ),
  (
    'AI for Devs 4',
    'AI for Devs',
    'certificate',
    'AI agents, LLM API integration, prompt engineering. Capture-the-flag projects.',
    null, '2025-01-01', null, 4
  );

-- ─── PROJECTS ─────────────────────────────────────────────────────────────────

insert into public.projects (title, type, status, description, highlights, repo_url, demo_url, start_date, end_date, display_order)
values
  (
    'Portfolio Website', 'web', 'completed',
    'Personal portfolio built with Next.js 16, Fastify API on AWS Lambda, Supabase, and AWS Amplify. Monorepo with pnpm, shared types, CI/CD via GitHub Actions.',
    array['Next.js 16', 'TypeScript', 'Fastify', 'Supabase', 'AWS Lambda', 'AWS Amplify', 'Tailwind CSS'],
    'https://github.com/kilogrampaliwa/portfolio-site-js-based', 'https://kilogrampaliwa.com',
    '2026-01-01', null, 0
  ),
  (
    'ODX Automation Scripts', 'automation', 'completed',
    'Python automation suite for ODX signal database operations at Viessmann. Replaces manual KPIT DatabaseDeveloper workflows, handles XML manipulation, template-based generation, and Bitbucket integration.',
    array['Python', 'XML/ODX', 'Bitbucket API', 'Automation'],
    null, null, '2023-05-01', null, 1
  ),
  (
    'Railway Traffic Control Station', 'embedded', 'completed',
    'Didactic station for learning railway traffic control basics. Full stack: dependency diagrams, Python GUI (Tkinter), C++/Arduino embedded control, custom motor drivers, SPI/USB communication.',
    array['Python', 'Tkinter', 'C++', 'Arduino', 'SPI', 'USB', 'Electronics'],
    null, null, '2019-01-01', '2023-06-30', 2
  ),
  (
    'Kalman Filter for LEO Satellite Navigation', 'academic', 'completed',
    'Master''s thesis project: Python implementation of Kalman filter for orbital state estimation. Trajectory generation, Gaussian noise simulation, and filtering — all in Jupyter Notebook with Pandas and Seaborn.',
    array['Python', 'Jupyter', 'Pandas', 'Seaborn', 'Kalman Filter'],
    null, null, '2021-01-01', '2022-06-30', 3
  ),
  (
    'Forex Historical Analysis', 'data', 'in-progress',
    'Bachelor''s thesis in economics: simulation engine for long/short positions based on linear, logarithmic, and candle analysis. Python + PostgreSQL backend, matplotlib visualization.',
    array['Python', 'PostgreSQL', 'Matplotlib', 'Data Analysis'],
    null, null, '2025-06-01', null, 4
  ),
  (
    'CV Maker', 'automation', 'completed',
    'AI-powered CV generation tool — first fully LLM-based project. Structured data extraction, profile enrichment, and automated CV creation.',
    array['Python', 'LLM API', 'AI Agents'],
    null, null, '2026-01-01', null, 5
  );

-- ─── SKILLS ───────────────────────────────────────────────────────────────────

insert into public.skills (name, category, competency_level, years_of_experience, description, display_order)
values
  -- Programming languages
  ('Python',        'language', 'advanced',     7, null, 0),
  ('JavaScript',    'language', 'intermediate', 3, null, 1),
  ('TypeScript',    'language', 'intermediate', 1, null, 2),
  ('C++',           'language', 'intermediate', 3, null, 3),
  ('SQL',           'language', 'intermediate', 4, null, 4),
  ('XML / ODX',     'language', 'advanced',     3, null, 5),
  ('HTML / CSS',    'language', 'intermediate', 3, null, 6),
  ('RAPID (ABB)',   'language', 'beginner',     1, null, 7),
  ('Go',            'language', 'beginner',     1, null, 8),

  -- Frameworks & libraries
  ('Django',        'framework', 'beginner',      1, null, 10),
  ('Flask',         'framework', 'beginner',      1, null, 11),
  ('React',         'framework', 'beginner',      1, null, 12),
  ('Next.js',       'framework', 'beginner',      1, null, 13),
  ('Pandas',        'framework', 'intermediate',  4, null, 14),
  ('Matplotlib',    'framework', 'intermediate',  4, null, 15),
  ('NumPy',         'framework', 'intermediate',  3, null, 16),
  ('Scikit-learn',  'framework', 'beginner',      1, null, 17),
  ('Tkinter',       'framework', 'intermediate',  3, null, 18),

  -- Tools & platforms
  ('Git',           'tool', 'intermediate', 5, null, 20),
  ('Bitbucket',     'tool', 'intermediate', 3, null, 21),
  ('GitHub',        'tool', 'intermediate', 3, null, 22),
  ('Jira',          'tool', 'intermediate', 3, null, 23),
  ('Docker',        'tool', 'beginner',     1, null, 24),
  ('Jenkins',       'tool', 'beginner',     1, null, 25),
  ('VS Code',       'tool', 'advanced',     5, null, 26),

  -- Databases
  ('PostgreSQL',    'database', 'intermediate', 2, null, 30),
  ('MySQL',         'database', 'beginner',     1, null, 31),
  ('Supabase',      'database', 'beginner',     1, null, 32),

  -- Cloud & DevOps
  ('AWS',           'cloud', 'beginner', 1, null, 40),

  -- CAD & Simulation
  ('Autodesk Fusion 360',  'cad', 'intermediate', 3, null, 50),
  ('Autodesk Inventor',    'cad', 'intermediate', 3, null, 51),
  ('Dassault CATIA',       'cad', 'intermediate', 2, null, 52),
  ('Dassault DELMIA',      'cad', 'intermediate', 1, null, 53),
  ('Siemens NX',           'cad', 'intermediate', 2, null, 54),

  -- AI / LLM
  ('LLM / AI Tools',   'ai', 'intermediate', 2, 'Claude, ChatGPT, Gemini, DeepSeek — API integration and agent development', 60),
  ('Claude Copilot',   'ai', 'intermediate', 1, null, 61),

  -- Natural languages (served via GET /skills?category=languages)
  ('English',   'languages', 'advanced',     null, 'C1 — fluent, used professionally', 70),
  ('German',    'languages', 'beginner',     null, 'A1/A2 — basic, technical reading', 71),
  ('Spanish',   'languages', 'beginner',     null, 'A1 — basic', 72),
  ('Polish',    'languages', 'advanced',     null, 'Native', 73);

-- ─── API KEYS (keep existing test keys for dev) ───────────────────────────────

-- Test API key for the "web" client. Raw value (sha-256 hashed below):
--   a456fb3913986e5dd8970c52013d2602bd222a2fbf23c05a27891d11def215db
insert into public.api_keys (key_hash, client_name)
values (
  'd4eef7393432c820b1b3b50d3db128b57de332d8a1348bf94ef739b986ecde40',
  'web'
) on conflict (key_hash) do nothing;

-- Revoked test API key for integration tests (assert 401).
insert into public.api_keys (key_hash, client_name, revoked_at)
values (
  '6fd41bc19b8007c79c63ae82fe054349e32fa44a0ff60579947b4f5ce1527f72',
  'revoked-test-client',
  now()
) on conflict (key_hash) do nothing;
