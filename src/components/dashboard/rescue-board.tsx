"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { acceptAction, dismissAction, modifyAction } from "@/services/actionService";
import { useDemo } from "@/services/useDemo";
import { formatCurrency } from "@/lib/utils";
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

export function RescueBoard() {
  const demo = useDemo();
  if (demo.rescues.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-mint-200 bg-white px-4 py-6 text-sm text-ink-muted">
        No surplus is waiting. Rescue options appear when expected stock exceeds use before the deadline.
      </p>
    );
  }
  return (
    <div className="space-y-4">
      {demo.rescues.map((rec) => (
        <RescueCard key={rec.id} rec={rec} />
      ))}
    </div>
  );
}

function RescueCard({ rec }: { rec: ReturnType<typeof useDemo>["rescues"][number] }) {
  const toast = useToast();
  const [note, setNote] = useState("");
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState(false);
  const selected = rec.options.find((option) => option.selected) ?? rec.options.find((option) => option.feasible);

  const run = async (work: () => Promise<void>, success: string) => {
    setPending(true);
    try {
      await work();
      toast.push(success);
      setEditing(false);
    } catch (error) {
      toast.push(error instanceof Error ? error.message : "Could not save that", "error");
    } finally {
      setPending(false);
    }
  };

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
            <p className="text-lg font-bold text-ink">{formatCurrency(rec.expectedValue)}</p>
            <Badge variant="confidence" confidence={rec.confidence} className="mt-1">
              {Math.round(rec.confidence)}% confidence
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

        {rec.status === "pending" && selected ? (
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                disabled={pending || !selected.feasible}
                onClick={() => run(() => acceptAction({ productId: rec.productId, optionId: selected.id, title: selected.label, detail: rec.reason }), "Action accepted")}
              >
                Accept
              </Button>
              <Button size="sm" variant="outline" onClick={() => setEditing((open) => !open)}>Modify</Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={pending}
                onClick={() => run(() => dismissAction({ productId: rec.productId, optionId: selected.id, title: selected.label }), "Action dismissed")}
              >
                Reject
              </Button>
            </div>
            {editing && (
              <form
                className="rounded-lg border border-mint-200 p-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  void run(
                    () => modifyAction({ productId: rec.productId, optionId: selected.id, title: selected.label, detail: rec.reason, modification: note }),
                    "Modification saved",
                  );
                }}
              >
                <label className="text-xs font-medium text-ink" htmlFor={`note-${rec.id}`}>What should change?</label>
                <input id={`note-${rec.id}`} value={note} onChange={(event) => setNote(event.target.value)} className="input-field mt-1" />
                <Button size="sm" className="mt-2" type="submit" disabled={pending}>Save modification</Button>
              </form>
            )}
          </div>
        ) : (
          <p className="mt-4 rounded-lg bg-mint-50 px-3 py-2 text-sm text-ink">
            {rec.status === "accepted" && "Accepted. Mark it done on the Daily Action Hub to store the outcome."}
            {rec.status === "modified" && "Modified. The change is stored with the action."}
            {rec.status === "rejected" && "Dismissed. It stays out of the action list."}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
