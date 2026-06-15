import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getFeaturedProjects, getLatestPosts, getPostBySlug, getPosts, getProjectBySlug, getProjects } from "./apiSite";

const validProject = {
  id: "1",
  slug: "demo",
  title: "Demo Project",
  description: "A demo project.",
  techStack: ["TypeScript"],
  link: null,
  repoUrl: null,
  imageUrl: null,
  featured: true,
  orderIndex: 0,
  publishedAt: "2024-01-01T00:00:00.000Z",
};

const validPaginatedPosts = {
  items: [
    {
      id: "1",
      slug: "hello-world",
      title: "Hello World",
      excerpt: "An introduction.",
      content: "Full content.",
      tags: ["intro"],
      publishedAt: "2024-01-01T00:00:00.000Z",
    },
  ],
  page: 1,
  pageSize: 3,
  total: 1,
  totalPages: 1,
};

describe("apiSite", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SITE_API_URL = "http://localhost:3002";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  describe("getFeaturedProjects", () => {
    it("returns the parsed project list, requesting featured=true and the locale", async () => {
      const fetchMock = vi
        .spyOn(global, "fetch")
        .mockResolvedValue(new Response(JSON.stringify([validProject]), { status: 200 }));

      expect(await getFeaturedProjects("pl")).toEqual([validProject]);

      const [url] = fetchMock.mock.calls[0];
      expect(String(url)).toBe("http://localhost:3002/projects?locale=pl&featured=true");
    });

    it("returns an empty array when the response doesn't match the schema", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(new Response(JSON.stringify({}), { status: 200 }));

      expect(await getFeaturedProjects("en")).toEqual([]);
    });

    it("returns an empty array on network error", async () => {
      vi.spyOn(global, "fetch").mockRejectedValue(new Error("network error"));

      expect(await getFeaturedProjects("en")).toEqual([]);
    });
  });

  describe("getLatestPosts", () => {
    it("returns the items from the paginated response", async () => {
      const fetchMock = vi
        .spyOn(global, "fetch")
        .mockResolvedValue(new Response(JSON.stringify(validPaginatedPosts), { status: 200 }));

      expect(await getLatestPosts("en", 3)).toEqual(validPaginatedPosts.items);

      const [url] = fetchMock.mock.calls[0];
      expect(String(url)).toBe("http://localhost:3002/posts?locale=en&page=1&pageSize=3");
    });

    it("returns an empty array when the API is unreachable", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(new Response("oops", { status: 500 }));

      expect(await getLatestPosts("en", 3)).toEqual([]);
    });
  });

  describe("getProjects", () => {
    it("returns the parsed project list, requesting the locale", async () => {
      const fetchMock = vi
        .spyOn(global, "fetch")
        .mockResolvedValue(new Response(JSON.stringify([validProject]), { status: 200 }));

      expect(await getProjects("pl")).toEqual([validProject]);

      const [url] = fetchMock.mock.calls[0];
      expect(String(url)).toBe("http://localhost:3002/projects?locale=pl");
    });

    it("returns an empty array on error", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(new Response("oops", { status: 500 }));

      expect(await getProjects("en")).toEqual([]);
    });
  });

  describe("getProjectBySlug", () => {
    it("returns the parsed project, requesting the slug and locale", async () => {
      const fetchMock = vi
        .spyOn(global, "fetch")
        .mockResolvedValue(new Response(JSON.stringify(validProject), { status: 200 }));

      expect(await getProjectBySlug("pl", "demo")).toEqual(validProject);

      const [url] = fetchMock.mock.calls[0];
      expect(String(url)).toBe("http://localhost:3002/projects/demo?locale=pl");
    });

    it("returns null on a 404", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(new Response("not found", { status: 404 }));

      expect(await getProjectBySlug("en", "missing")).toBeNull();
    });
  });

  describe("getPosts", () => {
    it("returns the full paginated response, requesting page/pageSize/locale", async () => {
      const fetchMock = vi
        .spyOn(global, "fetch")
        .mockResolvedValue(new Response(JSON.stringify(validPaginatedPosts), { status: 200 }));

      expect(await getPosts("en", 1, 3)).toEqual(validPaginatedPosts);

      const [url] = fetchMock.mock.calls[0];
      expect(String(url)).toBe("http://localhost:3002/posts?locale=en&page=1&pageSize=3");
    });

    it("returns an empty page (preserving page/pageSize) on error", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(new Response("oops", { status: 500 }));

      expect(await getPosts("en", 2, 3)).toEqual({ items: [], page: 2, pageSize: 3, total: 0, totalPages: 0 });
    });
  });

  describe("getPostBySlug", () => {
    it("returns the parsed post, requesting the slug and locale", async () => {
      const post = validPaginatedPosts.items[0];
      const fetchMock = vi
        .spyOn(global, "fetch")
        .mockResolvedValue(new Response(JSON.stringify(post), { status: 200 }));

      expect(await getPostBySlug("pl", "hello-world")).toEqual(post);

      const [url] = fetchMock.mock.calls[0];
      expect(String(url)).toBe("http://localhost:3002/posts/hello-world?locale=pl");
    });

    it("returns null on a 404", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(new Response("not found", { status: 404 }));

      expect(await getPostBySlug("en", "missing")).toBeNull();
    });
  });
});
