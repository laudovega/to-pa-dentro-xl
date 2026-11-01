"use client";

export default function PantryControls({ id, trackingMode, have, quantity, onToggle, onAdjust }: { id: string; trackingMode: string; have: boolean; quantity: number; onToggle: (id: string, have: boolean) => Promise<void>; onAdjust: (id: string, change: number) => Promise<void>; }) {
  if (trackingMode === "presence") {
    return (
      <div className="row" style={{ marginTop: 12 }}>
        <button className={have ? "secondary" : "success"} onClick={() => onToggle(id, !have)}>{have ? "Marcar: no tengo" : "Marcar: tengo"}</button>
      </div>
    );
  }

  return (
    <div className="row" style={{ marginTop: 12 }}>
      <button className="secondary" onClick={() => onAdjust(id, -1)}>-1</button>
      <button className="secondary" onClick={() => onAdjust(id, 1)}>+1</button>
      <button className="secondary" onClick={() => onAdjust(id, -quantity)}>Se acabó</button>
    </div>
  );
}
