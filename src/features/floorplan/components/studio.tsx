"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronDown,
  Copy,
  Download,
  Eye,
  FileJson,
  FileText,
  Hand,
  Image as ImageIcon,
  LayoutTemplate,
  MousePointer2,
  MoreHorizontal,
  Redo2,
  Share2,
  Sparkles,
  Trash2,
  TriangleAlert,
  Undo2,
  Wand2,
  X,
} from "lucide-react";
import { LogoMark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, MenuItem, MenuLabel, MenuSeparator } from "@/components/ui/menu";
import { ConfirmDialog, Modal } from "@/components/ui/modal";
import { AvatarStack, Badge } from "@/components/ui/primitives";
import { toast } from "@/components/ui/toast";
import {
  deleteDesign,
  duplicateDesign,
  updateDesign,
  useDesigns,
  useDesignsReady,
  saveDesignScene,
  type DesignStatus,
} from "@/features/designs/library";
import { useAuth } from "@/features/auth/auth";
import { cn, formatRelativeTime } from "@/lib/utils";
import {
  describeWarningCount,
  getDensity,
  getSceneStats,
  getSceneWarnings,
} from "../geometry";
import { FloorPlanPreview } from "../render";
import { useFloorPlanStore } from "../store";
import { AiDesignDialog } from "./ai-dialog";
import { FloorPlanCanvas } from "./canvas";
import { FloorPlanInspector } from "./inspector";
import { FloorPlanLibrary } from "./library";
import { ShareDialog } from "./share-dialog";
import { TemplatesDialog } from "./templates-dialog";
import { exportSceneAsJson, exportSceneAsPng, printSceneAsPdf } from "../export";

const STATUSES: DesignStatus[] = ["Draft", "In review", "Approved", "Archived"];

