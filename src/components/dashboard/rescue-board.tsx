"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Recommendation } from "@/lib/data";
import { formatMoneyRange } from "@/lib/utils";
import { Shield } from "lucide-react";

const actionLabels = {
  reduce_order: "Reduce order",
  reduce_production: "Reduce production",
  use_recipe: "Use in recipe",
  freeze: "Freeze",
  markdown: "Markdown",
  confirm_stock: "Confirm stock",
  combined: "Combined response",
};

export function RescueBoard({ recommendations }: { recommendations: Recommendation[] }) {
  return (
    <div className="space-y-4">
      {recommendations.map((rec) => (
        <RescueCard key={rec.id} rec={rec} />
      ))}
    </div>
  );
}

function RescueCard({ rec }: { rec: Recommendation }) {
  const [status, setStatus] = useState(rec.status);
  const [note, setNote] = useState("");
  const [editing, setEditing] = useState(false);

  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-ink">{rec.productName}</h3>
              <Badge variant="priority" priority={rec.priority}>{rec.priority}</Badge>
              <Badge>{actionLabels[rec.actionType]}</Badge>
              {rec.safetyValidated && (
                <span className="flex items-center gap-1 text-xs text-mint-600">
                  <Shield className="h-3 w-3" /> Inside the safety window
                </span>
              )}
            </div>
            <p className="mt-2 text-sm font-medium text-mint-700">{rec.action}</p>
            <p className="mt-2 max-w-3xl text-sm text-ink-muted">{rec.reason}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-ink-muted">Expected commercial impact</p>
            <p className="text-lg font-bold text-ink">
              {formatMoneyRange(rec.expectedValue.min, rec.expectedValue.max)}
            </p>
            <Badge variant="confidence" confidence={rec.confidence} className="mt-1">
              {rec.confidence}% confidence
            </Badge>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="pb-2 pr-4">Option</th>
                <th className="pb-2 pr-4">Decision consideration</th>
                <th className="pb-2 pr-4">Deadline</th>
                <th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {rec.options.map((option) => (
                <tr key={option.id} className="border-t border-mint-100">
                  <td className="py-2 pr-4 font-medium text-ink">{option.label}</td>
                  <td className="py-2 pr-4 text-ink-muted">{option.consideration}</td>
                  <td className="py-2 pr-4 text-ink-muted">{option.deadline ?? "—"}</td>
                  <td className="py-2">
                    {!option.feasible && <Badge variant="warning">Not feasible</Badge>}
                    {option.feasible && option.selected && <Badge variant="success">Selected</Badge>}
                    {option.feasible && !option.selected && <span className="text-xs text-ink-muted">Considered</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {status === "pending" ? (
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => setStatus("accepted")}>Accept</Button>
              <Button size="sm" variant="outline" onClick={() => setEditing((open) => !open)}>Modify</Button>
              <Button size="sm" variant="ghost" onClick={() => setStatus("rejected")}>Reject</Button>
            </div>
            {editing && (
              <form
                className="rounded-lg border border-mint-200 p-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  setStatus("modified");
                  setEditing(false);
                }}
              >
                <label className="text-xs font-medium text-ink" htmlFor={`note-${rec.id}`}>
                  What should change?
                </label>
                <input
                  id={`note-${rec.id}`}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="For example, cut the order by 2 L instead of 1 L"
                  className="input-field mt-1"
                />
                <Button size="sm" className="mt-2" type="submit">Save modification</Button>
              </form>
            )}
          </div>
        ) : (
          <p className="mt-4 rounded-lg bg-mint-50 px-3 py-2 text-sm text-ink">
            {status === "accepted" && "Accepted. The outcome will be compared with this expected impact."}
            {status === "modified" && `Modified${note ? `: ${note}` : ""}. The change is kept for learning.`}
            {status === "rejected" && "Rejected. The reason can be used the next time this pattern appears."}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
