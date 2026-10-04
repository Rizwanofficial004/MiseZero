import { uid } from "@/lib/ids";
import { pause } from "@/services/delay";
import { useMiseStore } from "@/store/useMiseStore";
import type { Unit } from "@/lib/units";

export async function confirmStock(productId: string, qty: number, unit?: Unit) {
  const product = useMiseStore.getState().products.find((item) => item.id === productId);
  if (!product) throw new Error("Product not found");
  if (!Number.isFinite(qty) || qty < 0) throw new Error("Enter the quantity you counted");
  await pause();
  useMiseStore.getState().addConfirmation({
    id: uid("count"),
    productId,
    qty,
    unit: unit ?? product.unit,
    date: new Date().toISOString(),
  });
}

export async function recordPrep(productId: string, qty: number, note: string) {
  const product = useMiseStore.getState().products.find((item) => item.id === productId);
  if (!product) throw new Error("Choose a product");
  if (!Number.isFinite(qty) || qty <= 0) throw new Error("Quantity must be above zero");
  await pause();
  useMiseStore.getState().addPrep({
    id: uid("prep"),
    productId,
    qty,
    unit: product.unit,
    date: new Date().toISOString(),
    note,
  });
}
