import { DashboardHeader } from "@/components/layout/dashboard-sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { recommendations } from "@/lib/data/demo";
import { formatCurrency } from "@/lib/utils";
import { Shield } from "lucide-react";

const actionLabels = {
  reduce_order: "Reduce order",
  reduce_production: "Reduce production",
  use_recipe: "Use in recipe",
  freeze: "Freeze",
  markdown: "Markdown",
  confirm_stock: "Confirm stock",
};

export default function RecommendationsPage() {
  return (
    <div>
      <DashboardHeader
        title="Recommendations"
        description="Rescue optimiser — uncertainty-aware actions with explainable binding constraints"
      />
      <div className="p-6 space-y-4">
        {recommendations.map((rec) => (
          <Card key={rec.id}>
            <CardContent className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-ink">{rec.productName}</h3>
                    <Badge variant="priority" priority={rec.priority}>{rec.priority}</Badge>
                    <Badge>{actionLabels[rec.actionType]}</Badge>
                    {rec.safetyValidated && (
                      <span className="flex items-center gap-1 text-xs text-mint-600">
                        <Shield className="h-3 w-3" /> Safety validated
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm font-medium text-mint-700">{rec.action}</p>
                  <p className="mt-1 text-xs text-ink-muted">Created {rec.createdAt}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-ink-muted">Expected value</p>
                  <p className="text-lg font-bold text-ink">
                    {formatCurrency(rec.expectedValue.min)}–{formatCurrency(rec.expectedValue.max)}
                  </p>
                  <Badge variant="confidence" confidence={rec.confidence} className="mt-1">
                    {rec.confidence}% confidence
                  </Badge>
                </div>
              </div>

              {(rec.forecastDemand || rec.plannedProduction || rec.existingStock) && (
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {rec.forecastDemand && (
                    <Stat label="Forecast demand" value={`${rec.forecastDemand.min}–${rec.forecastDemand.max}`} />
                  )}
                  {rec.plannedProduction && (
                    <Stat label="Planned production" value={String(rec.plannedProduction)} />
                  )}
                  {rec.existingStock && (
                    <Stat
                      label="Existing stock"
                      value={`${rec.existingStock.min}–${rec.existingStock.max} ${rec.existingStock.unit}`}
                    />
                  )}
                </div>
              )}

              <details className="mt-4 rounded-xl bg-mint-50 px-3 py-2.5">
                <summary className="cursor-pointer list-none text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-muted">
                  Explanation <span className="float-right text-mint-600">View details</span>
                </summary>
                <ul className="mt-2 space-y-1 text-sm text-ink-muted">
                  {rec.explanation.map((line) => (
                    <li key={line}>• {line}</li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-ink-muted">
                  Binding constraint: {rec.bindingConstraint}
                </p>
              </details>

              <div className="mt-4 flex gap-2">
                <Button size="sm">Accept</Button>
                <Button size="sm" variant="outline">Modify</Button>
                <Button size="sm" variant="ghost">Reject</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-mint-100 bg-white px-3 py-2">
      <p className="text-xs text-ink-muted">{label}</p>
      <p className="font-medium text-ink">{value}</p>
    </div>
  );
}
