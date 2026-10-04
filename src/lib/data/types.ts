export type Priority = "high" | "medium" | "low";
export type DataSourceStatus = "connected" | "partial" | "pending" | "unavailable";
export type PosSystem = "square" | "toast" | "lightspeed" | "epos_now" | "manual" | "custom";
export type RiskClass = "low" | "watch" | "elevated" | "critical";
export type ProductState = "delivered" | "opened" | "prepared" | "stored" | "used" | "disposed";
export type WasteReason =
  | "expiry"
  | "overproduction"
  | "preparation_loss"
  | "damage"
  | "unsold"
  | "quality"
  | "demand_shortfall"
  | "other";
export type WasteDestination =
  | "collection"
  | "redistribution"
  | "disposal"
  | "repurposing"
  | "recycling"
  | "other";

export interface MoneyRange {
  min: number;
  max: number;
}

export interface QuantityEstimate {
  min: number;
  max: number;
  mostLikely: number;
  unit: string;
  confidence: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  supplier: string;
  unit: string;
  unitCost: number;
  useByDays: number;
  openedLifeHours?: number;
}

export interface TodayAction {
  id: string;
  priority: Priority;
  productName: string;
  category: string;
  estimate: QuantityEstimate;
  valueAtRisk: number;
  expectedImpact: MoneyRange;
  useBy: string;
  productDeadline: string;
  safetyWindowCloses: string;
  recommendedAction: string;
  reason: string;
  riskClass: RiskClass;
  expectedUsage?: { min: number; max: number; unit: string };
  probableSurplus?: { min: number; max: number; unit: string };
  explanation: string[];
  bindingConstraint: string;
  status: "pending" | "confirmed" | "accepted" | "modified" | "rejected";
}

export interface Alert {
  id: string;
  type: "stock_risk" | "safety_window" | "intake_review" | "integration" | "confirmation";
  priority: Priority;
  title: string;
  message: string;
  timestamp: string;
  productId?: string;
  read: boolean;
}

export interface IntakeRecord {
  id: string;
  source: "invoice" | "delivery_note" | "manual" | "scale" | "pos_export" | "voice" | "preparation" | "waste" | "confirmation";
  status: "processed" | "review" | "confirmed" | "failed";
  uploadedAt: string;
  supplier?: string;
  extractedLines: Array<{
    product: string;
    quantity: number;
    unit: string;
    unitCost?: number;
    confidence: number;
    deliveryTime?: string;
    needsConfirmation?: boolean;
    prompt?: string;
  }>;
  fileName?: string;
}

export interface InventoryItem {
  id: string;
  productId: string;
  productName: string;
  category: string;
  estimate: QuantityEstimate;
  valueAtRisk: number;
  useBy: string;
  safetyWindowCloses: string;
  lastDelivery: string;
  deliveredQty: number;
  recipeUsage: number;
  unrecordedShrinkage: { min: number; max: number };
  confirmationRequired: boolean;
  posLinked: boolean;
  riskClass: RiskClass;
  expectedUsage: { min: number; max: number };
  probableSurplus: { min: number; max: number };
  productState: ProductState;
  productDeadline: string;
  signals?: Array<{ source: string; detail: string; weight: "high" | "medium" | "low" }>;
}

export interface Recommendation {
  id: string;
  productName: string;
  action: string;
  actionType:
    | "reduce_order"
    | "reduce_production"
    | "use_recipe"
    | "freeze"
    | "markdown"
    | "confirm_stock"
    | "combined";
  priority: Priority;
  expectedValue: { min: number; max: number };
  confidence: number;
  forecastDemand?: { min: number; max: number };
  plannedProduction?: number;
  existingStock?: QuantityEstimate;
  reason: string;
  explanation: string[];
  bindingConstraint: string;
  safetyValidated: boolean;
  status: "pending" | "accepted" | "modified" | "rejected" | "expired";
  createdAt: string;
  options: Array<{
    id: string;
    label: string;
    consideration: string;
    deadline?: string;
    feasible: boolean;
    selected: boolean;
  }>;
}

export interface DataSource {
  id: string;
  name: string;
  type: "pos" | "invoice" | "scale" | "erp" | "manual" | "voice" | "preparation" | "waste";
  status: DataSourceStatus;
  posSystem?: PosSystem;
  lastSync?: string;
  mappingStatus: "mapped" | "partial" | "unmapped";
  notes: string;
  fieldsMapped: number;
  fieldsTotal: number;
}

export interface PosMapping {
  posSystem: PosSystem;
  displayName: string;
  menuItemField: string;
  quantityField: string;
  timestampField: string;
  exampleItems: Array<{
    posName: string;
    misezeroProduct: string;
    recipeLinked: boolean;
    confidence: number;
  }>;
  unmappedCount: number;
}

export interface OutcomeRecord {
  id: string;
  recommendationId: string;
  productName: string;
  recommendation: string;
  inventoryEstimate: string;
  confidence: number;
  forecastDemand: string;
  staffResponse: "accepted" | "rejected" | "modified";
  actualProduction?: number;
  actualSales?: number;
  actualWaste?: number;
  estimatedWasteAvoided: { min: number; max: number };
  expectedImpact: MoneyRange;
  commercialImpact: number;
  recordedAt: string;
}

export interface WasteEvent {
  id: string;
  productName: string;
  category: string;
  quantity: number;
  unit: string;
  value: number;
  recordedAt: string;
  reason: WasteReason;
  destination: WasteDestination;
  batchRef?: string;
  note?: string;
  predictedExposure?: string;
  linkedAction?: string;
}

export interface CalibrationMetric {
  label: string;
  value: number;
  unit: string;
  target: number;
  status: "good" | "warning" | "critical";
  description: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  period: "month";
  description: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
}

export interface PositioningPoint {
  title: string;
  detail: string;
}

export type StaffInputKind = "prepared_batch" | "waste" | "stock_confirmation" | "voice";

export interface StaffInputRecord {
  id: string;
  kind: StaffInputKind;
  recordedAt: string;
  staffName: string;
  summary: string;
  productName: string;
  quantity?: number;
  unit?: string;
  status: "passed_to_intake" | "needs_review";
  detail?: string;
}

export interface StockCheckPrompt {
  id: string;
  productName: string;
  unit: string;
  suggested: number;
  estimateLabel: string;
  deadline: string;
  prompt: string;
  reason: string;
}
