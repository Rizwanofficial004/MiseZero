import type { WasteDestination, WasteReason } from "@/lib/data";

export const wasteReasonLabels: Record<WasteReason, string> = {
  expiry: "Expiry or spoilage",
  overproduction: "Overproduction",
  preparation_loss: "Preparation loss",
  damage: "Damage",
  unsold: "Unsold finished stock",
  quality: "Quality issue",
  demand_shortfall: "Demand shortfall",
  other: "Other",
};

export const wasteDestinationLabels: Record<WasteDestination, string> = {
  collection: "Food-waste collection",
  redistribution: "Redistribution or donation",
  disposal: "Disposal",
  repurposing: "Internal repurposing",
  recycling: "Recycling",
  other: "Other destination",
};

export const intakeSourceLabels = {
  invoice: "Invoice",
  delivery_note: "Delivery note",
  manual: "Manual entry",
  scale: "Scale",
  pos_export: "POS export",
  voice: "Voice note",
  preparation: "Preparation",
  waste: "Waste event",
  confirmation: "Targeted check",
} as const;
