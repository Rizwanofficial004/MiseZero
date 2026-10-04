import { cn, confidenceColor, priorityColor } from "@/lib/utils";
import type { Priority } from "@/lib/data/types";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "priority" | "confidence" | "success" | "warning";
  priority?: Priority;
  confidence?: number;
}

export function Badge({
  children,
  className,
  variant = "default",
  priority,
  confidence,
}: BadgeProps) {
  let styles = "bg-mint-50 text-ink-muted border-mint-200";

  if (variant === "priority" && priority) {
    styles = priorityColor(priority);
  } else if (variant === "confidence" && confidence !== undefined) {
    styles = confidenceColor(confidence);
  } else if (variant === "success") {
    styles = "bg-mint-100 text-mint-700 border-mint-200";
  } else if (variant === "warning") {
    styles = "bg-amber-50 text-amber-700 border-amber-200";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]",
        styles,
        className,
      )}
    >
      {children}
    </span>
  );
}
