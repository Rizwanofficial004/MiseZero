import { addDays, demoNow } from "@/lib/dates";
import { fromBase, toBase } from "@/lib/units";
import type {
  CatalogProduct,
  Delivery,
  MiseData,
  Recipe,
  Sale,
  Supplier,
  WasteEvent,
} from "@/store/types";

const CREAM = "prod_cream";

const suppliers: Supplier[] = [
  { id: "sup_dairy", name: "Northvale Dairy", contact: "orders@northvale.example" },
  { id: "sup_produce", name: "Greenfield Produce", contact: "hello@greenfield.example" },
  { id: "sup_bakery", name: "Hearth Bakery", contact: "desk@hearth.example" },
  { id: "sup_meat", name: "Market Meats", contact: "trade@marketmeats.example" },
  { id: "sup_dry", name: "Mill & Co", contact: "mill@millandco.example" },
];

const products: CatalogProduct[] = [
  p("prod_cream", "Fresh cream", "Dairy", "sup_dairy", "L", 3.2, 3, "chilled", 0.5, false),
  p("prod_milk", "Whole milk", "Dairy", "sup_dairy", "L", 0.9, 5, "chilled", 4, false),
  p("prod_butter", "Butter", "Dairy", "sup_dairy", "kg", 7, 21, "chilled", 0.5, true),
  p("prod_eggs", "Eggs", "Dairy", "sup_dairy", "each", 0.25, 14, "chilled", 2, false),
  p("prod_flour", "Plain flour", "Dry store", "sup_bakery", "kg", 0.8, 180, "ambient", 0.8, false),
  p("prod_sugar", "Caster sugar", "Dry store", "sup_bakery", "kg", 1.1, 365, "ambient", 0.2, false),
  p("prod_avocado", "Avocado", "Produce", "sup_produce", "each", 0.7, 4, "ambient", 3, false),
  p("prod_lettuce", "Lettuce", "Produce", "sup_produce", "kg", 4, 4, "chilled", 0.4, false),
  p("prod_tomato", "Tomatoes", "Produce", "sup_produce", "kg", 2.5, 5, "ambient", 0.3, false),
  p("prod_chicken", "Cooked chicken", "Protein", "sup_meat", "kg", 7.5, 2, "chilled", 0.4, true),
  p("prod_ham", "Ham", "Protein", "sup_meat", "kg", 8, 5, "chilled", 0.1, true),
  p("prod_mozzarella", "Mozzarella", "Dairy", "sup_dairy", "kg", 9, 7, "chilled", 0.1, false),
  p("prod_sourdough", "Sourdough loaf", "Bakery", "sup_bakery", "each", 0.6, 2, "ambient", 20, false),
  p("prod_coffee", "Coffee beans", "Dry store", "sup_dry", "kg", 16, 90, "ambient", 0.4, false),
  p("prod_spinach", "Spinach", "Produce", "sup_produce", "kg", 5, 3, "chilled", 0.1, false),
  p("prod_rocket", "Rocket", "Produce", "sup_produce", "kg", 8, 3, "chilled", 0.05, false),
  p("prod_bacon", "Bacon", "Protein", "sup_meat", "each", 0.4, 7, "chilled", 8, true),
  p("prod_cheddar", "Cheddar", "Dairy", "sup_dairy", "kg", 8, 21, "chilled", 0.2, false),
  p("prod_oil", "Olive oil", "Dry store", "sup_dry", "L", 6, 365, "ambient", 0.05, false),
  p("prod_pastry", "Croissant dough", "Bakery", "sup_bakery", "each", 0.35, 30, "frozen", 12, true),
];

const recipes: Recipe[] = [
  recipe("rec_cake", "Cake slice", [{ productId: CREAM, qty: 100, unit: "ml" }, { productId: "prod_eggs", qty: 0.2, unit: "each" }, { productId: "prod_sugar", qty: 15, unit: "g" }, { productId: "prod_flour", qty: 30, unit: "g" }]),
  recipe("rec_croissant", "Croissant", [{ productId: "prod_butter", qty: 40, unit: "g" }, { productId: "prod_flour", qty: 50, unit: "g" }, { productId: "prod_pastry", qty: 1, unit: "each" }]),
  recipe("rec_club", "Club sandwich", [{ productId: "prod_chicken", qty: 80, unit: "g" }, { productId: "prod_sourdough", qty: 1, unit: "each" }, { productId: "prod_lettuce", qty: 20, unit: "g" }, { productId: "prod_tomato", qty: 30, unit: "g" }]),
  recipe("rec_avo", "Avocado toast", [{ productId: "prod_avocado", qty: 0.5, unit: "each" }, { productId: "prod_sourdough", qty: 1, unit: "each" }, { productId: "prod_rocket", qty: 15, unit: "g" }, { productId: "prod_oil", qty: 10, unit: "ml" }]),
  recipe("rec_ham", "Ham & cheese croissant", [{ productId: "prod_ham", qty: 40, unit: "g" }, { productId: "prod_cheddar", qty: 30, unit: "g" }, { productId: "prod_pastry", qty: 1, unit: "each" }]),
  recipe("rec_caesar", "Caesar salad", [{ productId: "prod_lettuce", qty: 60, unit: "g" }, { productId: "prod_chicken", qty: 50, unit: "g" }]),
  recipe("rec_latte", "Latte", [{ productId: "prod_milk", qty: 200, unit: "ml" }, { productId: "prod_coffee", qty: 18, unit: "g" }]),
  recipe("rec_cap", "Cappuccino", [{ productId: "prod_milk", qty: 150, unit: "ml" }, { productId: "prod_coffee", qty: 18, unit: "g" }]),
  recipe("rec_toastie", "Cheese toastie", [{ productId: "prod_cheddar", qty: 40, unit: "g" }, { productId: "prod_sourdough", qty: 2, unit: "each" }, { productId: "prod_mozzarella", qty: 30, unit: "g" }, { productId: "prod_spinach", qty: 20, unit: "g" }]),
  recipe("rec_bacon", "Bacon roll", [{ productId: "prod_bacon", qty: 2, unit: "each" }, { productId: "prod_sourdough", qty: 1, unit: "each" }]),
];

