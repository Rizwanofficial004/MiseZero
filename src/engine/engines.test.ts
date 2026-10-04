import { describe, expect, it } from "vitest";
import { parseSalesCsv } from "@/engine/csv";
import { SHADOW } from "@/engine/constants";
import { estimateProduct, type Ledger } from "@/engine/shadowStock";
import { rescueOptions } from "@/engine/rescue";
import { safeWindow } from "@/engine/safeWindow";
import { buildSeed } from "@/store/seed";
import { convert } from "@/lib/units";
import type { CatalogProduct, Delivery, Recipe } from "@/store/types";

const now = new Date("2026-10-05T12:00:00.000Z");

const cream: CatalogProduct = {
  id: "prod_cream",
  name: "Fresh cream",
  category: "Dairy",
  supplierId: "sup_dairy",
  unit: "L",
  unitCost: 3.2,
  shelfLifeDays: 3,
  storageType: "chilled",
  opened: false,
  prepared: false,
  defaultDailyUse: 0.5,
  confirmValueThreshold: 8,
  freezable: false,
};

const cake: Recipe = {
  id: "rec_cake",
  name: "Cake slice",
  menuItemName: "Cake slice",
  lines: [{ productId: "prod_cream", qty: 100, unit: "ml" }],
};

function delivery(qty: number, status: Delivery["status"], useBy: string): Delivery {
  return {
    id: "del_cream",
    supplierId: "sup_dairy",
    supplierName: "Northvale Dairy",
    date: "2026-10-03T08:00:00.000Z",
    status,
    source: "manual",
    lines: [
      {
        id: "ln",
        productId: "prod_cream",
        productName: "Fresh cream",
        qty,
        unit: "L",
        unitCost: 3.2,
        batch: "NV",
        useBy,
      },
    ],
  };
}

function ledger(patch: Partial<Ledger>): Ledger {
  return {
    products: [cream],
    recipes: [cake],
    deliveries: [delivery(12, "confirmed", "2026-10-07T08:00:00.000Z")],
    sales: [
      {
        id: "sale",
        date: "2026-10-04T09:00:00.000Z",
        menuItemName: "Cake slice",
        recipeId: "rec_cake",
        qty: 70,
        source: "manual",
      },
    ],
    waste: [
      {
        id: "waste",
        productId: "prod_cream",
        qty: 0.5,
        unit: "L",
        reason: "expiry",
        destination: "disposal",
        date: "2026-10-04T10:00:00.000Z",
        note: "",
        unitCost: 3.2,
      },
    ],
    preps: [],
    confirmations: [],
    now,
    ...patch,
  };
}

describe("shadow stock", () => {
  it("matches the cream case before any count", () => {
    const math = estimateProduct(cream, ledger({}));
    expect(math.expected).toBeCloseTo(4.5, 5);
    expect(math.conflict).toBe(false);
    expect(math.halfWidthPct).toBe(SHADOW.baseVariancePct + SHADOW.neverConfirmedDays * SHADOW.dailyWidenPct);
    expect(math.low).toBeCloseTo(4.5 * (1 - math.halfWidthPct / 100), 5);
    expect(math.high).toBeCloseTo(4.5 * (1 + math.halfWidthPct / 100), 5);
    expect(math.confidence).toBeCloseTo(52.5, 5);
  });

  it("narrows the range and raises confidence after a 4.9 L count", () => {
    const before = estimateProduct(cream, ledger({}));
    const after = estimateProduct(
      cream,
      ledger({
        confirmations: [
          { id: "c", productId: "prod_cream", qty: 4.9, unit: "L", date: now.toISOString() },
        ],
      }),
    );
    expect(after.expected).toBeCloseTo(4.9, 5);
    expect(after.halfWidthPct).toBe(SHADOW.baseVariancePct);
    expect(after.confidence).toBe(SHADOW.confidenceCap);
    expect(after.high - after.low).toBeLessThan(before.high - before.low);
  });

  it("shows zero and a conflict when usage exceeds deliveries", () => {
    const math = estimateProduct(
      cream,
      ledger({
        deliveries: [delivery(1, "confirmed", "2026-10-07T08:00:00.000Z")],
        sales: [
          {
            id: "sale",
            date: "2026-10-04T09:00:00.000Z",
            menuItemName: "Cake slice",
            recipeId: "rec_cake",
            qty: 50,
            source: "manual",
          },
        ],
        waste: [],
      }),
    );
    expect(math.rawExpected).toBeCloseTo(-4, 5);
    expect(math.expected).toBe(0);
    expect(math.conflict).toBe(true);
    expect(math.consistency).toBe(SHADOW.conflictConsistency);
    expect(math.halfWidthPct).toBe(
      SHADOW.baseVariancePct + SHADOW.neverConfirmedDays * SHADOW.dailyWidenPct + SHADOW.conflictExtraPct,
    );
  });

  it("keeps a draft invoice out of stock until it is confirmed", () => {
    const draft = estimateProduct(cream, ledger({ deliveries: [delivery(2, "draft", "2026-10-07T08:00:00.000Z")], sales: [], waste: [] }));
    const confirmed = estimateProduct(
      cream,
      ledger({ deliveries: [delivery(2, "confirmed", "2026-10-07T08:00:00.000Z")], sales: [], waste: [] }),
    );
    expect(draft.expected).toBe(0);
    expect(confirmed.expected).toBeCloseTo(2, 5);
  });
});

describe("units", () => {
  it("converts mass and volume into base units and back", () => {
    expect(convert(1, "kg", "g")).toBe(1000);
    expect(convert(2, "L", "ml")).toBe(2000);
    expect(convert(500, "ml", "L")).toBeCloseTo(0.5, 5);
  });
});

describe("safe window", () => {
  it("blocks sell and discount options after the use-by", () => {
    const window = safeWindow(cream, "2026-10-04T12:00:00.000Z", now);
    expect(window.status).toBe("do_not_serve");
    const options = rescueOptions(
      cream,
      { dailyUse: 0.5, remainingDays: 0, expectedUse: 0, surplus: 4.5, share: 1, band: "critical", valueAtRisk: 14.4 },
      window,
    );
    expect(options.find((option) => option.id === "discount")?.feasible).toBe(false);
    expect(options.find((option) => option.id === "discard")?.feasible).toBe(true);
  });
});

describe("sales csv", () => {
  it("rejects rows with a bad date, quantity, blank item, or unknown menu item", () => {
    const text = ["date,item,qty", "not-a-date,Cake slice,2", "2026-10-01,Cake slice,abc", "2026-10-01,,3", "2026-10-01,Unknown pie,1"].join("\n");
    const parsed = parseSalesCsv(text, [cake]);
    expect(parsed.rows).toHaveLength(0);
    expect(parsed.errors).toHaveLength(4);
  });
});

describe("seed", () => {
  it("keeps the worked cream example at 4.5 L", () => {
    const data = buildSeed(now);
    const product = data.products.find((item) => item.id === "prod_cream");
    expect(product).toBeTruthy();
    const math = estimateProduct(product!, { ...data, now });
    expect(math.expected).toBeCloseTo(4.5, 5);
  });
});
