"use client";

import { WeeklyProtectedChart } from "@/components/charts/dashboard-charts";
import { DashboardHeader } from "@/components/layout/dashboard-sidebar";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { formatVenue } from "@/lib/dates";
import { useDemo } from "@/services/useDemo";

export default function OutcomesPage() {
  const demo = useDemo();
  const done = demo.actions.filter((action) => action.status === "done" && action.outcome);

  return (
    <div>
      <DashboardHeader
        title="Outcomes & Learning"
        description="Expected commercial impact compared with what actually happened"
      />
      <div className="p-6">
        <div className="mb-5">
          <WeeklyProtectedChart points={demo.week} />
        </div>
        {done.length === 0 ? (
          <p className="rounded-xl border border-dashed border-mint-200 bg-white px-4 py-6 text-sm text-ink-muted">
            No completed actions yet. Accept an action on the hub, then mark it done with quantity saved, quantity wasted, and value.
          </p>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-mint-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-mint-50 text-left text-xs uppercase tracking-wide text-ink-muted">
                <tr>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Recommendation</th>
                  <th className="px-4 py-3">Staff response</th>
                  <th className="px-4 py-3">Actual outcome</th>
                  <th className="px-4 py-3">Observed value</th>
                </tr>
              </thead>
              <tbody>
                {done.map((action) => {
                  const product = demo.products.find((item) => item.id === action.productId);
                  return (
                    <tr key={action.id} className="border-t border-mint-100">
                      <td className="px-4 py-4">
                        <p className="font-medium text-ink">{product?.name ?? "Product"}</p>
                        <p className="text-xs text-ink-muted">{action.outcome ? formatVenue(action.outcome.recordedAt, demo.venue.timezone) : ""}</p>
                      </td>
                      <td className="px-4 py-4 text-ink-muted">{action.title}</td>
                      <td className="px-4 py-4"><Badge variant="success">{action.status}</Badge></td>
                      <td className="px-4 py-4 text-ink-muted">
                        Saved {action.outcome?.qtySaved} · wasted {action.outcome?.qtyWasted}
                        {action.modification ? ` · ${action.modification}` : ""}
                      </td>
                      <td className="px-4 py-4 font-medium text-mint-700">{formatCurrency(action.outcome?.value ?? 0)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
