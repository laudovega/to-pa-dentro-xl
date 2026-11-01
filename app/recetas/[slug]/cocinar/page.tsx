import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import CookMode from "@/components/CookMode";

export const dynamic = "force-dynamic";

export default async function CookPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const recipe = await db.recipe.findUnique({ where: { slug }, include: { phases: { orderBy: { order: "asc" } }, ingredients: true } });
  if (!recipe) notFound();

  return (
    <CookMode
      recipe={{
        id: recipe.id,
        title: recipe.title,
        phases: recipe.phases.map((phase) => ({
          id: phase.id, title: phase.title, action: phase.action, speed: phase.speed, reverse: phase.reverse,
          temperatureC: phase.temperatureC, minutes: phase.minutes, lid: phase.lid,
          ingredients: phase.ingredients as string[], expectedResult: phase.expectedResult, tips: phase.tips
        }))
      }}
    />
  );
}
