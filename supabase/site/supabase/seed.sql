-- Layer 04: placeholder seed data for local dev / integration tests.
-- Realistic but fictional content in en/pl. Replace with real project/blog
-- content later -- the shape is what matters here.

insert into public.projects (slug, title, description, tech_stack, link, repo_url, image_url, featured, order_index, published_at)
values
  (
    'portfolio-website',
    'Portfolio Website',
    '{
      "en": "A personal portfolio and blog built as a monorepo, with a custom API layer over two independent Supabase projects for profile/CV and site content.",
      "pl": "Osobiste portfolio i blog zbudowane jako monorepo, z własną warstwą API nad dwoma niezależnymi projektami Supabase dla danych profilowych/CV i treści serwisu."
    }',
    array['typescript', 'next.js', 'fastify', 'supabase'],
    'https://example.com',
    'https://github.com/janedoe/portfolio-site',
    null,
    true,
    0,
    '2026-01-10T00:00:00Z'
  ),
  (
    'task-manager-app',
    'Task Manager App',
    '{
      "en": "A collaborative task management app with real-time updates, drag-and-drop boards, and team workspaces.",
      "pl": "Aplikacja do zarządzania zadaniami zespołu z aktualizacjami w czasie rzeczywistym, tablicami przeciągnij-i-upuść oraz przestrzeniami zespołowymi."
    }',
    array['react', 'node.js', 'postgresql', 'websockets'],
    'https://example.com/task-manager',
    'https://github.com/janedoe/task-manager',
    null,
    false,
    1,
    '2025-09-01T00:00:00Z'
  ),
  (
    'weather-dashboard',
    'Weather Dashboard',
    '{
      "en": "A weather dashboard aggregating multiple forecast providers with historical trend charts and location search.",
      "pl": "Panel pogodowy agregujący dane z wielu serwisów prognozujących, z wykresami trendów historycznych i wyszukiwaniem lokalizacji."
    }',
    array['vue', 'typescript', 'chart.js'],
    'https://example.com/weather',
    'https://github.com/janedoe/weather-dashboard',
    null,
    false,
    2,
    '2025-05-20T00:00:00Z'
  ),
  (
    'chat-application',
    'Chat Application',
    '{
      "en": "A real-time chat application with channels, direct messages, and file sharing, built on WebSockets.",
      "pl": "Aplikacja czatu w czasie rzeczywistym z kanałami, wiadomościami prywatnymi i udostępnianiem plików, zbudowana na WebSocketach."
    }',
    array['react', 'fastify', 'websockets', 'redis'],
    null,
    'https://github.com/janedoe/chat-app',
    null,
    false,
    3,
    '2024-11-05T00:00:00Z'
  ),
  (
    'experimental-ai-tool',
    'Experimental AI Tool',
    '{
      "en": "An in-progress experiment with AI-assisted code review tooling. Not yet ready for public viewing.",
      "pl": "Eksperymentalne narzędzie do przeglądu kodu wspierane przez AI, wciąż w trakcie prac. Jeszcze nieprzygotowane do publicznego udostępnienia."
    }',
    array['python', 'llm'],
    null,
    null,
    null,
    false,
    4,
    null
  );

