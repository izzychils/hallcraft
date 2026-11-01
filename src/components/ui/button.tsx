import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "default"
  | "outline"
  | "ghost"
  | "secondary"
  | "destructive"
  | "lime"
  | "link";
export type ButtonSize = "default" | "sm" | "xs" | "lg" | "icon" | "icon-sm";

const variants: Record<ButtonVariant, string> = {
  default:
    "bg-[#111111] text-[#fbf8f1] hover:bg-[#2a2a2a] active:bg-[#000000] shadow-[0_1px_0_rgba(255,255,255,0.08)_inset]",
  outline:
    "border border-[#d8d2c4] bg-transparent text-[#161512] hover:bg-[#ece7db] active:bg-[#e5dfd2]",
  ghost: "text-[#363229] hover:bg-[#ece7db] active:bg-[#e5dfd2]",
  secondary: "bg-[#e9e4d8] text-[#211f1a] hover:bg-[#e0dacc] active:bg-[#d8d1c2]",
  destructive: "bg-[#a53b28] text-white hover:bg-[#8f3222] active:bg-[#7d2b1d]",
  lime: "bg-[#d9f36b] text-[#15160f] hover:bg-[#cbe95a] active:bg-[#bedb4d]",
  link: "text-[#2a2a2a] underline-offset-4 hover:underline",
};

const sizes: Record<ButtonSize, string> = {
  default: "h-9 gap-2 rounded-lg px-3.5 text-sm",
  sm: "h-8 gap-1.5 rounded-md px-2.5 text-[13px]",
  xs: "h-7 gap-1.5 rounded-md px-2 text-xs",
  lg: "h-11 gap-2 rounded-lg px-5 text-sm",
  icon: "h-9 w-9 rounded-lg",
  "icon-sm": "h-7 w-7 rounded-md",
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex select-none items-center justify-center whitespace-nowrap font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f5f2ec] disabled:pointer-events-none disabled:opacity-45",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export function buttonStyles(variant: ButtonVariant = "default", size: ButtonSize = "default") {
  return cn(
    "inline-flex select-none items-center justify-center whitespace-nowrap font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#111111] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-45",
    variants[variant],
    sizes[size],
  );
}
