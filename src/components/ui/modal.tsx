"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

type ModalSize = "sm" | "md" | "lg" | "xl" | "full";
type ModalPosition = "center" | "right" | "bottom";

const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-none w-screen h-dvh rounded-none",
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  position = "center",
  className,
  bodyClassName,
  hideClose = false,
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: ModalSize;
  position?: ModalPosition;
  className?: string;
  bodyClassName?: string;
  hideClose?: boolean;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  const isSheet = position !== "center";

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-[80] flex bg-[#15130f]/35 backdrop-blur-[2px] animate-fade-in",
        position === "center" && "items-center justify-center p-4",
        position === "right" && "justify-end",
        position === "bottom" && "items-end justify-center",
      )}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === "string" ? title : undefined}
        className={cn(
          "relative flex max-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden border border-[#d8d1c2] bg-[#fbf8f1] shadow-lift animate-scale-in",
          isSheet ? "rounded-none" : "rounded-2xl",
          position === "right" &&
            "h-dvh max-h-dvh w-[min(440px,100vw)] border-y-0 border-r-0 animate-[slide-in-right_0.28s_cubic-bezier(0.16,1,0.3,1)]",
          position === "bottom" &&
            "h-[min(88dvh,760px)] max-h-[88dvh] rounded-t-2xl border-b-0",
          sizeClasses[size],
          className,
        )}
      >
        {title || !hideClose ? (
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#e4ded1] px-5 py-4">
            <div className="min-w-0">
              {title ? (
                <h2 className="text-[17px] font-semibold leading-6 tracking-[-0.02em]">
                  {title}
                </h2>
              ) : null}
              {description ? (
                <p className="mt-1 text-[13px] leading-5 text-[#6f695e]">{description}</p>
              ) : null}
            </div>
            {!hideClose ? (
              <button
                type="button"
                onClick={onClose}
                className="-mr-1.5 -mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-md text-[#6f695e] transition-colors hover:bg-[#eee9de] hover:text-[#171510]"
                aria-label="Close dialog"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
        ) : null}

        <div className={cn("min-h-0 flex-1 overflow-y-auto px-5 py-4 editor-scroll", bodyClassName)}>
          {children}
        </div>

        {footer ? (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-[#e4ded1] bg-[#f8f4ec] px-5 py-3.5">
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  loading = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            size="sm"
            variant={destructive ? "destructive" : "default"}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Working…" : confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm leading-6 text-[#5c564c]">{description}</p>
    </Modal>
  );
}
