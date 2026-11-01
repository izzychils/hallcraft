import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-[9px] bg-[#111111]",
        className,
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 32 32" className="h-full w-full">
        <path d="M7 7h10v9H7z" fill="none" stroke="#f7f3e9" strokeWidth="1.6" />
        <path d="M17 7h8v18h-8z" fill="none" stroke="#f7f3e9" strokeWidth="1.6" />
        <path d="M7 16h10v9H7z" fill="none" stroke="#d9f36b" strokeWidth="1.6" />
        <circle cx="21" cy="11.5" r="1.2" fill="#d9f36b" />
      </svg>
    </span>
  );
}

export function Logo({
  className,
  markClassName,
  href = "/",
  tone = "dark",
}: {
  className?: string;
  markClassName?: string;
  href?: string | null;
  tone?: "dark" | "light";
}) {
  const content = (
    <span className="flex items-center gap-2.5">
      <LogoMark className={markClassName} />
      <span
        className={cn(
          "font-display text-[19px] font-semibold tracking-[-0.04em]",
          tone === "light" ? "text-[#f8f4e9]" : "text-[#141310]",
          className,
        )}
      >
        Hallcraft
      </span>
    </span>
  );
  if (!href) return content;
  return (
    <Link href={href} className="inline-flex items-center" aria-label="Hallcraft home">
      {content}
    </Link>
  );
}
