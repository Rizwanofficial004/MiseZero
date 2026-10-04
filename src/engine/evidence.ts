import { dayKey, inRange } from "@/lib/dates";
import type { CatalogProduct, StoredAction, WasteEvent } from "@/store/types";

export interface EvidencePack {
  from: string;
  to: string;
  events: Array<WasteEvent & { productName: string; category: string; value: number }>;
  outcomes: StoredAction[];
  valueLost: number;
  valueProtected: number;
  qtySaved: number;
  qtyWasted: number;
  byDay: Array<{ day: string; value: number }>;
}

export function buildEvidence(
  waste: WasteEvent[],
  actions: StoredAction[],
  products: CatalogProduct[],
  from: string,
  to: string,
): EvidencePack {
  const events = waste
    .filter((event) => inRange(event.date, from, to))
    .map((event) => {
      const product = products.find((item) => item.id === event.productId);
      return {
        ...event,
        productName: product?.name ?? "Unknown product",
        category: product?.category ?? "Uncategorised",
        value: event.qty * event.unitCost,
      };
    });
  const outcomes = actions.filter(
    (action) => action.status === "done" && action.outcome && inRange(action.outcome.recordedAt, from, to),
  );
  const days = new Map<string, number>();
  for (const event of events) {
    const key = dayKey(event.date);
    days.set(key, (days.get(key) ?? 0) + event.value);
  }
  return {
    from,
    to,
    events,
    outcomes,
    valueLost: events.reduce((sum, event) => sum + event.value, 0),
    valueProtected: outcomes.reduce((sum, action) => sum + (action.outcome?.value ?? 0), 0),
    qtySaved: outcomes.reduce((sum, action) => sum + (action.outcome?.qtySaved ?? 0), 0),
    qtyWasted: outcomes.reduce((sum, action) => sum + (action.outcome?.qtyWasted ?? 0), 0),
    byDay: [...days.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([day, value]) => ({ day, value })),
  };
}

export function evidenceToCsv(pack: EvidencePack): string {
  const lines = ["type,date,name,quantity,unit,value,detail"];
  for (const event of pack.events) {
    lines.push(
      ["waste", event.date, event.productName, event.qty, event.unit, event.value.toFixed(2), event.reason]
        .map(csvCell)
        .join(","),
    );
  }
  for (const action of pack.outcomes) {
    lines.push(
      [
        "outcome",
        action.outcome?.recordedAt ?? action.createdAt,
        action.title,
        action.outcome?.qtySaved ?? 0,
        "",
        (action.outcome?.value ?? 0).toFixed(2),
        `saved ${action.outcome?.qtySaved ?? 0}; wasted ${action.outcome?.qtyWasted ?? 0}`,
      ]
        .map(csvCell)
        .join(","),
    );
  }
  return lines.join("\n");
}

function csvCell(value: string | number): string {
  const text = String(value);
  if (text.includes(",") || text.includes("\"")) return `"${text.replaceAll("\"", "\"\"")}"`;
  return text;
}
