import { PrismaClient } from "@prisma/client";
import recipes from "../data/recipes.json";

const db = new PrismaClient();

const pantrySeed = [
  { name: "Huevos", category: "Frescos", trackingMode: "count", have: true, quantity: 6, unit: "unidades", lowThreshold: 3, aliases: ["huevos l", "huevos m", "huevos ecologicos"] },
  { name: "Leche", category: "Frescos", trackingMode: "volume", have: true, quantity: 2, unit: "bricks", lowThreshold: 1, aliases: ["leche semi", "leche entera", "leche desnatada"] },
  { name: "Tomate triturado", category: "Conservas", trackingMode: "count", have: true, quantity: 2, unit: "botes", lowThreshold: 1, aliases: ["tomate triturado 400g"] },
  { name: "Atún", category: "Conservas", trackingMode: "count", have: true, quantity: 2, unit: "latas", lowThreshold: 1, aliases: ["atun claro", "atun en aceite"] },
  { name: "Arroz", category: "Despensa", trackingMode: "presence", have: true, aliases: ["arroz bomba"] },
  { name: "Lentejas pardinas", category: "Despensa", trackingMode: "presence", have: true, aliases: ["lentejas"] },
  { name: "Pimentón dulce", category: "Especias", trackingMode: "presence", have: true },
  { name: "Aceite de oliva", category: "Despensa", trackingMode: "presence", have: true }
];

async function main() {
  for (const item of pantrySeed) {
    await db.pantryItem.upsert({ where: { name: item.name }, update: {}, create: item as any });
  }

  for (const recipe of recipes as any[]) {
    const existing = await db.recipe.findUnique({ where: { slug: recipe.slug } });
    if (existing) continue;

    await db.recipe.create({
      data: {
        slug: recipe.slug,
        title: recipe.title,
        description: recipe.description,
        servings: recipe.servings,
        prepMinutes: recipe.prepMinutes,
        cookMinutes: recipe.cookMinutes,
        lazinessScore: recipe.lazinessScore,
        onePot: recipe.onePot,
        tags: recipe.tags,
        ingredients: { create: recipe.ingredients.map((i: any) => ({ name: i.name, amount: i.amount ?? null, unit: i.unit ?? null, note: i.note ?? null, optional: i.optional ?? false })) },
        phases: { create: recipe.phases.map((phase: any, index: number) => ({ order: index + 1, title: phase.title, action: phase.action, speed: phase.speed ?? null, reverse: phase.reverse ?? false, temperatureC: phase.temperatureC ?? null, minutes: phase.minutes ?? 0, lid: phase.lid ?? "closed", ingredients: phase.ingredients ?? [], expectedResult: phase.expectedResult ?? null, tips: phase.tips ?? [] })) }
      }
    });
  }
}

main().then(() => db.$disconnect()).catch(async (error) => { console.error(error); await db.$disconnect(); process.exit(1); });
