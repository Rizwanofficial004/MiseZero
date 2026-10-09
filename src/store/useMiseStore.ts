import { create } from "zustand";
import { persist } from "zustand/middleware";
import { uid } from "@/lib/ids";
import { buildSeed } from "@/store/seed";
import type {
  ActivityEntry,
  CatalogProduct,
  Delivery,
  MiseData,
  PosMapping,
  PrepRecord,
  Recipe,
  Sale,
  Session,
  StockConfirmation,
  StoredAction,
  Supplier,
  VoiceNote,
  WasteEvent,
} from "@/store/types";

type MiseActions = {
  resetDemo: () => void;
  loadSample: () => void;
  setSession: (session: Session | null) => void;
  log: (message: string, entity: string) => void;
  saveProduct: (product: CatalogProduct) => void;
  deleteProduct: (id: string) => void;
  saveSupplier: (supplier: Supplier) => void;
  deleteSupplier: (id: string) => void;
  saveRecipe: (recipe: Recipe) => void;
  deleteRecipe: (id: string) => void;
  saveDelivery: (delivery: Delivery) => void;
  deleteDelivery: (id: string) => void;
  addSales: (sales: Sale[]) => void;
  deleteSale: (id: string) => void;
  saveWaste: (event: WasteEvent) => void;
  deleteWaste: (id: string) => void;
  addPrep: (prep: PrepRecord) => void;
  addConfirmation: (confirmation: StockConfirmation) => void;
  saveAction: (action: StoredAction) => void;
  deleteAction: (id: string) => void;
  saveMapping: (mapping: PosMapping) => void;
  addVoice: (note: VoiceNote) => void;
};

export type MiseState = MiseData & MiseActions;

function activity(current: ActivityEntry[], message: string, entity: string): ActivityEntry[] {
  return [{ id: uid("log"), at: new Date().toISOString(), message, entity }, ...current].slice(0, 300);
}

const dataKeys: Array<keyof MiseData> = [
  "venue",
  "suppliers",
  "products",
  "recipes",
  "deliveries",
  "sales",
  "waste",
  "preps",
  "confirmations",
  "actions",
  "activity",
  "posMappings",
  "voiceNotes",
  "session",
];

export const useMiseStore = create<MiseState>()(
  persist(
    (set, get) => ({
      ...buildSeed(),
      resetDemo: () => set({ ...buildSeed(), session: get().session }),
      loadSample: () => set({ ...buildSeed(), session: get().session }),
      setSession: (session) => set({ session }),
      log: (message, entity) => set({ activity: activity(get().activity, message, entity) }),
      saveProduct: (product) => {
        const products = get().products.some((item) => item.id === product.id)
          ? get().products.map((item) => (item.id === product.id ? product : item))
          : [product, ...get().products];
        set({ products, activity: activity(get().activity, `Saved product ${product.name}`, "product") });
      },
      deleteProduct: (id) => {
        const product = get().products.find((item) => item.id === id);
        set({
          products: get().products.filter((item) => item.id !== id),
          activity: activity(get().activity, `Deleted product ${product?.name ?? id}`, "product"),
        });
      },
      saveSupplier: (supplier) => {
        const suppliers = get().suppliers.some((item) => item.id === supplier.id)
          ? get().suppliers.map((item) => (item.id === supplier.id ? supplier : item))
          : [supplier, ...get().suppliers];
        set({ suppliers, activity: activity(get().activity, `Saved supplier ${supplier.name}`, "supplier") });
      },
      deleteSupplier: (id) => {
        const supplier = get().suppliers.find((item) => item.id === id);
        set({
          suppliers: get().suppliers.filter((item) => item.id !== id),
          activity: activity(get().activity, `Deleted supplier ${supplier?.name ?? id}`, "supplier"),
        });
      },
      saveRecipe: (recipe) => {
        const recipes = get().recipes.some((item) => item.id === recipe.id)
          ? get().recipes.map((item) => (item.id === recipe.id ? recipe : item))
          : [recipe, ...get().recipes];
        set({ recipes, activity: activity(get().activity, `Saved recipe ${recipe.name}`, "recipe") });
      },
      deleteRecipe: (id) => {
        const recipe = get().recipes.find((item) => item.id === id);
        set({
          recipes: get().recipes.filter((item) => item.id !== id),
          posMappings: get().posMappings.filter((item) => item.recipeId !== id),
          activity: activity(get().activity, `Deleted recipe ${recipe?.name ?? id}`, "recipe"),
        });
      },
      saveDelivery: (delivery) => {
        const deliveries = get().deliveries.some((item) => item.id === delivery.id)
          ? get().deliveries.map((item) => (item.id === delivery.id ? delivery : item))
          : [delivery, ...get().deliveries];
        set({
          deliveries,
          activity: activity(
            get().activity,
            `${delivery.status === "confirmed" ? "Confirmed" : "Saved"} delivery ${delivery.supplierName || delivery.fileName || delivery.id}`,
            "delivery",
          ),
        });
      },
      deleteDelivery: (id) => set({
        deliveries: get().deliveries.filter((item) => item.id !== id),
        activity: activity(get().activity, "Deleted a delivery draft", "delivery"),
      }),
      addSales: (sales) => set({
        sales: [...sales, ...get().sales],
        activity: activity(get().activity, `Imported ${sales.length} sales`, "sale"),
      }),
      deleteSale: (id) => set({
        sales: get().sales.filter((item) => item.id !== id),
        activity: activity(get().activity, "Deleted a sale", "sale"),
      }),
      saveWaste: (event) => {
        const waste = get().waste.some((item) => item.id === event.id)
          ? get().waste.map((item) => (item.id === event.id ? event : item))
          : [event, ...get().waste];
        set({ waste, activity: activity(get().activity, `Recorded waste ${event.qty} ${event.unit}`, "waste") });
      },
      deleteWaste: (id) => set({
        waste: get().waste.filter((item) => item.id !== id),
        activity: activity(get().activity, "Deleted a waste event", "waste"),
      }),
      addPrep: (prep) => set({
        preps: [prep, ...get().preps],
        activity: activity(get().activity, `Recorded prep ${prep.qty} ${prep.unit}`, "prep"),
      }),
      addConfirmation: (confirmation) => set({
        confirmations: [confirmation, ...get().confirmations],
        activity: activity(get().activity, `Confirmed stock ${confirmation.qty} ${confirmation.unit}`, "confirmation"),
      }),
      saveAction: (action) => {
        const actions = get().actions.some((item) => item.id === action.id)
          ? get().actions.map((item) => (item.id === action.id ? action : item))
          : [action, ...get().actions];
        set({ actions, activity: activity(get().activity, `${action.status} · ${action.title}`, "action") });
      },
      deleteAction: (id) => set({
        actions: get().actions.filter((item) => item.id !== id),
        activity: activity(get().activity, "Cleared an action response", "action"),
      }),
      saveMapping: (mapping) => {
        const posMappings = get().posMappings.some((item) => item.id === mapping.id)
          ? get().posMappings.map((item) => (item.id === mapping.id ? mapping : item))
          : [mapping, ...get().posMappings];
        set({ posMappings, activity: activity(get().activity, `Updated POS mapping for ${mapping.menuItemName}`, "mapping") });
      },
      addVoice: (note) => set({
        voiceNotes: [note, ...get().voiceNotes],
        activity: activity(get().activity, `Saved a voice note`, "voice"),
      }),
    }),
    {
      name: "misezero-demo",
      partialize: (state) => Object.fromEntries(dataKeys.map((key) => [key, state[key]])),
    },
  ),
);
