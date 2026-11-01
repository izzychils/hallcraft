"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Grid2X2, Plus, Search, Sofa } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Tabs } from "@/components/ui/primitives";
import { toast } from "@/components/ui/toast";
import { createDesign } from "@/features/designs/library";
import { CATEGORIES, FLOORPLAN_DEFINITIONS, PALETTE } from "@/features/floorplan/constants";
import { DefinitionIcon } from "@/features/floorplan/icons";
import { placeElement, createEmptyScene } from "@/features/floorplan/scene";
import type { FloorPlanCategory, FloorPlanDefinition } from "@/features/floorplan/types";

export default function LibraryPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"All" | FloorPlanCategory>("All");
  const [selected, setSelected] = useState<FloorPlanDefinition | null>(null);
  const [creating, setCreating] = useState(false);

  const grouped = useMemo(() => {
    const search = query.trim().toLowerCase();
    const filtered = FLOORPLAN_DEFINITIONS.filter((definition) => {
      const matchesCategory = category === "All" || definition.category === category;
      const matchesSearch =
        !search ||
        definition.name.toLowerCase().includes(search) ||
        definition.category.toLowerCase().includes(search);
      return matchesCategory && matchesSearch;
    });
    return CATEGORIES.map((name) => ({
      name,
      items: filtered.filter((definition) => definition.category === name),
    })).filter((group) => group.items.length > 0);
  }, [category, query]);

  const count = useMemo(
    () =>
      FLOORPLAN_DEFINITIONS.filter(
        (definition) =>
          (category === "All" || definition.category === category) &&
          (!query.trim() ||
            `${definition.name} ${definition.category}`
              .toLowerCase()
              .includes(query.trim().toLowerCase())),
      ).length,
    [category, query],
  );

  const createWithItem = async () => {
    if (!selected) return;
    setCreating(true);
    const scene = createEmptyScene(`${selected.name} study`, 22, 28);
    scene.venueName = "Venue to confirm";
    scene.eventType = "Corporate";
    scene.guestCount = 0;
    placeElement(scene, selected.id, {
      x: scene.canvas.width / 2,
      y: scene.canvas.height / 2,
    });
    const design = createDesign({
      name: `${selected.name} study`,
      eventType: "Corporate",
      venueName: "Venue to confirm",
      eventDate: new Date().toISOString().slice(0, 10),
      guestCount: 0,
      scene,
    });
    toast.success("Plan started", `${selected.name} is waiting on the canvas.`);
    router.push(`/studio/${design.id}`);
  };

  return (
    <div className="mx-auto w-full max-w-[1280px] px-5 pb-16 pt-8 lg:px-9 lg:pt-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Item library</p>
          <h1 className="mt-3 text-[clamp(2rem,4vw,3.2rem)] font-medium leading-[0.96] tracking-[-0.055em]">
            The room&apos;s
            <br />
            <span className="inline-block rotate-[1deg] rounded-md bg-[#d9f36b] px-3 pb-1">
              building blocks.
            </span>
          </h1>
          <p className="mt-3 max-w-lg text-[13.5px] leading-6 text-[#6f695e]">
            Every item carries a real footprint, an optional seating capacity and a consistent
            drawing style. Place it now, or save it in your own design.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-[#ddd6c8] bg-[#fbf8f1] px-3 py-2 text-[11px] text-[#7c7568]">
          <Grid2X2 className="h-3.5 w-3.5" />
          {FLOORPLAN_DEFINITIONS.length} measured items
        </div>
      </header>

      <div className="mt-7 flex flex-col gap-3 rounded-xl border border-[#ddd6c8] bg-[#fbf8f1] p-2.5 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9a9488]" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tables, lighting, zones…"
            className="h-8 border-transparent bg-transparent pl-8 shadow-none focus:border-[#d7d1c4] focus:bg-[#fffdf8] focus:ring-0"
            aria-label="Search the item library"
          />
        </div>
        <span className="hidden text-[10.5px] text-[#9a9488] lg:inline">{count} items shown</span>
      </div>

      <Tabs
        className="mt-4 flex-wrap"
        variant="pill"
        value={category}
        onChange={setCategory}
        tabs={[
          { id: "All" as const, label: "All", count: FLOORPLAN_DEFINITIONS.length },
          ...CATEGORIES.map((name) => ({
            id: name,
            label: name,
            count: FLOORPLAN_DEFINITIONS.filter((item) => item.category === name).length,
          })),
        ]}
      />

      <div className="mt-6 space-y-8">
        {grouped.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#d3cbbb] bg-[#f8f4ea] px-6 py-16 text-center">
            <Sofa className="mx-auto h-6 w-6 text-[#a09889]" />
            <p className="mt-3 text-sm font-medium">No items match that search</p>
            <p className="mt-1 text-[12px] text-[#7c7568]">
              Try a broader word, or browse another category.
            </p>
          </div>
        ) : (
          grouped.map((group) => (
            <section key={group.name}>
              <div className="mb-2.5 flex items-center justify-between">
                <h2 className="text-[13px] font-semibold tracking-[-0.01em]">
                  {group.name}
                  <span className="ml-2 text-[10px] font-normal text-[#9a9488]">
                    {group.items.length}
                  </span>
                </h2>
                <span className="text-[10px] uppercase tracking-[0.12em] text-[#a49c8e]">
                  Footprint · metres
                </span>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {group.items.map((definition) => (
                  <button
                    key={definition.id}
                    type="button"
                    onClick={() => setSelected(definition)}
                    className="group flex items-center gap-3 rounded-lg border border-[#e1dacd] bg-[#fbf8f1] p-3 text-left transition-all hover:-translate-y-0.5 hover:border-[#c6bca9] hover:shadow-paper"
                  >
                    <span
                      className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-[#e3dccd]"
                      style={{ backgroundColor: definition.defaultStyle.fill }}
                    >
                      <DefinitionIcon
                        name={definition.icon}
                        className="h-4 w-4 text-[#4d473c]"
                      />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] font-medium">
                        {definition.name}
                      </span>
                      <span className="mt-0.5 block text-[10.5px] text-[#8a8376]">
                        {definition.defaultWidth} × {definition.defaultHeight} m
                        {definition.traits.seats
                          ? ` · seats ${definition.traits.seats.default}`
                          : ""}
                      </span>
                    </span>
                    <Plus className="h-3.5 w-3.5 shrink-0 text-[#b3ab9c] transition-colors group-hover:text-[#171510]" />
                  </button>
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        title={selected?.name ?? "Item"}
        description={selected ? `${selected.category} · drawn at ${selected.defaultWidth} × ${selected.defaultHeight} m` : undefined}
        size="md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setSelected(null)}>
              Close
            </Button>
            <Button size="sm" onClick={() => void createWithItem()} disabled={creating} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              {creating ? "Starting…" : "Start a plan with this"}
            </Button>
          </>
        }
      >
        {selected ? (
          <div className="space-y-4">
            <div
              className="grid h-44 place-items-center rounded-xl border border-[#ded7c8]"
              style={{ backgroundColor: selected.defaultStyle.fill }}
            >
              <div className="text-center">
                <DefinitionIcon
                  name={selected.icon}
                  className="mx-auto h-10 w-10 text-[#4d473c]"
                />
                <p className="mt-2 text-[10px] uppercase tracking-[0.16em] text-[#5e574b]">
                  Default drawing
                </p>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-2 text-[11.5px]">
              <Spec label="Footprint" value={`${selected.defaultWidth} × ${selected.defaultHeight} m`} />
              <Spec label="Shape" value={selected.shape} />
              <Spec
                label="Seating"
                value={
                  selected.traits.seats
                    ? `${selected.traits.seats.min}–${selected.traits.seats.max} seats`
                    : "No fixed seats"
                }
              />
              <Spec
                label="Behaviour"
                value={
                  selected.traits.zone
                    ? "Zone / underlay"
                    : selected.traits.marker
                      ? "Team marker"
                      : selected.traits.container
                        ? "Container"
                        : "Free-standing"
                }
              />
            </dl>
            <p className="rounded-lg border border-[#e4ddce] bg-[#f7f2e7] px-3 py-2.5 text-[11px] leading-5 text-[#756e61]">
              Items can be resized, rotated and recoloured after placement. Round tables add
              chairs automatically when their seat count changes.
            </p>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[#e4ddce] bg-[#f8f4ea] px-3 py-2">
      <dt className="text-[9.5px] uppercase tracking-[0.12em] text-[#9a9488]">{label}</dt>
      <dd className="mt-1 capitalize text-[#2b2822]">{value}</dd>
    </div>
  );
}
