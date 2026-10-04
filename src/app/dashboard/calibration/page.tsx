"use client";

import { AiBadge } from "@/components/ui/ai-badge";
import { DashboardHeader } from "@/components/layout/dashboard-sidebar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SHADOW } from "@/engine/constants";
import { useDemo } from "@/services/useDemo";

export default function CalibrationPage() {
  const demo = useDemo();
  const cream = demo.views.find((view) => view.productId === "prod_cream") ?? demo.views[0];
  const metrics = [
    { label: "Base variance", value: SHADOW.baseVariancePct, unit: "%", target: SHADOW.baseVariancePct, description: "Starting half-width on the day of a count." },
    { label: "Daily widen", value: SHADOW.dailyWidenPct, unit: "%", target: SHADOW.dailyWidenPct, description: "Added to the half-width for each day since the last count." },
    { label: "Confidence cap", value: SHADOW.confidenceCap, unit: "", target: SHADOW.confidenceCap, description: "Confidence never reads as a certain count." },
    { label: "Average confidence", value: Math.round(demo.avgConfidence), unit: "%", target: 70, description: "Mean confidence across products in the catalogue." },
  ];

  return (
    <div>
      <DashboardHeader title="Calibration Dashboard" description="The weights behind confidence. A beta forecast does not change them." />
      <div className="p-6">
        <div className="mb-4"><AiBadge /></div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <Card key={metric.label}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <p className="text-xs text-ink-muted">{metric.label}</p>
                  <Badge variant={metric.value >= metric.target ? "success" : "warning"}>live</Badge>
                </div>
                <p className="mt-2 font-serif text-3xl text-ink">{metric.value}{metric.unit}</p>
                <p className="mt-2 text-xs text-ink-muted">{metric.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="mt-6">
          <CardContent className="p-5">
            <h3 className="font-semibold text-ink">Confidence parts{cream ? ` · ${cream.productName}` : ""}</h3>
            {cream ? (
              <p className="mt-2 text-sm text-ink-muted">{cream.explanation[2]}</p>
            ) : (
              <p className="mt-2 text-sm text-ink-muted">Add a product to see the confidence breakdown.</p>
            )}
            <p className="mt-3 text-sm text-ink-muted">
              Weights stay {SHADOW.weights.recency} recency, {SHADOW.weights.completeness} completeness, {SHADOW.weights.consistency} consistency. The forecast stub repeats the engine’s daily use and does not train on outcomes.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
