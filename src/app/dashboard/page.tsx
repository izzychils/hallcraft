"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronRight,
  CircleAlert,
  Sparkles,
  Users,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge, Tabs } from "@/components/ui/primitives";
import { DesignCard } from "@/components/workspace/design-card";
import { useAuth } from "@/features/auth/auth";
import { useDesigns, useDesignsReady, TEAM_COLLABORATORS } from "@/features/designs/library";
import { useNewDesign } from "@/features/designs/new-design";
import { getSceneStats, getSceneWarnings } from "@/features/floorplan/geometry";
import { EVENT_TYPES } from "@/features/floorplan/constants";
import { formatRelativeTime } from "@/lib/utils";

const PROMPT_STARTERS = [
  "Awards night for 180, central stage, VIP corner",
  "Wedding for 120 with a long arrival aisle",
  "Product launch, 180 standing, two bars",
];

export default function DashboardOverview() {
  const { user } = useAuth();
  const designs = useDesigns();
  const ready = useDesignsReady();
  const { open } = useNewDesign();
  const [brief, setBrief] = useState("");
  const [filter, setFilter] = useState<"all" | "mine" | "starred">("all");

  // The marketing nav's "New design" action lands here with ?new=1.
  useEffect(() => {
    if (!ready) return;
    if (new URLSearchParams(window.location.search).get("new") !== "1") return;
    open();
    window.history.replaceState(null, "", "/dashboard");
  }, [ready, open]);

  const active = designs.filter((design) => design.status !== "Archived");
  const stats = useMemo(() => {
    const guests = active.reduce((total, design) => total + design.guestCount, 0);
    const seats = active.reduce(
      (total, design) => total + getSceneStats(design.scene).seats,
      0,
    );
    const issues = active.flatMap((design) =>
      getSceneWarnings(design.scene)
        .filter((warning) => warning.severity === "high" || warning.severity === "medium")
        .map((warning) => ({ design, warning })),
    );
    return { guests, seats, issues };
  }, [active]);

  const visibleDesigns = useMemo(() => {
    const sorted = [...designs].sort((a, b) => b.updatedAt - a.updatedAt);
    if (filter === "starred") return sorted.filter((design) => design.starred);
    if (filter === "mine") return sorted.filter((design) => design.ownerId === user?.id);
    return sorted;
  }, [designs, filter, user?.id]);

  const recent = visibleDesigns.slice(0, 3);
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Morning" : currentHour < 18 ? "Afternoon" : "Evening";
  const firstName = user?.name.split(" ")[0] ?? "there";

  return (
    <div className="mx-auto w-full max-w-[1280px] px-5 pb-16 pt-8 lg:px-9 lg:pt-10">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="eyebrow">
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}{" "}
            · {user?.studio}
          </p>
          <h1 className="mt-3 text-[clamp(2.2rem,4.3vw,3.5rem)] font-medium leading-[0.96] tracking-[-0.055em]">
            {greeting}, {firstName}.
            <span className="ml-3 hidden align-middle text-[11px] font-medium tracking-[-0.01em] text-[#756e61] sm:inline-block">
              {active.length} rooms in play
            </span>
          </h1>
          <p className="mt-3 max-w-lg text-[13.5px] leading-6 text-[#6f695e]">
            Every plan is a little more settled than yesterday. Pick up a room, run a check, or
            start from a sentence.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/designs">
            <Button variant="outline" size="sm" className="gap-1.5">
              All designs
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
          <Button variant="default" size="sm" className="gap-1.5" onClick={() => open()}>
            <Sparkles className="h-3.5 w-3.5" />
            New design
          </Button>
        </div>
      </header>

      <section className="mt-8 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <StatCard
          label="Active designs"
          value={active.length.toString().padStart(2, "0")}
          note={`${designs.filter((design) => design.status === "Approved").length} approved`}
          tone="paper"
        />
        <StatCard
          label="Guests planned"
          value={stats.guests.toLocaleString()}
          note="across all live rooms"
          tone="paper"
        />
        <StatCard
          label="Seats placed"
          value={stats.seats.toLocaleString()}
          note="round + banquet tables"
          tone="lilac"
        />
        <StatCard
          label="Checks to review"
          value={stats.issues.length.toString().padStart(2, "0")}
          note={stats.issues.length ? "before the next site visit" : "all rooms clear"}
          tone="lime"
        />
      </section>

      <section className="mt-4 grid gap-3 lg:grid-cols-[1.5fr_1fr]">
        <div className="relative overflow-hidden rounded-2xl bg-[#111111] p-6 text-[#f8f4ea] sm:p-7">
          <div className="absolute right-0 top-0 h-40 w-40 translate-x-8 -translate-y-10 rounded-full bg-[#d9f36b]/15 blur-2xl" />
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-[#b8b2a3]">
            <Wand2 className="h-3.5 w-3.5 text-[#d9f36b]" />
            Draft with a sentence
          </div>
          <h2 className="mt-3 max-w-xl text-[clamp(1.6rem,2.8vw,2.25rem)] font-medium leading-[1.03] tracking-[-0.045em]">
            Tell us about the room.
            <br />
            <span className="text-[#d9f36b]">We&apos;ll lay the table plan.</span>
          </h2>

          <form
            className="mt-5 flex flex-col gap-2 rounded-xl border border-white/15 bg-white/[0.06] p-1.5 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              open(brief || PROMPT_STARTERS[0]);
            }}
          >
            <input
              value={brief}
              onChange={(event) => setBrief(event.target.value)}
              placeholder="A 200-guest gala with a dance floor and two bars…"
              className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-[13px] text-[#f8f4ea] outline-none placeholder:text-[#918b7d]"
              aria-label="Describe the event"
            />
            <Button type="submit" variant="lime" size="sm" className="shrink-0 gap-1.5">
              Draft layout
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </form>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {PROMPT_STARTERS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => {
                  setBrief(prompt);
                  open(prompt);
                }}
                className="rounded-full border border-white/15 px-2.5 py-1 text-[10.5px] text-[#c9c3b5] transition-colors hover:border-[#d9f36b]/60 hover:text-[#f8f4ea]"
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3 text-[10.5px] text-[#8e887a]">
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3 w-3 text-[#d9f36b]" /> Editable plan · seating · venue checks
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="h-3 w-3" /> Drafted in seconds
            </span>
          </div>
        </div>

        <div className="flex flex-col rounded-2xl border border-[#ddd6c8] bg-[#fbf8f1] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="panel-title">Room checks</p>
              <p className="mt-1 text-[11px] text-[#8a8376]">Spatial signals across your designs</p>
            </div>
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#f1ece0]">
              <CircleAlert className="h-4 w-4 text-[#8a5b42]" />
            </span>
          </div>

          <div className="mt-4 flex-1 space-y-2">
            {!ready ? (
              <div className="space-y-2">
                <div className="h-12 animate-pulse rounded-lg bg-[#eee8dc]" />
                <div className="h-12 animate-pulse rounded-lg bg-[#eee8dc]" />
              </div>
            ) : stats.issues.length === 0 ? (
              <div className="rounded-xl border border-[#dce6d2] bg-[#eef4e6] p-4">
                <p className="flex items-center gap-1.5 text-[12px] font-medium text-[#48603a]">
                  <Check className="h-3.5 w-3.5" /> Every room is clear
                </p>
                <p className="mt-1 text-[11px] leading-5 text-[#6f7c61]">
                  No overlaps, blocked exits or capacity gaps in the saved plans.
                </p>
              </div>
            ) : (
              stats.issues.slice(0, 3).map(({ design, warning }) => (
                <Link
                  key={`${design.id}-${warning.message}`}
                  href={`/studio/${design.id}`}
                  className="group flex items-start gap-2.5 rounded-lg border border-[#e7e0d2] bg-[#f8f4ea] px-3 py-2.5 transition-colors hover:border-[#d3c9b7] hover:bg-[#f5efe2]"
                >
                  <span
                    className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                      warning.severity === "high" ? "bg-[#b25439]" : "bg-[#c29a48]"
                    }`}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[11px] font-medium text-[#3d3931]">
                      {design.name}
                    </span>
                    <span className="mt-0.5 block text-[11px] leading-4 text-[#7c7568]">
                      {warning.message}
                    </span>
                  </span>
                  <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#a39b8d] transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))
            )}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-[#e8e2d5] pt-3">
            <span className="text-[10.5px] text-[#8a8376]">
              {stats.issues.length} recommendation{stats.issues.length === 1 ? "" : "s"}
            </span>
            <Link
              href="/dashboard/designs"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-[#3d3931] hover:underline"
            >
              Review all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-9">
        <div className="mb-3.5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="panel-title">In the studio</p>
            <h2 className="mt-1.5 text-[22px] font-medium tracking-[-0.04em]">
              Rooms, recently touched
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Tabs
              variant="pill"
              value={filter}
              onChange={setFilter}
              tabs={[
                { id: "all", label: "All", count: designs.length },
                { id: "mine", label: "Mine" },
                { id: "starred", label: "Starred" },
              ]}
            />
            <Link
              href="/dashboard/designs"
              className="hidden items-center gap-1 text-[11px] font-medium text-[#5d574c] hover:text-[#111] sm:inline-flex"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {!ready ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="h-80 animate-pulse rounded-xl border border-[#e1dacd] bg-[#eee8dc]"
              />
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#d3cbbb] bg-[#f8f4ea] p-10 text-center">
            <p className="text-sm font-medium">No designs here yet</p>
            <p className="mx-auto mt-1 max-w-sm text-[12px] leading-5 text-[#7c7568]">
              Start with a brief or a blank room and Hallcraft will keep the measurements.
            </p>
            <Button size="sm" className="mt-4" onClick={() => open()}>
              Start a design
            </Button>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {recent.map((design) => (
              <DesignCard key={design.id} design={design} />
            ))}
          </div>
        )}
      </section>

      <section className="mt-8 grid gap-3 lg:grid-cols-[1.1fr_1.4fr]">
        <div className="rounded-2xl border border-[#ddd6c8] bg-[#f8f4ea] p-5">
          <div className="flex items-center justify-between">
            <p className="panel-title">Studio pulse</p>
            <CalendarDays className="h-4 w-4 text-[#978f81]" />
          </div>
          <ul className="mt-3 space-y-3">
            {[...designs]
              .sort((a, b) => b.updatedAt - a.updatedAt)
              .slice(0, 5)
              .map((design) => (
                <li key={design.id}>
                  <Link
                    href={`/studio/${design.id}`}
                    className="group flex items-start gap-2.5 text-[11.5px]"
                  >
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#b5ac9c] group-hover:bg-[#171510]" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-[#343027]">
                        {design.name}
                      </span>
                      <span className="text-[#8a8376]">
                        Edited {formatRelativeTime(design.updatedAt)} · {design.status}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-[#ddd6c8] bg-[#fbf8f1] p-5">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="panel-title">The people in the room</p>
              <p className="mt-1 text-[11px] text-[#8a8376]">
                One plan, every department reading the same drawing.
              </p>
            </div>
            <Link href="/dashboard/team">
              <Button variant="outline" size="xs" className="gap-1">
                <Users className="h-3 w-3" /> Team
              </Button>
            </Link>
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {TEAM_COLLABORATORS.map((person) => (
              <div
                key={person.id}
                className="flex items-center gap-2.5 rounded-lg border border-[#e7e0d2] bg-[#f8f4ea] px-3 py-2"
              >
                <span
                  className="grid h-7 w-7 place-items-center rounded-full text-[9px] font-semibold text-white"
                  style={{ backgroundColor: person.color }}
                >
                  {person.initials}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[11.5px] font-medium">{person.name}</span>
                  <span className="block truncate text-[10px] text-[#8a8376]">{person.role}</span>
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#7d9a68]" title="Active" />
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-[#e8e2d5] pt-3">
            <Badge tone="neutral">Brief</Badge>
            <ArrowRight className="h-3 w-3 text-[#b0a897]" />
            <Badge tone="lilac">Floor plan</Badge>
            <ArrowRight className="h-3 w-3 text-[#b0a897]" />
            <Badge tone="lime">Production</Badge>
            <span className="ml-auto text-[10px] text-[#8a8376]">Shared in real time</span>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="panel-title">Jump-off points</p>
            <h2 className="mt-1.5 text-[20px] font-medium tracking-[-0.04em]">
              Start from a shape that already works
            </h2>
          </div>
          <Link
            href="/dashboard/templates"
            className="inline-flex items-center gap-1 text-[11px] font-medium text-[#5d574c] hover:text-[#111]"
          >
            All templates <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {EVENT_TYPES.slice(0, 4).map((type, index) => (
            <button
              key={type}
              type="button"
              onClick={() =>
                open(
                  `A ${type.toLowerCase()} for ${[180, 120, 200, 180][index]} guests. Give me a clear stage, balanced table plan and easy arrivals.`,
                )
              }
              className="group flex items-center justify-between rounded-xl border border-[#ddd6c8] bg-[#fbf8f1] px-4 py-3 text-left transition-all hover:-translate-y-0.5 hover:border-[#c5bcaa] hover:shadow-paper"
            >
              <span>
                <span className="block text-[12px] font-medium">{type}</span>
                <span className="mt-0.5 block text-[10.5px] text-[#8a8376]">
                  Draft from a sentence
                </span>
              </span>
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#f0ebdf] transition-colors group-hover:bg-[#111] group-hover:text-[#fbf8f1]">
                <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: string;
  note: string;
  tone: "paper" | "lilac" | "lime";
}) {
  const tones = {
    paper: "bg-[#fbf8f1] border-[#ddd6c8]",
    lilac: "bg-[#e7dcfa] border-[#d6c8ef]",
    lime: "bg-[#e8f5a9] border-[#d9e992]",
  } as const;
  return (
    <div className={`rounded-xl border p-4 ${tones[tone]}`}>
      <p className="text-[10px] font-medium uppercase tracking-[0.13em] text-[#756e61]">{label}</p>
      <p className="mt-2 text-[clamp(1.6rem,3vw,2.2rem)] font-medium leading-none tracking-[-0.05em]">
        {value}
      </p>
      <p className="mt-2 text-[10.5px] text-[#7c7568]">{note}</p>
    </div>
  );
}
