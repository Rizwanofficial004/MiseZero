import { DashboardHeader } from "@/components/layout/dashboard-sidebar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { posMappings } from "@/lib/data";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

export default function IntegrationsPage() {
  return (
    <div>
      <DashboardHeader
        title="POS Mapping"
        description="Configure field mapping for menu items, recipes, and consumption"
      />
      <div className="p-6 space-y-6">
        {posMappings.map((mapping) => (
          <Card key={mapping.posSystem}>
            <CardContent className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-ink">{mapping.displayName}</h3>
                  <p className="mt-1 text-sm text-ink-muted">
                    Fields: {mapping.menuItemField} · {mapping.quantityField} · {mapping.timestampField}
                  </p>
                </div>
                {mapping.unmappedCount > 0 && (
                  <Badge variant="warning">{mapping.unmappedCount} unmapped items</Badge>
                )}
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-ink-muted">
                      <th className="pb-2 pr-4">POS menu item</th>
                      <th className="pb-2 pr-4">MiseZero mapping</th>
                      <th className="pb-2 pr-4">Recipe linked</th>
                      <th className="pb-2">Confidence</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mapping.exampleItems.map((item) => (
                      <tr key={`${mapping.posSystem}-${item.posName}`} className="border-t border-mint-100">
                        <td className="py-2 pr-4 font-medium text-ink">{item.posName}</td>
                        <td className="py-2 pr-4 text-ink-muted">{item.misezeroProduct}</td>
                        <td className="py-2 pr-4">
                          {item.recipeLinked ? (
                            <CheckCircle2 className="h-4 w-4 text-mint-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-rose-500" />
                          )}
                        </td>
                        <td className="py-2">
                          {item.confidence > 0 ? (
                            <Badge variant="confidence" confidence={item.confidence}>
                              {item.confidence}%
                            </Badge>
                          ) : (
                            <AlertCircle className="h-4 w-4 text-ink-muted" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardContent className="p-5">
            <h3 className="font-medium text-ink">Connection setup checklist</h3>
            <ul className="mt-3 space-y-2 text-sm text-ink-muted">
              <li>• Which POS system is in use, and is direct access available?</li>
              <li>• Are menu modifiers (e.g. milk type) recorded in POS sales?</li>
              <li>• Who uploads invoices — daily or weekly batch?</li>
              <li>• Is a kitchen scale available for batch prep weights?</li>
              <li>• Which prepared items are logged manually today?</li>
              <li>• Data retention and GDPR constraints for pilot data?</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
