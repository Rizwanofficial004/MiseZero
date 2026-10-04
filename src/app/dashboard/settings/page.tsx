import { DashboardHeader } from "@/components/layout/dashboard-sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { getVenueSettings } from "@/lib/data";

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
  const { cafeProfile, products, coldStart, knowledgeGraphExample } = getVenueSettings();

  return (
    <div>
      <DashboardHeader
        title="Settings"
        description="Venue profile, cold-start priors, safety rules and the food-service ontology"
      />
      <div className="grid gap-6 p-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <h3 className="font-medium text-ink">Venue profile</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <Row label="Name" value={cafeProfile.name} />
              <Row label="Type" value={cafeProfile.type} />
              <Row label="Location" value={cafeProfile.location} />
              <Row label="Archetype" value={cafeProfile.archetype} />
              <Row label="Hours" value={`${cafeProfile.operatingHours.open} – ${cafeProfile.operatingHours.close}`} />
              <Row label="Production ends" value={cafeProfile.operatingHours.productionEnds} />
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="font-medium text-ink">Cold start</h3>
            <p className="mt-2 text-sm text-ink-muted">{coldStart.note}</p>
            <p className="mt-4 text-sm font-medium text-ink">
              {coldStart.stage}: {coldStart.siteWeight}% site-specific, {coldStart.archetypeWeight}% café archetype
            </p>
            <ul className="mt-3 space-y-1 text-sm text-ink-muted">
              {coldStart.priors.map((prior) => (
                <li key={prior}>• {prior}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="font-medium text-ink">Hard safety rules</h3>
            <p className="mt-2 text-sm text-ink-muted">
              These boundaries cannot be overridden by a forecast or a higher-margin option.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-ink-muted">
              {hardRules.map((rule) => (
                <li key={rule}>• {rule}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="font-medium text-ink">Quality constraints</h3>
            <p className="mt-2 text-sm text-ink-muted">
              These can narrow which interventions stay attractive. They are not the same as a safety prohibition.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-ink-muted">
              {qualityRules.map((rule) => (
                <li key={rule}>• {rule}</li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardContent className="p-5">
            <h3 className="font-medium text-ink">Food-service ontology · {knowledgeGraphExample.atRisk}</h3>
            <p className="mt-2 text-sm text-ink-muted">{knowledgeGraphExample.insight}</p>
            <ol className="mt-4 space-y-2">
              {knowledgeGraphExample.chain.map((item, index) => (
                <li key={item.node} className="flex items-center gap-3 text-sm">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-mint-100 text-xs font-semibold text-mint-700">
                    {index + 1}
                  </span>
                  <span className="font-medium text-ink">{item.node}</span>
                  <span className="text-ink-muted">{item.relation}</span>
                </li>
              ))}
            </ol>
            <div className="mt-5 flex flex-wrap gap-2">
              {products.map((product) => (
                <span key={product.id} className="rounded-full bg-mint-100 px-3 py-1 text-xs text-ink">
                  {product.name}
                </span>
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
