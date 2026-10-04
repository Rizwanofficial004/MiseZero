import { parse } from "papaparse";
import type { Unit } from "@/lib/units";
import { sameFamily } from "@/lib/units";
import type { CatalogProduct, DeliveryLine, Recipe, Sale } from "@/store/types";

export interface RowError {
  row: number;
  message: string;
}

export interface ParsedSale {
  date: string;
  menuItemName: string;
  qty: number;
  recipeId: string | null;
}

const UNITS = new Set<Unit>(["g", "kg", "ml", "L", "each"]);

function asUnit(value: string): Unit | null {
  const text = value.trim();
  if (text === "l") return "L";
  if (UNITS.has(text as Unit)) return text as Unit;
  return null;
}

function cell(row: Record<string, string>, names: string[]): string {
  const key = Object.keys(row).find((item) => names.includes(item.trim().toLowerCase()));
  return key ? String(row[key] ?? "").trim() : "";
}

export function parseSalesCsv(
  text: string,
  recipes: Recipe[],
): { rows: ParsedSale[]; errors: RowError[] } {
  const table = parse<Record<string, string>>(text, { header: true, skipEmptyLines: true });
  const rows: ParsedSale[] = [];
  const errors: RowError[] = [];
  table.data.forEach((row, index) => {
    const rowNumber = index + 2;
    const dateText = cell(row, ["date", "timestamp", "sold at"]);
    const item = cell(row, ["item", "menu item", "product", "name"]);
    const qtyText = cell(row, ["qty", "quantity", "qty sold"]);
    const date = new Date(dateText);
    if (!dateText || Number.isNaN(date.getTime())) {
      errors.push({ row: rowNumber, message: "Date is missing or invalid" });
      return;
    }
    if (!item) {
      errors.push({ row: rowNumber, message: "Menu item is missing" });
      return;
    }
    const qty = Number(qtyText);
    if (!qtyText || !Number.isFinite(qty) || qty <= 0) {
      errors.push({ row: rowNumber, message: "Quantity must be a number above zero" });
      return;
    }
    const recipe = recipes.find((entry) => entry.menuItemName.toLowerCase() === item.toLowerCase());
    if (!recipe) {
      errors.push({ row: rowNumber, message: `No recipe is mapped to “${item}”` });
      return;
    }
    rows.push({ date: date.toISOString(), menuItemName: recipe.menuItemName, qty, recipeId: recipe.id });
  });
  table.errors.forEach((error) => {
    errors.push({ row: (error.row ?? 0) + 2, message: error.message });
  });
  return { rows, errors };
}

export function parseInvoiceCsv(
  text: string,
  products: CatalogProduct[],
): { supplierName: string; date: string; lines: DeliveryLine[]; errors: RowError[] } {
  const table = parse<Record<string, string>>(text, { header: true, skipEmptyLines: true });
  const lines: DeliveryLine[] = [];
  const errors: RowError[] = [];
  let supplierName = "";
  let date = "";
  table.data.forEach((row, index) => {
    const rowNumber = index + 2;
    const productName = cell(row, ["product", "item", "name"]);
    const qtyText = cell(row, ["qty", "quantity"]);
    const unitText = cell(row, ["unit"]);
    const useByText = cell(row, ["useby", "use by", "use-by", "expiry"]);
    const supplier = cell(row, ["supplier"]);
    const dateText = cell(row, ["date"]);
    const costText = cell(row, ["cost", "unit cost", "unitcost"]);
    const batch = cell(row, ["batch", "batch ref"]);
    if (supplier && !supplierName) supplierName = supplier;
    if (dateText && !date) date = new Date(dateText).toISOString();
    const qty = Number(qtyText);
    const unit = asUnit(unitText);
    const useBy = new Date(useByText);
    if (!productName || !Number.isFinite(qty) || qty <= 0 || !unit || Number.isNaN(useBy.getTime())) {
      errors.push({ row: rowNumber, message: "Each invoice row needs a product, quantity, unit, and use-by date" });
      return;
    }
    const product = products.find((item) => item.name.toLowerCase() === productName.toLowerCase());
    if (product && !sameFamily(unit, product.unit)) {
      errors.push({ row: rowNumber, message: `${productName} cannot be recorded in ${unit}` });
      return;
    }
    lines.push({
      id: `line_${rowNumber}`,
      productId: product?.id ?? "",
      productName: product?.name ?? productName,
      qty,
      unit,
      unitCost: costText ? Number(costText) || product?.unitCost || 0 : product?.unitCost || 0,
      batch,
      useBy: useBy.toISOString(),
    });
  });
  return { supplierName, date: date || new Date().toISOString(), lines, errors };
}
