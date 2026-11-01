"use client";

import { useMemo } from "react";
import { ArrowRight, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { toast } from "@/components/ui/toast";
import { getSceneStats } from "../geometry";
import { FloorPlanPreview } from "../render";
import { useFloorPlanStore } from "../store";
import { FLOOR_PLAN_TEMPLATES } from "../templates";

export function TemplatesDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const scene = useFloorPlanStore((state) => state.scene);
  const applyScene = useFloorPlanStore((state) => state.applyScene);
  const templates = useMemo(
    () => FLOOR_PLAN_TEMPLATES.map((template) => ({ template, scene: template.build() })),
    [],
  );

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title="Start from a template"
      description="The current canvas is replaced. You can undo it with Ctrl / Cmd + Z."
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map(({ template, scene: templateScene }) => {
          const stats = getSceneStats(templateScene);
          return (
            <div
              key={template.id}
              className="group flex flex-col overflow-hidden rounded-xl border border-[#ddd6c8] bg-[#fbf8f1] transition-all hover:-translate-y-0.5 hover:border-[#bfb5a3] hover:shadow-paper"
            >
              <div className="relative h-36 border-b border-[#e4ded0] bg-[#f1ebdf]">
                <FloorPlanPreview
                  scene={templateScene}
                  showGrid={false}
                  className="h-full w-full"
                />
                <span className="absolute left-2 top-2 rounded-md bg-[#fbf8f1]/95 px-1.5 py-0.5 text-[9.5px] font-medium shadow-sm">
                  {template.eventType}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-2.5">
                <div className="flex items-start justify-between gap-1">
                  <p className="text-[11.5px] font-semibold">{template.name}</p>
                  <span className="shrink-0 text-[9px] text-[#9a9488]">{stats.seats} seats</span>
                </div>
                <p className="mt-1 flex-1 text-[10px] leading-4 text-[#7c7568]">
                  {template.description}
                </p>
                <div className="mt-2 flex items-center justify-between border-t border-[#e8e2d5] pt-2">
                  <span className="text-[9px] text-[#9a9488]">
                    {template.width}×{template.height} m
                  </span>
                  <Button
                    size="xs"
                    variant="outline"
                    className="h-6 gap-1 bg-[#fbf8f1] px-1.5 text-[10px]"
                    onClick={() => {
                      applyScene({
                        ...templateScene,
                        name: scene.name,
                        venueName: scene.venueName,
                        eventType: template.eventType,
                        guestCount: template.guests,
                      });
                      toast.success(`${template.name} applied`, "Every item is editable.");
                      onClose();
                    }}
                  >
                    Use
                    <ArrowRight className="h-2.5 w-2.5" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-lg border border-[#e3dccd] bg-[#f6f1e6] px-3 py-2 text-[10.5px] text-[#756e61]">
        <Layers className="h-3.5 w-3.5 shrink-0" />
        Templates keep their own room dimensions. Use Ctrl / Cmd + Z to return to your plan.
      </div>
    </Modal>
  );
}
