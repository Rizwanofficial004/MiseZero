import { SHADOW, SHADOW_FORMULA } from "@/engine/constants";
import { explainAction, explainStock } from "@/engine/explain";
import { buildEvidence } from "@/engine/evidence";
import { rescueOptions, topFeasible, urgency } from "@/engine/rescue";
import { safeWindow } from "@/engine/safeWindow";
import { estimateProduct, type Ledger, type StockMath } from "@/engine/shadowStock";
import { wasteRisk, type RiskBand } from "@/engine/wasteRisk";
import { addDays, formatVenue } from "@/lib/dates";
import type { Priority, RiskClass } from "@/lib/data/types";
import type { MiseData, StoredAction } from "@/store/types";

export interface ProductView {
  productId: string;
  productName: string;
  category: string;
  unit: string;
  math: StockMath;
  risk: RiskBand;
  riskClass: RiskClass;
  dailyUse: number;
  expectedUse: number;
  surplus: number;
  valueAtRisk: number;
  useBy: string | null;
  actBy: string | null;
  status: "ok" | "act_now" | "do_not_serve";
  hoursToActBy: number | null;
  flags: string[];
  confirmationRequired: boolean;
  posLinked: boolean;
  explanation: string[];
  formula: string;
  score: number;
  priority: Priority;
  options: ReturnType<typeof rescueOptions>;
  signals: Array<{ source: string; detail: string; weight: "high" | "medium" | "low" }>;
}

export interface HubAction {
  id: string;
  productId: string;
  productName: string;
  category: string;
  priority: Priority;
  unit: string;
  low: number;
  high: number;
  expected: number;
  confidence: number;
  valueAtRisk: number;
  impact: number;
  useByLabel: string;
  actByLabel: string;
  title: string;
  reason: string;
  riskClass: RiskClass;
  expectedUse: number;
  surplus: number;
  explanation: string[];
  bindingConstraint: string;
  status: "pending" | "accepted" | "modified" | "rejected";
  optionId: string;
  score: number;
}

export interface RescueCard {
  id: string;
  productId: string;
  productName: string;
  priority: Priority;
  action: string;
  actionType: "markdown" | "freeze" | "use_recipe" | "combined" | "confirm_stock";
  expectedValue: number;
  confidence: number;
  reason: string;
  explanation: string[];
  bindingConstraint: string;
  safetyValidated: boolean;
  status: "pending" | "accepted" | "modified" | "rejected";
  options: Array<{
    id: string;
    label: string;
    consideration: string;
    deadline?: string;
    feasible: boolean;
    selected: boolean;
    net: number;
  }>;
}

function bandClass(band: RiskBand): RiskClass {
  if (band === "med") return "watch";
  if (band === "high") return "elevated";
  return band;
}

function priorityFor(view: Pick<ProductView, "status" | "risk" | "hoursToActBy">): Priority {
  if (view.status === "do_not_serve" || view.risk === "critical" || (view.hoursToActBy !== null && view.hoursToActBy < 12)) {
    return "high";
  }
  if (view.risk === "high" || (view.hoursToActBy !== null && view.hoursToActBy < 36)) return "medium";
  return "low";
}

