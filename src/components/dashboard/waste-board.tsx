"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Product, WasteDestination, WasteEvent, WasteReason } from "@/lib/data";
import { wasteDestinationLabels, wasteReasonLabels } from "@/lib/labels";
import { formatCurrency } from "@/lib/utils";

const reasons = Object.keys(wasteReasonLabels) as WasteReason[];
const destinations = Object.keys(wasteDestinationLabels) as WasteDestination[];

export function WasteBoard({
  initialEvents,
  products,
  trend,
  valueProtected,
}: {
  initialEvents: WasteEvent[];
  products: Product[];
  trend: Array<{ day: string; value: number }>;
  valueProtected: number;
}) {
  const [events, setEvents] = useState(initialEvents);
  const [productName, setProductName] = useState(products[0]?.name ?? "");
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState<WasteReason>("expiry");
  const [destination, setDestination] = useState<WasteDestination>("collection");
  const [note, setNote] = useState("");

  const selected = products.find((product) => product.name === productName) ?? products[0];
  const parsedQty = Number(quantity) || 0;
  const draftValue = Math.round(parsedQty * (selected?.unitCost ?? 0) * 100) / 100;

  const summary = useMemo(() => summarise(events), [events]);
  const maxTrend = Math.max(...trend.map((point) => point.value));

  const record = (event: FormEvent) => {
    event.preventDefault();
    if (!selected || parsedQty <= 0) return;
    const next: WasteEvent = {
      id: `w-${Date.now()}`,
      productName: selected.name,
      category: selected.category,
      quantity: parsedQty,
      unit: selected.unit,
      value: draftValue,
      recordedAt: "Just now",
      reason,
      destination,
      note: note || undefined,
      batchRef: "Manual",
    };
    setEvents((current) => [next, ...current]);
    setNote("");
    setQuantity("1");
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Summary label="Value lost" value={formatCurrency(summary.valueLost)} detail={`${events.length} recorded events`} />
        <Summary label="Value protected" value={formatCurrency(valueProtected)} detail="From accepted interventions this week" />
        <Summary label="Preventive actions" value={String(summary.linked)} detail="Events tied to an earlier recommendation" />
        <Summary label="Trend" value="Down through the week" detail="Recorded value, Monday to Sunday" />
      </div>

      <Card>
        <CardContent className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">Recorded value by day</p>
          <div className="mt-4 flex items-end gap-3">
            {trend.map((point) => (
              <div key={point.day} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex h-24 w-full items-end rounded-lg bg-mint-50">
                  <div
                    className="w-full rounded-lg bg-mint-500"
                    style={{ height: `${Math.max(8, (point.value / maxTrend) * 100)}%` }}
                  />
                </div>
                <span className="text-xs text-ink-muted">{point.day}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Breakdown title="By category" rows={summary.categories} />
        <Breakdown title="By reason" rows={summary.reasons} />
        <Breakdown title="By destination" rows={summary.destinations} />
      </div>

      <Card>
        <CardContent className="p-5">
          <h2 className="font-semibold text-ink">Record a waste event</h2>
          <p className="mt-1 text-sm text-ink-muted">
            A short record of what was lost, why, and where it went. This is the ground truth the models learn from.
          </p>
          <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={record}>
            <label className="text-sm text-ink">
              Product
              <select className="input-field mt-1" value={productName} onChange={(event) => setProductName(event.target.value)}>
                {products.map((product) => (
                  <option key={product.id} value={product.name}>{product.name}</option>
                ))}
              </select>
            </label>
            <label className="text-sm text-ink">
              Quantity ({selected?.unit})
              <input className="input-field mt-1" value={quantity} onChange={(event) => setQuantity(event.target.value)} inputMode="decimal" />
            </label>
            <label className="text-sm text-ink">
              Reason
              <select className="input-field mt-1" value={reason} onChange={(event) => setReason(event.target.value as WasteReason)}>
                {reasons.map((item) => (
                  <option key={item} value={item}>{wasteReasonLabels[item]}</option>
                ))}
              </select>
            </label>
            <label className="text-sm text-ink">
              Destination
              <select className="input-field mt-1" value={destination} onChange={(event) => setDestination(event.target.value as WasteDestination)}>
                {destinations.map((item) => (
                  <option key={item} value={item}>{wasteDestinationLabels[item]}</option>
                ))}
              </select>
            </label>
            <label className="text-sm text-ink md:col-span-2">
              Note
              <input className="input-field mt-1" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional context for the record" />
            </label>
            <div className="flex flex-wrap items-center justify-between gap-3 md:col-span-2">
              <p className="text-sm text-ink-muted">Estimated value {formatCurrency(draftValue)}</p>
              <Button type="submit">Save waste event</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="overflow-hidden rounded-2xl border border-mint-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-mint-50 text-left text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Quantity</th>
              <th className="px-4 py-3">Reason</th>
              <th className="px-4 py-3">Destination</th>
              <th className="px-4 py-3">Predicted vs actual</th>
              <th className="px-4 py-3">Value</th>
            </tr>
          </thead>
          <tbody>
            {events.map((item) => (
              <tr key={item.id} className="border-t border-mint-100">
                <td className="px-4 py-4">
                  <p className="font-medium text-ink">{item.productName}</p>
                  <p className="text-xs text-ink-muted">{item.recordedAt}{item.batchRef ? ` · ${item.batchRef}` : ""}</p>
                </td>
                <td className="px-4 py-4 text-ink-muted">{item.quantity} {item.unit}</td>
                <td className="px-4 py-4 text-ink-muted">{wasteReasonLabels[item.reason]}</td>
                <td className="px-4 py-4 text-ink-muted">{wasteDestinationLabels[item.destination]}</td>
                <td className="px-4 py-4 text-ink-muted">
                  <p>{item.predictedExposure ?? "—"}</p>
                  {item.linkedAction && <p className="mt-1 text-xs">{item.linkedAction}</p>}
                  {item.note && <p className="mt-1 text-xs">{item.note}</p>}
                </td>
                <td className="px-4 py-4 font-medium text-ink">{formatCurrency(item.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function summarise(events: WasteEvent[]) {
  const tally = (key: (event: WasteEvent) => string) => {
    const map = new Map<string, { count: number; value: number }>();
    for (const event of events) {
      const label = key(event);
      const current = map.get(label) ?? { count: 0, value: 0 };
      current.count += 1;
      current.value += event.value;
      map.set(label, current);
    }
    return [...map.entries()].map(([label, stats]) => ({ label, ...stats }));
  };

  return {
    valueLost: events.reduce((sum, event) => sum + event.value, 0),
    linked: events.filter((event) => event.linkedAction).length,
    categories: tally((event) => event.category),
    reasons: tally((event) => wasteReasonLabels[event.reason]),
    destinations: tally((event) => wasteDestinationLabels[event.destination]),
  };
}

function Summary({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs text-ink-muted">{label}</p>
        <p className="mt-2 font-serif text-2xl text-ink">{value}</p>
        <p className="mt-1 text-xs text-ink-muted">{detail}</p>
      </CardContent>
    </Card>
  );
}

function Breakdown({ title, rows }: { title: string; rows: Array<{ label: string; count: number; value: number }> }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">{title}</p>
        <ul className="mt-3 space-y-2">
          {rows.map((row) => (
            <li key={row.label} className="flex items-center justify-between gap-3 text-sm">
              <span className="text-ink">{row.label}</span>
              <span className="flex items-center gap-2 text-ink-muted">
                <Badge>{row.count}</Badge>
                {formatCurrency(row.value)}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
