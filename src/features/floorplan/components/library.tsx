"use client";

import { useMemo, useState } from "react";
import {
  Layers,
  Plus,
  Search,
  Sparkles,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import {
  CATEGORIES,
  DEFINITION_BY_ID,
  FLOORPLAN_DEFINITIONS,
  PALETTE,
} from "../constants";
import { DefinitionIcon } from "../icons";
import { useFloorPlanStore } from "../store";
import type { FloorPlanCategory, FloorPlanDefinition, FloorPlanShape } from "../types";

const DND_TYPE = "application/x-hallcraft-definition";

export function FloorPlanLibrary({
  onPicked,
  onOpenAi,
  onOpenTemplates,
  className,
}: {
  onPicked?: () => void;
  onOpenAi?: () => void;
  onOpenTemplates?: () => void;
  className?: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"All" | FloorPlanCategory>("All");
  const [customOpen, setCustomOpen] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customCategory, setCustomCategory] = useState<FloorPlanCategory>("Structures");
  const [customShape, setCustomShape] = useState<FloorPlanShape>("rect");
  const [customWidth, setCustomWidth] = useState(2);
  const [customHeight, setCustomHeight] = useState(2);

  const scene = useFloorPlanStore((state) => state.scene);
  const addElement = useFloorPlanStore((state) => state.addElement);

  const items = useMemo(() => {
    // Base items resolve from the shared catalogue; only user-made items live on
    // the scene. Including every stored definition would duplicate catalogue rows.
    const custom = Object.values(scene.definitions).filter(
      (definition) => definition.custom && !DEFINITION_BY_ID[definition.id],
    );
    const all = [...FLOORPLAN_DEFINITIONS, ...custom];
    const search = query.trim().toLowerCase();
    return all.filter((definition) => {
      const matchesSearch =
        !search ||
        definition.name.toLowerCase().includes(search) ||
        definition.category.toLowerCase().includes(search);
      const matchesCategory = category === "All" || definition.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [category, query, scene.definitions]);

  const grouped = useMemo(() => {
    const order = category === "All" ? CATEGORIES : [category];
    return order
      .map((name) => ({
        name,
        items: items.filter((item) => item.category === name),
      }))
      .filter((group) => group.items.length > 0);
  }, [category, items]);

  const add = (definition: FloorPlanDefinition) => {
    addElement(definition.id, undefined, definition.custom ? definition : undefined);
    onPicked?.();
  };

  const createCustom = () => {
    if (!customName.trim()) {
      toast.error("Name the item", "A short name makes it easy to find again.");
      return;
    }
    const width = Math.min(20, Math.max(0.3, Number(customWidth) || 1));
    const height = Math.min(20, Math.max(0.3, Number(customHeight) || 1));
    const definition: FloorPlanDefinition = {
      id: `custom-${Math.random().toString(36).slice(2, 9)}`,
      name: customName.trim(),
      category: customCategory,
      shape: customShape,
      icon: customShape === "circle" ? "Circle" : customShape === "triangle" ? "Triangle" : "Square",
      defaultWidth: width,
      defaultHeight: height,
      defaultLabel: customName.trim().toUpperCase().slice(0, 22),
      labelSize: 0.2,
      traits: customShape === "circle" ? { lockAspect: true } : {},
      defaultStyle: {
        fill: PALETTE.table,
        stroke: PALETTE.ink,
        strokeWidth: 0.05,
        opacity: 1,
      },
      custom: true,
    };
    addElement(definition.id, undefined, definition);
    setCustomOpen(false);
    setCustomName("");
    setCustomWidth(2);
    setCustomHeight(2);
    toast.success("Custom item added", `${definition.name} is yours to reuse in this plan.`);
    onPicked?.();
  };

  return (
    <div className={cn("flex h-full min-h-0 flex-col bg-[#f8f4eb]", className)}>
      <div className="shrink-0 border-b border-[#e5dfd2] px-3 pb-2.5 pt-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#80796c]">
            Add to the plan
          </p>
          <button
            type="button"
            onClick={() => setCustomOpen(true)}
            className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10.5px] font-medium text-[#5d574c] transition-colors hover:bg-[#ece6da] hover:text-[#171510]"
          >
            <Plus className="h-3 w-3" /> Custom
          </button>
        </div>

        <button
          type="button"
          onClick={onOpenAi}
          className="mt-2.5 flex w-full items-center gap-2.5 rounded-lg bg-[#111111] px-3 py-2.5 text-left text-[#f8f4ea] transition-colors hover:bg-[#252420]"
        >
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#d9f36b]">
            <Wand2 className="h-3.5 w-3.5 text-[#2c3315]" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[11.5px] font-medium">Describe the room</span>
            <span className="block truncate text-[10px] text-[#a8a294]">
              Draft a layout from your brief
            </span>
          </span>
          <Sparkles className="h-3.5 w-3.5 shrink-0 text-[#d9f36b]" />
        </button>

        <div className="relative mt-2">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#a09889]" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search items"
            className="h-7 border-[#e0d9cb] bg-[#fbf8f1] pl-7 text-[11.5px]"
            aria-label="Search items"
          />
        </div>

        <div className="mt-2 flex gap-1 overflow-x-auto pb-0.5 no-scrollbar">
          {(["All", ...CATEGORIES] as const).map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setCategory(name)}
              className={cn(
                "shrink-0 rounded-full px-2 py-1 text-[10px] transition-colors",
                category === name
                  ? "bg-[#171510] text-[#f8f4ea]"
                  : "bg-[#ece6da] text-[#726b5f] hover:bg-[#e3dccd]",
              )}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2.5 py-2 editor-scroll">
        {grouped.length === 0 ? (
          <div className="px-2 py-10 text-center">
            <Layers className="mx-auto h-5 w-5 text-[#aaa294]" />
            <p className="mt-2 text-[11.5px] font-medium">No items found</p>
            <p className="mt-0.5 text-[10.5px] leading-4 text-[#918a7c]">
              Try a broader search, or make a custom item.
            </p>
          </div>
        ) : (
          grouped.map((group) => (
            <section key={group.name} className="mb-3">
              <div className="flex items-center justify-between px-1 pb-1.5 pt-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#918a7c]">
                  {group.name}
                </p>
                <span className="text-[9px] text-[#b0a898]">{group.items.length}</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {group.items.map((definition) => (
                  <button
                    key={definition.id}
                    type="button"
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.setData(DND_TYPE, definition.id);
                      event.dataTransfer.effectAllowed = "copy";
                    }}
                    onClick={() => add(definition)}
                    title={`${definition.name} · ${definition.defaultWidth} × ${definition.defaultHeight} m`}
                    className="group flex min-w-0 flex-col items-start gap-1.5 rounded-md border border-[#e2dbcd] bg-[#fbf8f1] p-2 text-left transition-all hover:-translate-y-0.5 hover:border-[#c9c0ae] hover:shadow-sm active:translate-y-0"
                  >
                    <span
                      className="grid h-6 w-6 place-items-center rounded border border-[#e6dfd1]"
                      style={{ backgroundColor: definition.defaultStyle.fill }}
                    >
                      <DefinitionIcon name={definition.icon} className="h-3 w-3 text-[#4d473c]" />
                    </span>
                    <span className="w-full min-w-0">
                      <span className="block truncate text-[10.5px] font-medium leading-4">
                        {definition.name}
                      </span>
                      <span className="mt-0.5 block text-[9px] text-[#9a9488]">
                        {definition.defaultWidth} × {definition.defaultHeight} m
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      <div className="shrink-0 border-t border-[#e5dfd2] p-2.5">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-1.5 bg-[#fbf8f1] text-[11px]"
          onClick={onOpenTemplates}
        >
          <Layers className="h-3.5 w-3.5" />
          Start from a template
        </Button>
        <p className="mt-2 px-1 text-[9.5px] leading-4 text-[#a09889]">
          Drag onto the canvas, or click to drop it in the centre. Everything is measured in
          metres.
        </p>
      </div>

      <Modal
        open={customOpen}
        onClose={() => setCustomOpen(false)}
        title="Make a custom item"
        description="Give it a footprint and it behaves like every other library item."
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setCustomOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={createCustom}>
              Add to plan
            </Button>
          </>
        }
      >
        <div className="space-y-3.5">
          <div className="space-y-1.5">
            <Label htmlFor="custom-name">Item name</Label>
            <Input
              id="custom-name"
              value={customName}
              onChange={(event) => setCustomName(event.target.value)}
              placeholder="Brand arch, cake table, photo wall…"
              maxLength={40}
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="custom-category">Category</Label>
              <Select
                id="custom-category"
                value={customCategory}
                onChange={(event) => setCustomCategory(event.target.value as FloorPlanCategory)}
              >
                {CATEGORIES.filter((name) => name !== "Venue").map((name) => (
                  <option key={name} value={name}>
                    {name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="custom-shape">Shape</Label>
              <Select
                id="custom-shape"
                value={customShape}
                onChange={(event) => setCustomShape(event.target.value as FloorPlanShape)}
              >
                <option value="rect">Rectangle</option>
                <option value="circle">Circle</option>
                <option value="triangle">Triangle</option>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Width (m)</Label>
              <Input
                type="number"
                min={0.3}
                max={20}
                step={0.1}
                value={customWidth}
                onChange={(event) => setCustomWidth(Number(event.target.value))}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Depth (m)</Label>
              <Input
                type="number"
                min={0.3}
                max={20}
                step={0.1}
                value={customHeight}
                onChange={(event) => setCustomHeight(Number(event.target.value))}
              />
            </div>
          </div>
          <p className="rounded-md border border-[#e4ddce] bg-[#f6f1e6] px-2.5 py-2 text-[10.5px] leading-4 text-[#7c7568]">
            Custom items are saved with this plan, so the drawing stays portable.
          </p>
        </div>
      </Modal>
    </div>
  );
}
