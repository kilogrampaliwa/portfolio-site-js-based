import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "./app";

/**
 * Integration tests against a local Supabase instance for the site brain
 * (`supabase/site`). Run `supabase start --workdir supabase/site` first (see
 * `supabase/site/README.md`), then `pnpm --filter @portfolio/api-site test`
 * (or root `pnpm test`).
 *
 * Assertions below rely on the fixtures in
 * `supabase/site/supabase/seed.sql` (5 published + 1 draft project, 5
 * published + 1 draft post).
 */
let app: FastifyInstance;

beforeAll(async () => {
  process.env.ALLOWED_ORIGINS ??= "http://localhost:3000";
  app = await buildApp();
  await app.ready();
});

afterAll(async () => {
  await app.close();
});

describe("GET /health", () => {
  it("returns status ok", async () => {
    const response = await app.inject({ method: "GET", url: "/health" });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok" });
  });
});

describe("GET /projects", () => {
  it("returns published projects ordered by order_index", async () => {
    const response = await app.inject({ method: "GET", url: "/projects" });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body[0].slug).toBe("portfolio-website");
    expect(body[0].orderIndex).toBe(0);
    expect(body.some((project: { slug: string }) => project.slug === "experimental-ai-tool")).toBe(false);
  });

  it("filters to featured projects with ?featured=true", async () => {
    const response = await app.inject({ method: "GET", url: "/projects?featured=true" });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.length).toBeGreaterThan(0);
    expect(body.every((project: { featured: boolean }) => project.featured)).toBe(true);
  });

  it("resolves ?locale=pl", async () => {
    const response = await app.inject({ method: "GET", url: "/projects?locale=pl" });

    expect(response.statusCode).toBe(200);
    expect(response.json()[0].description).toContain("Osobiste portfolio");
  });

  it("rejects an invalid ?locale=", async () => {
    const response = await app.inject({ method: "GET", url: "/projects?locale=fr" });

    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe("bad_request");
  });
});

describe("GET /projects/:slug", () => {
  it("returns a published project by slug", async () => {
    const response = await app.inject({ method: "GET", url: "/projects/portfolio-website" });

    expect(response.statusCode).toBe(200);
    expect(response.json().title).toBe("Portfolio Website");
  });

  it("returns 404 for an unknown slug", async () => {
    const response = await app.inject({ method: "GET", url: "/projects/does-not-exist" });

    expect(response.statusCode).toBe(404);
    expect(response.json().error.code).toBe("not_found");
  });

  it("returns 404 for an unpublished slug", async () => {
    const response = await app.inject({ method: "GET", url: "/projects/experimental-ai-tool" });

    expect(response.statusCode).toBe(404);
    expect(response.json().error.code).toBe("not_found");
  });
});

describe("GET /posts", () => {
  it("returns published posts newest first", async () => {
    const response = await app.inject({ method: "GET", url: "/posts" });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.total).toBe(5);
    expect(body.page).toBe(1);
    expect(body.pageSize).toBe(10);
    expect(body.items[0].slug).toBe("future-of-web-development");
    expect(body.items.some((post: { slug: string }) => post.slug === "draft-post-in-progress")).toBe(false);
  });

  it("paginates with ?page= and ?pageSize=", async () => {
    const page1 = await app.inject({ method: "GET", url: "/posts?page=1&pageSize=2" });
    expect(page1.statusCode).toBe(200);
    const page1Body = page1.json();
    expect(page1Body.items).toHaveLength(2);
    expect(page1Body.totalPages).toBe(3);

    const page3 = await app.inject({ method: "GET", url: "/posts?page=3&pageSize=2" });
    expect(page3.statusCode).toBe(200);
    expect(page3.json().items).toHaveLength(1);
  });

  it("returns an empty page for an out-of-range page", async () => {
    const response = await app.inject({ method: "GET", url: "/posts?page=10&pageSize=2" });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.items).toHaveLength(0);
    expect(body.total).toBe(5);
  });

  it("rejects invalid pagination params", async () => {
    const response = await app.inject({ method: "GET", url: "/posts?page=0" });

    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe("bad_request");
  });

  it("rejects a ?pageSize= above the maximum", async () => {
    const response = await app.inject({ method: "GET", url: "/posts?pageSize=51" });

    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe("bad_request");
  });
});

describe("GET /posts/:slug", () => {
  it("returns a published post by slug", async () => {
    const response = await app.inject({ method: "GET", url: "/posts/getting-started-with-typescript" });

    expect(response.statusCode).toBe(200);
    expect(response.json().title).toBe("Getting Started with TypeScript");
  });

  it("resolves ?locale=pl", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/posts/getting-started-with-typescript?locale=pl",
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().title).toBe("Wprowadzenie do TypeScript");
  });

  it("returns 404 for an unknown slug", async () => {
    const response = await app.inject({ method: "GET", url: "/posts/does-not-exist" });

    expect(response.statusCode).toBe(404);
    expect(response.json().error.code).toBe("not_found");
  });

  it("returns 404 for a draft slug", async () => {
    const response = await app.inject({ method: "GET", url: "/posts/draft-post-in-progress" });

    expect(response.statusCode).toBe(404);
    expect(response.json().error.code).toBe("not_found");
  });
});

describe("CORS", () => {
  it("allows a listed origin", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/health",
      headers: { origin: "http://localhost:3000" },
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers["access-control-allow-origin"]).toBe("http://localhost:3000");
  });

  it("rejects an unlisted origin", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/health",
      headers: { origin: "http://evil.example.com" },
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().error.code).toBe("forbidden");
  });
});
