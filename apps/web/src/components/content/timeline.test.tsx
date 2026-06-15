import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Timeline, type TimelineEntry } from "./timeline";

const items: TimelineEntry[] = [
  {
    id: "1",
    title: "Engineer",
    subtitle: "Acme",
    meta: "Remote",
    startDate: "2020-01-01",
    endDate: "2022-01-01",
    description: "Built things.",
  },
  {
    id: "2",
    title: "Senior Engineer",
    subtitle: "Acme",
    meta: null,
    startDate: "2022-01-01",
    endDate: null,
    description: "Built more things.",
  },
];

describe("Timeline", () => {
  it("renders each entry with title, subtitle, dates, and description", () => {
    render(<Timeline items={items} presentLabel="Present" emptyLabel="Nothing yet." />);

    expect(screen.getByText("Engineer — Acme")).toBeInTheDocument();
    expect(screen.getByText("Remote")).toBeInTheDocument();
    expect(screen.getByText("2020-01-01 – 2022-01-01")).toBeInTheDocument();
    expect(screen.getByText("Built things.")).toBeInTheDocument();
  });

  it("falls back to the present label for an open-ended end date", () => {
    render(<Timeline items={items} presentLabel="Present" emptyLabel="Nothing yet." />);

    expect(screen.getByText("2022-01-01 – Present")).toBeInTheDocument();
  });

  it("renders the empty label when there are no items", () => {
    render(<Timeline items={[]} presentLabel="Present" emptyLabel="Nothing yet." />);

    expect(screen.getByText("Nothing yet.")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});