const dailySales: Array<{ recipeId: string; qty: number }> = [
  { recipeId: "rec_cake", qty: 5 },
  { recipeId: "rec_croissant", qty: 12 },
  { recipeId: "rec_club", qty: 4 },
  { recipeId: "rec_avo", qty: 3 },
  { recipeId: "rec_ham", qty: 2 },
  { recipeId: "rec_caesar", qty: 2 },
  { recipeId: "rec_latte", qty: 20 },
  { recipeId: "rec_cap", qty: 15 },
  { recipeId: "rec_toastie", qty: 3 },
  { recipeId: "rec_bacon", qty: 6 },
];

export function buildSeed(now = demoNow()): MiseData {
  const sales: Sale[] = [];
  for (let day = -13; day <= 0; day += 1) {
    for (const item of dailySales) {
      const menu = recipes.find((recipe) => recipe.id === item.recipeId);
      sales.push({
        id: `sale_${item.recipeId}_${day}`,
        date: addDays(now, day, 11),
        menuItemName: menu?.menuItemName ?? item.recipeId,
        recipeId: item.recipeId,
        qty: item.qty,
        source: "manual",
      });
    }
  }

  const consumed = new Map<string, number>();
  for (const sale of sales) {
    const recipe = recipes.find((item) => item.id === sale.recipeId);
    if (!recipe) continue;
    for (const line of recipe.lines) {
      consumed.set(line.productId, (consumed.get(line.productId) ?? 0) + toBase(line.qty, line.unit) * sale.qty);
    }
  }

  const deliveries: Delivery[] = products.map((product) => {
    const used = consumed.get(product.id) ?? 0;
    const cover = product.id === CREAM ? toBase(12, "L") : product.id === "prod_chicken" ? used + toBase(2.2, "kg") : used * 1.2;
    const useBy =
      product.id === CREAM ? addDays(now, 1, 18) : product.id === "prod_chicken" ? addDays(now, 1, 16) : addDays(now, 6, 18);
    return {
      id: `del_${product.id}`,
      supplierId: product.supplierId,
      supplierName: suppliers.find((supplier) => supplier.id === product.supplierId)?.name ?? "",
      date: addDays(now, -2, 7),
      status: "confirmed",
      source: "manual",
      lines: [
        {
          id: `ln_${product.id}`,
          productId: product.id,
          productName: product.name,
          qty: roundQty(fromBase(cover, product.unit)),
          unit: product.unit,
          unitCost: product.unitCost,
          batch: `BC-${product.id.slice(5, 9).toUpperCase()}`,
          useBy,
        },
      ],
    };
  });

  const waste: WasteEvent[] = [
    {
      id: "waste_cream",
      productId: CREAM,
      qty: 0.5,
      unit: "L",
      reason: "expiry",
      destination: "disposal",
      date: addDays(now, -1, 16),
      note: "Opened cream past the internal window",
      unitCost: 3.2,
    },
  ];

  return {
    venue: {
      name: "Bloom & Crumb Café",
      type: "Bakery café",
      city: "Manchester",
      timezone: "Europe/London",
      hoursOpen: "07:00",
      hoursClose: "18:00",
      productionEnds: "15:00",
    },
    suppliers,
    products,
    recipes,
    deliveries,
    sales,
    waste,
    preps: [],
    confirmations: [],
    actions: [],
    activity: [
      {
        id: "log_seed",
        at: now.toISOString(),
        message: "Loaded sample data for Bloom & Crumb",
        entity: "settings",
      },
    ],
    posMappings: recipes.map((recipe) => ({
      id: `map_${recipe.id}`,
      menuItemName: recipe.menuItemName,
      recipeId: recipe.id,
    })),
    voiceNotes: [],
    session: null,
  };
}

function p(
  id: string,
  name: string,
  category: string,
  supplierId: string,
  unit: CatalogProduct["unit"],
  unitCost: number,
  shelfLifeDays: number,
  storageType: CatalogProduct["storageType"],
  defaultDailyUse: number,
  freezable: boolean,
): CatalogProduct {
  return {
    id,
    name,
    category,
    supplierId,
    unit,
    unitCost,
    shelfLifeDays,
    storageType,
    opened: false,
    prepared: false,
    defaultDailyUse,
    confirmValueThreshold: 8,
    freezable,
  };
}

function recipe(id: string, name: string, lines: Recipe["lines"]): Recipe {
  return { id, name, menuItemName: name, lines };
}

function roundQty(value: number): number {
  return Math.round(value * 1000) / 1000;
}
