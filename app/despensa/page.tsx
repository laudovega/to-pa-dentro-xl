import { getEffectivePantry } from "@/lib/pantry";
import { adjustPantryItem, togglePantryItem } from "@/app/actions";
import PantryControls from "@/components/PantryControls";

export const dynamic = "force-dynamic";

export default async function PantryPage() {
  const pantry = await getEffectivePantry();

  return (
    <>
      <h1>La Despensa</h1>
      <p className="muted">Presencia para lo normal. Cantidades solo para lo que importa.</p>
      {pantry.map((item) => {
        const low = item.trackingMode !== "presence" && item.lowThreshold != null && (item.quantity ?? 0) <= item.lowThreshold;
        return (
          <div className="card" key={item.id}>
            <div className="row spread">
              <strong>{item.name}</strong>
              <span className={low ? "status-warn" : "status-ok"}>
                {item.trackingMode === "presence" ? (item.have ? "Tengo" : "No tengo") : `${item.quantity ?? 0} ${item.unit ?? ""}`}
              </span>
            </div>
            <PantryControls id={item.id} trackingMode={item.trackingMode} have={item.have} quantity={item.quantity ?? 0} onToggle={togglePantryItem} onAdjust={adjustPantryItem} />
          </div>
        );
      })}
    </>
  );
}