export function productViews(data: MiseData, now: Date): ProductView[] {
  const ledger: Ledger = { ...data, now };
  return data.products.map((product) => {
    const math = estimateProduct(product, ledger);
    const window = safeWindow(product, math.useBy, now);
    const risk = wasteRisk(product, math, data.sales, data.recipes, window);
    const flags: string[] = [];
    if (math.halfWidthPct > SHADOW.wideRangePct) flags.push("wide_range");
    if (math.confidence < SHADOW.lowConfidence) flags.push("low_confidence");
    if (risk.valueAtRisk > product.confirmValueThreshold) flags.push("value_at_risk");
    if (window.hoursToUseBy !== null && window.hoursToUseBy > 0 && window.hoursToUseBy <= SHADOW.urgentUseByHours) {
      flags.push("use_by_soon");
    }
    if (window.status === "do_not_serve") flags.push("do_not_serve");
    const options = rescueOptions(product, risk, window);
    const view: ProductView = {
      productId: product.id,
      productName: product.name,
      category: product.category,
      unit: product.unit,
      math,
      risk: risk.band,
      riskClass: bandClass(risk.band),
      dailyUse: risk.dailyUse,
      expectedUse: risk.expectedUse,
      surplus: risk.surplus,
      valueAtRisk: risk.valueAtRisk,
      useBy: math.useBy,
      actBy: window.actBy,
      status: window.status,
      hoursToActBy: window.hoursToActBy,
      flags,
      confirmationRequired: flags.length > 0,
      posLinked: data.recipes.some((recipe) => recipe.lines.some((line) => line.productId === product.id)),
      explanation: explainStock(product.name, math, product.unit),
      formula: SHADOW_FORMULA,
      score: risk.valueAtRisk * urgency(window.hoursToActBy),
      priority: "low",
      options,
      signals: [
        { source: "Deliveries", detail: `${round(math.delivered)} ${product.unit} confirmed`, weight: "high" },
        { source: "Recipe use", detail: `${round(math.recipe)} ${product.unit} from sales`, weight: "high" },
        { source: "Waste", detail: `${round(math.wasted)} ${product.unit} recorded`, weight: "medium" },
        { source: "Prep", detail: `${round(math.prep)} ${product.unit}`, weight: "low" },
        {
          source: "Confirmation",
          detail: math.confirmedAt ? `${round(math.lastConfirmedQty)} ${product.unit}` : "None yet",
          weight: "high",
        },
      ],
    };
    view.priority = priorityFor(view);
    return view;
  });
}

function storedFor(actions: StoredAction[], productId: string): StoredAction | undefined {
  return actions.find((action) => action.productId === productId);
}

function hubStatus(action: StoredAction | undefined): HubAction["status"] {
  if (!action) return "pending";
  if (action.status === "dismissed") return "rejected";
  if (action.status === "done") return "accepted";
  return action.status;
}

export function hubActions(views: ProductView[], actions: StoredAction[], timeZone: string): HubAction[] {
  return views
    .filter((view) => view.surplus > 0 || view.status === "do_not_serve" || view.flags.includes("use_by_soon"))
    .filter((view) => {
      const stored = storedFor(actions, view.productId);
      return !stored || (stored.status !== "dismissed" && stored.status !== "done");
    })
    .map((view) => {
      const stored = storedFor(actions, view.productId);
      const top = view.options.find((option) => option.id === stored?.optionId) ?? topFeasible(view.options);
      return {
        id: stored?.id ?? `hub_${view.productId}`,
        productId: view.productId,
        productName: view.productName,
        category: view.category,
        priority: view.priority,
        unit: view.unit,
        low: view.math.low,
        high: view.math.high,
        expected: view.math.expected,
        confidence: view.math.confidence,
        valueAtRisk: view.valueAtRisk,
        impact: top?.net ?? 0,
        useByLabel: view.useBy ? formatVenue(view.useBy, timeZone) : "No use-by",
        actByLabel: view.actBy ? formatVenue(view.actBy, timeZone) : "No deadline",
        title: stored?.title ?? (top ? `${top.label} · ${view.productName}` : `Review ${view.productName}`),
        reason: explainAction(view.productName, {
          dailyUse: view.dailyUse,
          remainingDays: 0,
          expectedUse: view.expectedUse,
          surplus: view.surplus,
          share: 0,
          band: view.risk,
          valueAtRisk: view.valueAtRisk,
        }, top, view.unit),
        riskClass: view.riskClass,
        expectedUse: view.expectedUse,
        surplus: view.surplus,
        explanation: view.explanation,
        bindingConstraint: view.status === "do_not_serve" ? "Use-by has passed. Do not serve." : "Use-by and storage buffer",
        status: hubStatus(stored),
        optionId: stored?.optionId ?? top?.id ?? "discard",
        score: view.score,
      };
    })
    .sort((a, b) => b.score - a.score);
}

function rescueStatus(stored: StoredAction | undefined): RescueCard["status"] {
  if (!stored || stored.status === "accepted" || stored.status === "done") return stored ? "accepted" : "pending";
  if (stored.status === "dismissed") return "rejected";
  if (stored.status === "modified") return "modified";
  return "pending";
}

