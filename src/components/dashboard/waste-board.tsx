"use client";

import { useMemo, useState, type FormEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { buildEvidence, evidenceToCsv } from "@/engine/evidence";
import { addDays } from "@/lib/dates";
import { wasteDestinationLabels, wasteReasonLabels } from "@/lib/labels";
import type { WasteDestination, WasteReason } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { deleteWaste, recordWaste } from "@/services/wasteService";
import { useDemo } from "@/services/useDemo";

const reasons = Object.keys(wasteReasonLabels) as WasteReason[];
const destinations = Object.keys(wasteDestinationLabels) as WasteDestination[];

export function WasteBoard() {
  const demo = useDemo();
  const toast = useToast();
  const [from, setFrom] = useState(addDays(new Date(), -13, 0).slice(0, 10));
  const [to, setTo] = useState(addDays(new Date(), 1, 20).slice(0, 10));
  const [productId, setProductId] = useState(demo.products[0]?.id ?? "");
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState<WasteReason>("expiry");
  const [destination, setDestination] = useState<WasteDestination>("disposal");
  const [note, setNote] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const pack = useMemo(
    () => buildEvidence(demo.waste, demo.actions, demo.products, new Date(from).toISOString(), new Date(`${to}T23:59:59`).toISOString()),
    [demo.waste, demo.actions, demo.products, from, to],
  );
  const selected = demo.products.find((product) => product.id === productId);
  const draftValue = (Number(quantity) || 0) * (selected?.unitCost ?? 0);
  const maxTrend = Math.max(1, ...pack.byDay.map((point) => point.value));
  const summary = summarise(pack.events);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setPending(true);
    try {
      await recordWaste({ id: editing ?? undefined, productId, qty: Number(quantity), reason, destination, note });
      toast.push(editing ? "Waste event updated" : "Waste event saved");
      setEditing(null);
      setNote("");
    } catch (error) {
      toast.push(error instanceof Error ? error.message : "Could not save waste", "error");
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-5" id="evidence-pack">
      <div className="no-print flex flex-wrap items-end gap-3">
        <label className="text-sm text-ink">
          From
          <input className="input-field mt-1" type="date" value={from} onChange={(event) => setFrom(event.target.value)} />
        </label>
        <label className="text-sm text-ink">
          To
          <input className="input-field mt-1" type="date" value={to} onChange={(event) => setTo(event.target.value)} />
        </label>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            const blob = new Blob([evidenceToCsv(pack)], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "misezero-evidence.csv";
            link.click();
            URL.revokeObjectURL(url);
          }}
        >
          Download CSV
        </Button>
        <Button type="button" variant="outline" onClick={() => window.print()}>
          Printable view
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Summary label="Value lost" value={formatCurrency(pack.valueLost)} detail={`${pack.events.length} recorded events`} />
        <Summary label="Value protected" value={formatCurrency(pack.valueProtected)} detail="From actions marked done in this range" />
        <Summary label="Quantity saved" value={String(Math.round(pack.qtySaved * 100) / 100)} detail="Completed action outcomes" />
        <Summary label="Quantity wasted" value={String(Math.round(pack.qtyWasted * 100) / 100)} detail="Recorded on completed actions" />
      </div>

      <Card>
        <CardContent className="p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">Recorded value by day</p>
          {pack.byDay.length === 0 ? (
            <p className="mt-4 text-sm text-ink-muted">No waste in this date range.</p>
          ) : (
            <div className="mt-4 flex items-end gap-3">
              {pack.byDay.map((point) => (
                <div key={point.day} className="flex flex-1 flex-col items-center gap-2">
                  <div className="flex h-24 w-full items-end rounded-lg bg-mint-50">
                    <div className="w-full rounded-lg bg-mint-500" style={{ height: `${Math.max(8, (point.value / maxTrend) * 100)}%` }} />
                  </div>
                  <span className="text-xs text-ink-muted">{point.day.slice(5)}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Breakdown title="By category" rows={summary.categories} />
        <Breakdown title="By reason" rows={summary.reasons} />
        <Breakdown title="By destination" rows={summary.destinations} />
      </div>

      <Card className="no-print">
        <CardContent className="p-5">
          <h2 className="font-semibold text-ink">{editing ? "Edit waste event" : "Record a waste event"}</h2>
          <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={(event) => void save(event)}>
            <label className="text-sm text-ink">
              Product
              <select className="input-field mt-1" value={productId} onChange={(event) => setProductId(event.target.value)}>
                {demo.products.map((product) => (
                  <option key={product.id} value={product.id}>{product.name}</option>
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
              <input className="input-field mt-1" value={note} onChange={(event) => setNote(event.target.value)} />
            </label>
            <div className="flex flex-wrap items-center justify-between gap-3 md:col-span-2">
              <p className="text-sm text-ink-muted">Estimated value {formatCurrency(draftValue)}</p>
              <Button type="submit" disabled={pending}>{editing ? "Update waste event" : "Save waste event"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="overflow-hidden rounded-2xl border border-mint-200 bg-white">
        {pack.events.length === 0 ? (
          <p className="px-4 py-6 text-sm text-ink-muted">No events in this range.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-mint-50 text-left text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Destination</th>
                <th className="px-4 py-3">Value</th>
                <th className="no-print px-4 py-3"> </th>
              </tr>
            </thead>
            <tbody>
              {pack.events.map((item) => (
                <tr key={item.id} className="border-t border-mint-100">
                  <td className="px-4 py-4">
                    <p className="font-medium text-ink">{item.productName}</p>
                    <p className="text-xs text-ink-muted">{new Date(item.date).toLocaleString("en-GB")}</p>
                  </td>
                  <td className="px-4 py-4 text-ink-muted">{item.qty} {item.unit}</td>
                  <td className="px-4 py-4 text-ink-muted">{wasteReasonLabels[item.reason]}</td>
                  <td className="px-4 py-4 text-ink-muted">{wasteDestinationLabels[item.destination]}</td>
                  <td className="px-4 py-4 font-medium text-ink">{formatCurrency(item.value)}</td>
                  <td className="no-print px-4 py-4">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditing(item.id);
                          setProductId(item.productId);
                          setQuantity(String(item.qty));
                          setReason(item.reason);
                          setDestination(item.destination);
                          setNote(item.note);
                        }}
                      >
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => void deleteWaste(item.id).then(() => toast.push("Waste event deleted"))}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pack.outcomes.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <h2 className="font-semibold text-ink">Completed actions in this range</h2>
            <ul className="mt-3 space-y-2 text-sm text-ink-muted">
              {pack.outcomes.map((action) => (
                <li key={action.id}>
                  {action.title} · saved {action.outcome?.qtySaved} · wasted {action.outcome?.qtyWasted} · {formatCurrency(action.outcome?.value ?? 0)}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function summarise(events: Array<{ category: string; reason: WasteReason; destination: WasteDestination; value: number }>) {
  const tally = (key: (event: (typeof events)[number]) => string) => {
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
        {rows.length === 0 ? <p className="mt-3 text-sm text-ink-muted">Nothing in this range.</p> : (
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
        )}
      </CardContent>
    </Card>
  );
}
