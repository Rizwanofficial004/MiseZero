import { WeeklyProtectedChart } from "@/components/charts/dashboard-charts";
import { DashboardHeader } from "@/components/layout/dashboard-sidebar";
import { Badge } from "@/components/ui/badge";
import { getOutcomes } from "@/lib/data";
import { formatCurrency, formatMoneyRange } from "@/lib/utils";

export default function OutcomesPage() {
  return (
    <div>
      <DashboardHeader
        title="Outcomes & Learning"
        description="Expected commercial impact compared with what actually happened"
      />
      <div className="p-6">
        <div className="mb-5">
          <WeeklyProtectedChart />
        </div>
        <div className="overflow-hidden rounded-2xl border border-mint-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-mint-50 text-left text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Recommendation</th>
                <th className="px-4 py-3">Staff response</th>
                <th className="px-4 py-3">Actual outcome</th>
                <th className="px-4 py-3">Expected impact</th>
                <th className="px-4 py-3">Observed outcome</th>
              </tr>
            </thead>
            <tbody>
              {getOutcomes().map((o) => (
                <tr key={o.id} className="border-t border-mint-100">
                  <td className="px-4 py-4">
                    <p className="font-medium text-ink">{o.productName}</p>
                    <p className="text-xs text-ink-muted">{o.recordedAt}</p>
                  </td>
                  <td className="px-4 py-4 text-ink-muted">
                    <p>{o.recommendation}</p>
                    <p className="text-xs text-ink-muted mt-1">
                      Est: {o.inventoryEstimate} · {o.confidence}% conf
                    </p>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={o.staffResponse === "accepted" ? "success" : "warning"}>
                      {o.staffResponse}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-ink-muted">
                    {o.actualProduction !== undefined && <p>Prod: {o.actualProduction}</p>}
                    {o.actualSales !== undefined && <p>Sales: {o.actualSales}</p>}
                    {o.actualWaste !== undefined && <p>Waste: {o.actualWaste}</p>}
                  </td>
                  <td className="px-4 py-4 text-ink-muted">
                    {formatMoneyRange(o.expectedImpact.min, o.expectedImpact.max)}
                  </td>
                  <td className="px-4 py-4 font-medium text-mint-700">
                    {formatCurrency(o.commercialImpact)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
