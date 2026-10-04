import { DashboardHeader } from "@/components/layout/dashboard-sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cafeProfile, products } from "@/lib/data/demo";

export default function SettingsPage() {
  return (
    <div>
      <DashboardHeader title="Settings" description="Venue profile, safety rules, and pilot configuration" />
      <div className="p-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <h3 className="font-medium text-ink">Venue profile</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div><dt className="text-ink-muted">Name</dt><dd className="font-medium">{cafeProfile.name}</dd></div>
              <div><dt className="text-ink-muted">Type</dt><dd>{cafeProfile.type}</dd></div>
              <div><dt className="text-ink-muted">Location</dt><dd>{cafeProfile.location}</dd></div>
              <div><dt className="text-ink-muted">Archetype</dt><dd>{cafeProfile.archetype}</dd></div>
              <div><dt className="text-ink-muted">Hours</dt><dd>{cafeProfile.operatingHours.open} – {cafeProfile.operatingHours.close}</dd></div>
              <div><dt className="text-ink-muted">Production ends</dt><dd>{cafeProfile.operatingHours.productionEnds}</dd></div>
            </dl>
            <Button className="mt-4" variant="outline" size="sm">Edit profile</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="font-medium text-ink">Safety rules</h3>
            <p className="mt-2 text-sm text-ink-muted">
              Hard constraints — validated with UK food-safety adviser before production pilot.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-ink-muted">
              <li>• Use-by: never recommend beyond deadline</li>
              <li>• Opened cream: 48h usable life</li>
              <li>• Prepared batches: 24h default lifetime</li>
              <li>• Freezing must complete before safety deadline</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="p-5">
            <h3 className="font-medium text-ink">Product ontology ({products.length} SKUs)</h3>
            <p className="mt-2 text-sm text-ink-muted">Café inventory — ingredient → recipe → menu item chain</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {products.map((p) => (
                <span key={p.id} className="rounded-full bg-mint-100 px-3 py-1 text-xs text-ink">
                  {p.name}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
