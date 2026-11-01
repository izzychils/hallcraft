"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Copy,
  Grid2X2,
  Lock,
  LockOpen,
  Minus,
  Plus,
  Sparkles,
  Trash2,
  TriangleAlert,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { Badge, Separator, Switch, Tabs } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import {
  CANVAS_LIMITS,
  CATEGORIES,
  EVENT_TYPES,
  FLOOR_THEMES,
  GRID_OPTIONS,
} from "../constants";
import {
  describeWarningCount,
  getDensity,
  getSceneStats,
  getSceneWarnings,
} from "../geometry";
import { DefinitionIcon } from "../icons";
import { resolveDefinition } from "../scene";
import { useFloorPlanStore } from "../store";
import type { FloorPlanElement, FloorPlanShape } from "../types";

const FILL_SWATCHES = [
  "#fffdf8",
  "#f3e9da",
  "#e7eee2",
  "#efe6f3",
  "#e4eaf0",
  "#f6e3dd",
  "#e8e4dc",
  "#d9f36b",
  "#d5f0ef",
  "#ffd9c9",
  "#e7dfef",
  "#2f2d29",
];

function NumberField({
  label,
  value,
  min,
  max,
  step = 0.1,
  suffix,
  onCommit,
  disabled,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  onCommit: (value: number) => void;
  disabled?: boolean;
}) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);

  const commit = () => {
    const parsed = Number.parseFloat(draft);
    if (!Number.isFinite(parsed)) {
      setDraft(String(value));
      return;
    }
    const next = Math.min(Math.max(parsed, min ?? -Infinity), max ?? Infinity);
    setDraft(String(next));
    onCommit(next);
  };

  return (
    <div className="space-y-1">
      <span className="text-[10px] font-medium text-[#857f72]">{label}</span>
      <div className="relative">
        <Input
          inputMode="decimal"
          value={draft}
          step={step}
          disabled={disabled}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              event.currentTarget.blur();
            }
          }}
          className={cn("h-7 px-2 text-[11px] tabular-nums", suffix && "pr-6")}
        />
        {suffix ? (
          <span className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-[#9a9488]">
            {suffix}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  placeholder,
  maxLength = 80,
  onCommit,
}: {
  label: string;
  value: string;
  placeholder?: string;
  maxLength?: number;
  onCommit: (value: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  return (
    <div className="space-y-1">
      <span className="text-[10px] font-medium text-[#857f72]">{label}</span>
      <Input
        value={draft}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => onCommit(draft.slice(0, maxLength))}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            event.currentTarget.blur();
          }
        }}
        className="h-7 px-2 text-[11px]"
      />
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  return (
    <div className="space-y-1">
      <span className="text-[10px] font-medium text-[#857f72]">{label}</span>
      <div className="flex items-center gap-1.5">
        <label className="relative h-7 w-8 shrink-0 cursor-pointer overflow-hidden rounded border border-[#d7d1c4]">
          <input
            type="color"
            value={value.startsWith("#") ? value : "#ffffff"}
            onChange={(event) => {
              setDraft(event.target.value);
              onChange(event.target.value);
            }}
            className="h-full w-full cursor-pointer border-0 bg-transparent p-0"
            aria-label={label}
          />
        </label>
        <Input
          value={draft.toUpperCase()}
          maxLength={7}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => {
            if (/^#[0-9a-fA-F]{6}$/.test(draft)) onChange(draft);
            else setDraft(value);
          }}
          className="h-7 font-mono text-[10.5px] uppercase"
        />
      </div>
    </div>
  );
}

export function FloorPlanInspector({
  onOpenAi,
  onOpenTemplates,
}: {
  onOpenAi?: () => void;
  onOpenTemplates?: () => void;
}) {
  const scene = useFloorPlanStore((state) => state.scene);
  const selectedIds = useFloorPlanStore((state) => state.selectedIds);
  const [tab, setTab] = useState<"design" | "checks">("design");
  const warnings = useMemo(() => getSceneWarnings(scene), [scene]);
  const severe = warnings.filter((warning) => warning.severity !== "low").length;

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#f8f4eb]">
      <div className="shrink-0 border-b border-[#e5dfd2] px-3 pt-2.5">
        <Tabs
          value={tab}
          onChange={setTab}
          tabs={[
            { id: "design", label: selectedIds.length ? "Item" : "Venue" },
            {
              id: "checks",
              label: "Checks",
              count: warnings.length,
            },
          ]}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto editor-scroll">
        {tab === "design" ? (
          selectedIds.length > 1 ? (
            <MultiSelection count={selectedIds.length} />
          ) : selectedIds.length === 1 ? (
            <ElementInspector />
          ) : (
            <VenueInspector onOpenAi={onOpenAi} onOpenTemplates={onOpenTemplates} />
          )
        ) : (
          <ChecksPanel warnings={warnings} severe={severe} />
        )}
      </div>
    </div>
  );
}

