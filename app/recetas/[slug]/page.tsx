import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { phaseLabel } from "@/lib/monsi";

export const dynamic = "force-dynamic";

export default async function RecipePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const recipe = await db.recipe.findUnique({ where: { slug }, include: { ingredients: true, phases: { orderBy: { order: "asc" } } } });
  if (!recipe) notFound();

  return (
    <>
      <h1>{recipe.title}</h1>
      <p className="muted">{recipe.description}</p>
      <div className="row">
        <span className="badge">{recipe.servings} raciones</span>
        <span className="badge">Pereza {recipe.lazinessScore}/10</span>
        <span className="badge">{recipe.prepMinutes + recipe.cookMinutes} min</span>
      </div>

      <h2>Ingredientes</h2>
      <div className="card">
        <ul>
          {recipe.ingredients.map((i) => (
            <li key={i.id}>
              {i.name}{i.amount ? ` — ${i.amount} ${i.unit ?? ""}` : ""}{i.note ? ` (${i.note})` : ""}{i.optional ? " · opcional" : ""}
            </li>
          ))}
        </ul>
      </div>

      <h2>La Monsi</h2>
      {recipe.phases.map((phase) => (
        <div className={`card phase ${phase.temperatureC === 120 ? "amber" : "green"}`} key={phase.id}>
          <strong>{phase.order}. {phase.title}</strong>
          <p>{phaseLabel(phase)}</p>
          <p className="muted">Mete: {(phase.ingredients as string[]).join(", ") || "nada más"}</p>
          {phase.expectedResult && <p>Resultado: {phase.expectedResult}</p>}
          {phase.tips.map((tip) => <p className="muted" key={tip}>💡 {tip}</p>)}
        </div>
      ))}
    </>
  );
}
