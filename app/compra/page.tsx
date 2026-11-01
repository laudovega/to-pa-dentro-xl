import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ShoppingPage() {
  const items = await db.shoppingItem.findMany({ where: { purchased: false }, orderBy: { createdAt: "asc" } });

  return (
    <>
      <h1>Hay que comprar</h1>
      {items.length === 0 ? (
        <div className="card"><p className="muted">De momento, con lo que hay se tira. 🎉</p></div>
      ) : (
        items.map((item) => (
          <div className="card" key={item.id}>
            <div className="row spread"><strong>{item.name}</strong><span className="badge">{item.source === "auto" ? "Automático" : "Manual"}</span></div>
          </div>
        ))
      )}
    </>
  );
}
