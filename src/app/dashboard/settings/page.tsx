"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { loadSample, resetDemo, signOut } from "@/services/activityService";
import { useDemo } from "@/services/useDemo";

const hardRules = [
  "Use-by limits cannot be passed",
  "Opened cream: 48-hour internal life",
  "Prepared batches: 24-hour default life",
  "Temperature, cooling and reheating rules stay in force",
  "Freezing only where the product is eligible",
  "Allergen restrictions block unsafe substitutions",
];

const qualityRules = [
  "Best-before dates treated as quality, not safety",
  "Internal freshness targets",
  "Site quality policies can rank an option down",
];

export default function SettingsPage() {
  const demo = useDemo();
  const toast = useToast();
  const [pending, setPending] = useState(false);

  const run = async (work: () => Promise<void>, success: string) => {
    setPending(true);
    try {
      await work();
      toast.push(success);
    } catch (error) {
      toast.push(error instanceof Error ? error.message : "Could not update the demo", "error");
    } finally {
      setPending(false);
    }
  };

  return (
    <div>
      <DashboardHeader
        title="Settings"
        description="Venue profile, cold-start priors, safety rules and the food-service ontology"
      />
      <div className="grid gap-6 p-6 lg:grid-cols-2">
        <Card className="lg:col-span-2">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
            <div>
              <h3 className="font-medium text-ink">Demo data</h3>
              <p className="mt-1 text-sm text-ink-muted">
                Reset replaces everything in this browser with the Bloom & Crumb sample, including the cream worked example.
                {demo.session ? ` Signed in as ${demo.session.email}.` : " Not signed in."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button disabled={pending} onClick={() => void run(resetDemo, "Demo data reset")}>Reset demo data</Button>
              <Button variant="outline" disabled={pending} onClick={() => void run(loadSample, "Sample data loaded")}>Load sample data</Button>
              {demo.session && (
                <Button variant="ghost" disabled={pending} onClick={() => void run(signOut, "Signed out")}>Sign out</Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="font-medium text-ink">Venue profile</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <Row label="Name" value={demo.venue.name} />
              <Row label="Type" value={demo.venue.type} />
              <Row label="Location" value={demo.venue.city} />
              <Row label="Timezone" value={demo.venue.timezone} />
              <Row label="Hours" value={`${demo.venue.hoursOpen} – ${demo.venue.hoursClose}`} />
              <Row label="Production ends" value={demo.venue.productionEnds} />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="font-medium text-ink">Cold start</h3>
            <p className="mt-2 text-sm text-ink-muted">
              Until this site has its own history, estimates lean on the café archetype. Counts, deliveries, and sales replace that prior.
            </p>
            <p className="mt-4 text-sm font-medium text-ink">{demo.products.length} products · {demo.recipes.length} recipes · {demo.sales.length} sales</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="font-medium text-ink">Hard safety rules</h3>
            <p className="mt-2 text-sm text-ink-muted">These boundaries cannot be overridden by a forecast or a higher-margin option.</p>
            <ul className="mt-4 space-y-2 text-sm text-ink-muted">
              {hardRules.map((rule) => <li key={rule}>• {rule}</li>)}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="font-medium text-ink">Quality constraints</h3>
            <p className="mt-2 text-sm text-ink-muted">These can narrow which interventions stay attractive. They are not the same as a safety prohibition.</p>
            <ul className="mt-4 space-y-2 text-sm text-ink-muted">
              {qualityRules.map((rule) => <li key={rule}>• {rule}</li>)}
            </ul>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="p-5">
            <h3 className="font-medium text-ink">Catalogue</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {demo.products.map((product) => (
                <span key={product.id} className="rounded-full bg-mint-100 px-3 py-1 text-xs text-ink">{product.name}</span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-ink-muted">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  );
}