insert into public.posts (slug, title, excerpt, content, tags, published_at)
values
  (
    'getting-started-with-typescript',
    '{"en": "Getting Started with TypeScript", "pl": "Wprowadzenie do TypeScript"}',
    '{
      "en": "A beginner-friendly introduction to TypeScript: why static types help, and how to add them to an existing JavaScript project.",
      "pl": "Przyjazne dla początkujących wprowadzenie do TypeScript: dlaczego statyczne typy pomagają i jak dodać je do istniejącego projektu JavaScript."
    }',
    '{
      "en": "TypeScript adds a static type system on top of JavaScript, catching a whole class of bugs before your code ever runs. In this post, we walk through setting up TypeScript in an existing project, configuring `tsconfig.json`, and gradually adding types to your most error-prone modules.",
      "pl": "TypeScript dodaje statyczny system typów do JavaScript, wychwytując całą klasę błędów jeszcze przed uruchomieniem kodu. W tym wpisie pokazujemy, jak skonfigurować TypeScript w istniejącym projekcie, ustawić `tsconfig.json` i stopniowo dodawać typy do najbardziej podatnych na błędy modułów."
    }',
    array['typescript', 'javascript', 'tutorial'],
    '2025-02-01T00:00:00Z'
  ),
  (
    'building-scalable-apis',
    '{"en": "Building Scalable APIs with Fastify", "pl": "Budowanie skalowalnych API z Fastify"}',
    '{
      "en": "Lessons learned building high-throughput Node.js APIs with Fastify, from plugin architecture to schema-based validation.",
      "pl": "Wnioski z budowania wydajnych API w Node.js z użyciem Fastify, od architektury wtyczek do walidacji opartej na schematach."
    }',
    '{
      "en": "Fastify''s plugin encapsulation model makes it easy to keep large APIs modular. Combined with JSON schema validation and a fast router, it scales well from a small side project to a production service handling real traffic.",
      "pl": "Model enkapsulacji wtyczek Fastify pozwala łatwo utrzymać modularność dużych API. W połączeniu z walidacją JSON schema i szybkim routerem skaluje się dobrze od małego projektu hobbystycznego do usługi produkcyjnej obsługującej realny ruch."
    }',
    array['node.js', 'fastify', 'api', 'backend'],
    '2025-04-12T00:00:00Z'
  ),
  (
    'react-server-components-explained',
    '{"en": "React Server Components Explained", "pl": "React Server Components — wyjaśnienie"}',
    '{
      "en": "What React Server Components are, how they differ from traditional client components, and when to reach for each.",
      "pl": "Co to są React Server Components, czym różnią się od tradycyjnych komponentów klienckich i kiedy po nie sięgać."
    }',
    '{
      "en": "Server Components render on the server and ship zero JavaScript to the client by default, while Client Components remain interactive in the browser. Understanding the boundary between the two is key to building fast, modern Next.js applications.",
      "pl": "Komponenty serwerowe renderują się na serwerze i domyślnie nie wysyłają żadnego JavaScriptu do klienta, natomiast komponenty klienckie pozostają interaktywne w przeglądarce. Zrozumienie granicy między nimi jest kluczowe dla budowania szybkich, nowoczesnych aplikacji Next.js."
    }',
    array['react', 'next.js', 'frontend'],
    '2025-07-22T00:00:00Z'
  ),
  (
    'my-aws-deployment-journey',
    '{"en": "My AWS Deployment Journey", "pl": "Moja podróż z wdrażaniem na AWS"}',
    '{
      "en": "How I moved a side project from a single EC2 instance to a serverless architecture using Lambda, API Gateway, and CDK.",
      "pl": "Jak przeniosłem projekt hobbystyczny z jednej instancji EC2 do architektury bezserwerowej z użyciem Lambda, API Gateway i CDK."
    }',
    '{
      "en": "Moving to a serverless architecture meant rethinking how the app handled state and cold starts, but the payoff in reduced operational overhead and cost was significant. CDK made the infrastructure reproducible and easy to review in pull requests.",
      "pl": "Przejście na architekturę bezserwerową wymagało przemyślenia podejścia do stanu aplikacji i cold startów, ale zyski w postaci niższych kosztów i mniejszego nakładu operacyjnego były znaczące. CDK uczyniło infrastrukturę odtwarzalną i łatwą do przeglądu w pull requestach."
    }',
    array['aws', 'serverless', 'cdk', 'devops'],
    '2025-10-30T00:00:00Z'
  ),
  (
    'future-of-web-development',
    '{"en": "Thoughts on the Future of Web Development", "pl": "Przemyślenia o przyszłości web developmentu"}',
    '{
      "en": "A few predictions about where web development is heading: more server-driven UI, edge computing, and AI-assisted tooling.",
      "pl": "Kilka przewidywań dotyczących przyszłości web developmentu: więcej UI sterowanego przez serwer, computing na krawędzi sieci i narzędzia wspierane przez AI."
    }',
    '{
      "en": "The pendulum is swinging back toward server-driven UI, but with much better tooling than a decade ago. Combined with edge computing and AI-assisted development tools, the way we build for the web is changing quickly.",
      "pl": "Wahadło wraca w stronę UI sterowanego przez serwer, ale z dużo lepszymi narzędziami niż dekadę temu. W połączeniu z computingiem na krawędzi sieci i narzędziami programistycznymi wspieranymi przez AI, sposób budowania aplikacji webowych szybko się zmienia."
    }',
    array['opinion', 'web-development'],
    '2026-02-18T00:00:00Z'
  ),
  (
    'draft-post-in-progress',
    '{"en": "Draft: Notes on a New Project (WIP)", "pl": "Szkic: Notatki o nowym projekcie (w trakcie)"}',
    '{
      "en": "Work-in-progress notes, not yet ready for publication.",
      "pl": "Notatki w trakcie pisania, jeszcze nieprzygotowane do publikacji."
    }',
    '{
      "en": "This post is still a work in progress and intentionally left unpublished.",
      "pl": "Ten wpis jest wciąż w trakcie pisania i celowo pozostaje nieopublikowany."
    }',
    array['draft'],
    null
  );
