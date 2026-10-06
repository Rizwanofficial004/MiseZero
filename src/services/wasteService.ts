import { uid } from "@/lib/ids";
import { pause } from "@/services/delay";
import { useMiseStore } from "@/store/useMiseStore";
import type { WasteDestination, WasteEvent, WasteReason } from "@/store/types";

export async function recordWaste(input: {
  id?: string;
  productId: string;
  qty: number;
  reason: WasteReason;
  destination: WasteDestination;
  note: string;
  date?: string;
}) {
  const product = useMiseStore.getState().products.find((item) => item.id === input.productId);
  if (!product) throw new Error("Choose a product");
  if (!Number.isFinite(input.qty) || input.qty <= 0) throw new Error("Quantity must be above zero");
  const event: WasteEvent = {
    id: input.id ?? uid("waste"),
    productId: product.id,
    qty: input.qty,
    unit: product.unit,
    reason: input.reason,
    destination: input.destination,
    date: input.date ?? new Date().toISOString(),
    note: input.note,
    unitCost: product.unitCost,
  };
  await pause();
  useMiseStore.getState().saveWaste(event);
}

export async function deleteWaste(id: string) {
  await pause();
  useMiseStore.getState().deleteWaste(id);
}
