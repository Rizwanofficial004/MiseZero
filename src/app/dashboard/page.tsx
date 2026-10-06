"use client";

import { ActionCard } from "@/components/dashboard/action-card";
import { ConfidenceDonut, WeeklyProtectedChart } from "@/components/charts/dashboard-charts";
import { Sparkline } from "@/components/charts/sparkline";
import { DashboardHeader } from "@/components/layout/dashboard-sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDemo } from "@/services/useDemo";
import { formatCurrency } from "@/lib/utils";
import { Boxes, Clock3, ShieldCheck, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const demo = useDemo();
  const actions = demo.hub;
  const confidenceSeries = demo.views.map((view) => Math.round(view.math.confidence));
  const wasteSeries = demo.week.map((point) => point.waste);
  const spark = confidenceSeries.length > 1 ? confidenceSeries : [0, demo.avgConfidence];

  return (
    <div>
      <DashboardHeader
        title="Daily Action Hub"
        description="What needs attention, by when, and what to do — a 60–90 second review"
      />
      <div className="p-6 pt-3">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={<TrendingUp className="h-4 w-4" strokeWidth={1.75} />}
            label="Value protected (week)"
            value={formatCurrency(demo.valueProtected)}
            spark={wasteSeries.length > 1 ? wasteSeries : [0, demo.valueProtected]}
          />
          <SummaryCard
            icon={<Boxes className="h-4 w-4" strokeWidth={1.75} />}
            label="Actions today"
            value={String(actions.length)}
            sub={`${demo.confirmationsNeeded} confirmation${demo.confirmationsNeeded === 1 ? "" : "s"} needed`}
            spark={spark}
          />
          <SummaryCard
            icon={<ShieldCheck className="h-4 w-4" strokeWidth={1.75} />}
            label="Avg inventory confidence"
            value={`${Math.round(demo.avgConfidence)}%`}
            spark={spark}
          />
          <SummaryCard
            icon={<Clock3 className="h-4 w-4" strokeWidth={1.75} />}
            label="Checks waiting"
            value={String(demo.confirmationsNeeded)}
            sub="Wide range, low confidence, value, or use-by inside 48h"
            spark={spark}
          />
        </div>

        <Card className="mt-5 border-mint-200 bg-mint-50/80">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
            <div>
              <p className="text-sm font-semibold text-ink">
                {actions.length === 0
                  ? "Nothing is waiting. New deliveries, sales, or waste will refill this list."
                  : `${actions.length} items need a decision before the afternoon cut-off`}
              </p>
              <ol className="mt-2 space-y-1 text-sm text-ink-muted">
                {actions.map((action, index) => (
                  <li key={action.id}>
                    {index + 1}. {action.productName} — {action.title}
                  </li>
                ))}
              </ol>
            </div>
            <Badge variant="success">Safety violations: {demo.views.filter((view) => view.status === "do_not_serve").length}</Badge>
          </CardContent>
        </Card>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <WeeklyProtectedChart points={demo.week} />
          </div>
          <ConfidenceDonut mix={demo.confidenceMix} />
        </div>

        <div className="mt-8 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-ink-muted">Priority action list</h2>
          {actions.length === 0 && (
            <p className="rounded-xl border border-dashed border-mint-200 bg-white px-4 py-6 text-sm text-ink-muted">
              No open actions. Accept one from Rescue Optimiser, or add a short-dated delivery.
            </p>
          )}
          {actions.map((action, index) => (
            <ActionCard key={action.id} action={action} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  sub,
  spark,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  spark: number[];
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-mint-700">
              {icon}
              <span className="text-xs font-medium text-ink-muted">{label}</span>
            </div>
            <p className="mt-2 font-serif text-3xl text-ink">{value}</p>
            {sub && <p className="text-xs text-ink-muted">{sub}</p>}
          </div>
          <Sparkline data={spark} />
        </div>
      </CardContent>
    </Card>
  );
}
