"use client";

import { useState } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { blankRecipe, deleteRecipe, saveRecipe } from "@/services/recipeService";
import { useDemo } from "@/services/useDemo";
import type { Recipe, RecipeLine } from "@/store/types";
import type { Unit } from "@/lib/units";

export default function RecipesPage() {
  const demo = useDemo();
  const toast = useToast();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [pending, setPending] = useState(false);

  const run = async (work: () => Promise<void>, success: string) => {
    setPending(true);
    try {
      await work();
      toast.push(success);
      setRecipe(null);
    } catch (error) {
      toast.push(error instanceof Error ? error.message : "Could not save that", "error");
    } finally {
      setPending(false);
    }
  };

  const updateLine = (index: number, patch: Partial<RecipeLine>) => {
    if (!recipe) return;
    const lines = recipe.lines.map((line, lineIndex) => (lineIndex === index ? { ...line, ...patch } : line));
    setRecipe({ ...recipe, lines });
  };

  return (
    <div>
      <DashboardHeader title="Recipes" description="Sales turn into ingredient use through these bills of materials" />
      <div className="space-y-4 p-6">
        <div className="flex justify-end">
          <Button variant="outline" onClick={() => setRecipe(blankRecipe())}>Add recipe</Button>
        </div>
        {demo.recipes.length === 0 && <p className="text-sm text-ink-muted">No recipes yet. Sales cannot consume ingredients until one exists.</p>}
        {demo.recipes.map((item) => (
          <Card key={item.id}>
            <CardContent className="flex flex-wrap items-start justify-between gap-3 p-5">
              <div>
                <h2 className="font-semibold text-ink">{item.name}</h2>
                <p className="text-xs text-ink-muted">POS name: {item.menuItemName}</p>
                <ul className="mt-2 text-sm text-ink-muted">
                  {item.lines.map((line) => (
                    <li key={`${item.id}-${line.productId}`}>{demo.products.find((product) => product.id === line.productId)?.name ?? line.productId} · {line.qty} {line.unit}</li>
                  ))}
                </ul>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setRecipe(item)}>Edit</Button>
                <Button size="sm" variant="ghost" onClick={() => void run(() => deleteRecipe(item.id), "Recipe deleted")}>Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {recipe && (
          <Card>
            <CardContent className="p-5">
              <h2 className="font-semibold text-ink">Recipe</h2>
              <form
                className="mt-4 space-y-3"
                onSubmit={(event) => {
                  event.preventDefault();
                  void run(() => saveRecipe(recipe), "Recipe saved");
                }}
              >
                <div className="grid gap-3 md:grid-cols-2">
                  <label className="text-sm text-ink">Name<input className="input-field mt-1" value={recipe.name} onChange={(event) => setRecipe({ ...recipe, name: event.target.value })} /></label>
                  <label className="text-sm text-ink">Menu item<input className="input-field mt-1" value={recipe.menuItemName} onChange={(event) => setRecipe({ ...recipe, menuItemName: event.target.value })} /></label>
                </div>
                {recipe.lines.map((line, index) => (
                  <div key={`${line.productId}-${index}`} className="grid gap-2 md:grid-cols-4">
                    <select className="input-field" value={line.productId} onChange={(event) => updateLine(index, { productId: event.target.value })}>
                      {demo.products.map((product) => <option key={product.id} value={product.id}>{product.name}</option>)}
                    </select>
                    <input className="input-field" value={line.qty} onChange={(event) => updateLine(index, { qty: Number(event.target.value) })} inputMode="decimal" />
                    <select className="input-field" value={line.unit} onChange={(event) => updateLine(index, { unit: event.target.value as Unit })}>
                      {["g", "kg", "ml", "L", "each"].map((unit) => <option key={unit}>{unit}</option>)}
                    </select>
                    <Button type="button" variant="ghost" onClick={() => setRecipe({ ...recipe, lines: recipe.lines.filter((_, lineIndex) => lineIndex !== index) })}>Remove</Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setRecipe({ ...recipe, lines: [...recipe.lines, { productId: demo.products[0]?.id ?? "", qty: 1, unit: demo.products[0]?.unit ?? "each" }] })}
                >
                  Add ingredient
                </Button>
                <div className="flex gap-2">
                  <Button type="submit" disabled={pending}>Save recipe</Button>
                  <Button type="button" variant="ghost" onClick={() => setRecipe(null)}>Cancel</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
