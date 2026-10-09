"use client";

import { useState } from "react";
import { ConfidenceDonut } from "@/components/charts/dashboard-charts";
import { DashboardHeader } from "@/components/layout/dashboard-sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { SHADOW_FORMULA } from "@/engine/constants";
import { round } from "@/engine/present";
import { confirmStock } from "@/services/inventoryService";
import { useDemo } from "@/services/useDemo";
import { formatCurrency, formatRange } from "@/lib/utils";
import { formatVenue } from "@/lib/dates";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const riskLabel = {
  low: "Low",
  watch: "Watch",
  elevated: "Elevated",
  critical: "Critical",
} as const;

export default function InventoryPage() {
  const demo = useDemo();
  const toast = useToast();
  const cream = demo.views.find((view) => view.productId === "prod_cream") ?? demo.views[0];
  const [count, setCount] = useState<{ productId: string; where: "card" | "row"; qty: string } | null>(null);
  const [pending, setPending] = useState(false);

  const openCount = (productId: string, where: "card" | "row", suggested: number) => {
    setCount({ productId, where, qty: String(round(suggested)) });
  };

  const saveCount = async (productId: string) => {
    setPending(true);
    try {
      await confirmStock(productId, Number(count?.qty));
      toast.push("Stock count saved. The estimate now starts from that quantity.");
      setCount(null);
    } catch (error) {
      toast.push(error instanceof Error ? error.message : "Could not save the count", "error");
    } finally {
      setPending(false);
    }
  };

  return (
    <div>
      <DashboardHeader
        title="Stock Estimates"
        description="Shadow stock — a likely range and a confidence level, not a false exact count"
      />
      <div className="space-y-5 p-6">
        {!cream ? (
          <p className="rounded-xl border border-dashed border-mint-200 bg-white px-4 py-6 text-sm text-ink-muted">
            Add a product to see a stock estimate.
          </p>
        ) : (
          <Card>
            <CardContent className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">Worked example</p>
                  <h2 className="mt-1 text-lg font-semibold text-ink">{cream.productName}</h2>
                  <p className="mt-1 text-sm text-ink-muted" title={SHADOW_FORMULA}>
                    {formatRange(round(cream.math.low), round(cream.math.high), cream.unit)} · most probable{" "}
                    {round(cream.math.expected)} {cream.unit} · {Math.round(cream.math.confidence)}% confidence
                  </p>
                </div>
                <Badge variant="warning">{riskLabel[cream.riskClass]} waste risk</Badge>
              </div>
              <CountEditor
                open={count?.productId === cream.productId && count.where === "card"}
                unit={cream.unit}
                qty={count?.qty ?? ""}
                pending={pending}
                onOpen={() => openCount(cream.productId, "card", cream.math.expected)}
                onQty={(qty) => setCount((current) => (current ? { ...current, qty } : current))}
                onCancel={() => setCount(null)}
                onSave={() => void saveCount(cream.productId)}
              />

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Stat label="Expected use before deadline" value={`${round(cream.expectedUse)} ${cream.unit}`} />
                <Stat label="Probable surplus" value={`${round(cream.surplus)} ${cream.unit}`} />
                <Stat label="Value exposed" value={formatCurrency(cream.valueAtRisk)} />
                <Stat label="Product state" value={cream.math.conflict ? "Signals conflict" : cream.math.confirmedAt ? "Counted" : "Estimated"} />
              </div>

              <p className="mt-4 text-xs text-ink-muted" title={SHADOW_FORMULA}>
                {cream.formula}
              </p>

              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">Signal fusion</p>
                  <ul className="mt-2 space-y-2">
                    {cream.signals.map((signal) => (
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
                    <p className="mt-1 text-ink-muted">
                      {round(cream.math.delivered)} {cream.unit} delivered − {round(cream.math.recipe)} {cream.unit} recipe use ={" "}
                      {round(cream.math.delivered - cream.math.recipe)} {cream.unit}
                    </p>
                  </div>
                  <div className="rounded-lg border border-mint-200 bg-mint-50 p-3 text-sm">
                    <p className="font-medium text-ink">MiseZero</p>
                    <p className="mt-1 text-ink-muted">{cream.explanation[0]}</p>
                    <p className="mt-1 text-ink-muted">{cream.explanation[1]}</p>
                  </div>
                  <div className="rounded-lg border border-mint-100 p-3 text-sm">
                    <p className="font-medium text-ink">Two deadlines</p>
                    <p className="mt-1 text-ink-muted">
                      Product-life boundary: {cream.useBy ? formatVenue(cream.useBy, demo.venue.timezone) : "No use-by on file"}
                    </p>
                    <p className="text-ink-muted">
                      Operational intervention: {cream.actBy ? formatVenue(cream.actBy, demo.venue.timezone) : "No buffer deadline"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
                  {demo.views.map((item) => (
                    <tr key={item.productId} className="border-t border-mint-100">
                      <td className="px-4 py-4">
                        <p className="font-medium text-ink">{item.productName}</p>
                        <p className="text-xs text-ink-muted">{item.category}</p>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-ink">{formatRange(round(item.math.low), round(item.math.high), item.unit)}</p>
                        <Badge variant="confidence" confidence={item.math.confidence} className="mt-1">
                          {Math.round(item.math.confidence)}%
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={item.riskClass === "low" ? "success" : "warning"}>{riskLabel[item.riskClass]}</Badge>
                        {item.confirmationRequired && <p className="mt-1 text-xs text-amber-700">Confirm before acting</p>}
                        <CountEditor
                          open={count?.productId === item.productId && count.where === "row"}
                          unit={item.unit}
                          qty={count?.qty ?? ""}
                          pending={pending}
                          onOpen={() => openCount(item.productId, "row", item.math.expected)}
                          onQty={(qty) => setCount((current) => (current ? { ...current, qty } : current))}
                          onCancel={() => setCount(null)}
                          onSave={() => void saveCount(item.productId)}
                        />
                      </td>
                      <td className="px-4 py-4 text-ink-muted">
                        {round(item.expectedUse)} {item.unit}
                      </td>
                      <td className="px-4 py-4 text-ink-muted">
                        {item.actBy ? formatVenue(item.actBy, demo.venue.timezone) : "—"}
                      </td>
                      <td className="px-4 py-4">
                        {item.posLinked ? <CheckCircle2 className="h-4 w-4 text-mint-600" /> : <AlertCircle className="h-4 w-4 text-amber-500" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <ConfidenceDonut mix={demo.confidenceMix} />
        </div>
      </div>
    </div>
  );
}

function CountEditor({
  open,
  unit,
  qty,
  pending,
  onOpen,
  onQty,
  onCancel,
  onSave,
}: {
  open: boolean;
  unit: string;
  qty: string;
  pending: boolean;
  onOpen: () => void;
  onQty: (qty: string) => void;
  onCancel: () => void;
  onSave: () => void;
}) {
  if (!open) {
    return (
      <Button size="sm" variant="outline" className="mt-2" type="button" onClick={onOpen}>
        Confirm stock
      </Button>
    );
  }
  return (
    <form
      className="mt-2 flex flex-wrap items-center gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        onSave();
      }}
    >
      <input
        className="input-field h-8 w-24 px-2 text-sm"
        value={qty}
        onChange={(event) => onQty(event.target.value)}
        inputMode="decimal"
        aria-label={`Counted quantity in ${unit}`}
      />
      <span className="text-xs text-ink-muted">{unit}</span>
      <Button size="sm" type="submit" disabled={pending}>{pending ? "Saving…" : "Save count"}</Button>
      <Button size="sm" variant="ghost" type="button" disabled={pending} onClick={onCancel}>Cancel</Button>
    </form>
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
