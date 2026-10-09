"use client";

import { useEffect, useRef, useState } from "react";
import { DashboardHeader } from "@/components/layout/dashboard-sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { uid } from "@/lib/ids";
import type { Unit } from "@/lib/units";
import { blankRecipe, deleteRecipe, saveRecipe } from "@/services/recipeService";
import { useDemo } from "@/services/useDemo";
import type { Recipe } from "@/store/types";

type DraftLine = { key: string; productId: string; qty: string; unit: Unit };
type Draft = { id: string; name: string; menuItemName: string; lines: DraftLine[] };

function toDraft(recipe: Recipe): Draft {
  return {
    id: recipe.id,
    name: recipe.name,
    menuItemName: recipe.menuItemName,
    lines: recipe.lines.map((line, index) => ({
      key: `${recipe.id}-${index}-${line.productId}`,
      productId: line.productId,
      qty: String(line.qty),
      unit: line.unit,
    })),
  };
}

export default function RecipesPage() {
  const demo = useDemo();
  const toast = useToast();
  const editorRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (draft) editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [draft?.id]);

  const openNew = () => {
    const product = demo.products[0];
    const recipe = blankRecipe();
    setEditingId(null);
    setError("");
    setDraft({
      ...toDraft(recipe),
      lines: product
        ? [{ key: uid("line"), productId: product.id, qty: "1", unit: product.unit }]
        : [],
    });
  };

  const openEdit = (recipe: Recipe) => {
    setEditingId(recipe.id);
    setError("");
    setDraft(toDraft(recipe));
  };

  const updateLine = (key: string, patch: Partial<DraftLine>) => {
    setDraft((current) =>
      current
        ? { ...current, lines: current.lines.map((line) => (line.key === key ? { ...line, ...patch } : line)) }
        : current,
    );
  };

  const save = async () => {
    if (!draft) return;
    setPending(true);
    setError("");
    try {
      await saveRecipe({
        id: draft.id,
        name: draft.name,
        menuItemName: draft.menuItemName,
        lines: draft.lines.map((line) => ({
          productId: line.productId,
          qty: Number(line.qty),
          unit: line.unit,
        })),
      });
      toast.push(editingId ? "Recipe updated" : "Recipe added");
      setDraft(null);
      setEditingId(null);
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : "Could not save that recipe";
      setError(message);
      toast.push(message, "error");
    } finally {
      setPending(false);
    }
  };

  return (
    <div>
      <DashboardHeader title="Recipes" description="Sales turn into ingredient use through these bills of materials" />
      <div className="space-y-4 p-6">
        <div className="flex justify-end">
          <Button variant="outline" onClick={openNew}>Add recipe</Button>
        </div>

        {draft && (
          <div ref={editorRef}>
            <Card>
              <CardContent className="p-5">
                <h2 className="font-semibold text-ink">{editingId ? "Edit recipe" : "New recipe"}</h2>
                <form
                  className="mt-4 space-y-3"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void save();
                  }}
                >
                  <div className="grid gap-3 md:grid-cols-2">
                    <label className="text-sm text-ink">
                      Name
                      <input className="input-field mt-1" value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Cake slice" />
                    </label>
                    <label className="text-sm text-ink">
                      Menu item
                      <input className="input-field mt-1" value={draft.menuItemName} onChange={(event) => setDraft({ ...draft, menuItemName: event.target.value })} placeholder="Name used on the POS" />
                    </label>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">Ingredients</p>
                  {draft.lines.length === 0 && (
                    <p className="text-sm text-ink-muted">Add at least one ingredient before saving.</p>
                  )}
                  {draft.lines.map((line) => (
                    <div key={line.key} className="grid gap-2 md:grid-cols-4">
                      <select className="input-field" value={line.productId} onChange={(event) => updateLine(line.key, { productId: event.target.value })}>
                        {demo.products.map((product) => (
                          <option key={product.id} value={product.id}>{product.name}</option>
                        ))}
                      </select>
                      <input
                        className="input-field"
                        value={line.qty}
                        onChange={(event) => updateLine(line.key, { qty: event.target.value })}
                        inputMode="decimal"
                        aria-label="Quantity"
                      />
                      <select className="input-field" value={line.unit} onChange={(event) => updateLine(line.key, { unit: event.target.value as Unit })} aria-label="Unit">
                        {["g", "kg", "ml", "L", "each"].map((unit) => (
                          <option key={unit}>{unit}</option>
                        ))}
                      </select>
                      <Button type="button" variant="ghost" onClick={() => setDraft({ ...draft, lines: draft.lines.filter((item) => item.key !== line.key) })}>
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const product = demo.products[0];
                      setDraft({
                        ...draft,
                        lines: [
                          ...draft.lines,
                          { key: uid("line"), productId: product?.id ?? "", qty: "1", unit: product?.unit ?? "each" },
                        ],
                      });
                    }}
                  >
                    Add ingredient
                  </Button>
                  {error && <p className="text-sm text-rose-700">{error}</p>}
                  <div className="flex gap-2">
                    <Button type="submit" disabled={pending}>{pending ? "Saving…" : editingId ? "Save changes" : "Save recipe"}</Button>
                    <Button type="button" variant="ghost" onClick={() => { setDraft(null); setEditingId(null); setError(""); }}>Cancel</Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}

        {demo.recipes.length === 0 && <p className="text-sm text-ink-muted">No recipes yet. Sales cannot consume ingredients until one exists.</p>}
        {demo.recipes.map((item) => (
          <Card key={item.id}>
            <CardContent className="flex flex-wrap items-start justify-between gap-3 p-5">
              <div>
                <h2 className="font-semibold text-ink">{item.name}</h2>
                <p className="text-xs text-ink-muted">POS name: {item.menuItemName}</p>
                <ul className="mt-2 text-sm text-ink-muted">
                  {item.lines.map((line, index) => (
                    <li key={`${item.id}-${index}`}>
                      {demo.products.find((product) => product.id === line.productId)?.name ?? line.productId} · {line.qty} {line.unit}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => openEdit(item)}>Edit</Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    void deleteRecipe(item.id)
                      .then(() => toast.push("Recipe deleted"))
                      .catch((reason: unknown) => toast.push(reason instanceof Error ? reason.message : "Could not delete that recipe", "error"));
                  }}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
