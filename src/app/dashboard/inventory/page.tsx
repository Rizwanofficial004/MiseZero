import { ConfidenceDonut } from "@/components/charts/dashboard-charts";
import { DashboardHeader } from "@/components/layout/dashboard-sidebar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getInventory } from "@/lib/data";
import { formatCurrency, formatRange } from "@/lib/utils";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const riskLabel = {
  low: "Low",
  watch: "Watch",
  elevated: "Elevated",
  critical: "Critical",
} as const;

const stateLabel = {
  delivered: "Delivered",
  opened: "Opened",
  prepared: "Prepared",
  stored: "Stored",
  used: "Used",
  disposed: "Disposed",
} as const;

export default function InventoryPage() {
  const inventory = getInventory();
  const cream = inventory[0];
  const states = ["delivered", "opened", "prepared", "stored", "used"] as const;

  return (
    <div>
      <DashboardHeader
        title="Stock Estimates"
        description="Shadow stock — a likely range and a confidence level, not a false exact count"
      />
      <div className="space-y-5 p-6">
        <Card>
          <CardContent className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">Worked example</p>
                <h2 className="mt-1 text-lg font-semibold text-ink">{cream.productName}</h2>
                <p className="mt-1 text-sm text-ink-muted">
                  {formatRange(cream.estimate.min, cream.estimate.max, cream.estimate.unit)} · most probable{" "}
                  {cream.estimate.mostLikely} {cream.estimate.unit} · {cream.estimate.confidence}% confidence
                </p>
              </div>
              <Badge variant="warning">{riskLabel[cream.riskClass]} waste risk</Badge>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Stat label="Expected use before deadline" value={`${cream.expectedUsage.min}–${cream.expectedUsage.max} ${cream.estimate.unit}`} />
              <Stat label="Probable surplus" value={`${cream.probableSurplus.min}–${cream.probableSurplus.max} ${cream.estimate.unit}`} />
              <Stat label="Value exposed" value={formatCurrency(cream.valueAtRisk)} />
              <Stat label="Product state" value={stateLabel[cream.productState]} />
            </div>

            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">Product state</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                {states.map((state, index) => (
                  <div key={state} className="flex items-center gap-2">
                    <span
                      className={
                        state === cream.productState
                          ? "rounded-full bg-mint-600 px-3 py-1 text-xs font-semibold text-white"
                          : "rounded-full bg-mint-50 px-3 py-1 text-xs text-ink-muted"
                      }
                    >
                      {stateLabel[state]}
                    </span>
                    {index < states.length - 1 && <span className="text-mint-300">→</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">Signal fusion</p>
                <ul className="mt-2 space-y-2">
                  {cream.signals?.map((signal) => (
                    <li key={signal.source} className="flex items-start justify-between gap-3 rounded-lg bg-mint-50 px-3 py-2 text-sm">
                      <span>
                        <span className="font-medium text-ink">{signal.source}</span>
                        <span className="mt-0.5 block text-ink-muted">{signal.detail}</span>
                      </span>
                      <span className="shrink-0 text-xs uppercase tracking-wide text-ink-muted">{signal.weight}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-3">
                <div className="rounded-lg border border-mint-100 p-3 text-sm">
                  <p className="font-medium text-ink">Conventional ledger</p>
                  <p className="mt-1 text-ink-muted">12 L delivered − 7 L recorded usage = 5 L remaining</p>
                </div>
                <div className="rounded-lg border border-mint-200 bg-mint-50 p-3 text-sm">
                  <p className="font-medium text-ink">MiseZero</p>
                  <p className="mt-1 text-ink-muted">
                    Delivery, recipe use, preparation, recorded waste and site history produce 4.2–5.8 L, most probable 4.9 L, at 78% confidence.
                  </p>
                </div>
                <div className="rounded-lg border border-mint-100 p-3 text-sm">
                  <p className="font-medium text-ink">Two deadlines</p>
                  <p className="mt-1 text-ink-muted">Product-life boundary: {cream.productDeadline}</p>
                  <p className="text-ink-muted">Operational intervention: {cream.safetyWindowCloses}</p>
                  <p className="mt-2 text-ink-muted">Use in production by 14:00 · Markdown by 16:30 · Freeze by 17:00</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-5 xl:grid-cols-3">
          <div className="overflow-hidden rounded-2xl border border-mint-200 bg-white xl:col-span-2">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-mint-50 text-left text-xs uppercase tracking-wide text-ink-muted">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Estimated remaining</th>
                    <th className="px-4 py-3">Risk</th>
                    <th className="px-4 py-3">Expected use</th>
                    <th className="px-4 py-3">Action deadline</th>
                    <th className="px-4 py-3">POS</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => (
                    <tr key={item.id} className="border-t border-mint-100">
                      <td className="px-4 py-4">
                        <p className="font-medium text-ink">{item.productName}</p>
                        <p className="text-xs text-ink-muted">
                          {item.category} · {stateLabel[item.productState]}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-ink">
                          {formatRange(item.estimate.min, item.estimate.max, item.estimate.unit)}
                        </p>
                        <Badge variant="confidence" confidence={item.estimate.confidence} className="mt-1">
                          {item.estimate.confidence}%
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={item.riskClass === "low" ? "success" : "warning"}>
                          {riskLabel[item.riskClass]}
                        </Badge>
                        {item.confirmationRequired && (
                          <p className="mt-1 text-xs text-amber-700">Confirm before acting</p>
                        )}
                      </td>
                      <td className="px-4 py-4 text-ink-muted">
                        {item.expectedUsage.min}–{item.expectedUsage.max} {item.estimate.unit}
                      </td>
                      <td className="px-4 py-4 text-ink-muted">{item.safetyWindowCloses}</td>
                      <td className="px-4 py-4">
                        {item.posLinked ? (
                          <CheckCircle2 className="h-4 w-4 text-mint-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-amber-500" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <ConfidenceDonut />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-mint-100 bg-white px-3 py-2">
      <p className="text-xs text-ink-muted">{label}</p>
      <p className="mt-1 font-medium text-ink">{value}</p>
    </div>
  );
}
