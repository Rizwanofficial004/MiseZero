import { SHADOW } from "@/engine/constants";
import { daysBetween } from "@/lib/dates";
import { convert, sameFamily, type Unit } from "@/lib/units";
import type {
  CatalogProduct,
  Delivery,
  PrepRecord,
  Recipe,
  Sale,
  StockConfirmation,
  WasteEvent,
} from "@/store/types";

export interface Ledger {
  products: CatalogProduct[];
  recipes: Recipe[];
  deliveries: Delivery[];
  sales: Sale[];
  waste: WasteEvent[];
  preps: PrepRecord[];
  confirmations: StockConfirmation[];
  now: Date;
}

export interface SignalPresence {
  delivery: boolean;
  sales: boolean;
  waste: boolean;
  confirmation: boolean;
}

export interface StockMath {
  productId: string;
  expected: number;
  rawExpected: number;
  low: number;
  high: number;
  halfWidthPct: number;
  confidence: number;
  conflict: boolean;
  recency: number;
  completeness: number;
  consistency: number;
  signals: SignalPresence;
  lastConfirmedQty: number;
  confirmedAt: string | null;
  daysSinceConfirm: number;
  delivered: number;
  recipe: number;
  wasted: number;
  prep: number;
  useBy: string | null;
}

function qtyInProductUnit(qty: number, unit: Unit, product: CatalogProduct): number {
  if (!sameFamily(unit, product.unit)) return 0;
  return convert(qty, unit, product.unit);
}

function onOrAfter(iso: string, since: string | null): boolean {
  if (!since) return true;
  return new Date(iso).getTime() >= new Date(since).getTime();
}

function latestConfirmation(productId: string, rows: StockConfirmation[]): StockConfirmation | null {
  const mine = rows.filter((row) => row.productId === productId);
  if (mine.length === 0) return null;
  return mine.reduce((best, row) => (row.date > best.date ? row : best));
}

function recipeForSale(sale: Sale, recipes: Recipe[]): Recipe | undefined {
  if (sale.recipeId) return recipes.find((recipe) => recipe.id === sale.recipeId);
  const name = sale.menuItemName.trim().toLowerCase();
  return recipes.find((recipe) => recipe.menuItemName.trim().toLowerCase() === name);
}

export function recipeUsage(product: CatalogProduct, sale: Sale, recipes: Recipe[]): number {
  const recipe = recipeForSale(sale, recipes);
  if (!recipe) return 0;
  return recipe.lines
    .filter((line) => line.productId === product.id)
    .reduce((sum, line) => sum + qtyInProductUnit(line.qty, line.unit, product) * sale.qty, 0);
}

export function estimateProduct(product: CatalogProduct, ledger: Ledger): StockMath {
  const confirmation = latestConfirmation(product.id, ledger.confirmations);
  const since = confirmation?.date ?? null;
  const lastConfirmedQty = confirmation
    ? qtyInProductUnit(confirmation.qty, confirmation.unit, product)
    : 0;

  const delivered = ledger.deliveries
    .filter((delivery) => delivery.status === "confirmed" && onOrAfter(delivery.date, since))
    .flatMap((delivery) => delivery.lines)
    .filter((line) => line.productId === product.id)
    .reduce((sum, line) => sum + qtyInProductUnit(line.qty, line.unit, product), 0);

  const recipe = ledger.sales
    .filter((sale) => onOrAfter(sale.date, since))
    .reduce((sum, sale) => sum + recipeUsage(product, sale, ledger.recipes), 0);

  const wasted = ledger.waste
    .filter((event) => event.productId === product.id && onOrAfter(event.date, since))
    .reduce((sum, event) => sum + qtyInProductUnit(event.qty, event.unit, product), 0);

  const prep = ledger.preps
    .filter((event) => event.productId === product.id && onOrAfter(event.date, since))
    .reduce((sum, event) => sum + qtyInProductUnit(event.qty, event.unit, product), 0);

  const rawExpected = lastConfirmedQty + delivered - recipe - wasted - prep;
  const conflict = rawExpected < -1e-9;
  const expected = conflict ? 0 : rawExpected;

  const daysSinceConfirm = confirmation
    ? daysBetween(confirmation.date, ledger.now)
    : SHADOW.neverConfirmedDays;
  const halfWidthPct =
    SHADOW.baseVariancePct +
    daysSinceConfirm * SHADOW.dailyWidenPct +
    (conflict ? SHADOW.conflictExtraPct : 0);

  const span = expected * (halfWidthPct / 100);
  const low = conflict ? 0 : Math.max(0, expected - span);
  const high = conflict ? 0 : expected + span;

  const signals: SignalPresence = {
    delivery: ledger.deliveries.some(
      (delivery) => delivery.status === "confirmed" && delivery.lines.some((line) => line.productId === product.id),
    ),
    sales: ledger.sales.some((sale) => recipeUsage(product, sale, ledger.recipes) > 0),
    waste: ledger.waste.some((event) => event.productId === product.id),
    confirmation: confirmation !== null,
  };
  const present = Object.values(signals).filter(Boolean).length;
  const completeness = (present / 4) * 100;
  const recency = confirmation
    ? Math.max(SHADOW.recencyFloor, 100 - SHADOW.recencyDropPerDay * daysSinceConfirm)
    : SHADOW.neverConfirmedRecency;
  const consistency = conflict ? SHADOW.conflictConsistency : SHADOW.okConsistency;
  const confidence = Math.min(
    SHADOW.confidenceCap,
    SHADOW.weights.recency * recency +
      SHADOW.weights.completeness * completeness +
      SHADOW.weights.consistency * consistency,
  );

  const useByDates = ledger.deliveries
    .filter((delivery) => delivery.status === "confirmed")
    .flatMap((delivery) => delivery.lines)
    .filter((line) => line.productId === product.id && line.useBy)
    .map((line) => line.useBy)
    .sort();

  return {
    productId: product.id,
    expected,
    rawExpected,
    low,
    high,
    halfWidthPct,
    confidence,
    conflict,
    recency,
    completeness,
    consistency,
    signals,
    lastConfirmedQty,
    confirmedAt: confirmation?.date ?? null,
    daysSinceConfirm,
    delivered,
    recipe,
    wasted,
    prep,
    useBy: useByDates[0] ?? null,
  };
}

export function estimateAll(ledger: Ledger): StockMath[] {
  return ledger.products.map((product) => estimateProduct(product, ledger));
}
