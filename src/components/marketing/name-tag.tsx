import { cn } from "@/lib/utils";

export function CursorTag({
  name,
  className,
  color = "#7c5cff",
  textColor = "#ffffff",
  tilt = -2,
}: {
  name: string;
  className?: string;
  color?: string;
  textColor?: string;
  tilt?: number;
}) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute z-10 select-none whitespace-nowrap text-[10px] leading-none",
        className
      )}
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      <svg
        viewBox="0 0 20 22"
        className="absolute -left-3 -top-4 h-4 w-4 drop-shadow-sm"
        aria-hidden="true"
        style={{ color }}
      >
        <path
          d="M2 1.5 17 11l-6.6 1.4L7 19.5 2 1.5Z"
          fill={color}
          stroke="#f7f3e9"
          strokeWidth="1.2"
        />
      </svg>
      <span
        className="ml-1 inline-block rounded-[3px] px-2 py-1 text-[10px] font-medium leading-3 tracking-wide"
        style={{ backgroundColor: color, color: textColor }}
      >
        {name}
      </span>
    </span>
  );
}
