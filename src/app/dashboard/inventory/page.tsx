import { ConfidenceDonut } from "@/components/charts/dashboard-charts";
import { DashboardHeader } from "@/components/layout/dashboard-sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { inventory } from "@/lib/data/demo";
import { formatCurrency, formatRange } from "@/lib/utils";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function InventoryPage() {
  return (
    <div>
      <DashboardHeader
        title="Stock Estimates"
        description="Perishable-state estimator — quantity ranges and confidence, not false precision"
      />
      <div className="p-6">
        <div className="grid gap-5 xl:grid-cols-3">
          <div className="overflow-hidden rounded-2xl border border-mint-200 bg-white xl:col-span-2">
          <table className="w-full text-sm">
            <thead className="bg-mint-50 text-left text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Estimated remaining</th>
                <th className="px-4 py-3">Confidence</th>
                <th className="px-4 py-3">Value at risk</th>
                <th className="px-4 py-3">Safety window</th>
                <th className="px-4 py-3">POS linked</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.id} className="border-t border-mint-100">
                  <td className="px-4 py-4">
                    <p className="font-medium text-ink">{item.productName}</p>
                    <p className="text-xs text-ink-muted">{item.category}</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-medium text-ink">
                      {formatRange(item.estimate.min, item.estimate.max, item.estimate.unit)}
                    </p>
                    <p className="text-xs text-ink-muted">
                      Likely: {item.estimate.mostLikely} {item.estimate.unit}
                    </p>
                    <p className="mt-1 text-xs text-ink-muted">
                      Delivered {item.deliveredQty} · Recipe use ~{item.recipeUsage}
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant="confidence" confidence={item.estimate.confidence}>
                      {item.estimate.confidence}%
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-ink">{formatCurrency(item.valueAtRisk)}</td>
                  <td className="px-4 py-4 text-ink-muted">{item.safetyWindowCloses}</td>
                  <td className="px-4 py-4">
                    {item.posLinked ? (
                      <CheckCircle2 className="h-4 w-4 text-mint-600" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {item.confirmationRequired ? (
                      <Button size="sm" variant="outline">Quick check</Button>
                    ) : (
                      <span className="text-xs text-ink-muted">No action</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <ConfidenceDonut />
        </div>

        <Card className="mt-6">
          <CardContent className="p-5">
            <h3 className="font-medium text-ink">Deterministic baseline comparison</h3>
            <p className="mt-2 text-sm text-ink-muted">
              Conventional: Delivered − Recipe usage = Remaining (e.g. cream: 12 − 4.5 = 7.5 L)
            </p>
            <p className="mt-2 text-sm text-mint-700">
              MiseZero: 3.8–5.6 L at 64% confidence — accounts for unrecorded shrinkage ({inventory[0].unrecordedShrinkage.min}–{inventory[0].unrecordedShrinkage.max} L) and batch usage uncertainty.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
