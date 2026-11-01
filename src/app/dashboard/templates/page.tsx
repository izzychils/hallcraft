"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, LayoutGrid, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/primitives";
import { toast } from "@/components/ui/toast";
import { createDesign } from "@/features/designs/library";
import { useNewDesign } from "@/features/designs/new-design";
import { FloorPlanPreview } from "@/features/floorplan/render";
import { FLOOR_PLAN_TEMPLATES } from "@/features/floorplan/templates";
import { getSceneStats } from "@/features/floorplan/geometry";

export default function TemplatesPage() {
  const router = useRouter();
  const { open } = useNewDesign();
  const [creating, setCreating] = useState<string | null>(null);

  const templates = useMemo(
    () =>
      FLOOR_PLAN_TEMPLATES.map((template) => ({
        template,
        scene: template.build(),
      })),
    [],
  );

  const useTemplate = async (templateId: string) => {
    const entry = templates.find((item) => item.template.id === templateId);
    if (!entry) return;
    setCreating(templateId);
    await new Promise((resolve) => setTimeout(resolve, 350));
    const scene = entry.template.build();
    scene.name = entry.template.name;
    const design = createDesign({
      name: entry.template.name,
      eventType: entry.template.eventType,
      venueName: "Venue to confirm",
      eventDate: new Date().toISOString().slice(0, 10),
      guestCount: entry.template.guests,
      scene,
    });
    toast.success("Template added", "Adjust the room, then make it yours.");
    router.push(`/studio/${design.id}`);
  };

  return (
    <div className="mx-auto w-full max-w-[1280px] px-5 pb-16 pt-8 lg:px-9 lg:pt-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Templates</p>
          <h1 className="mt-3 text-[clamp(2rem,4vw,3.2rem)] font-medium leading-[0.96] tracking-[-0.055em]">
            A running start,
            <br />
            measured in metres.
          </h1>
          <p className="mt-3 max-w-lg text-[13.5px] leading-6 text-[#6f695e]">
            Every template is a real, editable plan: stage, seating, service points and clear
            arrival routes. Use the shape, then bend it to the venue.
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => open()}>
          <Sparkles className="h-3.5 w-3.5" />
          Draft from a brief instead
        </Button>
      </header>

      <div className="mt-6 flex flex-wrap items-center gap-2 rounded-xl border border-[#ddd6c8] bg-[#fbf8f1] px-4 py-3">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[#e4f0bd]">
          <Sparkles className="h-3.5 w-3.5 text-[#4a5a1d]" />
        </span>
        <p className="min-w-0 flex-1 text-[11.5px] leading-5 text-[#726b5f]">
          <span className="font-medium text-[#2d2a23]">How these work:</span> templates arrive
          pre-furnished with a capacity that fits the room. Moving a table never silently drops a
          seat. The checks will tell you.
        </p>
        <Badge tone="neutral">{templates.length} starting points</Badge>
      </div>

      <section className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {templates.map(({ template, scene }) => {
          const stats = getSceneStats(scene);
          return (
            <article
              key={template.id}
              className="group flex flex-col overflow-hidden rounded-xl border border-[#ddd6c8] bg-[#fbf8f1] transition-all hover:-translate-y-0.5 hover:border-[#c4baa8] hover:shadow-paper"
            >
              <div className="relative h-44 overflow-hidden border-b border-[#e4ded0] bg-[#f1ebdf]">
                <FloorPlanPreview
                  scene={scene}
                  showGrid={false}
                  className="transition-transform duration-500 group-hover:scale-[1.03]"
                  label={`${template.name} template preview`}
                />
                <span className="absolute left-2.5 top-2.5 rounded-md bg-[#fbf8f1]/95 px-2 py-1 text-[10px] font-medium text-[#4e483d] shadow-sm">
                  {template.eventType}
                </span>
                <span className="absolute bottom-2.5 right-2.5 rounded-md bg-[#111111]/85 px-2 py-1 text-[10px] font-medium text-[#f8f4ea] backdrop-blur">
                  {template.guests} guests · {template.width}×{template.height} m
                </span>
              </div>
              <div className="flex flex-1 flex-col p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-[14px] font-semibold tracking-[-0.015em]">{template.name}</h2>
                  <span className="text-[10px] text-[#8a8376]">{stats.seats} seats</span>
                </div>
                <p className="mt-1 flex-1 text-[11.5px] leading-5 text-[#7c7568]">
                  {template.description}
                </p>
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#e8e2d5] pt-3">
                  <span className="text-[10.5px] text-[#8a8376]">
                    {stats.elements} objects · {stats.zones} zones
                  </span>
                  <Button
                    size="xs"
                    className="gap-1"
                    onClick={() => void useTemplate(template.id)}
                    disabled={creating !== null}
                  >
                    {creating === template.id ? "Adding…" : "Use template"}
                    <ArrowUpRight className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </article>
          );
        })}

        <button
          type="button"
          onClick={() => open()}
          className="group flex min-h-[324px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#cfc6b5] bg-[#f8f4ea] p-6 text-center transition-colors hover:border-[#a99e8a] hover:bg-[#f4efe4]"
        >
          <span className="grid h-11 w-11 place-items-center rounded-full bg-[#111111] text-[#f8f4ea] transition-transform group-hover:scale-105">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="text-[14px] font-medium">Nothing quite right?</span>
          <span className="max-w-[220px] text-[11.5px] leading-5 text-[#7c7568]">
            Describe the room and let the planner draft a plan around your guest count.
          </span>
          <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-medium">
            <LayoutGrid className="h-3 w-3" /> Draft with a sentence
          </span>
        </button>
      </section>
    </div>
  );
}
