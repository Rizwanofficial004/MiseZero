import { SHADOW } from "@/engine/constants";
import type { StockMath } from "@/engine/shadowStock";
import type { RescueOption } from "@/engine/rescue";
import type { WasteRisk } from "@/engine/wasteRisk";

function num(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  return String(rounded);
}

export function explainStock(name: string, math: StockMath, unit: string): string[] {
  return [
    `${name}: expected ${num(math.expected)} ${unit} = confirmed ${num(math.lastConfirmedQty)} + deliveries ${num(math.delivered)} − recipe ${num(math.recipe)} − waste ${num(math.wasted)} − prep ${num(math.prep)}.`,
    `Range ${num(math.low)}–${num(math.high)} ${unit}. Half-width ${num(math.halfWidthPct)}% (base ${SHADOW.baseVariancePct} + ${math.daysSinceConfirm} days × ${SHADOW.dailyWidenPct}${math.conflict ? ` + conflict ${SHADOW.conflictExtraPct}` : ""}).`,
    `Confidence ${num(math.confidence)} = ${SHADOW.weights.recency} × recency ${num(math.recency)} + ${SHADOW.weights.completeness} × completeness ${num(math.completeness)} + ${SHADOW.weights.consistency} × consistency ${num(math.consistency)}, capped at ${SHADOW.confidenceCap}.`,
  ];
}

export function explainAction(name: string, risk: WasteRisk, option: RescueOption | undefined, unit: string): string {
  const choice = option ? `${option.label} recovers ${num(option.net)}` : "No feasible option";
  return `${name} has ${num(risk.surplus)} ${unit} surplus against ${num(risk.expectedUse)} ${unit} expected use. Value at risk ${num(risk.valueAtRisk)}. ${choice}.`;
}
