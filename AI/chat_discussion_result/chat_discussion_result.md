Set up a new Next.js (TypeScript, App Router) portfolio website project.

Stack: Next.js 14+, TypeScript, Tailwind CSS, Supabase (JS client) for data.

Structure:
- "/" - single-page scrolling layout with sections: Hero, About, Experience highlights, Featured Projects, Latest Blog Posts (3 newest), Contact
- "/blog" - paginated list of all blog posts
- "/blog/[slug]" - individual blog post page (ISR, markdown content)
- "/projects" - full list of projects with details

Supabase tables needed: 
- posts (id, slug, title, excerpt, content, published_at, tags)
- experience (id, company, role, start_date, end_date, description)
- projects (id, title, slug, description, tech_stack, link, image_url)

For now, scaffold the project structure, Tailwind config, Supabase client setup, and basic page routes with placeholder data. Keep code simple, well-organized, and use clear component naming. Add short English comments only where logic isn't obvious.