export function rescueCards(views: ProductView[], actions: StoredAction[], timeZone: string): RescueCard[] {
  return views
    .filter((view) => view.surplus > 0 || view.status !== "ok")
    .map((view) => {
      const stored = storedFor(actions, view.productId);
      const top = topFeasible(view.options);
      const selectedId = stored?.optionId ?? top?.id;
      const actionType: RescueCard["actionType"] =
        selectedId === "discount" ? "markdown" : selectedId === "freeze" ? "freeze" : selectedId === "repurpose" ? "use_recipe" : "combined";
      return {
        id: view.productId,
        productId: view.productId,
        productName: view.productName,
        priority: view.priority,
        action: stored?.title ?? (top ? top.label : "Review options"),
        actionType,
        expectedValue: top?.net ?? 0,
        confidence: view.math.confidence,
        reason: view.explanation[0] ?? "",
        explanation: view.explanation,
        bindingConstraint: view.status === "do_not_serve" ? "Use-by has passed. Do not serve." : "Sell and discount stay inside the use-by",
        safetyValidated: view.status !== "do_not_serve",
        status: rescueStatus(stored),
        options: view.options.map((option) => ({
          id: option.id,
          label: option.label,
          consideration: `${option.consideration} Net ${round(option.net)}.`,
          deadline: view.actBy ? formatVenue(view.actBy, timeZone) : undefined,
          feasible: option.feasible,
          selected: option.id === selectedId && option.feasible,
          net: option.net,
        })),
      };
    })
    .sort((a, b) => b.expectedValue - a.expectedValue);
}

export function buildDashboard(data: MiseData, now: Date) {
  const views = productViews(data, now);
  const hub = hubActions(views, data.actions, data.venue.timezone);
  const rescues = rescueCards(views, data.actions, data.venue.timezone);
  const from = addDays(now, -13, 0);
  const to = addDays(now, 1, 23);
  const evidence = buildEvidence(data.waste, data.actions, data.products, from, to);
  const avgConfidence = views.length
    ? views.reduce((sum, view) => sum + view.math.confidence, 0) / views.length
    : 0;
  const alerts = [
    ...views
      .filter((view) => view.flags.length > 0)
      .map((view) => ({
        id: `alert_${view.productId}`,
        type: view.flags.includes("do_not_serve") || view.flags.includes("use_by_soon") ? "safety_window" as const : "stock_risk" as const,
        priority: view.priority,
        title: view.productName,
        message: view.explanation[0] ?? "",
        timestamp: formatVenue(now.toISOString(), data.venue.timezone),
        read: false,
      })),
    ...data.deliveries
      .filter((delivery) => delivery.status === "draft")
      .map((delivery) => ({
        id: `alert_${delivery.id}`,
        type: "intake_review" as const,
        priority: "medium" as const,
        title: delivery.supplierName || delivery.fileName || "Invoice draft",
        message: "Extracted lines stay out of stock until you confirm them.",
        timestamp: formatVenue(delivery.date, data.venue.timezone),
        read: false,
      })),
  ];
  const high = views.filter((view) => view.math.confidence >= 85).length;
  const mid = views.filter((view) => view.math.confidence >= 70 && view.math.confidence < 85).length;
  const low = views.length - high - mid;
  return {
    views,
    hub,
    rescues,
    evidence,
    alerts,
    avgConfidence,
    confirmationsNeeded: views.filter((view) => view.confirmationRequired).length,
    valueProtected: evidence.valueProtected,
    confidenceMix: [
      { name: "High", value: high, fill: "#1f9a64" },
      { name: "Medium", value: mid, fill: "#f5b942" },
      { name: "Low", value: low, fill: "#e11d48" },
    ],
    week: evidence.byDay.map((point) => ({
      day: point.day.slice(5),
      waste: round(point.value),
      protected: round(
        data.actions
          .filter((action) => action.outcome && action.outcome.recordedAt.slice(0, 10) === point.day)
          .reduce((sum, action) => sum + (action.outcome?.value ?? 0), 0),
      ),
    })),
  };
}

export function round(value: number): number {
  return Math.round(value * 100) / 100;
}
