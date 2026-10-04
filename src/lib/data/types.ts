export type Priority = "high" | "medium" | "low";
export type DataSourceStatus = "connected" | "partial" | "pending" | "unavailable";
export type PosSystem = "square" | "toast" | "lightspeed" | "epos_now" | "manual" | "custom";

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
  useBy: string;
  safetyWindowCloses: string;
  recommendedAction: string;
  explanation: string[];
  bindingConstraint: string;
  status: "pending" | "confirmed" | "accepted" | "rejected";
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
  source: "invoice" | "delivery_note" | "manual" | "scale" | "pos_export";
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
}

export interface Recommendation {
  id: string;
  productName: string;
  action: string;
  actionType: "reduce_order" | "reduce_production" | "use_recipe" | "freeze" | "markdown" | "confirm_stock";
  priority: Priority;
  expectedValue: { min: number; max: number };
  confidence: number;
  forecastDemand?: { min: number; max: number };
  plannedProduction?: number;
  existingStock?: QuantityEstimate;
  explanation: string[];
  bindingConstraint: string;
  safetyValidated: boolean;
  status: "pending" | "accepted" | "rejected" | "expired";
  createdAt: string;
}

export interface DataSource {
  id: string;
  name: string;
  type: "pos" | "invoice" | "scale" | "erp" | "manual";
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
  commercialImpact: number;
  recordedAt: string;
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