function VenueInspector({
  onOpenAi,
  onOpenTemplates,
}: {
  onOpenAi?: () => void;
  onOpenTemplates?: () => void;
}) {
  const scene = useFloorPlanStore((state) => state.scene);
  const setCanvasSettings = useFloorPlanStore((state) => state.setCanvasSettings);
  const updateSceneMeta = useFloorPlanStore((state) => state.updateSceneMeta);
  const autoArrange = useFloorPlanStore((state) => state.autoArrange);
  const snapEnabled = useFloorPlanStore((state) => state.snapEnabled);
  const setSnapEnabled = useFloorPlanStore((state) => state.setSnapEnabled);
  const stats = getSceneStats(scene);
  const density = getDensity(scene);

  return (
    <div className="space-y-4 p-3">
      <section>
        <div className="flex items-center justify-between">
          <p className="panel-title">Venue</p>
          <Badge tone="neutral">{scene.eventType}</Badge>
        </div>
        <div className="mt-2 space-y-2">
          <TextField
            label="Venue name"
            value={scene.venueName ?? ""}
            placeholder="The Foundry"
            onCommit={(value) => updateSceneMeta({ venueName: value })}
          />
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <span className="text-[10px] font-medium text-[#857f72]">Event type</span>
              <Select
                value={scene.eventType ?? "Corporate"}
                onChange={(event) => updateSceneMeta({ eventType: event.target.value })}
                className="h-7 text-[11px]"
              >
                {EVENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </div>
            <NumberField
              label="Guests"
              value={scene.guestCount ?? 0}
              min={0}
              max={5000}
              step={1}
              onCommit={(value) => updateSceneMeta({ guestCount: Math.round(value) })}
            />
          </div>
        </div>
      </section>

      <Separator />

      <section>
        <p className="panel-title">Room dimensions</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <NumberField
            label="Width"
            value={scene.canvas.width}
            suffix="m"
            min={CANVAS_LIMITS.minWidth}
            max={CANVAS_LIMITS.maxWidth}
            onCommit={(value) => setCanvasSettings({ width: value })}
          />
          <NumberField
            label="Depth"
            value={scene.canvas.height}
            suffix="m"
            min={CANVAS_LIMITS.minHeight}
            max={CANVAS_LIMITS.maxHeight}
            onCommit={(value) => setCanvasSettings({ height: value })}
          />
        </div>
        <div className="mt-2 flex items-center justify-between rounded-md border border-[#e4ddce] bg-[#fbf8f1] px-2.5 py-1.5 text-[10.5px] text-[#7c7568]">
          <span>
            {density.area} m² · {density.perGuest ? `${density.perGuest.toFixed(1)} m²/guest` : "no guest count"}
          </span>
          <span className="tabular-nums">
            {stats.tables} table{stats.tables === 1 ? "" : "s"}
          </span>
        </div>
      </section>

      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="panel-title">Drawing grid</p>
          <div className="flex items-center gap-1.5">
            <span className="text-[9.5px] text-[#918a7c]">Snap</span>
            <Switch checked={snapEnabled} onCheckedChange={setSnapEnabled} label="Snap to grid" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <span className="text-[10px] font-medium text-[#857f72]">Grid step</span>
            <Select
              value={String(scene.canvas.grid)}
              onChange={(event) => setCanvasSettings({ grid: Number(event.target.value) })}
              className="h-7 text-[11px]"
            >
              {GRID_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option} m
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-medium text-[#857f72]">Floor finish</span>
            <div className="flex h-7 items-center gap-1 rounded border border-[#d7d1c4] bg-[#fbf8f1] px-1.5">
              {FLOOR_THEMES.slice(0, 5).map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  title={theme.name}
                  onClick={() =>
                    setCanvasSettings({ background: { color: theme.color } })
                  }
                  className={cn(
                    "h-4 w-4 rounded-full border transition-transform hover:scale-110",
                    scene.canvas.background.color === theme.color
                      ? "border-[#171510] ring-1 ring-[#171510]"
                      : "border-[#cfc7b7]",
                  )}
                  style={{ backgroundColor: theme.color }}
                />
              ))}
              <label className="relative ml-auto h-4 w-4 cursor-pointer overflow-hidden rounded-full border border-[#cfc7b7]">
                <input
                  type="color"
                  value={scene.canvas.background.color}
                  onChange={(event) =>
                    setCanvasSettings({ background: { color: event.target.value } })
                  }
                  className="h-full w-full cursor-pointer border-0 p-0"
                  aria-label="Custom floor colour"
                />
              </label>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      <section className="space-y-2">
        <p className="panel-title">Room capacity</p>
        <div className="rounded-lg border border-[#e3dccd] bg-[#fbf8f1] p-2.5">
          <div className="flex items-end justify-between">
            <span className="text-[21px] font-medium leading-none tracking-[-0.04em]">
              {stats.seats}
            </span>
            <span className="text-[10px] text-[#8a8376]">
              seats · {scene.guestCount ?? 0} guests
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#ece6da]">
            <div
              className="h-full rounded-full bg-[#9ab75d]"
              style={{
                width: `${Math.min(
                  100,
                  stats.seats > 0 ? ((scene.guestCount ?? 0) / stats.seats) * 100 : 0,
                )}%`,
              }}
            />
          </div>
          <p className="mt-1.5 text-[10px] leading-4 text-[#918a7c]">
            {(scene.guestCount ?? 0) > stats.seats
              ? `${(scene.guestCount ?? 0) - stats.seats} guests are currently without a seat.`
              : "Seating covers the planned guest count."}
          </p>
        </div>
      </section>

      <div className="grid gap-1.5">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-1.5 bg-[#fbf8f1] text-[11px]"
          onClick={autoArrange}
          disabled={stats.tables === 0}
        >
          <Grid2X2 className="h-3.5 w-3.5" />
          Auto-arrange tables
        </Button>
        <Button
          size="sm"
          className="w-full justify-start gap-1.5 text-[11px]"
          onClick={onOpenAi}
        >
          <Wand2 className="h-3.5 w-3.5" />
          Generate new variations
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-1.5 text-[11px]"
          onClick={onOpenTemplates}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Swap in a template
        </Button>
      </div>
    </div>
  );
}

function ElementInspector() {
  const scene = useFloorPlanStore((state) => state.scene);
  const selectedIds = useFloorPlanStore((state) => state.selectedIds);
  const updateElement = useFloorPlanStore((state) => state.updateElement);
  const duplicateSelection = useFloorPlanStore((state) => state.duplicateSelection);
  const removeSelection = useFloorPlanStore((state) => state.removeSelection);
  const toggleLock = useFloorPlanStore((state) => state.toggleLock);
  const reorderSelection = useFloorPlanStore((state) => state.reorderSelection);
  const setElementShape = useFloorPlanStore((state) => state.setElementShape);

  const element = selectedIds.length === 1 ? scene.elements[selectedIds[0]] : null;
  const definition = element
    ? resolveDefinition(scene.definitions, element.definitionId)
    : null;
  const live = useFloorPlanStore((state) => state.liveTransform);
  if (!element || !definition) return null;

  const display =
    live?.id === element.id
      ? { ...element, ...live }
      : element;
  const tableTrait = definition.traits.seats;
  const seats = Number(display.props.seats ?? tableTrait?.default ?? 0);
  const canSeat = Boolean(tableTrait && tableTrait.layout !== "single");
  const shape = display.shape ?? definition.shape;
  const rotatable = definition.traits.rotatable !== false;
  const resizable = definition.traits.resizable !== false;

  const setSeats = (next: number) => {
    if (!tableTrait) return;
    updateElement(element.id, {
      props: { seats: Math.min(tableTrait.max, Math.max(tableTrait.min, next)) },
    });
  };

  return (
    <div className="space-y-3.5 p-3">
      <div className="flex items-start gap-2.5">
        <span
          className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-[#ded7c8]"
          style={{ backgroundColor: element.style.fill }}
        >
          <DefinitionIcon name={definition.icon} className="h-4 w-4 text-[#443f36]" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12.5px] font-semibold">{element.label.text || definition.name}</p>
          <p className="mt-0.5 text-[10px] text-[#8a8376]">
            {definition.name} · {definition.category}
          </p>
        </div>
        <button
          type="button"
          onClick={() => toggleLock(element.id)}
          className="grid h-7 w-7 place-items-center rounded-md text-[#8a8376] transition-colors hover:bg-[#ece6da] hover:text-[#171510]"
          aria-label={element.locked ? "Unlock item" : "Lock item"}
          title={element.locked ? "Unlock item" : "Lock item"}
        >
          {element.locked ? <Lock className="h-3.5 w-3.5" /> : <LockOpen className="h-3.5 w-3.5" />}
        </button>
      </div>

      {element.locked ? (
        <p className="rounded-md border border-[#e4ddce] bg-[#f1ece1] px-2.5 py-1.5 text-[10px] text-[#7c7568]">
          This item is locked. Unlock it to move, resize or edit its style.
        </p>
      ) : null}

      <div className="space-y-2">
        <TextField
          label="Label"
          value={element.label.text}
          placeholder={definition.name}
          maxLength={60}
          onCommit={(value) => updateElement(element.id, { label: { text: value, visible: true } })}
        />
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium text-[#857f72]">Show label</span>
          <Switch
            checked={element.label.visible}
            onCheckedChange={(checked) => updateElement(element.id, { label: { visible: checked } })}
            label="Show label"
          />
        </div>
        {element.label.visible ? (
          <div className="grid grid-cols-2 gap-2">
            <NumberField
              label="Label size"
              value={element.label.size}
              min={0.1}
              max={1.5}
              suffix="m"
              onCommit={(value) => updateElement(element.id, { label: { size: value } })}
            />
            <NumberField
              label="Label angle"
              value={element.label.rotation}
              min={-180}
              max={180}
              step={5}
              suffix="°"
              onCommit={(value) => updateElement(element.id, { label: { rotation: value } })}
            />
          </div>
        ) : null}
      </div>

      {canSeat && tableTrait ? (
        <div className="rounded-lg border border-[#e3dccd] bg-[#fbf8f1] p-2.5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-medium text-[#6f695e]">Seats at this table</p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSeats(seats - 1)}
                disabled={seats <= tableTrait.min}
                className="grid h-5 w-5 place-items-center rounded border border-[#d8d1c3] text-[#6f695e] hover:bg-[#ece6da] disabled:opacity-35"
                aria-label="Remove one seat"
              >
                <Minus className="h-2.5 w-2.5" />
              </button>
              <span className="w-6 text-center text-[12px] font-medium tabular-nums">{seats}</span>
              <button
                type="button"
                onClick={() => setSeats(seats + 1)}
                disabled={seats >= tableTrait.max}
                className="grid h-5 w-5 place-items-center rounded border border-[#d8d1c3] text-[#6f695e] hover:bg-[#ece6da] disabled:opacity-35"
                aria-label="Add one seat"
              >
                <Plus className="h-2.5 w-2.5" />
              </button>
            </div>
          </div>
          <input
            type="range"
            min={tableTrait.min}
            max={tableTrait.max}
            step={1}
            value={seats}
            onChange={(event) => setSeats(Number(event.target.value))}
            className="mt-2 h-1 w-full cursor-pointer appearance-none rounded-full bg-[#e6e0d3] accent-[#171510]"
            aria-label="Seat count"
          />
        </div>
      ) : null}

      <Separator />

      <section>
        <p className="panel-title">Placement</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <NumberField
            label="X"
            value={display.x}
            suffix="m"
            onCommit={(value) => updateElement(element.id, { x: value })}
          />
          <NumberField
            label="Y"
            value={display.y}
            suffix="m"
            onCommit={(value) => updateElement(element.id, { y: value })}
          />
          <NumberField
            label="Width"
            value={display.width}
            suffix="m"
            min={0.3}
            disabled={!resizable}
            onCommit={(value) => updateElement(element.id, { width: value })}
          />
          <NumberField
            label="Depth"
            value={display.height}
            suffix="m"
            min={0.3}
            disabled={!resizable}
            onCommit={(value) => updateElement(element.id, { height: value })}
          />
          <NumberField
            label="Rotation"
            value={display.rotation}
            suffix="°"
            step={5}
            min={0}
            max={359}
            disabled={!rotatable}
            onCommit={(value) => updateElement(element.id, { rotation: value })}
          />
          <div className="space-y-1">
            <span className="text-[10px] font-medium text-[#857f72]">Shape</span>
            <Select
              value={shape}
              onChange={(event) =>
                setElementShape(element.id, event.target.value as FloorPlanShape)
              }
              className="h-7 text-[11px]"
              disabled={definition.traits.seats?.layout === "ring"}
            >
              <option value="rect">Rectangle</option>
              <option value="circle">Circle</option>
              <option value="triangle">Triangle</option>
            </Select>
          </div>
        </div>
      </section>

      <Separator />

      <section>
        <p className="panel-title">Appearance</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {FILL_SWATCHES.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => updateElement(element.id, { style: { fill: color } })}
              className={cn(
                "h-4 w-4 rounded-full border transition-transform hover:scale-110",
                element.style.fill.toLowerCase() === color.toLowerCase()
                  ? "border-[#171510] ring-1 ring-[#171510]"
                  : "border-[#cfc7b7]",
              )}
              style={{ backgroundColor: color }}
              aria-label={`Set fill ${color}`}
            />
          ))}
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <ColorField
            label="Fill"
            value={element.style.fill}
            onChange={(value) => updateElement(element.id, { style: { fill: value } })}
          />
          <ColorField
            label="Outline"
            value={element.style.stroke}
            onChange={(value) => updateElement(element.id, { style: { stroke: value } })}
          />
        </div>
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-[#857f72]">Opacity</span>
            <span className="text-[9.5px] tabular-nums text-[#9a9488]">
              {Math.round(element.style.opacity * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={0.15}
            max={1}
            step={0.05}
            value={element.style.opacity}
            onChange={(event) =>
              updateElement(element.id, { style: { opacity: Number(event.target.value) } })
            }
            className="h-1 w-full cursor-pointer appearance-none rounded-full bg-[#e6e0d3] accent-[#171510]"
            aria-label="Item opacity"
          />
        </div>
      </section>

      <Separator />

      <section className="space-y-1.5">
        <div className="grid grid-cols-2 gap-1.5">
          <Button variant="outline" size="xs" className="justify-start gap-1 bg-[#fbf8f1]" onClick={duplicateSelection}>
            <Copy className="h-3 w-3" /> Duplicate
          </Button>
          <Button
            variant="outline"
            size="xs"
            className="justify-start gap-1 bg-[#fbf8f1]"
            onClick={() => reorderSelection("forward")}
          >
            <ArrowUp className="h-3 w-3" /> Bring up
          </Button>
          <Button
            variant="outline"
            size="xs"
            className="justify-start gap-1 bg-[#fbf8f1]"
            onClick={() => reorderSelection("backward")}
          >
            <ArrowDown className="h-3 w-3" /> Send back
          </Button>
          <Button
            variant="outline"
            size="xs"
            className="justify-start gap-1 bg-[#fbf8f1] text-[#a53b28]"
            onClick={removeSelection}
          >
            <Trash2 className="h-3 w-3" /> Delete
          </Button>
        </div>
        <p className="px-0.5 text-[9.5px] leading-4 text-[#a09889]">
          {definition.defaultWidth} × {definition.defaultHeight} m default ·{" "}
          {(display.width * display.height).toFixed(1)} m² footprint
        </p>
      </section>
    </div>
  );
}

function MultiSelection({ count }: { count: number }) {
  const duplicateSelection = useFloorPlanStore((state) => state.duplicateSelection);
  const removeSelection = useFloorPlanStore((state) => state.removeSelection);
  const nudgeSelection = useFloorPlanStore((state) => state.nudgeSelection);

  return (
    <div className="space-y-4 p-3">
      <div>
        <p className="text-[13px] font-semibold">{count} items selected</p>
        <p className="mt-1 text-[10.5px] leading-4 text-[#7c7568]">
          Drag any selected item to move them together, or nudge with the arrow keys.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <Button variant="outline" size="xs" className="justify-start gap-1 bg-[#fbf8f1]" onClick={duplicateSelection}>
          <Copy className="h-3 w-3" /> Duplicate
        </Button>
        <Button variant="outline" size="xs" className="justify-start gap-1 bg-[#fbf8f1] text-[#a53b28]" onClick={removeSelection}>
          <Trash2 className="h-3 w-3" /> Delete
        </Button>
      </div>
      <Separator />
      <div>
        <p className="panel-title">Nudge 0.5 m</p>
        <div className="mt-2 grid grid-cols-4 gap-1">
          {[
            { label: "←", dx: -0.5, dy: 0 },
            { label: "↑", dx: 0, dy: -0.5 },
            { label: "↓", dx: 0, dy: 0.5 },
            { label: "→", dx: 0.5, dy: 0 },
          ].map((item) => (
            <Button
              key={item.label}
              variant="outline"
              size="xs"
              className="bg-[#fbf8f1]"
              onClick={() => nudgeSelection(item.dx, item.dy)}
              aria-label={`Nudge ${item.label}`}
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChecksPanel({
  warnings,
  severe,
}: {
  warnings: ReturnType<typeof getSceneWarnings>;
  severe: number;
}) {
  const scene = useFloorPlanStore((state) => state.scene);
  const select = useFloorPlanStore((state) => state.select);
  const setTab = useFloorPlanStore((state) => state.setTool);
  const stats = getSceneStats(scene);

  return (
    <div className="space-y-3 p-3">
      <div
        className={cn(
          "rounded-lg border p-3",
          severe > 0
            ? "border-[#ecccc2] bg-[#faeee9]"
            : "border-[#dce6d2] bg-[#eef4e6]",
        )}
      >
        <div className="flex items-start gap-2">
          <span
            className={cn(
              "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full",
              severe > 0 ? "bg-[#f3d8ce] text-[#a3472c]" : "bg-[#dfeaca] text-[#4d6a38]",
            )}
          >
            {severe > 0 ? (
              <TriangleAlert className="h-3.5 w-3.5" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
          </span>
          <div>
            <p className="text-[11.5px] font-medium">{describeWarningCount(warnings)}</p>
            <p className="mt-0.5 text-[10px] leading-4 text-[#7c7568]">
              Planning recommendations, not a compliance certificate. Verify exits and spacing
              with the venue.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        <MiniMetric label="Objects" value={stats.elements} />
        <MiniMetric label="Seats" value={stats.seats} />
        <MiniMetric label="Guests" value={scene.guestCount ?? 0} />
      </div>

      {warnings.length === 0 ? (
        <div className="rounded-lg border border-[#e3dccd] bg-[#fbf8f1] px-3 py-6 text-center">
          <Check className="mx-auto h-5 w-5 text-[#6e8c55]" />
          <p className="mt-2 text-[11.5px] font-medium">No obvious conflicts</p>
          <p className="mt-1 text-[10px] leading-4 text-[#918a7c]">
            Nothing overlaps and every marked entrance has clearance in the saved plan.
          </p>
        </div>
      ) : (
        <ul className="space-y-1.5">
          {warnings.map((warning, index) => (
            <li key={`${warning.kind}-${index}`}>
              <button
                type="button"
                onClick={() => {
                  if (warning.elementIds[0]) {
                    select(warning.elementIds[0]);
                    setTab("select");
                  }
                }}
                className="flex w-full items-start gap-2 rounded-md border border-[#e7e0d2] bg-[#fbf8f1] px-2.5 py-2 text-left transition-colors hover:border-[#d3c9b7]"
              >
                <span
                  className={cn(
                    "mt-1 h-1.5 w-1.5 shrink-0 rounded-full",
                    warning.severity === "high"
                      ? "bg-[#b25439]"
                      : warning.severity === "medium"
                        ? "bg-[#c29a48]"
                        : "bg-[#9a9488]",
                  )}
                />
                <span className="text-[10.5px] leading-4 text-[#4e483d]">{warning.message}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="rounded-lg border border-[#e3dccd] bg-[#fbf8f1] p-2.5">
        <p className="panel-title">Guest flow</p>
        <p className="mt-1.5 text-[10px] leading-4 text-[#7c7568]">
          {stats.seats > 0
            ? `${Math.round(((scene.guestCount ?? 0) / Math.max(1, stats.seats)) * 100)}% of the placed seats are spoken for. Entrances are arranged along the shortest arrival wall.`
            : "This room is currently standing-only. Add tables if the brief requires seated guests."}
        </p>
      </div>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-[#e3dccd] bg-[#fbf8f1] px-2 py-1.5">
      <p className="text-[13px] font-medium leading-none tabular-nums">{value}</p>
      <p className="mt-1 text-[8.5px] uppercase tracking-[0.1em] text-[#9a9488]">{label}</p>
    </div>
  );
}
