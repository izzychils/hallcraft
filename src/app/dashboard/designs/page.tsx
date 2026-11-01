"use client";

import { useMemo, useState } from "react";
import { LayoutGrid, Plus, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { Tabs } from "@/components/ui/primitives";
import { DesignCard } from "@/components/workspace/design-card";
import { useDesigns, useDesignsReady, type DesignStatus } from "@/features/designs/library";
import { useNewDesign } from "@/features/designs/new-design";

type StatusFilter = "all" | DesignStatus;
type SortOption = "recent" | "name" | "event";

export default function DesignsPage() {
  const designs = useDesigns();
  const ready = useDesignsReady();
  const { open } = useNewDesign();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortOption>("recent");

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();
    const list = designs.filter((design) => {
      const matchesStatus = status === "all" || design.status === status;
      const matchesSearch =
        !search ||
        design.name.toLowerCase().includes(search) ||
        design.venueName.toLowerCase().includes(search) ||
        design.eventType.toLowerCase().includes(search);
      return matchesStatus && matchesSearch;
    });
    return list.sort((left, right) => {
      if (sort === "name") return left.name.localeCompare(right.name);
      if (sort === "event") return left.eventDate.localeCompare(right.eventDate);
      return right.updatedAt - left.updatedAt;
    });
  }, [designs, query, sort, status]);

  const counts = useMemo(
    () => ({
      all: designs.length,
      Draft: designs.filter((design) => design.status === "Draft").length,
      "In review": designs.filter((design) => design.status === "In review").length,
      Approved: designs.filter((design) => design.status === "Approved").length,
      Archived: designs.filter((design) => design.status === "Archived").length,
    }),
    [designs],
  );

  return (
    <div className="mx-auto w-full max-w-[1280px] px-5 pb-16 pt-8 lg:px-9 lg:pt-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Design library</p>
          <h1 className="mt-3 flex flex-wrap items-center gap-3 text-[clamp(2rem,4vw,3.2rem)] font-medium leading-[0.96] tracking-[-0.055em]">
            Every room,
            <span className="inline-block -rotate-1 rounded-md bg-[#c9b5f7] px-3 pb-1">one place</span>
          </h1>
          <p className="mt-3 max-w-lg text-[13.5px] leading-6 text-[#6f695e]">
            Floor plans, guest counts and the latest room checks. Open a design to pick up exactly
            where the team left it.
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={() => open()}>
          <Plus className="h-3.5 w-3.5" />
          New design
        </Button>
      </header>

      <div className="mt-7 flex flex-col gap-3 rounded-xl border border-[#ddd6c8] bg-[#fbf8f1] p-2.5 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9a9488]" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by design, venue or event type…"
            className="h-8 border-transparent bg-transparent pl-8 shadow-none focus:border-[#d7d1c4] focus:bg-[#fffdf8] focus:ring-0"
            aria-label="Search designs"
          />
        </div>
        <div className="flex items-center gap-2 border-t border-[#eae4d7] pt-2 sm:border-l sm:border-t-0 sm:pl-3 sm:pt-0">
          <SlidersHorizontal className="h-3.5 w-3.5 text-[#8a8376]" />
          <Select
            value={sort}
            onChange={(event) => setSort(event.target.value as SortOption)}
            className="h-8 w-[150px] border-transparent bg-[#f2eee4] text-[11px]"
            aria-label="Sort designs"
          >
            <option value="recent">Recently edited</option>
            <option value="name">Name, A–Z</option>
            <option value="event">Event date</option>
          </Select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <Tabs
          value={status}
          onChange={setStatus}
          variant="pill"
          tabs={[
            { id: "all", label: "All", count: counts.all },
            { id: "Draft", label: "Draft", count: counts.Draft },
            { id: "In review", label: "In review", count: counts["In review"] },
            { id: "Approved", label: "Approved", count: counts.Approved },
          ]}
        />
        <p className="text-[11px] text-[#8a8376]">
          {filtered.length} design{filtered.length === 1 ? "" : "s"}
          {query ? ` matching “${query}”` : ""}
        </p>
      </div>

      <section className="mt-4">
        {!ready ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-[340px] animate-pulse rounded-xl border border-[#e1dacd] bg-[#eee8dc]"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="grid place-items-center rounded-2xl border border-dashed border-[#d3cbbb] bg-[#f8f4ea] px-6 py-20 text-center">
            <span className="grid h-12 w-12 place-items-center rounded-full bg-[#ece6da]">
              <LayoutGrid className="h-5 w-5 text-[#8a8376]" />
            </span>
            <h2 className="mt-4 text-lg font-medium tracking-[-0.03em]">Nothing matches that yet</h2>
            <p className="mt-1 max-w-sm text-[12.5px] leading-5 text-[#7c7568]">
              Try a different search or status. Or start a fresh room from a brief.
            </p>
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setQuery("");
                  setStatus("all");
                }}
              >
                Clear filters
              </Button>
              <Button size="sm" onClick={() => open()}>
                New design
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((design) => (
              <DesignCard key={design.id} design={design} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
