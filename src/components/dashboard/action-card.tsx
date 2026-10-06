"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { acceptAction, completeAction, dismissAction, modifyAction, undoAction } from "@/services/actionService";
import { confirmStock } from "@/services/inventoryService";
import type { HubAction } from "@/engine/present";
import { formatCurrency, formatRange } from "@/lib/utils";
import { Clock3, ShieldCheck } from "lucide-react";

export function ActionCard({ action, index }: { action: HubAction; index: number }) {
  const toast = useToast();
  const [mode, setMode] = useState<"none" | "modify" | "confirm" | "done">("none");
  const [note, setNote] = useState(action.title);
  const [quantity, setQuantity] = useState(String(action.expected));
  const [saved, setSaved] = useState(String(round(action.surplus)));
  const [wasted, setWasted] = useState("0");
  const [value, setValue] = useState(String(round(action.impact)));
  const [pending, setPending] = useState(false);

  const accent =
    action.priority === "high" ? "bg-rose-400" : action.priority === "medium" ? "bg-amber-400" : "bg-mint-400";

  const run = async (work: () => Promise<void>, success: string) => {
    setPending(true);
    try {
      await work();
      toast.push(success);
      setMode("none");
    } catch (error) {
      toast.push(error instanceof Error ? error.message : "Could not save that", "error");
    } finally {
      setPending(false);
    }
  };

  return (
    <Card className="overflow-hidden transition-colors duration-200 hover:border-mint-300">
      <CardContent className="p-0">
        <div className="flex">
          <div className={`w-1.5 shrink-0 ${accent}`} />
          <div className="flex flex-1 flex-col gap-3.5 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-mint-100 text-xs font-bold text-mint-700">
                  {index + 1}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-ink">{action.productName}</h3>
                    <Badge variant="priority" priority={action.priority}>
                      {action.priority} priority
                    </Badge>
                    <span className="text-xs text-ink-muted">{action.category}</span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-mint-700">{action.title}</p>
                </div>
              </div>
              <p className="text-right text-xs text-ink-muted">
                Expected impact
                <span className="mt-0.5 block text-sm font-semibold text-ink">{formatCurrency(action.impact)}</span>
              </p>
            </div>

            <p className="rounded-lg bg-mint-50 px-3 py-2 text-sm text-ink">{action.reason}</p>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <Metric
                label="Estimated remaining"
                value={formatRange(round(action.low), round(action.high), action.unit)}
                sub={`Most likely ${round(action.expected)} ${action.unit}`}
              />
              <Metric
                label="Confidence"
                value={`${Math.round(action.confidence)}%`}
                badge={
                  <Badge variant="confidence" confidence={action.confidence}>
                    {Math.round(action.confidence)}%
                  </Badge>
                }
              />
              <Metric
                label="Action deadline"
                value={action.actByLabel}
                sub={`Product life: ${action.useByLabel}`}
                icon={<Clock3 className="h-3.5 w-3.5" strokeWidth={1.75} />}
              />
              <Metric
                label="Value exposed"
                value={formatCurrency(action.valueAtRisk)}
                sub={`Surplus ${round(action.surplus)} ${action.unit}`}
              />
            </div>

            <details className="rounded-lg bg-[#f7faf8] px-3 py-2.5">
              <summary className="cursor-pointer list-none text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                Why this was flagged <span className="float-right text-mint-600">View details</span>
              </summary>
              <ul className="mt-2 space-y-1 text-sm text-ink-muted">
                {action.explanation.map((line) => (
                  <li key={line}>• {line}</li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-ink-muted">
                <ShieldCheck className="mr-1 inline h-3.5 w-3.5 text-mint-600" strokeWidth={1.75} />
                Binding constraint: {action.bindingConstraint}
              </p>
            </details>

            {action.status === "pending" ? (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" disabled={pending} onClick={() => run(() => acceptAction({ productId: action.productId, optionId: action.optionId, title: action.title, detail: action.reason }), "Action accepted")}>
                    Accept
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setMode(mode === "modify" ? "none" : "modify")}>
                    Modify
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setMode(mode === "confirm" ? "none" : "confirm")}>
                    Confirm stock
                  </Button>
                  <Button size="sm" variant="ghost" disabled={pending} onClick={() => run(() => dismissAction({ productId: action.productId, optionId: action.optionId, title: action.title }), "Action dismissed")}>
                    Dismiss
                  </Button>
                </div>
                {mode === "modify" && (
                  <form
                    className="rounded-lg border border-mint-200 bg-white p-3"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void run(() => modifyAction({ productId: action.productId, optionId: action.optionId, title: action.title, detail: action.reason, modification: note }), "Modification saved");
                    }}
                  >
                    <label className="text-xs font-medium text-ink" htmlFor={`modify-${action.id}`}>
                      Adjust the recommendation
                    </label>
                    <textarea id={`modify-${action.id}`} value={note} onChange={(event) => setNote(event.target.value)} className="input-field mt-1 min-h-20" />
                    <Button size="sm" className="mt-2" type="submit" disabled={pending}>
                      Save modification
                    </Button>
                  </form>
                )}
                {mode === "confirm" && (
                  <form
                    className="rounded-lg border border-mint-200 bg-white p-3"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void run(() => confirmStock(action.productId, Number(quantity)), "Stock confirmation saved");
                    }}
                  >
                    <label className="text-xs font-medium text-ink" htmlFor={`qty-${action.id}`}>
                      Approximate quantity remaining ({action.unit})
                    </label>
                    <input
                      id={`qty-${action.id}`}
                      value={quantity}
                      onChange={(event) => setQuantity(event.target.value)}
                      inputMode="decimal"
                      className="input-field mt-1 max-w-40"
                    />
                    <Button size="sm" className="mt-2" type="submit" disabled={pending}>
                      Save confirmation
                    </Button>
                  </form>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-mint-200 bg-mint-50 px-3 py-2 text-sm text-ink">
                  <p>{action.status === "accepted" ? "Accepted." : "Modified. The note is stored with the action."}</p>
                  <Button size="sm" variant="ghost" disabled={pending} onClick={() => run(() => undoAction(action.productId), "Response cleared")}>
                    Undo
                  </Button>
                </div>
                {mode === "done" ? (
                  <form
                    className="grid gap-2 rounded-lg border border-mint-200 bg-white p-3 sm:grid-cols-3"
                    onSubmit={(event) => {
                      event.preventDefault();
                      void run(
                        () => completeAction({ productId: action.productId, qtySaved: Number(saved), qtyWasted: Number(wasted), value: Number(value) }),
                        "Outcome recorded",
                      );
                    }}
                  >
                    <label className="text-xs text-ink">
                      Qty saved
                      <input className="input-field mt-1" value={saved} onChange={(event) => setSaved(event.target.value)} inputMode="decimal" />
                    </label>
                    <label className="text-xs text-ink">
                      Qty wasted
                      <input className="input-field mt-1" value={wasted} onChange={(event) => setWasted(event.target.value)} inputMode="decimal" />
                    </label>
                    <label className="text-xs text-ink">
                      Value protected (£)
                      <input className="input-field mt-1" value={value} onChange={(event) => setValue(event.target.value)} inputMode="decimal" />
                    </label>
                    <Button size="sm" className="sm:col-span-3" type="submit" disabled={pending}>
                      Save outcome
                    </Button>
                  </form>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setMode("done")}>
                    Mark done
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

function Metric({
  label,
  value,
  sub,
  icon,
  badge,
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-[11px] text-ink-muted">{label}</p>
      <div className="mt-0.5 flex items-center gap-1.5 text-xs font-semibold text-ink">
        {icon}
        {badge ?? value}
      </div>
      {sub && <p className="text-xs text-ink-muted/80">{sub}</p>}
    </div>
  );
}
