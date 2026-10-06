"use client";

import { DashboardHeader } from "@/components/layout/dashboard-sidebar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useDemo } from "@/services/useDemo";
import { Cable, CircleAlert, CircleCheck, Clock3 } from "lucide-react";

const statusConfig = {
  connected: { icon: CircleCheck, color: "text-mint-600", badge: "success" as const },
  partial: { icon: CircleAlert, color: "text-amber-600", badge: "warning" as const },
  pending: { icon: Clock3, color: "text-ink-muted", badge: "default" as const },
};

export default function DataSourcesPage() {
  const demo = useDemo();
  const sources = [
    { id: "deliveries", name: "Invoices and deliveries", type: "invoice", status: demo.deliveries.some((item) => item.status === "confirmed") ? "connected" as const : "pending" as const, mapped: demo.deliveries.filter((item) => item.status === "confirmed").length, total: Math.max(demo.deliveries.length, 1), notes: `${demo.deliveries.length} documents on file. Drafts stay out of stock.` },
    { id: "sales", name: "POS sales", type: "pos", status: demo.sales.length > 0 ? "connected" as const : "pending" as const, mapped: demo.sales.filter((sale) => sale.recipeId).length, total: Math.max(demo.sales.length, 1), notes: `${demo.sales.length} sales lines. Unmapped items are rejected at import.` },
    { id: "recipes", name: "Recipes", type: "manual", status: demo.recipes.length > 0 ? "connected" as const : "pending" as const, mapped: demo.recipes.length, total: Math.max(demo.recipes.length, 1), notes: "Bills of materials convert menu sales into ingredient use." },
    { id: "waste", name: "Waste records", type: "waste", status: demo.waste.length > 0 ? "connected" as const : "pending" as const, mapped: demo.waste.length, total: Math.max(demo.waste.length, 1), notes: `${demo.waste.length} waste events in the evidence pack.` },
    { id: "prep", name: "Preparation", type: "preparation", status: demo.preps.length > 0 ? "connected" as const : "pending" as const, mapped: demo.preps.length, total: Math.max(demo.preps.length, 1), notes: "Prep records subtract from the named product." },
    { id: "voice", name: "Voice notes", type: "voice", status: demo.voiceNotes.length > 0 ? "partial" as const : "pending" as const, mapped: demo.voiceNotes.filter((note) => note.status === "passed_to_intake").length, total: Math.max(demo.voiceNotes.length, 1), notes: "Structuring is a beta stub. Saving the note is what changes stock." },
  ];

  return (
    <div>
      <DashboardHeader title="Data Sources" description="Invoices, POS, recipes, preparation, waste and the occasional staff check" />
      <div className="p-6">
        <Card className="mb-6 border-mint-200 bg-mint-50/50">
          <CardContent className="p-4 text-sm text-mint-700">
            Status follows what is actually stored in this browser. A source stays pending until the first record arrives.
          </CardContent>
        </Card>
        <div className="grid gap-4 md:grid-cols-2">
          {sources.map((source) => {
            const config = statusConfig[source.status];
            const Icon = config.icon;
            const mappedPct = Math.round((source.mapped / source.total) * 100);
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
                        <p className="text-xs capitalize text-ink-muted">{source.type.replace("_", " ")}</p>
                      </div>
                    </div>
                    <Icon className={`h-5 w-5 ${config.color}`} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge variant={config.badge}>{source.status}</Badge>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-ink-muted">
                      <span>Records</span>
                      <span>{source.mapped}/{source.total} ({mappedPct}%)</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-mint-100">
                      <div className="h-2 rounded-full bg-mint-500" style={{ width: `${mappedPct}%` }} />
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
