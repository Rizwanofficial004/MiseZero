"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { TodayAction } from "@/lib/data";
import { formatCurrency, formatMoneyRange, formatRange } from "@/lib/utils";
import { Clock3, ShieldCheck } from "lucide-react";

type Response =
  | { kind: "pending" }
  | { kind: "accepted" }
  | { kind: "modified"; note: string }
  | { kind: "confirmed"; quantity: string };

export function ActionCard({ action, index }: { action: TodayAction; index: number }) {
  const [response, setResponse] = useState<Response>({ kind: "pending" });
  const [mode, setMode] = useState<"none" | "modify" | "confirm">("none");
  const [note, setNote] = useState(action.recommendedAction);
  const [quantity, setQuantity] = useState(String(action.estimate.mostLikely));

  const accent =
    action.priority === "high" ? "bg-rose-400" : action.priority === "medium" ? "bg-amber-400" : "bg-mint-400";

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
                  <p className="mt-1 text-sm font-medium text-mint-700">{action.recommendedAction}</p>
                </div>
              </div>
              <p className="text-right text-xs text-ink-muted">
                Expected impact
                <span className="mt-0.5 block text-sm font-semibold text-ink">
                  {formatMoneyRange(action.expectedImpact.min, action.expectedImpact.max)}
                </span>
              </p>
            </div>

            <p className="rounded-lg bg-mint-50 px-3 py-2 text-sm text-ink">{action.reason}</p>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <Metric
                label="Estimated remaining"
                value={formatRange(action.estimate.min, action.estimate.max, action.estimate.unit)}
                sub={`Most likely ${action.estimate.mostLikely} ${action.estimate.unit}`}
              />
              <Metric
                label="Confidence"
                value={`${action.estimate.confidence}%`}
                badge={
                  <Badge variant="confidence" confidence={action.estimate.confidence}>
                    {action.estimate.confidence}%
                  </Badge>
                }
              />
              <Metric
                label="Action deadline"
                value={action.safetyWindowCloses}
                sub={`Product life: ${action.productDeadline}`}
                icon={<Clock3 className="h-3.5 w-3.5" strokeWidth={1.75} />}
              />
              <Metric
                label="Value exposed"
                value={formatCurrency(action.valueAtRisk)}
                sub={
                  action.probableSurplus
                    ? `Surplus ${formatRange(action.probableSurplus.min, action.probableSurplus.max, action.probableSurplus.unit)}`
                    : undefined
                }
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

            {response.kind === "pending" ? (
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" onClick={() => setResponse({ kind: "accepted" })}>
                    Accept
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setMode(mode === "modify" ? "none" : "modify")}>
                    Modify
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setMode(mode === "confirm" ? "none" : "confirm")}>
                    Confirm stock
                  </Button>
                </div>
                {mode === "modify" && (
                  <form
                    className="rounded-lg border border-mint-200 bg-white p-3"
                    onSubmit={(event) => {
                      event.preventDefault();
                      setResponse({ kind: "modified", note });
                      setMode("none");
                    }}
                  >
                    <label className="text-xs font-medium text-ink" htmlFor={`modify-${action.id}`}>
                      Adjust the recommendation
                    </label>
                    <textarea
                      id={`modify-${action.id}`}
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      className="input-field mt-1 min-h-20"
                    />
                    <Button size="sm" className="mt-2" type="submit">
                      Save modification
                    </Button>
                  </form>
                )}
                {mode === "confirm" && (
                  <form
                    className="rounded-lg border border-mint-200 bg-white p-3"
                    onSubmit={(event) => {
                      event.preventDefault();
                      setResponse({ kind: "confirmed", quantity });
                      setMode("none");
                    }}
                  >
                    <label className="text-xs font-medium text-ink" htmlFor={`qty-${action.id}`}>
                      Approximate quantity remaining ({action.estimate.unit})
                    </label>
                    <input
                      id={`qty-${action.id}`}
                      value={quantity}
                      onChange={(event) => setQuantity(event.target.value)}
                      inputMode="decimal"
                      className="input-field mt-1 max-w-40"
                    />
                    <Button size="sm" className="mt-2" type="submit">
                      Save confirmation
                    </Button>
                  </form>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-mint-200 bg-mint-50 px-3 py-2 text-sm text-ink">
                <p>
                  {response.kind === "accepted" && "Accepted. This response is stored for outcome learning."}
                  {response.kind === "modified" && `Modified: ${response.note}`}
                  {response.kind === "confirmed" &&
                    `Confirmed ${response.quantity} ${action.estimate.unit}. The estimate can tighten around this check.`}
                </p>
                <Button size="sm" variant="ghost" onClick={() => setResponse({ kind: "pending" })}>
                  Undo
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
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
