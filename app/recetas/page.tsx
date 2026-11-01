import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function RecipesPage() {
  const recipes = await db.recipe.findMany({ orderBy: { createdAt: "desc" }, include: { ingredients: true } });

  return (
    <>
      <h1>Recetario</h1>
      <Link className="button" href="/recetas/nueva">Añadir receta</Link>
      <div style={{ marginTop: 16 }}>
        {recipes.map((recipe) => (
          <div className="card" key={recipe.id}>
            <div className="row spread"><strong>{recipe.title}</strong><span className="badge">{recipe.ingredients.length} ingredientes</span></div>
            <p className="muted">{recipe.description}</p>
            <div className="row">
              <span className="badge">{recipe.servings} raciones</span>
              <span className="badge">Pereza {recipe.lazinessScore}/10</span>
              {recipe.tags.map((tag) => <span className="badge" key={tag}>{tag}</span>)}
            </div>
            <div className="row" style={{ marginTop: 12 }}>
              <Link className="button" href={`/recetas/${recipe.slug}/cocinar`}>Cocinar</Link>
              <Link className="button secondary" href={`/recetas/${recipe.slug}`}>Ver</Link>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
