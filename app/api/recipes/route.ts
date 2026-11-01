import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validateTemperature } from "@/lib/monsi";

export async function GET() {
  const recipes = await db.recipe.findMany({ include: { ingredients: true, phases: { orderBy: { order: "asc" } } } });
  return NextResponse.json(recipes);
}

export async function POST(request: Request) {
  const body = await request.json();

  const phases = (body.phases ?? []).map((phase: any, index: number) => {
    const temperature = validateTemperature(phase.temperatureC);
    return {
      order: index + 1,
      title: phase.title ?? `Fase ${index + 1}`,
      action: phase.action ?? "cocer",
      speed: phase.speed ?? null,
      reverse: Boolean(phase.reverse),
      temperatureC: temperature.temperatureC,
      minutes: Number(phase.minutes ?? 0),
      lid: phase.lid ?? "closed",
      ingredients: phase.ingredients ?? [],
      expectedResult: phase.expectedResult ?? null,
      tips: phase.tips ?? []
    };
  });

  const recipe = await db.recipe.create({
    data: {
      slug: body.slug || `${Date.now()}`,
      title: body.title,
      description: body.description ?? null,
      servings: body.servings ?? 4,
      prepMinutes: body.prepMinutes ?? 10,
      cookMinutes: body.cookMinutes ?? 30,
      lazinessScore: body.lazinessScore ?? 8,
      tags: body.tags ?? [],
      ingredients: { create: (body.ingredients ?? []).map((i: any) => ({ name: i.name, amount: i.amount ?? null, unit: i.unit ?? null, note: i.note ?? null, optional: i.optional ?? false })) },
      phases: { create: phases }
    }
  });

  return NextResponse.json(recipe, { status: 201 });
}
