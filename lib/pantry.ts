import { db } from "./db";

export async function getEffectivePantry() {
  const items = await db.pantryItem.findMany({
    include: { movements: { orderBy: { createdAt: "desc" } } },
    orderBy: { name: "asc" }
  });

  return items.map((item) => {
    if (item.trackingMode === "presence") return item;
    const change = item.movements.reduce((total, movement) => total + movement.change, 0);
    return { ...item, quantity: Math.max(0, (item.quantity ?? 0) + change) };
  });
}

export function missingIngredients(
  recipeIngredients: { name: string; amount?: number | null; unit?: string | null; optional?: boolean }[],
  pantry: Awaited<ReturnType<typeof getEffectivePantry>>
) {
  return recipeIngredients
    .filter((ingredient) => !ingredient.optional)
    .map((ingredient) => {
      const item = pantry.find(
        (p) =>
          p.name.toLowerCase() === ingredient.name.toLowerCase() ||
          p.aliases.some((alias) => ingredient.name.toLowerCase().includes(alias.toLowerCase()))
      );

      if (!item) return { ...ingredient, status: "missing" as const, available: null };

      if (item.trackingMode === "presence") {
        return { ...ingredient, status: item.have ? ("ok" as const) : ("missing" as const), available: null };
      }

      const available = item.quantity ?? 0;
      const needed = ingredient.amount ?? 0;

      if (available < needed) {
        return { ...ingredient, status: "insufficient" as const, available, missing: needed - available };
      }

      return { ...ingredient, status: "ok" as const, available };
    });
}
