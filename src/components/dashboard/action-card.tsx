import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { TodayAction } from "@/lib/data/types";
import { formatCurrency, formatRange } from "@/lib/utils";
import { Clock3, ShieldCheck, TrendingDown } from "lucide-react";

export function ActionCard({ action, index }: { action: TodayAction; index: number }) {
  const accent =
    action.priority === "high" ? "bg-rose-400" : action.priority === "medium" ? "bg-amber-400" : "bg-mint-400";

  return (
    <Card className="overflow-hidden transition-colors duration-200 hover:border-mint-300">
      <CardContent className="p-0">
        <div className="flex">
          <div className={`w-1.5 shrink-0 ${accent}`} />
          <div className="flex flex-1 flex-col gap-3.5 p-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-mint-100 text-xs font-bold text-mint-700">
                {index + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold text-ink">{action.productName}</h3>
                  <Badge variant="priority" priority={action.priority}>
                    {action.priority.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-ink-muted">{action.category}</span>
                </div>
                <p className="mt-2 text-sm font-medium text-mint-700">{action.recommendedAction}</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <Metric
                    label="Estimated remaining"
                    value={formatRange(action.estimate.min, action.estimate.max, action.estimate.unit)}
                    sub={`Most likely: ${action.estimate.mostLikely} ${action.estimate.unit}`}
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
                    label="Value at risk"
                    value={formatCurrency(action.valueAtRisk)}
                    icon={<TrendingDown className="h-3.5 w-3.5" strokeWidth={1.75} />}
                  />
                  <Metric
                    label="Safety window closes"
                    value={action.safetyWindowCloses}
                    icon={<Clock3 className="h-3.5 w-3.5" strokeWidth={1.75} />}
                  />
                </div>
                <details className="mt-3 rounded-lg bg-mint-50 px-3 py-2.5">
                  <summary className="cursor-pointer list-none text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
                    Why this action <span className="float-right text-mint-600">View details</span>
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
              </div>
            </div>
            <div className="flex shrink-0 flex-row gap-2 lg:flex-col">
            <Button size="sm">Accept</Button>
            <Button size="sm" variant="outline">Modify</Button>
            <Button size="sm" variant="ghost">Dismiss</Button>
            </div>
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
