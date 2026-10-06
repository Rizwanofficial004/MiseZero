"use client";

import { DashboardHeader } from "@/components/layout/dashboard-sidebar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useDemo } from "@/services/useDemo";
import { BellRing, Boxes, Cable, ScanSearch, ShieldCheck } from "lucide-react";

const typeIcons = {
  stock_risk: Boxes,
  safety_window: ShieldCheck,
  intake_review: ScanSearch,
  integration: Cable,
  confirmation: BellRing,
};

export default function AlertsPage() {
  const alerts = useDemo().alerts;

  return (
    <div>
      <DashboardHeader
        title="Alerts"
        description={alerts.length === 0 ? "No open flags" : `${alerts.length} open — time-sensitive items from the engines`}
      />
      <div className="space-y-3 p-6">
        {alerts.length === 0 && (
          <p className="rounded-xl border border-dashed border-mint-200 bg-white px-4 py-6 text-sm text-ink-muted">
            Alerts appear when a range is wide, confidence is low, value at risk is high, or a use-by is inside 48 hours.
          </p>
        )}
        {alerts.map((alert) => {
          const Icon = typeIcons[alert.type];
          return (
            <Card key={alert.id}>
              <CardContent className="flex gap-4 p-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-mint-100 text-mint-700">
                  <Icon className="h-5 w-5" strokeWidth={1.7} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium text-ink">{alert.title}</h3>
                    <Badge variant="priority" priority={alert.priority}>{alert.priority}</Badge>
                    <Badge variant="warning">New</Badge>
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
