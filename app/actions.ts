"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { validateTemperature } from "@/lib/monsi";

function slugify(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export async function createRecipe(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim();
  const servings = Number(formData.get("servings") || 4);
  const prepMinutes = Number(formData.get("prepMinutes") || 10);
  const cookMinutes = Number(formData.get("cookMinutes") || 30);
  const lazinessScore = Number(formData.get("lazinessScore") || 8);
  const tags = String(formData.get("tags") || "").split(",").map((t) => t.trim()).filter(Boolean);

  const ingredients = String(formData.get("ingredients") || "").split("\n").map((l) => l.trim()).filter(Boolean).map((line) => {
    const [name, amount, unit] = line.split("|").map((v) => v.trim());
    return { name, amount: amount ? Number(amount) : null, unit: unit || null };
  });

  const rawPhases = JSON.parse(String(formData.get("phases") || "[]")) as any[];
  const phases = rawPhases.map((phase, index) => {
    const temperature = validateTemperature(phase.temperatureC);
    return {
      order: index + 1,
      title: phase.title || `Fase ${index + 1}`,
      action: phase.action || "cocer",
      speed: phase.speed ?? null,
      reverse: Boolean(phase.reverse),
      temperatureC: temperature.temperatureC,
      minutes: Number(phase.minutes || 0),
      lid: phase.lid || "closed",
      ingredients: phase.ingredients || [],
      expectedResult: phase.expectedResult || null,
      tips: phase.tips || []
    };
  });

  await db.recipe.create({
    data: {
      slug: `${slugify(title)}-${Date.now().toString().slice(-5)}`,
      title, description, servings, prepMinutes, cookMinutes, lazinessScore, tags,
      ingredients: { create: ingredients },
      phases: { create: phases }
    }
  });

  revalidatePath("/");
  revalidatePath("/recetas");
}

export async function togglePantryItem(id: string, have: boolean) {
  await db.pantryItem.update({ where: { id }, data: { have } });
  revalidatePath("/despensa");
  revalidatePath("/");
}

export async function adjustPantryItem(id: string, change: number) {
  const item = await db.pantryItem.findUnique({ where: { id } });
  if (!item || item.trackingMode === "presence") return;

  const session = await db.cookingSession.create({ data: {} });
  await db.movement.create({ data: { sessionId: session.id, pantryItemId: id, change, unit: item.unit } });

  const effective = (item.quantity ?? 0) + change;
  if (item.lowThreshold != null && effective <= item.lowThreshold) {
    await db.shoppingItem.upsert({ where: { name: item.name }, update: { purchased: false }, create: { name: item.name, source: "auto" } });
  }

  revalidatePath("/despensa");
  revalidatePath("/compra");
  revalidatePath("/");
}

export async function finishRecipe(recipeId: string) {
  const recipe = await db.recipe.findUnique({ where: { id: recipeId }, include: { ingredients: true } });
  if (!recipe) return;

  const pantry = await db.pantryItem.findMany();
  const session = await db.cookingSession.create({ data: {} });

  for (const ingredient of recipe.ingredients) {
    const item = pantry.find((p) => p.name.toLowerCase() === ingredient.name.toLowerCase() || p.aliases.some((alias) => ingredient.name.toLowerCase().includes(alias.toLowerCase())));
    if (!item || item.trackingMode === "presence" || ingredient.amount == null) continue;

    await db.movement.create({ data: { sessionId: session.id, pantryItemId: item.id, recipeId: recipe.id, change: -ingredient.amount, unit: ingredient.unit } });

    const effective = (item.quantity ?? 0) - ingredient.amount;
    if (item.lowThreshold != null && effective <= item.lowThreshold) {
      await db.shoppingItem.upsert({ where: { name: item.name }, update: { purchased: false }, create: { name: item.name, source: "auto" } });
    }
  }

  revalidatePath("/");
  revalidatePath("/despensa");
  revalidatePath("/compra");
}
