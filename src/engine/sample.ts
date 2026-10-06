import { demoNow } from "@/lib/dates";
import { productViews } from "@/engine/present";
import { buildSeed } from "@/store/seed";

export function sampleCream(now = demoNow()) {
  const data = buildSeed(now);
  const view = productViews(data, now).find((item) => item.productId === "prod_cream");
  if (!view) throw new Error("Sample cream is missing");
  return view;
}
