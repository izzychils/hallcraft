"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Copy,
  MoreHorizontal,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Menu, MenuItem, MenuLabel, MenuSeparator } from "@/components/ui/menu";
import { ConfirmDialog, Modal } from "@/components/ui/modal";
import { AvatarStack } from "@/components/ui/primitives";
import { toast } from "@/components/ui/toast";
import {
  deleteDesign,
  duplicateDesign,
  toggleStar,
  updateDesign,
  type DesignRecord,
  type DesignStatus,
} from "@/features/designs/library";
import { FloorPlanPreview } from "@/features/floorplan/render";
import { getSceneStats, getSceneWarnings } from "@/features/floorplan/geometry";
import { cn } from "@/lib/utils";

export function StatusBadge({ status }: { status: DesignStatus }) {
  const styles: Record<DesignStatus, string> = {
    Draft: "bg-[#eae5d9] text-[#5d574c]",
    "In review": "bg-[#f6e8c4] text-[#755413]",
    Approved: "bg-[#e2efd6] text-[#3f6232]",
    Archived: "bg-[#e4e2dd] text-[#77716a]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium",
        styles[status],
      )}
    >
      <span className="h-1 w-1 rounded-full bg-current opacity-70" />
      {status}
    </span>
  );
}

function formatEventDate(value: string) {
  if (!value) return "Date to confirm";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function DesignCard({ design, compact = false }: { design: DesignRecord; compact?: boolean }) {
  const router = useRouter();
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState(design.name);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const stats = getSceneStats(design.scene);
  const warnings = getSceneWarnings(design.scene);
  const issues = warnings.filter(
    (warning) => warning.severity === "high" || warning.severity === "medium",
  ).length;

  return (
    <>
      <article
        className={cn(
          "group relative flex flex-col overflow-hidden rounded-xl border border-[#ddd6c8] bg-[#fbf8f1] transition-all hover:-translate-y-0.5 hover:border-[#c4baa8] hover:shadow-paper",
          compact && "rounded-lg",
        )}
      >
        <div className="relative">
          <Link href={`/studio/${design.id}`} aria-label={`Open ${design.name}`}>
            <div
              className={cn(
                "overflow-hidden border-b border-[#e4ded0] bg-[#f1ebdf]",
                compact ? "h-36" : "h-48 sm:h-52",
              )}
            >
              <FloorPlanPreview
                scene={design.scene}
                showGrid={false}
                className="transition-transform duration-500 group-hover:scale-[1.025]"
                label={`${design.name} plan preview`}
              />
            </div>
          </Link>

          <div className="absolute left-3 top-3 flex items-center gap-1.5">
            <span className="rounded-md bg-[#fbf8f1]/95 px-2 py-1 text-[10px] font-medium text-[#4e483d] shadow-sm backdrop-blur">
              {design.eventType}
            </span>
            {issues > 0 ? (
              <span className="rounded-md bg-[#fbf8f1]/95 px-2 py-1 text-[10px] font-medium text-[#a2503a] shadow-sm backdrop-blur">
                {issues} check{issues === 1 ? "" : "s"}
              </span>
            ) : (
              <span className="rounded-md bg-[#e6f0db]/95 px-2 py-1 text-[10px] font-medium text-[#4b6b38] shadow-sm backdrop-blur">
                Clear
              </span>
            )}
          </div>

          <div className="absolute right-2.5 top-2.5 flex items-center gap-1">
            <button
              type="button"
              onClick={() => toggleStar(design.id)}
              className={cn(
                "grid h-7 w-7 place-items-center rounded-md border border-transparent bg-[#fbf8f1]/90 text-[#8c8578] backdrop-blur transition-colors hover:text-[#171510]",
                design.starred && "text-[#a56b16]",
              )}
              aria-label={design.starred ? "Remove from starred" : "Star design"}
            >
              <Star className={cn("h-3.5 w-3.5", design.starred && "fill-current")} />
            </button>
            <Menu
              width={210}
              trigger={
                <button
                  type="button"
                  className="grid h-7 w-7 place-items-center rounded-md border border-transparent bg-[#fbf8f1]/90 text-[#6f695e] backdrop-blur transition-colors hover:text-[#171510]"
                  aria-label={`${design.name} options`}
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </button>
              }
            >
              <MenuLabel>Design</MenuLabel>
              <MenuItem onClick={() => router.push(`/studio/${design.id}`)}>
                Open in studio
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setRenameValue(design.name);
                  setRenameOpen(true);
                }}
              >
                <span className="flex items-center gap-2">
                  <Pencil className="h-3.5 w-3.5" /> Rename
                </span>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  const copy = duplicateDesign(design.id);
                  if (copy) toast.success("Design duplicated", copy.name);
                }}
              >
                <span className="flex items-center gap-2">
                  <Copy className="h-3.5 w-3.5" /> Duplicate
                </span>
              </MenuItem>
              <MenuItem onClick={() => toggleStar(design.id)}>
                <span className="flex items-center gap-2">
                  <Star className="h-3.5 w-3.5" /> {design.starred ? "Unstar" : "Star"}
                </span>
              </MenuItem>
              <MenuSeparator />
              <MenuLabel>Status</MenuLabel>
              {(["Draft", "In review", "Approved", "Archived"] as DesignStatus[]).map((status) => (
                <MenuItem
                  key={status}
                  disabled={status === design.status}
                  onClick={() => {
                    updateDesign(design.id, { status });
                    toast.success("Status updated", `${design.name} is now ${status.toLowerCase()}.`);
                  }}
                >
                  {status === design.status ? `${status} · current` : status}
                </MenuItem>
              ))}
              <MenuSeparator />
              <MenuItem destructive onClick={() => setDeleteOpen(true)}>
                <span className="flex items-center gap-2">
                  <Trash2 className="h-3.5 w-3.5" /> Delete design
                </span>
              </MenuItem>
            </Menu>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-3.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <Link href={`/studio/${design.id}`} className="block min-w-0">
                <h3 className="truncate text-[14px] font-semibold leading-5 tracking-[-0.015em]">
                  {design.name}
                </h3>
              </Link>
              <p className="mt-0.5 truncate text-[11.5px] text-[#7f786b]">
                {design.venueName || "Venue to confirm"}
              </p>
            </div>
            <StatusBadge status={design.status} />
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-[#7f786b]">
            <span>{formatEventDate(design.eventDate)}</span>
            <span className="text-[#c9c2b4]">·</span>
            <span>{design.guestCount} guests</span>
            <span className="text-[#c9c2b4]">·</span>
            <span>
              {stats.seats} seat{stats.seats === 1 ? "" : "s"}
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-[#e8e2d5] pt-2.5">
            <AvatarStack
              people={design.collaborators.map((person) => ({
                name: person.name,
                color: person.color,
              }))}
              size="xs"
            />
            <Link
              href={`/studio/${design.id}`}
              className="inline-flex items-center gap-1 text-[11px] font-medium text-[#4c463b] transition-colors hover:text-[#111]"
            >
              Open plan <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </article>

      <Modal
        open={renameOpen}
        onClose={() => setRenameOpen(false)}
        title="Rename design"
        size="sm"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setRenameOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!renameValue.trim()}
              onClick={() => {
                updateDesign(design.id, { name: renameValue.trim() });
                setRenameOpen(false);
                toast.success("Design renamed");
              }}
            >
              Save name
            </Button>
          </>
        }
      >
        <Input
          value={renameValue}
          onChange={(event) => setRenameValue(event.target.value)}
          maxLength={80}
          autoFocus
          onKeyDown={(event) => {
            if (event.key === "Enter" && renameValue.trim()) {
              updateDesign(design.id, { name: renameValue.trim() });
              setRenameOpen(false);
              toast.success("Design renamed");
            }
          }}
        />
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title={`Delete “${design.name}”?`}
        description="The design and every placement in it are removed from this browser. This cannot be undone."
        confirmLabel="Delete design"
        destructive
        onConfirm={() => {
          deleteDesign(design.id);
          setDeleteOpen(false);
          toast.success("Design deleted");
        }}
      />
    </>
  );
}