export function FloorPlanStudio({ designId }: { designId: string }) {
  const router = useRouter();
  const designs = useDesigns();
  const ready = useDesignsReady();
  const { user, ready: authReady } = useAuth();
  const design = designs.find((item) => item.id === designId);

  const scene = useFloorPlanStore((state) => state.scene);
  const dirty = useFloorPlanStore((state) => state.dirty);
  const savedAt = useFloorPlanStore((state) => state.savedAt);
  const selectedIds = useFloorPlanStore((state) => state.selectedIds);
  const tool = useFloorPlanStore((state) => state.tool);
  const snapEnabled = useFloorPlanStore((state) => state.snapEnabled);
  const past = useFloorPlanStore((state) => state.past);
  const future = useFloorPlanStore((state) => state.future);
  const setTool = useFloorPlanStore((state) => state.setTool);
  const setSnapEnabled = useFloorPlanStore((state) => state.setSnapEnabled);
  const undo = useFloorPlanStore((state) => state.undo);
  const redo = useFloorPlanStore((state) => state.redo);
  const clearSelection = useFloorPlanStore((state) => state.clearSelection);
  const select = useFloorPlanStore((state) => state.select);
  const updateSceneMeta = useFloorPlanStore((state) => state.updateSceneMeta);

  const [loaded, setLoaded] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [preview, setPreview] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<"library" | "inspector" | null>(null);
  const [exporting, setExporting] = useState(false);
  const [lastSavedLabel, setLastSavedLabel] = useState("Saved");
  const [now, setNow] = useState(Date.now());
  const exportRef = useRef<HTMLDivElement>(null);
  const autosaveReady = useRef(false);

  useEffect(() => {
    if (authReady && !user) {
      router.replace(`/login?next=${encodeURIComponent(`/studio/${designId}`)}`);
    }
  }, [authReady, designId, router, user]);

  useEffect(() => {
    if (!ready || !design) return;
    const current = useFloorPlanStore.getState();
    if (loaded) return;
    const latest = designs.find((item) => item.id === designId);
    if (!latest) return;
    current.loadScene(latest.scene);
    setLoaded(true);
    autosaveReady.current = true;
  }, [design, designId, designs, loaded, ready]);

  useEffect(() => {
    if (!loaded) return;
    setNameDraft(scene.name);
  }, [loaded, scene.name]);

  useEffect(() => {
    if (!loaded) return;
    document.title = `${scene.name}: Hallcraft studio`;
  }, [loaded, scene.name]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!loaded || !autosaveReady.current) return;
    if (!dirty) return;
    const timer = window.setTimeout(() => {
      saveDesignScene(designId, useFloorPlanStore.getState().scene);
      useFloorPlanStore.getState().markSaved();
    }, 550);
    return () => window.clearTimeout(timer);
  }, [designId, dirty, loaded, scene]);

  useEffect(() => {
    if (!savedAt) {
      setLastSavedLabel("All changes saved");
      return;
    }
    const diff = now - savedAt;
    setLastSavedLabel(diff < 20_000 ? "Saved just now" : `Saved ${formatRelativeTime(savedAt)}`);
  }, [now, savedAt]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT" ||
        target?.isContentEditable;
      if (typing) return;

      const store = useFloorPlanStore.getState();
      const modifier = event.metaKey || event.ctrlKey;

      if (modifier && event.key.toLowerCase() === "s") {
        event.preventDefault();
        saveDesignScene(designId, store.scene);
        store.markSaved();
        toast.success("Plan saved", "Your changes are stored in this browser.");
        return;
      }
      if (modifier && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) store.redo();
        else store.undo();
        return;
      }
      if (modifier && event.key.toLowerCase() === "y") {
        event.preventDefault();
        store.redo();
        return;
      }
      if (modifier && event.key.toLowerCase() === "d") {
        event.preventDefault();
        store.duplicateSelection();
        return;
      }
      if (modifier && event.key.toLowerCase() === "c") {
        event.preventDefault();
        store.copySelection();
        toast.info("Copied", "Paste with Ctrl / Cmd + V.");
        return;
      }
      if (modifier && event.key.toLowerCase() === "v") {
        event.preventDefault();
        store.pasteClipboard();
        return;
      }
      if (modifier && event.key.toLowerCase() === "a") {
        event.preventDefault();
        store.selectMany(Object.keys(store.scene.elements));
        return;
      }
      if (event.code === "Space" && !preview) {
        event.preventDefault();
        if (!event.repeat) store.setTool("pan");
        return;
      }
      if (event.key === "Delete" || event.key === "Backspace") {
        if (store.selectedIds.length > 0 && !preview) {
          event.preventDefault();
          store.removeSelection();
        }
        return;
      }
      if (event.key === "Escape") {
        if (preview) {
          setPreview(false);
          return;
        }
        if (aiOpen) setAiOpen(false);
        else if (templatesOpen) setTemplatesOpen(false);
        else if (mobilePanel) setMobilePanel(null);
        else store.clearSelection();
        return;
      }
      if (event.key.startsWith("Arrow") && !preview) {
        if (!store.selectedIds.length) return;
        event.preventDefault();
        const step = event.shiftKey ? 0.5 : 0.1;
        if (event.key === "ArrowLeft") store.nudgeSelection(-step, 0);
        if (event.key === "ArrowRight") store.nudgeSelection(step, 0);
        if (event.key === "ArrowUp") store.nudgeSelection(0, -step);
        if (event.key === "ArrowDown") store.nudgeSelection(0, step);
      }
    };

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.code !== "Space") return;
      const target = event.target as HTMLElement | null;
      if (
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.tagName === "SELECT"
      ) {
        return;
      }
      useFloorPlanStore.getState().setTool("select");
    };

    window.addEventListener("keydown", onKeyDown, true);
    window.addEventListener("keyup", onKeyUp, true);
    return () => {
      window.removeEventListener("keydown", onKeyDown, true);
      window.removeEventListener("keyup", onKeyUp, true);
    };
  }, [aiOpen, designId, mobilePanel, preview, templatesOpen]);

  const stats = useMemo(() => getSceneStats(scene), [scene]);
  const warnings = useMemo(() => getSceneWarnings(scene), [scene]);
  const density = useMemo(() => getDensity(scene), [scene]);
  const severeWarnings = warnings.filter((warning) => warning.severity !== "low");

  const handleExport = async (format: "png" | "pdf" | "json") => {
    const svg = exportRef.current?.querySelector("svg");
    if (format !== "json" && !svg) {
      toast.error("Export not ready", "Give the plan a moment to render, then try again.");
      return;
    }
    setExporting(true);
    try {
      if (format === "png") await exportSceneAsPng(svg as SVGSVGElement, scene);
      else if (format === "pdf") printSceneAsPdf(svg as SVGSVGElement, scene);
      else exportSceneAsJson(scene);
      toast.success(
        format === "pdf" ? "Print sheet opened" : `${format.toUpperCase()} exported`,
        format === "pdf" ? "Choose “Save as PDF” in the print dialog." : undefined,
      );
    } catch (error) {
      toast.error(
        "Export failed",
        error instanceof Error ? error.message : "The plan could not be exported.",
      );
    } finally {
      setExporting(false);
    }
  };

  if (!authReady || !ready) {
    return (
      <div className="grid min-h-dvh place-items-center bg-[#f3f0e9]">
        <div className="flex flex-col items-center gap-3">
          <LogoMark className="h-10 w-10 animate-pulse-soft" />
          <p className="text-[11px] text-[#8a8376]">Rolling out the drawing…</p>
        </div>
      </div>
    );
  }

  if (!design) {
    return (
      <div className="grid min-h-dvh place-items-center bg-[#f3f0e9] px-6">
        <div className="max-w-sm text-center">
          <p className="text-3xl font-medium tracking-[-0.04em]">Design not found</p>
          <p className="mt-2 text-[12px] leading-5 text-[#7c7568]">
            It may have been deleted or it lives in another browser. Head back to the studio to
            pick another room.
          </p>
          <Link href="/dashboard/designs" className="mt-4 inline-block">
            <Button size="sm">Back to designs</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="grid min-h-dvh place-items-center bg-[#f3f0e9]">
        <div className="flex flex-col items-center gap-3">
          <LogoMark className="h-10 w-10 animate-pulse-soft" />
          <p className="text-[11px] text-[#8a8376]">Opening {design.name}…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-[#f3f0e9]">
      <header className="flex h-[54px] shrink-0 items-center justify-between gap-2 border-b border-[#dcd5c7] bg-[#f8f4eb] px-2.5 sm:px-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <Link
            href="/dashboard/designs"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-[#5d574c] transition-colors hover:bg-[#ece7db] hover:text-[#171510]"
            aria-label="Back to designs"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <span className="hidden h-5 w-px bg-[#e0dacd] sm:block" />
          <LogoMark className="hidden h-7 w-7 sm:inline-flex" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <input
                value={nameDraft}
                onChange={(event) => setNameDraft(event.target.value)}
                onBlur={() => {
                  const next = nameDraft.trim() || "Untitled layout";
                  setNameDraft(next);
                  if (next !== scene.name) updateSceneMeta({ name: next });
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") event.currentTarget.blur();
                }}
                maxLength={80}
                aria-label="Design name"
                className="min-w-0 max-w-[170px] truncate rounded border border-transparent bg-transparent px-1 py-0.5 text-[13px] font-semibold tracking-[-0.01em] outline-none hover:border-[#d8d1c3] focus:border-[#b9b0a0] focus:bg-[#fffdf8] sm:max-w-[300px]"
              />
              <Menu
                width={190}
                trigger={
                  <button
                    type="button"
                    className="hidden shrink-0 items-center gap-1 rounded-full border border-[#ddd6c8] bg-[#fbf8f1] px-2 py-0.5 text-[9.5px] font-medium text-[#6f695e] hover:bg-[#efeade] sm:inline-flex"
                  >
                    <span className="h-1 w-1 rounded-full bg-[#a88a47]" />
                    {design.status}
                    <ChevronDown className="h-2.5 w-2.5" />
                  </button>
                }
              >
                <MenuLabel>Design status</MenuLabel>
                {STATUSES.map((status) => (
                  <MenuItem
                    key={status}
                    disabled={design.status === status}
                    onClick={() => {
                      updateDesign(designId, { status });
                      toast.success("Status updated", `${design.name} is now ${status.toLowerCase()}.`);
                    }}
                  >
                    {status}
                  </MenuItem>
                ))}
              </Menu>
            </div>
            <p className="truncate px-1 text-[10px] text-[#918a7c]">
              {scene.venueName || design.venueName} · {scene.eventType} · {scene.guestCount ?? 0}{" "}
              guests
            </p>
          </div>
          <span className="hidden items-center gap-1.5 rounded-full border border-[#e0d9cb] bg-[#fbf8f1] px-2 py-1 text-[9.5px] text-[#7c7568] md:inline-flex">
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                dirty ? "bg-[#c29a48]" : "bg-[#7d9a68]",
              )}
            />
            {dirty ? "Saving…" : lastSavedLabel}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <span className="hidden lg:block">
            <AvatarStack
              people={design.collaborators.map((person) => ({
                name: person.name,
                color: person.color,
              }))}
              size="xs"
            />
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="hidden gap-1.5 text-[11px] sm:inline-flex"
            onClick={() => setPreview((value) => !value)}
          >
            {preview ? <X className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {preview ? "Exit preview" : "Preview"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="hidden gap-1.5 bg-[#fbf8f1] text-[11px] md:inline-flex"
            onClick={() => setShareOpen(true)}
          >
            <Share2 className="h-3.5 w-3.5" />
            Share
          </Button>
          <Menu
            width={210}
            trigger={
              <Button
                variant="outline"
                size="sm"
                className="hidden gap-1.5 bg-[#fbf8f1] text-[11px] sm:inline-flex"
                disabled={exporting}
              >
                <Download className="h-3.5 w-3.5" />
                Export
              </Button>
            }
          >
            <MenuLabel>Export plan</MenuLabel>
            <MenuItem onClick={() => void handleExport("png")}>
              <span className="flex items-center gap-2">
                <ImageIcon className="h-3.5 w-3.5" /> PNG image
              </span>
            </MenuItem>
            <MenuItem onClick={() => void handleExport("pdf")}>
              <span className="flex items-center gap-2">
                <FileText className="h-3.5 w-3.5" /> PDF sheet
              </span>
            </MenuItem>
            <MenuItem onClick={() => void handleExport("json")}>
              <span className="flex items-center gap-2">
                <FileJson className="h-3.5 w-3.5" /> Plan data (JSON)
              </span>
            </MenuItem>
            <MenuSeparator />
            <MenuItem onClick={() => setShareOpen(true)}>
              <span className="flex items-center gap-2">
                <Share2 className="h-3.5 w-3.5" /> Share preview
              </span>
            </MenuItem>
          </Menu>
          <Menu
            width={210}
            trigger={
              <Button variant="outline" size="icon-sm" className="bg-[#fbf8f1]" aria-label="More design actions">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            }
          >
            <MenuItem
              onClick={() => {
                const copy = duplicateDesign(designId);
                if (copy) {
                  toast.success("Design duplicated", copy.name);
                  router.push(`/studio/${copy.id}`);
                }
              }}
            >
              <span className="flex items-center gap-2">
                <Copy className="h-3.5 w-3.5" /> Duplicate design
              </span>
            </MenuItem>
            <MenuItem onClick={() => setTemplatesOpen(true)}>
              <span className="flex items-center gap-2">
                <LayoutTemplate className="h-3.5 w-3.5" /> Replace with template
              </span>
            </MenuItem>
            <MenuSeparator />
            <MenuItem destructive onClick={() => setDeleteOpen(true)}>
              <span className="flex items-center gap-2">
                <Trash2 className="h-3.5 w-3.5" /> Delete design
              </span>
            </MenuItem>
          </Menu>
          <Button size="sm" className="gap-1.5 text-[11px]" onClick={() => setAiOpen(true)}>
            <Wand2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">AI design</span>
          </Button>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        {!preview ? (
          <aside className="hidden w-[264px] shrink-0 border-r border-[#ded7c9] lg:block">
            <FloorPlanLibrary
              onPicked={() => undefined}
              onOpenAi={() => setAiOpen(true)}
              onOpenTemplates={() => setTemplatesOpen(true)}
            />
          </aside>
        ) : null}

        <main className="flex min-w-0 flex-1 flex-col">
          {!preview ? (
            <div className="flex h-10 shrink-0 flex-wrap items-center justify-between gap-1 border-b border-[#ded7c9] bg-[#f8f4eb] px-2">
              <div className="flex items-center gap-0.5">
                <ToolButton
                  active={tool === "select"}
                  label="Select and move"
                  onClick={() => setTool("select")}
                >
                  <MousePointer2 className="h-3.5 w-3.5" />
                </ToolButton>
                <ToolButton
                  active={tool === "pan"}
                  label="Pan canvas (hold Space)"
                  onClick={() => setTool("pan")}
                >
                  <Hand className="h-3.5 w-3.5" />
                </ToolButton>
                <span className="mx-1 h-4 w-px bg-[#e1dbce]" />
                <ToolButton label="Undo (Ctrl Z)" onClick={undo} disabled={past.length === 0}>
                  <Undo2 className="h-3.5 w-3.5" />
                </ToolButton>
                <ToolButton
                  label="Redo (Ctrl Y)"
                  onClick={redo}
                  disabled={future.length === 0}
                >
                  <Redo2 className="h-3.5 w-3.5" />
                </ToolButton>
                <span className="mx-1 hidden h-4 w-px bg-[#e1dbce] sm:block" />
                <button
                  type="button"
                  onClick={() => setSnapEnabled(!snapEnabled)}
                  className={cn(
                    "hidden h-7 items-center gap-1 rounded px-2 text-[10px] font-medium transition-colors sm:inline-flex",
                    snapEnabled
                      ? "bg-[#171510] text-[#f8f4ea]"
                      : "text-[#7c7568] hover:bg-[#ece7db]",
                  )}
                  title="Snap moves and sizes to the grid"
                >
                  <GridIcon /> Snap {snapEnabled ? "on" : "off"}
                </button>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setTemplatesOpen(true)}
                  className="inline-flex h-7 items-center gap-1 rounded px-2 text-[10px] text-[#6f695e] transition-colors hover:bg-[#ece7db] hover:text-[#171510]"
                >
                  <LayoutTemplate className="h-3.5 w-3.5" />
                  Templates
                </button>
                <button
                  type="button"
                  onClick={() => setAiOpen(true)}
                  className="inline-flex h-7 items-center gap-1 rounded px-2 text-[10px] text-[#6f695e] transition-colors hover:bg-[#ece7db] hover:text-[#171510]"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Variations
                </button>
                <span className="ml-1 hidden text-[9.5px] text-[#a09889] md:inline">
                  {scene.canvas.grid} m grid
                </span>
              </div>
            </div>
          ) : (
            <div className="flex h-9 shrink-0 items-center justify-between border-b border-[#ded7c9] bg-[#f8f4eb] px-3">
              <span className="inline-flex items-center gap-1.5 text-[10px] text-[#7c7568]">
                <Eye className="h-3.5 w-3.5" /> Read-only preview · {scene.name}
              </span>
              <Button variant="ghost" size="xs" className="gap-1" onClick={() => setPreview(false)}>
                <X className="h-3.5 w-3.5" /> Exit preview
              </Button>
            </div>
          )}

          <div className="relative min-h-0 flex-1">
            <FloorPlanCanvas
              interactive={!preview}
              onOpenLibrary={() => setMobilePanel("library")}
              onOpenAi={() => setAiOpen(true)}
            />
          </div>

          {!preview ? (
            <div className="flex h-[34px] shrink-0 flex-wrap items-center gap-x-3 gap-y-1 border-t border-[#ded7c9] bg-[#f8f4eb] px-3 text-[9.5px] text-[#8a8376]">
              <span>
                <strong className="font-semibold text-[#3f3b33]">{stats.elements}</strong> objects
              </span>
              <span>
                <strong className="font-semibold text-[#3f3b33]">{stats.tables}</strong> tables
              </span>
              <span>
                <strong className="font-semibold text-[#3f3b33]">{stats.seats}</strong> seats
              </span>
              <span className="hidden sm:inline">
                <strong className="font-semibold text-[#3f3b33]">{stats.zones}</strong> zones
              </span>
              <span>
                {stats.width} × {stats.height} m
              </span>
              <span className="hidden md:inline">{density.area} m²</span>
              <Menu
                width={300}
                trigger={
                  <button
                    type="button"
                    className={cn(
                      "ml-auto inline-flex items-center gap-1 rounded-full border px-2 py-0.5 transition-colors",
                      warnings.length
                        ? "border-[#e0d1c1] bg-[#f5ecdf] text-[#8a5b3f] hover:bg-[#f1e5d4]"
                        : "border-[#d7e2cb] bg-[#edf3e5] text-[#4d6b3b]",
                    )}
                  >
                    <TriangleAlert className="h-2.5 w-2.5" />
                    {describeWarningCount(warnings)}
                  </button>
                }
              >
                <MenuLabel>
                  {warnings.length ? "Planning recommendations" : "Room checks"}
                </MenuLabel>
                {warnings.length === 0 ? (
                  <p className="px-2.5 pb-2 text-[10.5px] leading-4 text-[#8a8376]">
                    Nothing overlaps and every marked entrance is clear in this version.
                  </p>
                ) : (
                  warnings.slice(0, 7).map((warning, index) => (
                    <MenuItem
                      key={`${warning.kind}-${index}`}
                      onClick={() => {
                        if (warning.elementIds[0]) select(warning.elementIds[0]);
                        setMobilePanel("inspector");
                      }}
                    >
                      <span className="flex items-start gap-1.5 text-[10.5px] leading-4">
                        <span
                          className={cn(
                            "mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full",
                            warning.severity === "high"
                              ? "bg-[#b25439]"
                              : warning.severity === "medium"
                                ? "bg-[#c29a48]"
                                : "bg-[#9a9488]",
                          )}
                        />
                        {warning.message}
                      </span>
                    </MenuItem>
                  ))
                )}
                <MenuSeparator />
                <p className="px-2.5 py-1 text-[9px] leading-4 text-[#a09889]">
                  Recommendations only. Verify with the venue before production.
                </p>
              </Menu>
            </div>
          ) : null}

          {!preview ? (
            <div className="flex h-11 shrink-0 items-center gap-1.5 border-t border-[#ded7c9] bg-[#f8f4eb] px-2 lg:hidden">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1.5 bg-[#fbf8f1] text-[11px]"
                onClick={() => setMobilePanel("library")}
              >
                <LayoutTemplate className="h-3.5 w-3.5" />
                Add items
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 gap-1.5 bg-[#fbf8f1] text-[11px]"
                onClick={() => setMobilePanel("inspector")}
              >
                <MousePointer2 className="h-3.5 w-3.5" />
                {selectedIds.length > 1
                  ? `${selectedIds.length} items`
                  : selectedIds.length
                    ? "Inspect item"
                    : "Venue"}
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Undo"
                onClick={undo}
                disabled={past.length === 0}
              >
                <Undo2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Redo"
                onClick={redo}
                disabled={future.length === 0}
              >
                <Redo2 className="h-4 w-4" />
              </Button>
            </div>
          ) : null}
        </main>

        {!preview ? (
          <aside className="hidden w-[288px] shrink-0 border-l border-[#ded7c9] xl:block">
            <FloorPlanInspector
              onOpenAi={() => setAiOpen(true)}
              onOpenTemplates={() => setTemplatesOpen(true)}
            />
          </aside>
        ) : null}
      </div>

      <div
        ref={exportRef}
        aria-hidden="true"
        className="pointer-events-none fixed -left-[10000px] top-0 h-[1100px] w-[1100px] opacity-0"
      >
        <FloorPlanPreview scene={scene} />
      </div>

      <Modal
        open={mobilePanel === "library"}
        onClose={() => setMobilePanel(null)}
        position="bottom"
        size="full"
        className="h-[86dvh]"
        title="Add to the plan"
        description="Drag or tap an item to place it."
        bodyClassName="p-0"
      >
        <div className="h-full">
          <FloorPlanLibrary
            onPicked={() => setMobilePanel(null)}
            onOpenAi={() => {
              setMobilePanel(null);
              setAiOpen(true);
            }}
            onOpenTemplates={() => {
              setMobilePanel(null);
              setTemplatesOpen(true);
            }}
          />
        </div>
      </Modal>

      <Modal
        open={mobilePanel === "inspector"}
        onClose={() => setMobilePanel(null)}
        position="bottom"
        size="full"
        className="h-[86dvh]"
        title="Room inspector"
        description="Placement, seating, style and checks."
        bodyClassName="p-0"
      >
        <div className="h-full">
          <FloorPlanInspector
            onOpenAi={() => {
              setMobilePanel(null);
              setAiOpen(true);
            }}
            onOpenTemplates={() => {
              setMobilePanel(null);
              setTemplatesOpen(true);
            }}
          />
        </div>
      </Modal>

      <AiDesignDialog open={aiOpen} onClose={() => setAiOpen(false)} />
      <TemplatesDialog open={templatesOpen} onClose={() => setTemplatesOpen(false)} />
      <ShareDialog open={shareOpen} onClose={() => setShareOpen(false)} design={design} />

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title={`Delete “${design.name}”?`}
        description="This removes the design and every placement in it from this browser. This cannot be undone."
        confirmLabel="Delete design"
        destructive
        onConfirm={() => {
          deleteDesign(designId);
          toast.success("Design deleted");
          router.push("/dashboard/designs");
        }}
      />
    </div>
  );
}

function ToolButton({
  children,
  label,
  onClick,
  active,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "grid h-7 w-7 place-items-center rounded transition-colors disabled:opacity-35",
        active
          ? "bg-[#171510] text-[#f8f4ea]"
          : "text-[#6f695e] hover:bg-[#ece7db] hover:text-[#171510]",
      )}
    >
      {children}
    </button>
  );
}

function GridIcon() {
  return (
    <svg viewBox="0 0 14 14" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1">
      <path d="M1 5h12M1 9h12M5 1v12M9 1v12" />
    </svg>
  );
}
