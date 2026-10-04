import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = "GBP") {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency,
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatRange(min: number, max: number, unit: string) {
  return `${min}–${max} ${unit}`;
}

export function formatMoneyRange(min: number, max: number) {
  return `${formatCurrency(min)}–${formatCurrency(max)}`;
}

export function confidenceColor(confidence: number) {
  if (confidence >= 85) return "text-mint-700 bg-mint-100 border-mint-200";
  if (confidence >= 70) return "text-amber-700 bg-amber-50 border-amber-200";
  return "text-rose-700 bg-rose-50 border-rose-200";
}

export function priorityColor(priority: "high" | "medium" | "low") {
  switch (priority) {
    case "high":
      return "text-rose-700 bg-rose-50 border-rose-100";
    case "medium":
      return "text-amber-800 bg-amber-50 border-amber-100";
    case "low":
      return "text-mint-700 bg-mint-100 border-mint-200";
    default: {
      const _exhaustive: never = priority;
      return _exhaustive;
    }
  }
}
