import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger" | "mint";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-mint-600 text-white hover:bg-mint-700",
  mint: "bg-mint-100 text-mint-700 hover:bg-mint-200",
  secondary: "bg-ink text-white hover:bg-ink/90",
  ghost: "text-ink-muted hover:bg-mint-100 hover:text-ink",
  outline: "border border-mint-200 bg-white text-ink hover:bg-mint-50 hover:border-mint-300",
  danger: "bg-rose-500 text-white hover:bg-rose-600",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs rounded-lg",
  md: "h-9 px-3.5 text-sm rounded-lg",
  lg: "h-11 px-5 text-sm rounded-lg",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-colors duration-200 disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
