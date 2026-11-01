"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export function Menu({
  trigger,
  children,
  align = "end",
  width = 216,
  className,
  panelClassName,
}: {
  trigger: ReactNode;
  children: ReactNode;
  align?: "start" | "end";
  width?: number;
  className?: string;
  panelClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top?: number; bottom?: number; left: number } | null>(
    null,
  );
  const triggerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    const update = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const gutter = 8;
      const panelWidth = Math.min(width, window.innerWidth - gutter * 2);
      // Align the panel to the trigger but never let it run off either edge.
      const rawLeft = align === "end" ? rect.right - panelWidth : rect.left;
      const left = Math.min(
        Math.max(rawLeft, gutter),
        Math.max(gutter, window.innerWidth - panelWidth - gutter),
      );
      // Dropdowns near the bottom of the window (the profile card, the studio
      // status bar) flip above the trigger instead of floating far away from it.
      const spaceBelow = window.innerHeight - rect.bottom - gutter;
      const opensUp = spaceBelow < 240 && rect.top > spaceBelow;
      setPosition(
        opensUp
          ? { bottom: window.innerHeight - rect.top + 6, left }
          : { top: rect.bottom + 6, left },
      );
    };
    update();

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (triggerRef.current?.contains(target)) return;
      if ((event.target as HTMLElement)?.closest("[data-hallcraft-menu]")) return;
      setOpen(false);
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKey);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKey);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open]);

  return (
    <span ref={triggerRef} className={cn("relative inline-flex", className)}>
      <span onClick={() => setOpen((value) => !value)} className="contents">
        {trigger}
      </span>
      {open && position
        ? createPortal(
            <div
              data-hallcraft-menu
              role="menu"
              style={{
                position: "fixed",
                ...(position.top !== undefined
                  ? { top: position.top }
                  : { bottom: position.bottom }),
                left: position.left,
                width: Math.min(width, window.innerWidth - 16),
                maxHeight: "min(70dvh, 420px)",
              }}
              className={cn(
                "z-[90] overflow-y-auto overflow-x-hidden rounded-lg border border-[#d8d1c3] bg-[#fffdf7] p-1 shadow-lift animate-scale-in",
                panelClassName,
              )}
              onClick={() => setOpen(false)}
            >
              {children}
            </div>,
            document.body,
          )
        : null}
    </span>
  );
}

export function MenuItem({
  children,
  onClick,
  destructive = false,
  disabled = false,
  shortcut,
}: {
  children: ReactNode;
  onClick?: () => void;
  destructive?: boolean;
  disabled?: boolean;
  shortcut?: string;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-[13px] transition-colors",
        destructive
          ? "text-[#a53b28] hover:bg-[#f5e8e2]"
          : "text-[#2c2922] hover:bg-[#eee9dd]",
        disabled && "pointer-events-none opacity-40",
      )}
    >
      <span className="min-w-0 flex-1">{children}</span>
      {shortcut ? <span className="text-[11px] text-[#9a9488]">{shortcut}</span> : null}
    </button>
  );
}

export function MenuSeparator() {
  return <div className="my-1 h-px bg-[#e7e1d4]" />;
}

export function MenuLabel({ children }: { children: ReactNode }) {
  return (
    <p className="px-2.5 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#918b7e]">
      {children}
    </p>
  );
}
