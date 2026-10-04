import { DashboardHeader } from "@/components/layout/dashboard-sidebar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { alerts } from "@/lib/data";
import { BellRing, Boxes, Cable, ScanSearch, ShieldCheck } from "lucide-react";

const typeIcons = {
  stock_risk: Boxes,
  safety_window: ShieldCheck,
  intake_review: ScanSearch,
  integration: Cable,
  confirmation: BellRing,
};

export default function AlertsPage() {
  const unread = alerts.filter((a) => !a.read).length;

  return (
    <div>
      <DashboardHeader
        title="Alerts"
        description={`${unread} unread — time-sensitive items that cannot wait for the next daily review`}
      />
      <div className="p-6 space-y-3">
        {alerts.map((alert) => {
          const Icon = typeIcons[alert.type];
          return (
            <Card key={alert.id} className={!alert.read ? "border-mint-200 bg-white" : ""}>
              <CardContent className="flex gap-4 p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-mint-100 text-mint-700">
                  <Icon className="h-5 w-5" strokeWidth={1.7} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium text-ink">{alert.title}</h3>
                    <Badge variant="priority" priority={alert.priority}>
                      {alert.priority}
                    </Badge>
                    {!alert.read && <Badge variant="warning">New</Badge>}
                  </div>
                  <p className="mt-1 text-sm text-ink-muted">{alert.message}</p>
                  <p className="mt-2 text-xs text-ink-muted">{alert.timestamp}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
