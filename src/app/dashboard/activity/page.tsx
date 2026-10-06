"use client";

import { DashboardHeader } from "@/components/layout/dashboard-sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { formatVenue } from "@/lib/dates";
import { useDemo } from "@/services/useDemo";

export default function ActivityPage() {
  const demo = useDemo();
  return (
    <div>
      <DashboardHeader title="Activity" description="Every save, import, confirmation, and outcome recorded in this browser" />
      <div className="p-6">
        {demo.activity.length === 0 ? (
          <p className="rounded-xl border border-dashed border-mint-200 bg-white px-4 py-6 text-sm text-ink-muted">No activity yet.</p>
        ) : (
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y divide-mint-100">
                {demo.activity.map((entry) => (
                  <li key={entry.id} className="flex flex-wrap items-baseline justify-between gap-3 px-5 py-3 text-sm">
                    <span className="text-ink">{entry.message}</span>
                    <span className="text-xs text-ink-muted">{formatVenue(entry.at, demo.venue.timezone)} · {entry.entity}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
