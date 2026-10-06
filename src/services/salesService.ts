import { parseSalesCsv, type ParsedSale, type RowError } from "@/engine/csv";
import { uid } from "@/lib/ids";
import { pause } from "@/services/delay";
import { useMiseStore } from "@/store/useMiseStore";
import type { Sale } from "@/store/types";

export async function previewSalesCsv(text: string): Promise<{ rows: ParsedSale[]; errors: RowError[] }> {
  await pause();
  return parseSalesCsv(text, useMiseStore.getState().recipes);
}

export async function confirmSales(rows: ParsedSale[]) {
  if (rows.length === 0) throw new Error("No valid sales rows to import");
  const sales: Sale[] = rows.map((row) => ({
    id: uid("sale"),
    date: row.date,
    menuItemName: row.menuItemName,
    recipeId: row.recipeId,
    qty: row.qty,
    source: "csv",
  }));
  await pause();
  useMiseStore.getState().addSales(sales);
}

export async function addManualSale(input: { menuItemName: string; qty: number; date: string }) {
  const recipe = useMiseStore.getState().recipes.find(
    (item) => item.menuItemName.toLowerCase() === input.menuItemName.toLowerCase(),
  );
  if (!recipe) throw new Error("Choose a menu item that has a recipe");
  if (!Number.isFinite(input.qty) || input.qty <= 0) throw new Error("Quantity must be above zero");
  if (Number.isNaN(new Date(input.date).getTime())) throw new Error("Date is invalid");
  await pause();
  useMiseStore.getState().addSales([
    {
      id: uid("sale"),
      date: new Date(input.date).toISOString(),
      menuItemName: recipe.menuItemName,
      recipeId: recipe.id,
      qty: input.qty,
      source: "manual",
    },
  ]);
}

export async function deleteSale(id: string) {
  await pause();
  useMiseStore.getState().deleteSale(id);
}
