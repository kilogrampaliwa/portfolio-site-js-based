import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { getAbout, getExperience, getQualifications } from "./apiProfile";

const validAbout = {
  bioShort: "Short bio.",
  bioLong: "Long bio about myself.",
  targetRoles: ["Backend Development", "Data Engineering"],
  updatedAt: "2024-01-01T00:00:00.000Z",
};

const validExperience = [
  {
    id: "1",
    title: "Software Engineer",
    company: "Acme",
    employmentType: "full-time",
    location: "Remote",
    locationType: "remote",
    description: "Did things.",
    achievements: ["Shipped feature X"],
    startDate: "2020-01-01",
    endDate: null,
    displayOrder: 0,
  },
];

const validQualifications = [
  {
    id: "1",
    title: "MSc — Computer Science",
    issuer: "State University",
    type: "degree",
    description: "Studied CS.",
    credentialId: null,
    credentialUrl: null,
    issueDate: "2018-06-01",
    expiryDate: null,
    displayOrder: 0,
  },
];

describe("apiProfile", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.NEXT_PUBLIC_PROFILE_API_URL = "http://localhost:3001";
    process.env.PROFILE_API_KEY = "test-key";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
  });

  describe("getAbout", () => {
    it("returns the parsed about and sends the API key", async () => {
      const fetchMock = vi
        .spyOn(global, "fetch")
        .mockResolvedValue(new Response(JSON.stringify(validAbout), { status: 200 }));

      const result = await getAbout();

      expect(result).toEqual(validAbout);
      const [url, init] = fetchMock.mock.calls[0];
      expect(String(url)).toBe("http://localhost:3001/about");
      expect((init?.headers as Record<string, string>)["X-API-Key"]).toBe("test-key");
    });

    it("returns null when the API responds with an error status", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(new Response("oops", { status: 500 }));

      expect(await getAbout()).toBeNull();
    });

    it("returns null when the response doesn't match the schema", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(
        new Response(JSON.stringify({ unexpected: true }), { status: 200 }),
      );

      expect(await getAbout()).toBeNull();
    });

    it("returns null when fetch throws", async () => {
      vi.spyOn(global, "fetch").mockRejectedValue(new Error("network error"));

      expect(await getAbout()).toBeNull();
    });

    it("returns null without fetching when env vars are missing", async () => {
      delete process.env.PROFILE_API_KEY;
      const fetchMock = vi.spyOn(global, "fetch");

      expect(await getAbout()).toBeNull();
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe("getExperience", () => {
    it("returns the parsed experience list", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(
        new Response(JSON.stringify(validExperience), { status: 200 }),
      );

      expect(await getExperience()).toEqual(validExperience);
    });

    it("returns an empty array on error", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(new Response("oops", { status: 500 }));

      expect(await getExperience()).toEqual([]);
    });
  });

  describe("getQualifications", () => {
    it("returns the parsed qualification list", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(
        new Response(JSON.stringify(validQualifications), { status: 200 }),
      );

      expect(await getQualifications("degree")).toEqual(validQualifications);
    });

    it("appends ?type= when provided", async () => {
      const fetchMock = vi
        .spyOn(global, "fetch")
        .mockResolvedValue(new Response(JSON.stringify([]), { status: 200 }));

      await getQualifications("certification,course");

      expect(String(fetchMock.mock.calls[0][0])).toBe(
        "http://localhost:3001/qualifications?type=certification%2Ccourse",
      );
    });

    it("returns an empty array on error", async () => {
      vi.spyOn(global, "fetch").mockResolvedValue(new Response("oops", { status: 500 }));

      expect(await getQualifications()).toEqual([]);
    });
  });
});
