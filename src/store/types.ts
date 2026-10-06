import type { Unit } from "@/lib/units";

export type StorageType = "chilled" | "frozen" | "ambient";

export interface Venue {
  name: string;
  type: string;
  city: string;
  timezone: string;
  hoursOpen: string;
  hoursClose: string;
  productionEnds: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
}

export interface CatalogProduct {
  id: string;
  name: string;
  category: string;
  supplierId: string;
  unit: Unit;
  unitCost: number;
  shelfLifeDays: number;
  storageType: StorageType;
  opened: boolean;
  prepared: boolean;
  defaultDailyUse: number;
  confirmValueThreshold: number;
  freezable: boolean;
}

export interface RecipeLine {
  productId: string;
  qty: number;
  unit: Unit;
}

export interface Recipe {
  id: string;
  name: string;
  menuItemName: string;
  lines: RecipeLine[];
}

export interface DeliveryLine {
  id: string;
  productId: string;
  productName: string;
  qty: number;
  unit: Unit;
  unitCost: number;
  batch: string;
  useBy: string;
}

export interface Delivery {
  id: string;
  supplierId: string;
  supplierName: string;
  date: string;
  status: "draft" | "confirmed";
  source: "manual" | "csv" | "ocr";
  fileId?: string;
  fileName?: string;
  lines: DeliveryLine[];
}

export interface Sale {
  id: string;
  date: string;
  menuItemName: string;
  recipeId: string | null;
  qty: number;
  source: "manual" | "csv";
}

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

export interface WasteEvent {
  id: string;
  productId: string;
  qty: number;
  unit: Unit;
  reason: WasteReason;
  destination: WasteDestination;
  date: string;
  note: string;
  unitCost: number;
}

export interface PrepRecord {
  id: string;
  productId: string;
  qty: number;
  unit: Unit;
  date: string;
  note: string;
}

export interface StockConfirmation {
  id: string;
  productId: string;
  qty: number;
  unit: Unit;
  date: string;
}

export type ActionStatus = "accepted" | "modified" | "dismissed" | "done";

export interface ActionOutcome {
  qtySaved: number;
  qtyWasted: number;
  value: number;
  recordedAt: string;
}

export interface StoredAction {
  id: string;
  productId: string;
  optionId: string;
  title: string;
  detail: string;
  status: ActionStatus;
  modification: string;
  createdAt: string;
  outcome?: ActionOutcome;
}

export interface ActivityEntry {
  id: string;
  at: string;
  message: string;
  entity: string;
}

export interface PosMapping {
  id: string;
  menuItemName: string;
  recipeId: string | null;
}

export interface VoiceNote {
  id: string;
  text: string;
  at: string;
  productId: string | null;
  productName: string;
  qty: number | null;
  unit: Unit | null;
  event: string;
  status: "passed_to_intake" | "needs_review";
}

export interface Session {
  email: string;
  name: string;
}

export interface MiseData {
  venue: Venue;
  suppliers: Supplier[];
  products: CatalogProduct[];
  recipes: Recipe[];
  deliveries: Delivery[];
  sales: Sale[];
  waste: WasteEvent[];
  preps: PrepRecord[];
  confirmations: StockConfirmation[];
  actions: StoredAction[];
  activity: ActivityEntry[];
  posMappings: PosMapping[];
  voiceNotes: VoiceNote[];
  session: Session | null;
}
