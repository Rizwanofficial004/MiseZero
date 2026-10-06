import type { CatalogProduct } from "@/store/types";
import type { SafeWindow } from "@/engine/safeWindow";
import type { WasteRisk } from "@/engine/wasteRisk";

export interface RescueOption {
  id: "discount" | "staff_meal" | "repurpose" | "freeze" | "donate" | "discard";
  label: string;
  consideration: string;
  feasible: boolean;
  recovered: number;
  effort: number;
  net: number;
}

export function rescueOptions(product: CatalogProduct, risk: WasteRisk, window: SafeWindow): RescueOption[] {
  const blocked = window.status === "do_not_serve";
  const hours = window.hoursToUseBy;
  const cost = risk.valueAtRisk;
  const specs: Array<Omit<RescueOption, "net">> = [
    {
      id: "discount",
      label: "Discount and sell",
      consideration: "Recover part of the cost by selling before the use-by.",
      feasible: !blocked,
      recovered: cost * 0.55,
      effort: 0.4,
    },
    {
      id: "staff_meal",
      label: "Staff meal",
      consideration: "Use a portion in staff meals while it is still safe to serve.",
      feasible: !blocked,
      recovered: cost * 0.25,
      effort: 0.3,
    },
    {
      id: "repurpose",
      label: "Repurpose",
      consideration: "Move it into a recipe that can use it before the deadline.",
      feasible: !blocked,
      recovered: cost * 0.4,
      effort: 1.2,
    },
    {
      id: "freeze",
      label: "Freeze",
      consideration: "Freeze only when the product is eligible.",
      feasible: product.freezable && !blocked,
      recovered: cost * 0.7,
      effort: 0.6,
    },
    {
      id: "donate",
      label: "Donate",
      consideration: "Offer it for collection while enough life remains.",
      feasible: !blocked && hours !== null && hours > 4,
      recovered: cost * 0.15,
      effort: 0.8,
    },
    {
      id: "discard",
      label: "Discard",
      consideration: "Record the loss when no safe use remains.",
      feasible: true,
      recovered: 0,
      effort: 0.2,
    },
  ];
  return specs
    .map((option) => ({ ...option, net: option.recovered - option.effort }))
    .sort((a, b) => Number(b.feasible) - Number(a.feasible) || b.net - a.net);
}

export function topFeasible(options: RescueOption[]): RescueOption | undefined {
  return options.find((option) => option.feasible);
}

export function urgency(hoursToActBy: number | null): number {
  if (hoursToActBy === null) return 1;
  if (hoursToActBy <= 0) return 3;
  if (hoursToActBy >= 72) return 1;
  return 1 + (72 - hoursToActBy) / 72;
}
