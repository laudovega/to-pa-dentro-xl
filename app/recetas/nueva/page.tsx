import { createRecipe } from "@/app/actions";

export default function NewRecipePage() {
  return (
    <>
      <h1>Añadir receta</h1>
      <p className="muted">Pega la receta en formato estructurado. La Monsi no pasará de 120 °C.</p>
      <form action={createRecipe}>
        <label htmlFor="title">Nombre</label>
        <input id="title" name="title" required placeholder="Curry de garbanzos XL" />
        <label htmlFor="description">Descripción</label>
        <input id="description" name="description" placeholder="Una jarra, cero dramas" />
        <div className="row">
          <div style={{ flex: 1 }}><label htmlFor="servings">Raciones</label><input id="servings" name="servings" type="number" defaultValue={5} /></div>
          <div style={{ flex: 1 }}><label htmlFor="prepMinutes">Preparación</label><input id="prepMinutes" name="prepMinutes" type="number" defaultValue={10} /></div>
          <div style={{ flex: 1 }}><label htmlFor="cookMinutes">Cocción</label><input id="cookMinutes" name="cookMinutes" type="number" defaultValue={30} /></div>
        </div>
        <label htmlFor="lazinessScore">Nivel de pereza</label>
        <input id="lazinessScore" name="lazinessScore" type="number" min={1} max={10} defaultValue={9} />
        <label htmlFor="tags">Etiquetas separadas por comas</label>
        <input id="tags" name="tags" placeholder="legumbres, XL, sin accesorios" />
        <label htmlFor="ingredients">Ingredientes</label>
        <textarea id="ingredients" name="ingredients" rows={8} placeholder={"Garbanzos|800|g\nLeche de coco|400|ml\nPimentón dulce||cucharadita"} />
        <label htmlFor="phases">Fases de La Monsi (JSON)</label>
        <textarea id="phases" name="phases" rows={14} defaultValue={JSON.stringify([
          { title: "Sofrito", action: "rehogar", ingredients: ["Aceite", "Cebolla", "Ajo"], speed: 1, reverse: true, temperatureC: 120, minutes: 8, lid: "closed", expectedResult: "Verdura pochada", tips: [] },
          { title: "Cocción", action: "cocer", ingredients: ["Garbanzos", "Leche de coco", "Tomate triturado"], speed: 1, reverse: true, temperatureC: 100, minutes: 25, lid: "closed", expectedResult: "Guiso espeso", tips: [] }
        ], null, 2)} />
        <button type="submit">Guardar receta</button>
      </form>
    </>
  );
}
