import { STORAGE_BUFFER_HOURS } from "@/engine/constants";
import { hoursUntil } from "@/lib/dates";
import type { CatalogProduct } from "@/store/types";

export type WindowStatus = "ok" | "act_now" | "do_not_serve";

export interface SafeWindow {
  actBy: string | null;
  status: WindowStatus;
  hoursToUseBy: number | null;
  hoursToActBy: number | null;
  bufferHours: number;
}

export function bufferHours(product: CatalogProduct): number {
  if (product.prepared) return STORAGE_BUFFER_HOURS.prepared;
  if (product.opened) return STORAGE_BUFFER_HOURS.opened;
  return STORAGE_BUFFER_HOURS[product.storageType];
}

export function safeWindow(product: CatalogProduct, useBy: string | null, now: Date): SafeWindow {
  const buffer = bufferHours(product);
  if (!useBy) {
    return { actBy: null, status: "ok", hoursToUseBy: null, hoursToActBy: null, bufferHours: buffer };
  }
  const actByDate = new Date(new Date(useBy).getTime() - buffer * 3_600_000);
  const hoursToUseBy = hoursUntil(useBy, now);
  const hoursToActBy = hoursUntil(actByDate.toISOString(), now);
  let status: WindowStatus = "ok";
  if (hoursToUseBy <= 0) status = "do_not_serve";
  else if (hoursToActBy <= 0) status = "act_now";
  return {
    actBy: actByDate.toISOString(),
    status,
    hoursToUseBy,
    hoursToActBy,
    bufferHours: buffer,
  };
}
