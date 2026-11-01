"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Sparkles, SquareDashed, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Field } from "@/components/ui/primitives";
import { Modal } from "@/components/ui/modal";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { createDesign } from "@/features/designs/library";
import { buildLayout } from "@/features/floorplan/generator";
import { createEmptyScene } from "@/features/floorplan/scene";
import { EVENT_TYPES, DESIGN_STYLES } from "@/features/floorplan/constants";

type StartMode = "ai" | "blank";

interface NewDesignContextValue {
  open: (initialBrief?: string) => void;
}

const NewDesignContext = createContext<NewDesignContextValue | null>(null);

export function useNewDesign() {
  const context = useContext(NewDesignContext);
  if (!context) throw new Error("useNewDesign must be used inside NewDesignProvider");
  return context;
}

const today = () => new Date().toISOString().slice(0, 10);

export function NewDesignProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<StartMode>("ai");
  const [brief, setBrief] = useState("");
  const [name, setName] = useState("");
  const [eventType, setEventType] = useState<string>("Corporate");
  const [venueName, setVenueName] = useState("");
  const [eventDate, setEventDate] = useState(today());
  const [guests, setGuests] = useState(180);
  const [width, setWidth] = useState(22);
  const [height, setHeight] = useState(28);
  const [style, setStyle] = useState<string>("Modern minimal");
  const [working, setWorking] = useState(false);

  const open = useCallback((initialBrief?: string) => {
    if (initialBrief) {
      setBrief(initialBrief);
      setMode("ai");
    }
    setIsOpen(true);
  }, []);

  const reset = () => {
    setWorking(false);
    setMode("ai");
    setBrief("");
    setName("");
    setVenueName("");
    setEventDate(today());
  };

  const close = () => {
    if (working) return;
    setIsOpen(false);
    reset();
  };

  const create = async () => {
    if (mode === "ai" && brief.trim().length < 12) {
      toast.error("Add a little more detail", "Describe the room, the guests and the feel you want.");
      return;
    }
    setWorking(true);
    const finalName =
      name.trim() ||
      (venueName.trim() ? `${eventType} · ${venueName.trim()}` : `${eventType} layout`);
    const resolvedGuests = Math.max(0, Math.round(guests || 0));
    const resolvedWidth = Math.min(70, Math.max(8, Number(width) || 22));
    const resolvedHeight = Math.min(70, Math.max(8, Number(height) || 28));

    // Let the modal show its own generation state; the plan itself is built
    // from measurable rules, never sent to a third-party model.
    await new Promise((resolve) => setTimeout(resolve, 850));

    const scene =
      mode === "ai"
        ? buildLayout({
            brief,
            eventType,
            guests: resolvedGuests,
            width: resolvedWidth,
            height: resolvedHeight,
            style,
          })
        : createEmptyScene(finalName, resolvedWidth, resolvedHeight);

    scene.name = finalName;
    scene.venueName = venueName.trim();
    scene.eventType = eventType;
    scene.guestCount = resolvedGuests;

    const design = createDesign({
      name: finalName,
      eventType,
      venueName: venueName.trim() || "Venue to confirm",
      eventDate,
      guestCount: resolvedGuests,
      scene,
    });
    toast.success("Design created", "Your floor plan is ready to shape.");
    setIsOpen(false);
    reset();
    router.push(`/studio/${design.id}`);
  };

  const value = useMemo(() => ({ open }), [open]);

  return (
    <NewDesignContext.Provider value={value}>
      {children}
      <Modal
        open={isOpen}
        onClose={close}
        size="lg"
        title="Start a new design"
        description="A room, a guest count and a rough idea are enough to begin."
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={close} disabled={working}>
              Cancel
            </Button>
            <Button size="sm" onClick={() => void create()} disabled={working} className="gap-2">
              {working ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : mode === "ai" ? (
                <Sparkles className="h-3.5 w-3.5" />
              ) : (
                <SquareDashed className="h-3.5 w-3.5" />
              )}
              {working
                ? "Shaping the room…"
                : mode === "ai"
                  ? "Generate layout"
                  : "Create blank plan"}
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-[#ece7db] p-1">
            {(
              [
                { id: "ai", label: "Describe it", hint: "Plan from a brief", icon: Wand2 },
                { id: "blank", label: "Start blank", hint: "Draw it yourself", icon: SquareDashed },
              ] as const
            ).map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => setMode(option.id)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all",
                  mode === option.id
                    ? "bg-[#fffdf8] shadow-[0_1px_3px_rgba(16,16,16,0.12)]"
                    : "hover:bg-[#e6e0d3]",
                )}
              >
                <option.icon
                  className={cn(
                    "h-4 w-4",
                    mode === option.id ? "text-[#171510]" : "text-[#7b7468]",
                  )}
                />
                <span>
                  <span className="block text-[13px] font-medium">{option.label}</span>
                  <span className="block text-[11px] text-[#8a8478]">{option.hint}</span>
                </span>
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Design name" hint="Optional">
              <Input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Aurora Awards 2026"
                maxLength={80}
              />
            </Field>
            <Field label="Event type">
              <Select value={eventType} onChange={(event) => setEventType(event.target.value)}>
                {EVENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Venue">
              <Input
                value={venueName}
                onChange={(event) => setVenueName(event.target.value)}
                placeholder="The Foundry"
                maxLength={80}
              />
            </Field>
            <Field label="Event date">
              <Input
                type="date"
                value={eventDate}
                onChange={(event) => setEventDate(event.target.value)}
              />
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
            <Field label="Room width" hint="metres">
              <Input
                type="number"
                min={8}
                max={70}
                step={0.5}
                value={width}
                onChange={(event) => setWidth(Number(event.target.value))}
              />
            </Field>
            <Field label="Room depth" hint="metres">
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

          {mode === "ai" ? (
            <>
              <Field label="The brief" hint={`${brief.length}/600`}>
                <Textarea
                  value={brief}
                  onChange={(event) => setBrief(event.target.value.slice(0, 600))}
                  placeholder="A corporate awards night for 180 guests. Central stage, round tables, a VIP corner and two clear entrances."
                  className="min-h-28"
                />
              </Field>
              <Field label="Design direction">
                <div className="flex flex-wrap gap-1.5">
                  {DESIGN_STYLES.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setStyle(option)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-[12px] transition-colors",
                        style === option
                          ? "border-[#171510] bg-[#171510] text-[#fbf8f1]"
                          : "border-[#d8d1c3] bg-transparent text-[#5d574c] hover:bg-[#efeade]",
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </Field>
              <div className="flex items-start gap-3 rounded-xl border border-[#ded7c8] bg-[#f6f1e6] px-3.5 py-3">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#d9f36b]">
                  <Sparkles className="h-3.5 w-3.5 text-[#2d3315]" />
                </span>
                <p className="text-[12px] leading-5 text-[#6b6458]">
                  Hallcraft drafts a starting plan using room dimensions, circulation rules and
                  your guest count. Everything stays editable, and every recommendation needs a
                  human check.
                </p>
              </div>
            </>
          ) : (
            <div className="flex items-start gap-3 rounded-xl border border-[#ded7c8] bg-[#f6f1e6] px-3.5 py-3">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#e9e3d7]">
                <SquareDashed className="h-3.5 w-3.5" />
              </span>
              <p className="text-[12px] leading-5 text-[#6b6458]">
                You get a measured room {width} × {height} m with a grid, a snap-to-grid canvas
                and the full component library. Drag in a stage and start shaping.
              </p>
            </div>
          )}
        </div>
      </Modal>
    </NewDesignContext.Provider>
  );
}

export function NewDesignButton({
  className,
  label = "New design",
  variant = "default",
  size = "sm",
  withIcon = true,
}: {
  className?: string;
  label?: string;
  variant?: "default" | "outline" | "lime" | "ghost" | "secondary";
  size?: "default" | "sm" | "xs" | "lg";
  withIcon?: boolean;
}) {
  const { open } = useNewDesign();
  return (
    <Button
      variant={variant}
      size={size}
      className={cn("gap-1.5", className)}
      onClick={() => open()}
    >
      {withIcon ? <Plus className="h-3.5 w-3.5" /> : null}
      {label}
    </Button>
  );
}
