import { pause } from "@/services/delay";
import { uid } from "@/lib/ids";
import { useMiseStore } from "@/store/useMiseStore";
import type { Recipe } from "@/store/types";

export async function listRecipes() {
  await pause();
  return useMiseStore.getState().recipes;
}

export async function saveRecipe(recipe: Recipe) {
  if (!recipe.name.trim() || !recipe.menuItemName.trim()) throw new Error("Recipe and menu names are required");
  if (recipe.lines.length === 0) throw new Error("Add at least one ingredient");
  if (recipe.lines.some((line) => !line.productId || line.qty <= 0)) throw new Error("Each ingredient needs a product and a quantity");
  await pause();
  useMiseStore.getState().saveRecipe(recipe);
  const mapping = useMiseStore.getState().posMappings.find((item) => item.menuItemName === recipe.menuItemName);
  useMiseStore.getState().saveMapping(
    mapping ?? { id: uid("map"), menuItemName: recipe.menuItemName, recipeId: recipe.id },
  );
}

export async function deleteRecipe(id: string) {
  await pause();
  useMiseStore.getState().deleteRecipe(id);
}

export function blankRecipe(): Recipe {
  return { id: uid("rec"), name: "", menuItemName: "", lines: [] };
}
