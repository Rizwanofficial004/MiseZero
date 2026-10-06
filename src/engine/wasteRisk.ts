import { RISK_SHARE } from "@/engine/constants";
import { dayKey } from "@/lib/dates";
import { recipeUsage, type StockMath } from "@/engine/shadowStock";
import type { CatalogProduct, Recipe, Sale } from "@/store/types";
import type { SafeWindow } from "@/engine/safeWindow";

export type RiskBand = "low" | "med" | "high" | "critical";

export interface WasteRisk {
  dailyUse: number;
  remainingDays: number;
  expectedUse: number;
  surplus: number;
  share: number;
  band: RiskBand;
  valueAtRisk: number;
}

export function dailyUseRate(product: CatalogProduct, sales: Sale[], recipes: Recipe[]): number {
  let total = 0;
  const days = new Set<string>();
  for (const sale of sales) {
    const used = recipeUsage(product, sale, recipes);
    if (used <= 0) continue;
    total += used;
    days.add(dayKey(sale.date));
  }
  if (days.size === 0) return product.defaultDailyUse;
  return total / days.size;
}

export function wasteRisk(
  product: CatalogProduct,
  math: StockMath,
  sales: Sale[],
  recipes: Recipe[],
  window: SafeWindow,
): WasteRisk {
  const dailyUse = dailyUseRate(product, sales, recipes);
  const remainingDays =
    window.hoursToUseBy === null ? product.shelfLifeDays : Math.max(0, window.hoursToUseBy / 24);
  const expectedUse = dailyUse * remainingDays;
  const surplus = Math.max(0, math.expected - expectedUse);
  const share = math.expected > 0 ? surplus / math.expected : 0;
  let band: RiskBand = "low";
  if (window.status === "do_not_serve" && math.expected > 0) band = "critical";
  else if (share >= RISK_SHARE.high) band = "critical";
  else if (share >= RISK_SHARE.med) band = "high";
  else if (share >= RISK_SHARE.low) band = "med";
  return {
    dailyUse,
    remainingDays,
    expectedUse,
    surplus,
    share,
    band,
    valueAtRisk: surplus * product.unitCost,
  };
}
