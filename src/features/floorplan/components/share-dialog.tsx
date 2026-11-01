"use client";

import { useMemo, useState } from "react";
import { Check, Copy, ExternalLink, Globe2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Avatar } from "@/components/ui/primitives";
import { toast } from "@/components/ui/toast";
import { copyText } from "@/lib/utils";
import type { DesignRecord } from "@/features/designs/library";

export function ShareDialog({
  open,
  onClose,
  design,
}: {
  open: boolean;
  onClose: () => void;
  design: DesignRecord;
}) {
  const [copied, setCopied] = useState(false);
  const link = useMemo(() => {
    if (typeof window === "undefined") return `/p/${design.id}`;
    return `${window.location.origin}/p/${design.id}`;
  }, [design.id]);

  const copy = () => {
    void copyText(link)
      .then(() => {
        setCopied(true);
        toast.success("Preview link copied", "Read-only and always up to date on this device.");
        window.setTimeout(() => setCopied(false), 2200);
      })
      .catch(() =>
        toast.error("Couldn't copy the link", "Select the address above and copy it manually."),
      );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title="Share this plan"
      description="Send a read-only room sheet to the venue, vendors or client."
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Done
          </Button>
          <a href={`/p/${design.id}`} target="_blank" rel="noreferrer">
            <Button size="sm" className="gap-1.5">
              <ExternalLink className="h-3.5 w-3.5" />
              Open preview
            </Button>
          </a>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl border border-[#e2dbcc] bg-[#f8f4ea] p-3">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#e3efc3]">
            <Globe2 className="h-4 w-4 text-[#4b5b23]" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11.5px] font-medium">Anyone with the link can view</p>
            <p className="mt-0.5 text-[10px] leading-4 text-[#8a8376]">
              No editing, no measurements changed. This preview build stores the plan in this
              browser, so the link opens on this device.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-lg border border-[#d7d1c4] bg-[#fffdf8] p-1 pl-2.5">
          <span className="min-w-0 flex-1 truncate font-mono text-[10.5px] text-[#5d574c]">
            {link}
          </span>
          <Button size="xs" variant={copied ? "secondary" : "default"} className="gap-1" onClick={copy}>
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <p className="panel-title">People on this plan</p>
            <span className="inline-flex items-center gap-1 text-[10px] text-[#8a8376]">
              <Users className="h-3 w-3" /> {design.collaborators.length}
            </span>
          </div>
          <ul className="mt-2 space-y-1.5">
            {design.collaborators.map((person) => (
              <li
                key={person.id}
                className="flex items-center gap-2 rounded-lg border border-[#e7e0d2] bg-[#fbf8f1] px-2.5 py-2"
              >
                <Avatar name={person.name} color={person.color} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-medium">{person.name}</p>
                  <p className="text-[9.5px] text-[#8a8376]">{person.role}</p>
                </div>
                <span className="text-[9.5px] text-[#8a8376]">Can view</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Modal>
  );
}
