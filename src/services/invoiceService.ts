import { parseInvoiceCsv } from "@/engine/csv";
import { saveBlob } from "@/lib/files";
import { uid } from "@/lib/ids";
import { pause } from "@/services/delay";
import { extractInvoice } from "@/services/aiService";
import { useMiseStore } from "@/store/useMiseStore";
import type { Delivery, DeliveryLine } from "@/store/types";

export async function listDeliveries() {
  await pause();
  return useMiseStore.getState().deliveries;
}

export async function saveManualDelivery(input: Omit<Delivery, "id" | "status" | "source"> & { id?: string }) {
  if (!input.supplierName.trim()) throw new Error("Supplier is required");
  if (input.lines.length === 0) throw new Error("Add at least one line");
  validateLines(input.lines);
  await pause();
  useMiseStore.getState().saveDelivery({
    ...input,
    id: input.id ?? uid("del"),
    status: "draft",
    source: "manual",
  });
}

export async function confirmDelivery(id: string) {
  const delivery = useMiseStore.getState().deliveries.find((item) => item.id === id);
  if (!delivery) throw new Error("Delivery not found");
  validateLines(delivery.lines);
  await pause();
  useMiseStore.getState().saveDelivery({ ...delivery, status: "confirmed" });
}

export async function updateDeliveryLines(id: string, lines: DeliveryLine[]) {
  const delivery = useMiseStore.getState().deliveries.find((item) => item.id === id);
  if (!delivery) throw new Error("Delivery not found");
  if (delivery.status === "confirmed") throw new Error("Confirmed deliveries are locked");
  await pause();
  useMiseStore.getState().saveDelivery({ ...delivery, lines });
}

export async function deleteDelivery(id: string) {
  await pause();
  useMiseStore.getState().deleteDelivery(id);
}

export async function importInvoiceFile(file: File) {
  const id = uid("file");
  await saveBlob(id, file, file.name);
  const state = useMiseStore.getState();
  const isCsv = file.name.toLowerCase().endsWith(".csv") || file.type.includes("csv");
  if (isCsv) {
    const text = await file.text();
    const parsed = parseInvoiceCsv(text, state.products);
    if (parsed.lines.length === 0) throw new Error(parsed.errors[0]?.message ?? "No invoice rows found");
    const delivery: Delivery = {
      id: uid("del"),
      supplierId: "",
      supplierName: parsed.supplierName || "Uploaded invoice",
      date: parsed.date,
      status: "draft",
      source: "csv",
      fileId: id,
      fileName: file.name,
      lines: parsed.lines,
    };
    state.saveDelivery(delivery);
    return delivery;
  }
  const lines = await extractInvoice(file.name);
  const delivery: Delivery = {
    id: uid("del"),
    supplierId: "sup_dairy",
    supplierName: "Northvale Dairy",
    date: new Date().toISOString(),
    status: "draft",
    source: "ocr",
    fileId: id,
    fileName: file.name,
    lines,
  };
  useMiseStore.getState().saveDelivery(delivery);
  return delivery;
}

function validateLines(lines: DeliveryLine[]) {
  if (lines.some((line) => !line.productId)) throw new Error("Match every line to a product before confirming");
  if (lines.some((line) => !Number.isFinite(line.qty) || line.qty <= 0)) throw new Error("Quantities must be above zero");
  if (lines.some((line) => !line.useBy || Number.isNaN(new Date(line.useBy).getTime()))) {
    throw new Error("Each line needs a use-by date");
  }
}
