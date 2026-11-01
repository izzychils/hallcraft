"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  Loader2,
  Sparkles,
  TriangleAlert,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { Badge, Field } from "@/components/ui/primitives";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { DESIGN_STYLES, EVENT_TYPES } from "../constants";
import { getSceneStats, getSceneWarnings } from "../geometry";
import { generateVariations } from "../generator";
import { FloorPlanPreview } from "../render";
import { useFloorPlanStore } from "../store";
import type { LayoutVariation } from "../types";

const STEPS = [
  "Reading the brief",
  "Mapping circulation and exits",
  "Balancing table capacity",
  "Testing sightlines and spacing",
];

type Stage = "brief" | "thinking" | "results";

export function AiDesignDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const scene = useFloorPlanStore((state) => state.scene);
  const applyScene = useFloorPlanStore((state) => state.applyScene);
  const [stage, setStage] = useState<Stage>("brief");
  const [brief, setBrief] = useState("");
  const [eventType, setEventType] = useState(scene.eventType ?? "Corporate");
  const [guests, setGuests] = useState(scene.guestCount ?? 180);
  const [width, setWidth] = useState(scene.canvas.width);
  const [height, setHeight] = useState(scene.canvas.height);
  const [style, setStyle] = useState<string>("Modern minimal");
  const [stepIndex, setStepIndex] = useState(0);
  const [variations, setVariations] = useState<LayoutVariation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const cancelled = useRef(false);

  useEffect(() => {
    if (!open) {
      cancelled.current = false;
      return;
    }
    setStage("brief");
    setEventType(scene.eventType ?? "Corporate");
    setGuests(scene.guestCount ?? 180);
    setWidth(scene.canvas.width);
    setHeight(scene.canvas.height);
    setBrief("");
    setVariations([]);
    setSelectedId(null);
  }, [open, scene.canvas.height, scene.canvas.width, scene.eventType, scene.guestCount]);

  useEffect(
    () => () => {
      cancelled.current = true;
    },
    [],
  );

  const generate = async () => {
    if (brief.trim().length < 12) {
      toast.error("A little more detail", "Describe the occasion, the feel and how people arrive.");
      return;
    }
    setStage("thinking");
    setStepIndex(0);
    cancelled.current = false;
    for (let index = 0; index < STEPS.length; index += 1) {
      await new Promise((resolve) => setTimeout(resolve, 420 + index * 90));
      if (cancelled.current) return;
      setStepIndex(index + 1);
    }
    const result = generateVariations({
      brief,
      eventType,
      guests: Math.max(0, Math.round(guests)),
      width: Math.min(70, Math.max(8, width)),
      height: Math.min(70, Math.max(8, height)),
      style,
    });
    if (cancelled.current) return;
    setVariations(result);
    setSelectedId(result[0]?.id ?? null);
    setStage("results");
  };

  const apply = (variation: LayoutVariation) => {
    const next = {
      ...variation.scene,
      name: scene.name,
      venueName: scene.venueName,
      eventType,
      guestCount: Math.round(guests),
    };
    applyScene(next);
    toast.success(`${variation.name} layout applied`, "Every object is editable. Undo restores the previous plan.");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title={
        stage === "results" ? (
          <span className="flex items-center gap-2">
            <ArrowLeft
              className="h-4 w-4 cursor-pointer text-[#7c7568] hover:text-[#171510]"
              onClick={() => setStage("brief")}
            />
            Three ways to hold the room
          </span>
        ) : (
          "Draft a room with Hallcraft"
        )
      }
      description={
        stage === "results"
          ? "A starting point, not a verdict. Review capacity, circulation and sightlines before you commit."
          : "Describe the occasion and the room. The planner turns it into a measured, editable layout."
      }
      footer={
        stage === "brief" ? (
          <>
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" className="gap-1.5" onClick={() => void generate()}>
              <Sparkles className="h-3.5 w-3.5" />
              Draft three variations
            </Button>
          </>
        ) : stage === "results" ? (
          <>
            <Button variant="outline" size="sm" onClick={() => setStage("brief")}>
              Refine the brief
            </Button>
            <Button
              size="sm"
              className="gap-1.5"
              disabled={!selectedId}
              onClick={() => {
                const variation = variations.find((item) => item.id === selectedId);
                if (variation) apply(variation);
              }}
            >
              <Wand2 className="h-3.5 w-3.5" />
              Use this layout
            </Button>
          </>
        ) : null
      }
      bodyClassName={stage === "results" ? "bg-[#f4efe4]" : undefined}
    >
      {stage === "brief" ? (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-baseline justify-between">
              <Label htmlFor="ai-brief">The brief</Label>
              <span className="text-[10px] text-[#9a9488]">{brief.length}/600</span>
            </div>
            <Textarea
              id="ai-brief"
              value={brief}
              onChange={(event) => setBrief(event.target.value.slice(0, 600))}
              placeholder="A 200-guest awards dinner with a central stage, round tables, a VIP corner near the terrace and a separate catering area. Keep the arrival aisle clear."
              className="min-h-[104px] bg-[#fffdf8]"
              autoFocus
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Event type">
              <Select value={eventType} onChange={(event) => setEventType(event.target.value)}>
                {EVENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Design direction">
              <Select value={style} onChange={(event) => setStyle(event.target.value)}>
                {DESIGN_STYLES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Guests">
              <Input
                type="number"
                min={0}
                max={5000}
                value={guests}
                onChange={(event) => setGuests(Number(event.target.value))}
              />
            </Field>
            <Field label="Width" hint="m">
              <Input
                type="number"
                min={8}
                max={70}
                step={0.5}
                value={width}
                onChange={(event) => setWidth(Number(event.target.value))}
              />
            </Field>
            <Field label="Depth" hint="m">
              <Input
                type="number"
                min={8}
                max={70}
                step={0.5}
                value={height}
                onChange={(event) => setHeight(Number(event.target.value))}
              />
            </Field>
          </div>

          <div className="flex items-start gap-2.5 rounded-lg border border-[#e3dccd] bg-[#f6f1e6] px-3 py-2.5">
            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#e0ebba]">
              <Sparkles className="h-3 w-3 text-[#4b5a22]" />
            </span>
            <p className="text-[10.5px] leading-4 text-[#756e61]">
              The planner uses room geometry, furniture footprints, seating rules and circulation
              clearances. Every recommendation must be checked by a planner and the venue.
            </p>
          </div>
        </div>
      ) : stage === "thinking" ? (
        <div className="grid min-h-[320px] place-items-center px-4 py-6">
          <div className="w-full max-w-md">
            <div className="relative mx-auto mb-6 h-32 w-full overflow-hidden rounded-lg border border-[#ddd6c8] bg-[#fbf8f1]">
              <div className="absolute inset-0 grid grid-cols-8 grid-rows-6 opacity-40">
                {Array.from({ length: 48 }).map((_, index) => (
                  <span key={index} className="border-b border-r border-[#e9e2d4]" />
                ))}
              </div>
              <div className="absolute left-1/2 top-3 h-7 w-24 -translate-x-1/2 rounded bg-[#d8cbb7]" />
              <div className="absolute left-1/2 top-[52%] h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#b5aa96] bg-[#f1e9dc]" />
              {Array.from({ length: 14 }).map((_, index) => (
                <span
                  key={index}
                  className="absolute h-4 w-4 rounded-full border border-[#c2b7a4] bg-[#fffdf8]"
                  style={{
                    left: `${16 + (index % 4) * 21}%`,
                    top: `${58 + Math.floor(index / 4) * 12}%`,
                    opacity: 0.5 + (index / 14) * 0.5,
                  }}
                />
              ))}
              <div className="absolute inset-x-0 top-0 h-full animate-[scan_2s_ease-in-out_infinite] bg-gradient-to-b from-transparent via-[#d9f36b]/25 to-transparent" />
            </div>

            <div className="space-y-2">
              {STEPS.map((step, index) => {
                const done = stepIndex > index;
                const active = stepIndex === index;
                return (
                  <div key={step} className="flex items-center gap-2.5">
                    <span
                      className={cn(
                        "grid h-5 w-5 place-items-center rounded-full border",
                        done
                          ? "border-[#9dba6a] bg-[#e8f2d3] text-[#4c6633]"
                          : active
                            ? "border-[#171510] bg-[#171510] text-[#f8f4ea]"
                            : "border-[#d5cdbd] text-transparent",
                      )}
                    >
                      {done ? (
                        <Check className="h-3 w-3" />
                      ) : active ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <span className="h-1 w-1 rounded-full bg-[#cfc7b7]" />
                      )}
                    </span>
                    <span
                      className={cn(
                        "text-[11.5px]",
                        done || active ? "text-[#38342c]" : "text-[#a09889]",
                      )}
                    >
                      {step}
                    </span>
                    {done ? (
                      <span className="ml-auto text-[9.5px] text-[#8a9c6f]">checked</span>
                    ) : null}
                  </div>
                );
              })}
            </div>
            <p className="mt-5 text-center text-[10px] text-[#9a9488]">
              Building three measured alternatives…
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-3">
          {variations.map((variation) => {
            const stats = getSceneStats(variation.scene);
            const warnings = getSceneWarnings(variation.scene);
            const severe = warnings.filter((warning) => warning.severity !== "low");
            const selected = selectedId === variation.id;
            return (
              <button
                key={variation.id}
                type="button"
                onClick={() => setSelectedId(variation.id)}
                className={cn(
                  "flex flex-col overflow-hidden rounded-xl border bg-[#fbf8f1] text-left transition-all",
                  selected
                    ? "border-[#171510] shadow-paper ring-2 ring-[#171510]"
                    : "border-[#ddd6c8] hover:-translate-y-0.5 hover:border-[#bdb3a1]",
                )}
              >
                <div className="relative h-44 overflow-hidden border-b border-[#e4ded0] bg-[#f1ebdf]">
                  <FloorPlanPreview
                    scene={variation.scene}
                    showGrid={false}
                    className="h-full w-full"
                  />
                  <span className="absolute left-2 top-2 rounded-md bg-[#fbf8f1]/95 px-2 py-1 text-[10px] font-medium shadow-sm">
                    Option {variation.name}
                  </span>
                  <span className="absolute right-2 top-2 rounded-full bg-[#111111] px-2 py-1 text-[9.5px] font-medium tabular-nums text-[#f8f4ea]">
                    {variation.score}/100
                  </span>
                  {selected ? (
                    <span className="absolute bottom-2 right-2 grid h-6 w-6 place-items-center rounded-full bg-[#171510] text-[#f8f4ea]">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-1 flex-col p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[12.5px] font-semibold">{variation.name}</p>
                    <Badge tone={severe.length ? "warning" : "success"}>
                      {severe.length ? `${severe.length} checks` : "Clear"}
                    </Badge>
                  </div>
                  <p className="mt-1 flex-1 text-[10.5px] leading-4 text-[#7c7568]">
                    {variation.summary}
                  </p>
                  <div className="mt-2 grid grid-cols-3 gap-1 border-t border-[#e8e2d5] pt-2 text-[9.5px] text-[#8a8376]">
                    <span>
                      <strong className="block text-[12px] font-medium text-[#2f2c25]">
                        {stats.seats}
                      </strong>
                      seats
                    </span>
                    <span>
                      <strong className="block text-[12px] font-medium text-[#2f2c25]">
                        {stats.tables}
                      </strong>
                      tables
                    </span>
                    <span>
                      <strong className="block text-[12px] font-medium text-[#2f2c25]">
                        {variation.scene.guestCount ?? 0}
                      </strong>
                      guests
                    </span>
                  </div>
                  {severe.length ? (
                    <p className="mt-2 flex items-start gap-1 text-[9.5px] leading-4 text-[#9a5b3d]">
                      <TriangleAlert className="mt-0.5 h-3 w-3 shrink-0" />
                      {severe[0].message}
                    </p>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
