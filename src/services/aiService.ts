import { uid } from "@/lib/ids";
import { pause } from "@/services/delay";
import type { CatalogProduct, DeliveryLine } from "@/store/types";

export const USE_MOCK_AI = true;

// AI-STUB: timed stand-in for invoice OCR. It never writes stock.
export async function extractInvoice(fileName: string): Promise<DeliveryLine[]> {
  await pause(1800);
  const useBy = new Date(Date.now() + 3 * 86_400_000).toISOString();
  const creamish = /cream|dairy|invoice/i.test(fileName);
  return [
    {
      id: uid("line"),
      productId: "prod_cream",
      productName: "Fresh cream",
      qty: creamish ? 2 : 1,
      unit: "L",
      unitCost: 3.2,
      batch: "OCR-DRAFT",
      useBy,
    },
    {
      id: uid("line"),
      productId: "prod_butter",
      productName: "Butter",
      qty: 1,
      unit: "kg",
      unitCost: 7,
      batch: "OCR-DRAFT",
      useBy,
    },
  ];
}

export interface VoiceDraft {
  productId: string | null;
  productName: string;
  qty: number | null;
  unit: CatalogProduct["unit"] | null;
  event: string;
  status: "passed_to_intake" | "needs_review";
}

// AI-STUB: fills a voice note into fields. The user still saves the record.
export function structureVoice(text: string, products: CatalogProduct[]): VoiceDraft {
  const lowered = text.toLowerCase();
  const product = products.find((item) => {
    const name = item.name.toLowerCase();
    if (lowered.includes(name)) return true;
    const token = name.split(" ").pop() ?? name;
    return token.length > 3 && lowered.includes(token);
  });
  const amount = text.match(/(\d+(?:\.\d+)?)\s*-?\s*(kg|g|ml|l|litre|litres|each)?/i);
  const qty = amount ? Number(amount[1]) : null;
  const rawUnit = amount?.[2]?.toLowerCase();
  const unit = rawUnit === "l" || rawUnit === "litre" || rawUnit === "litres" ? "L" : rawUnit === "kg" || rawUnit === "g" || rawUnit === "ml" || rawUnit === "each" ? rawUnit : product?.unit ?? null;
  const event = /waste|bin|threw/i.test(text) ? "Waste" : /count|left|remaining/i.test(text) ? "Stock count" : "Opened pack";
  const status = product && qty ? "passed_to_intake" : "needs_review";
  return {
    productId: product?.id ?? null,
    productName: product?.name ?? "Unparsed note",
    qty,
    unit,
    event,
    status,
  };
}

// AI-STUB: echoes the engine's daily use. It does not replace the stock figure.
export async function forecastDemand(dailyUse: number) {
  await pause();
  return { dailyUse, badge: "AI insights — beta" as const };
}
