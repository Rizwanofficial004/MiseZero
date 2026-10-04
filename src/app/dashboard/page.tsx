import { ActionCard } from "@/components/dashboard/action-card";
import { ConfidenceDonut, WeeklyProtectedChart } from "@/components/charts/dashboard-charts";
import { Sparkline } from "@/components/charts/sparkline";
import { DashboardHeader } from "@/components/layout/dashboard-sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cafeProfile, dashboardSummary, getDailyActions, kpiSparklines } from "@/lib/data";
import { formatCurrency } from "@/lib/utils";
import { Boxes, Clock3, ShieldCheck, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const actions = getDailyActions();

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
            value={formatCurrency(dashboardSummary.valueProtectedThisWeek)}
            spark={kpiSparklines.protected}
          />
          <SummaryCard
            icon={<Boxes className="h-4 w-4" strokeWidth={1.75} />}
            label="Actions today"
            value={String(dashboardSummary.actionsToday)}
            sub={`${dashboardSummary.confirmationsNeeded} confirmation needed`}
            spark={kpiSparklines.actions}
          />
          <SummaryCard
            icon={<ShieldCheck className="h-4 w-4" strokeWidth={1.75} />}
            label="Avg inventory confidence"
            value={`${dashboardSummary.avgConfidence}%`}
            spark={kpiSparklines.confidence}
          />
          <SummaryCard
            icon={<Clock3 className="h-4 w-4" strokeWidth={1.75} />}
            label="Personalisation"
            value={`${cafeProfile.personalization.siteSpecific}% site`}
            sub={`${cafeProfile.personalization.archetype}% café archetype`}
            spark={kpiSparklines.personalisation}
          />
        </div>

        <Card className="mt-5 border-mint-200 bg-mint-50/80">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
            <div>
              <p className="text-sm font-semibold text-ink">
                {actions.length} items need a decision before the afternoon cut-off
              </p>
              <ol className="mt-2 space-y-1 text-sm text-ink-muted">
                {actions.map((action, index) => (
                  <li key={action.id}>
                    {index + 1}. {action.productName} — {action.recommendedAction}
                  </li>
                ))}
              </ol>
            </div>
            <Badge variant="success">Safety violations: 0</Badge>
          </CardContent>
        </Card>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <WeeklyProtectedChart />
          </div>
          <ConfidenceDonut />
        </div>

        <div className="mt-8 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-ink-muted">
            Priority action list
          </h2>
          {actions.map((action, i) => (
            <ActionCard key={action.id} action={action} index={i} />
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
