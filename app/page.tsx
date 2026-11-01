import Link from "next/link";
import { db } from "@/lib/db";
import { getEffectivePantry, missingIngredients } from "@/lib/pantry";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [recipes, pantry] = await Promise.all([
    db.recipe.findMany({ include: { ingredients: true }, orderBy: { createdAt: "desc" } }),
    getEffectivePantry()
  ]);

  const evaluated = recipes.map((recipe) => {
    const missing = missingIngredients(recipe.ingredients, pantry);
    const canCook = missing.every((i) => i.status === "ok");
    return { recipe, missing, canCook };
  });

  return (
    <>
      <h1>To pa dentro XL</h1>
      <p className="muted">Una jarra. Cero dramas. Raciones XL. La Monsi no pasa de 120 °C.</p>
      <Link className="button" href="/recetas/nueva">Añadir receta</Link>

      <h2>¿Qué cocino hoy?</h2>
      {evaluated.map(({ recipe, canCook }) => (
        <div className="card" key={recipe.id}>
          <div className="row spread">
            <strong>{recipe.title}</strong>
            <span className={canCook ? "status-ok" : "status-warn"}>{canCook ? "Puedes hacerla" : "Falta algo"}</span>
          </div>
          <p className="muted">{recipe.description}</p>
          <div className="row">
            <span className="badge">{recipe.servings} raciones</span>
            <span className="badge">Pereza {recipe.lazinessScore}/10</span>
            <span className="badge">{recipe.cookMinutes} min</span>
          </div>
          <div className="row" style={{ marginTop: 12 }}>
            <Link className="button" href={`/recetas/${recipe.slug}/cocinar`}>Cocinar</Link>
            <Link className="button secondary" href={`/recetas/${recipe.slug}`}>Ver receta</Link>
          </div>
        </div>
      ))}
    </>
  );
}
