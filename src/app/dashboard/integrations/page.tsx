"use client";

import { DashboardHeader } from "@/components/layout/dashboard-sidebar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { useMiseStore } from "@/store/useMiseStore";
import { useDemo } from "@/services/useDemo";
import { CheckCircle2, XCircle } from "lucide-react";

export default function IntegrationsPage() {
  const demo = useDemo();
  const toast = useToast();
  const unmapped = demo.posMappings.filter((item) => !item.recipeId).length;

  return (
    <div>
      <DashboardHeader title="POS Mapping" description="Configure field mapping for menu items, recipes, and consumption" />
      <div className="space-y-6 p-6">
        <Card>
          <CardContent className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-ink">Menu items</h3>
                <p className="mt-1 text-sm text-ink-muted">Fields: item · qty · date</p>
              </div>
              {unmapped > 0 && <Badge variant="warning">{unmapped} unmapped items</Badge>}
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-ink-muted">
                    <th className="pb-2 pr-4">POS menu item</th>
                    <th className="pb-2 pr-4">Recipe</th>
                    <th className="pb-2">Linked</th>
                  </tr>
                </thead>
                <tbody>
                  {demo.posMappings.map((mapping) => (
                    <tr key={mapping.id} className="border-t border-mint-100">
                      <td className="py-2 pr-4 font-medium text-ink">{mapping.menuItemName}</td>
                      <td className="py-2 pr-4">
                        <select
                          className="input-field"
                          value={mapping.recipeId ?? ""}
                          onChange={(event) => {
                            const recipeId = event.target.value || null;
                            useMiseStore.getState().saveMapping({ ...mapping, recipeId });
                            toast.push("Mapping saved");
                          }}
                        >
                          <option value="">Unmapped</option>
                          {demo.recipes.map((recipe) => (
                            <option key={recipe.id} value={recipe.id}>{recipe.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2">
                        {mapping.recipeId ? <CheckCircle2 className="h-4 w-4 text-mint-600" /> : <XCircle className="h-4 w-4 text-rose-500" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
