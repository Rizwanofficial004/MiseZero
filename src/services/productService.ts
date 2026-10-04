import { pause } from "@/services/delay";
import { uid } from "@/lib/ids";
import { useMiseStore } from "@/store/useMiseStore";
import type { CatalogProduct, Supplier } from "@/store/types";

function requireText(value: string, label: string) {
  if (!value.trim()) throw new Error(`${label} is required`);
}

export async function listProducts() {
  await pause();
  return useMiseStore.getState().products;
}

export async function saveProduct(input: CatalogProduct) {
  requireText(input.name, "Name");
  if (!input.supplierId) throw new Error("Choose a supplier");
  if (!Number.isFinite(input.unitCost) || input.unitCost < 0) throw new Error("Unit cost must be zero or more");
  if (!Number.isFinite(input.shelfLifeDays) || input.shelfLifeDays <= 0) throw new Error("Shelf life must be above zero");
  await pause();
  useMiseStore.getState().saveProduct(input);
}

export async function deleteProduct(id: string) {
  const state = useMiseStore.getState();
  if (state.recipes.some((recipe) => recipe.lines.some((line) => line.productId === id))) {
    throw new Error("Remove this product from its recipes first");
  }
  await pause();
  state.deleteProduct(id);
}

export async function listSuppliers() {
  await pause();
  return useMiseStore.getState().suppliers;
}

export async function saveSupplier(input: Supplier) {
  requireText(input.name, "Supplier name");
  await pause();
  useMiseStore.getState().saveSupplier(input);
}

export async function deleteSupplier(id: string) {
  const state = useMiseStore.getState();
  if (state.products.some((product) => product.supplierId === id)) {
    throw new Error("Reassign products before deleting this supplier");
  }
  await pause();
  state.deleteSupplier(id);
}

export function blankProduct(supplierId: string): CatalogProduct {
  return {
    id: uid("prod"),
    name: "",
    category: "General",
    supplierId,
    unit: "each",
    unitCost: 0,
    shelfLifeDays: 3,
    storageType: "chilled",
    opened: false,
    prepared: false,
    defaultDailyUse: 0,
    confirmValueThreshold: 8,
    freezable: false,
  };
}
