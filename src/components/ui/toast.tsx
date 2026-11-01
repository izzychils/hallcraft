"use client";

import { useSyncExternalStore } from "react";
import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "success" | "error" | "info";

interface ToastItem {
  id: string;
  tone: Tone;
  title: string;
  description?: string;
}

let items: ToastItem[] = [];
const listeners = new Set<() => void>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();

function emit() {
  listeners.forEach((listener) => listener());
}

function remove(id: string) {
  items = items.filter((item) => item.id !== id);
  const timer = timers.get(id);
  if (timer) clearTimeout(timer);
  timers.delete(id);
  emit();
}

function push(tone: Tone, title: string, description?: string) {
  const id = `toast_${Math.random().toString(36).slice(2, 9)}`;
  items = [...items.slice(-3), { id, tone, title, description }];
  timers.set(
    id,
    setTimeout(() => remove(id), 4200),
  );
  emit();
  return id;
}

export const toast = {
  success: (title: string, description?: string) => push("success", title, description),
  error: (title: string, description?: string) => push("error", title, description),
  info: (title: string, description?: string) => push("info", title, description),
};

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function Toaster() {
  const toasts = useSyncExternalStore(
    subscribe,
    () => items,
    () => items,
  );

  return (
    <div
      data-toaster
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(380px,calc(100vw-2rem))] flex-col gap-2"
    >
      {toasts.map((item) => {
        const Icon =
          item.tone === "success" ? CheckCircle2 : item.tone === "error" ? TriangleAlert : Info;
        return (
          <div
            key={item.id}
            role="status"
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-xl border bg-[#fffdf8] p-3.5 shadow-lift animate-scale-in",
              item.tone === "error" ? "border-[#e8c5bc]" : "border-[#ddd6c7]",
            )}
          >
            <span
              className={cn(
                "mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full",
                item.tone === "error"
                  ? "bg-[#f7e3dc] text-[#a33a26]"
                  : item.tone === "success"
                    ? "bg-[#e7f0dd] text-[#3f6b34]"
                    : "bg-[#eae6dc] text-[#4d473d]",
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium leading-5">{item.title}</p>
              {item.description ? (
                <p className="mt-0.5 text-xs leading-5 text-[#6d675c]">{item.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => remove(item.id)}
              className="-mr-1 -mt-1 rounded-md p-1 text-[#8a8478] transition-colors hover:bg-[#f1ece1] hover:text-[#2b2822]"
              aria-label="Dismiss notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
