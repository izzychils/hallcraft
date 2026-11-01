import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = "text", ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-9 w-full rounded-md border border-[#d7d1c4] bg-[#fffdf8] px-3 text-sm text-[#191814] shadow-[0_1px_0_rgba(16,16,16,0.02)] outline-none transition-[border,box-shadow] placeholder:text-[#9a9488] focus:border-[#8b8374] focus:ring-2 focus:ring-[#111111]/10 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-20 w-full resize-y rounded-md border border-[#d7d1c4] bg-[#fffdf8] px-3 py-2 text-sm leading-6 text-[#191814] outline-none transition-[border,box-shadow] placeholder:text-[#9a9488] focus:border-[#8b8374] focus:ring-2 focus:ring-[#111111]/10 disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("text-[12px] font-medium leading-4 text-[#4d483e]", className)}
      {...props}
    />
  );
}

export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      className={cn(
        "h-8 w-full appearance-none rounded-md border border-[#d7d1c4] bg-[#fffdf8] pl-2.5 pr-7 text-[13px] text-[#191814] outline-none transition-colors focus:border-[#8b8374] focus:ring-2 focus:ring-[#111111]/10 disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </select>
    <svg
      aria-hidden="true"
      viewBox="0 0 12 12"
      className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-[#7d7668]"
    >
      <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  </div>
));
Select.displayName = "Select";
