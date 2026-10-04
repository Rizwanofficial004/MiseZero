import { DashboardHeader } from "@/components/layout/dashboard-sidebar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getDataSources } from "@/lib/data";
import { Cable, CircleAlert, CircleCheck, CircleX, Clock3 } from "lucide-react";

const statusConfig = {
  connected: { icon: CircleCheck, color: "text-mint-600", badge: "success" as const },
  partial: { icon: CircleAlert, color: "text-amber-600", badge: "warning" as const },
  pending: { icon: Clock3, color: "text-ink-muted", badge: "default" as const },
  unavailable: { icon: CircleX, color: "text-rose-600", badge: "warning" as const },
};

export default function DataSourcesPage() {
  return (
    <div>
      <DashboardHeader
        title="Data Sources"
        description="Invoices, POS, recipes, preparation, waste and the occasional staff check"
      />
      <div className="p-6">
        <Card className="mb-6 border-mint-200 bg-mint-50/50">
          <CardContent className="p-4 text-sm text-mint-700">
            <strong>Keep your data flowing:</strong> Connect your systems directly or use secure exports and manual entries when a direct connection is unavailable.
            Mapping completeness directly affects inventory confidence.
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          {getDataSources().map((source) => {
            const config = statusConfig[source.status];
            const Icon = config.icon;
            const mappedPct = Math.round((source.fieldsMapped / source.fieldsTotal) * 100);

            return (
              <Card key={source.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-mint-100 text-mint-700">
                        <Cable className="h-5 w-5" strokeWidth={1.7} />
                      </div>
                      <div>
                        <h3 className="font-medium text-ink">{source.name}</h3>
                        <p className="text-xs text-ink-muted capitalize">{source.type.replace("_", " ")}</p>
                      </div>
                    </div>
                    <Icon className={`h-5 w-5 ${config.color}`} />
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge variant={config.badge}>{source.status}</Badge>
                    <Badge>{source.mappingStatus}</Badge>
                    {source.posSystem && <Badge>{source.posSystem}</Badge>}
                  </div>

                  {source.lastSync && (
                    <p className="mt-3 text-xs text-ink-muted">Last sync: {source.lastSync}</p>
                  )}

                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-ink-muted">
                      <span>Fields mapped</span>
                      <span>{source.fieldsMapped}/{source.fieldsTotal} ({mappedPct}%)</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-mint-100">
                      <div
                        className="h-2 rounded-full bg-mint-500"
                        style={{ width: `${mappedPct}%` }}
                      />
                    </div>
                  </div>

                  <p className="mt-3 text-sm text-ink-muted">{source.notes}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
