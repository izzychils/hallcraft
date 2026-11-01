import { cn, initials } from "@/lib/utils";

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "dark" | "lilac" | "lime" | "coral" | "success" | "warning";
  className?: string;
}) {
  const tones = {
    neutral: "bg-[#ece7db] text-[#4d483e]",
    dark: "bg-[#171613] text-[#f8f4ea]",
    lilac: "bg-[#d9c8f8] text-[#35244d]",
    lime: "bg-[#e2f68f] text-[#2a3311]",
    coral: "bg-[#ffd9cd] text-[#7a2a16]",
    success: "bg-[#e4efd9] text-[#3c6330]",
    warning: "bg-[#f6e8c4] text-[#785818]",
  } as const;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium leading-4",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Switch({
  checked,
  onCheckedChange,
  label,
  disabled,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111] focus-visible:ring-offset-2",
        checked
          ? "border-[#171613] bg-[#171613]"
          : "border-[#cfc8b9] bg-[#e7e1d4]",
        disabled && "opacity-50",
      )}
    >
      <span
        className={cn(
          "block h-3.5 w-3.5 rounded-full bg-[#fffdf8] shadow-sm transition-transform",
          checked ? "translate-x-[18px]" : "translate-x-[3px]",
        )}
      />
    </button>
  );
}

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  variant = "line",
  className,
}: {
  tabs: Array<{ id: T; label: string; count?: number }>;
  value: T;
  onChange: (value: T) => void;
  variant?: "line" | "pill";
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex items-center gap-1",
        variant === "line" ? "border-b border-[#e2dccd]" : "rounded-lg bg-[#ece7db] p-1",
        className,
      )}
    >
      {tabs.map((tab) => {
        const active = tab.id === value;
        return (
          <button
            key={tab.id}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative flex items-center gap-1.5 whitespace-nowrap text-[12px] font-medium transition-colors",
              variant === "line"
                ? "px-2.5 pb-2.5 pt-1.5 text-[#7b7468] hover:text-[#1b1914]"
                : "rounded-md px-2.5 py-1.5",
              variant === "line" && active && "text-[#171510]",
              variant === "pill" && active
                ? "bg-[#fffdf8] text-[#171510] shadow-[0_1px_2px_rgba(16,16,16,0.1)]"
                : variant === "pill" && "text-[#6f695e] hover:text-[#171510]",
            )}
          >
            {tab.label}
            {tab.count !== undefined ? (
              <span className="text-[10px] tabular-nums opacity-60">{tab.count}</span>
            ) : null}
            {variant === "line" && active ? (
              <span className="absolute inset-x-1.5 -bottom-px h-[2px] rounded-full bg-[#171510]" />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function Avatar({
  name,
  color = "#8a7f6a",
  size = "md",
  className,
}: {
  name: string;
  color?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = {
    xs: "h-5 w-5 text-[8px]",
    sm: "h-6 w-6 text-[9px]",
    md: "h-8 w-8 text-[10px]",
    lg: "h-10 w-10 text-xs",
  } as const;
  return (
    <span
      title={name}
      style={{ backgroundColor: color }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white ring-2 ring-[#fbf8f1]",
        sizes[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}

export function AvatarStack({
  people,
  max = 3,
  size = "sm",
}: {
  people: Array<{ name: string; color: string }>;
  max?: number;
  size?: "xs" | "sm" | "md";
}) {
  const visible = people.slice(0, max);
  const overflow = people.length - visible.length;
  return (
    <div className="flex -space-x-1.5">
      {visible.map((person) => (
        <Avatar key={person.name} name={person.name} color={person.color} size={size} />
      ))}
      {overflow > 0 ? (
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#e4ded1] text-[9px] font-semibold text-[#5b554a] ring-2 ring-[#fbf8f1]">
          +{overflow}
        </span>
      ) : null}
    </div>
  );
}

export function Separator({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-[#e7e1d4]", className)} />;
}

export function Field({
  label,
  hint,
  htmlFor,
  children,
  className,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={htmlFor} className="text-[11px] font-medium text-[#6f695e]">
          {label}
        </label>
        {hint ? <span className="text-[10px] text-[#9a9488]">{hint}</span> : null}
      </div>
      {children}
    </div>
  );
}
